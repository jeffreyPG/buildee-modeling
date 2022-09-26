import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import styles from './LocationForm.scss'
import headerStyles from '../../Header/LoggedInHeader.scss'
import { Formik, Form } from 'formik'
import { Mutation, withApollo } from 'react-apollo'
import { Field, FormSection } from '../FormFields'
import { Footer } from '../../../components/UI/Footer'
import LocationEquipments from './LocationEquipments'
import EquipmentModal from '../../Modal/EquipmentModal'
import ExistingEquipmentModal from '../../Modal/ExistingEquipmentModal'
import conditioningOptions from '../../../static/location-conditioning'
import floorOptions from '../../../static/location-floors'
import useTypeOptions from '../../../static/building-types'
import { getSpaceTypes } from '../../../static/building-space-types'
import userOptions from '../../../static/location-users'
import {
  ADD_BUILDING_LOCATION,
  GET_BUILDING_LOCATIONS,
  UPDATE_BUILDING_LOCATION
} from '../../../utils/graphql/queries/location.js'
import { UPDATE_BUILDING_EQUIPMENT } from '../../../utils/graphql/queries/equipment'
import { parentNodeHasClass } from 'utils/Utils'
import { uniqBy } from 'lodash'

const TABS = [
  {
    category: 'LIGHTING',
    title: 'Lighting',
    columns: ['name', 'application', 'Control Type', 'Condition Rating']
  },
  {
    category: 'HEATING_AND_COOLING',
    title: 'Heating & Cooling',
    columns: [
      'Tag',
      'ID',
      'name',
      'application',
      'Control Type',
      'Condition Rating'
    ]
  },
  {
    category: 'HEATING',
    title: 'Heating',
    columns: [
      'Tag',
      'ID',
      'name',
      'application',
      'Control Type',
      'Condition Rating'
    ]
  },
  {
    category: 'COOLING',
    title: 'Cooling',
    columns: [
      'Tag',
      'ID',
      'name',
      'application',
      'Control Type',
      'Condition Rating'
    ]
  },
  {
    category: 'AIR_DISTRIBUTION',
    title: 'Air Distribution',
    columns: [
      'Tag',
      'ID',
      'name',
      'application',
      'Control Type',
      'Condition Rating'
    ]
  },
  {
    category: 'PLUG_LOAD',
    title: 'Plug Load',
    columns: ['name', 'application', 'Condition Rating']
  },
  {
    category: 'PROCESS',
    title: 'Process',
    columns: [
      'Tag',
      'ID',
      'name',
      'application',
      'Control Type',
      'Condition Rating'
    ]
  },
  {
    category: 'VENTILATION',
    title: 'Ventilation',
    columns: [
      'Tag',
      'ID',
      'name',
      'application',
      'Control Type',
      'Condition Rating'
    ]
  },
  {
    category: 'WATER_HEATING',
    title: 'Water Heating',
    columns: [
      'Tag',
      'ID',
      'name',
      'application',
      'Control Type',
      'Condition Rating'
    ]
  },
  {
    category: 'WATER_USE',
    title: 'Water Use',
    columns: ['name', 'application', 'Condition Rating']
  }
]

const getBuildingUseTypes = building => {
  if (!building) return
  const parsedUseType = useTypeOptions.reduce((acc, useType) => {
    acc[useType.value] = useType
    return acc
  }, {})
  const primaryUseType = parsedUseType[building.buildingUse]
  if (!primaryUseType) return
  let secondaryUseTypes = building.buildingUseTypes.map(useType => {
    return parsedUseType[useType.use]
  })
  //remove primaryUseType in secondaryUseTypes
  secondaryUseTypes = secondaryUseTypes.filter(
    useType => useType.name !== primaryUseType.name
  )

  return [primaryUseType, ...secondaryUseTypes]
}

const getDefaultUseTypes = building => {
  if (!building) return
  if (building.buildingUseTypes.length <= 1) {
    const filteredUseType = useTypeOptions.find(useType => {
      return useType.value === building.buildingUse
    })
    if (filteredUseType) {
      return filteredUseType.value
    }
  }
  return ''
}

export class LocationForm extends React.Component {
  static propTypes = {
    user: PropTypes.object.isRequired,
    building: PropTypes.object.isRequired,
    buildingLocation: PropTypes.object,
    onClose: PropTypes.func.isRequired,
    mode: PropTypes.oneOf(['viewLocation', 'addLocation', 'editLocation'])
      .isRequired,
    initialName: PropTypes.string,
    setSectionRef: PropTypes.func,
    fromEquipment: PropTypes.bool
  }

  static defaultProps = {
    mode: 'viewLocation'
  }
  state = {
    currentEquipment: null,
    currentEquipmentIndex: null,
    currentLibraryEquipment: null,
    location: (this.props.buildingLocation &&
      this.props.buildingLocation.location) || {
      usetype: getDefaultUseTypes(this.props.building)
    },
    equipment:
      (this.props.buildingLocation && this.props.buildingLocation.equipment) ||
      [],
    equipmentModalOpen: false,
    existingEquipmentModalOpen: false,
    equipmentModalMode: null,
    equipmentModalCategory: null,
    floorOptions,
    conditioningOptions,
    userOptions,
    buildingUseTypes: getBuildingUseTypes(this.props.building) || [],
    locationToEquipment: {},
    equipmentAddedDisable: true,
    showUseTypeDropDown: false,
    showSpaceTypeDropDown: false
  }
  UNSAFE_componentWillMount = () => {
    document.addEventListener('mousedown', this.handleReportsClick, false)
  }
  componentWillUnmount = () => {
    document.removeEventListener('mousedown', this.handleReportsClick, false)
  }

  componentDidMount() {
    if (this.props.buildingLocation) {
      this.setState({
        locationToEquipment: {
          ...this.state.locationToEquipment,
          _id: this.props.building._id,
          length: '0',
          width: '0',
          height: '0',
          equipment: this.state.equipment.map(beq => beq._id),
          usetype:
            this.props.buildingLocation !== null
              ? this.props.buildingLocation.location.usetype
              : '',
          name:
            this.props.buildingLocation !== null
              ? this.props.buildingLocation.location.name
              : '',
          floor:
            this.props.buildingLocation !== null
              ? this.props.buildingLocation.location.floor
              : '',
          conditioning:
            this.props.buildingLocation !== null
              ? this.props.buildingLocation.location.conditioning
              : '',
          area:
            this.props.buildingLocation !== null
              ? this.props.buildingLocation.location.area
              : '',
          user:
            this.props.buildingLocation !== null
              ? this.props.buildingLocation.location.user
              : ''
        }
      })
    }
  }
  validateForm = (values, type, errors = {}) => {
    if (!values.usetype || values.usetype === '') {
      errors.usetype = 'Enter Use Type'
    }
    if (!values.spaceType || values.spaceType === '') {
      errors.spaceType = 'Enter Space Type'
    }
    if (!values.name || values.name === '') {
      errors.name = 'Enter Name'
    }
    if (type === 'submit') {
      return errors
    } else {
      return errors.length === 0
    }
  }

  handleOpenEquipment = ({ category }) => {
    this.setState({
      equipmentModalOpen: true,
      equipmentModalMode: 'addEquipment',
      equipmentModalCategory: category
    })
  }

  handleOpenExistingEquipment = ({ category }) => {
    this.setState({
      existingEquipmentModalOpen: true,
      equipmentModalCategory: category
    })
  }

  handleCloseEquipment = async ({ data }) => {
    if (data && data.addBuildingEquipment) {
      this.setState({
        equipment: this.state.equipment.concat(data.addBuildingEquipment),
        equipmentAddedDisable: false
      })
    } else if (data && data.updateBuildingEquipment) {
      this.setState({
        equipment: [
          ...this.state.equipment.slice(0, this.state.currentEquipmentIndex),
          data.updateBuildingEquipment,
          ...this.state.equipment.slice(this.state.currentEquipmentIndex + 1)
        ],
        equipmentAddedDisable: false
      })
    }
    this.setState({
      currentEquipmentIndex: null,
      currentEquipment: null,
      currentLibraryEquipment: null,
      equipmentModalOpen: false,
      equipmentModalMode: null,
      equipmentModalCategory: null
    })
  }

  handleCloseExistingEquipment = ({ data }) => {
    if (data) {
      this.setState({
        equipment: this.state.equipment.concat(data),
        equipmentAddedDisable: false
      })
    }
    this.setState({
      currentEquipmentIndex: null,
      currentEquipment: null,
      currentLibraryEquipment: null,
      existingEquipmentModalOpen: false,
      equipmentModalMode: null,
      equipmentModalCategory: null
    })
  }

  handleCopyEquipment = ({ equipment }) => {
    this.setState({
      equipment: this.state.equipment.concat(equipment),
      equipmentAddedDisable: false
    })
  }

  handleDeleteEquipment = ({ equipment, index }) => {
    this.setState({
      equipment: [
        ...this.state.equipment.slice(0, index),
        ...this.state.equipment.slice(index + 1)
      ],
      equipmentAddedDisable: false
    })

    this.props.client.mutate({
      mutation: UPDATE_BUILDING_EQUIPMENT,
      variables: {
        input: {
          _id: equipment._id,
          location: null
        }
      }
    })
  }

  handleEditEquipment = ({ category, equipment, index }) => {
    this.setState({
      currentEquipmentIndex: index,
      currentEquipment: equipment,
      currentLibraryEquipment: equipment.libraryEquipment,
      equipmentModalOpen: true,
      equipmentModalMode: 'editEquipment',
      equipmentModalCategory: category
    })
  }

  onSubmit = (executeMutation, values) => {
    switch (this.props.mode) {
      case 'viewLocation':
        return true
      case 'addLocation':
        return executeMutation({
          variables: {
            input: {
              buildingId: this.props.building._id,
              usetype: values.usetype.toString(),
              spaceType: values.spaceType.toString(),
              name: values.name.toString(),
              floor: Number(values.floor),
              conditioning: values.conditioning.toString(),
              user: values.user.toString(),
              area: Number(values.area),
              length: Number(values.length),
              width: Number(values.width),
              height: Number(values.height),
              equipment: this.state.equipment.map(beq => beq._id)
            }
          }
        }).then(res => {
          this.props.onClose && this.props.onClose(res.data.addBuildingLocation)
        })
      case 'editLocation':
        return executeMutation({
          variables: {
            input: {
              _id: this.props.buildingLocation._id,
              buildingId: this.props.building._id,
              locationId: this.state.location._id,
              usetype: values.usetype,
              spaceType: values.spaceType,
              name: values.name,
              floor: Number(values.floor),
              conditioning: values.conditioning,
              user: values.user,
              area: Number(values.area),
              length: Number(values.length),
              width: Number(values.width),
              height: Number(values.height),
              equipment: this.state.equipment.map(beq => beq._id)
            }
          }
        }).then(res => {
          this.props.onClose &&
            this.props.onClose(res.data.editBuildingLocation)
        })
    }
  }
  setLocationValues = (event, setFieldValue) => {
    if (event.target.name === 'name') {
      this.setState({
        locationToEquipment: {
          ...this.state.locationToEquipment,
          name: event.target.value
        }
      })
    } else if (event.target.name === 'usetype') {
      this.setState({
        locationToEquipment: {
          ...this.state.locationToEquipment,
          usetype: event.target.value
        }
      })
      // Reset space type when use type changes
      setFieldValue('spaceType', '')
    } else if (event.target.name === 'floor') {
      this.setState({
        locationToEquipment: {
          ...this.state.locationToEquipment,
          floor: event.target.value
        }
      })
    } else if (event.target.name === 'area') {
      this.setState({
        locationToEquipment: {
          ...this.state.locationToEquipment,
          area: event.target.value
        }
      })
    } else if (event.target.name === 'conditioning') {
      this.setState({
        locationToEquipment: {
          ...this.state.locationToEquipment,
          conditioning: event.target.value
        }
      })
    } else if (event.target.name === 'user') {
      this.setState({
        locationToEquipment: {
          ...this.state.locationToEquipment,
          user: event.target.value
        }
      })
    } else if (event.target.name === 'spaceType') {
      this.setState({
        locationToEquipment: {
          ...this.state.locationToEquipment,
          spaceType: event.target.value
        }
      })
    }
  }

  handleReportsClick = e => {
    // the click is inside, continue to menu links
    if (parentNodeHasClass(e.target, 'reportsClick')) return
    // otherwise, toggle (close) the dropdowns
    this.setState({ showUseTypeDropDown: false, showSpaceTypeDropDown: false })
  }

  toogleUseTypeDropdown = () => {
    this.setState({ showUseTypeDropDown: !this.state.showUseTypeDropDown })
  }

  toogleSpaceTypeDropdown = (event, values, value, setFieldValue) => {
    event.stopPropagation()
    const useTypeBefore = values.usetype
    setFieldValue('usetype', value)
    this.setState({
      showSpaceTypeDropDown:
        useTypeBefore != value ? true : !this.state.showSpaceTypeDropDown
    })
  }

  getUseType = useType => {
    const { buildingUseTypes } = this.state
    const useTypes = buildingUseTypes.filter(item => item.value === useType)
    if (useTypes.length) {
      return useTypes[0].name
    }
    return 'Select'
  }

  getSpaceType = (useType, spaceType) => {
    let spaceTypes = getSpaceTypes(useType)
    spaceTypes = spaceTypes.filter(item => item.value === spaceType)
    if (spaceTypes.length) {
      return spaceTypes[0].name
    }
    return ''
  }

  selectSpaceType = (event, spaceType, setFieldValue) => {
    event.stopPropagation()
    setFieldValue('spaceType', spaceType)
    this.setState({ showUseTypeDropDown: false, showSpaceTypeDropDown: false })
  }

  render() {
    const {
      equipment,
      location,
      conditioningOptions,
      userOptions,
      floorOptions,
      buildingUseTypes,
      showUseTypeDropDown,
      showSpaceTypeDropDown
    } = this.state
    const { setSectionRef, client, mode, fromEquipment, building } = this.props
    let mutation, submitText, showSubmit
    switch (this.props.mode) {
      case 'viewLocation':
        mutation = ''
        submitText = ''
        showSubmit = false
        break
      case 'addLocation':
        mutation = ADD_BUILDING_LOCATION
        submitText = 'Add Location'
        showSubmit = true
        break
      case 'editLocation':
        mutation = UPDATE_BUILDING_LOCATION
        submitText = 'Update Location'
        showSubmit = true
        break
    }
    return (
      <Mutation
        mutation={mutation}
        refetchQueries={result => [
          {
            query: GET_BUILDING_LOCATIONS,
            variables: { id: this.props.building._id }
          }
        ]}
        onCompleted={data => {
          const locationId =
            mode === 'addLocation'
              ? data.addBuildingLocation._id
              : data.updateBuildingLocation._id
          return equipment.map(equipment => {
            if (!equipment.location) {
              client.mutate({
                mutation: UPDATE_BUILDING_EQUIPMENT,
                variables: {
                  input: {
                    _id: equipment._id,
                    location: locationId
                  }
                }
              })
            }
          })
        }}
      >
        {(executeMutation, { loading }) => (
          <Formik
            ref={this.formik}
            initialValues={{
              usetype:
                (location.usetype && location.usetype.toLowerCase()) || '',
              name: location.name || this.props.initialName || '',
              floor: location.floor || '',
              conditioning:
                (location.conditioning &&
                  location.conditioning.toLowerCase()) ||
                '',
              user: (location.user && location.user.toLowerCase()) || '',
              area: location.area || '',
              length: location.length || '',
              width: location.width || '',
              height: location.height || '',
              spaceType: location.spaceType || ''
            }}
            validate={values => this.validateForm(values, 'submit')}
            isInitialValid={false}
            onSubmit={buildingLocation =>
              this.onSubmit(executeMutation, buildingLocation)
            }
          >
            {({ values, isSubmitting, isValid, setFieldValue, touched }) => (
              <div className={styles.formWrapper}>
                <Form
                  className={styles.form}
                  id={this.props.name}
                  onChange={e => this.setLocationValues(e, setFieldValue)}
                >
                  <FormSection title="Details" setSectionRef={setSectionRef}>
                    <div className={styles.formInputRow}>
                      {buildingUseTypes.length > 1 ? (
                        <div>
                          <label htmlFor="usetype">
                            <span className={styles.label}>{'Use Type'}</span>
                            <div
                              className={classNames(
                                headerStyles.link,
                                'reportsClick'
                              )}
                            >
                              <div
                                className={classNames(
                                  styles.dropdown,
                                  headerStyles.link,
                                  'reportsClick'
                                )}
                                onClick={() =>
                                  this.toogleUseTypeDropdown(values.usetype)
                                }
                                data-test="reports-header-link"
                              >
                                <span>
                                  {values.usetype
                                    ? values.spaceType
                                      ? this.getUseType(values.usetype) +
                                        ' - ' +
                                        this.getSpaceType(
                                          values.usetype,
                                          values.spaceType
                                        )
                                      : this.getUseType(values.usetype)
                                    : 'Select'}
                                </span>
                                <div className={styles.selectIcons}>
                                  <i
                                    className={classNames(
                                      'material-icons',
                                      styles.selectArrow
                                    )}
                                  >
                                    arrow_drop_down
                                  </i>
                                </div>
                                {showUseTypeDropDown && (
                                  <ul className={styles.useTypeDropdown}>
                                    {buildingUseTypes.map(({ name, value }) => (
                                      <div key={name}>
                                        <li
                                          onClick={e =>
                                            this.toogleSpaceTypeDropdown(
                                              e,
                                              values,
                                              value,
                                              setFieldValue
                                            )
                                          }
                                          onMouseEnter={e =>
                                            this.toogleSpaceTypeDropdown(
                                              e,
                                              values,
                                              value,
                                              setFieldValue
                                            )
                                          }
                                        >
                                          <div className={styles.usetypeLabel}>
                                            {name}
                                            {showSpaceTypeDropDown &&
                                              values.usetype === value && (
                                                <i className="material-icons">
                                                  arrow_forward
                                                </i>
                                              )}
                                          </div>

                                          {showSpaceTypeDropDown &&
                                            values.usetype === value && (
                                              <ul
                                                className={
                                                  styles.spaceTypeDropdown
                                                }
                                              >
                                                {getSpaceTypes(
                                                  values.usetype
                                                ).map(({ name, value }) => {
                                                  return (
                                                    <li
                                                      key={value}
                                                      onClick={e =>
                                                        this.selectSpaceType(
                                                          e,
                                                          value,
                                                          setFieldValue
                                                        )
                                                      }
                                                    >
                                                      {name}
                                                    </li>
                                                  )
                                                })}
                                              </ul>
                                            )}
                                        </li>
                                      </div>
                                    ))}
                                  </ul>
                                )}
                              </div>
                            </div>
                          </label>
                        </div>
                      ) : (
                        <div>
                          <label htmlFor="usetype">
                            <span className={styles.label}>{'Space Type'}</span>
                            <div
                              className={classNames(
                                headerStyles.link,
                                'reportsClick'
                              )}
                            >
                              <div
                                className={classNames(
                                  styles.dropdown,
                                  headerStyles.link,
                                  'reportsClick'
                                )}
                                onClick={() =>
                                  this.toogleUseTypeDropdown(values.usetype)
                                }
                                data-test="reports-header-link"
                              >
                                <span>
                                  {values.usetype && values.spaceType
                                    ? this.getSpaceType(
                                        values.usetype,
                                        values.spaceType
                                      )
                                    : 'Select'}
                                </span>
                                <div className={styles.selectIcons}>
                                  <i
                                    className={classNames(
                                      'material-icons',
                                      styles.selectArrow
                                    )}
                                  >
                                    arrow_drop_down
                                  </i>
                                </div>
                                {showUseTypeDropDown && (
                                  <ul className={styles.useTypeDropdown}>
                                    {getSpaceTypes(values.usetype).map(
                                      ({ name, value }) => {
                                        return (
                                          <li
                                            key={value}
                                            onClick={e =>
                                              this.selectSpaceType(
                                                e,
                                                value,
                                                setFieldValue
                                              )
                                            }
                                          >
                                            {name}
                                          </li>
                                        )
                                      }
                                    )}
                                  </ul>
                                )}
                              </div>
                            </div>
                          </label>
                        </div>
                      )}
                      <Field
                        label="Name"
                        component="input"
                        type="text"
                        name="name"
                        placeholder="Name"
                      />
                      <Field
                        label="Floor"
                        component="select"
                        name="floor"
                        placeholder="Select"
                      >
                        {floorOptions(building).reduce(
                          (acc, { name, value, disabled = false }, index) =>
                            acc.concat(
                              <option
                                key={`I:${index}V:${value}`}
                                value={value}
                                disabled={disabled}
                              >
                                {name}
                              </option>
                            ),
                          [
                            <option key="default" value="" disabled={true}>
                              Select Floor
                            </option>
                          ]
                        )}
                      </Field>
                      <Field
                        label="Area (sq.ft.)"
                        component="input"
                        type="number"
                        name="area"
                        placeholder="Area"
                      />
                      <Field
                        label="Conditioning"
                        component="select"
                        name="conditioning"
                        placeholder="Select"
                      >
                        {conditioningOptions.reduce(
                          (acc, { name, value, disabled = false }, index) =>
                            acc.concat(
                              <option
                                key={index + value}
                                value={value}
                                disabled={disabled}
                              >
                                {name}
                              </option>
                            ),
                          [
                            <option key="default" value="" disabled={true}>
                              Select Conditioning
                            </option>
                          ]
                        )}
                      </Field>
                      <Field
                        label="User"
                        component="select"
                        name="user"
                        placeholder="Select"
                      >
                        {userOptions.reduce(
                          (acc, { name, value, disabled = false }, index) =>
                            acc.concat(
                              <option
                                key={index + value}
                                value={value}
                                disabled={disabled}
                              >
                                {name}
                              </option>
                            ),
                          [
                            <option key="default" value="" disabled={true}>
                              Select User
                            </option>
                          ]
                        )}
                      </Field>
                    </div>
                  </FormSection>
                  {!fromEquipment ? (
                    <div>
                      {TABS.map(({ title, category, columns }) => {
                        const categoryEquipment = uniqBy(equipment, e =>
                          e._id.toString()
                        )
                          .filter(
                            e => e !== null && e.libraryEquipment !== null
                          )
                          .filter(e => e.libraryEquipment.category === category)
                        return (
                          <div
                            data-test={`location-equipments-${category}`}
                            key={`location-equipments-${category}`}
                          >
                            <FormSection
                              title={title}
                              setSectionRef={setSectionRef}
                            >
                              {categoryEquipment.length > 0 && (
                                <LocationEquipments
                                  equipment={categoryEquipment}
                                  category={category}
                                  columns={columns}
                                  title={title}
                                  onEdit={this.handleEditEquipment}
                                  onCopy={this.handleCopyEquipment}
                                  onDelete={this.handleDeleteEquipment}
                                />
                              )}
                              <div
                                className={classNames(
                                  styles.formSectionFooter,
                                  styles.addButtonContainer
                                )}
                              >
                                <button
                                  className={classNames(
                                    styles.button,
                                    styles.buttonPrimary
                                  )}
                                  onClick={() =>
                                    this.handleOpenEquipment({
                                      category
                                    })
                                  }
                                  data-test="add-equipment"
                                  type="button"
                                >
                                  Add New
                                </button>
                                <button
                                  className={classNames(
                                    styles.button,
                                    styles.buttonPrimary
                                  )}
                                  onClick={() =>
                                    this.handleOpenExistingEquipment({
                                      category
                                    })
                                  }
                                  data-test="add-equipment"
                                  type="button"
                                >
                                  Add Existing
                                </button>
                              </div>
                            </FormSection>
                          </div>
                        )
                      })}
                    </div>
                  ) : null}
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
                          {
                            [styles.buttonDisable]:
                              !isValid && this.state.equipmentAddedDisable
                          }
                        )}
                        disabled={!isValid && this.state.equipmentAddedDisable}
                        type="submit"
                      >
                        {submitText}
                      </button>
                    )}
                  </Footer>
                </Form>
                {this.state.equipmentModalOpen && (
                  <EquipmentModal
                    buildingEquipment={this.state.currentEquipment}
                    equipment={this.state.currentLibraryEquipment}
                    modalView={this.state.equipmentModalMode}
                    onClose={({ data }) => this.handleCloseEquipment({ data })}
                    initialCategory={this.state.equipmentModalCategory}
                    locationToEquipment={this.state.locationToEquipment}
                    disableCategorizationChange
                  />
                )}
                {this.state.existingEquipmentModalOpen && (
                  <ExistingEquipmentModal
                    building={building}
                    user={user}
                    modalView={this.state.equipmentModalMode}
                    onClose={this.handleCloseExistingEquipment}
                    initialCategory={this.state.equipmentModalCategory}
                    locationToEquipment={this.state.locationToEquipment}
                    disableCategorizationChange
                  />
                )}
              </div>
            )}
          </Formik>
        )}
      </Mutation>
    )
  }
}

export default withApollo(LocationForm)
