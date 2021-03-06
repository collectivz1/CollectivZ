import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import { _ } from "meteor/underscore";

import { Channels } from "../channels/collection.js";
import { Circles } from "../circles/collection.js";
import { Repertory } from "./collection.js";

Meteor.methods({
  "repertory.sendInvite": function(mailOrUsername) {
    check(mailOrUsername, String);

    const user = Meteor.user();
    const userInvited = Accounts.findUserByUsername(mailOrUsername) ||
      Accounts.findUserByEmail(mailOrUsername);
    if (!user) {
      throw new Meteor.Error(
        "not-logged-in",
        "Vous devez être connecté pour ajouter un contact."
      );
    } else if (!userInvited) {
      throw new Meteor.Error(
        "not-found",
        "Le mail ou le nom renseigné ne correspond à aucun utilisateur"
      );
    }

    const userRepertory = Repertory.findOne(user.repertory);
    const userInvitedRepertory = Repertory.findOne(userInvited.repertory);

    if (
      _.contains(userRepertory.contacts, userInvited._id) ||
      _.contains(userRepertory.invitationSent, userInvited._id)
    ) {
      throw new Meteor.Error(
        "already-invited",
        "Vous avez déja invité cette personne."
      );
    } else if (_.contains(userRepertory.invitationReceived, userInvited)) {
      throw new Meteor.Error(
        "already-invited",
        "Cet Utilisateur vous a déjà envoyé une invitation."
      );
    } else if (_.contains(userInvitedRepertory, user._id)) {
      throw new Meteor.Error("blackListed", "Cet Utilisateur vous a bloqué.");
    }

    Repertory.update(userRepertory._id, {
      $push: { invitationSent: userInvited._id }
    });
    Repertory.update(userInvitedRepertory._id, {
      $push: { invitationReceived: user._id }
    });
  },

  "repertory.acceptInvite": function(userSenderId) {
    check(userSenderId, String);

    const user = Meteor.user();
    const userSender = Meteor.users.findOne(userSenderId);

    if (!user) {
      throw new Meteor.Error(
        "not-logged-in",
        "Vous devez être connecté pour accepter une invitation."
      );
    } else if (!userSender) {
      throw new Meteor.Error("not-found", "L'utilisateur n'a pas été trouvé.");
    }

    const userRepertory = Repertory.findOne(user.repertory);
    const userSenderRepertory = Repertory.findOne(userSender.repertory);

    if (!userRepertory || !userSenderRepertory) {
      throw new Meteor.Error(
        "repertory-not-found",
        "Erreur lors de la récupération du repertoire."
      );
    }

    const index1 = userRepertory.invitationReceived.indexOf(userSenderId);
    const index2 = userSenderRepertory.invitationSent.indexOf(user._id);
    if (index1 < 0) {
      throw new Meteor.Error(
        "invitation-not-found",
        "Vous ne pouvez pas accepter une invitation non reçu."
      );
    } else if (index2 < 0) {
      throw new Meteor.Error(
        "invitation-not-found",
        "Vous ne pouvez pas accepter une invitation non envoyé."
      );
    }

    Repertory.update(user.repertory, {
      $push: { contacts: userSenderId },
      $pull: { invitationReceived: userSenderId }
    });

    Repertory.update(userSender.repertory, {
      $push: { contacts: user._id },
      $pull: { invitationSent: user._id }
    });
  },

  "repertory.refuseInvite": function(userSenderId) {
    check(userSenderId, String);

    const user = Meteor.user();
    const userSender = Meteor.users.findOne(userSenderId);

    if (!user) {
      throw new Meteor.Error(
        "not-logged-in",
        "Vous devez être connecté pour accepter une invitation."
      );
    } else if (!userSender) {
      throw new Meteor.Error("not-found", "L'utilisateur n'a pas été trouvé.");
    }

    const userRepertory = Repertory.findOne(user.repertory);
    const userSenderRepertory = Repertory.findOne(userSender.repertory);

    if (!userRepertory || !userSenderRepertory) {
      throw new Meteor.Error(
        "repertory-not-found",
        "Erreur lors de la récupération du repertoire."
      );
    }

    const index1 = userRepertory.invitationReceived.indexOf(userSenderId);
    const index2 = userSenderRepertory.invitationSent.indexOf(user._id);
    if (index1 < 0) {
      throw new Meteor.Error(
        "invitation-not-found",
        "Vous ne pouvez pas refuser une invitation non reçu."
      );
    } else if (index2 < 0) {
      throw new Meteor.Error(
        "invitation-not-found",
        "Vous ne pouvez pas refuser une invitation non envoyé."
      );
    }

    Repertory.update(user.repertory, {
      $pull: { invitationReceived: userSenderId }
    });

    Repertory.update(userSender.repertory, {
      $pull: { invitationSent: user._id }
    });
  },

  "repertory.removeContact": function(userToRemoveId) {
    check(userToRemoveId, String);

    const user = Meteor.user();
    const userToRemove = Meteor.users.findOne(userToRemoveId);

    if (!user) {
      throw new Meteor.Error(
        "not-logged-in",
        "Vous devez être connecté pour accepter une invitation."
      );
    } else if (!userToRemove) {
      throw new Meteor.Error("not-found", "L'utilisateur n'a pas été trouvé.");
    }

    const repertories = Repertory.find({
        _id: { $in: [user.repertory, userToRemove.repertory] }
      })
      .fetch();

    Repertory.update(
      { _id: { $in: [user.repertory, userToRemove.repertory] } },
      {
        $pull: { contacts: { $in: [user._id, userToRemoveId] } }
      },
      { multi: true }
    );

    const circleList = repertories[0].circles.concat(repertories[1].circles);

    Circles.update(
      { _id: { $in: circleList } },
      {
        $pull: { members: { $in: [user._id, userToRemoveId] } }
      },
      { multi: true }
    );
  }
});
