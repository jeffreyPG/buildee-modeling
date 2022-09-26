import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import Modal from '../../components/UI/Modal'
import EquipmentForm from '../Form/EquipmentForms/EquipmentForm'

const TABS = [
  'Details',
  // 'Operation',
  'Quantity',
  'Location',
  'Comments',
  'Images'
  // 'Projects'
]

const getHeaderText = view => {
  return { addEquipment: 'Add Equipment', editEquipment: 'Edit Equipment' }[
    view
  ]
}

export class EquipmentModal extends React.Component {
  static propTypes = {
    user: PropTypes.object.isRequired,
    building: PropTypes.object.isRequired,
    organization: PropTypes.object.isRequired,
    modalView: PropTypes.oneOf([
      'addEquipment',
      'editEquipment',
      'copyEquipment'
    ]).isRequired,
    user: PropTypes.object.isRequired,
    onClose: PropTypes.func.isRequired
  }

  UNSAFE_componentWillMount() {
    const initialTabs = ['Details']
    this.setState({
      currentStepIndex:
        this.props.modalView === 'editEquipment' ||
        this.props.modalView === 'copyEquipment'
          ? 1
          : 0,
      sections: TABS.map(tab => {
        return {
          name: tab,
          active:
            this.props.modalView === 'editEquipment' ||
            this.props.modalView === 'copyEquipment' ||
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
      })),
      currentStepIndex: 1
    })
  }

  render() {
    const { modalView, user, onClose, buildingEquipment } = this.props
    const { sections, currentStepIndex } = this.state
    const activeTabs = sections
      .filter(section => section.active === true)
      .map(activeSection => activeSection.name)
    const createdUserEmail = buildingEquipment?.createdByUser?.name
    return (
      <Modal
        tabs={activeTabs}
        subheadline={getHeaderText(modalView)}
        description={createdUserEmail ? `Author: ${createdUserEmail}` : ''}
        onClose={onClose}
        steps={['Select Equipment', 'Equipment Details']}
        currentStepIndex={currentStepIndex}
      >
        <EquipmentForm
          {...this.props}
          mode={modalView}
          onSelect={this.handleSelect}
        />
      </Modal>
    )
  }
}
const mapStateToProps = state => ({
  user: (state.login && state.login.user) || {},
  building: (state.building && state.building.buildingView) || {},
  organization:
    (state.organization && state.organization.organizationView) || {}
})

const mapDispatchToProps = {}

export default connect(mapStateToProps, mapDispatchToProps)(EquipmentModal)
