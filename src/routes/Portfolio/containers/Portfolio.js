import { connect } from 'react-redux'
import { push } from 'react-router-redux'
import {} from '../modules/portfolio'
import {
  clearInfo,
  deleteBuilding,
  archiveBuilding,
  createBuildingFromEA,
  updateUserIds,
  getEaBuildings,
  gotEaBuildings
} from '../../Building/modules/building'
import { updateOrganization } from '../../Organization/modules/organization'
import { PortfolioContainer } from 'components/Portfolio'

const mapDispatchToProps = {
  push,
  clearInfo,
  deleteBuilding,
  archiveBuilding,
  createBuildingFromEA,
  updateUserIds,
  getEaBuildings,
  gotEaBuildings,
  updateOrganization
}

const mapStateToProps = state => ({
  user: state.login.user || {},
  connectedAccounts: state.portfolio.connectedAccounts || [],
  organizationView: state.organization.organizationView || {},
  manageAllOrgSelected: state.organization.manageAllOrgSelected || false
})

export default connect(mapStateToProps, mapDispatchToProps)(PortfolioContainer)
