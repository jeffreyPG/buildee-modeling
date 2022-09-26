import { connect } from 'react-redux'
import { push } from 'react-router-redux'
import { clearData } from '../../Template/modules/template'
import { getOrganizationSpreadsheetTemplates } from '../../Organization/modules/organization'
import { Spreadsheet } from '../../../components/Template/Spreadsheet'

const mapDispatchToProps = {
  push,
  clearData,
  getOrganizationSpreadsheetTemplates
}
const mapStateToProps = state => ({
  user: state.login.user || {},
  templateList: state.template.templateList || []
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Spreadsheet)
