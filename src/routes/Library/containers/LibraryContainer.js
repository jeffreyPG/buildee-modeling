import { connect } from 'react-redux'
import { push } from 'react-router-redux'
import { getMeasures } from '../modules/library'
import { Library } from 'components/Library'
import {
  uploadProjectImage,
  createOrganizationProject,
  getUserById,
  editOrganizationProject,
  getOrganizationName,
  getOrganizationProjects,
  deleteOrganizationProject,
  getProjectPackages
} from '../../Building/modules/building'

const mapDispatchToProps = {
  getMeasures,
  createOrganizationProject,
  editOrganizationProject,
  getUserById,
  getOrganizationName,
  getOrganizationProjects,
  deleteOrganizationProject,
  uploadProjectImage,
  getProjectPackages
}

const mapStateToProps = state => ({
  user: state.login.user || {}
})

export default connect(mapStateToProps, mapDispatchToProps)(Library)
