import React from "react";

import DropDownBottom from "../DropDownBottom";
import PollEdit from "./PollEdit";
import AvatarRowContainer from "../../containers/AvatarRowContainer";
import { Toast } from "../../helpers/Toast";
import { openModal } from "../../helpers/Modal";

export default class PollItem extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      selectedProposition: ""
    };

    this.openEdit = this.openEdit.bind(this);
    this.deletePoll = this.deletePoll.bind(this);
    this.voteForAPoll = this.voteForAPoll.bind(this);
  }

  openEdit() {
    const {
      poll
    } = this.props;
    const component = <PollEdit poll={poll} />;
    openModal(component, "Modifier la question du sondage.");
  }

  hasVoted() {
    const {
      user,
      propositions
    } = this.props;

    if (propositions.length) {
      return propositions.some(proposition =>
        proposition.voteReceivedFrom.some(id => id === user._id));
    }
  }

  deletePoll() {
    const {
      poll
    } = this.props;

    Meteor.call("polls.delete", poll._id);
  }

  selectProposition(propositionId) {
    this.setState({
      selectedProposition: propositionId
    });
  }

  getVotePercent(proposition) {
    const {
      poll
    } = this.props;
    const percent = proposition.voteReceivedFrom.length *
      100 /
      poll.totalVote ||
      0;

    return {
      width: `${percent}%`
    };
  }

  voteForAPoll() {
    const {
      selectedProposition
    } = this.state;

    Meteor.call("polls.vote", this.props.poll._id, selectedProposition, (
      err,
      res
    ) => {
      if (err) {
        Toast(err.reason, "danger");
      }
    });
  }

  render() {
    const {
      poll,
      propositions,
      user
    } = this.props;

    const propositionNodes = propositions.map(
      function(proposition, i) {
        return (
          <div key={proposition._id}>
            {!this.hasVoted()
              ? <div className="radio">
                  <input
                    id={i}
                    type="radio"
                    className="primary"
                    name="radio-group"
                    onClick={this.selectProposition.bind(this, proposition._id)}
                  />
                  <label htmlFor={i}>{proposition.name}</label>
                </div>
              : <div>
                  <p className="b">
                    {proposition.name}
                  </p>
                  <div className="progress-bar-wrapper">
                    <div
                      className="progress-bar success"
                      style={this.getVotePercent(proposition)}
                    />
                    <span>
                      {proposition.voteReceivedFrom.length} votes reçus{" "}
                    </span>
                  </div>
                </div>}
          </div>
        );
      },
      this
    );
    return (
      <div className="chat-special-bubble chat-special-bubble-poll">
        <div className="bubble-content">
          <div className="bubble-header">
            <i className="icon icon-pie-chart icon-pollz-color" />
            <span>
              <a href="">{poll.authorName}</a>
              {" "}à lancé un sondage
            </span>
            <h5> {poll.question}</h5>
            {poll.author === user._id || user.isAdmin
              ? <DropDownBottom>
                  <ul>
                    <li>
                      <a
                        className="drop-down-menu-link"
                        onClick={this.deletePoll}
                      >
                        {" "}Supprimer le sondage{" "}
                      </a>
                    </li>
                    <li>
                      <a
                        className="drop-down-menu-link"
                        onClick={this.openEdit}
                      >
                        {" "}Modifier la question{" "}
                      </a>
                    </li>
                  </ul>
                </DropDownBottom>
              : ""}
          </div>
          {
            propositions && propositions.length > 0 ?
              <div className="poll-choice">{propositionNodes}</div>
            : ''
          }
          {this.hasVoted()
            ? <div className="success-box">
                <h4><i className="icon icon-check" />Vous avez déjà voté.</h4>
              </div>
            : <button className="success button" onClick={this.voteForAPoll}>
                Voter
              </button>}
          <AvatarRowContainer isLarge userIds={poll.members} />
        </div>
      </div>
    );
  }
}
