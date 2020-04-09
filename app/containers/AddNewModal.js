import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Modal } from 'react-native'
import { AddNewForm } from 'app/containers'
import { store } from 'app/redux'
import { getAddNewModalShown } from 'app/reducers/selectors'
import { CLOSE_ADD_NEW_MODAL } from 'app/actions/types'

// eslint-disable-next-line react/prefer-stateless-function
class AddNewModal extends Component {
  render() {
    const { shown } = this.props;
    return (
      <Modal
        animationType="slide"
        transparent={false}
        visible={shown}
        onRequestClose={() => {
          store.dispatch({ type: CLOSE_ADD_NEW_MODAL })
        }}
      >
        <AddNewForm />
      </Modal>
    )
  }
}

function mapStateToProps(state) {
  return {
    shown: getAddNewModalShown(state),
  }
}

export default connect(mapStateToProps)(AddNewModal)
