import { connect } from 'react-redux'
import { push } from 'react-router-redux'
import {
  getOrganizations,
  getOrganization,
  getOrganizationUsers,
  addOrganizationUser,
  removeOrganizationUser,
  uploadOrganizationImage,
  updateOrganizationUser,
  updateOrganization
} from '../modules/organization'
import { OrganizationManage } from 'components/Organization'

const mapDispatchToProps = {
  push,
  getOrganizations,
  getOrganizations,
  getOrganization,
  getOrganizationUsers,
  addOrganizationUser,
  removeOrganizationUser,
  uploadOrganizationImage,
  updateOrganizationUser,
  updateOrganization
}

const mapStateToProps = state => ({
  user: state.login.user || {},
  organizationView: state.organization.organizationView || {},
  organizationList: state.organization.organizationList || [],
  manageAllOrgSelected: state.organization.manageAllOrgSelected || false
})

export default connect(mapStateToProps, mapDispatchToProps)(OrganizationManage)
