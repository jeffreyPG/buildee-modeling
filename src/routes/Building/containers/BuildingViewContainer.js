import { connect } from 'react-redux'
import { push } from 'react-router-redux'
import {
  getBuilding,
  editBuilding,
  allBuildingsLink,
  createUtilities,
  deleteUtility,
  getUtilities,
  getEndUse,
  getBuildingEquipment,
  getPublicAssets,
  getEquipment,
  updateAsset,
  deleteEquipment,
  getEndUseUtil,
  editUtility,
  getBenchmark,
  getBenchmarkUtil,
  getProjectsAndMeasures,
  evaluateProject,
  bulkAddProjects,
  bulkEvaluateProjects,
  createOrganizationProject,
  editOrganizationProject,
  getOrganizationProjects,
  deleteOrganizationProject,
  addIncompleteProject,
  deleteProject,
  changeFirebaseAudit,
  getEaComponent,
  uploadProjectImage,
  getBuildingIdentifiers,
  getOrganizationName,
  getUserById,
  getWeather,
  getChangePointAnalysis,
  getEaMeasures,
  updateBuildingTab,
  updateProjectViewTab,
  getProjectPackages,
  deleteProjectPackage,
  addIncompletePackageProject,
  deleteMeasurePackage,
  archiveBuilding,
  deleteBulkMeasureForProject,
  getBuildingRate,
  getProposals,
  deleteProposal
} from '../modules/building'

import {
  getOrganizations,
  getOrganizationBuildings,
  getOrganizationTemplates,
  getAllOrganizationTemplates,
  getOrganizationSpreadsheetTemplates
} from '../../Organization/modules/organization'

import {
  pmImportUpdate,
  pmExportUpdate
} from '../../Portfolio/modules/portfolio'

import { clearDocuSignStore } from '../../DocuSign/modules/docuSign'

import { getMeasures } from '../../Library/modules/library'

import { BuildingView } from 'components/Building'

const mapDispatchToProps = {
  getProjectsAndMeasures,
  evaluateProject,
  allBuildingsLink,
  getOrganizationBuildings,
  createOrganizationProject,
  editOrganizationProject,
  getOrganizationProjects,
  deleteOrganizationProject,
  addIncompleteProject,
  deleteProject,
  push,
  getBuilding,
  editBuilding,
  createUtilities,
  deleteUtility,
  getUtilities,
  getEndUse,
  getBuildingEquipment,
  getPublicAssets,
  getEquipment,
  updateAsset,
  deleteEquipment,
  getEndUseUtil,
  editUtility,
  getOrganizationTemplates,
  getAllOrganizationTemplates,
  getOrganizationSpreadsheetTemplates,
  getBenchmark,
  getBenchmarkUtil,
  getEaComponent,
  changeFirebaseAudit,
  bulkAddProjects,
  bulkEvaluateProjects,
  getOrganizationName,
  getEaMeasures,
  getWeather,
  getBuildingIdentifiers,
  getUserById,
  getChangePointAnalysis,
  getOrganizations,
  uploadProjectImage,
  pmImportUpdate,
  pmExportUpdate,
  updateBuildingTab,
  updateProjectViewTab,
  getProjectPackages,
  getMeasures,
  deleteProjectPackage,
  addIncompletePackageProject,
  deleteMeasurePackage,
  archiveBuilding,
  deleteBulkMeasureForProject,
  getBuildingRate,
  getProposals,
  deleteProposal,
  clearDocuSignStore
}

const mapStateToProps = state => ({
  organization: state.organization.organizationView || {},
  building: state.building.buildingView || {},
  buildingList: state.building.buildingList || {},
  user: state.login.user || {},
  selectedView: state.building.selectedView || { name: 'Overview' },
  selectedProjectView: state.building.selectedProjectView || {
    name: 'Measures'
  },
  manageAllOrgSelected: state.organization.manageAllOrgSelected || false
})

export default connect(mapStateToProps, mapDispatchToProps)(BuildingView)
