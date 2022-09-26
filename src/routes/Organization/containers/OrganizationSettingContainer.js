import { connect } from 'react-redux'
import { push } from 'react-router-redux'
import {
  getOrganizations,
  getOrganization,
  updateOrganization
} from '../modules/organization'
import { OrganizationSetting } from 'components/Organization'

const mapDispatchToProps = {
  push,
  getOrganizations,
  getOrganization,
  updateOrganization
}

const mapStateToProps = state => ({
  user: state.login.user || {},
  organizationView: state.organization.organizationView || {},
  manageAllOrgSelected: state.organization.manageAllOrgSelected || false
})

export default connect(mapStateToProps, mapDispatchToProps)(OrganizationSetting)
