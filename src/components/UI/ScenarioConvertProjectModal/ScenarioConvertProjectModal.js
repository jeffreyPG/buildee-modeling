import React, { Component } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { connect } from 'react-redux'
import { Loader } from 'utils/Loader'
import styles from './ScenarioConvertProjectModal.scss'
import { convertScenarioToProject } from '../../../routes/Portfolio/modules/portfolio'

class ScenarioConvertProjectModal extends Component {
  static propTypes = {
    onClose: PropTypes.func.isRequired,
    scenario: PropTypes.object.isRequired
  }

  state = {
    converting: false
  }

  handleConvert = () => {
    this.setState({ converting: true })
    this.props
      .convertScenarioToProject(this.props.scenario._id)
      .then(() => {
        this.setState({ converting: false })
        this.props.onClose()
      })
      .catch(error => {
        console.log(error)
        this.setState({ converting: false })
      })
  }

  render() {
    const { converting } = this.state

    return (
      <div className={styles.modal}>
        <div className={styles.modalInner}>
          <div className={styles.modalHeading}>
            <h2>Convert to Project</h2>
            <div className={styles.modalClose} onClick={this.props.onClose}>
              <i className="material-icons">close</i>
            </div>
          </div>
          <span>
            This will convert your scenario into a project and corresponding
            measure within each of the included buildings. Your scenario will be
            removed in the process. This cannot be undone.
          </span>
          <div className={styles.modalFooter}>
            <button
              className={classNames(styles.button, styles.buttonSecondary, {
                [styles.buttonDisable]: converting
              })}
              onClick={this.props.onClose}
            >
              Cancel
            </button>
            <button
              className={classNames(styles.button, styles.buttonPrimary)}
              onClick={this.handleConvert}
            >
              {converting ? <Loader size="button" color="white" /> : 'Convert'}
            </button>
          </div>
        </div>
      </div>
    )
  }
}

const mapDispatchToProps = {
  convertScenarioToProject
}

const mapStateToProps = state => ({})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ScenarioConvertProjectModal)
