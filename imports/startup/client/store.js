import { createStore, combineReducers, applyMiddleware, compose } from 'redux';

import preferences from '/imports/redux/preferences';
import web3 from '/imports/redux/web3';
import { reducer as melonInterface, middleware as melonMiddleware } from '/imports/redux/melonInterface';

/* eslint-disable no-underscore-dangle */
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
/* eslint-enable */
// http://redux.js.org/docs/api/createStore.html
export default createStore(
  combineReducers({
    preferences,
    web3,
    melonInterface,
  }),
  {/* preloadedState */},
  composeEnhancers(
    applyMiddleware(melonMiddleware),
  ),
);
