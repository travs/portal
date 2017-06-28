import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import store from '/imports/startup/client/store';

import './main.html';
import './header';
import './footer';

Template.layout_main.onCreated(() => {
  const template = Template.instance();
  template.readyState = new ReactiveVar();

  store.subscribe(() => {
    const currentState = store.getState().web3;
    template.readyState.set(currentState.readyState);
  });
});

Template.layout_main.helpers({
  getMain() {
    const template = Template.instance();
    const readyState = template.readyState.get();
    const main = template.data.main();
    const visit = template.data.visit && template.data.visit();

    if (visit) {
      const stateTemplateMap = {
        Loading: 'uxLoading',
        'Server Not Connected': 'uxServerConnection',
        Ready: main,
      };

      return stateTemplateMap[readyState] || main;
    }

    const stateTemplateMap = {
      Loading: 'uxLoading',
      'Server Not Connected': 'uxServerConnection',
      'Client Not Connected': 'uxNoConnection',
      'No Account Selected': 'uxNoAccountSelected',
      'Unsupported Network': 'ux_ethereum_testnet',
      'Insufficient Fund': 'ux_insufficient_funds',
      Ready: main,
    };

    return stateTemplateMap[readyState];
  },
});
