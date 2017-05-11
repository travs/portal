import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import d3 from 'd3';
import MG from 'metrics-graphics';
// Collections
import { Cores } from '/imports/api/cores';
import { Assets } from '/imports/api/assets';
// Components
import '/imports/ui/components/portfolio/portfolio_overview.js';
import '/imports/ui/components/portfolio/portfolio_contents.js';
import '/imports/ui/components/portfolio/manage_participation.js';
// Corresponding html file
import './portfolio.html';


Template.portfolio.onCreated(() => {
  Meteor.subscribe('cores');
  Meteor.subscribe('assets');
});


Template.portfolio.helpers({
  getPortfolioDoc() {
    const address = FlowRouter.getParam('address');
    const doc = Cores.findOne({ address });
    return (doc === undefined || address === undefined) ? '' : doc;
  },
});


Template.portfolio.onRendered(() => {
  // Upsert Cores and Asset Collection
  const address = FlowRouter.getParam('address');
  Meteor.call('assets.sync', address); // Upsert Assets Collection

  // Use Meteor.defer() to create chart after DOM is ready:
  Meteor.defer(() => {
    d3.json('data/confidence_band.json', (data) => {
      data = MG.convert.date(data, 'date');
      MG.data_graphic({
        title: '',
        description: 'Confidence Band of Portfolio Performance',
        data: data,
        format: 'percentage',
        full_width: true,
        height: 250,
        right: 40,
        color: '#1189c6',
        area: false,
        target: '#charts',
        show_secondary_x_label: false,
        show_confidence_band: ['l', 'u'],
        x_extended_ticks: true,
      });
    });
  });
});
