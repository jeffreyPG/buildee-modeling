import React from 'react'
import PropTypes from 'prop-types'
import styles from './Template.scss'
import { TemplateMessage } from './'
import { ExcelEditor } from './TemplateComponent/ExcelEditor'
import { withRouter } from 'react-router'

export class SpreadsheetView extends React.Component {
  static propTypes = {
    clearData: PropTypes.func.isRequired,
    deleteTemplate: PropTypes.func.isRequired,
    getSpreadSheetTemplate: PropTypes.func.isRequired,
    nameTemplate: PropTypes.func.isRequired,
    addStyledReport: PropTypes.func.isRequired,
    push: PropTypes.func.isRequired,
    templateView: PropTypes.object.isRequired,
    organizationView: PropTypes.object.isRequired,
    updateTemplate: PropTypes.func.isRequired,
    proUser: PropTypes.bool.isRequired
  }

  state = {
    dirty: false,
    showConfirmModal: false,
    nextLocation: {},
    tempId: ''
  }

  componentWillUnmount = () => {
    this.props.clearData()
  }

  componentDidMount = () => {
    this.props.getSpreadSheetTemplate(this.props.params.templateId)
  }

  UNSAFE_componentWillReceiveProps = () => {
    this.props.router.setRouteLeaveHook(this.props.route, nextLocation => {
      if (this.state.dirty) {
        this.setState({
          showConfirmModal: true,
          nextLocation: nextLocation
        })
        // Cancel route change
        return false
      }
      // User has confirmed. Navigate away
      return true
    })
    if (
      this.props.templateView._id != '' ||
      this.props.templateView._id != undefined
    ) {
      this.setState({ tempId: this.props.templateView._id })
    }
  }
  handleTemplateUpdated = bool => {
    this.setState({ dirty: bool })
  }

  handleOnCancel = () => {
    this.setState({ showConfirmModal: false })
  }

  handleOnConfirm = () => {
    this.setState(
      { dirty: false, showConfirmModal: true },
      function() {
        this.props.router.push(this.state.nextLocation)
      }.bind(this)
    )
  }

  render() {
    const {
      deleteTemplate,
      nameTemplate,
      addStyledReport,
      params,
      saveSpreadsheetTemplate,
      templateView,
      updateTemplate
    } = this.props
    return (
      <div className={styles.template}>
        {this.state.showConfirmModal && (
          <TemplateMessage
            message="You have unsaved changes. Are you sure you want to leave?"
            onCancel={this.handleOnCancel.bind(this)}
            onConfirm={this.handleOnConfirm.bind(this)}
          />
        )}
        {this.props.templateView._id && (
          <ExcelEditor
            deleteTemplate={deleteTemplate}
            nameTemplate={nameTemplate}
            addStyledReport={addStyledReport}
            saveSpreadsheetTemplate={saveSpreadsheetTemplate}
            templateId={params.templateId}
            templateView={templateView}
            updateTemplate={updateTemplate}
            handleTemplateUpdated={this.handleTemplateUpdated}
            proUser={this.props.proUser}
            editMode={true}
            typeTemplate={
              templateView.sheets._id
                ? templateView.type
                : this.state.typeTemplate
            }
            getSpreadSheetTemplate={this.props.getSpreadSheetTemplate}
            typeTemplate={templateView.type}
            push={this.props.push}
          />
        )}
      </div>
    )
  }
}

export default withRouter(SpreadsheetView)
