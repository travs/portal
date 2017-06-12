import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
// Components
import '/imports/ui/components/ux/uxSpinner';
// Corresponding html file
import './melonSummary.html';
// Collections
import Vaults from '/imports/api/vaults';


Template.melonSummary.onCreated(() => {});


Template.melonSummary.helpers({
  getRanking() {
    const numberOfVaults = Vaults.find().count();
    let coreAddress = FlowRouter.getParam('address');

    if (Vaults.find({ owner: Session.get('selectedAccount') }).count() !== 0) {
      coreAddress = Vaults.findOne({ owner: Session.get('selectedAccount') }).address;
      const sortedVaults = Vaults.find({}, { sort: { sharePrice: -1, createdAt: -1 } }).fetch();
      let ranking;
      for (let i = 0; i < sortedVaults.length; i++) {
        if (coreAddress == sortedVaults[i].address) {
          ranking = i + 1;
          break;
        }
      }
      return `${ranking} out of ${numberOfVaults}`;
    } else if (Vaults.find({ owner: Session.get('selectedAccount') }).count() == 0) {
      return 'No ranking available.';
    }
  },
});


Template.melonSummary.onRendered(() => {});


Template.melonSummary.events({});
