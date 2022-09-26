import React from 'react'
import PropTypes from 'prop-types'

import Modal from '../../components/UI/Modal'
import ConstructionForm from '../Form/ConstructionForms/ConstructionForm'

const TABS = ['Details', 'Comments', 'Images']

function getCretedUserName(construction = {}) {
  return construction && construction.createdByUserId
    ? construction.createdByUserId.name
    : null
}

export default class ConstructionModal extends React.Component {
  static propTypes = {
    user: PropTypes.object.isRequired,
    building: PropTypes.object.isRequired,
    onClose: PropTypes.func.isRequired,
    modalView: PropTypes.string.isRequired,
    construction: PropTypes.object
  }

  UNSAFE_componentWillMount() {
    const initialTabs = ['Details']
    this.setState({
      sections: TABS.map(tab => {
        return {
          name: tab,
          active:
            this.props.modalView !== 'addConstruction' ||
            initialTabs.includes(tab)
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
    const { modalView, user, onClose } = this.props
    const { sections } = this.state
    const activeTabs = sections
      .filter(section => section.active === true)
      .map(activeSection => activeSection.name)

    let headerText
    switch (modalView) {
      case 'viewConstruction':
        headerText = 'View Construction'
        break
      case 'addConstruction':
        headerText = 'Add Construction'
        break
      case 'copyConstruction':
        headerText = 'Copy Construction'
        break
      case 'editConstruction':
        headerText = 'Edit Construction'
        break
    }
    const createdUser = getCretedUserName(this.props.construction)

    return (
      <Modal
        tabs={activeTabs}
        subheadline={headerText}
        description={createdUser ? `Author: ${createdUser}` : ''}
        onClose={onClose}
      >
        <ConstructionForm
          {...this.props}
          mode={modalView}
          onSelect={this.handleSelect}
        />
      </Modal>
    )
  }
}
