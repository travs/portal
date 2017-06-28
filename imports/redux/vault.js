import { Meteor } from 'meteor/meteor';
import Vaults from '/imports/api/vaults';
import performCalculations from '/imports/melon/interface/performCalculations';

export const initialState = {
  gav: undefined,
  managementFee: undefined,
  performanceFee: undefined,
  unclaimedFees: undefined,
  nav: undefined,
  sharePrice: undefined,
};

export const types = {
  REQUEST_CALCULATIONS: 'REQUEST_CALCULATIONS:vaults:portal.melonport.com',
  UPDATE_CALCULATIONS: 'UPDATE_CALCULATIONS:vaults:portal.melonport.com',
};

export const creators = {
  requestCalculations: vaultAddress => ({
    type: types.REQUEST_CALCULATIONS,
    vaultAddress,
  }),
  updateCalculations: calculations => ({
    type: types.UPDATE_CALCULATIONS,
    ...calculations,
  }),
};

export const reducer = (state = initialState, action) => {
  const { type, ...params } = action;
  switch (type) {
    case types.REQUEST_CALCULATIONS: {
      return state;
    }
    case types.UPDATE_CALCULATIONS: {
      return {
        ...state,
        ...params,
      };
    }
    default:
      return state;
  }
};

export const middleware = store => next => (action) => {
  const { type, ...params } = action;

  switch (type) {
    case types.REQUEST_CALCULATIONS: {
      const vaultId = Vaults.findOne({ address: params.vaultAddress }).id;
      Meteor.call('vaults.syncVaultById', vaultId);
      performCalculations(params.vaultAddress).then((calculations) => {
        const serializedCalculations = Object.keys(calculations).reduce(
          (accumulator, currentKey) => ({
            ...accumulator,
            [currentKey]: calculations[currentKey].toString(),
          }),
          {},
        );
        store.dispatch(creators.updateCalculations(serializedCalculations));
      });
      break;
    }
    default:
  }
  return next(action);
};

export default reducer;
