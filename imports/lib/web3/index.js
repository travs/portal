import { Meteor } from 'meteor/meteor';

import serverWeb3 from './server';
import clientWeb3 from './client';


export default Meteor.isServer ? serverWeb3 : clientWeb3;
