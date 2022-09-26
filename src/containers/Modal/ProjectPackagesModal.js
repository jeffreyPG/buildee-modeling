import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import projectStyles from './ProjectsModal.scss'
import styles from './ScenarioModal.scss'
import { ProjectPackageForm } from '../Form/ProjectForms'

export default class ProjectPackageModal extends React.Component {
  static propTypes = {
    user: PropTypes.object.isRequired,
    onClose: PropTypes.func.isRequired,
    viewMode: PropTypes.oneOf([
      'addProjectPackage',
      'editProjectPackage',
      'createProjectPackagefromProposal'
    ]),
    projectPackage: PropTypes.object
  }

  render() {
    const { user, viewMode, onClose } = this.props

    let headerText, text
    switch (viewMode) {
      case 'viewProject':
        text = 'View Project'
        headerText = 'Project Details'
        break
      case 'addProjectPackage':
        text = 'Add Project'
        headerText = 'New Project'
        break
      case 'editProjectPackage':
        headerText = 'Edit Project'
        text = 'Project Details'
        break
      case 'createProjectPackagefromProposal':
        headerText = 'Create Project from Proposal'
        text = 'Project Details'
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
              <h3>{headerText}</h3>
              <div
                className={projectStyles.projectsModalClose}
                onClick={() => onClose()}
              >
                <i className="material-icons">close</i>
              </div>
            </div>
          </div>
          <div className={styles.detail}>
            <div className={styles.container}>
              <h3>{text}</h3>
              <span>{description}</span>
            </div>
          </div>
        </div>
        <ProjectPackageForm {...this.props} mode={viewMode} />
      </div>
    )
  }
}
