import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Modal } from 'react-native';
import { AddNewForm } from './index';
import store from '../store';
import { getAddNewModalShown } from '../reducers/selectors';
import { CLOSE_ADD_NEW_MODAL } from '../actions/types';

class AddNewModal extends Component {
  render() {
    return (
      <Modal
        animationType="slide"
        transparent={false}
        visible={this.props.add_new_modal_shown}
        onRequestClose={() => {
          store.dispatch({ type: CLOSE_ADD_NEW_MODAL });
        }}
      >
        <AddNewForm />
      </Modal>
    );
  }
}

function mapStateToProps(state) {
  return {
    add_new_modal_shown: getAddNewModalShown(state)
  };
}

export default connect(mapStateToProps)(AddNewModal);
