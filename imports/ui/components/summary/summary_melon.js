import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
// Components
import '/imports/ui/components/ux/ux_spinner.js';
// Corresponding html file
import './summary_melon.html';
// Collections
import { Cores } from '/imports/api/cores';


Template.summary_melon.onCreated(() => {});


Template.summary_melon.helpers({
  getRanking() {
    const numberOfCores = Cores.find().count();
    let coreAddress = FlowRouter.getParam('address');

    if(!coreAddress && Cores.find({ owner: Session.get('clientManagerAccount') }).count() !== 0) {
      coreAddress = Cores.findOne({ owner: Session.get('clientManagerAccount') }).address;
    } else if(!coreAddress && Cores.find({ owner: Session.get('clientManagerAccount') }).count() == 0) {
        return 'No ranking available.'
    }

    if(coreAddress) {
      const sortedCores = Cores.find({}, { sort: { sharePrice: -1 } }).fetch();
      let ranking;
      for (let i = 0; i < sortedCores.length; i++) {
        if (coreAddress == sortedCores[i]['address']) {
          ranking = i + 1;
          break;
        }
      }
      return ranking + ' out of ' + numberOfCores;
    }
  },
});


Template.summary_melon.onRendered(() => {});


Template.summary_melon.events({});
