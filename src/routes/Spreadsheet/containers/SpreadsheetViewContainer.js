import { connect } from 'react-redux'
import { push } from 'react-router-redux'

import {
  clearData,
  deleteTemplate,
  getSpreadSheetTemplate,
  nameTemplate,
  addStyledReport,
  updateTemplate
} from '../../Spreadsheet/modules/spreadsheet'

import { SpreadsheetView } from '../../../components/Template/SpreadsheetView'

const mapDispatchToProps = {
  clearData,
  deleteTemplate,
  getSpreadSheetTemplate,
  nameTemplate,
  addStyledReport,
  push,
  updateTemplate
}

const mapStateToProps = state => ({
  templateView: state.spreadsheet.templateView || {},
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
)(SpreadsheetView)
