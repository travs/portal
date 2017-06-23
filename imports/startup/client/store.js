import { createStore, combineReducers, applyMiddleware, compose } from 'redux';

import {
  default as manageHoldings,
  middleware as manageHoldingsMiddleware,
} from '/imports/redux/manageHoldings';
import web3 from '/imports/redux/web3';

// http://redux.js.org/docs/api/createStore.html
export default createStore(
  combineReducers({
    manageHoldings,
    web3,
  }),
  {
    /* preloadedState */
  },
  compose(
    applyMiddleware(manageHoldingsMiddleware),
    /* eslint-disable no-underscore-dangle */
    window.__REDUX_DEVTOOLS_EXTENSION__ ? window.__REDUX_DEVTOOLS_EXTENSION__() : f => f,
    /* eslint-enable */
  ),
);
