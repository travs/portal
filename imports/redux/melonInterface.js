import subscribe from '/imports/melon/interface/subscribe';
import { Meteor } from 'meteor/meteor';
import { Session } from 'meteor/session';


export const initialState = {};

export const types = {
  SUBSCRIBE_TO_FUND: 'SUBSCRIBE_TO_FUND:interface:portal.melonport.com',
};

export const creators = {
  subscribeToFund: (
    id, managerAddress, coreAddress, quantityAsked, quantityOffered,
    ) => ({
      type: types.SUBSCRIBE_TO_FUND,
      id,
      managerAddress,
      coreAddress,
      quantityAsked,
      quantityOffered,
    }),
};

export const reducer = (state = initialState, action) => {
  const { type, ...params } = action;

  return state;
};

export const middleware = store => next => (action) => {
  const { type, ...params } = action;

  switch (type) {
    case types.SUBSCRIBE_TO_FUND:
      console.log('I am here : subscribe to fund');
      subscribe(params.id, params.managerAddress, params.coreAddress, params.quantityAsked, params.quantityOffered).then((result) => {
        Session.set('NetworkStatus', { isInactive: false, isMining: false, isError: false, isMined: true });
        console.log('Shares successfully created ', result);
        window.toastr.success('Shares successfully created! ');
        Meteor.call('assets.sync', params.coreAddress);
        Meteor.call('vaults.syncVaultById', params.id);
      })
      .catch((error) => {
        console.log(error);
        Session.set('NetworkStatus', { isInactive: false, isMining: false, isError: true, isMined: false });
        window.toastr.error('Oops, an error has occured. Please verify that your holdings allow you to invest in this fund!');
      });

      break;
    default:
  }
  return next(action);
};

export default reducer;
