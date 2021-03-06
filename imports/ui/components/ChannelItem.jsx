import React, { Component, PropTypes } from "react";
import { Meteor } from "meteor/meteor";
import { Router, Route, Link, browserHistory } from "react-router";
import { _ } from "meteor/underscore";
import TouchEvent from "./TouchEvent";

import ActionList from "./ActionList.jsx";
import { Toast } from "../helpers/Toast";

export default class ChannelItem extends React.Component {
  constructor(props) {
    super(props);

    this.onClick = this.onClick.bind(this);
    this.getCss = this.getCss.bind(this);
  }

  onClick() {
    const { data } = this.props;
    let dest = "";

    if (data.type === "conversation") {
      dest = `/conversation/${data._id}`;
    } else {
      dest = `/group/${data._id}`;
    }

    setTimeout(
      () => {
        browserHistory.push(dest);
        Meteor.call("users.updateLastRead", data._id, (err, res) => {
          if (err) {
            Toast(err.reason, "danger");
          }
        });
      },
      350
    );
  }

  getCss() {
    const {
      data,
      renderMargin,
      count
    } = this.props;

    if (data && data.type === "channel" && renderMargin) {
      return count
        ? "list-item touch-event sub-list has-notif"
        : "list-item touch-event sub-list";
    }
    return count ? "list-item touch-event has-notif" : "list-item touch-event";
  }

  render() {
    const {
      data,
      renderUnread,
      count
    } = this.props;

    return data
      ? <TouchEvent class={this.getCss()} onClick={this.onClick}>
          <img src={data.imageUrl} alt="" />
          <div className="list-item-content">
            <p className="title">{data.name}</p>
            <p className="text">
              {data.lastMessage ? <span>{data.lastMessage.author}</span> : ""}
              {data.lastMessage ? `${data.lastMessage.text}` : ""}
            </p>
            {data.connections ? <ActionList actions={data.connections} /> : ""}
            {renderUnread && count
              ? <div className="list-item-notif">
                  <span>{count}</span><i className="icon icon-envelope" />
                </div>
              : ""}
          </div>
        </TouchEvent>
      : null;
  }
}

// ChannelItem.propTypes = {
//   data: PropTypes.object.isRequired,
// };
