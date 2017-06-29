import { FlowRouter } from 'meteor/kadira:flow-router';
import { BlazeLayout } from 'meteor/kadira:blaze-layout';

// Import to load these templates
import '/imports/ui/layouts/main';
import '/imports/ui/layouts/header';
import '/imports/ui/layouts/footer';
import '/imports/ui/pages/portal';
import '/imports/ui/pages/visit';
import '/imports/ui/pages/fund';
import '/imports/ui/pages/manage';
import '/imports/ui/pages/wallet';

// Default route
FlowRouter.route('/', {
  name: 'portal',
  action() {
    BlazeLayout.render('layoutMain', {
      nav: 'layoutHeader',
      header: 'uxIndexPortal',
      main: 'portal',
      footer: 'layoutFooter',
    });
  },
});

FlowRouter.route('/visit', {
  name: 'visit',
  action() {
    BlazeLayout.render('layoutMain', {
      nav: 'layoutHeader',
      header: 'uxIndexPortal',
      main: 'visit',
      footer: 'layoutFooter',
      visit: true,
    });
  },
});

FlowRouter.route('/visit/:address', {
  name: 'visit',
  action() {
    BlazeLayout.render('layoutMain', {
      nav: 'layoutHeader',
      header: 'uxIndexPortal',
      main: 'fund',
      footer: 'layoutFooter',
      visit: true,
    });
  },
});

FlowRouter.route('/fund/:address', {
  name: 'fund',
  action() {
    BlazeLayout.render('layoutMain', {
      nav: 'layoutHeader',
      header: 'uxPortfolioOverview',
      main: 'fund',
      footer: 'layoutFooter',
    });
  },
});

FlowRouter.route('/manage/:address', {
  name: 'manage',
  action() {
    BlazeLayout.render('layoutMain', {
      nav: 'layoutHeader',
      header: 'uxManageOverview',
      main: 'manage',
      footer: 'layoutFooter',
    });
  },
});

// Route for account
FlowRouter.route('/account/:address', {
  name: 'account',
  action() {
    BlazeLayout.render('layoutMain', {
      nav: 'layoutHeader',
      header: 'uxWalletOverview',
      main: 'wallet',
      footer: 'layoutFooter',
    });
  },
});
