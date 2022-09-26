import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import LocationForm from '../Form/LocationForms/LocationForm'
import Modal from '../../components/UI/Modal'

const TABS = [
  'Details',
  'Lighting',
  'Heating & Cooling',
  'Heating',
  'Cooling',
  'Air Distribution',
  'Plug Load',
  'Process',
  'Ventilation',
  'Water Heating',
  'Water Use'
]

function getCretedUserName(buildingLocation = {}) {
  return buildingLocation?.location?.createdByUserId?.name || null
}

class LocationModal extends React.Component {
  static propTypes = {
    user: PropTypes.object.isRequired,
    building: PropTypes.object.isRequired,
    buildingLocation: PropTypes.object,
    organization: PropTypes.object.isRequired,
    onClose: PropTypes.func.isRequired,
    modalView: PropTypes.oneOf(['addLocation', 'editLocation']).isRequired,
    initialName: PropTypes.string,
    fromEquipment: PropTypes.bool
  }

  render() {
    const { user, modalView, onClose } = this.props

    let headerText
    switch (modalView) {
      case 'viewLocation':
        headerText = 'View Location'
        break
      case 'addLocation':
        headerText = 'Add Location'
        break
      case 'editLocation':
        headerText = 'Edit Location'
        break
    }
    const createdUser = getCretedUserName(this.props.buildingLocation)
    return (
      <Modal
        tabs={TABS}
        subheadline={headerText}
        description={createdUser ? `Author: ${createdUser}` : ''}
        onClose={onClose}
      >
        <LocationForm {...this.props} mode={modalView} />
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

export default connect(mapStateToProps, mapDispatchToProps)(LocationModal)
