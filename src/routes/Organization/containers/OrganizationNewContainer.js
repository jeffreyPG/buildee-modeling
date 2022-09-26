import { connect } from 'react-redux'
import { push } from 'react-router-redux'
import { createOrganization } from '../modules/organization'
import { OrganizationNew } from 'components/Organization'

const mapDispatchToProps = {
  push,
  createOrganization
}

const mapStateToProps = state => ({
  user: state.login.user || {},
  organizationList: state.organization.organizationList || []
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(OrganizationNew)
