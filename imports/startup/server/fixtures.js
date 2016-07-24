import { Chans, Guilds, Msgs } from '../../api/collections';

Meteor.startup(function() {

  Accounts.onCreateUser(function(options, user) {
    user.profile = options.profile || {};
    user.profile.lastLogin = new Date();
    return user;
  });



    if (Meteor.users.find().count() === 0) {
      Accounts.createUser({
        email : 'mastermind@mastermind.com',
        username: 'mastermind',
        password : 'mastermind',
        profile: {
          firstName: 'tammy',
          lastName: 'mind'
        }
      });
      Accounts.createUser({
        email : 'pdecrat@student.42.fr',
        username: 'philippe',
        password : 'collectivz',
        profile: {
          firstName: 'philippe',
          lastName: 'decrat'
        }
      });
      Accounts.createUser({
        email : 'tdurand@student.42.fr',
        username: 'tommy',
        password : 'collectivz',
        profile: {
          firstName: 'tommy',
          lastName: 'durand'
        }
      });
      Accounts.createUser({
        email : 'tfrere@student.42.fr',
        username: 'thibaud',
        password : 'collectivz',
        profile: {
          firstName: 'thibaud',
          lastName: 'frere'
        }
      });
      Accounts.createUser({
        email : 'cfriot@student.42.fr',
        username: 'charles',
        password : 'collectivz',
        profile: {
          firstName: 'charles',
          lastName: 'friot'
        }
      });

      Accounts.createUser({
        email : 'boris@collectivz.info',
        username: 'boris',
        password : 'collectivz',
        profile: {
          firstName: 'boris',
          lastName: 'sirbey'
        }
      });

      Accounts.createUser({
        email : 'mpdequier@gmail.com',
        username: 'marie-pierre',
        password : 'collectivz',
        profile: {
          firstName: 'marie-pierre',
          lastName: 'dequier'
        }
      });

      Accounts.createUser({
        email : 'christinemarsan13@gmail.com',
        username: 'christine',
        password : 'collectivz',
        profile: {
          firstName: 'Christine',
          lastName: 'Marsan'
        }
      });
    }

  if (Chans.find().count() === 0) {
    const user = Meteor.users.findOne({'username': 'charles'});
    const chanId = Chans.insert({
      test: 'Get it to work !'
    });
    const GuildId = Guilds.insert({
      test: 'Collectivz'
    });
    const msgId = Msgs.insert({
      chanId: chanId,
      text: 'testing new msg',
      userId: user._id
    });

  }

})
