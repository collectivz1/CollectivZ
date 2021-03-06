import React, { Component, PropTypes } from "react";
import { Meteor } from "meteor/meteor";

import moment from "moment";

import DropDownBottom from "../DropDownBottom";
import UserDetails from "./UserDetails";
import { Toast } from "../../helpers/Toast";
import { openModal } from "../../helpers/Modal";

export default class MessageItem extends Component {
  constructor(props) {
    super(props);

    this.state = {
      editing: false
    };

    this.isMine = this.isMine.bind(this);
    this.editMessage = this.editMessage.bind(this);
    this.toggleEdit = this.toggleEdit.bind(this);
    this.deleteMessage = this.deleteMessage.bind(this);
    this.chatWithAuthor = this.chatWithAuthor.bind(this);
    this.inviteToContacts = this.inviteToContacts.bind(this);
    this.goToProfile = this.goToProfile.bind(this);
    this.isChannelAuthor = this.isChannelAuthor.bind(this);
    this.transformIntoAction = this.transformIntoAction.bind(this);
    this.answerMessage = this.answerMessage.bind(this);
    this.blockUser = this.blockUser.bind(this);
    this.reportContent = this.reportContent.bind(this);
    this.openUserModal = this.openUserModal.bind(this);
  }

  editMessage(e) {
    e.preventDefault();
    const {
      message
    } = this.props;

    const newText = this.refs.textInput.value;

    Meteor.call("messages.edit", newText, message._id, (err, res) => {
      if (err) {
        Toast(err.reason, "danger");
      }
    });
    this.setState({
      editing: false
    });
  }

  toggleEdit() {
    this.setState({
      editing: !this.state.editing
    });
  }

  deleteMessage() {
    Meteor.call("messages.delete", this.props.message._id, (err, res) => {
      if (err) {
        Toast(err.reason, "danger");
      }
    });
  }

  isChannelAuthor() {
    const {
      message,
      user
    } = this.props;
    const channel = Channels.findOne(message.channelId);

    return channel.author === user._id;
  }

  transformIntoAction() {
    const {
      message
    } = this.props;

    Meteor.call("messages.transformIntoAction", message._id, (err, res) => {
      if (err) {
        Toast(err.reason, "danger");
      } else {
        Toast("Message transformé avec succès.", "success");
      }
    });
  }

  isMine() {
    const {
      message
    } = this.props;

    if (Meteor.userId() === message.author) {
      return "chat-bubble chat-bubble-mine";
    }
    return "chat-bubble chat-bubble-other";
  }

  answerMessage() {
    const {
      message,
      answerToMessage
    } = this.props;

    answerToMessage(message._id);
  }

  inviteToContacts() {
    const {
      message
    } = this.props;

    Meteor.call("repertory.sendInvite", message.authorName, (err, res) => {
      if (err) {
        Toast(err.reason, "danger");
      }
    });
  }

  chatWithAuthor() {
    const {
      message
    } = this.props;

    Meteor.call("channels.conversationCreate", [message.author], (err, res) => {
      if (!err) {
        this.context.router.push(`/conversation/${res}`);
      } else {
        Toast(err.reason, "danger");
      }
    });
  }

  goToProfile() {
    const {
      message
    } = this.props;

    this.context.router.push(`/profile/${message.author}`);
  }

  reportContent() {
    const {
      message
    } = this.props;

    Meteor.call("users.reportContent", message._id, "message");
  }

  blockUser() {
    const {
      message
    } = this.props;

    Meteor.call("users.blockUser", message.author);
  }

  openUserModal() {
    const {
      message
    } = this.props;
    const author = {
      username: message.authorName,
      _id: message.author,
      imageUrl: message.authorImage
    };

    const component = <UserDetails author={author} />;
    openModal(component, `Détails sur ${author.username}`);
  }

  render() {
    const {
      message,
      user,
      author
    } = this.props;

    const { editing } = this.state;

    const time = moment(message.createdAt).fromNow();

    return (
      <div className={this.isMine()}>

        <img src={message.authorImage} onClick={this.openUserModal} />

        <div className="bubble-content">

          <div className="bubble-content-header">

            <span className="bubble-content-name">
              {message.authorName}
            </span>
            <span className="bubble-content-date">{time}</span>

            <DropDownBottom>
              {message.author === user._id ||
                user.isAdmin ||
                this.isChannelAuthor()
                ? <ul>
                    <li>
                      <a
                        className="drop-down-menu-link"
                        onClick={this.toggleEdit}
                      >
                        {" "}Editer le message{" "}
                      </a>
                    </li>
                    <li>
                      <a
                        className="drop-down-menu-link"
                        onClick={this.deleteMessage}
                      >
                        {" "}Supprimer le message{" "}
                      </a>
                    </li>
                    <li>
                      <a
                        className="drop-down-menu-link"
                        onClick={this.transformIntoAction}
                      >
                        {" "}Transformer en action{" "}
                      </a>
                    </li>
                  </ul>
                : ""}
              {message.author !== user._id
                ? <ul>
                    <li>
                      <a
                        className="drop-down-menu-link"
                        onClick={this.inviteToContacts}
                      >
                        {" "}Ajouter l'auteur à mes contacts{" "}
                      </a>
                    </li>
                    <li>
                      <a
                        className="drop-down-menu-link"
                        onClick={this.chatWithAuthor}
                      >
                        {" "}Lancer une conversation avec l'auteur{" "}
                      </a>
                    </li>
                    <li>
                      <a
                        className="drop-down-menu-link"
                        onClick={this.answerMessage}
                      >
                        {" "}Répondre{" "}
                      </a>
                    </li>
                    <li>
                      <a
                        className="drop-down-menu-link"
                        onClick={this.goToProfile}
                      >
                        {" "}Voir le profil{" "}
                      </a>
                    </li>
                    <li>
                      <a
                        className="drop-down-menu-link"
                        onClick={this.reportContent}
                      >
                        {" "}Signaler le contenu{" "}
                      </a>
                    </li>
                    <li>
                      <a
                        className="drop-down-menu-link"
                        onClick={this.blockUser}
                      >
                        {" "}Bloquer l'utilisateur{" "}
                      </a>
                    </li>
                  </ul>
                : ""}
            </DropDownBottom>

          </div>

          {editing
            ? <div>
                <form className="">
                  <textarea
                    className="small large"
                    type="text"
                    name="name"
                    ref="textInput"
                    defaultValue={message.text}
                  />
                  <button
                    className="small success button"
                    type="button"
                    name="button"
                    onClick={this.editMessage}
                  >
                    <i className="icon icon-pencil" aria-hidden="true" />
                  </button>
                </form>
              </div>
            : message.quoted
                ? <div>
                    <p>
                      Réponse à{" "}
                      <b>{message.quoted.authorName}</b>
                      :{" "}
                      <i>"{message.quoted.text}"</i>
                    </p>
                    <br />
                    <p dangerouslySetInnerHTML={{ __html: message.text }} />
                  </div>
                : <p dangerouslySetInnerHTML={{ __html: message.text }} />}

        </div>

      </div>
    );
  }
}

MessageItem.propTypes = {
  message: PropTypes.object.isRequired
};

MessageItem.contextTypes = {
  router: PropTypes.object
};
