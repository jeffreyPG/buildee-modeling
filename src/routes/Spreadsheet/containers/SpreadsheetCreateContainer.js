import { connect } from 'react-redux'
import { push } from 'react-router-redux'
//change this for ss
import {
  clearData,
  nameTemplate,
  addStyledReport,
  saveSpreadsheetTemplate,
  getSpreadSheetTemplate,
  updateTemplateType
} from '../../Spreadsheet/modules/spreadsheet'

import { SpreadsheetCreate } from '../../../components/Template/SpreadsheetCreate'

const mapDispatchToProps = {
  clearData,
  nameTemplate,
  addStyledReport,
  push,
  saveSpreadsheetTemplate,
  getSpreadSheetTemplate,
  updateTemplateType
}

const mapStateToProps = state => ({
  templateView: state.spreadsheet.templateView || {},
  organizationView: state.organization.organizationView || {},
  proUser: Boolean(
    state.login.user &&
      state.login.user.firebaseRefs.orgId &&
      state.login.user.firebaseRefs.userId
  ),
  typeTemplate: state.spreadsheet.typeTemplate || ''
})

export default connect(mapStateToProps, mapDispatchToProps)(SpreadsheetCreate)
