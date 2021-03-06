// import { Email } from "meteor/email";
// import { Meteor } from "meteor/meteor";
// import { SyncedCron } from "meteor/percolate:synced-cron";
// import moment from "moment";
//
// import { Channels } from "../channels/collection";
// import { Messages } from "../messages/collection";
//
// SyncedCron.add({
//   name: "Send mail to keep people in touch with CollectivZ",
//   schedule(parser) {
//     return parser.text("on the first day of the week");
//   },
//   job() {
//     const yesterday = moment().add(-7, "days").valueOf();
//     const now = Date.now();
//     const users = Meteor.users
//       .find({ lastLogin: { $lt: yesterday }, username: { $ne: "Zorro" } })
//       .fetch();
//
//     users.forEach(user => {
//       const channels = Channels.find({
//           _id: { $in: user.subscribedChannels },
//           lastActivity: { $gt: user.lastLogin }
//         })
//         .fetch();
//       let channelIds = [];
//       channels.forEach(channel => {
//         channelIds.push(channel._id);
//       });
//
//       const messageCount = Messages.find({
//           channelId: { $in: channelIds },
//           createdAt: { $gt: user.lastLogin }
//         })
//         .count();
//       if (messageCount > 0) {
//         Email.send({
//           to: user.emails[0].address,
//           from: "postmaster@www.collectivz.com",
//           subject: "Le Collectif avance sans vous !",
//           text: `Bonjour, vous ne vous êtes pas connecté depuis plus de 7 jours... ${messageCount} messages ont été postés dans ${channels.length} groupes différents depuis votre dernier passage !`
//         });
//       }
//       Meteor.users.update(user._id, {
//         $set: { lastLogin: now }
//       });
//     });
//   }
// });
//
// SyncedCron.start();
