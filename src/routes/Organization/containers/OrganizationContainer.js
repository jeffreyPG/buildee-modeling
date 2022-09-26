import { connect } from 'react-redux'
import { push } from 'react-router-redux'
import { getOrganizations } from '../modules/organization'
import { Dashboard } from 'components/Organization'

const mapDispatchToProps = {
  push,
  getOrganizations
}

const mapStateToProps = state => ({
  user: state.login.user || {},
  organizationList: state.organization.organizationList || []
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Dashboard)
