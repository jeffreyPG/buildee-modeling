import { connect } from 'react-redux'
import { push } from 'react-router-redux'
import {
  clearInfo,
  deleteBuilding,
  archiveBuilding,
  createBuildingFromEA,
  updateUserIds,
  getEaBuildings,
  gotEaBuildings,
  updateBuildingListStatus,
  updateBuildingTab,
  updateProjectViewTab,
  updateBuildingViewMode,
  createSampleBuilding
} from '../modules/building'
import {
  getOrganizationBuildings,
  updateOrganization
} from '../../Organization/modules/organization'
import { Building } from 'components/Building'

const mapDispatchToProps = {
  push,
  getOrganizationBuildings,
  updateOrganization,
  clearInfo,
  deleteBuilding,
  archiveBuilding,
  createBuildingFromEA,
  updateUserIds,
  getEaBuildings,
  gotEaBuildings,
  updateBuildingListStatus,
  updateBuildingTab,
  updateProjectViewTab,
  updateBuildingViewMode,
  createSampleBuilding
}

const mapStateToProps = state => ({
  user: state.login.user || {},
  building: state.building || {},
  organization: state.organization.organizationView || {}
})

export default connect(mapStateToProps, mapDispatchToProps)(Building)
