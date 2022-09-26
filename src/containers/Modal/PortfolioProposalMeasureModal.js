import React from 'react'
import classNames from 'classnames'
import { connect } from 'react-redux'
import { Loader } from '../../utils/Loader'
import styles from './ProjectsModal.scss'
import { replaceHTMLEntities } from '../../components/Project/ProjectHelpers'
import {
  ProjectMeasureListing,
  PackageProjectAdd,
  PackageProjectCopy,
  PackageProjectEdit
} from '../../components/Project'
import { truncateName } from 'utils/Utils'
import { Query } from 'react-apollo'
import { ENABLED_FEATURES } from '../../utils/graphql/queries/user'
import { GET_BUILDING_EQUIPMENT_LIST } from '../../utils/graphql/queries/equipment'

import {
  createOrganizationProject,
  editOrganizationProject,
  getProjectsAndMeasures,
  getOrganizationName,
  getOrganizationProjects,
  deleteOrganizationProject,
  addIncompletePackageProject,
  uploadProjectImage,
  evaluateProject,
  getUserById,
  bulkAddProjects,
  getProjectPackages,
  updateProjectPackage,
  getBuilding
} from '../../routes/Building/modules/building'
import { getProposalMeasure } from '../../routes/Portfolio/modules/portfolio'
import { getMeasures } from '../../routes/Library/modules/library'

const MODAL_OPEN_CLASS = 'bodyModalOpen'

export class PortfolioProposalMeasureModal extends React.Component {
  static propTypes = {}

  state = {
    currentView: 'projectEdit',
    currentProject: {},
    projectType: '',
    inSpecificProject: false,
    isSubmitting: false,
    listedMeasures: [],
    searchValue: '',
    sortValue: '',
    filterValue: '',
    useFilterList: false,
    filterList: '',
    fieldsIsEmpty: false,
    initialValues: {},
    showFields: false,
    viewingImage: false,
    errorRunningProject: false,
    selectedProjects: [],
    loadingBulkProjects: false,
    viewSelectedProjects: false
  }

  componentWillMount() {
    this.props.getProposalMeasure &&
      this.props.getProposalMeasure(this.props.id)

    if (Object.keys(this.props.building).length === 0 || !this.props.building) {
      this.props.getBuilding(this.props.buildingId)
    }
  }

  componentWillUnmount() {
    document.body.classList.remove(MODAL_OPEN_CLASS)
  }

  componentDidMount = () => {
    if (!this.props.library) {
      document.body.classList.add(MODAL_OPEN_CLASS)
    }
  }

  componentWillReceiveProps = nextProps => {
    if (
      JSON.stringify(this.props.currentProject) !==
        JSON.stringify(nextProps.currentProject) &&
      nextProps.currentProject &&
      Object.keys(nextProps.currentProject).length > 0
    ) {
      this.setState({
        currentView: 'projectEdit',
        currentProject: nextProps.currentProject,
        inSpecificProject: true,
        initialValues: nextProps.currentProject.initialValues || {}
      })
    }
  }

  handleOpenProject = (project, action, type) => {
    this.setState({
      currentProject: project,
      currentView: action,
      projectType: type
    })
  }

  handleSelectedProjects = projects => {
    this.setState({ selectedProjects: projects })
  }

  handleOpenSelectedProject = () => {
    this.setState({
      currentProject: this.state.selectedProjects[0].project,
      currentView: this.state.selectedProjects[0].action,
      projectType: this.state.selectedProjects[0].type
    })
  }

  handleBulkAddSelectedProject = () => {
    this.setState({ loadingBulkProjects: true })
    // add incentive values block to each
    this.state.selectedProjects.forEach(project => {
      project.project.originalDisplayName = project.project.displayName
      project.project.initialValues = {
        input: 0,
        maintenance_savings: 0,
        project_cost: 0
      }
    })
  }

  viewSelectedProjects = () => {
    this.setState(prevState => ({
      viewSelectedProjects: !prevState.viewSelectedProjects
    }))
  }

  removeSelectedProject = project => {
    let tempSelectedProjects = [...this.state.selectedProjects]
    let projectObject = tempSelectedProjects.find(
      proj => JSON.stringify(proj) === JSON.stringify(project)
    )
    if (projectObject) {
      // remove if selected projects if you find it
      tempSelectedProjects = tempSelectedProjects.filter(
        proj => JSON.stringify(proj) != JSON.stringify(projectObject)
      )
    }
    this.setState({
      selectedProjects: tempSelectedProjects,
      viewSelectedProjects: tempSelectedProjects.length !== 1 // close drawer if there is only one selected project
    })
  }

  handleDeleteProject = project => {
    return new Promise((resolve, reject) => {
      this.props.deleteOrganizationProject(project).then(() => {
        this.setState({
          inSpecificProject: false,
          currentProject: {},
          currentView: 'projectListing'
        })
        resolve()
      })
    })
  }

  handleGoBack = () => {
    if (this.props.nestedModal) {
      this.props.handleCloseAddProjects()
    } else {
      this.setState({
        inSpecificProject: false,
        currentProject: {},
        currentView: 'projectListing',
        projectType: '',
        isSubmitting: false,
        selectedProjects: []
      })
    }
  }

  handleSubmission = async (formValues, completeBool, action, passedInType) => {
    let type =
      this.state.projectType === 'project-edit'
        ? this.state.projectType
        : passedInType

    const payload = this.createPayload(formValues, completeBool)

    if (type === 'project-edit') {
      try {
        await this.props.editOrganizationProject(
          payload,
          this.state.currentProject
        )
        this.setState({
          inSpecificProject: false,
          currentProject: {},
          currentView: 'projectListing',
          isSubmitting: false
        })
      } catch (err) {
        this.setState({ isSubmitting: false, errorRunningProject: true })
      }
    } else if (action === 'add' || action === 'edit') {
      // if (completeBool) {
      //   try {
      //     // const project = await this.props.evaluateProject(
      //     //   action,
      //     //   payload,
      //     //   this.props.building._id,
      //     //   this.state.currentProject,
      //     //   type
      //     // )
      //     this.props.handleCloseAddProjects({}, this.props.setFieldValue)
      //   } catch (err) {
      //     this.setState({ isSubmitting: false, errorRunningProject: true })
      //   }
      // } else {
      try {
        if (this.state.projectType === 'measure') {
          const measurePayload = this.createMeasurePayload(
            formValues,
            completeBool
          )
          const added = await this.props.addIncompleteProject({
            action,
            payload: measurePayload,
            buildingId: this.props.building._id,
            project: this.state.currentProject,
            type: 'measure',
            rates: this.props.rates
          })
          this.props.handleCloseAddProjects(
            this.props.projects,
            added,
            this.props.setFieldValue
          )
        } else {
          const project = await this.props.addIncompleteProject({
            action,
            payload,
            buildingId: this.props.building._id,
            project: this.state.currentProject,
            type,
            rates: this.props.rates
          })
          this.props.handleCloseAddProjects(
            this.props.projects,
            project,
            this.props.setFieldValue
          )
        }
      } catch (err) {
        console.error(err)
        this.setState({ isSubmitting: false, errorRunningProject: true })
      }
      // }
    } else if (action === 'copy') {
      let project = { ...this.state.currentProject }
      project.isEditing = true
      try {
        delete payload.type
        await this.props.createOrganizationProject({ payload, isCopy: false })
        this.setState({
          inSpecificProject: false,
          currentProject: {},
          currentView: 'projectListing',
          isSubmitting: false
        })
      } catch (err) {
        this.setState({ isSubmitting: false, errorRunningProject: true })
      }
    }
  }

  createMeasurePayload = (formValues, completeBool) => {
    const payload = this.createPayload(formValues, completeBool)
    const allowedTypes = ['abatement', 'retrofit', 'incentive', 'rcx', 'o&m']

    if (!allowedTypes.includes(payload.type)) {
      delete payload.type
    }

    return payload
  }

  createPayload = (formValues, completeBool) => {
    const { currentProject } = this.state
    const {
      notesImages,
      buildingImages,
      measuresImages,
      ...values
    } = formValues

    this.setState({ isSubmitting: true })

    for (var key in values) {
      if (
        values.hasOwnProperty(key) &&
        !isNaN(values[key]) && // if it is a number (accounts for numbers as strings)
        values[key] !== ''
      ) {
        values[key] = parseFloat(values[key])
      }
    }

    let tagsArr = values.tags
      ? values.tags.split(',').map(item => item.trim())
      : []

    let incentiveObj = { ...currentProject.incentive }
    // add a default of zeros
    incentiveObj['input'] = values.input || 0
    values.input = values.input || 0
    values.maintenance_savings = values.maintenance_savings || 0
    values.project_cost = values.project_cost || 0

    let imageUrls
    if (formValues.selectedImages && formValues.uploadedImages) {
      imageUrls = [...formValues.selectedImages, ...formValues.uploadedImages]
    } else if (formValues.uploadedImages) {
      imageUrls = formValues.uploadedImages
    } else if (formValues.selectedImages) {
      imageUrls = formValues.selectedImages
    }

    const payload = {
      name: currentProject.name,
      displayName: values.displayName,
      originalDisplayName:
        currentProject.originalDisplayName || currentProject.displayName,
      source: currentProject.source || '',
      fuel: currentProject.fuel || '',
      tags: tagsArr,
      locations: values.locations,
      comment: values.comment,
      description: values.description,
      fields: currentProject.fields,
      initialValues: values,
      incentive: incentiveObj,
      category: currentProject.category,
      applicable_building_types: currentProject.applicable_building_types,
      project_category: currentProject.project_category,
      project_application: currentProject.project_application,
      project_technology: currentProject.project_technology,
      analysisType: currentProject.analysisType,
      type: formValues.type || '',
      implementation_strategy: values.implementation_strategy,
      imageUrls: imageUrls,
      isProject: currentProject.isEditing,
      isComplete: completeBool,
      createNewProject: false,
      status: formValues.status || 'Identified',
      measureLife: formValues.measureLife || '0',
      budgetType: formValues.budgetType || 'Low Cost/No Cost',
      imagesInReports: formValues.imagesInReports || []
    }

    if (currentProject.eaDisplayName) {
      payload.eaDisplayName = currentProject.eaDisplayName
    }

    return payload
  }

  handleOpenImageModal = () => {
    this.setState({ viewingImage: true })
  }

  handleCloseImageModal = () => {
    this.setState({ viewingImage: false })
  }

  render() {
    const { building, buildingId } = this.props
    return (
      <Query
        skip={!buildingId}
        query={GET_BUILDING_EQUIPMENT_LIST}
        variables={{ buildingId }}
        fetchPolicy="network-only"
      >
        {({ loading, error, data }) => {
          let buildingEquipment = []
          if (data && data.buildingEquipment)
            buildingEquipment = data.buildingEquipment
          return (
            <div
              data-test="projects-modal"
              className={classNames(
                !this.props.library ? styles.projectsModal : '',
                this.props.nestedModal ? styles.nestedModal : ''
              )}
            >
              {!this.props.library && (
                <div className={styles.projectsModalHeader}>
                  <div className={styles.projectsModalTitle}>
                    <div className={styles.container}>
                      <h3>
                        {this.state.currentView === 'projectListing'
                          ? 'New Measure'
                          : 'Measure Details'}
                      </h3>
                      <div
                        className={styles.projectsModalClose}
                        onClick={() => {
                          this.state.isSubmitting
                            ? alert(
                                'Please wait until Measure is finished evaluating.'
                              )
                            : this.props.handleCloseAddProjects()
                        }}
                      >
                        <i className="material-icons">close</i>
                      </div>
                    </div>
                  </div>

                  {
                    <div className={styles.projectsModalStepperMobile}>
                      <span
                        className={
                          this.state.currentView === 'projectListing'
                            ? styles.first
                            : styles.second
                        }
                      />
                    </div>
                  }
                  {!this.props.nestedModal && (
                    <div className={styles.projectsModalStepper}>
                      <div className={styles.container}>
                        <div
                          className={classNames(
                            styles.projectsModalStep,
                            this.state.currentView === 'projectListing'
                              ? styles.projectsModalStepActive
                              : styles.projectsModalStepDone
                          )}
                        >
                          <span>
                            {this.state.currentView === 'projectListing' ? (
                              '1'
                            ) : (
                              <i className="material-icons">check</i>
                            )}
                          </span>
                          Select your measure
                        </div>
                        {this.state.selectedProjects.length <= 1 && <span />}
                        {this.state.selectedProjects.length <= 1 && (
                          <div
                            className={classNames(
                              styles.projectsModalStep,
                              this.state.currentView !== 'projectListing'
                                ? styles.projectsModalStepActive
                                : ''
                            )}
                          >
                            <span>2</span>Measure Details
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {this.state.currentView === 'projectListing' && (
                <Query query={ENABLED_FEATURES}>
                  {({ data }) => {
                    if (!data) return null
                    const enabledFeatures = data.enabledFeatures || []
                    const isMyLibraryEnabled = enabledFeatures.some(
                      feature => feature.name === 'myLibrary'
                    )
                    const isPublicLibraryEnabled = enabledFeatures.some(
                      feature => feature.name === 'publicLibrary'
                    )
                    return (
                      <ProjectMeasureListing
                        handleSelectedProjects={this.handleSelectedProjects}
                        handleOpenProject={this.handleOpenProject}
                        handleDeleteProject={this.handleDeleteProject}
                        library={this.props.library}
                        getMeasures={this.props.getMeasures}
                        buildingLocation={(building && building.location) || {}}
                        getOrganizationProjects={
                          this.props.getOrganizationProjects
                        }
                        selectedProjects={this.state.selectedProjects}
                        products={this.props.products}
                        measures={(building && building.measures) || []}
                        projects={(building && building.projects) || []}
                        buildingUse={(building && building.buildingUse) || ''}
                        title={'Measure'}
                        tab={
                          isMyLibraryEnabled
                            ? 'myLibrary'
                            : isPublicLibraryEnabled
                            ? 'publicLibrary'
                            : ''
                        }
                      />
                    )
                  }}
                </Query>
              )}

              {(this.state.currentView === 'projectAdd' ||
                this.state.currentProject.dataAlreadyFromEA) && (
                <PackageProjectAdd
                  currentProject={this.state.currentProject}
                  projectType={this.state.projectType}
                  handleSubmission={this.handleSubmission}
                  eaAudit={(building && building.eaAudit) || {}}
                  projects={(building && building.projects) || []}
                  zipCode={
                    (building &&
                      building.location &&
                      building.location.zipCode) ||
                    ''
                  }
                  handleGoBack={this.handleGoBack}
                  handleCloseAddProjects={this.props.handleCloseAddProjects}
                  uploadProjectImage={this.props.uploadProjectImage}
                  handleOpenImageModal={this.handleOpenImageModal}
                  handleCloseImageModal={this.handleCloseImageModal}
                  viewingImage={this.state.viewingImage}
                  currentView={this.state.currentView}
                  isSubmitting={this.state.isSubmitting}
                  errorRunningProject={this.state.errorRunningProject}
                  getOrganizationName={this.props.getOrganizationName}
                  getUserById={this.props.getUserById}
                  getMeasures={this.props.getMeasures}
                  buildingEquipment={buildingEquipment}
                  index={this.props.index}
                  target={this.props.target || 'Project'}
                />
              )}

              {this.state.currentView === 'projectCopy' && (
                <PackageProjectCopy
                  currentProject={this.state.currentProject}
                  projectType={this.state.projectType}
                  handleSubmission={this.handleSubmission}
                  eaAudit={(building && building.eaAudit) || {}}
                  projects={(building && building.projects) || []}
                  handleGoBack={this.handleGoBack}
                  library={this.props.library}
                  handleCloseAddProjects={this.props.handleCloseAddProjects}
                  uploadProjectImage={this.props.uploadProjectImage}
                  handleOpenImageModal={this.handleOpenImageModal}
                  handleCloseImageModal={this.handleCloseImageModal}
                  viewingImage={this.state.viewingImage}
                  currentView={this.state.currentView}
                  isSubmitting={this.state.isSubmitting}
                  errorRunningProject={this.state.errorRunningProject}
                  getOrganizationName={this.props.getOrganizationName}
                  getUserById={this.props.getUserById}
                  buildingEquipment={buildingEquipment}
                  index={this.props.index}
                  target={this.props.target || 'Project'}
                />
              )}

              {this.state.currentView === 'projectEdit' &&
                !this.state.currentProject.dataAlreadyFromEA && (
                  <PackageProjectEdit
                    currentProject={this.state.currentProject}
                    projectType="project"
                    handleSubmission={this.handleSubmission}
                    eaAudit={(building && building.eaAudit) || {}}
                    projects={(building && building.projects) || []}
                    uploadProjectImage={this.props.uploadProjectImage}
                    handleOpenImageModal={this.handleOpenImageModal}
                    library={this.props.library}
                    handleGoBack={this.handleGoBack}
                    handleCloseAddProjects={this.props.handleCloseAddProjects}
                    handleCloseImageModal={this.handleCloseImageModal}
                    viewingImage={this.state.viewingImage}
                    currentView={this.state.currentView}
                    isSubmitting={this.state.isSubmitting}
                    errorRunningProject={this.state.errorRunningProject}
                    getOrganizationName={this.props.getOrganizationName}
                    getUserById={this.props.getUserById}
                    buildingEquipment={buildingEquipment}
                    index={this.props.index}
                    target={this.props.target || 'Project'}
                  />
                )}
              {this.state.currentView === 'projectListing' &&
                !this.props.library && (
                  <div className={styles.projectsModalFooter}>
                    <div className={styles.container}>
                      {this.state.selectedProjects &&
                        this.state.selectedProjects.length > 1 &&
                        this.state.viewSelectedProjects && (
                          <div className={classNames(styles.selectedProjects)}>
                            {this.state.selectedProjects.map(
                              (project, index) => {
                                return (
                                  <div key={index}>
                                    <p>
                                      {truncateName(
                                        replaceHTMLEntities(
                                          project.project.displayName
                                        ),
                                        30
                                      )}
                                    </p>
                                    <span
                                      onClick={() =>
                                        this.removeSelectedProject(project)
                                      }
                                    >
                                      <i className="material-icons">close</i>
                                    </span>
                                  </div>
                                )
                              }
                            )}
                          </div>
                        )}
                      <div className={styles.projectsModalFooterButtons}>
                        <div className={styles.projectsModalFooterButtonsLeft}>
                          {this.state.selectedProjects &&
                            this.state.selectedProjects.length > 1 && (
                              <div
                                className={classNames(
                                  styles.selectedProjectsButton
                                )}
                                onClick={() => this.viewSelectedProjects()}
                              >
                                View {this.state.selectedProjects.length}{' '}
                                Selected Measures
                                {this.state.viewSelectedProjects && (
                                  <i className="material-icons">expand_more</i>
                                )}
                                {!this.state.viewSelectedProjects && (
                                  <i className="material-icons">expand_less</i>
                                )}
                              </div>
                            )}
                        </div>
                        <div className={styles.projectsModalFooterButtonsRight}>
                          <button
                            className={classNames(
                              styles.button,
                              styles.buttonSecondary
                            )}
                            onClick={() => this.props.handleCloseAddProjects()}
                          >
                            Cancel
                          </button>
                          {this.state.selectedProjects &&
                            this.state.selectedProjects.length === 1 && (
                              <button
                                onClick={this.handleOpenSelectedProject}
                                className={classNames(
                                  styles.button,
                                  styles.buttonPrimary
                                )}
                              >
                                Next
                              </button>
                            )}
                          {this.state.selectedProjects &&
                            this.state.selectedProjects.length > 1 &&
                            this.state.loadingBulkProjects && (
                              <button
                                className={classNames(
                                  styles.button,
                                  styles.buttonPrimary
                                )}
                              >
                                <Loader size="button" color="white" />
                              </button>
                            )}
                          {this.state.selectedProjects &&
                            this.state.selectedProjects.length > 1 &&
                            !this.state.loadingBulkProjects && (
                              <button
                                onClick={this.handleBulkAddSelectedProject}
                                className={classNames(
                                  styles.button,
                                  styles.buttonPrimary
                                )}
                              >
                                Bulk add {this.state.selectedProjects.length}{' '}
                                measures
                              </button>
                            )}
                          {this.state.selectedProjects &&
                            this.state.selectedProjects.length === 0 && (
                              <button
                                className={classNames(
                                  styles.button,
                                  styles.buttonPrimary,
                                  styles.buttonDisable
                                )}
                              >
                                Next
                              </button>
                            )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
            </div>
          )
        }}
      </Query>
    )
  }
}

const mapDispatchToProps = {
  getMeasures,
  createOrganizationProject,
  editOrganizationProject,
  getProjectsAndMeasures,
  getOrganizationName,
  getOrganizationProjects,
  deleteOrganizationProject,
  addIncompleteProject: addIncompletePackageProject,
  uploadProjectImage,
  evaluateProject,
  getUserById,
  bulkAddProjects,
  getProjectPackages,
  getBuilding,
  getProposalMeasure
}

const mapStateToProps = state => ({
  building: (state.building && state.building.buildingView) || null,
  currentProject: state.portfolio.currentProject || null,
  products: (state.login.user && state.login.user.products) || {},
  proposalTemplateList:
    (state.proposalTemplate && state.proposalTemplate.templateList) || [],
  organizationView: state.organization.organizationView || {},
  projects:
    (state.building &&
      state.building.buildingView &&
      state.building.buildingView.projects) ||
    [],
  projectPackages:
    (state.building &&
      state.building.buildingView &&
      state.building.buildingView.projectPackages) ||
    []
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(PortfolioProposalMeasureModal)
