import React from 'react'
import { connect } from 'react-redux'
import { Query } from 'react-apollo'
import PropTypes from 'prop-types'
import classNames from 'classnames'

import { ENABLED_FEATURES } from 'utils/graphql/queries/user'
import { Loader } from 'utils/Loader'
import { truncateName } from 'utils/Utils'

import {
  ProjectListing,
  LibraryProjectListing,
  ProjectAdd,
  ProjectCopy,
  ProjectEdit
} from 'components/Project'
import { replaceHTMLEntities } from 'components/Project/ProjectHelpers'

import {
  createProjectWithSubProject,
  copyProjectWithSubProject
} from 'routes/Building/modules/building'

import styles from './ProjectsModal.scss'

const MODAL_OPEN_CLASS = 'bodyModalOpen'

export class ProjectsModal extends React.Component {
  static propTypes = {
    building: PropTypes.object,
    handleCloseAddProjects: PropTypes.func,
    evaluateProject: PropTypes.func,
    createOrganizationProject: PropTypes.func.isRequired,
    editOrganizationProject: PropTypes.func.isRequired,
    addIncompleteProject: PropTypes.func,
    currentProject: PropTypes.object,
    uploadProjectImage: PropTypes.func.isRequired,
    getMeasures: PropTypes.func,
    getOrganizationProjects: PropTypes.func.isRequired,
    deleteOrganizationProject: PropTypes.func.isRequired,
    getOrganizationName: PropTypes.func.isRequired,
    bulkAddProjects: PropTypes.func,
    library: PropTypes.bool,
    getUserById: PropTypes.func.isRequired,
    products: PropTypes.object.isRequired,
    projectType: PropTypes.string,
    nestedModal: PropTypes.bool,
    getProjectPackages: PropTypes.func.isRequired
  }

  state = {
    currentView: 'projectListing',
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

  componentWillUnmount() {
    document.body.classList.remove(MODAL_OPEN_CLASS)
  }

  componentDidMount = () => {
    if (!this.props.library) {
      document.body.classList.add(MODAL_OPEN_CLASS)
    }

    if (Object.keys(this.props.currentProject).length > 0) {
      if (this.props.projectType === 'measure') {
        this.setState({
          currentView: 'projectAdd',
          currentProject: this.props.currentProject,
          projectType: 'measure',
          inSpecificProject: true
          //initialValues: this.props.currentProject.initialValues || {}
        })
      } else {
        this.setState({
          currentView: 'projectEdit',
          currentProject: this.props.currentProject,
          inSpecificProject: true,
          initialValues: this.props.currentProject.initialValues || {}
        })
      }
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
    this.props
      .bulkAddProjects(this.state.selectedProjects, this.props.building._id)
      .then(() => {
        this.setState({ loadingBulkProjects: false })
        this.props.handleCloseAddProjects()
      })
      .catch(() => {
        this.setState({ loadingBulkProjects: false })
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
      if (completeBool) {
        try {
          const project = await this.props.evaluateProject(
            action,
            payload,
            this.props.building._id,
            this.state.currentProject,
            type
          )
          this.props.handleCloseAddProjects(project)
        } catch (err) {
          this.setState({ isSubmitting: false, errorRunningProject: true })
        }
      } else {
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
              type: 'measure'
            })
            this.props.handleCloseAddProjects(added)
          } else {
            const project = this.props.addIncompleteProject({
              action,
              payload,
              buildingId: this.props.building._id,
              project: this.state.currentProject,
              type
            })
            this.props.handleCloseAddProjects(project)
          }
        } catch (err) {
          console.error(err)
          this.setState({ isSubmitting: false, errorRunningProject: true })
        }
      }
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

  handleSubmissionV2 = async (formValues, action, options = {}) => {
    this.setState({
      isSubmitting: true,
      errorRunningProject: false
    })
    try {
      const payload = this.createPayloadV2(formValues)
      const body = { payload, actionType: action, options }
      if (action === 'edit')
        body['id'] =
          this.props.currentProject._id || this.state.currentProject._id
      if (action === 'add') body['id'] = this.state.currentProject._id
      if (action === 'copy') {
        await this.props.copyProjectWithSubProject(body)
        this.setState({
          isSubmitting: false,
          errorRunningProject: false,
          currentProject: {},
          currentView: 'projectListing'
        })
      } else {
        await this.props.createProjectWithSubProject(
          this.props.library,
          this.props.library ? null : this.props.building._id,
          body
        )
        if (this.props.library) {
          this.setState({
            isSubmitting: false,
            errorRunningProject: false,
            currentProject: {},
            currentView: 'projectListing'
          })
        } else {
          this.props.handleCloseAddProjects()
        }
      }
    } catch (error) {
      console.log('error', error)
      this.setState({
        isSubmitting: false,
        errorRunningProject: true
      })
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
    values.maintenance_savings = values.maintenance_savings || ''
    values.project_cost = values.project_cost || null

    let imageUrls
    if (formValues.selectedImages && formValues.uploadedImages) {
      imageUrls = [...formValues.selectedImages, ...formValues.uploadedImages]
    } else if (formValues.uploadedImages) {
      imageUrls = formValues.uploadedImages
    } else if (formValues.selectedImages) {
      imageUrls = formValues.selectedImages
    }
    let fields = this.state.currentProject.fields || []
    for (let field of fields) {
      let name = field.name || ''
      if (!name || !field.default || values[name]) continue
      values[name] = field.default || 0
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
      status: formValues.status,
      measureLife: formValues.measureLife || '',
      package: formValues.package || '',
      budgetType: formValues.budgetType || 'Low Cost/No Cost',
      imagesInReports: formValues.imagesInReports || [],
      formulas: currentProject.formulas || [],
      config: currentProject.config || {}
    }

    if (values.source) {
      payload['source'] = values.source
    }

    if (values.categorization) {
      payload['project_category'] = values.categorization
    }

    if (currentProject.eaDisplayName) {
      payload.eaDisplayName = currentProject.eaDisplayName
    }

    if (payload['package'] === 'addProject') delete payload['package']

    // add Rates for measure
    let rates = formValues.rates || null
    if (rates) {
      payload['rates'] = rates
    }

    return payload
  }

  createPayloadV2 = formValues => {
    const { currentProject } = this.state
    const {
      notesImages,
      buildingImages,
      measuresImages,
      ...values
    } = formValues

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

    let imageUrls
    if (formValues.selectedImages && formValues.uploadedImages) {
      imageUrls = [...formValues.selectedImages, ...formValues.uploadedImages]
    } else if (formValues.uploadedImages) {
      imageUrls = formValues.uploadedImages
    } else if (formValues.selectedImages) {
      imageUrls = formValues.selectedImages
    }
    let fields = this.state.currentProject.fields || []
    for (let field of fields) {
      let name = field.name || ''
      if (!name || !field.default || values[name]) continue
      values[name] = field.default || 0
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
      isComplete: true,
      status: formValues.status,
      measureLife: formValues.measureLife || '',
      package: formValues.package || '',
      budgetType: formValues.budgetType || 'Low Cost/No Cost',
      imagesInReports: formValues.imagesInReports || [],
      formulas: currentProject.formulas || [],
      config: currentProject.config || {}
    }

    if (values.source) {
      payload['source'] = values.source
    }

    if (values.categorization) {
      payload['project_category'] = values.categorization
    }

    if (currentProject.eaDisplayName) {
      payload.eaDisplayName = currentProject.eaDisplayName
    }

    // add Rates for measure
    let rates = formValues.rates || null
    if (rates) {
      payload['rates'] = rates
    }

    if (payload['package'] === 'addProject') delete payload['package']

    return payload
  }

  handleOpenImageModal = () => {
    this.setState({ viewingImage: true })
  }

  handleCloseImageModal = () => {
    this.setState({ viewingImage: false })
  }

  render() {
    const { building } = this.props
    return (
      <div
        data-test='projects-modal'
        className={classNames(
          !this.props.library ? styles.projectsModal : '',
          this.state.currentView === 'projectEdit' || this.props.nestedModal
            ? styles.nestedModal
            : ''
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
                          `Please wait until measure is finished evaluating.`
                        )
                      : this.props.handleCloseAddProjects()
                  }}
                >
                  <i className='material-icons'>close</i>
                </div>
              </div>
            </div>

            {this.state.currentView !== 'projectEdit' && (
              <div>
                <div className={styles.projectsModalStepperMobile}>
                  <span
                    className={
                      this.state.currentView === 'projectListing'
                        ? styles.first
                        : styles.second
                    }
                  />
                </div>
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
                            <i className='material-icons'>check</i>
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
                          <span>2</span>
                          Measure Details
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {this.state.currentView === 'projectListing' && !this.props.library && (
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
                <ProjectListing
                  handleSelectedProjects={this.handleSelectedProjects}
                  handleOpenProject={this.handleOpenProject}
                  handleDeleteProject={this.handleDeleteProject}
                  library={this.props.library}
                  getMeasures={this.props.getMeasures}
                  buildingLocation={(building && building.location) || {}}
                  getOrganizationProjects={this.props.getOrganizationProjects}
                  selectedProjects={this.state.selectedProjects}
                  products={this.props.products}
                  measures={(building && building.measures) || []}
                  projects={(building && building.projects) || []}
                  buildingUse={(building && building.buildingUse) || ''}
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

        {this.state.currentView === 'projectListing' && this.props.library && (
          <LibraryProjectListing
            handleSelectedProjects={this.handleSelectedProjects}
            handleOpenProject={this.handleOpenProject}
            handleDeleteProject={this.handleDeleteProject}
            library={this.props.library}
            getMeasures={this.props.getMeasures}
            buildingLocation={(building && building.location) || {}}
            getOrganizationProjects={this.props.getOrganizationProjects}
            selectedProjects={this.state.selectedProjects}
            products={this.props.products}
            measures={(building && building.measures) || []}
            projects={(building && building.projects) || []}
            buildingUse={(building && building.buildingUse) || ''}
            tab={this.props.tab || 'myLibrary'}
          />
        )}

        {(this.state.currentView === 'projectAdd' ||
          this.state.currentProject.dataAlreadyFromEA) && (
          <ProjectAdd
            currentProject={this.state.currentProject}
            projectType={this.state.projectType}
            handleSubmission={this.handleSubmission}
            handleSubmissionV2={this.handleSubmissionV2}
            eaAudit={building.eaAudit}
            projects={building.projects}
            zipCode={building.location.zipCode}
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
            building={this.props.building}
            endUse={this.props.endUse}
            utilityMetrics={this.props.utilityMetrics}
            buildingEquipment={
              this.props.library ? [] : this.props.buildingEquipment
            }
            getProjectPackages={this.props.getProjectPackages}
            deleteProject={this.props.deleteProject}
            operations={this.props.operations}
          />
        )}

        {this.state.currentView === 'projectCopy' && (
          <ProjectCopy
            currentProject={this.state.currentProject}
            projectType={this.state.projectType}
            handleSubmission={this.handleSubmission}
            handleSubmissionV2={this.handleSubmissionV2}
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
            building={this.props.building}
            endUse={this.props.endUse}
            utilityMetrics={this.props.utilityMetrics}
            buildingEquipment={
              this.props.library ? [] : this.props.buildingEquipment
            }
            getProjectPackages={this.props.getProjectPackages}
            deleteProject={this.props.deleteProject}
            operations={this.props.operations}
          />
        )}

        {this.state.currentView === 'projectEdit' &&
          !this.state.currentProject.dataAlreadyFromEA && (
            <ProjectEdit
              currentProject={this.state.currentProject}
              projectType='project'
              handleSubmission={this.handleSubmission}
              handleSubmissionV2={this.handleSubmissionV2}
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
              building={this.props.building}
              endUse={this.props.endUse}
              utilityMetrics={this.props.utilityMetrics}
              buildingEquipment={
                this.props.library ? [] : this.props.buildingEquipment
              }
              getProjectPackages={this.props.getProjectPackages}
              deleteProject={this.props.deleteProject}
              operations={this.props.operations}
            />
          )}
        {this.state.currentView === 'projectListing' && !this.props.library && (
          <div className={styles.projectsModalFooter}>
            <div className={styles.container}>
              {this.state.selectedProjects &&
                this.state.selectedProjects.length > 1 &&
                this.state.viewSelectedProjects && (
                  <div className={classNames(styles.selectedProjects)}>
                    {this.state.selectedProjects.map((project, index) => {
                      return (
                        <div key={index}>
                          <p>
                            {truncateName(
                              replaceHTMLEntities(project.project.displayName),
                              30
                            )}
                          </p>
                          <span
                            onClick={() => this.removeSelectedProject(project)}
                          >
                            <i className='material-icons'>close</i>
                          </span>
                        </div>
                      )
                    })}
                  </div>
                )}
              <div className={styles.projectsModalFooterButtons}>
                <div className={styles.projectsModalFooterButtonsLeft}>
                  {this.state.selectedProjects &&
                    this.state.selectedProjects.length > 1 && (
                      <div
                        className={classNames(styles.selectedProjectsButton)}
                        onClick={() => this.viewSelectedProjects()}
                      >
                        View {this.state.selectedProjects.length} Selected
                        measures
                        {this.state.viewSelectedProjects && (
                          <i className='material-icons'>expand_more</i>
                        )}
                        {!this.state.viewSelectedProjects && (
                          <i className='material-icons'>expand_less</i>
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
                        <Loader size='button' color='white' />
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
                        Bulk add {this.state.selectedProjects.length} measure
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
  }
}
const mapStateToProps = state => ({
  products: (state.login.user && state.login.user.products) || {}
})

const mapDispatchToProps = {
  createProjectWithSubProject,
  copyProjectWithSubProject
}

export default connect(mapStateToProps, mapDispatchToProps)(ProjectsModal)
