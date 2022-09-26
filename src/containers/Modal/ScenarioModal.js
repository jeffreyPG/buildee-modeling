import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import projectStyles from './ProjectsModal.scss'
import styles from './ScenarioModal.scss'
import ScenarioForm from '../Form/ScenarioForms/ScenarioForm'

export default class ScenarioModal extends React.Component {
  static propTypes = {
    user: PropTypes.object.isRequired,
    onClose: PropTypes.func.isRequired,
    modalView: PropTypes.oneOf(['addScenario', 'editScenario']),
    useData: PropTypes.bool,
    scenario: PropTypes.object
  }

  render() {
    const { user, modalView, onClose } = this.props

    let headerText
    switch (modalView) {
      case 'viewScenario':
        headerText = 'View Scenario'
        break
      case 'addScenario':
        headerText = 'Add Scenario'
        break
      case 'editScenario':
        headerText = 'Edit Scenario'
        break
    }
    let description = `Author: ${user.email}`
    return (
      <div
        data-test="projects-modal"
        className={classNames(projectStyles.projectsModal)}
      >
        <div
          className={classNames(
            projectStyles.projectsModalHeader,
            styles.modalHeader
          )}
        >
          <div className={projectStyles.projectsModalTitle}>
            <div className={projectStyles.container}>
              <h3>Scenario Details</h3>
              <div
                className={projectStyles.projectsModalClose}
                onClick={this.props.onClose}
              >
                <i className="material-icons">close</i>
              </div>
            </div>
          </div>
          <div className={styles.detail}>
            <div className={styles.container}>
              <h3>{headerText}</h3>
              <span>{description}</span>
            </div>
          </div>
        </div>
        <ScenarioForm {...this.props} mode={modalView} />
      </div>
    )
  }
}
