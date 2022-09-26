import React, { Component } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { connect } from 'react-redux'
import { Formik, Field, Form, ErrorMessage } from 'formik'
import styles from '../ScenarioForms/ScenarioForm.scss'
import formFieldStyles from '../FormFields/Field.module.scss'
import formStyles from './MeasurePackageForm.scss'
import projectFormStyles from '../ProjectForms/ProjectForm.scss'
import {
  ProjectSearch,
  PackageFormProjectList
} from '../../../components/Project'
import { Footer } from '../../../components/UI/Footer'
import { FormSection, Field as FieldSelect } from '../FormFields'
import ImagesField from '../FormFields/ImagesField'
import DeleteConfirmationModal from '../../../containers/Modal/DeleteConfirmationModal'
import PackageMeasureModal from '../../../containers/Modal/PackageMeasureModal'
import TextQuillEditor from '../../../components/UI/TextEditor/TextQuillEditor'
import MeasureCategory from './MeasureCategory'
import { Loader } from 'utils/Loader'
import { ProjectPackagesModal } from '../../Modal'
import {
  createOrganizationProject,
  editOrganizationProject,
  getProjectsAndMeasures,
  getOrganizationName,
  getOrganizationProjects,
  deleteOrganizationProject,
  addMeasureForMeasurePackage,
  uploadProjectImage,
  evaluateProject,
  getUserById,
  bulkAddProjects,
  getProjectPackages,
  createMeasurePackage,
  updateMeasurePackage,
  createTempMeasurePackage,
  deleteMeasurePackage,
  deleteBulkMeasureForProject
} from '../../../routes/Building/modules/building'
import { getMeasures } from '../../../routes/Library/modules/library'
import { sortFunction } from 'utils/Portfolio'
import { isProdEnv } from 'utils/Utils'
import UserFeature from 'utils/Feature/UserFeature'

class MeasurePackageForm extends Component {
  static propTypes = {
    user: PropTypes.object.isRequired,
    building: PropTypes.object.isRequired,
    projectPackage: PropTypes.object,
    onClose: PropTypes.func.isRequired,
    mode: PropTypes.oneOf(['addMeasurePackage', 'editMeasurePackage'])
      .isRequired
  }

  state = {
    currentMeasurePackage: this.props.measurePackage,
    currentProject: {},
    projectPackages: [],
    projectsToShow:
      (this.props.measurePackage && this.props.measurePackage.projects) || [],
    total: (this.props.measurePackage && this.props.measurePackage.total) || {},
    statusOptions: [
      { name: 'Identified', value: 'Identified' },
      { name: 'Not Recommended', value: 'Not Recommended' },
      { name: 'Recommended', value: 'Recommended' },
      { name: 'Evaluated', value: 'Evaluated' },
      { name: 'Selected', value: 'Selected' },
      { name: 'Initiated', value: 'Initiated' },
      { name: 'Discarded', value: 'Discarded' },
      { name: 'In Progress', value: 'In Progress' },
      { name: 'On Hold', value: 'On Hold' },
      { name: 'Completed', value: 'Completed' },
      { name: 'M&V', value: 'M&V' },
      { name: 'Verified', value: 'Verified' },
      { name: 'Unsatisfactory', value: 'Unsatisfactory' }
    ],
    typeOptions: [
      {
        name: 'Energy Efficiency Measure (EEM)',
        value: 'Energy Efficiency Measure (EEM)'
      },
      { name: 'RCx Measure (RCM)', value: 'RCx Measure (RCM)' },
      { name: 'O&M Measure', value: 'O&M Measure' },
      { name: 'Generation Measure', value: 'Generation Measure' }
    ],
    budgetTypeOptions: [
      {
        name: 'Low Cost/No Cost',
        value: 'Low Cost/No Cost'
      },
      {
        name: 'Capital Investment',
        value: 'Capital Investment'
      }
    ],
    reRunProject: false,
    projectPackage: {},
    currentTempMeasurePackage: null
  }

  componentDidMount = () => {
    if (this.props.modeFrom !== 'ProjectPackage') {
      this.props.getProjectPackages(this.props.buildingId).then(packages => {
        this.setState({
          projectPackages: packages
        })
      })
    } else {
      this.setState({ total: this.props.measurePackage.totalWithRates || {} })
    }
  }

  handleDescriptionChange = (html, setFieldValue) => {
    setFieldValue('description', html)
  }

  handleChanged = ({ event, setFieldValue, field }) => {
    setFieldValue(field, event.target.value)
  }

  validateForm = values => {
    let errors = {}

    if (values.name.length === 0) {
      errors.name = 'Name is required'
    }

    return errors
  }

  handleSubmit = async values => {
    let { mode, onClose, modeFrom } = this.props
    let updatedValues = Object.assign({}, values)
    let ids = updatedValues.projects.map(project => project._id)
    delete updatedValues.projects
    delete updatedValues.projectIds
    delete updatedValues.total

    updatedValues.total = this.state.total
    updatedValues.projects = ids
    if (updatedValues['package'] === 'addProject')
      delete updatedValues['package']
    let response
    modeFrom = modeFrom || 'ProjectView'

    switch (mode) {
      case 'addMeasurePackage':
        response = await this.props.createMeasurePackage(
          this.props.building._id,
          updatedValues,
          modeFrom
        )
        break
      case 'editMeasurePackage':
        response = await this.props.updateMeasurePackage(
          this.props.building._id,
          updatedValues,
          modeFrom
        )
        break
    }
    if (modeFrom === 'ProjectView') return onClose()
    else return onClose(response, this.props.projects, this.props.setFieldValue)
  }

  handleClose = () => {
    this.props.onClose()
  }

  handleOpenAddProjects = () => {
    this.setState({
      modalOpen: true,
      editingProject: false,
      modalView: 'projectModal'
    })
  }

  handleEditMeasure = project => {
    project.isEditing = true
    this.setState({
      modalOpen: true,
      modalView: 'projectModal',
      currentProject: project
    })
  }

  handleOpenDeleteConfirmationModal = project => {
    this.setState({
      modalOpen: true,
      modalView: 'deleteConfirmation',
      currentProject: project
    })
  }

  getTotal = async projects => {
    let projectCost = 0,
      incentive = 0,
      annualSavings = 0,
      electric = 0,
      roi = 0,
      simplePayBack = 0,
      npv = 0,
      sir = 0,
      ghgSavings = 0,
      ghgSavingsCost = 0,
      waterSavings = 0,
      gasSavings = 0,
      maintenanceSavings = 0,
      calculationType = '',
      demandSavings = 0,
      eul = 0,
      energySavings = 0
    let modeFrom = this.props.modeFrom || 'ProjectView'
    projects.forEach(project => {
      let metric = {}
      if (modeFrom === 'ProjectView') metric = project.metric || {}
      else metric = project.metricWithRate || {}
      let calculatedProjectCost = metric.projectCost || 0
      let calculatedIncentive = metric.incentive || 0
      let calculatedAnnualSavings = metric.annualSavings || 0
      let calculatedElectric = metric.electricSavings || 0
      let calculatedGHGSavings = metric.ghgSavings || 0
      calculatedGHGSavings = isFinite(calculatedGHGSavings)
        ? calculatedGHGSavings
        : 0
      let calculatedGHGSavingsCost = metric.ghgSavingsCost
      calculatedGHGSavingsCost = isFinite(calculatedGHGSavingsCost)
        ? calculatedGHGSavingsCost
        : 0
      let calculatedWaterSavings = metric.waterSavings || 0
      let calculatedGasSavingsCost = metric.gasSavings || 0
      let calculatedEnergySavings = metric.energySavings || 0
      let calculatedDemandSavings = metric.demandSavings || 0
      let calculatedEUL = metric.eul || project.measureLife || 0
      let simple_payback = metric.simple_payback || 0
      if (calculationType === '') calculationType = metric.calculationType || ''
      projectCost += calculatedProjectCost
      incentive += calculatedIncentive
      annualSavings += calculatedAnnualSavings
      electric += calculatedElectric
      ghgSavingsCost += calculatedGHGSavingsCost
      ghgSavings += calculatedGHGSavings
      gasSavings += calculatedGasSavingsCost
      waterSavings += calculatedWaterSavings
      demandSavings += calculatedDemandSavings
      eul = Math.max(eul, Number(calculatedEUL))
      simplePayBack = Math.max(simplePayBack, simple_payback)
      maintenanceSavings +=
        (project &&
          project.initialValues &&
          project.initialValues.maintenance_savings) ||
        0
      energySavings = Number(energySavings) + Number(calculatedEnergySavings)
    })
    return {
      projectCost,
      incentive,
      annualSavings,
      electric,
      gasSavings,
      ghgSavings,
      ghgSavingsCost,
      waterSavings,
      roi,
      simplePayBack,
      npv,
      sir,
      demandSavings,
      eul,
      calculationType,
      energySavings,
      maintenanceSavings
    }
  }

  calculateTotal = async projects => {
    const total = await this.getTotal(projects)
    this.setState({ total })
  }

  handleCloseAddProjects = (projects, project, setFieldValue) => {
    if (
      project &&
      Object.entries(project).length != 0 &&
      project.constructor === Object &&
      project._id
    ) {
      project.collectionTarget = 'measure'
      let updatedProjects = projects || []
      updatedProjects = updatedProjects.filter(item => item._id != project._id)
      updatedProjects = [...updatedProjects, project]
      setFieldValue('projects', updatedProjects)
      this.setState(
        {
          projectsToShow: updatedProjects,
          originProjects: updatedProjects,
          modalOpen: false,
          modalView: null,
          currentProject: {},
          editingRates: false,
          searchValue: ''
        },
        () => {
          this.calculateTotal(updatedProjects)
        }
      )
    } else {
      this.setState({
        modalOpen: false,
        modalView: null,
        currentProject: {},
        editingRates: false,
        searchValue: ''
      })
    }
  }

  handleDeleteProject = async (projectId, setFieldValue) => {
    let updatedProjects = this.state.originProjects || []
    updatedProjects = updatedProjects.filter(item => item._id != projectId)
    setFieldValue('projects', updatedProjects)
    this.setState({
      projectsToShow: updatedProjects,
      originProjects: updatedProjects,
      modalOpen: false,
      modalView: null,
      currentProject: {},
      editingRates: false,
      searchValue: ''
    })
    await this.calculateTotal(updatedProjects)
  }

  handleCategoryChange = (setFieldValue, categoryObj) => {
    if (categoryObj && categoryObj.category !== undefined) {
      let category = categoryObj.category
      setFieldValue('category', category)
    }
    if (categoryObj && categoryObj.application !== undefined) {
      let application = categoryObj.application
      setFieldValue('application', application)
    }
    if (categoryObj && categoryObj.technology !== undefined) {
      let technology = categoryObj.technology
      setFieldValue('technology', technology)
    }
  }

  handleProjectSelect = async (event, setFieldValue, values) => {
    let value = event.target.value
    if (value === 'addProject') {
      this.setState({ reRunProject: true })
      let tempMeasurePackage = await this.props.createTempMeasurePackage(
        this.props.building._id,
        values
      )
      tempMeasurePackage.collectionTarget = 'measurePackage'
      this.setState({
        reRunProject: false,
        currentTempMeasurePackage: tempMeasurePackage,
        projectPackage: {
          projects: [tempMeasurePackage]
        },
        modalOpen: true,
        viewMode: 'addProjectPackage',
        modalView: 'projectPackageModal'
      })
    }
    setFieldValue('package', value)
  }

  handleCloseAddProjectPackages = async (flag, options = {}) => {
    let { result, setFieldValue } = options
    let mode = flag || 'create'
    this.setState({
      modalOpen: false,
      modalView: null,
      projectPackage: {},
      editingRates: false,
      searchValue: ''
    })
    if (mode === 'create') {
      if (
        result &&
        Object.keys(result).length !== 0 &&
        result.constructor === Object
      ) {
        setFieldValue(
          'package',
          (result.projectPackage && result.projectPackage._id) || ''
        )
      }
      const packages = await this.props.getProjectPackages(
        this.props.buildingId
      )
      await this.props.deleteMeasurePackage(
        this.state.currentTempMeasurePackage._id
      )
      this.setState({
        projectPackages: packages,
        currentTempMeasurePackage: null
      })
    } else {
      await this.props.deleteMeasurePackage(
        this.state.currentTempMeasurePackage._id
      )
      try {
        await this.props.deleteBulkMeasureForProject(options)
      } catch (error) {
        console.log('error', error)
      }
      this.setState({
        currentTempMeasurePackage: null
      })
    }
  }

  render() {
    const { mode } = this.props
    let modeFrom = this.props.modeFrom || 'ProjectView'
    let {
      currentMeasurePackage,
      loading,
      projectsToShow,
      statusOptions,
      typeOptions,
      budgetTypeOptions
    } = this.state
    let { projectPackages } = this.state
    const betaCheckFlag = isProdEnv(process.env.DOMAIN_ENV)
    const xcelOrgId = '5f32b52ce21cdd0011ba2f7c'
    const myOrgId = '5e84e3722f10c40010b46f33'
    const specificOrgId = betaCheckFlag ? xcelOrgId : myOrgId
    if (
      this.props.organizationView &&
      this.props.organizationView._id === specificOrgId
    ) {
      typeOptions = [
        {
          name: 'CEEM',
          value: 'CEEM'
        },
        { name: 'CEEM/DI', value: 'CEEM/DI' },
        { name: 'CO', value: 'CO' }
      ]
    }
    projectPackages = sortFunction(projectPackages, 'name')

    let initialValues = {
      _id: (currentMeasurePackage && currentMeasurePackage._id) || 'New',
      name: (currentMeasurePackage && currentMeasurePackage.name) || '',
      category: (currentMeasurePackage && currentMeasurePackage.category) || {
        value: '',
        displayName: ''
      },
      application: (currentMeasurePackage &&
        currentMeasurePackage.application) || {
        value: '',
        displayName: ''
      },
      technology: (currentMeasurePackage &&
        currentMeasurePackage.technology) || {
        value: '',
        displayName: ''
      },
      status: (currentMeasurePackage && currentMeasurePackage.status) || '',
      type: (currentMeasurePackage && currentMeasurePackage.type) || '',
      budgetType:
        (currentMeasurePackage && currentMeasurePackage.budgetType) || '',
      package:
        (currentMeasurePackage &&
          currentMeasurePackage.package &&
          currentMeasurePackage.package._id) ||
        '',
      description:
        (currentMeasurePackage && currentMeasurePackage.description) || '',
      projects: (currentMeasurePackage && currentMeasurePackage.projects) || [],
      projectIds:
        (currentMeasurePackage && currentMeasurePackage.projectIds) || [],
      total: (currentMeasurePackage && currentMeasurePackage.total) || {},
      comments: (currentMeasurePackage && currentMeasurePackage.comments) || '',
      images: (currentMeasurePackage && currentMeasurePackage.images) || []
    }

    let submitText

    switch (mode) {
      case 'addMeasurePackage':
        submitText = 'Add Measure Package'
        break
      case 'editMeasurePackage':
        submitText = 'Update Measure Package'
        break
    }

    return (
      <div className={styles.formWrapper}>
        <Formik
          initialValues={initialValues}
          enableReinitialize
          validate={values => this.validateForm(values)}
        >
          {({
            values,
            isSubmitting,
            isValid,
            setFieldValue,
            setSubmitting
          }) => {
            return (
              <Form className={styles.form}>
                <div className={styles.assetForm}>
                  <FormSection
                    title="Details"
                    description="Add basic information about your measure package"
                  >
                    <ErrorMessage
                      name="name"
                      component="div"
                      className={styles.formError}
                    />
                    <FieldSelect
                      id="name"
                      name="name"
                      component="input"
                      label="Name"
                      type="text"
                      value={values.name}
                      onChange={event =>
                        this.handleChanged({
                          event,
                          setFieldValue,
                          field: 'name'
                        })
                      }
                    />
                    <br />
                    <MeasureCategory
                      values={values}
                      onCategoryChange={categoryObj =>
                        this.handleCategoryChange(setFieldValue, categoryObj)
                      }
                    />
                    <FieldSelect
                      label="Status"
                      component="select"
                      name="status"
                      data-test="status"
                      placeholder="Select"
                    >
                      <option defaultValue value="" disabled>
                        Select a Status
                      </option>
                      {statusOptions.map(({ name, value }) => (
                        <option key={`status-option-${value}`} value={value}>
                          {name}
                        </option>
                      ))}
                    </FieldSelect>
                    <br />
                    <FieldSelect
                      label="Type"
                      component="select"
                      name="type"
                      data-test="type"
                      placeholder="Select"
                    >
                      <option defaultValue value="" disabled>
                        Select a type
                      </option>
                      {typeOptions.map(({ name, value }) => (
                        <option key={`type-option-${value}`} value={value}>
                          {name}
                        </option>
                      ))}
                    </FieldSelect>
                    <br />
                    <FieldSelect
                      label="Budget Type"
                      component="select"
                      name="budgetType"
                      data-test="type"
                      placeholder="Select"
                    >
                      <option defaultValue value="" disabled>
                        Select a budget type
                      </option>
                      {budgetTypeOptions.map(({ name, value }) => (
                        <option
                          key={`budgetType-option-${value}`}
                          value={value}
                        >
                          {name}
                        </option>
                      ))}
                    </FieldSelect>
                    <br />
                    {modeFrom !== 'ProjectPackage' && (
                      <UserFeature name="projectProject">
                        {({ enabled }) => {
                          if (!enabled) return null
                          return (
                            <div>
                              <FieldSelect
                                label="Project"
                                component="select"
                                name="package"
                                data-test="package"
                                placeholder="Select"
                                onChange={e =>
                                  this.handleProjectSelect(
                                    e,
                                    setFieldValue,
                                    values
                                  )
                                }
                              >
                                <option defaultValue value="">
                                  Select a project
                                </option>
                                <option value="addProject">
                                  Add a new project
                                </option>
                                {projectPackages.map((proPackage, index) => (
                                  <option
                                    key={`package-option-${proPackage._id}`}
                                    value={proPackage._id}
                                  >
                                    {proPackage.name}
                                  </option>
                                ))}
                              </FieldSelect>
                              <br />
                            </div>
                          )
                        }}
                      </UserFeature>
                    )}
                    <div>
                      <span className={formFieldStyles.label}>Description</span>
                      <TextQuillEditor
                        handleChange={html =>
                          this.handleDescriptionChange(html, setFieldValue)
                        }
                        html={values.description || ''}
                        placeholder="Enter Measure Package Description"
                        index={
                          this.props.index === undefined
                            ? 0
                            : this.props.index + 1
                        }
                        hidePersonalize={true}
                      />
                    </div>
                  </FormSection>
                  <div className={styles.measureButton}>
                    <div>
                      <button
                        type="button"
                        className={classNames(
                          styles.button,
                          styles.buttonPrimary
                        )}
                        onClick={this.handleOpenAddProjects}
                      >
                        <i className="material-icons">add</i>New Measure
                      </button>
                    </div>
                  </div>
                  <br /> <br /> <br />
                  <div className={formStyles.formSectionDescription}>
                    <p>Measures</p>
                    <div className={formStyles.main}>
                      <ProjectSearch
                        searchValue={this.state.searchValue}
                        handleSearch={this.handleSearch}
                      />
                      <PackageFormProjectList
                        projectsToShow={projectsToShow}
                        handleEditProject={this.handleEditMeasure}
                        handleDeleteProject={this.handleDeleteProject}
                        setFieldValue={setFieldValue}
                        buildingId={this.props.building._id}
                        handleOpenDeleteConfirmationModal={
                          this.handleOpenDeleteConfirmationModal
                        }
                        total={this.state.total}
                        target="MeasurePackage"
                        modeFrom={this.props.modeFrom || 'ProjectView'}
                      />
                    </div>
                  </div>
                  <FormSection
                    title="Comments"
                    description="Add comments related to the measure package"
                  >
                    <Field
                      label="Comments"
                      component="textarea"
                      name="comments"
                      data-test="schedule-comments"
                      placeholder="Add comments about this measure package"
                      onChange={event =>
                        this.handleChanged({
                          event,
                          setFieldValue,
                          field: 'comments'
                        })
                      }
                    />
                  </FormSection>
                  <FormSection
                    title="Images"
                    description="Take photos or import images related to this measure package. Note images are compressed."
                  >
                    <ImagesField
                      images={
                        values.images &&
                        values.images.reduce((acc, image) => {
                          let url = new URL(image)
                          return Object.assign(acc, {
                            [url.pathname]: {
                              uploadUrl: url.href,
                              preview: url.href
                            }
                          })
                        }, {})
                      }
                      onFieldUpdate={images => {
                        setFieldValue(
                          'images',
                          Object.keys(images).map(k => images[k].uploadUrl)
                        )
                      }}
                    />
                  </FormSection>
                </div>
                {this.state.reRunProject && (
                  <div className={projectFormStyles.loadingContainer}>
                    <Loader />
                    <div className={projectFormStyles.reRunProject}>
                      <div>
                        One moment while we rerun your measure package...
                      </div>
                    </div>
                  </div>
                )}
                <Footer>
                  <button
                    type="button"
                    className={classNames(
                      styles.button,
                      styles.buttonSecondary
                    )}
                    onClick={this.handleClose}
                  >
                    Cancel
                  </button>
                  <button
                    className={classNames(styles.button, styles.buttonPrimary, {
                      [styles.buttonDisable]: !isValid
                    })}
                    disabled={!isValid}
                    type="submit"
                    data-test="user-package-add-button"
                    onClick={event => {
                      event.preventDefault()
                      setSubmitting(true)
                      this.handleSubmit(values).then(() => {
                        setSubmitting(false)
                      })
                      event.stopPropagation()
                    }}
                  >
                    {loading || isSubmitting ? (
                      <Loader size="button" color="white" />
                    ) : (
                      submitText
                    )}
                  </button>
                </Footer>
                {this.state.modalOpen &&
                  this.state.modalView === 'deleteConfirmation' && (
                    <DeleteConfirmationModal
                      title={this.state.currentProject.displayName}
                      flag={'remove'}
                      confirmationFunction={() =>
                        this.handleDeleteProject(
                          this.state.currentProject._id,
                          setFieldValue
                        )
                      }
                      onClose={this.handleCloseAddProjects}
                    />
                  )}
                {this.state.modalOpen &&
                  this.state.modalView === 'projectModal' && (
                    <PackageMeasureModal
                      uploadProjectImage={this.props.uploadProjectImage}
                      building={this.props.building}
                      handleCloseAddProjects={this.handleCloseAddProjects}
                      evaluateProject={this.props.evaluateProject}
                      createOrganizationProject={
                        this.props.createOrganizationProject
                      }
                      editOrganizationProject={
                        this.props.editOrganizationProject
                      }
                      addIncompleteProject={this.props.addIncompleteProject}
                      getProjectsAndMeasures={this.props.getProjectsAndMeasures}
                      currentProject={this.state.currentProject}
                      getUserById={this.props.getUserById}
                      getOrganizationName={this.props.getOrganizationName}
                      getOrganizationProjects={
                        this.props.getOrganizationProjects
                      }
                      deleteOrganizationProject={
                        this.props.deleteOrganizationProject
                      }
                      bulkAddProjects={this.props.bulkAddProjects}
                      endUse={this.props.endUse}
                      utilityMetrics={this.props.utilityMetrics}
                      buildingEquipment={this.props.buildingEquipment}
                      products={this.props.products}
                      getMeasures={this.props.getMeasures}
                      setFieldValue={setFieldValue}
                      projects={values.projects}
                      rates={this.state.rates}
                      existingMeasureNameList={[]}
                      index={
                        this.props.index === undefined
                          ? 0
                          : this.props.index + 1
                      }
                      target="MeasurePackage"
                    />
                  )}
                {this.state.modalOpen &&
                  this.state.modalView === 'projectPackageModal' && (
                    <ProjectPackagesModal
                      building={this.props.building}
                      onClose={this.handleCloseAddProjectPackages}
                      projectPackage={this.state.projectPackage}
                      endUse={this.props.endUse}
                      utilityMetrics={this.props.utilityMetrics}
                      buildingEquipment={this.props.buildingEquipment}
                      user={this.props.user}
                      viewMode={this.state.viewMode}
                      project={this.state.currentTempMeasurePackage}
                      setFieldValue={setFieldValue}
                    />
                  )}
              </Form>
            )
          }}
        </Formik>
      </div>
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
  addIncompleteProject: addMeasureForMeasurePackage,
  uploadProjectImage,
  evaluateProject,
  getUserById,
  bulkAddProjects,
  getProjectPackages,
  createMeasurePackage,
  updateMeasurePackage,
  createTempMeasurePackage,
  deleteMeasurePackage,
  deleteBulkMeasureForProject
}

const mapStateToProps = state => ({
  organizationView: state.organization.organizationView || {}
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MeasurePackageForm)
