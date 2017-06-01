import { createStore, combineReducers, applyMiddleware, compose } from 'redux';

import preferences from '/imports/actions/preferences';
import network from '/imports/actions/network';


// http://redux.js.org/docs/api/createStore.html
export default createStore(
  combineReducers({
    preferences,
    network,
  }),
  {/* preloadedState */},
  compose(
    applyMiddleware(),
    /* eslint-disable no-underscore-dangle */
    window.__REDUX_DEVTOOLS_EXTENSION__ ? window.__REDUX_DEVTOOLS_EXTENSION__() : f => f,
    /* eslint-enable */
  ),
);
