import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import styles from './ConstructionForm.scss'
import { Formik, Form } from 'formik'
import { Mutation, Query } from 'react-apollo'
import { ImagesField, Field, FormSection } from '../FormFields'
import { Loader } from 'utils/Loader'
import { Footer } from '../../../components/UI/Footer'

import {
  GET_CONSTRUCTIONS,
  GET_BUILDING_CONSTRUCTIONS,
  ADD_BUILDING_CONSTRUCTION,
  UPDATE_BUILDING_CONSTRUCTION
} from '../../../utils/graphql/queries/construction.js'

export class ConstructionForm extends React.Component {
  static propTypes = {
    building: PropTypes.object.isRequired,
    construction: PropTypes.object,
    onClose: PropTypes.func.isRequired,
    onSelect: PropTypes.func.isRequired,
    mode: PropTypes.oneOf([
      'viewConstruction',
      'addConstruction',
      'editConstruction',
      'copyConstruction'
    ]).isRequired,
    setSectionRef: PropTypes.func
  }

  static defaultProps = {
    mode: 'viewConstruction'
  }

  state = {
    currentConstruction: this.props.construction,
    applicationOptions: [
      { name: 'Wall', value: 'WALL' },
      { name: 'Roof', value: 'ROOF' },
      { name: 'Foundation', value: 'FOUNDATION' },
      { name: 'Interior Floor', value: 'INTERIOR_FLOOR' },
      { name: 'Exterior Floor', value: 'EXTERIOR_FLOOR' },
      { name: 'Window', value: 'WINDOW' }
    ]
  }

  validateUpdateConstruction = (values, errors = {}) => {
    if (!values.application) {
      errors.application = 'Invalid Application'
    }

    if (!values.construction_id) {
      errors.construction_id = 'Invalid Construction'
    }

    return errors
  }

  validateAddConstruction = (values, errors = {}) => {
    if (!values.application) {
      errors.application = 'Invalid Application'
    }

    if (!values.construction_id) {
      errors.construction_id = 'Invalid Construction'
    }

    return errors
  }

  validateForm = (values, constructions) => {
    let state = {}
    let errors = {}
    // Filtered Dropdown

    if (Object.keys(state).length > 0) {
      this.setState(state)
    }

    switch (this.props.mode) {
      case 'viewConstruction':
        return errors
      case 'addConstruction':
        return this.validateAddConstruction(values, errors)
      case 'copyConstruction':
        return this.validateAddConstruction(values, errors)
      case 'editConstruction':
        return this.validateUpdateConstruction(values, errors)
    }
  }

  validateInitial = values => {
    let errors = {}
    switch (this.props.mode) {
      case 'viewConstruction':
        break
      case 'addConstruction':
        errors = this.validateAddConstruction(values, errors)
        break
      case 'copyConstruction':
        break
      case 'editConstruction':
        errors = this.validateUpdateConstruction(values, errors)
        break
    }

    return Object.keys(errors).length === 0
  }

  onSubmit = (executeMutation, values) => {
    switch (this.props.mode) {
      case 'viewConstruction':
        return true
      case 'addConstruction':
      case 'copyConstruction':
        return executeMutation({
          variables: {
            input: {
              building: this.props.building._id,
              construction: values.construction_id,
              comments: values.comments,
              images: values.images
            }
          }
        }).then(this.props.onClose)
      case 'editConstruction':
        return executeMutation({
          variables: {
            input: {
              building: this.props.building._id,
              _id: this.props.construction._id,
              construction: values.construction_id,
              comments: values.comments,
              images: values.images
            }
          }
        }).then(this.props.onClose)
    }
  }

  handleSelected = ({ event, setFieldValue, constructions }) => {
    const _id = event.target.value
    const currentConstruction = constructions.find(
      construction => construction._id === _id
    )

    if (currentConstruction) {
      setFieldValue('construction_id', currentConstruction._id)
      setFieldValue(
        'rValue',
        currentConstruction.fields.rValue &&
          currentConstruction.fields.rValue.value
      )
      setFieldValue(
        'uValue',
        currentConstruction.fields.uvalue &&
          currentConstruction.fields.uvalue.value
      )
    }

    this.props.onSelect()
  }

  render() {
    const { setSectionRef } = this.props
    const { applicationOptions, currentConstruction } = this.state

    const initialValues = {
      application:
        (currentConstruction &&
          currentConstruction.construction &&
          currentConstruction.construction.application) ||
        '',
      construction_id:
        (currentConstruction &&
          currentConstruction.construction &&
          currentConstruction.construction._id) ||
        '',
      comments: (currentConstruction && currentConstruction.comments) || '',
      images: (currentConstruction && currentConstruction.images) || [],
      name:
        (currentConstruction &&
          currentConstruction.construction &&
          currentConstruction.construction.name) ||
        '',
      rValue:
        (currentConstruction &&
          currentConstruction.construction &&
          currentConstruction.construction.fields.rValue &&
          currentConstruction.construction.fields.rValue.value) ||
        '',
      uValue:
        (currentConstruction &&
          currentConstruction.construction &&
          currentConstruction.construction.fields.uvalue &&
          currentConstruction.construction.fields.uvalue.value) ||
        ''
    }

    let mutation, submitText, showSubmit

    switch (this.props.mode) {
      case 'viewConstruction':
        mutation = UPDATE_BUILDING_CONSTRUCTION
        submitText = ''
        showSubmit = false
        break
      case 'addConstruction':
        mutation = ADD_BUILDING_CONSTRUCTION
        submitText = 'Add Construction'
        showSubmit = true
        break
      case 'copyConstruction':
        mutation = ADD_BUILDING_CONSTRUCTION
        submitText = 'Copy Construction'
        showSubmit = true
        break
      case 'editConstruction':
        mutation = UPDATE_BUILDING_CONSTRUCTION
        submitText = 'Update Construction'
        showSubmit = true
        break
    }

    return (
      <Mutation
        mutation={mutation}
        refetchQueries={result => [
          {
            query: GET_BUILDING_CONSTRUCTIONS,
            variables: { id: this.props.building._id }
          }
        ]}
      >
        {(executeMutation, { data, loading }) => (
          <div className={styles.formWrapper}>
            <Query
              query={GET_CONSTRUCTIONS}
              variables={{ search: { size: 350 } }}
            >
              {({
                loading: constructionsLoading,
                error: constructionsError,
                data: { constructions = [] }
              }) => {
                const allConstructions = constructions.filter(construction => {
                  if (this.props.mode === 'addConstruction') {
                    return !construction.archived
                  } else {
                    if (
                      construction._id ===
                      this.props.construction?.construction?._id
                    )
                      return true
                    return !construction.archived
                  }
                })
                return (
                  <Formik
                    ref={this.formik}
                    initialValues={initialValues}
                    isInitialValid={() => this.validateInitial(initialValues)}
                    validate={values =>
                      this.validateForm(values, constructions)
                    }
                    onSubmit={buildingConstruction =>
                      this.onSubmit(executeMutation, buildingConstruction)
                    }
                  >
                    {({ values, isSubmitting, isValid, setFieldValue }) => (
                      <Form className={styles.form} id={this.props.name}>
                        <FormSection
                          title="Details"
                          description="Search for Constructions and add details"
                          setSectionRef={setSectionRef}
                        >
                          <div className={styles.formInputRow}>
                            <Field
                              label="Application"
                              component="select"
                              name="application"
                              placeholder="Select"
                              data-test="construction-application"
                            >
                              <option value="" defaultValue disabled>
                                Select an application
                              </option>
                              {applicationOptions.map(({ name, value }) => (
                                <option key={value} value={value}>
                                  {name}
                                </option>
                              ))}
                            </Field>
                          </div>

                          <div className={styles.formInputRow}>
                            <Field
                              name="construction_id"
                              label="Name"
                              component="select"
                              data-test="construction-name"
                              onChange={event =>
                                this.handleSelected({
                                  event,
                                  constructions: allConstructions,
                                  setFieldValue
                                })
                              }
                            >
                              <option value="" defaultValue disabled>
                                Select a construction
                              </option>
                              {allConstructions
                                .filter(
                                  construction =>
                                    construction.application ===
                                    values.application
                                )
                                .map(({ _id, name }) => (
                                  <option key={_id} value={_id}>
                                    {name}
                                  </option>
                                ))}
                            </Field>
                          </div>

                          {values.application !== 'WINDOW' &&
                            values.construction_id &&
                            values.rValue && (
                              <div className={styles.formInputRow}>
                                <div className={styles.formInput}>
                                  <label className={styles.formInputLabel}>
                                    R-Value
                                  </label>
                                  <div>{values.rValue}</div>
                                </div>
                              </div>
                            )}

                          {values.application === 'WINDOW' &&
                            values.construction_id &&
                            values.uValue && (
                              <div className={styles.formInputRow}>
                                <div className={styles.formInput}>
                                  <label className={styles.formInputLabel}>
                                    U-Value
                                  </label>
                                  <div>{values.uValue}</div>
                                </div>
                              </div>
                            )}
                        </FormSection>

                        {values.construction_id && (
                          <FormSection
                            title="Comments"
                            description="Add comments related to the construction."
                            setSectionRef={setSectionRef}
                          >
                            <Field
                              label="Comments"
                              component="textarea"
                              name="comments"
                              data-test="construction-comments"
                              placeholder="Add comments about this construction"
                            />
                          </FormSection>
                        )}

                        {values.construction_id && (
                          <FormSection
                            title="Images"
                            description="Take photos or import images related to the construction. Note images are compressed."
                            setSectionRef={setSectionRef}
                          >
                            <ImagesField
                              images={values.images.reduce((acc, image) => {
                                let url = new URL(image)
                                return Object.assign(acc, {
                                  [url.pathname]: {
                                    uploadUrl: url.href,
                                    preview: url.href
                                  }
                                })
                              }, {})}
                              onFieldUpdate={images => {
                                setFieldValue(
                                  'images',
                                  Object.keys(images).map(
                                    k => images[k].uploadUrl
                                  )
                                )
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
                              data-test="construction-submit-button"
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
                    )}
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

export default ConstructionForm
