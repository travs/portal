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
    BlazeLayout.render('layout_main', {
      nav: 'layout_header',
      main: 'portal',
      footer: 'layout_footer',
    });
  },
});

FlowRouter.route('/visit', {
  name: 'visit',
  action() {
    BlazeLayout.render('layout_main', {
      nav: 'layout_header',
      main: 'visit',
      footer: 'layout_footer',
    });
  },
});

FlowRouter.route('/fund/:address', {
  name: 'fund',
  action() {
    BlazeLayout.render('layout_main', {
      nav: 'layout_header',
      main: 'fund',
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


// Route for account
FlowRouter.route('/account/:address', {
  name: 'account',
  action() {
    BlazeLayout.render('layout_main', {
      nav: 'layout_header',
      main: 'wallet',
      footer: 'layout_footer',
    });
  },
});
