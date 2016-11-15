import React from 'react';

import { Toast } from '../helpers/Toast';
import { closeModal } from '../helpers/Modal';

export default class HeroModal extends React.Component {

  constructor(props) {
    super(props);

    this.pickHero = this.pickHero.bind(this);
  }

  pickHero() {
    const {
      hero
    } = this.props;

    Meteor.call('users.pickHero', hero.image, (res, err) => {
      if (err) {
        Toast(err.reason, 'danger');
      } else {
        Toast('Choix enregistré', "success");
        closeModal();
      }
    });
  }

  render() {
    const {
      hero
    } = this.props;

    return (
      <div>
        <img src={hero.image} />
        <p>{hero.title}</p>
        <button onClick={this.pickHero}>Choisir ce personnage</button>
        <p>{hero.description}</p>
      </div>
    );
  }
}