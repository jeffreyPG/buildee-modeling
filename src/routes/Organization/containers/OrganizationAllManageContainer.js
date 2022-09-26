import { connect } from 'react-redux'
import { push } from 'react-router-redux'
import { getOrganizations } from '../modules/organization'
import OrganizationAllManage from 'components/Organization/OrganizationAllManage'

const mapDispatchToProps = {
  push,
  getOrganizations
}

const mapStateToProps = state => ({})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(OrganizationAllManage)
