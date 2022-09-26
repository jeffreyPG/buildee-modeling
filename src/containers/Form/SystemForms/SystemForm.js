import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import sortBy from 'lodash/sortBy'

import styles from './SystemForm.scss'
import { Formik, Form, FieldArray } from 'formik'
import { Field, ImagesField, FormSection } from '../FormFields'
import { Mutation, Query } from 'react-apollo'
import { Loader } from 'utils/Loader'
import Feature from 'utils/Feature/Feature'
import { Footer } from '../../../components/UI/Footer'
import SortableList from '../../../components/UI/SortableList'
import EquipmentModal from '../../Modal/EquipmentModal'

import {
  GET_SYSTEM_TYPES,
  ADD_SYSTEM,
  UPDATE_SYSTEM,
  updateAfterCreateSystem,
  updateAfterUpdateSystem
} from '../../../utils/graphql/queries/systems.js'
import { GET_BUILDING_EQUIPMENT } from '../../../utils/graphql/queries/equipment.js'
import { EQUIPMENT_CATEGORIZATION } from '../../../utils/graphql/queries/equipmentschema.js'

export class SystemForm extends React.Component {
  static propTypes = {
    building: PropTypes.object.isRequired,
    mode: PropTypes.oneOf(['viewSystem', 'addSystem', 'editSystem']).isRequired,
    onClose: PropTypes.func.isRequired,
    onSelect: PropTypes.func.isRequired,
    setSectionRef: PropTypes.func,
    system: PropTypes.object
  }

  static defaultProps = {
    mode: 'viewSystem'
  }

  state = {
    currentSystemType: null,
    currentSystem: this.props.system,
    currentBuildingEquipment: null,
    currentEquipment: null,
    categorization: { category: null, application: null, technology: null },
    equipmentModalMode: null,
    equipmentModalOpen: false,
    equipmentModalTarget: null,
    step: this.props.mode === 'addSystem' ? 1 : 2
  }

  validateUpdateSystem = (values, errors = {}) => {
    if (!values.template) {
      errors.template = 'Template not selected'
    }

    return errors
  }

  validateAddSystem = (values, errors = {}) => {
    if (this.state.step === 1) {
      if (!values.name) {
        errors.name = 'Please provide a name'
      }
    }

    if (!values.template) {
      errors.template = 'Template not selected'
    }

    return errors
  }

  validateForm = (values, systems) => {
    let errors = {}

    switch (this.props.mode) {
      case 'viewSystem':
        return errors
      case 'addSystem':
        return this.validateAddSystem(values, errors)
      case 'editSystem':
        return this.validateUpdateSystem(values, errors)
    }
  }

  validateInitial = values => {
    let errors = {}
    switch (this.props.mode) {
      case 'viewSystem':
        break
      case 'addSystem':
        errors = this.validateAddSystem(values, errors)
        break
      case 'editSystem':
        errors = this.validateUpdateSystem(values, errors)
        break
    }

    return Object.keys(errors).length === 0
  }

  setSystemType = (template, values, systemTypes, setValues) => {
    let system
    if (this.state.currentSystem) {
      system = this.state.currentSystem
    } else {
      let currentSystemType = systemTypes.find(
        systemtype => systemtype._id === template
      )
      this.setState({ currentSystemType })
      system = currentSystemType
    }

    setValues({
      template: system._id,
      sections: system.sections.map(section =>
        Object.assign(section, {
          populationMethod: 'manual',
          buildingEquipment: []
        })
      ),
      images: system.images || [],
      comments: system.comments || ''
    })
  }

  handleOpenEquipment = ({ index, equipment = {}, section }) => {
    if (equipment._id) {
      const { category, application, technology } = equipment.libraryEquipment
      this.setState({
        currentBuildingEquipment: equipment,
        currentEquipment: equipment.libraryEquipment,
        categorization: { category, application, technology },
        equipmentModalMode: 'editEquipment'
      })
    } else {
      const { category, application, technology } = section
      this.setState({
        currentBuildingEquipment: null,
        currentEquipment: null,
        categorization: { category, application, technology },
        equipmentModalMode: 'addEquipment'
      })
    }
    this.setState({
      equipmentModalOpen: true,
      equipmentModalTarget: index
    })
  }

  handleCloseEquipment = ({ response, values, setFieldValue }) => {
    if (response.data && response.data.addBuildingEquipment) {
      const buildingEquipment =
        values.sections[this.state.equipmentModalTarget].buildingEquipment
      setFieldValue(
        `sections[${this.state.equipmentModalTarget}].buildingEquipment`,
        buildingEquipment.concat(response.data.addBuildingEquipment)
      )
    }

    this.setState({
      currentBuildingEquipment: null,
      currentEquipment: null,
      equipmentModalOpen: false,
      equipmentModalMode: null,
      equipmentModalTarget: null
    })
  }

  goToNextStep = (values, setFieldValue) => {
    this.setState({ step: 2 })
    this.props.onSelect(
      sortBy(values.sections, 'order').map(section => section.name)
    )
  }

  onSubmit = (executeMutation, values) => {
    switch (this.props.mode) {
      case 'viewSystem':
        return true
      case 'addSystem':
        return executeMutation({
          variables: {
            system: {
              name: values.name,
              building: this.props.building._id,
              template: values.template,
              sections: values.sections.map(
                ({
                  name,
                  category,
                  application,
                  technology,
                  buildingEquipment
                }) => ({
                  name,
                  category,
                  application,
                  technology,
                  buildingEquipment: buildingEquipment.map(({ _id }) => ({
                    _id
                  }))
                })
              ),
              images: values.images,
              comments: values.comments
            }
          }
        }).then(this.props.onClose)
      case 'editSystem':
        return executeMutation({
          variables: {
            system: {
              _id: this.props.system._id,
              name: values.name,
              building: this.props.building._id,
              template: values.template,
              sections: values.sections.map(
                ({ name, category, buildingEquipment }) => ({
                  name,
                  category,
                  buildingEquipment: buildingEquipment.map(({ _id }) => ({
                    _id
                  }))
                })
              ),
              images: values.images,
              comments: values.comments
            }
          }
        }).then(this.props.onClose)
    }
  }

  render() {
    const { setSectionRef } = this.props
    const { currentSystem, step } = this.state

    const initialValues = {
      _id: (currentSystem && currentSystem._id) || '',
      name: (currentSystem && currentSystem.name) || '',
      category: (currentSystem && currentSystem.category) || '',
      application: (currentSystem && currentSystem.application) || '',
      technology: (currentSystem && currentSystem.technology) || '',
      template:
        (currentSystem &&
          currentSystem.template &&
          currentSystem.template._id) ||
        '',
      sections:
        (currentSystem &&
          currentSystem.sections.map(section =>
            Object.assign(section, { populationMethod: 'manual' })
          )) ||
        [],
      images: (currentSystem && currentSystem.images) || [],
      comments: (currentSystem && currentSystem.comments) || ''
    }

    let mutation,
      updateAfterMutation,
      submitText,
      showSubmit,
      updateVariables = { system: { building: this.props.building._id } }

    switch (this.props.mode) {
      case 'viewSystem':
        mutation = UPDATE_SYSTEM
        updateAfterMutation = (...args) =>
          updateAfterUpdateSystem(...args, updateVariables)
        submitText = ''
        showSubmit = false
        break
      case 'addSystem':
        mutation = ADD_SYSTEM
        updateAfterMutation = (...args) =>
          updateAfterCreateSystem(...args, updateVariables)
        submitText = 'Add System'
        showSubmit = true
        break
      case 'editSystem':
        mutation = UPDATE_SYSTEM
        updateAfterMutation = (...args) =>
          updateAfterUpdateSystem(...args, updateVariables)
        submitText = 'Update System'
        showSubmit = true
        break
    }

    return (
      <Query
        query={EQUIPMENT_CATEGORIZATION}
        variables={{
          categorization: {}
        }}
      >
        {({ data }) => {
          const { equipmentCategorization } = data

          return (
            <Mutation mutation={mutation} update={updateAfterMutation}>
              {(executeMutation, { data, loading }) => (
                <div className={styles.formWrapper}>
                  <Query query={GET_SYSTEM_TYPES}>
                    {({ data: { systemTypes = [] } }) => {
                      return (
                        <Query
                          query={GET_BUILDING_EQUIPMENT}
                          variables={{ buildingId: this.props.building._id }}
                        >
                          {({
                            loading,
                            error,
                            data: { buildingEquipment = [] }
                          }) => {
                            if (loading) {
                              return <Loader />
                            }
                            const buildingEquipmentMap = buildingEquipment.reduce(
                              (acc, be) =>
                                Object.assign(acc, {
                                  [be._id]: be
                                }),
                              {}
                            )

                            return (
                              <Formik
                                ref={this.formik}
                                initialValues={initialValues}
                                isInitialValid={() =>
                                  this.validateInitial(initialValues)
                                }
                                validate={values =>
                                  this.validateForm(values, systemTypes)
                                }
                                onSubmit={system =>
                                  this.onSubmit(executeMutation, system)
                                }
                              >
                                {({
                                  values,
                                  isSubmitting,
                                  isValid,
                                  setFieldValue,
                                  setValues
                                }) => (
                                  <div className={styles.form}>
                                    <Form id={this.props.name}>
                                      <FormSection
                                        title="Details"
                                        description=""
                                        setSectionRef={setSectionRef}
                                      >
                                        <div className={styles.formInputRow}>
                                          <div className={styles.formInput}>
                                            <label
                                              className={styles.formInputLabel}
                                            >
                                              Type
                                            </label>
                                            <div
                                              className={styles.selectContainer}
                                            >
                                              <select
                                                className={classNames(
                                                  styles.formInputField,
                                                  {
                                                    [styles.disabled]:
                                                      !!values._id || step === 2
                                                  }
                                                )}
                                                value={values.template}
                                                data-test="system-type"
                                                disabled={
                                                  !!values._id || step === 2
                                                }
                                                onChange={e =>
                                                  this.setSystemType(
                                                    e.target.value,
                                                    values,
                                                    systemTypes,
                                                    setValues,
                                                    setFieldValue
                                                  )
                                                }
                                              >
                                                {systemTypes.reduce(
                                                  (
                                                    acc,
                                                    {
                                                      _id,
                                                      name,
                                                      disabled = false
                                                    },
                                                    index
                                                  ) =>
                                                    acc.concat(
                                                      <option
                                                        key={_id}
                                                        value={_id}
                                                        disabled={disabled}
                                                      >
                                                        {name}
                                                      </option>
                                                    ),
                                                  [
                                                    <option
                                                      key="default"
                                                      value=""
                                                      disabled={true}
                                                    >
                                                      Select a type
                                                    </option>
                                                  ]
                                                )}
                                              </select>
                                            </div>
                                          </div>
                                        </div>
                                        {values.template && (
                                          <div className={styles.formInputRow}>
                                            <Field
                                              label="Name"
                                              component="input"
                                              name="name"
                                              placeholder=""
                                            />
                                          </div>
                                        )}

                                        {step === 1 &&
                                          values.template &&
                                          sortBy(values.sections, 'order').map(
                                            (section, index) => (
                                              <Feature name="systemEquipment">
                                                {({ enabled }) => {
                                                  if (!enabled) return null
                                                  return (
                                                    <div
                                                      className={
                                                        styles.formInputRow
                                                      }
                                                      key={`section-population-${index}`}
                                                    >
                                                      <Field
                                                        label={section.name}
                                                        component="select"
                                                        name={`sections[${index}].populationMethod`}
                                                      >
                                                        <option value="manual">
                                                          Configure Manually
                                                        </option>
                                                        <option value="existing">
                                                          Use Existing Equipment
                                                        </option>
                                                        <option value="typical">
                                                          Use Typical Equipment
                                                        </option>
                                                      </Field>
                                                    </div>
                                                  )
                                                }}
                                              </Feature>
                                            )
                                          )}
                                      </FormSection>

                                      {step === 2 &&
                                        values.template &&
                                        sortBy(values.sections, 'order').map(
                                          (section, index) => (
                                            <FormSection
                                              title={section.name}
                                              setSectionRef={setSectionRef}
                                              key={'section' + index}
                                            >
                                              <FieldArray
                                                name={`sections[${index}].buildingEquipment`}
                                              >
                                                {arrayHelpers => {
                                                  const listData = section.buildingEquipment
                                                    .map(data => {
                                                      if (
                                                        !data.libraryEquipment
                                                      ) {
                                                        return buildingEquipmentMap[
                                                          data._id
                                                        ]
                                                      }
                                                      return data
                                                    })
                                                    .filter(be => !!be)
                                                  return (
                                                    <div
                                                      data-test={`system-category-${section.category}`}
                                                    >
                                                      {listData.length > 0 && (
                                                        <SortableList
                                                          listData={listData}
                                                          loading={false}
                                                          showTotals={false}
                                                          columns={{
                                                            tagId: {
                                                              header: 'Tag',
                                                              sortKey:
                                                                'configs',
                                                              getValue: configs => {
                                                                const config = configs.find(
                                                                  ({ field }) =>
                                                                    field ===
                                                                    'tagID'
                                                                )
                                                                return (
                                                                  (config &&
                                                                    config.value) ||
                                                                  '-'
                                                                )
                                                              }
                                                            },
                                                            tagId: {
                                                              header: 'ID',
                                                              sortKey:
                                                                'configs',
                                                              getValue: configs => {
                                                                const config = configs.find(
                                                                  ({ field }) =>
                                                                    field ===
                                                                    'identifier'
                                                                )
                                                                return (
                                                                  (config &&
                                                                    config.value) ||
                                                                  '-'
                                                                )
                                                              }
                                                            },
                                                            name: {
                                                              header: 'Name',
                                                              sortKey:
                                                                'libraryEquipment',
                                                              getValue: e =>
                                                                e.name
                                                            },
                                                            application: {
                                                              header:
                                                                'Application',
                                                              getTotal: '-',
                                                              sortKey:
                                                                'libraryEquipment',
                                                              getValue: ({
                                                                application
                                                              }) => {
                                                                const match =
                                                                  equipmentCategorization &&
                                                                  equipmentCategorization.applications.find(
                                                                    ({
                                                                      value
                                                                    }) =>
                                                                      value ===
                                                                      application
                                                                  )
                                                                return (
                                                                  (match &&
                                                                    match.displayName) ||
                                                                  '-'
                                                                )
                                                              }
                                                            },
                                                            controlType: {
                                                              header:
                                                                'Control Type',
                                                              sortKey:
                                                                'configs',
                                                              getValue: configs => {
                                                                const config = configs.find(
                                                                  ({ field }) =>
                                                                    field ===
                                                                    'controlType'
                                                                )
                                                                return (
                                                                  (config &&
                                                                    config.value) ||
                                                                  '-'
                                                                )
                                                              }
                                                            },
                                                            quantity: {
                                                              header:
                                                                'Quantity',
                                                              size: 1,
                                                              sortKey:
                                                                'quantity'
                                                            },
                                                            media: {
                                                              header: 'Media',
                                                              sortKey: 'images',
                                                              getValue: images =>
                                                                images.length
                                                            }
                                                          }}
                                                          rowActions={[
                                                            {
                                                              text: 'Edit',
                                                              icon: 'create',
                                                              handler: buildingEquipment =>
                                                                this.handleOpenEquipment(
                                                                  {
                                                                    index,
                                                                    equipment: buildingEquipment,
                                                                    section
                                                                  }
                                                                )
                                                            },
                                                            {
                                                              text: 'Copy',
                                                              icon: 'file_copy',
                                                              handler: buildingEquipment => {
                                                                arrayHelpers.push(
                                                                  buildingEquipment
                                                                )
                                                              }
                                                            },
                                                            {
                                                              text: 'Delete',
                                                              icon: 'delete',
                                                              handler: buildingEquipment => {
                                                                let equipment_index = values.sections[
                                                                  index
                                                                ].buildingEquipment.findIndex(
                                                                  id =>
                                                                    id ===
                                                                    buildingEquipment._id
                                                                )
                                                                arrayHelpers.remove(
                                                                  equipment_index
                                                                )
                                                              }
                                                            }
                                                          ]}
                                                        />
                                                      )}
                                                      <div
                                                        className={classNames(
                                                          styles.formInputRow,
                                                          styles.formSectionFooter
                                                        )}
                                                      >
                                                        <button
                                                          className={classNames(
                                                            styles.button,
                                                            styles.buttonPrimary
                                                          )}
                                                          onClick={() =>
                                                            this.handleOpenEquipment(
                                                              {
                                                                index,
                                                                section
                                                              }
                                                            )
                                                          }
                                                          type="button"
                                                        >
                                                          Add New
                                                        </button>
                                                        <div
                                                          className={classNames(
                                                            styles.formInput,
                                                            styles.buttonDropdown
                                                          )}
                                                        >
                                                          <select
                                                            className={
                                                              styles.formInputField
                                                            }
                                                            value={''}
                                                            onChange={e =>
                                                              arrayHelpers.push(
                                                                {
                                                                  _id:
                                                                    e.target
                                                                      .value
                                                                }
                                                              )
                                                            }
                                                          >
                                                            <option value={''}>
                                                              Add Existing
                                                            </option>
                                                            {buildingEquipment
                                                              .filter(
                                                                item =>
                                                                  item.libraryEquipment &&
                                                                  item
                                                                    .libraryEquipment
                                                                    .category ===
                                                                    section.category &&
                                                                  item
                                                                    .libraryEquipment
                                                                    .application ===
                                                                    section.application
                                                              )
                                                              .map(item => (
                                                                <option
                                                                  key={`equipment-${item._id}`}
                                                                  value={
                                                                    item._id
                                                                  }
                                                                >
                                                                  {
                                                                    item
                                                                      .libraryEquipment
                                                                      .name
                                                                  }
                                                                </option>
                                                              ))}
                                                          </select>
                                                        </div>
                                                      </div>
                                                    </div>
                                                  )
                                                }}
                                              </FieldArray>
                                            </FormSection>
                                          )
                                        )}

                                      {step === 2 && values.template && (
                                        <FormSection
                                          title="Comments"
                                          description="Add comments related to this system."
                                          setSectionRef={setSectionRef}
                                        >
                                          <Field
                                            label="Comments"
                                            component="textarea"
                                            name="comments"
                                            placeholder="Add comments about this system"
                                          />
                                        </FormSection>
                                      )}

                                      {step === 2 && values.template && (
                                        <FormSection
                                          title="Images"
                                          description="Take photos or import images related to this system. Note images are compressed."
                                          setSectionRef={setSectionRef}
                                        >
                                          <ImagesField
                                            images={values.images.reduce(
                                              (acc, image) => {
                                                let url = new URL(image)
                                                return Object.assign(acc, {
                                                  [url.pathname]: {
                                                    uploadUrl: url.href,
                                                    preview: url.href
                                                  }
                                                })
                                              },
                                              {}
                                            )}
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

                                        {this.state.step === 1 && (
                                          <button
                                            className={classNames(
                                              styles.button,
                                              styles.buttonPrimary,
                                              {
                                                [styles.buttonDisable]: !isValid
                                              }
                                            )}
                                            disabled={!isValid}
                                            onClick={() =>
                                              this.goToNextStep(
                                                values,
                                                setFieldValue
                                              )
                                            }
                                          >
                                            Next
                                          </button>
                                        )}
                                        {this.state.step === 2 && showSubmit && (
                                          <button
                                            className={classNames(
                                              styles.button,
                                              styles.buttonPrimary,
                                              {
                                                [styles.buttonDisable]: !isValid
                                              }
                                            )}
                                            disabled={!isValid}
                                            type="submit"
                                            data-test="system-add-button"
                                          >
                                            {loading || isSubmitting ? (
                                              <Loader
                                                size="button"
                                                color="white"
                                              />
                                            ) : (
                                              submitText
                                            )}
                                          </button>
                                        )}
                                      </Footer>
                                    </Form>
                                    {this.state.equipmentModalOpen && (
                                      <EquipmentModal
                                        buildingEquipment={
                                          this.state.currentBuildingEquipment
                                        }
                                        equipment={this.state.currentEquipment}
                                        initialCategory={
                                          this.state.categorization.category
                                        }
                                        initialApplication={
                                          this.state.categorization.application
                                        }
                                        initialTechnology={
                                          this.state.categorization.technology
                                        }
                                        modalView={
                                          this.state.equipmentModalMode
                                        }
                                        onClose={response =>
                                          this.handleCloseEquipment({
                                            response,
                                            values,
                                            setFieldValue
                                          })
                                        }
                                        disableCategorizationChange
                                      />
                                    )}
                                  </div>
                                )}
                              </Formik>
                            )
                          }}
                        </Query>
                      )
                    }}
                  </Query>
                </div>
              )}
            </Mutation>
          )
        }}
      </Query>
    )
  }
}

export default SystemForm
