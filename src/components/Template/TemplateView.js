import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { push } from 'react-router-redux'
import styles from './Template.scss'
import { TemplateMessage } from './'
import { Editor } from './TemplateComponent'
import { withRouter } from 'react-router'
import {
  clearData,
  getOrgTemplate,
  templateUpdated
} from 'routes/Template/modules/template'
export class TemplateView extends React.Component {
  static propTypes = {
    clearData: PropTypes.func.isRequired,
    getOrgTemplate: PropTypes.func.isRequired,
    push: PropTypes.func.isRequired
  }

  state = {
    showConfirmModal: false,
    nextLocation: {}
  }

  componentWillUnmount = () => {
    this.props.clearData()
  }

  componentDidMount = () => {
    const { location } = this.props
    const orgId = location.state?.orgId
    this.props.getOrgTemplate(this.props.params.templateId, orgId)
  }

  UNSAFE_componentWillReceiveProps = () => {
    this.props.router.setRouteLeaveHook(this.props.route, nextLocation => {
      if (this.props.dirty) {
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

  handleOnCancel = () => {
    this.setState({ showConfirmModal: false })
  }

  handleOnConfirm = () => {
    this.props.templateUpdated(false)
    this.setState(
      { showConfirmModal: true },
      function() {
        this.props.router.push(this.state.nextLocation)
      }.bind(this)
    )
  }

  render() {
    const { params, location } = this.props
    const orgId = location.state?.orgId
    return (
      <div className={styles.template}>
        {this.state.showConfirmModal && (
          <TemplateMessage
            message="You have unsaved changes. Are you sure you want to leave?"
            onCancel={this.handleOnCancel.bind(this)}
            onConfirm={this.handleOnConfirm.bind(this)}
          />
        )}
        <Editor templateId={params.templateId} orgId={orgId} />
      </div>
    )
  }
}

const mapDispatchToProps = {
  clearData,
  getOrgTemplate,
  push,
  templateUpdated
}

const mapStateToProps = state => ({
  organizationView: state.organization.organizationView || {}
})

const withConnect = connect(mapStateToProps, mapDispatchToProps)

export default withRouter(withConnect(TemplateView))
