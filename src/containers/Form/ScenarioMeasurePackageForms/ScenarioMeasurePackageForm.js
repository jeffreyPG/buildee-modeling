import React, { Component } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { connect } from 'react-redux'
import { Formik, Field, Form, ErrorMessage } from 'formik'
import styles from '../ScenarioForms/ScenarioForm.scss'
import formFieldStyles from '../FormFields/Field.module.scss'
import formStyles from './ScenarioMeasurePackageForm.scss'
import projectFormStyles from '../ProjectForms/ProjectForm.scss'
import { Footer } from '../../../components/UI/Footer'
import { FormSection, Field as FieldSelect } from '../FormFields'
import ImagesField from '../FormFields/ImagesField'
import DeleteConfirmationModal from '../../Modal/DeleteConfirmationModal'
import { ScenarioProjectsModal } from '../../Modal'
import TextQuillEditor from '../../../components/UI/TextEditor/TextQuillEditor'
import MeasureCategory from '../MeasurePackageForms/MeasureCategory'
import { Loader } from 'utils/Loader'
import { replaceHTMLEntities } from '../../../components/Project/ProjectHelpers'
import { isProdEnv, parentNodeHasClass } from 'utils/Utils'
import projectListStyles from '../../../components/Project/ProjectListing.scss'
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
import {
  addScenarioIncompleteProject,
  addScenarioMesaurePackage
} from '../../../routes/Portfolio/modules/portfolio'
import { getMeasures } from '../../../routes/Library/modules/library'

class ScenarioMeasurePackageForm extends Component {
  static propTypes = {
    onClose: PropTypes.func.isRequired,
    mode: PropTypes.oneOf(['addMeasurePackage', 'editMeasurePackage'])
      .isRequired
  }

  state = {
    currentMeasurePackage: this.props.measurePackage,
    currentProject: {},
    projectsToShow:
      (this.props.measurePackage && this.props.measurePackage.projects) || [],
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
    showExtra: false
  }

  UNSAFE_componentWillMount() {
    document.addEventListener('mousedown', this.handleClick, false)
  }

  componentWillUnmount = () => {
    document.removeEventListener('mousedown', this.handleClick, false)
  }

  handleToggleExtras = index => {
    if (index === this.state.showExtra) {
      // toggle off
      this.setState({ showExtra: '' })
      return
    }
    this.setState({ showExtra: index })
  }

  handleClick = e => {
    // the click is inside, continue to menu links
    if (parentNodeHasClass(e.target, 'extrasClick')) return
    // otherwise, toggle (close) the app dropdown
    this.handleToggleExtras(null)
  }

  deleteProject = (project, setFieldValue, setFieldTouched, values) => {
    let { projects } = values
    projects = projects.filter(pro => pro._id != project._id)
    setFieldValue('projects', projects)
    setFieldTouched('projects')
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
    let { mode, onClose } = this.props
    let updatedValues = Object.assign({}, values)
    let ids = updatedValues.projects.map(project => project._id)
    delete updatedValues.projects
    delete updatedValues.projectIds

    updatedValues.projects = ids

    let response = await this.props.addMeasurePackage(updatedValues)
    return onClose(
      this.props.projects,
      response.measurePackage,
      this.props.setFieldValue,
      this.props.setFieldTouched
    )
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
      this.setState({
        projectsToShow: updatedProjects,
        originProjects: updatedProjects,
        modalOpen: false,
        modalView: null,
        currentProject: {},
        editingRates: false
      })
    } else {
      this.setState({
        modalOpen: false,
        modalView: null,
        currentProject: {},
        editingRates: false
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
      editingRates: false
    })
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

  render() {
    const { mode } = this.props

    let {
      currentMeasurePackage,
      loading,
      projectsToShow,
      statusOptions,
      typeOptions,
      budgetTypeOptions
    } = this.state
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
            setFieldTouched,
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
                    <div>
                      <span className={formFieldStyles.label}>Description</span>
                      <TextQuillEditor
                        handleChange={html =>
                          this.handleDescriptionChange(html, setFieldValue)
                        }
                        html={values.description || ''}
                        placeholder="Enter Project Description"
                        index={
                          this.props.index === undefined
                            ? 0
                            : this.props.index + 1
                        }
                        hidePersonalize={true}
                      />
                    </div>
                  </FormSection>
                  <FormSection
                    title="Measure"
                    description="Add measure to your scenario"
                  >
                    <span className={styles.label}>Name</span>
                    <div className={styles.projectContainer}>
                      {values.projects.map((project, index) => (
                        <div key={index} className={styles.project}>
                          <div
                            className={styles.projectName}
                            onClick={() => this.handleEditMeasure(project)}
                          >
                            {replaceHTMLEntities(project.displayName)}
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
                                <i className="material-icons">delete</i>Delete
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
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
                  </FormSection>
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
                    <ScenarioProjectsModal
                      uploadProjectImage={this.props.uploadProjectImage}
                      scenario={this.state.currentScenario}
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
                      products={this.props.products}
                      setFieldValue={setFieldValue}
                      setFieldTouched={setFieldTouched}
                      buildingIds={values.buildingIds}
                      projects={values.projects}
                      getMeasures={this.props.getMeasures}
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
  getMeasures,
  addMeasurePackage: addScenarioMesaurePackage
}

const mapStateToProps = state => ({
  organizationView: state.organization.organizationView || {}
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ScenarioMeasurePackageForm)
