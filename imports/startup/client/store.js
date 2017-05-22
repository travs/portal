import { createStore, combineReducers, applyMiddleware, compose } from 'redux';

import { reducer as preferences } from '/imports/actions/preferences.js';


// http://redux.js.org/docs/api/createStore.html
export default createStore(
  combineReducers({
    preferences,
  }),
  {/* preloadedState */},
  compose(
    applyMiddleware(),
    /* eslint-disable no-underscore-dangle */
    window.__REDUX_DEVTOOLS_EXTENSION__ ? window.__REDUX_DEVTOOLS_EXTENSION__() : f => f,
    /* eslint-enable */
  ),
);
