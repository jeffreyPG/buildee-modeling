import React from 'react'
import PropTypes from 'prop-types'

import OperationForm from '../Form/OperationForms/OperationForm'
import Modal from '../../components/UI/Modal'

const TABS = ['Details', 'Schedule', 'Comments']

export default class OperationModal extends React.Component {
  static propTypes = {
    user: PropTypes.object.isRequired,
    building: PropTypes.object.isRequired,
    onClose: PropTypes.func.isRequired,
    modalView: PropTypes.oneOf([
      'viewOperation',
      'addOperation',
      'editOperation'
    ]),
    operation: PropTypes.object
  }

  UNSAFE_componentWillMount() {
    const initialTabs = ['Details']
    this.setState({
      sections: TABS.map(tab => {
        return {
          name: tab,
          active:
            this.props.modalView !== 'addOperation' || initialTabs.includes(tab)
        }
      })
    })
  }

  handleSelect = () => {
    this.setState({
      sections: this.state.sections.map(section => ({
        ...section,
        active: true
      }))
    })
  }

  render() {
    const { user, modalView, onClose, operation } = this.props
    const { sections } = this.state
    const activeTabs = sections
      .filter(section => section.active === true)
      .map(activeSection => activeSection.name)

    let headerText
    switch (modalView) {
      case 'viewOperation':
        headerText = 'View Schedule'
        break
      case 'addOperation':
        headerText = 'Add Schedule'
        break
      case 'editOperation':
        headerText = 'Edit Schedule'
        break
    }
    const description =
      operation && operation.createdByUserId
        ? `Author: ${operation.createdByUserId.name}`
        : ''
    return (
      <Modal
        tabs={activeTabs}
        subheadline={headerText}
        description={description}
        onClose={onClose}
      >
        <OperationForm
          {...this.props}
          mode={modalView}
          onSelect={this.handleSelect}
        />
      </Modal>
    )
  }
}
