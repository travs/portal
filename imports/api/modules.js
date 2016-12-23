import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';


const Registrars = new Mongo.Collection('registrars');

if (Meteor.isServer) {
  Meteor.publish('registrars', () => Registrars.find());
}


Meteor.methods({
  'registrars.insert'(address, name) {
    check(address, String);
    check(name, String);

    Registrars.insert({
      address,
      name,
      createdAt: new Date(),
    });
  },
});

export { Registrars };
