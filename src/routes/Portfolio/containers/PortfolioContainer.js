import { connect } from 'react-redux'
import { push } from 'react-router-redux'
import {
  pmImportUpdate,
  linkToBuildeeBuilding,
  pmExportUpdate,
  pmImport,
  deletePortfolioConnection,
  getPortfolioPropertyList,
  portfolioAddAccount,
  getConnectedAccounts,
  getPortfolioMeterList,
  getPortfolioMeter,
  pmExport
} from '../modules/portfolio'
import { getOrganizationBuildings } from '../../Organization/modules/organization'

import { Portfolio } from 'components/Portfolio'

const mapDispatchToProps = {
  push,
  portfolioAddAccount,
  getConnectedAccounts,
  pmImport,
  getPortfolioPropertyList,
  getPortfolioMeterList,
  getPortfolioMeter,
  deletePortfolioConnection,
  pmImportUpdate,
  pmExportUpdate,
  linkToBuildeeBuilding,
  pmExport,
  getOrganizationBuildings
}

const mapStateToProps = state => ({
  connectedAccounts: state.portfolio.connectedAccounts || [],
  building: state.building || {},
  organizationView: state.organization.organizationView || {},
  manageAllOrgSelected: state.organization.manageAllOrgSelected || false
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Portfolio)
