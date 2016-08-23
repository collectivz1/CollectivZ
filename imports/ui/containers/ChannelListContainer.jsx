import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';

import { Channels } from '../../api/channels/collection.js';

import ChannelList from '../pages/ChannelList.jsx'

export default createContainer(() => {
  const channelSub = Meteor.subscribe('chanList');
  const channels = Channels.find(
    {_id: {$in: Meteor.user().subscribedChannels}},
    { sort: { lastActivity: -1 } }).fetch();

  return {
    channels,
    loading: !channelSub.ready(),
  };
}, ChannelList);
