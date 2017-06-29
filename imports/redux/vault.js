import { Meteor } from 'meteor/meteor';
import Vaults from '/imports/api/vaults';
import performCalculations from '/imports/melon/interface/performCalculations';
import getParticipation from '/imports/melon/interface/getParticipation';

export const initialState = {
  gav: undefined,
  managementFee: undefined,
  performanceFee: undefined,
  unclaimedFees: undefined,
  nav: undefined,
  sharePrice: undefined,
  personalStake: undefined,
  totalSupply: undefined,
};

export const types = {
  REQUEST_CALCULATIONS: 'REQUEST_CALCULATIONS:vaults:portal.melonport.com',
  UPDATE_CALCULATIONS: 'UPDATE_CALCULATIONS:vaults:portal.melonport.com',
  REQUEST_PARTICIPATION: 'REQUEST_PARTICIPATION:vaults:portal.melonport.com',
  UPDATE_PARTICIPATION: 'UPDATE_PARTICIPATION:vaults:portal.melonport.com',
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
  requestParticipation: (vaultAddress, managerAddress) => ({
    type: types.REQUEST_PARTICIPATION,
    vaultAddress,
    managerAddress,
  }),
  updateParticipation: participation => ({
    type: types.UPDATE_PARTICIPATION,
    ...participation,
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
    case types.REQUEST_PARTICIPATION: {
      return {
        state,
      };
    }
    case types.UPDATE_PARTICIPATION: {
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
      const vault = Vaults.findOne({ address: params.vaultAddress });
      if (vault) {
        Meteor.call('vaults.syncVaultById', vault.id);
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
      } else {
        console.warn(
          'REQUEST_CALCULATIONS failed, no vault found with address',
          params.vaultAddress,
        );
      }
      break;
    }
    case types.REQUEST_PARTICIPATION: {
      getParticipation(
        params.vaultAddress,
        params.managerAddress,
      ).then((participation) => {
        const serializedParticipation = Object.keys(participation).reduce(
          (accumulator, currentKey) => ({
            ...accumulator,
            [currentKey]: participation[currentKey].toString(),
          }),
          {},
        );
        store.dispatch(creators.updateParticipation(serializedParticipation));
      });
      break;
    }
    default:
  }
  return next(action);
};

export default reducer;
