import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import styles from './ActionForm.scss'
import { Formik, Form, FieldArray } from 'formik'
import { Field, FormSection } from '../FormFields'
import { Mutation, Query } from 'react-apollo'
import { Loader } from 'utils/Loader'
import { Footer } from '../../../components/UI/Footer'
import ActionContact from './ActionContact'
import moment from 'moment'
import SortableList from '../../../components/UI/SortableList'
import ProjectsModal from '../../Modal/ProjectsModal'

import {
  GET_ACTION_TEMPLATES,
  ADD_ACTION,
  UPDATE_ACTION,
  updateAfterCreateAction,
  updateAfterUpdateAction,
  GET_ACTIONS
} from '../../../utils/graphql/queries/actions.js'

export class ActionForm extends React.Component {
  static propTypes = {
    user: PropTypes.object.isRequired,
    building: PropTypes.object.isRequired,
    action: PropTypes.object,
    onClose: PropTypes.func.isRequired,
    onSelect: PropTypes.func.isRequired,
    mode: PropTypes.oneOf(['viewAction', 'addAction', 'editAction']).isRequired,
    projectModalProps: PropTypes.object,
    setSectionRef: PropTypes.func
  }

  static defaultProps = {
    mode: 'viewAction'
  }

  state = {
    currentAction: this.props.action,
    currentProject: null,
    currentProjectType: null,
    projectMap: {},
    projectModalOpen: false
  }

  UNSAFE_componentWillMount = () => {
    if (this.props.building && this.props.building.projects) {
      this.setState({
        projectMap: this.props.building.projects.reduce((acc, project) => {
          return Object.assign(acc, { [project._id]: project })
        }, {})
      })
    }
  }

  validateUpdateAction = (values, errors = {}) => {
    if (!values.type) {
      errors.type = 'Type not selected'
    }

    if (!values.date) {
      errors.date = 'Date not selected'
    }

    return errors
  }

  validateAddAction = (values, errors = {}) => {
    if (!values.type) {
      errors.type = 'Type not selected'
    }

    if (!values.date) {
      errors.date = 'Date not selected'
    }
    return errors
  }

  validateForm = (values, actions) => {
    let errors = {}
    switch (this.props.mode) {
      case 'viewAction':
        return errors
      case 'addAction':
        return this.validateAddAction(values, errors)
      case 'editAction':
        return this.validateUpdateAction(values, errors)
    }
  }

  validateInitial = values => {
    let errors = {}
    switch (this.props.mode) {
      case 'viewAction':
        break
      case 'addAction':
        errors = this.validateAddAction(values, errors)
        break
      case 'editAction':
        errors = this.validateUpdateAction(values, errors)
        break
    }

    return errors.length == 0
  }

  setAction = (templateId, values, actionTemplates, setValues) => {
    let action,
      projects = []
    if (this.state.currentAction) {
      action = this.state.currentAction
      projects = this.state.currentAction.projects
    } else {
      let currentTemplate = actionTemplates.find(
        template => template._id === templateId
      )
      action = currentTemplate
      action.templateId = currentTemplate._id
      projects = []
    }

    const contacts = (action.contacts || []).map(contact =>
      Object.keys(contact).reduce(
        (acc, key) => Object.assign(acc, { [key]: contact[key] || '' }),
        {}
      )
    )

    setValues({
      type: action.type,
      templateId: action.templateId,
      description: action.description,
      name: action.name,
      date: moment(new Date(parseInt(action.date))).format('YYYY-MM-DD'),
      contacts,
      fields:
        action.fields.map(({ value, ...attributes }) => ({
          ...attributes,
          value: value || ''
        })) || [],
      projects
    })

    this.props.onSelect()
  }

  handleOpenProject = project => {
    if (project.measureId) {
      //this is a project
      let { _id, measureId, status } = project
      let currentProject = this.state.projectMap[_id]
      Object.assign(currentProject, { _id, measureId, status })
      this.setState({
        currentProject: currentProject,
        projectModalOpen: true,
        currentProjectType: 'project'
      })
    } else {
      //this is a measure
      this.setState({
        currentProject: project,
        projectModalOpen: true,
        currentProjectType: 'measure'
      })
    }
  }

  handleCloseProject = (new_project, values, setFieldValue) => {
    if (new_project) {
      let { currentProject, currentProjectType } = this.state
      let currentMeasureId =
        currentProjectType === 'measure'
          ? currentProject._id
          : currentProject.measureId

      let updatedProject = Object.assign(new_project, {
        status: 'IN_PROGRESS',
        measureId: currentMeasureId
      })

      let projects = values.projects.reduce(
        (acc, project) => {
          if (project.measureId !== currentMeasureId) {
            acc.push(project)
          }
          return acc
        },
        [updatedProject]
      )
      this.setState({
        currentProject: {},
        projectModalOpen: false,
        projectMap: Object.assign(this.state.projectMap, {
          [new_project._id]: new_project
        })
      })
      setFieldValue('projects', projects)
    } else {
      this.setState({ currentProject: {}, projectModalOpen: false })
    }
  }

  handleSubmit = (executeMutation, values) => {
    switch (this.props.mode) {
      case 'viewAction':
        return true
      case 'addAction':
        return executeMutation({
          variables: {
            action: {
              name: values.name,
              type: values.type,
              date: moment(values.date).format('x'),
              description: values.description,
              templateId: values.templateId,
              fields: values.fields.map(({ name, type, value, values }) => ({
                name,
                type,
                value,
                values
              })),
              contacts: values.contacts.map(
                ({ __typename, mode, name, ...fields }) => ({
                  ...fields
                })
              ),
              projects: values.projects.map(({ _id, measureId, status }) => ({
                _id,
                measureId,
                status
              })),
              comments: values.comments,
              buildingId: this.props.building._id,
              createdByUserId: this.props.user._id
            }
          }
        })
          .then(
            this.props.projectModalProps.getProjectsAndMeasures(
              this.props.building._id
            )
          )
          .then(this.props.onClose)
      case 'editAction':
        return executeMutation({
          variables: {
            action: {
              _id: this.props.action._id,
              date: moment(values.date).format('x'),
              description: values.description,
              fields: values.fields.map(({ name, type, value, values }) => ({
                name,
                type,
                value,
                values
              })),
              contacts: values.contacts.map(
                ({ __typename, mode, name, ...fields }) => ({
                  ...fields
                })
              ),
              projects: values.projects.map(({ _id, measureId, status }) => ({
                _id,
                measureId,
                status
              })),
              comments: values.comments,
              buildingId: this.props.building._id
            }
          }
        })
          .then(
            this.props.projectModalProps.getProjectsAndMeasures(
              this.props.building._id
            )
          )
          .then(this.props.onClose)
    }
  }

  getProjectStatus(status) {
    switch (status) {
      case 'EVALUATED':
        return 'Evaluated'
      case 'INITIATED':
        return 'Initiated'
      case 'IN_PROGRESS':
        return 'In Progress'
      case 'COMPLETED':
        return 'Completed'
      case 'VERIFIED':
        return 'Verified'
      default:
        return 'Not Started'
    }
  }

  filterActionTemplates(templates) {
    if (this.props.user.products.buildeeNYC === 'access') {
      return templates
    } else {
      return templates.filter(template => {
        return (
          template.type !== 'LL84_BENCHMARKING' &&
          template.type !== 'LL87_ENERGY_AUDIT' &&
          template.type !== 'LL87_RCX'
        )
      })
    }
  }

  render() {
    const { currentAction } = this.state

    if (currentAction && currentAction.templateId) {
      // this.tabs.push('Schedule', 'Comments')
    }

    const initialValues = {
      type: (currentAction && currentAction.type) || '',
      templateId: (currentAction && currentAction.templateId) || '',
      _id: (currentAction && currentAction._id) || '',
      description: (currentAction && currentAction.description) || '',
      name: (currentAction && currentAction.name) || '',
      date:
        (currentAction &&
          moment(new Date(parseInt(currentAction.date))).format(
            'YYYY-MM-DD'
          )) ||
        moment(new Date()).format('YYYY-MM-DD'),
      fields: (currentAction && currentAction.fields) || [],
      projects: (currentAction && currentAction.projects) || [],
      comments: (currentAction && currentAction.comments) || '',
      contacts: (currentAction && currentAction.contacts) || []
    }

    let mutation,
      updateAfterMutation,
      submitText,
      showSubmit,
      updateVariables = { action: { buildingId: this.props.building._id } },
      queryVariables = {}

    switch (this.props.mode) {
      case 'viewAction':
        mutation = UPDATE_ACTION
        updateAfterMutation = (...args) =>
          updateAfterUpdateAction(...args, updateVariables)
        submitText = ''
        showSubmit = false
        break
      case 'addAction':
        mutation = ADD_ACTION
        updateAfterMutation = (...args) =>
          updateAfterCreateAction(...args, updateVariables)
        submitText = 'Add Action'
        showSubmit = true
        break
      case 'editAction':
        mutation = UPDATE_ACTION
        updateAfterMutation = (...args) =>
          updateAfterUpdateAction(...args, updateVariables)
        submitText = 'Update Action'
        showSubmit = true
        queryVariables = { actionTemplate: { _id: currentAction.templateId } }
        break
    }

    return (
      <Mutation
        mutation={mutation}
        update={updateAfterMutation}
        refetchQueries={result => [
          {
            query: GET_ACTIONS,
            variables: {
              action: { buildingId: this.props.building._id, type: 'LL87_RCX' }
            }
          },
          {
            query: GET_ACTIONS,
            variables: {
              action: {
                buildingId: this.props.building._id,
                type: 'LL87_ENERGY_AUDIT'
              }
            }
          }
        ]}
      >
        {(executeMutation, { data, loading }) => (
          <div className={styles.formWrapper}>
            <Query query={GET_ACTION_TEMPLATES} variables={queryVariables}>
              {({ loading, data: { actionTemplates = [] } }) => {
                if (loading) {
                  return <Loader />
                }
                actionTemplates = this.filterActionTemplates(actionTemplates)
                return (
                  <Formik
                    ref={this.formik}
                    initialValues={initialValues}
                    isInitialValid={() => this.validateInitial(initialValues)}
                    validate={values =>
                      this.validateForm(values, actionTemplates)
                    }
                    onSubmit={action =>
                      this.handleSubmit(executeMutation, action)
                    }
                  >
                    {({
                      values,
                      isSubmitting,
                      isValid,
                      setFieldValue,
                      setValues
                    }) => {
                      let selectedTemplate =
                        values.templateId &&
                        actionTemplates.find(
                          templates => templates._id === values.templateId
                        )

                      let measures =
                        (selectedTemplate &&
                          selectedTemplate.measures.reduce(
                            (result, measure) => {
                              if (!measure) return result
                              let { _id, status, measureId } =
                                values.projects.find(
                                  project => project.measureId === measure._id
                                ) || {}
                              return result.concat(
                                _id
                                  ? Object.assign(
                                      { _id, status, measureId },
                                      this.state.projectMap[_id]
                                    )
                                  : measure
                              )
                            },
                            []
                          )) ||
                        []
                      return (
                        <div className={styles.form}>
                          <Form id={this.props.name}>
                            <FormSection
                              title="Details"
                              description=""
                              setSectionRef={this.props.setSectionRef}
                            >
                              <div className={styles.formInputRow}>
                                <div
                                  className={classNames(
                                    styles.formInput,
                                    'slectDropDown'
                                  )}
                                >
                                  <label className={styles.formInputLabel}>
                                    Type
                                  </label>
                                  <select
                                    className={styles.formInputField}
                                    value={values.templateId}
                                    disabled={!!values._id}
                                    data-test="action-type"
                                    onChange={e =>
                                      this.setAction(
                                        e.target.value,
                                        values,
                                        actionTemplates,
                                        setValues,
                                        setFieldValue
                                      )
                                    }
                                  >
                                    <option value="" disabled defaultValue>
                                      Select a type
                                    </option>
                                    {actionTemplates.map(({ _id, name }) => (
                                      <option key={_id} value={_id}>
                                        {name}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                              </div>
                              {values.templateId && (
                                <div className={styles.formInputRow}>
                                  <Field
                                    label="Description"
                                    component="textarea"
                                    name="description"
                                    placeholder="Add a description for this action"
                                    data-test="action-description"
                                  />
                                </div>
                              )}

                              {values.templateId && (
                                <div className={styles.formInputRow}>
                                  <Field
                                    label="Date"
                                    component="input"
                                    type="date"
                                    name="date"
                                    placeholder="MM/DD/YYYY"
                                  />
                                </div>
                              )}
                              {values.templateId &&
                                values.fields.map((field, index) => {
                                  if (field.type === 'OPTIONS') {
                                    return (
                                      <div
                                        className={styles.formInputRow}
                                        key={`fields-${index}`}
                                      >
                                        <Field
                                          label={field.name}
                                          component="select"
                                          name={`fields[${index}].value`}
                                          placeholder={field.name}
                                        >
                                          {field.values.reduce(
                                            (acc, value, optionIndex) =>
                                              acc.concat(
                                                <option
                                                  key={`fields-${index}-${optionIndex}`}
                                                  value={value}
                                                >
                                                  {value}
                                                </option>
                                              ),
                                            [
                                              <option
                                                key="default"
                                                value=""
                                                disabled={true}
                                              >
                                                Select an type
                                              </option>
                                            ]
                                          )}
                                        </Field>
                                      </div>
                                    )
                                  } else {
                                    return (
                                      <div
                                        className={styles.formInputRow}
                                        key={`fields-${index}`}
                                      >
                                        <Field
                                          label={field.name}
                                          component="input"
                                          name={`fields[${index}].value`}
                                          placeholder={field.name}
                                        />
                                      </div>
                                    )
                                  }
                                })}
                            </FormSection>

                            {values.templateId && (
                              <FormSection
                                title="Contacts"
                                description=""
                                setSectionRef={this.props.setSectionRef}
                              >
                                <FieldArray name="contacts">
                                  {arrayHelpers => {
                                    return (
                                      <div>
                                        {values.contacts.map(
                                          (
                                            { mode = 'view', ...contact },
                                            index
                                          ) => (
                                            <div
                                              className={styles.formInputRow}
                                              key={`$contact-${index}`}
                                            >
                                              <ActionContact
                                                contact={contact}
                                                index={index}
                                                mode={mode}
                                                onRemoveContact={initialValue => {
                                                  if (mode === 'new') {
                                                    arrayHelpers.remove(index)
                                                  } else {
                                                    arrayHelpers.replace(
                                                      index,
                                                      initialValue
                                                    )
                                                  }
                                                }}
                                              />
                                            </div>
                                          )
                                        )}
                                        {selectedTemplate.contacts.length ===
                                          0 && (
                                          <div className={styles.formInputRow}>
                                            <div>
                                              <button
                                                className={classNames(
                                                  styles.button,
                                                  styles.buttonPrimary
                                                )}
                                                type="button"
                                                onClick={() =>
                                                  arrayHelpers.push({
                                                    name: '',
                                                    title: '',
                                                    mode: 'new'
                                                  })
                                                }
                                              >
                                                <i className={'material-icons'}>
                                                  add
                                                </i>
                                                Add New Contact
                                              </button>
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    )
                                  }}
                                </FieldArray>
                              </FormSection>
                            )}

                            {values.templateId && (
                              <FormSection
                                title="Comments"
                                description="Add comments related to the action."
                                setSectionRef={this.props.setSectionRef}
                              >
                                <Field
                                  label="Comments"
                                  component="textarea"
                                  name="comments"
                                  data-test="action-comment"
                                  placeholder="Add comments about this project"
                                />
                              </FormSection>
                            )}

                            {values.templateId && measures.length > 0 && (
                              <FormSection
                                title="Projects"
                                description="Add complete projects related to this action"
                                setSectionRef={this.props.setSectionRef}
                              >
                                <SortableList
                                  listData={measures}
                                  loading={false}
                                  showTotals={false}
                                  columns={{
                                    name: {
                                      header: 'Project',
                                      size: 3,
                                      sortKey: 'displayName',
                                      render: (displayName, project) => (
                                        <div
                                          className={styles.formProjectListItem}
                                          onClick={() =>
                                            this.handleOpenProject(project)
                                          }
                                        >
                                          {displayName}
                                        </div>
                                      )
                                    },
                                    compliance: {
                                      header: 'Compliant?',
                                      size: 1,
                                      getValue: (compliance, project) => {
                                        return (
                                          (project.initialValues &&
                                            project.initialValues.compliant) ||
                                          '-'
                                        )
                                      }
                                    },
                                    status: {
                                      header: 'Status',
                                      size: 1,
                                      sortKey: 'status',
                                      render: status =>
                                        this.getProjectStatus(status)
                                    }
                                  }}
                                />
                              </FormSection>
                            )}

                            <Footer>
                              <button
                                className={classNames(
                                  styles.button,
                                  styles.buttonSecondary
                                )}
                                onClick={this.props.onClose}
                              >
                                Cancel
                              </button>
                              {showSubmit && (
                                <button
                                  className={classNames(
                                    styles.button,
                                    styles.buttonPrimary,
                                    { [styles.buttonDisable]: !isValid }
                                  )}
                                  disabled={!isValid}
                                  type="submit"
                                  data-test="action-submit-button"
                                >
                                  {loading || isSubmitting ? (
                                    <Loader size="button" color="white" />
                                  ) : (
                                    submitText
                                  )}
                                </button>
                              )}
                            </Footer>
                          </Form>
                          {this.state.projectModalOpen && (
                            <ProjectsModal
                              {...this.props.projectModalProps}
                              nestedModal={true}
                              projectType={this.state.currentProjectType}
                              building={this.props.building}
                              handleCloseAddProjects={project =>
                                this.handleCloseProject(
                                  project,
                                  values,
                                  setFieldValue
                                )
                              }
                              currentProject={this.state.currentProject}
                            />
                          )}
                        </div>
                      )
                    }}
                  </Formik>
                )
              }}
            </Query>
          </div>
        )}
      </Mutation>
    )
  }
}

export default ActionForm
