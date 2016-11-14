import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

import { Channels } from '../channels/collection.js';

Meteor.methods({
  'users.changeAvatar'(userId, url) {
    if (!this.userId) {
      throw new Meteor.Error('not-logged-in',
        "Vous devez être connecté pour changer d'avatar.");
    }

    check(url, String);
    check(userId, String);

    if (this.userId !== userId && !Meteor.user().isAdmin) {
      throw new Meteor.Error('wrong user',
        "Vous ne pouvez pas changer l'image d'une autre personne.");
    }

    Meteor.users.update(userId, {
      $set: { 'imageUrl' : url }
    });
    Messages.update({ author: userId }, {
      $set: { 'authorImage': url }
    });
  },

  'users.changeBackground'(url) {
    const userId = this.userId;

    if (!userId) {
      throw new Meteor.Error('not-logged-in',
        "Vous devez être connecté pour changer d'avatar.");
    }

    check(url, String);

    Meteor.users.update(userId, {
      $set: { 'profile.background' : url }
    });
  },

  'users.updateLastRead'(channelId) {
    const userId = this.userId;

    if (!userId) {
      throw new Meteor.Error('not-logged-in',
        "Vous devez être connecté pour changer d'avatar.");
    }
    check(channelId, String);

    const lastReadField = `lastReadAt.${channelId}`;
    Meteor.users.update(userId, {
      $set: { [lastReadField]: Date.now() }
    });
  },

  'users.changeInfos'(userDoc) {
    if (!this.userId) {
      throw new Meteor.Error('not-logged-in',
        "Vous devez être connecté pour changer de nom d'utilisateur.");
    }
    new SimpleSchema({
      username: {
        type: String,
        optional: true
      },
      firstname: {
        type: String,
        optional: true
      },
      lastname: {
        type: String,
        optional: true
      },
      email: {
        type: String,
        optional: true
      },
      phone: {
        type: String,
        optional: true
      }
    }).validate(userDoc);

    const {
      email,
      username,
      firstname,
      lastname,
      phone
    } = userDoc;
    let update = {
      $set: {
      }
    };

    if (email) {
      Accounts.addEmail(this.userId, email);
    }

    if (username) {
      Accounts.setUsername(this.userId, username);
    }
    if (firstname) {
      update.$set['profile.firstName'] = firstname;
    }
    if (lastname) {
      update.$set['profile.lastName'] = lastname;
    }
    if (phone) {
      update.$set.phone = phone;
    }

    if (!_.isEmpty(update.$set)) {
      Meteor.users.update(this.userId, update);
    }
  },

  'users.getUserNumber'() {
    return Meteor.users.find().count();
  },

  'users.addSkill'(newSkill) {
    if (!this.userId) {
      throw new Meteor.Error('not-logged-in',
        "Vous devez être connecté pour changer de nom d'utilisateur.");
    }
    check(newSkill, String);

    Meteor.users.update(this.userId, {
      $addToSet: { skills: newSkill }
    });
  },

  'users.removeSkill'(skill) {
    if (!this.userId) {
      throw new Meteor.Error('not-logged-in',
        "Vous devez être connecté pour changer de nom d'utilisateur.");
    }
    check(skill, String);

    Meteor.users.update(this.userId, {
      $pull: { skills: skill }
    });
  }
});
