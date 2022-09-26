import React from 'react'
import PropTypes from 'prop-types'
import styles from './Template.scss'
import { TemplateMessage } from './'
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
    proUser: PropTypes.bool.isRequired
  }

  state = {
    initialTemplateView: {},
    dirty: false,
    showConfirmModal: false,
    nextLocation: {}
  }

  componentWillUnmount = () => {
    this.props.clearData()
  }

  componentDidMount() {
    this.props.clearData()
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
  }

  handleTemplateUpdated = bool => {
    this.setState({ dirty: bool })
  }

  handleOnCancel() {
    this.setState({ showConfirmModal: false })
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
    const { push } = this.props
    return (
      <div className={styles.template}>
        {this.state.showConfirmModal && (
          <TemplateMessage
            message="You have unsaved changes. Are you sure you want to leave?"
            onCancel={this.handleOnCancel.bind(this)}
            onConfirm={this.handleOnConfirm.bind(this)}
          />
        )}
        <div className={styles.container}>
          <div
            className={styles.templateBack}
            onClick={() => {
              push('/spreadsheet/templatelist')
            }}
          >
            <i className="material-icons">arrow_back</i>
            Back to template list
          </div>
          <div className={styles.templateHeading}>
            <h1>Create Spreadsheet Template</h1>
            <br />
            <h3>Choose a Template Type</h3>
          </div>
          <div className={styles.boxedContent}>
            <div className={styles.boxed}>
              <span className={styles.contentTitle}>Building Report</span>
              <br />
              <span className={styles.content}>
                Design a template to export property, utility and asset data.
              </span>
              <br />
              <button
                className={classNames(styles.button, styles.buttonPrimary)}
              >
                {' '}
                Select
              </button>
            </div>
            <div className={styles.boxed}>
              <span className={styles.contentTitle}>Project Report</span>
              <br />
              <span className={styles.content}>
                Design a template to export project data.
              </span>
              <br />
              <button
                className={classNames(styles.button, styles.buttonPrimary)}
              >
                {' '}
                Select
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default withRouter(SpreadsheetCreate)
