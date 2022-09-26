import { connect } from 'react-redux'
import { push } from 'react-router-redux'

import { clearData } from '../../Template/modules/template'

import {
  getOrganizationTemplates,
  getAllOrganizationTemplates
} from '../../Organization/modules/organization'

import { Template } from 'components/Template'

const mapDispatchToProps = {
  push,
  clearData,
  getOrganizationTemplates,
  getAllOrganizationTemplates
}

const mapStateToProps = state => ({
  user: state.login.user || {},
  templateList: state.template.templateList || [],
  organizationList: state.organization.organizationList || [],
  manageAllOrgSelected: state.organization.manageAllOrgSelected || false
})

export default connect(mapStateToProps, mapDispatchToProps)(Template)
