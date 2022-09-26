import React from 'react'
import PropTypes from 'prop-types'
import styles from './Template.scss'
import buildingStyles from '../Building/BuildingViewHeader.scss'
import { TemplateMessage } from './'
import { ExcelEditor } from './TemplateComponent/ExcelEditor'
import { withRouter } from 'react-router'
import classNames from 'classnames'

export class SpreadsheetCreate extends React.Component {
  static propTypes = {
    clearData: PropTypes.func.isRequired,
    nameTemplate: PropTypes.func.isRequired,
    addStyledReport: PropTypes.func.isRequired,
    push: PropTypes.func.isRequired,
    saveSpreadsheetTemplate: PropTypes.func.isRequired,
    templateView: PropTypes.object.isRequired,
    organizationView: PropTypes.object.isRequired,
    proUser: PropTypes.bool.isRequired,
    updateTemplateType: PropTypes.func.isRequired
  }

  state = {
    initialTemplateView: {},
    dirty: false,
    showConfirmModal: false,
    nextLocation: {}
  }

  componentWillUnmount = () => {
    this.props.clearData()
    this.props.updateTemplateType('')
  }

  UNSAFE_componentWillMount() {
    this.props.clearData()
    const { routeParams } = this.props
    let { type = '' } = routeParams
    this.props.updateTemplateType(type)
    if (type) this.props.push(`/spreadsheet/create/${type}`)
    else this.props.push('/spreadsheet/create')
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
      this.props.updateTemplateType('')
      // User has confirmed. Navigate away
      return true
    })
  }

  handleTemplateUpdated = bool => {
    this.setState({ dirty: bool })
  }

  handleOnCancel() {
    this.setState({ showConfirmModal: false })
  }
  handleClick = value => {
    this.props.push(`/spreadsheet/create/${value}`)
    this.props.updateTemplateType(value)
  }

  handleOnConfirm() {
    this.setState(
      { dirty: false, showConfirmModal: true },
      function() {
        this.props.router.push(this.state.nextLocation)
      }.bind(this)
    )
  }

  render() {
    const { templateView, nameTemplate } = this.props
    return (
      <div className={styles.template}>
        {this.state.showConfirmModal && (
          <TemplateMessage
            message="You have unsaved changes. Are you sure you want to leave?"
            onCancel={this.handleOnCancel.bind(this)}
            onConfirm={this.handleOnConfirm.bind(this)}
          />
        )}
        {this.props.typeTemplate === '' && (
          <div
            className={classNames(
              buildingStyles.buildingHeader,
              styles.spreadSheetHeader
            )}
          >
            <div className={buildingStyles.container}>
              <div
                className={classNames(buildingStyles.buildingHeaderBack)}
                onClick={() => {
                  this.props.push('/spreadsheet/templatelist')
                }}
              >
                <i className="material-icons">arrow_back</i>
                Back to template list
              </div>
              <div className={buildingStyles.wrap}>
                <h2>Create Spreadsheet Template</h2>
              </div>
            </div>
          </div>
        )}
        {this.props.typeTemplate === '' ? (
          <div className={buildingStyles.container}>
            <h3 className={styles.templateTypeLabel}>Choose a Template Type</h3>
            <div className={styles.boxedContent}>
              <div className={styles.boxed}>
                <span className={styles.contentTitle}>Building Report</span>
                <br />
                <span className={styles.content}>
                  Design a template to export property, utility and asset data.
                </span>
                <br />
                <button
                  id="select-btn"
                  name="select-btn"
                  className={classNames(styles.button, styles.buttonPrimary)}
                  onClick={() => this.handleClick('building')}
                >
                  {' '}
                  Select
                </button>
              </div>
              <div className={styles.boxed}>
                <span className={styles.contentTitle}>Measure Report</span>
                <br />
                <span className={styles.content}>
                  Design a template to export measure data.
                </span>
                <br />
                <button
                  className={classNames(styles.button, styles.buttonPrimary)}
                  onClick={() => this.handleClick('project')}
                >
                  {' '}
                  Select
                </button>
              </div>
            </div>
          </div>
        ) : (
          <ExcelEditor
            nameTemplate={nameTemplate}
            saveSpreadsheetTemplate={this.props.saveSpreadsheetTemplate}
            templateView={templateView}
            handleTemplateUpdated={this.handleTemplateUpdated}
            proUser={this.props.proUser}
            typeTemplate={this.props.typeTemplate}
            templateId={this.props.templateId}
            editMode={false}
            push={this.props.push}
          />
        )}
      </div>
    )
  }
}

export default withRouter(SpreadsheetCreate)
