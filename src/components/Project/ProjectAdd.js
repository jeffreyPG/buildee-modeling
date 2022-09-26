import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { replaceHTMLEntities } from './ProjectHelpers'
import styles from './ProjectAdd.scss'
import { ProjectForm } from '../../containers/Form/ProjectForms'

export class ProjectAdd extends React.Component {
  static propTypes = {
    zipCode: PropTypes.string.isRequired,
    currentProject: PropTypes.object.isRequired,
    projectType: PropTypes.string.isRequired,
    handleSubmission: PropTypes.func.isRequired,
    eaAudit: PropTypes.object.isRequired,
    projects: PropTypes.array.isRequired,
    handleGoBack: PropTypes.func.isRequired,
    handleCloseAddProjects: PropTypes.func.isRequired,
    uploadProjectImage: PropTypes.func.isRequired,
    handleOpenImageModal: PropTypes.func.isRequired,
    handleCloseImageModal: PropTypes.func.isRequired,
    viewingImage: PropTypes.bool.isRequired,
    currentView: PropTypes.string.isRequired,
    isSubmitting: PropTypes.bool.isRequired,
    getUserById: PropTypes.func.isRequired,
    getOrganizationName: PropTypes.func.isRequired,
    errorRunningProject: PropTypes.bool.isRequired,
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
      'add',
      this.props.currentProject.dataAlreadyFromEA
        ? 'measure'
        : this.props.projectType
    )
  }

  submitFunctionV2 = (formValues, options) => {
    this.props.handleSubmissionV2(formValues, 'add', options)
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
    let title = categories.join(' > ')

    return (
      <div className={styles.projectAdd}>
        <div id="scrollLine" className={styles.scrollLine} />
        <div className={styles.projectAddHeader}>
          <div className={styles.container}>
            <h2>
              Add {replaceHTMLEntities(this.props.currentProject.displayName)}
            </h2>
            <div className={styles.info}>
              {title && <p>{title}</p>}
              {this.state.projectAuthor && (
                <p>Author: {this.state.projectAuthor}</p>
              )}
              {createDate && <p>Created: {createDate}</p>}
              {updateDate && <p>Updated: {updateDate}</p>}
            </div>
          </div>
        </div>

        <ProjectForm
          zipCode={this.props.zipCode}
          currentProject={this.props.currentProject}
          submitFunction={this.submitFunction}
          submitFunctionV2={this.submitFunctionV2}
          eaAudit={this.props.eaAudit}
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

export default ProjectAdd
