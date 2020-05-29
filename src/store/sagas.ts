import { spawn } from 'redux-saga/effects';
import MeasureSaga from '../Features/MeasureCharts/saga';
// import metricsSaga from '../Features/Chart/MetricSelect/saga';

export default function* root() {
  yield spawn(MeasureSaga);
  //yield spawn( metricsSaga);
}
