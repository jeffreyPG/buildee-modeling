import React, { Component } from 'react'
import moment from 'moment'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { connect } from 'react-redux'
import { Formik, Field, Form, ErrorMessage } from 'formik'
import { FormSection, Field as FieldSelect } from '../FormFields'
import ScenarioBuildingList from '../../../components/Portfolio/Scenario/ScenarioBuildingList'
import { ScenarioProjectsModal, MeasurePackagesModal } from '../../Modal'
import { ProjectRates } from '../../../components/Project'
import { Footer } from '../../../components/UI/Footer'
import { Loader } from 'utils/Loader'
import {
  createScenario,
  updateScenario,
  addScenarioIncompleteProject
} from '../../../routes/Portfolio/modules/portfolio'
import {
  getProjectsAndMeasures,
  evaluateProject,
  bulkAddProjects,
  createOrganizationProject,
  editOrganizationProject,
  getOrganizationProjects,
  deleteOrganizationProject,
  uploadProjectImage,
  getOrganizationName,
  getUserById
} from '../../../routes/Building/modules/building'
import { getMeasures } from '../../../routes/Library/modules/library'
import { parentNodeHasClass, detectBrowser } from 'utils/Utils'
import { replaceHTMLEntities } from '../../../components/Project/ProjectHelpers'
import styles from './ScenarioForm.scss'
import formFieldStyles from '../FormFields/Field.module.scss'
import formStyles from '../FormFields/Form.scss'
import projectListStyles from '../../../components/Project/ProjectListing.scss'
import projectViewStyles from '../../../components/Project/ProjectView.scss'
import portfolioContainerStyles from '../../../components/Portfolio/PortfolioContainer.scss'
import scenarioStyles from '../../../components/Portfolio/Scenario/ScenarioBuildingList.scss'
import { getUnique } from '../../../static/building-space-types'

class ScenarioForm extends Component {
  static propTypes = {
    user: PropTypes.object.isRequired,
    scenario: PropTypes.object,
    onClose: PropTypes.func.isRequired,
    mode: PropTypes.oneOf(['addScenario', 'editScenario']).isRequired
  }

  state = {
    currentScenario: this.props.scenario,
    loading: false,
    showExtra: false,
    buildings: [],
    projects: [],
    organizations: [],
    currentProject: {},
    modalOpen: false,
    modalView: null,
    editingProject: false,
    showExtras: false,
    editingRates: false,
    hideProjectRates: true
  }

  UNSAFE_componentWillMount() {
    let { scenario } = this.props
    this.setState({
      buildings: (scenario && scenario.buildings) || [],
      projects: (scenario && scenario.projects) || [],
      organizations: (scenario && scenario.organizations) || []
    })
    document.addEventListener('mousedown', this.handleClick, false)
  }

  componentWillUnmount = () => {
    document.removeEventListener('mousedown', this.handleClick, false)
  }

  handleClick = e => {
    // the click is inside, continue to menu links
    if (this.state.showExtras) {
      if (this.node && this.node.contains(e.target)) return
      this.setState({ showExtras: false })
    } else {
      if (parentNodeHasClass(e.target, 'extrasClick')) return
      // otherwise, toggle (close) the app dropdown
      this.handleToggleExtras(null)
    }
  }

  handleToggleExtrasForNewButton = () => {
    this.setState(prevState => ({
      showExtras: !prevState.showExtras
    }))
  }

  handleChanged = ({ event, setFieldValue, field }) => {
    setFieldValue(field, event.target.value)
  }

  handleSubmit = async values => {
    const { mode, onClose } = this.props
    let updatedValues = Object.assign({}, values)
    let projects = updatedValues.projects || []
    delete updatedValues.projects
    let projectIds = projects
      .filter(project => project.collectionTarget === 'measure')
      .map(project => project._id)
    let measurePackageIds = projects
      .filter(project => project.collectionTarget === 'measurePackage')
      .map(project => project._id)
    updatedValues.projectIds = projectIds
    updatedValues.measurePackageIds = measurePackageIds
    if (updatedValues.estimatedStartDate === 'yyyy/mm/dd') {
      updatedValues.estimatedStartDate = moment()
        .utc()
        .format('YYYY-MM-DD')
    }
    if (updatedValues.estimatedCompletionDate === 'yyyy/mm/dd') {
      updatedValues.estimatedCompletionDate = moment()
        .utc()
        .format('YYYY-MM-DD')
    }
    switch (mode) {
      case 'addScenario':
        {
          await this.props.createScenario(updatedValues)
        }
        break
      case 'editScenario':
        {
          await this.props.updateScenario(updatedValues)
        }
        break
      default:
        break
    }
    return onClose()
  }

  changeBuildings = (setFieldValue, list, buildingList, data = []) => {
    const { buildings } = this.state
    let ids = buildings.map(building => building._id)
    let filterBuildingList = buildingList.filter(
      building => ids.indexOf(building._id) === -1
    )
    let { organizations } = this.state
    if (!organizations) organizations = []
    if (data.length) organizations = [...organizations, ...data]
    organizations = getUnique(organizations, 'buildingId')
    organizations = organizations.filter(
      org => list.indexOf(org.buildingId) !== -1
    )
    setFieldValue('organizations', organizations)
    setFieldValue('buildingIds', list)
    this.setState({
      buildings: [...buildings, ...filterBuildingList],
      organizations: organizations
    })
  }

  handleToggleExtras = index => {
    if (index === this.state.showExtra) {
      // toggle off
      this.setState({ showExtra: '' })
      return
    }
    this.setState({ showExtra: index })
  }

  handleEditProject = project => {
    project.isEditing = true
    let collectionTarget = project.collectionTarget || 'measure'
    if (collectionTarget === 'measure') {
      this.setState({
        modalOpen: true,
        modalView: 'projectModal',
        currentProject: project
      })
    } else {
      this.setState({
        modalOpen: true,
        currentProject: project,
        viewMode: 'editMeasurePackage',
        modalView: 'measurePackageModal'
      })
    }
  }

  handleOpenAddProjects = () => {
    this.setState({
      modalOpen: true,
      editingProject: false,
      modalView: 'projectModal'
    })
  }

  handleDateFields = (e, field, setFieldValue) => {
    setFieldValue(field, e.target.value)
  }

  deleteProject = (project, setFieldValue, setFieldTouched, values) => {
    let { projects } = values
    projects = projects.filter(pro => pro._id != project._id)
    setFieldValue('projects', projects)
    setFieldTouched('projects')
  }

  handleCloseAddProjects = (
    projects,
    project,
    setFieldValue,
    setFieldTouched
  ) => {
    if (project && Object.entries(project).length != 0) {
      let updatedProjects = projects
      updatedProjects = updatedProjects.filter(item => item._id != project._id)
      updatedProjects = [...updatedProjects, project]
      setFieldValue('projects', updatedProjects)
      setFieldTouched('projects')
    }
    this.setState({
      modalOpen: false,
      modalView: null,
      currentProject: {},
      matchingEaMeasures: [],
      editingRates: false,
      searchValue: ''
    })
  }

  handleOpenAddMeasurePackage = () => {
    this.setState({
      modalOpen: true,
      currentMeasurePackage: {},
      viewMode: 'addMeasurePackage',
      modalView: 'measurePackageModal'
    })
  }

  handleStartEdit = () => {
    this.setState({ editingRates: true })
  }

  handleHideProjectRates = () => {
    this.setState(prevState => ({
      hideProjectRates: !prevState.hideProjectRates
    }))

    if (this.state.hideProjectRates) {
      this.setState({ editingRates: false })
    }
  }

  handleHideForm = () => {
    this.setState({ editingRates: false })
  }
  onRatesSubmit = async (
    values,
    setFieldValue,
    formValues,
    setFieldTouched
  ) => {
    setFieldValue('rates', values)
    setFieldTouched('rates')
  }

  render() {
    const { filters, mode } = this.props
    const { currentScenario, loading, showExtras } = this.state
    const { browserName } = detectBrowser()
    const defaultRate = {
      investmentPeriod: 10,
      inflationRate: 0.5,
      discountRate: 2.5,
      financeRate: '',
      reinvestmentRate: '',
      electric: 0,
      steam: 0,
      gas: 0,
      water: 0,
      fuelOil2: 0,
      fuelOil4: 0,
      fuelOil56: 0,
      diesel: 0,
      other: 0
    }

    const initialValues = {
      _id: (currentScenario && currentScenario._id) || 'New',
      name: (currentScenario && currentScenario.name) || '',
      description: (currentScenario && currentScenario.description) || '',
      buildingIds: (currentScenario && currentScenario.buildingIds) || [],
      projects: (currentScenario && currentScenario.projects) || [],
      filters: filters || [],
      estimatedStartDate:
        (currentScenario && currentScenario.estimatedStartDate) || '',
      estimatedCompletionDate:
        (currentScenario && currentScenario.estimatedCompletionDate) || '',
      organizations: (currentScenario && currentScenario.organizations) || []
      // rates: (currentScenario && currentScenario.rates) || defaultRate
    }

    if (initialValues.estimatedStartDate) {
      initialValues.estimatedStartDate = moment(
        initialValues.estimatedStartDate
      )
        .utc()
        .format('YYYY-MM-DD')
    } else {
      if (browserName === 'Safari') {
        initialValues.estimatedStartDate = 'yyyy/mm/dd'
      }
    }

    if (initialValues.estimatedCompletionDate) {
      initialValues.estimatedCompletionDate = moment(
        initialValues.estimatedCompletionDate
      )
        .utc()
        .format('YYYY-MM-DD')
    } else {
      if (browserName === 'Safari') {
        initialValues.estimatedCompletionDate = 'yyyy/mm/dd'
      }
    }

    let submitText

    switch (mode) {
      case 'addScenario':
        submitText = 'Add Scenario'
        break
      case 'editScenario':
        submitText = 'Update Scenario'
        break
    }

    return (
      <div className={styles.formWrapper}>
        <Formik
          initialValues={initialValues}
          onSubmit={(values, { setSubmitting }) => {
            setSubmitting(true)
            this.handleSubmit(values).then(() => setSubmitting(false))
          }}
          validate={values => {
            let errors = {}

            if (values.name.length === 0) {
              errors.name = 'Name is required'
            }
            return errors
          }}
        >
          {({
            values,
            isSubmitting,
            isValid,
            setFieldValue,
            setFieldTouched
          }) => (
            <Form className={styles.form}>
              <div className={styles.assetForm}>
                <FormSection
                  title="Details"
                  description="Add basic information about your scenario"
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
                    label="Scenario Name"
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
                  <ErrorMessage
                    name="description"
                    component="div"
                    className={styles.formError}
                  />
                  <div>
                    <span className={formFieldStyles.label}>Description</span>
                    <Field
                      label="description"
                      component="textarea"
                      name="description"
                      value={values.description}
                      onChange={event =>
                        this.handleChanged({
                          event,
                          setFieldValue,
                          field: 'description'
                        })
                      }
                    />
                  </div>
                </FormSection>
                <FormSection
                  title="Measure"
                  description="Add measure to your scenario"
                >
                  {/* <div>
                    <div
                      className={classNames(
                        projectViewStyles.panel,
                        projectViewStyles.projectsRates
                      )}
                    >
                      <div className={projectViewStyles.panelHeader}>
                        <div className={projectViewStyles.projectsRatesHeader}>
                          <div
                            className={projectViewStyles.panelDropdownClick}
                            onClick={this.handleHideProjectRates}
                          >
                            {this.state.hideProjectRates ? (
                              <i className="material-icons">arrow_drop_up</i>
                            ) : (
                              <i className="material-icons">arrow_drop_down</i>
                            )}
                          </div>
                          <h3>Settings</h3>
                        </div>
                        {!this.state.editingRates && (
                          <div
                            className={classNames(
                              projectViewStyles.panelEdit,
                              this.state.hideProjectRates
                                ? projectViewStyles.panelEditHide
                                : ''
                            )}
                            onClick={this.handleStartEdit}
                          >
                            <i className="material-icons">edit</i>
                          </div>
                        )}
                      </div>
                      {this.state.editingRates && (
                        <ProjectRates
                          onRatesSubmit={this.onRatesSubmit}
                          hideProjectsRate={this.state.hideProjectRates}
                          initialValues={values.rates}
                          handleHideForm={this.handleHideForm}
                          setFieldValue={setFieldValue}
                          setFieldTouched={setFieldTouched}
                          formValues={values}
                          modeFrom="Scenario"
                        />
                      )}
                    </div>
                  </div>
                   */}
                  <div>
                    <span className={styles.label}>Name</span>
                    <div className={styles.projectContainer}>
                      {values.projects.map((project, index) => (
                        <div key={index} className={styles.project}>
                          <div
                            className={styles.projectName}
                            onClick={() => this.handleEditProject(project)}
                          >
                            {project.collectionTarget === 'measurePackage' && (
                              <i
                                className={classNames(
                                  'material-icons',
                                  styles.measurePackageIcon
                                )}
                              >
                                library_books
                              </i>
                            )}
                            &nbsp;
                            {replaceHTMLEntities(
                              project.collectionTarget === 'measure'
                                ? project.displayName
                                : project.name
                            )}
                          </div>
                          <div
                            data-test="public-project-extras-button"
                            onClick={() => this.handleToggleExtras(index)}
                            className={classNames(
                              projectListStyles.extras,
                              'extrasClick',
                              this.state.showExtra === index
                                ? projectListStyles.extrasShow
                                : projectListStyles.extrasHide
                            )}
                          >
                            <span className={projectListStyles.extrasButton} />
                            <div
                              className={classNames(
                                projectListStyles.extrasDropdown,
                                projectListStyles.extrasDropdownRight
                              )}
                            >
                              <div
                                className={projectListStyles.extrasLink}
                                onClick={() =>
                                  this.deleteProject(
                                    project,
                                    setFieldValue,
                                    setFieldTouched,
                                    values
                                  )
                                }
                              >
                                <i className="material-icons">delete</i>
                                {project.collectionTarget === 'measure'
                                  ? 'Delete Measure'
                                  : 'Delete Measure Package'}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div
                      className={classNames(
                        projectViewStyles.extras,
                        showExtras
                          ? projectViewStyles.extrasShow
                          : projectViewStyles.extrasHide
                      )}
                      ref={node => (this.node = node)}
                    >
                      <button
                        type="button"
                        className={classNames(
                          projectViewStyles.button,
                          projectViewStyles.buttonPrimary
                        )}
                        onClick={() => {
                          if (!loading) this.handleToggleExtrasForNewButton()
                        }}
                      >
                        {loading ? (
                          <Loader size="button" color="white" />
                        ) : (
                          <div>
                            <i className="material-icons">add</i>New
                            <span> Measure</span>
                          </div>
                        )}
                      </button>
                      <div
                        className={classNames(
                          projectViewStyles.extrasDropdown,
                          projectViewStyles.extrasDropdownRight
                        )}
                      >
                        <div
                          className={projectViewStyles.extrasLink}
                          onClick={this.handleOpenAddProjects}
                        >
                          <i className="material-icons">add</i>
                          {'Measure'}
                        </div>
                        {/* <div
                        className={projectViewStyles.extrasLink}
                        onClick={this.handleOpenAddMeasurePackage}
                      >
                        <i className="material-icons">add</i>
                        {'Measure Package'}
                      </div> */}
                      </div>
                    </div>
                  </div>
                </FormSection>
                <FormSection
                  title="Construction"
                  description="Add construction for your project"
                >
                  <ErrorMessage
                    name="constructionStatus"
                    component="div"
                    className={styles.formError}
                  />
                  <div className={styles.date}>
                    <span className={formFieldStyles.label}>
                      Estimated Date
                    </span>
                    <div className={styles.dateContainer}>
                      <div className={styles.dateContainerSection}>
                        <ErrorMessage
                          name="estimatedStartDate"
                          component="div"
                          className={styles.formError}
                        />
                        <label>
                          <small>Start Date</small>
                        </label>
                        <Field
                          type="date"
                          component="input"
                          name="estimatedStartDate"
                          value={values.estimatedStartDate}
                          onChange={e =>
                            this.handleDateFields(
                              e,
                              'estimatedStartDate',
                              setFieldValue
                            )
                          }
                        />
                      </div>
                      <div className={styles.dateContainerSection}>
                        <ErrorMessage
                          name="estimatedCompletionDate"
                          component="div"
                          className={styles.formError}
                        />
                        <label>
                          <small>Completion Date</small>
                        </label>
                        <Field
                          type="date"
                          component="input"
                          name="estimatedCompletionDate"
                          value={values.estimatedCompletionDate}
                          onChange={e =>
                            this.handleDateFields(
                              e,
                              'estimatedCompletionDate',
                              setFieldValue
                            )
                          }
                        />
                      </div>
                    </div>
                  </div>
                </FormSection>

                <div>
                  <div className={formStyles.formSectionDescription}>
                    <p>Buildings</p>
                    <span>Filter, search and select buildings</span>
                  </div>
                  <ScenarioBuildingList
                    filters={filters}
                    setFieldValue={setFieldValue}
                    setFieldTouched={setFieldTouched}
                    buildingIds={values.buildingIds}
                    changeBuildings={this.changeBuildings}
                    scenarioBuildings={this.state.buildings}
                    routeOrganizationId={this.props.routeOrganizationId}
                  />
                </div>
              </div>
              {loading && (
                <div
                  className={classNames(
                    portfolioContainerStyles.portfolioContainerLoading,
                    scenarioStyles.portfolioContainerLoading
                  )}
                >
                  <Loader />
                  <div
                    className={classNames(
                      portfolioContainerStyles.loadingBuilding,
                      scenarioStyles.loadingBuilding
                    )}
                  >
                    <div>One moment while we get your data...</div>
                  </div>
                </div>
              )}
              <Footer>
                <button
                  className={classNames(styles.button, styles.buttonSecondary)}
                  onClick={this.props.onClose}
                >
                  Cancel
                </button>
                <button
                  className={classNames(styles.button, styles.buttonPrimary, {
                    [styles.buttonDisable]: !isValid
                  })}
                  disabled={!isValid}
                  type="submit"
                  data-test="user-scenario-add-button"
                >
                  {loading || isSubmitting ? (
                    <Loader size="button" color="white" />
                  ) : (
                    submitText
                  )}
                </button>
              </Footer>
              {this.state.modalOpen &&
                this.state.modalView === 'projectModal' && (
                  <ScenarioProjectsModal
                    uploadProjectImage={this.props.uploadProjectImage}
                    scenario={this.state.currentScenario}
                    handleCloseAddProjects={this.handleCloseAddProjects}
                    evaluateProject={this.props.evaluateProject}
                    createOrganizationProject={
                      this.props.createOrganizationProject
                    }
                    editOrganizationProject={this.props.editOrganizationProject}
                    addIncompleteProject={this.props.addIncompleteProject}
                    getProjectsAndMeasures={this.props.getProjectsAndMeasures}
                    currentProject={this.state.currentProject}
                    getUserById={this.props.getUserById}
                    getOrganizationName={this.props.getOrganizationName}
                    getOrganizationProjects={this.props.getOrganizationProjects}
                    deleteOrganizationProject={
                      this.props.deleteOrganizationProject
                    }
                    bulkAddProjects={this.props.bulkAddProjects}
                    products={this.props.products}
                    setFieldValue={setFieldValue}
                    setFieldTouched={setFieldTouched}
                    buildingIds={values.buildingIds}
                    projects={values.projects}
                    getMeasures={this.props.getMeasures}
                  />
                )}
              {this.state.modalOpen &&
                this.state.modalView === 'measurePackageModal' && (
                  <MeasurePackagesModal
                    measurePackage={this.state.currentMeasurePackage}
                    endUse={{}}
                    user={this.props.user}
                    viewMode={this.state.viewMode}
                    scenario={this.state.currentScenario}
                    onClose={this.handleCloseAddProjects}
                    createOrganizationProject={
                      this.props.createOrganizationProject
                    }
                    editOrganizationProject={this.props.editOrganizationProject}
                    addIncompleteProject={this.props.addIncompleteProject}
                    getProjectsAndMeasures={this.props.getProjectsAndMeasures}
                    measurePackage={this.state.currentProject}
                    getUserById={this.props.getUserById}
                    getOrganizationName={this.props.getOrganizationName}
                    getOrganizationProjects={this.props.getOrganizationProjects}
                    deleteOrganizationProject={
                      this.props.deleteOrganizationProject
                    }
                    bulkAddProjects={this.props.bulkAddProjects}
                    products={this.props.products}
                    setFieldValue={setFieldValue}
                    setFieldTouched={setFieldTouched}
                    buildingIds={values.buildingIds}
                    projects={values.projects}
                    getMeasures={this.props.getMeasures}
                    page="scenario"
                  />
                )}
            </Form>
          )}
        </Formik>
      </div>
    )
  }
}

const mapDispatchToProps = {
  createScenario,
  updateScenario,
  uploadProjectImage,
  editOrganizationProject,
  getProjectsAndMeasures,
  getOrganizationName,
  getOrganizationProjects,
  deleteOrganizationProject,
  bulkAddProjects,
  getUserById,
  createOrganizationProject,
  evaluateProject,
  addIncompleteProject: addScenarioIncompleteProject,
  getMeasures
}

const mapStateToProps = state => ({
  products: (state.login.user && state.login.user.products) || {},
  user: state.login.user || {}
})

export default connect(mapStateToProps, mapDispatchToProps)(ScenarioForm)
