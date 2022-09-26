import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import styles from './ExistingEquipmentModal.scss'
import Modal from '../../components/UI/Modal'
import EquipmentList from '../../components/Equipment/EquipmentList'

export class ExistingEquipmentModal extends React.Component {
  static propTypes = {
    user: PropTypes.object.isRequired,
    building: PropTypes.object.isRequired,
    organization: PropTypes.object.isRequired,
    onClose: PropTypes.func.isRequired,
    initialCategory: PropTypes.string.isRequired
  }

  handleEquipmentSelected = (type, equipment) => {
    switch (type) {
      case 'addEquipment': {
        this.props.onClose()
        break
      }
      case 'editEquipment': {
        this.props.onClose({ data: equipment })
        break
      }
    }
  }

  render() {
    const { initialCategory, onClose } = this.props

    return (
      <Modal
        subheadline="Add Existing Equipment"
        description=""
        onClose={onClose}
      >
        <div className={styles.equipmentListContainer}>
          <EquipmentList
            building={this.props.building}
            organization={this.props.organization}
            user={this.props.user}
            selectedView="table"
            showActions={false}
            selectedCategory={initialCategory}
            onOpenModal={this.handleEquipmentSelected}
          />
        </div>
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

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ExistingEquipmentModal)
