/* eslint-disable-next-line  max-len */

import { createStore as reduxCreateStore } from 'redux';

import rootReducer from './rootReducer';

import envData from '../../../config/env.json';

const { environment } = envData;

export const createStore = () => {
  let store;
  if (environment === 'production') {
    store = reduxCreateStore(rootReducer);
  } else {
    store = reduxCreateStore(rootReducer);
  }
  if (module.hot) {
    // Enable Webpack hot module replacement for reducers
    module.hot.accept('./rootReducer', () => {
      const nextRootReducer = require('./rootReducer');
      store.replaceReducer(nextRootReducer);
    });
  }
  return store;
};
