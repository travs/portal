import { FlowRouter } from 'meteor/kadira:flow-router';
import { BlazeLayout } from 'meteor/kadira:blaze-layout';

// Import to load these templates
import '/imports/ui/layouts/main.js';
import '/imports/ui/layouts/header.js';
import '/imports/ui/layouts/footer.js';
import '/imports/ui/pages/portal.js';
import '/imports/ui/pages/portfolio.js';
// import '/imports/ui/pages/wallet.js';
// import '/imports/ui/pages/blotter.js';

// Default route
FlowRouter.route('/', {
  name: 'portal',
  action() {
    BlazeLayout.render('layout_main', {
      nav: 'layout_header',
      main: 'portal',
      footer: 'layout_footer',
    });
  },
});

FlowRouter.route('/portfolio', {
  name: 'portfolio',
  action() {
    BlazeLayout.render('layout_main', {
      nav: 'layout_header',
      main: 'portfolio',
      footer: 'layout_footer',
    });
  },
});

FlowRouter.route('/portfolio/:_id', {
  name: 'blotter',
  action() {
    BlazeLayout.render('layout_main', {
      nav: 'layout_header',
      main: 'blotter',
      footer: 'layout_footer',
    });
  },
});

// Route for wallet
FlowRouter.route('/wallet', {
  name: 'wallet',
  action() {
    BlazeLayout.render('layout_main', {
      nav: 'layout_header',
      main: 'wallet',
      footer: 'layout_footer',
    });
  },
});
