import { connect } from 'react-redux'
import { push } from 'react-router-redux'
import { clearInfo, create } from '../modules/building'

import { BuildingNew } from 'components/Building'

const mapDispatchToProps = {
  push,
  create,
  clearInfo
}

const mapStateToProps = state => ({
  building: state.building || {},
  organizationView: state.organization.organizationView || {},
  organizationList: state.organization.organizationList || [],
  manageAllOrgSelected: state.organization.manageAllOrgSelected || false
})

export default connect(mapStateToProps, mapDispatchToProps)(BuildingNew)
