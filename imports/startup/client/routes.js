import { FlowRouter } from 'meteor/kadira:flow-router';
import { BlazeLayout } from 'meteor/kadira:blaze-layout';

// Import to load these templates
import '/imports/ui/layouts/main.js';
import '/imports/ui/layouts/header.js';
import '/imports/ui/layouts/footer.js';
import '/imports/ui/pages/portal.js';
import '/imports/ui/pages/portfolio.js';
import '/imports/ui/pages/manage.js';
import '/imports/ui/pages/wallet.js';


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

FlowRouter.route('/portfolio/:address', {
  name: 'portfolio',
  action() {
    BlazeLayout.render('layout_main', {
      nav: 'layout_header',
      main: 'portfolio',
      footer: 'layout_footer',
    });
  },
});

FlowRouter.route('/manage/:address', {
  name: 'manage',
  action() {
    BlazeLayout.render('layout_main', {
      nav: 'layout_header',
      main: 'manage',
      footer: 'layout_footer',
    });
  },
});


// Route for wallet
FlowRouter.route('/wallet/:address', {
  name: 'wallet',
  action() {
    BlazeLayout.render('layout_main', {
      nav: 'layout_header',
      main: 'wallet',
      footer: 'layout_footer',
    });
  },
});
