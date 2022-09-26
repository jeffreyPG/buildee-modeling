import React from 'react'
import PropTypes from 'prop-types'
import { replaceHTMLEntities } from './ProjectHelpers'
import { ProjectForm } from '../../containers/Form/ProjectForms'
import styles from './ProjectEdit.scss'

export class ProjectEdit extends React.Component {
  static propTypes = {
    currentProject: PropTypes.object.isRequired,
    projectType: PropTypes.string.isRequired,
    handleSubmission: PropTypes.func.isRequired,
    eaAudit: PropTypes.object.isRequired,
    projects: PropTypes.array.isRequired,
    handleGoBack: PropTypes.func.isRequired,
    handleCloseAddProjects: PropTypes.func,
    uploadProjectImage: PropTypes.func.isRequired,
    handleOpenImageModal: PropTypes.func.isRequired,
    handleCloseImageModal: PropTypes.func.isRequired,
    viewingImage: PropTypes.bool.isRequired,
    currentView: PropTypes.string.isRequired,
    isSubmitting: PropTypes.bool.isRequired,
    getOrganizationName: PropTypes.func.isRequired,
    errorRunningProject: PropTypes.bool.isRequired,
    library: PropTypes.bool,
    getProjectPackages: PropTypes.func.isRequired
  }

  state = {
    projectAuthor: ''
  }

  componentDidMount = () => {
    document.getElementById('scrollLine').scrollIntoView()

    if (this.props.projectType === 'project') {
      this.handleGetProjectAuthor()
    } else if (this.props.projectType === 'measure') {
      this.handleGetProjectOrganization()
    }
  }

  componentDidUpdate = prevProps => {
    if (prevProps.projectType !== this.props.projectType) {
      if (this.props.projectType === 'project') {
        this.handleGetProjectAuthor()
      } else if (this.props.projectType === 'measure') {
        this.handleGetProjectOrganization()
      }
    }
  }

  handleGetProjectAuthor = () => {
    if (this.props.currentProject.createdByUserId) {
      this.props
        .getUserById(this.props.currentProject.createdByUserId)
        .then(user => {
          this.setState({ projectAuthor: user.username })
        })
        .catch(() => {})
    }
  }

  handleGetProjectOrganization = () => {
    this.props
      .getOrganizationName()
      .then(org => {
        this.setState({ projectAuthor: org.name })
      })
      .catch(() => {})
  }

  submitFunction = (formValues, completeBool) => {
    this.props.handleSubmission(
      formValues,
      completeBool,
      'edit',
      this.props.projectType
    )
  }

  submitFunctionV2 = (formValues, options) => {
    this.props.handleSubmissionV2(formValues, 'edit', options)
  }

  render() {
    let { currentProject } = this.props
    let createDate = currentProject.created
      ? new Date(currentProject.created).toLocaleDateString('en-US')
      : ''
    let updateDate = currentProject.updated
      ? new Date(currentProject.updated).toLocaleDateString('en-US')
      : ''
    let categories = [
      this.props.currentProject.project_category,
      this.props.currentProject.project_application,
      this.props.currentProject.project_technology
    ]
    categories = categories.filter(item => !!item)
    const title = categories.join(' > ')
    let code =
      (this.props.currentProject &&
        this.props.currentProject.initialValues &&
        this.props.currentProject.initialValues.rebate) ||
      null
    if (code === 'Select an option') code = null

    return (
      <div className={styles.projectEdit}>
        <div id="scrollLine" className={styles.scrollLine} />
        <div className={styles.projectEditHeader}>
          <div className={styles.container}>
            <h2>
              Edit {replaceHTMLEntities(this.props.currentProject.displayName)}
            </h2>
            <div className={styles.info}>
              {title && <p>{title}</p>}
              {code && <p>Code: {code}</p>}
              {this.state.projectAuthor && (
                <p>Author: {this.state.projectAuthor}</p>
              )}
              {createDate && <p>Created: {createDate}</p>}
              {updateDate && <p>Updated: {updateDate}</p>}
            </div>
          </div>
        </div>

        <ProjectForm
          currentProject={this.props.currentProject}
          submitFunction={this.submitFunction}
          submitFunctionV2={this.submitFunctionV2}
          eaAudit={this.props.eaAudit}
          library={this.props.library}
          projects={this.props.projects}
          handleGoBack={this.props.handleGoBack}
          handleCloseAddProjects={this.props.handleCloseAddProjects}
          uploadProjectImage={this.props.uploadProjectImage}
          handleOpenImageModal={this.props.handleOpenImageModal}
          handleCloseImageModal={this.props.handleCloseImageModal}
          viewingImage={this.props.viewingImage}
          currentView={this.props.currentView}
          isSubmitting={this.props.isSubmitting}
          errorRunningProject={this.props.errorRunningProject}
          building={this.props.building}
          endUse={this.props.endUse}
          utilityMetrics={this.props.utilityMetrics}
          buildingEquipment={this.props.buildingEquipment}
          getProjectPackages={this.props.getProjectPackages}
          deleteProject={this.props.deleteProject}
          operations={this.props.operations}
        />
      </div>
    )
  }
}

export default ProjectEdit
