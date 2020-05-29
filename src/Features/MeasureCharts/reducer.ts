import { createSlice, PayloadAction } from 'redux-starter-kit';
import { ApiErrorAction } from './saga';

export interface Measure {
  metric: string;
  at: number;
  value: number;
  unit: string;
}

export interface NewMeasure extends Measure {
  origin: 'live' | 'update';
}

export interface ChangeBooleanConfig {
  metric: string;
  configName: 'liveData' | 'anotherBooleanConfig';
  value: boolean;
}
export interface ChangeStringConfig {
  metric: string;
  configName: 'stringConfig';
  value: string;
}
export interface ChangeNumberConfig {
  metric: string;
  configName: 'numberConfig';
  value: number;
}

type ChangeConfig = ChangeBooleanConfig | ChangeNumberConfig | ChangeStringConfig;

export interface MeasureState {
  metricList: string[];
  latestMeasure: {
    [metric: string]: Measure;
  };
  measureList: {
    [metric: string]: {
      [time: number]: Measure;
    };
  };
  config: {
    [metric: string]: {
      liveData: boolean;
      stringConfig: string; 
      numberConfig: number; 
      anotherBooleanConfig: boolean;
    };
  };
}

const initialState: MeasureState = {
  metricList: [],
  latestMeasure: {},
  measureList: {},
  config: {},
};

const slice = createSlice({
  initialState,
  name: 'measures',
  reducers: {
    updateMetricList: (state, action: PayloadAction<string[]>) => {
      state.metricList = action.payload;

      state.measureList = action.payload.reduce(
        (prev, curr) => ({ ...prev, [curr]: state.measureList[curr] || {} }),
        {},
      );
      state.config = action.payload.reduce(
        (prev, curr) => ({
          ...prev,
          [curr]: {
            liveData: false,
            stringConfig: '',
            numberConfig: 0,
            anotherBooleanConfig: false,
          },
        }),
        {},
      );
    },
    pushMeasure: (state, action: PayloadAction<NewMeasure | NewMeasure[]>) => {
      const { at, metric, origin, ...rest } =
        action.payload instanceof Array ? action.payload.sort((a, b) => b.at - a.at)[0] : action.payload;

      const toAdd =
        action.payload instanceof Array
          ? {
              ...action.payload.reduce(
                (prev, curr) => ({
                  ...prev,
                  [curr.at]: curr,
                }),
                {},
              ),
            }
          : {
              [at]: { at, metric, ...rest },
            };

      state.measureList[metric] = {
        ...toAdd,
        ...state.measureList[metric],
      };

      const existLatestMeasure = state.latestMeasure[metric];
      const isLiveOrIsUpdate = origin === 'update' || state.config[metric].liveData;
      const isNewest = existLatestMeasure && existLatestMeasure.at < at;

      if (!existLatestMeasure || (isLiveOrIsUpdate && isNewest)) {
        state.latestMeasure[metric] = {
          at,
          metric,
          ...rest,
        };
      }
    },
    updateConfig: (state, action: PayloadAction<ChangeConfig>) => {
      const { configName, metric, value } = action.payload;

      if (Object.keys(state.config[metric]).includes(configName)) {
        state.config[metric][configName] = value as never; // Weird ts thing
      }
    },
    measuresApiErrorReceived: (state, action: PayloadAction<ApiErrorAction>) => state,
  },
});

export const { actions, reducer, name } = slice;
