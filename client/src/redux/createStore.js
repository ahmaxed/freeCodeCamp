/* eslint-disable-next-line  max-len */
import { composeWithDevTools } from 'redux-devtools-extension/logOnlyInProduction';
import { createStore as reduxCreateStore, applyMiddleware } from 'redux';

import { createEpicMiddleware } from 'redux-observable';

import rootEpic from './rootEpic';
import rootReducer from './rootReducer';

import { isBrowser } from '../../utils';

import envData from '../../../config/env.json';

const { environment } = envData;

const clientSide = isBrowser();

const epicMiddleware = createEpicMiddleware({
  dependencies: {
    window: clientSide ? window : {},
    location: clientSide ? window.location : {},
    document: clientSide ? document : {}
  }
});

const composeEnhancers = composeWithDevTools({
  // options like actionSanitizer, stateSanitizer
});

export const createStore = () => {
  let store;
  if (environment === 'production') {
    store = reduxCreateStore(rootReducer, applyMiddleware(epicMiddleware));
  } else {
    store = reduxCreateStore(
      rootReducer,
      composeEnhancers(applyMiddleware(epicMiddleware))
    );
  }
  epicMiddleware.run(rootEpic);
  if (module.hot) {
    // Enable Webpack hot module replacement for reducers
    module.hot.accept('./rootReducer', () => {
      const nextRootReducer = require('./rootReducer');
      store.replaceReducer(nextRootReducer);
    });
  }
  return store;
};
