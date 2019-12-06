/* eslint-disable max-len */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import { Modal, Button } from '@freecodecamp/react-bootstrap';
import { Link, Spacer } from '../../../components/helpers';
import { blockNameify } from '../../../../utils/blockNameify';
import Heart from '../../../assets/icons/Heart';

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
  state = {
    isBlockDonation: this.props.isBlockDonation
  };
  render() {
    const { show, block, activeDonors } = this.props;
    const { isBlockDonation } = this.state;
    if (show) {
      ga.modalview('/donation-modal');
    }
    const blockDonationText = (
      <div className='block-modal-text'>
        <p className='text-center'>
          Nicely done. You just completed {blockNameify(block)}.
        </p>
        <div className='heart-icon-container'>
          <Heart className='heart-icon' />
        </div>
        <p className='text-center'>
          Help us create even more learning resources like this.
        </p>
      </div>
    );

    const progressDonationText = (
      <div className='text-center progress-modal-text'>
        <Spacer />
        <p>
          freeCodeCamp.org is a tiny nonprofit that's helping millions of people
          learn to code for free.
        </p>
        <Spacer />
        <p>
          Join <strong>{activeDonors}</strong> supporters.
        </p>
        <Spacer />
        <p>
          Your $15 / month donation will help keep tech education free and open.
        </p>
        <Spacer />
      </div>
    );

    return (
      <Modal bsSize='lg' className='donation-modal' show={show}>
        <Modal.Header className='fcc-modal'>
          <Modal.Title className='modal-title text-center'>
            <strong>Support freeCodeCamp.org</strong>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {isBlockDonation ? blockDonationText : progressDonationText}
        </Modal.Body>
        <Modal.Footer>
          <Link
            className='btn-invert btn btn-lg btn-primary btn-block btn-cta'
            onClick={this.props.closeDonationModal}
            to={`/donate`}
          >
            Support our nonprofit
          </Link>
          <Button
            block={true}
            bsSize='lg'
            bsStyle='primary'
            className='btn-invert'
            onClick={this.props.closeDonationModal}
          >
            Ask me later
          </Button>
        </Modal.Footer>
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
