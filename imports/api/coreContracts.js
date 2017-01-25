import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';


export const CoreContracts = new Mongo.Collection('coreContracts');


if (Meteor.isServer) {
  Meteor.publish('coreContracts', () => CoreContracts.find());
}


Meteor.methods({
  'coreContracts.insert'(address, name, managerAddress, managerName, registrarAddress, sharePrice, notional, intraday, mtd, ytd) {
    check(address, String);
    check(name, String);
    check(managerAddress, String);
    check(managerName, String);
    check(registrarAddress, String);
    check(sharePrice, String);
    check(notional, Number);
    check(intraday, Number);
    check(mtd, Number);
    check(ytd, Number);

    console.log(`Share Price: ${sharePrice}`)

    CoreContracts.insert({
      address,
      name,
      managerAddress,
      managerName,
      registrarAddress,
      sharePrice,
      notional,
      intraday,
      mtd,
      ytd,
      isNew: true,
      delta: "±0.0",
      username: 'N/A',
      createdAt: new Date(),
    });
  },
  'coreContracts.remove'(portfolioId) {
    check(portfolioId, String);

    const portfolio = CoreContracts.findOne(portfolioId);

    // Only the owner can delete it
    // TODO assert portflio address
    // if (portfolio.owner !== Meteor.userId())
    //   throw new Meteor.Error('not-authorized');

    CoreContracts.remove(portfolioId);
  },
  'coreContracts.setSharePrice'(portfolioId, setToSharePrice) {
    check(portfolioId, String);
    check(setToSharePrice, Number);

    CoreContracts.update(portfolioId, { $set: { sharePrice: setToSharePrice } });
  },
  'coreContracts.setNotional'(portfolioId, setToNotional) {
    check(portfolioId, String);
    check(setToNotional, Number);

    CoreContracts.update(portfolioId, { $set: { notional: setToNotional } });
  },
  'coreContracts.setToUsed'(portfolioId) {
    check(portfolioId, String);
    CoreContracts.update(portfolioId, { $set: { isNew: false } });
  },
});
