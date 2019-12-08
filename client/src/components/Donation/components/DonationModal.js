/* eslint-disable max-len */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import { Modal, Button, Col, Row } from '@freecodecamp/react-bootstrap';
import { Spacer } from '../../../components/helpers';
import { blockNameify } from '../../../../utils/blockNameify';
import Heart from '../../../assets/icons/Heart';
import Cup from '../../../assets/icons/Cup';
import DonateForm from './DonateForm';
import { stripeScriptLoader } from '../../../utils/scriptLoaders';
import { stripePublicKey } from '../../../../config/env.json';

import ga from '../../../analytics';
import {
  closeDonationModal,
  isDonationModalOpenSelector,
  canRequestBlockDonationSelector,
  activeDonationsSelector
} from '../../../redux';

import { challengeMetaSelector } from '../../../templates/Challenges/redux';

import '../Donation.css';

const mapStateToProps = createSelector(
  isDonationModalOpenSelector,
  challengeMetaSelector,
  canRequestBlockDonationSelector,
  activeDonationsSelector,
  (show, { block }, isBlockDonation, activeDonors) => ({
    show,
    block,
    isBlockDonation,
    activeDonors
  })
);

const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      closeDonationModal
    },
    dispatch
  );

const propTypes = {
  activeDonors: PropTypes.number,
  block: PropTypes.string,
  closeDonationModal: PropTypes.func.isRequired,
  isBlockDonation: PropTypes.bool,
  show: PropTypes.bool
};

class DonateModal extends Component {
  constructor(...props) {
    super(...props);
    this.state = {
      isBlockDonation: this.props.isBlockDonation,
      stripe: null,
      enableSettings: false
    };
    this.enableDonationSettingsPage = this.enableDonationSettingsPage.bind(
      this
    );
    this.handleStripeLoad = this.handleStripeLoad.bind(this);
  }

  componentDidMount() {
    if (window.Stripe) {
      this.handleStripeLoad();
    } else if (document.querySelector('#stripe-js')) {
      document
        .querySelector('#stripe-js')
        .addEventListener('load', this.handleStripeLoad);
    } else {
      stripeScriptLoader(this.handleStripeLoad);
    }
  }

  componentWillUnmount() {
    const stripeMountPoint = document.querySelector('#stripe-js');
    if (stripeMountPoint) {
      stripeMountPoint.removeEventListener('load', this.handleStripeLoad);
    }
  }

  handleStripeLoad() {
    // Create Stripe instance once Stripe.js loads
    if (stripePublicKey) {
      this.setState(state => ({
        ...state,
        stripe: window.Stripe(stripePublicKey)
      }));
    }
  }

  enableDonationSettingsPage(enableSettings = true) {
    this.setState({ enableSettings });
  }

  render() {
    const { show, block, activeDonors } = this.props;
    const { isBlockDonation, stripe } = this.state;

    if (show) {
      ga.modalview('/donation-modal');
    }
    const blockDonationText = (
      <div className='block-modal-text'>
        <div className='donation-icon-container'>
          <Cup className='donation-icon' />
        </div>
        <p className='text-center'>
          Nicely done. You just completed {blockNameify(block)}.
        </p>
        <p className='text-center'>
          Help us create even more learning resources like this.
        </p>
      </div>
    );

    const progressDonationText = (
      <div className='text-center progress-modal-text'>
        <div className='donation-icon-container'>
          <Heart className='donation-icon' />
        </div>
        <p>
          freeCodeCamp.org is a tiny nonprofit that's helping millions of people
          learn to code for free.
        </p>
        <p>
          Join <strong>{activeDonors}</strong> supporters.
        </p>
        <p>Your donation will help keep tech education free and open.</p>
      </div>
    );

    return (
      <Modal
        bsSize='lg'
        className='donation-modal'
        id='donation-modal'
        show={show}
      >
        <Modal.Header className='fcc-modal'>
          <Modal.Title className='modal-title text-center'>
            <strong>Support freeCodeCamp.org</strong>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {isBlockDonation ? blockDonationText : progressDonationText}
          <DonateForm
            enableDonationSettingsPage={this.enableDonationSettingsPage}
            stripe={stripe}
          />
          <Spacer />
          <Row>
            <Col sm={10} smOffset={1} xs={12}>
              <Button
                block={true}
                bsSize='sm'
                bsStyle='primary'
                onClick={this.props.closeDonationModal}
              >
                close
              </Button>
            </Col>
          </Row>
          <Spacer />
        </Modal.Body>
      </Modal>
    );
  }
}

DonateModal.displayName = 'DonateModal';
DonateModal.propTypes = propTypes;

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(DonateModal);
