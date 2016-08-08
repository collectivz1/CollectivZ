import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';

import { Channels } from '../../api/channels/collection.js';
import { Messages } from '../../api/messages/collection.js';

import ChanPage from '../pages/ChanPage.jsx';


export default createContainer(({ params }) => {
  const sub = Meteor.subscribe('chanPage', params.chatId);
  const id = params.chatId;
  return {
    loading: !sub.ready(),
    msgs: Messages.find({channelId: id}, {$sort: {createadAt: 1}}).fetch(),
    channel: Channels.findOne(id) || {},
  };
}, ChanPage);
