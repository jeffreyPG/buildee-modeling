import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { withRouter } from 'react-router'
import { push } from 'react-router-redux'
import styles from './Template.scss'
import { TemplateMessage } from './'
import { Editor } from './TemplateComponent'
import { clearData, templateUpdated } from 'routes/Template/modules/template'

export class TemplateCreate extends React.Component {
  static propTypes = {
    clearData: PropTypes.func.isRequired,
    push: PropTypes.func.isRequired,
    organizationView: PropTypes.object.isRequired
  }

  state = {
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

  handleOnCancel() {
    this.setState({ showConfirmModal: false })
  }

  handleOnConfirm() {
    this.props.templateUpdated(false).then(() => {
      this.setState(
        { showConfirmModal: true },
        function() {
          this.props.router.push(this.state.nextLocation)
        }.bind(this)
      )
    })
  }

  render() {
    return (
      <div className={styles.template}>
        {this.state.showConfirmModal && (
          <TemplateMessage
            message="You have unsaved changes. Are you sure you want to leave?"
            onCancel={this.handleOnCancel.bind(this)}
            onConfirm={this.handleOnConfirm.bind(this)}
          />
        )}
        <Editor />
      </div>
    )
  }
}

const mapDispatchToProps = {
  clearData,
  templateUpdated,
  push
}

const mapStateToProps = state => ({
  organizationView: state.organization.organizationView || {},
  dirty: state.template.dirty
})

const withConnect = connect(mapStateToProps, mapDispatchToProps)

export default withRouter(withConnect(TemplateCreate))
