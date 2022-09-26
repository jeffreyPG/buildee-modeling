import { connect } from 'react-redux'
import { push } from 'react-router-redux'
import { getOrgProposalTemplates, clearData } from '../modules/proposalTemplate'

import { ProposalTemplateEdit } from 'components/ProposalTemplate'

const mapDispatchToProps = {
  push,
  clearData,
  getOrganizationTemplates: getOrgProposalTemplates
}

const mapStateToProps = state => ({
  user: state.login.user || {},
  templateList: state.proposalTemplate.templateList || [],
  organizationView: state.organization.organizationView || {}
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ProposalTemplateEdit)
