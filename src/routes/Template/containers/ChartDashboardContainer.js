import { connect } from 'react-redux'
import { push } from 'react-router-redux'

import {
  clearData,
  nameTemplate,
  addStyledReport,
  saveTemplate
} from '../../Template/modules/template'

import { ChartDashboard } from '../../../components/Template/ChartDashboard'

const mapDispatchToProps = {
  clearData,
  nameTemplate,
  addStyledReport,
  push,
  saveTemplate
}

const mapStateToProps = state => ({
  templateView: state.template.templateView || {},
  organizationView: state.organization.organizationView || {},
  proUser: Boolean(
    state.login.user &&
      state.login.user.firebaseRefs.orgId &&
      state.login.user.firebaseRefs.userId
  )
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ChartDashboard)
