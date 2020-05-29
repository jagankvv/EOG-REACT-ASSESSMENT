import * as React from 'react';
import { useQuery, useSubscription } from 'urql';
import { useDispatch, useSelector } from 'react-redux';
import { Container, makeStyles } from '@material-ui/core';
import { getMetricsQuery, GetMetricsResult, newMeasurementSubscription, NewMeasurementResult } from './queries';
import { actions } from './reducer';
import {Store} from '../../store';
import MeasureChart from './MeasureChart';

const useStyles = makeStyles({
  container: {
    marginBottom: '2rem',
  },
});

const MeasureCharts: React.FC = () => {
  const dispatch = useDispatch();
  const metricList = useSelector<Store, string[]>(state => state.measures.metricList);

  const [result] = useQuery<GetMetricsResult>({ query: getMetricsQuery });

  const { fetching: fetchingList, data: dataList, error: errorList } = result;

  React.useEffect(() => {
    if (errorList) {
      dispatch(actions.measuresApiErrorReceived({ error: errorList.message }));
    }
    if (dataList) {
      dispatch(actions.updateMetricList(dataList.getMetrics.sort()));
    }
  }, [dataList, errorList, dispatch]);

  const [resultSubs] = useSubscription<NewMeasurementResult>({ query: newMeasurementSubscription });

  const { data, error } = resultSubs;

  React.useEffect(() => {
    if (error) {
      dispatch(actions.measuresApiErrorReceived({ error: error.message }));
    }
    if (data && !fetchingList) {
      dispatch(actions.pushMeasure({ ...data.newMeasurement, origin: 'live' }));
    }
  }, [data, error, dispatch, fetchingList]);

  const classes = useStyles();

  return (
    <Container fixed className={classes.container}>
        {metricList.map(metricName => (
          <MeasureChart metricName={metricName} key={metricName} />
        ))}
    </Container>
  );
};

export default MeasureCharts;
