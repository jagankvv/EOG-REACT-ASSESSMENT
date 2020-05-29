import { reducer as measuresReducer } from '../Features/MeasureCharts/reducer';
import { reducer as weatherReducer } from '../Features/Weather/reducer';

export default {
  measures: measuresReducer,
  weather: weatherReducer,
};
