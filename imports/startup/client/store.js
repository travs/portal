import { createStore, combineReducers, applyMiddleware, compose } from 'redux';

import preferences from '/imports/redux/preferences';
import web3 from '/imports/redux/web3';
import { reducer as melonInterface, middleware as melonMiddleware } from '/imports/redux/melonInterface';

// http://redux.js.org/docs/api/createStore.html
export default createStore(
  combineReducers({
    preferences,
    web3,
    melonInterface,
  }),
  {/* preloadedState */},
  compose(
    applyMiddleware(melonMiddleware),
    /* eslint-disable no-underscore-dangle */
    window.__REDUX_DEVTOOLS_EXTENSION__ ? window.__REDUX_DEVTOOLS_EXTENSION__() : f => f,
    /* eslint-enable */
  ),
);
