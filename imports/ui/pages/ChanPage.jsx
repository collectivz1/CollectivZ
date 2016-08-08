import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';

// import Channel from '../channel/Channel.jsx';
import { zorro } from '../../api/zorro/zorro.js';
import { Channels } from '../../api/channels/collection.js';
import { Messages } from '../../api/messages/collection.js';

import TopNav from '../modules/topNav/TopNav.jsx';
import Loader from '../modules/loader/Loader.jsx';
import MsgItem from '../modules/msgItem/MsgItem.jsx';
import ZorroItem from '../modules/zorroItem/ZorroItem.jsx';
import MsgInput from '../modules/msgInput/MsgInput.jsx';

import './ChanPage.css';

class ChanPage extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      searchString: '',
      hasMenu: 'has-menu',
      padding:'small-padding',
      inputMode: 'message',
      dialogWithZorro: [],
      currentAction: {},
      ongoingAction: false,
      expectedAnswer: '',
    };

    this.toggleMarginBottom = this.toggleMarginBottom.bind(this);
    this.changeInputMode = this.changeInputMode.bind(this);
    this.answerToZorro = this.answerToZorro.bind(this);
    this.handleClick = this.handleClick.bind(this);
  }

  componentDidMount() {
    this.refs.scroll.scrollTop += this.refs.scroll.scrollHeight;
    this.setState({
      count: this.props.msgs.length,
    });
  }

  componentDidUpdate() {
    if ((this.props.msgs.length + this.state.dialogWithZorro.length) !== this.state.count) {
      this.refs.scroll.scrollTop += this.refs.scroll.scrollHeight;
      this.setState({
        count: this.props.msgs.length + this.state.dialogWithZorro.length,
      });
    }

    //this handle the start of a new action
    if (this.state.inputMode !== "message" && !this.state.ongoingAction) {
      const inputMode = this.state.inputMode;
      const currentAction = JSON.parse(JSON.stringify(zorro[inputMode]))[inputMode];
      const msg = {
        text: currentAction.questions[currentAction.toFill[0]],
        author: 'Zorro'
      };

      this.setState({
        currentAction,
        ongoingAction: true,
        expectedAnswer: currentAction.toFill[0],
        dialogWithZorro: this.state.dialogWithZorro.concat([msg]),
      });
    }

  }

  toggleMarginBottom() {
    if (this.state.padding !== 'large-padding') {
      this.setState({
        padding: 'large-padding',
      }, () => {
        this.refs.scroll.scrollTop += this.refs.scroll.scrollHeight;
      });
    } else {
      this.setState({
        padding: 'small-padding',
      })

    }
  }

  changeInputMode(newMode) {
    this.setState({
      inputMode: newMode
    });
  }

  answerToZorro(answer) {
    const msg = {
      text: answer,
      author: 'self'
    };
    const currentAction = this.state.currentAction;
    const expectedAnswer = this.state.expectedAnswer;
    const dialog = this.state.dialogWithZorro;

    dialog.push(msg);
    currentAction.finalAnwser[expectedAnswer] = answer;

    const index = currentAction.toFill.indexOf(expectedAnswer);
    currentAction.toFill.splice(index, 1);

    if (currentAction.toFill.length > 0) {
      const question = currentAction.questions[currentAction.toFill[0]]
        + currentAction.finalAnwser.chanName;
      const zorroMsg = {
        text: question,
        author: 'Zorro'
      };
      dialog.push(zorroMsg);
      this.setState({
        expectedAnswer: currentAction.toFill[0],
        dialogWithZorro: dialog
      });
    } else if (expectedAnswer === 'confirm' && answer === "oui") {
      const finalAnwser = currentAction.finalAnwser;

      switch (this.state.inputMode) {
        case 'newChannel':
          const channel = {
            name: finalAnwser.chanName,
            depth: 2
          };

          Meteor.call('channels.insert', channel, this.props.channel._id);
          break;
        default:
          break;
      }
      this.setState({
        currentAction: {},
        ongoingAction: false,
        dialogWithZorro: [],
        expectedAnswer: '',
        inputMode: 'message'
      });
    }
  }

  handleClick(param, e) {
    if (param === 'chanCount') {
      this.setState({
        searchString: 'channel'
      });
    } else if (param === 'all') {
      this.setState({
        searchString: ''
      });
    }
  }

  render() {
    let store = [];
    let messages = [];
    console.log(this.props.loading)
    if (this.state.searchString !== '') {
      messages = this.props.msgs.filter((message) => {
        if (message.type && message.type === this.state.searchString) {
          return true;
        } else {
          return false;
        }
      });
    } else {
      messages = this.props.msgs;
    }
    if (this.props.channel.connections) {
      let arr = _.keys(this.props.channel.connections)
      for (var i = 0; i < arr.length; i++) {
        store.push({
          name: arr[i],
          nb: this.props.channel.connections[arr[i]],
        });
      }
    }
    return (
      <div>
        <TopNav text={this.props.channel.name || '...'}/>
        { store.length ?
          <div className="view-container">
            <div className="second">
              <p onClick={this.handleClick.bind(this, 'all')}>All</p>
              {
                store.map(function(menu) {
                 return (
                     <p onClick={this.handleClick.bind(this, menu.name)} key={menu} >{menu.name + ' ' + menu.nb}</p>
                  );
                }, this)
              }
            </div>
          </div>
          : ''
        }
          <div className="pane">
          <div ref='scroll' className={this.state.padding
                      + " scroll-content has-chanbar has-tabs has-footer chat "
                      + (store.length ? this.state.hasMenu : '') }>

            { this.props.loading
              ? <Loader />
              : <div className="scroll">
                  <div className="message-list">
                    {messages.map(function(msg) {
                       return <MsgItem key={msg._id} msg={msg} />;
                    })}
                  </div>
                  <div className="message-list">
                    {this.state.dialogWithZorro.map(function(msg, index) {
                       return <ZorroItem key={index} msg={msg} />;
                    })}
                  </div>
                </div>
            }
          </div>
          <MsgInput
            chanId={this.props.channel._id || '...'}
            changeInputMode={this.changeInputMode}
            inputMode={this.state.inputMode}
            answerToZorro={this.answerToZorro}
            toggleMarginBottom={this.toggleMarginBottom}
          />
        </div>
      </div>
    );
  }
}

ChanPage.propTypes = {
  msgs: PropTypes.array.isRequired,
  channel: PropTypes.object.isRequired,
}

export default ChanPage;
