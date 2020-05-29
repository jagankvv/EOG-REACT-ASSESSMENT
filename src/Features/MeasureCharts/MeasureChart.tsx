import * as React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useQuery } from 'urql';
import {
  Card,
  CardHeader,
  Typography,
  FormGroup,
  FormControlLabel,
  Switch,
  Button,
  CircularProgress,
  makeStyles,
  Collapse,
} from '@material-ui/core';
import UpdateIcon from '@material-ui/icons/Autorenew';
import HistoryIcon from '@material-ui/icons/History';
import { Store } from '../../store';
import { Measure, actions, NewMeasure } from './reducer';
import {
  GetLastKnownMeasurementResult,
  getLastKnownMeasurementQuery,
  getMeasurementsQuery,
  GetMeasurementsResult,
} from './queries';
import Chart from './Chart';

export const titles: { [metric: string]: string | undefined } = {
  casingPressure: 'Casing Pressure',
  flareTemp: 'Flare Temperature',
  injValveOpen: 'Injection Valve Open',
  oilTemp: 'Oil Temperature',
  tubingPressure: 'Tubing Pressure',
  waterTemp: 'Water Temperature',
};

const useStyles = makeStyles({
  card: {
    margin: '1rem .5rem 0',
    minWidth: '100%',
    background: 'black',
    color: 'white',
  },
  subHeaderCard: {
    fontSize: '10px',
    color: 'white',
  },
  buttons: {
    display: 'flex',
    justifyContent: 'space-between',
    color: 'white',
  },
  pullright: {
    float: 'right',
  },

});
interface MeasureChartProps {
  metricName: string;
}

const MeasureChart: React.FC<MeasureChartProps> = ({ metricName }) => {
  const dispatch = useDispatch();
  const measure = useSelector<Store, Measure>(store => store.measures.latestMeasure[metricName]);
  const isLive = useSelector<Store, boolean>(store => store.measures.config[metricName].liveData);

  const [alreadyFilled, setAlreadyFilled] = React.useState<boolean>(false);
  const [showChart, setShowChart] = React.useState<boolean>(false);
  const switchShowChart = () => setShowChart(!showChart);
  const switchLiveUpdate = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(actions.updateConfig({ configName: 'liveData', metric: metricName, value: !isLive }));
  };

  const [result, update] = useQuery<GetLastKnownMeasurementResult>({
    query: getLastKnownMeasurementQuery,
    variables: { metricName },
  });
  const { fetching, data, error } = result;

  React.useEffect(() => {
    if (error) {
      dispatch(actions.measuresApiErrorReceived({ error: error.message }));
    }
    if (data) {
      dispatch(actions.pushMeasure({ ...data.getLastKnownMeasurement, origin: 'update' }));
    }
  }, [dispatch, data, error]);

  const [remainingData, getMoreData] = useQuery<GetMeasurementsResult>({
    query: getMeasurementsQuery,
    variables: {
      metricName,
      after: Date.now() - 300 * 2000,
      before: Date.now(),
    },
    pause: true,
  });
  const { fetching: fetchingList, data: dataList, error: errorList } = remainingData;

  React.useEffect(() => {
    if (!fetchingList && !fetching && !dataList && data) {
      if (showChart){
        getMoreData();
      }
    }
    if (errorList) {
      dispatch(actions.measuresApiErrorReceived({ error: errorList.message }));
    }
    if (!fetchingList && dataList?.getMeasurements && !alreadyFilled) {
      dispatch(
        actions.pushMeasure(
          dataList.getMeasurements.map(
            (nMeasure: Measure): NewMeasure => ({
              ...nMeasure,
              origin: 'live',
            }),
          ),
        ),
      );
      setAlreadyFilled(true);
    }
  }, [data, fetchingList, dataList, errorList, dispatch, getMoreData, fetching, alreadyFilled, showChart]);

  const classes = useStyles();
  const Action = (
    <FormGroup>
      <FormControlLabel
        control={<Switch checked={isLive} onChange={switchLiveUpdate} inputProps={{ 'aria-label': 'primary checkbox' }} />}
        label="Live"
        labelPlacement="start"
      />
    </FormGroup>
  );

  return (
    <Card className={classes.card}>
      <CardHeader
        action={Action}
        title={titles[metricName] || metricName}
        subheader={`Current ${measure ? new Date(measure.at).toLocaleString() : 'Updating...'}`}
        subheaderTypographyProps={{ className: classes.subHeaderCard }}

      />
      {fetching || !measure ? (
          <Typography style={{color: 'white'}} component="div" align="center">
            <CircularProgress size={25.5} />
          </Typography>
        ) : (
          <>
            <Typography variant="h5" style={{color: 'white'}} component="p" align="center">
              {measure.value.toFixed(2)} {measure.unit === 'F' ? ' °F' : ` ${measure.unit}`}
            </Typography>
          </>
        )}
        <Button
          style={{color: 'white'}}
          onClick={() => update({ requestPolicy: 'network-only' })}
          startIcon={<UpdateIcon />}
          disabled={isLive}>Update</Button>
        <Button className={classes.pullright} style={{color: 'white'}} onClick={switchShowChart}
        startIcon={<HistoryIcon />}>History</Button>
        <Collapse in={showChart} timeout="auto" unmountOnExit>
          <Chart metricName={metricName} />
        </Collapse>
    </Card>
  );
};

export default MeasureChart;
