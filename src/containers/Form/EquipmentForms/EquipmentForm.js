import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { Formik, Field, Form, ErrorMessage } from 'formik'
import { Query, Mutation, withApollo } from 'react-apollo'
import EquipmentSelector from './EquipmentSelector'
import EquipmentConfiguration from './EquipmentConfiguration'
import EquipmentFields from './EquipmentFields'
import AutoSuggest from '../../../components/UI/AutoSuggest'
import { Footer } from '../../../components/UI/Footer'
import SortableList from '../../../components/UI/SortableList'
import TagList from '../../../components/UI/TagList'
import Link from '../../../components/UI/Link'
import Loader from '../../../components/UI/Loader'
import { FormSection, Field as FieldSelect } from '../FormFields'
import ImagesField from '../FormFields/ImagesField'
import Feature from '../../../utils/Feature/Feature'
import LocationModal from '../../Modal/LocationModal'
import { getLocationDisplayName } from './selectors'
import ProjectsModal from '../../Modal/ProjectsModal'
import {
  ADD_BUILDING_EQUIPMENT,
  GET_BUILDING_EQUIPMENT,
  UPDATE_BUILDING_EQUIPMENT,
  ADD_EQUIPMENT,
  GET_RECENT_BUILDING_EQUIPMENT,
  UPDATE_EQUIPMENT
} from '../../../utils/graphql/queries/equipment'
import { EQUIPMENT_SCHEMA } from '../../../utils/graphql/queries/equipmentschema'
import {
  GET_BUILDING_LOCATIONS,
  ADD_BUILDING_LOCATION_EQUIPMENT
} from '../../../utils/graphql/queries/location'
import {
  GET_BUILDING_OPERATIONS,
  ADD_BUILDING_OPERATION
} from '../../../utils/graphql/queries/operation'
import EquipmentBasicInfo from './EquipmentBasicInfo'
import OperationModal from 'containers/Modal/OperationModal'
import UserFeature from 'utils/Feature/UserFeature'

import styles from './EquipmentForm.scss'
import EquipmentMaintenance from './EquipmentMaintenance'

const getCapacityFieldValue = (equipmentFields = {}) => {
  let capacityFieldValue = ''
  let capacityFieldIndex
  Object.values(equipmentFields).forEach(field => {
    if (!field?.capacityField) return
    const value = field.value
    if (
      value &&
      (!capacityFieldIndex || capacityFieldIndex > field.capacityField)
    ) {
      capacityFieldValue = `${value} ${field.units ? ' ' + field.units : ''}`
      capacityFieldIndex = field.capacityField
    }
  })
  return capacityFieldValue
}

const generateEquipmentName = equipment => {
  if (equipment.category === 'LIGHTING') {
    const mountLength = equipment.fields?.mountLength?.value
    const mountWidth = equipment.fields?.mountWidth?.value
    const mountingType = equipment.fields?.mountingType?.value
    const length = equipment.fields?.length?.value
    const totalInputPower = equipment.fields?.totalInputPower?.value
    const lampAnsiDesignation = equipment.fields?.lampAnsiDesignation?.value
    const numberOfLamps = equipment.fields?.numberOfLamps?.value
    const ballastType = equipment.fields?.ballastType?.value
    const lampLightSourceType = equipment.fields?.lampLightSourceType?.value
    let equipmentName = ''
    if (mountLength && mountWidth) {
      equipmentName = `${mountLength}x${mountWidth}`
    }
    if (mountingType) equipmentName += ` ${mountingType}`
    if (length) equipmentName += ` ${length}`
    if (totalInputPower) equipmentName += ` ${totalInputPower}W`
    if (lampAnsiDesignation) equipmentName += ` ${lampAnsiDesignation}`
    if (numberOfLamps) equipmentName += ` ${numberOfLamps}-lamp`
    if (ballastType) equipmentName += ` ${ballastType}`
    if (lampLightSourceType) equipmentName += ` ${lampLightSourceType}`
    return equipmentName
  } else {
    const model =
      equipment.fields?.model?.value || equipment.fields?.modelOutdoor?.value
    if (model) {
      const manufacturer = equipment.fields?.manufacturer?.value
      if (manufacturer) {
        return `${manufacturer} ${model}`
      }
      const brand = equipment.fields?.brand?.value
      if (brand) {
        return `${brand} ${model}`
      }
      return model
    } else {
      const capacityFieldValue = getCapacityFieldValue(equipment.fields)
      const lowestCategorizationValue =
        equipment.technology || equipment.application || equipment.category
      if (capacityFieldValue) {
        return `${lowestCategorizationValue} ${capacityFieldValue}`
      }
    }
  }
  return ''
}

const hasTagIdField = (configs = []) => {
  return configs?.some(elem => elem.field === 'tagID')
}

const hasIdField = (configs = []) => {
  return configs?.some(elem => elem.field === 'identifier')
}

const getTagValue = (configs = []) => {
  const item = configs?.find(elem => elem.field === 'tagID')
  return item?.value || ''
}

const getIdValue = (configs = []) => {
  const item = configs?.find(elem => elem.field === 'identifier')
  return item?.value || ''
}

export class EquipmentForm extends React.Component {
  static propTypes = {
    building: PropTypes.object.isRequired,
    buildingEquipment: PropTypes.object,
    initialCategory: PropTypes.string,
    initialApplication: PropTypes.string,
    initialTechnology: PropTypes.string,
    disableCategorizationChange: PropTypes.bool,
    hideLocation: PropTypes.bool,
    equipment: PropTypes.object,
    mode: PropTypes.string.isRequired,
    onClose: PropTypes.func.isRequired,
    onSelect: PropTypes.func,
    organization: PropTypes.object.isRequired,
    user: PropTypes.object.isRequired,
    locationToEquipment: PropTypes.object
  }

  state = {
    currentProject: null,
    currentProjectType: null,
    displayFields: false,
    displaySecondaryConfig: false,
    displaySecondaryMaintenance: false,
    isCreate: false,
    isSelected: false,
    projectMap: {},
    projectModalOpen: false,
    locationModalOpen: false,
    newLocationValue: '',
    equipmentSelected: false,
    isAdd: false,
    newScheduleName: '',
    newScheduleAnnualHours: '',
    selectedOperation: null,
    isOperationOpen: false,
    refetchOperation: null
  }

  UNSAFE_componentWillMount = () => {
    if (this.props.building && this.props.building.projects) {
      this.setState({
        projectMap: this.props.building.projects.reduce((acc, project) => {
          return Object.assign(acc, { [project._id]: project })
        }, {})
      })
    }

    if (
      this.props.mode === 'editEquipment' ||
      this.props.mode === 'copyEquipment'
    ) {
      this.setState({ equipmentSelected: true })
    }
  }

  handleSelect = ({
    client,
    query,
    variables,
    selected,
    setFieldValue,
    values
  }) => {
    setFieldValue('equipment', selected)
    setFieldValue('quantity', 1)
    setFieldValue('application', selected.application || '')
    setFieldValue('category', selected.category || '')
    setFieldValue('technology', selected.technology || '')
    setFieldValue('fuel', selected.fuel || '')
    setFieldValue('name', selected.name || '')
    this.setState({
      isSelected: true,
      isCreate: false,
      equipmentSelected: true
    })
    this.handleSchema({
      client,
      query,
      variables,
      selected,
      setFieldValue,
      values
    })
    this.props.onSelect()
  }

  handleCreate = ({
    client,
    query,
    variables,
    setFieldValue,
    values,
    selectedCategory
  }) => {
    setFieldValue('equipment', {})
    setFieldValue('quantity', 1)
    if (selectedCategory) {
      setFieldValue('category', selectedCategory.category)
      setFieldValue('application', selectedCategory.application)
      setFieldValue('technology', selectedCategory.technology)
    }
    this.setState({
      displayFields: false,
      isSelected: false,
      isCreate: true
    })
    this.handleSchema({ client, query, variables, setFieldValue, values })
    this.props.onSelect()
  }

  handleDeselect = ({ client, query, variables, setFieldValue, values }) => {
    setFieldValue('equipment', {})
    setFieldValue('quantity', 0)
    setFieldValue('application', '')
    setFieldValue('category', '')
    setFieldValue('technology', '')
    setFieldValue('name', '')
    this.setState({
      isSelected: false,
      isCreate: false,
      equipmentSelected: false
    })
    this.handleSchema({ client, query, variables, setFieldValue, values })
  }

  handleSetEquipmentFields = ({
    setFieldValue,
    schemaFields,
    equipmentFields = {}
  }) => {
    setFieldValue(
      'fields',
      schemaFields.reduce((acc, e) => {
        return Object.assign(acc, {
          [e.field]: Object.assign(e, {
            value:
              (equipmentFields &&
                equipmentFields[e.field] &&
                equipmentFields[e.field].value) ||
              ''
          })
        })
      }, {})
    )
  }
  handleTagChange = setFieldValue => value => {
    setFieldValue('tag', value)
  }
  handleIdChange = setFieldValue => value => {
    setFieldValue('id', value)
  }
  handleCategoryChange = async ({
    client,
    query,
    setFieldValue,
    values,
    category,
    application,
    technology
  }) => {
    if (category || category === '') {
      setFieldValue('category', category)
    }

    if (application || application === '') {
      setFieldValue('application', application)
    }

    if (technology || technology === '') {
      setFieldValue('technology', technology)
    }

    const queryVariables = {
      schema: {
        application: application || values.application || null,
        category: category || values.category || null,
        technology: technology || values.technology || null
      }
    }

    const { data } = await client.query({
      query,
      variables: queryVariables
    })
    if (!data.equipmentSchema) {
      this.setState({ equipmentSelected: false })
      return
    }

    const { configs, fields, type, maintenances } = data.equipmentSchema
    setFieldValue('configs', configs)
    setFieldValue('type', type)
    setFieldValue('maintenances', maintenances)

    if (values.equipment && values.equipment.fields) {
      // we are editing - set fields with existing equipment
      this.handleSetEquipmentFields({
        equipmentFields: values.equipment.fields,
        schemaFields: fields,
        setFieldValue
      })
    } else {
      // we are deselecting - clear out any field values
      this.handleSetEquipmentFields({
        schemaFields: fields,
        setFieldValue
      })
    }

    this.setState({ equipmentSelected: true })
    this.props.onSelect()
  }

  handleSchema = async ({
    client,
    query,
    variables,
    selected,
    setFieldValue,
    values
  }) => {
    const queryVariables = selected
      ? {
          schema: {
            application: selected.application,
            category: selected.category,
            technology: selected.technology
          }
        }
      : variables
    const { data } = await client.query({
      query,
      variables: queryVariables
    })
    if (!data.equipmentSchema) {
      return
    }

    const { configs, fields, type, maintenances } = data.equipmentSchema

    setFieldValue('configs', configs)
    setFieldValue('type', type)
    setFieldValue('maintenances', maintenances)

    if (selected) {
      // we are creating - set fields from selected equipment
      this.handleSetEquipmentFields({
        equipmentFields: selected.fields,
        schemaFields: fields,
        setFieldValue
      })
    } else if (values.equipment && values.equipment.fields) {
      // we are editing - set fields with existing equipment
      this.handleSetEquipmentFields({
        equipmentFields: values.equipment.fields,
        schemaFields: fields,
        setFieldValue
      })
    } else {
      // we are deselecting - clear out any field values
      this.handleSetEquipmentFields({
        schemaFields: fields,
        setFieldValue
      })
    }
  }

  handleOpenProject = project => {
    if (!project) {
      this.setState({
        currentProject: {},
        projectModalOpen: true,
        currentProjectType: 'project'
      })
    } else if (project.measureId) {
      // this is a measure
      this.setState({
        currentProject: project,
        projectModalOpen: true,
        currentProjectType: 'measure'
      })
    } else {
      this.setState({
        currentProject: project,
        projectModalOpen: true,
        currentProjectType: 'project'
      })
    }
  }
  handleScheduleSelected = ({
    event,
    operations,
    setFieldTouched,
    setFieldValue
  }) => {
    const operation = operations.find(
      operation => operation._id === event.target.value
    )
    setFieldTouched('operation')
    setFieldValue('operation', operation)
  }
  handleCloseProject = (newProject, values, setFieldValue) => {
    if (newProject) {
      setFieldValue('projects', values.projects.concat(newProject))
    }
    this.setState({
      currentProject: {},
      projectModalOpen: false
    })
  }

  handleOpenLocation = value => {
    this.setState({
      newLocationValue: value,
      locationModalOpen: true
    })
  }

  handleCloseLocation = (location, setFieldValue) => {
    if (location) {
      setFieldValue('location', location)
    }
    this.setState({
      locationModalOpen: false,
      newLocationValue: ''
    })
  }

  handleGetInitialValues = () => {
    const {
      building,
      buildingEquipment,
      initialCategory,
      initialApplication,
      initialTechnology,
      equipment,
      mode,
      organization,
      locationToEquipment
    } = this.props
    const defaultValues = {
      application: initialApplication || '',
      buildingId: building._id || '',
      category: initialCategory || '',
      comments: '',
      configs: [],
      description: '',
      equipment: {},
      fields: {},
      images: [],
      location: locationToEquipment || {},
      name: '',
      operations: [],
      organizationId: organization._id,
      projects: [],
      quantity: 0,
      technology: initialTechnology || '',
      type: '',
      fuel: '',
      operation: '',
      tag: '',
      id: '',
      maintenances: []
    }
    if (mode === 'addEquipment') {
      return defaultValues
    }
    return {
      name: equipment.name,
      description: equipment.description,
      buildingEquipment,
      equipment,
      application: equipment.application,
      category: equipment.category,
      technology: equipment.technology,
      buildingId: defaultValues.buildingId,
      configs: buildingEquipment.configs || [],
      maintenances: buildingEquipment.maintenances || [],
      fields: equipment.fields || {},
      images:
        (this.props.modalView !== 'copyEquipment' &&
          buildingEquipment.images) ||
        [],
      comments: buildingEquipment.comments,
      projects: buildingEquipment.projects || [],
      quantity: buildingEquipment.quantity,
      operations: buildingEquipment.operations,
      organizationId: equipment.organization,
      location:
        mode === 'editEquipment'
          ? buildingEquipment.location || locationToEquipment
          : {},
      fuel: equipment.fuel,
      operation: {
        _id:
          buildingEquipment.operation && buildingEquipment.operation.id
            ? buildingEquipment.operation.id
            : '',
        scheduleName:
          buildingEquipment.operation && buildingEquipment.operation.name
            ? buildingEquipment.operation.name
            : ''
      },
      tag: getTagValue(buildingEquipment?.configs),
      id: getIdValue(buildingEquipment?.configs)
    }
  }

  handleSubmit = async (
    { executeMutation, executeEquipmentMutation },
    values
  ) => {
    const { mode, onClose, equipment, organization } = this.props
    const { isCreate } = this.state
    const isOrganizationEquipment = equipment && equipment.organization
    const input = {
      comments: values.comments,
      configs: values.configs
        .filter(c => c !== undefined && c !== null)
        .map(({ field, value }) => {
          if (field === 'tagID') {
            return { field, value: values.tag }
          }
          if (field === 'identifier') {
            return { field, value: values.id }
          }
          return { field, value }
        }),
      maintenances: values.maintenances
        .filter(c => c !== undefined && c !== null)
        .map(({ field, value }) => ({ field, value })),
      images: values.images,
      quantity: values.quantity,
      location: values.location ? values.location._id : null,
      operations: values.operations,
      operation: {
        id: values.operation._id,
        name: values.operation.scheduleName
      },
      projects: values.projects.map(project => project._id)
    }

    let libraryEquipmentId = values.equipment._id
    let fieldList = values.fields
    let updatedField
    if (isCreate) {
      updatedField = Object.entries(fieldList).reduce(
        (acc, [fieldName, field]) => {
          if (!field || typeof field !== 'object') return acc
          const { displayName, value, display, values } = field
          let fieldValue = ''
          if (value === '' && values != undefined && values.length > 0) {
            fieldValue = null
          } else if (value === '') {
            fieldValue = null
          } else {
            fieldValue = value
          }
          return {
            ...acc,
            [fieldName]: {
              displayName,
              value: fieldValue,
              display
            }
          }
        },
        {}
      )
    }
    const equipmentName = generateEquipmentName(values)
    if ((mode === 'addEquipment' || mode === 'copyEquipment') && isCreate) {
      const addEquipmentInput = {
        application: values.application || null,
        category: values.category || null,
        fields: updatedField,
        fuel: values.fuel || 'NA',
        name: equipmentName,
        organization: isOrganizationEquipment
          ? values.organizationId
          : organization._id,
        technology: values.technology || null,
        type: values.type || null
      }
      const { data } = await executeEquipmentMutation({
        variables: {
          equipment: addEquipmentInput
        }
      })
      libraryEquipmentId = data.addEquipment._id
    }

    let response
    if (mode === 'editEquipment') {
      if (isCreate) {
        let updateEquipmentInput = {
          fields: updatedField,
          fuel: values.fuel || 'NA',
          name: equipmentName,
          application: values.application || null,
          category: values.category || null,
          technology: values.technology || null
        }
        if (isOrganizationEquipment) {
          updateEquipmentInput = {
            ...updateEquipmentInput,
            _id: values.equipment._id
          }
        } else {
          updateEquipmentInput = {
            ...updateEquipmentInput,
            organization: organization._id,
            type: equipment.type || null
          }
        }
        const { data } = await executeEquipmentMutation({
          variables: {
            equipment: updateEquipmentInput
          }
        })
        libraryEquipmentId = isOrganizationEquipment
          ? data.updateEquipment._id
          : data.addEquipment._id
      }
      response = await executeMutation({
        variables: {
          input: {
            ...input,
            libraryEquipmentId,
            _id: values.buildingEquipment._id
          }
        }
      })
    } else {
      response = await executeMutation({
        variables: {
          input: {
            ...input,
            buildingId: values.buildingId,
            libraryEquipmentId
          }
        }
      })
    }
    return onClose(response)
  }

  getNamePlateDetailsCountText = values => {
    if (values && values.fields) {
      const fieldValues = Object.values(values.fields)
      let totalFields = 0
      let noOfFieldsWithValues = 0
      fieldValues.forEach(value => {
        if (value && value.display) {
          if (value.value) {
            noOfFieldsWithValues += 1
          }
          totalFields += 1
        }
      })
      if (totalFields > 0)
        return `(${noOfFieldsWithValues}/${totalFields} Fields)`
    }
    return ''
  }

  handleToggleDisplayFields = () =>
    this.setState({ displayFields: !this.state.displayFields })

  handleToggleDisplayConfig = () =>
    this.setState({
      displaySecondaryConfig: !this.state.displaySecondaryConfig
    })

  handleToggleDisplayMaintenance = () =>
    this.setState({
      displaySecondaryMaintenance: !this.state.displaySecondaryMaintenance
    })

  handleEditEquipmentDetails = () =>
    this.setState({ isCreate: !this.state.isCreate, displayFields: true })

  handleToggleAdd = () => {
    this.setState(prevState => ({
      isAdd: !prevState.isAdd,
      newScheduleName: '',
      newScheduleAnnualHours: ''
    }))
  }

  handleAddOperation = async (
    mutation,
    refetchOperation,
    setFieldValue,
    setFieldTouched
  ) => {
    let operationalScheduleId = '5e8ba73c1c9d440000bc932a'
    try {
      await mutation({
        variables: {
          input: {
            building: this.props.building._id,
            schedule: operationalScheduleId,
            scheduleName: this.state.newScheduleName,
            sunday: [],
            monday: [],
            tuesday: [],
            wednesday: [],
            thursday: [],
            friday: [],
            saturday: [],
            holiday: [],
            startDate: '',
            endDate: '',
            comments: '',
            holidays: 0,
            weeklyHours: -1,
            annualHours: +this.state.newScheduleAnnualHours,
            equipmentIds:
              this.props.mode === 'editEquipment'
                ? [this.props.equipment._id]
                : []
          }
        }
      })
      this.handleToggleAdd()
      let response = await refetchOperation()
      let operations =
        (response &&
          response.data &&
          response.data.building &&
          response.data.building.operations) ||
        []
      operations = operations.filter(
        item =>
          item.scheduleName == this.state.newScheduleName &&
          item.annualHours == +this.state.newScheduleAnnualHours
      )

      if (operations.length > 0) {
        setFieldValue('operation', operations[0])
        setFieldTouched('operation')
      }
    } catch (error) {
      this.handleToggleAdd()
    }
  }

  setOperation = (operation, refetchOperation) => {
    this.setState({
      selectedOperation: operation,
      isOperationOpen: true,
      refetchOperation
    })
  }

  handleCloseOperationModal = () => {
    this.setState({
      selectedOperation: null,
      isOperationOpen: false
    })
    if (this.state.refetchOperation) this.state.refetchOperation()
  }

  render() {
    const { building, mode, organization, client, equipment } = this.props
    const {
      displayFields,
      displaySecondaryConfig,
      displaySecondaryMaintenance,
      isCreate,
      isSelected,
      equipmentSelected
    } = this.state
    const buildingId = building._id
    const isOrganizationEquipment = equipment && equipment.organization
    let mutation, submitText, equipmentMutation
    switch (mode) {
      case 'addEquipment':
        mutation = ADD_BUILDING_EQUIPMENT
        equipmentMutation = ADD_EQUIPMENT
        submitText = 'Add Equipment'
        break
      case 'copyEquipment':
        mutation = ADD_BUILDING_EQUIPMENT
        equipmentMutation = ADD_EQUIPMENT
        submitText = 'Copy Equipment'
        break
      case 'editEquipment':
        mutation = UPDATE_BUILDING_EQUIPMENT
        equipmentMutation = isOrganizationEquipment
          ? UPDATE_EQUIPMENT
          : ADD_EQUIPMENT
        submitText = 'Update Equipment'
        break
    }
    return (
      <Mutation mutation={equipmentMutation}>
        {(executeEquipmentMutation, { loading, data }) => {
          return (
            <Mutation
              mutation={mutation}
              refetchQueries={() => [
                {
                  query: GET_BUILDING_EQUIPMENT,
                  variables: { buildingId }
                },
                {
                  query: GET_BUILDING_LOCATIONS,
                  variables: { id: buildingId }
                },
                {
                  query: GET_RECENT_BUILDING_EQUIPMENT,
                  variables: {
                    buildingId,
                    recentEquipment: {
                      category: null,
                      application: null,
                      technology: null
                    }
                  }
                }
              ]}
              onCompleted={data => {
                const locationId =
                  mode === 'addEquipment' || mode === 'copyEquipment'
                    ? (data.addBuildingEquipment.location &&
                        data.addBuildingEquipment.location._id) ||
                      null
                    : (data.updateBuildingEquipment.location &&
                        data.updateBuildingEquipment.location._id) ||
                      null
                const buildingEquipmentId =
                  mode === 'addEquipment' || mode === 'copyEquipment'
                    ? data.addBuildingEquipment._id
                    : data.updateBuildingEquipment._id

                if (locationId) {
                  client.mutate({
                    mutation: ADD_BUILDING_LOCATION_EQUIPMENT,
                    variables: {
                      input: {
                        buildingId,
                        locationId,
                        buildingEquipmentId
                      }
                    }
                  })
                }
              }}
            >
              {(executeMutation, { loading, error, data }) => {
                if (loading || error) {
                  return null
                }
                const initialValues = this.handleGetInitialValues()
                return (
                  <Formik
                    initialValues={initialValues}
                    enableReinitialize
                    isInitialValid={mode === 'copyEquipment'}
                    onSubmit={(values, { setSubmitting }) => {
                      setSubmitting(true)
                      this.handleSubmit(
                        {
                          executeMutation,
                          executeEquipmentMutation
                        },
                        values
                      ).then(() => setSubmitting(false))
                    }}
                    validate={values => {
                      let errors = {}

                      if (values.quantity < 1) {
                        errors.quantity = 'Quantity cannot be less than 1'
                      }

                      if (values.category.length === 0) {
                        errors.category = 'Category is required'
                      }
                      if (values.category === 'PLUG_LOAD') {
                        return errors
                      }

                      if (values.application.length === 0) {
                        errors.application = 'Application is required'
                      }

                      if (values.application.length === 0) {
                        errors.application = 'Application is required'
                      }

                      return errors
                    }}
                  >
                    {({
                      values,
                      isValid,
                      resetForm,
                      setFieldTouched,
                      setFieldValue,
                      errors: formErrors
                    }) => {
                      const hasEquipment =
                        !isCreate && values.equipment._id !== undefined
                      const isNewScheduleValid =
                        this.state.isAdd &&
                        this.state.newScheduleName &&
                        this.state.newScheduleAnnualHours
                      // if(values.category === 'LIGHTING' && Object.keys(values['fields']).length === 0 && values['fields'].constructor === Object) {
                      //   let lampInputPower = values['fields'].lampInputPower && values['fields'].lampInputPower.value || 0
                      //   let numberOfLamps = values['fields'].numberOfLamps && values['fields'].numberOfLamps.value || 0
                      //   let ballastFactor = values['fields'].ballastFactor && values['fields'].ballastFactor.value || 0
                      //   let totalInputPower = lampInputPower * numberOfLamps * ballastFactor
                      //   let calculatedFields = Object.assign({}, values['fields'])
                      //   console.log("--------calculatedFields", calculatedFields)
                      //   // calcuatedFields.totalInputPower.value = totalInputPower
                      //   setFieldValue('fields', calculatedFields)
                      // }

                      if (values.equipment._id === undefined && !isCreate) {
                        return (
                          <Query
                            query={EQUIPMENT_SCHEMA}
                            variables={{
                              schema: {
                                application:
                                  values.application === ''
                                    ? null
                                    : values.application,
                                category:
                                  values.category === ''
                                    ? null
                                    : values.category,
                                technology:
                                  values.technology === ''
                                    ? null
                                    : values.technology
                              }
                            }}
                          >
                            {({ client, variables, query }) => (
                              <Form className={styles.form}>
                                <EquipmentSelector
                                  building={building}
                                  organization={organization}
                                  values={values}
                                  onClear={() =>
                                    this.handleDeselect({
                                      client,
                                      query: EQUIPMENT_SCHEMA,
                                      variables,
                                      setFieldValue,
                                      values
                                    })
                                  }
                                  onCreate={selectedCategory =>
                                    this.handleCreate({
                                      client,
                                      query: EQUIPMENT_SCHEMA,
                                      variables,
                                      setFieldValue,
                                      values,
                                      selectedCategory
                                    })
                                  }
                                  onSelect={equipment =>
                                    this.handleSelect({
                                      client,
                                      selected: equipment,
                                      query: EQUIPMENT_SCHEMA,
                                      variables,
                                      setFieldValue,
                                      values
                                    })
                                  }
                                  onClose={this.props.onClose}
                                />
                              </Form>
                            )}
                          </Query>
                        )
                      }

                      return (
                        <div data-test='equipment-form'>
                          <Form className={styles.form}>
                            <div className={styles.assetForm}>
                              <FormSection
                                title='Details'
                                description='Search for equipment and add details.'
                                setSectionRef={this.props.setSectionRef}
                              >
                                <ErrorMessage
                                  name='name'
                                  component='div'
                                  className={styles.formError}
                                />
                                <ErrorMessage
                                  name='type'
                                  component='div'
                                  className={styles.formError}
                                />
                                <Query
                                  query={EQUIPMENT_SCHEMA}
                                  variables={{
                                    schema: {
                                      application:
                                        values.application === ''
                                          ? null
                                          : values.application,
                                      category:
                                        values.category === ''
                                          ? null
                                          : values.category,
                                      technology:
                                        values.technology === ''
                                          ? null
                                          : values.technology
                                    }
                                  }}
                                >
                                  {({
                                    loading,
                                    error,
                                    data,
                                    client,
                                    variables
                                  }) => {
                                    const { equipmentSchema } = data
                                    const query = EQUIPMENT_SCHEMA
                                    const showTagField = hasTagIdField(
                                      equipmentSchema?.configs
                                    )
                                    const showIdField = hasIdField(
                                      equipmentSchema?.configs
                                    )
                                    // const isSaveDisabled = (showTagIdField && !values.tagId) && (showIdField && !values.id);
                                    return (
                                      <div>
                                        {!loading &&
                                          (isCreate ||
                                            isSelected ||
                                            mode === 'editEquipment' ||
                                            mode === 'copyEquipment') && (
                                            <div
                                              className={styles.formSectionRow}
                                            >
                                              <EquipmentBasicInfo
                                                error={formErrors}
                                                isCreate={isCreate}
                                                showTagField={showTagField}
                                                showIdField={showIdField}
                                                handleEditEquipmentDetails={
                                                  this
                                                    .handleEditEquipmentDetails
                                                }
                                                formValues={values}
                                                onCategoryChange={categoryObj =>
                                                  this.handleCategoryChange({
                                                    client,
                                                    query,
                                                    setFieldValue,
                                                    values,
                                                    ...categoryObj
                                                  })
                                                }
                                                onTagChange={this.handleTagChange(
                                                  setFieldValue
                                                )}
                                                onIdChange={this.handleIdChange(
                                                  setFieldValue
                                                )}
                                                values={values}
                                                disabled={!isCreate}
                                                displayInitialFilters={
                                                  !!this.props
                                                    .initialCategory ||
                                                  !!this.props
                                                    .initialApplication ||
                                                  !!this.props.initialTechnology
                                                }
                                                disableCategory={
                                                  this.props
                                                    .disableCategorizationChange &&
                                                  !!this.props.initialCategory
                                                }
                                                disableApplication={
                                                  this.props
                                                    .disableCategorizationChange &&
                                                  !!this.props
                                                    .initialApplication
                                                }
                                                disableTechnology={
                                                  this.props
                                                    .disableCategorizationChange &&
                                                  !!this.props.initialTechology
                                                }
                                              />
                                              {equipmentSchema && (
                                                <>
                                                  <p
                                                    className={
                                                      styles.formFieldsTitle
                                                    }
                                                  >
                                                    Nameplate Details
                                                  </p>
                                                  <EquipmentFields
                                                    disabled={!isCreate}
                                                    setFieldValue={
                                                      setFieldValue
                                                    }
                                                    showPrimaryField
                                                    values={values}
                                                    fieldOptions={{
                                                      min: (type, field) =>
                                                        type === 'number' &&
                                                        (field ===
                                                          'yearOfManufacture' ||
                                                          field === 'cop')
                                                          ? 0
                                                          : 'any'
                                                    }}
                                                    fields={
                                                      isCreate
                                                        ? equipmentSchema.fields
                                                        : equipmentSchema.fields.filter(
                                                            ({ field }) =>
                                                              values['fields'][
                                                                field
                                                              ] &&
                                                              values['fields'][
                                                                field
                                                              ].value
                                                          )
                                                    }
                                                  />
                                                  <div
                                                    className={
                                                      styles.showDetails
                                                    }
                                                  >
                                                    <Link
                                                      title={
                                                        displayFields
                                                          ? `Hide`
                                                          : `Show`
                                                      }
                                                      onClick={
                                                        this
                                                          .handleToggleDisplayFields
                                                      }
                                                    />
                                                    <i className='material-icons'>
                                                      {displayFields
                                                        ? 'arrow_drop_up'
                                                        : 'arrow_drop_down'}
                                                    </i>
                                                  </div>
                                                </>
                                              )}

                                              {displayFields &&
                                                equipmentSchema && (
                                                  <EquipmentFields
                                                    disabled={!isCreate}
                                                    setFieldValue={
                                                      setFieldValue
                                                    }
                                                    values={values}
                                                    fieldOptions={{
                                                      min: (type, field) =>
                                                        type === 'number' &&
                                                        (field ===
                                                          'yearOfManufacture' ||
                                                          field === 'cop')
                                                          ? 0
                                                          : 'any'
                                                    }}
                                                    fields={
                                                      isCreate
                                                        ? equipmentSchema.fields
                                                        : equipmentSchema.fields.filter(
                                                            ({ field }) =>
                                                              values['fields'][
                                                                field
                                                              ] &&
                                                              values['fields'][
                                                                field
                                                              ].value
                                                          )
                                                    }
                                                  />
                                                )}
                                              {equipmentSchema && (
                                                <>
                                                  <p
                                                    className={
                                                      styles.formFieldsTitle
                                                    }
                                                  >
                                                    Configuration
                                                  </p>
                                                  <EquipmentConfiguration
                                                    fields={
                                                      equipmentSchema.configs
                                                    }
                                                    showPrimaryConfig
                                                  />
                                                  <div
                                                    className={
                                                      styles.showDetails
                                                    }
                                                  >
                                                    <Link
                                                      title={
                                                        displaySecondaryConfig
                                                          ? `Hide`
                                                          : `Show`
                                                      }
                                                      onClick={
                                                        this
                                                          .handleToggleDisplayConfig
                                                      }
                                                    />
                                                    <i className='material-icons'>
                                                      {displaySecondaryConfig
                                                        ? 'arrow_drop_up'
                                                        : 'arrow_drop_down'}
                                                    </i>
                                                  </div>
                                                </>
                                              )}
                                              {displaySecondaryConfig &&
                                                equipmentSchema && (
                                                  <EquipmentConfiguration
                                                    fields={
                                                      equipmentSchema.configs
                                                    }
                                                  />
                                                )}
                                              {equipmentSchema?.maintenances && (
                                                <>
                                                  <p
                                                    className={
                                                      styles.formFieldsTitle
                                                    }
                                                  >
                                                    Maintenance Plan
                                                  </p>
                                                  <EquipmentMaintenance
                                                    fields={
                                                      equipmentSchema.maintenances
                                                    }
                                                    showPrimaryMaintenance
                                                    values={values.maintenances}
                                                    onFieldUpdate={
                                                      setFieldValue
                                                    }
                                                  />
                                                  <div
                                                    className={
                                                      styles.showDetails
                                                    }
                                                  >
                                                    <Link
                                                      title={
                                                        displaySecondaryMaintenance
                                                          ? `Hide`
                                                          : `Show`
                                                      }
                                                      onClick={
                                                        this
                                                          .handleToggleDisplayMaintenance
                                                      }
                                                    />
                                                    <i className='material-icons'>
                                                      {displaySecondaryMaintenance
                                                        ? 'arrow_drop_up'
                                                        : 'arrow_drop_down'}
                                                    </i>
                                                  </div>
                                                </>
                                              )}
                                              {displaySecondaryMaintenance &&
                                                equipmentSchema?.maintenances && (
                                                  <EquipmentMaintenance
                                                    fields={
                                                      equipmentSchema.maintenances
                                                    }
                                                    values={values.maintenances}
                                                    onFieldUpdate={
                                                      setFieldValue
                                                    }
                                                  />
                                                )}
                                            </div>
                                          )}
                                      </div>
                                    )
                                  }}
                                </Query>
                              </FormSection>
                            </div>
                            {(equipmentSelected ||
                              (!loading &&
                                (isCreate ||
                                  isSelected ||
                                  mode === 'editEquipment' ||
                                  mode === 'copyEquipment'))) && (
                              <div>
                                <FormSection
                                  title='Quantity'
                                  setSectionRef={this.props.setSectionRef}
                                >
                                  <div
                                    className={styles.assetFormInputRow}
                                    style={{
                                      justifyContent: 'flex-start'
                                    }}
                                  >
                                    <i
                                      className={classNames(
                                        styles.formIconButton,
                                        'material-icons'
                                      )}
                                      onClick={() => {
                                        setFieldTouched('quantity')
                                        setFieldValue(
                                          'quantity',
                                          values.quantity - 1
                                        )
                                      }}
                                    >
                                      remove
                                    </i>
                                    <Field
                                      name='quantity'
                                      type='number'
                                      className={styles.formField}
                                      style={{ width: 'auto' }}
                                    />
                                    <i
                                      className={classNames(
                                        styles.formIconButton,
                                        'material-icons'
                                      )}
                                      onClick={() => {
                                        setFieldTouched('quantity')
                                        setFieldValue(
                                          'quantity',
                                          values.quantity + 1
                                        )
                                      }}
                                    >
                                      add
                                    </i>
                                  </div>
                                  <ErrorMessage
                                    name='quantity'
                                    component='div'
                                    className={styles.formError}
                                  />
                                </FormSection>
                                <UserFeature name='buildingOperations'>
                                  {({ enabled }) => {
                                    if (!enabled) return null
                                    return (
                                      <FormSection
                                        title='Operation'
                                        description='Select an operation schedule'
                                        setSectionRef={this.props.setSectionRef}
                                      >
                                        <Mutation
                                          mutation={ADD_BUILDING_OPERATION}
                                        >
                                          {(
                                            executeMutation,
                                            {
                                              data: addOperationData,
                                              loading: addOperationLoading
                                            }
                                          ) => (
                                            <Query
                                              query={GET_BUILDING_OPERATIONS}
                                              variables={{ id: buildingId }}
                                            >
                                              {({
                                                loading,
                                                error,
                                                data,
                                                refetch: refetchOperation
                                              }) => {
                                                if (loading || error)
                                                  return (
                                                    <div
                                                      className={styles.List}
                                                    >
                                                      <Loader />
                                                    </div>
                                                  )

                                                const operations =
                                                  data.building.operations
                                                let { operation } = values
                                                if (operation) {
                                                  operation = operations.find(
                                                    item =>
                                                      item._id == operation ||
                                                      item._id == operation._id
                                                  )
                                                }
                                                if (operations)
                                                  return (
                                                    <div>
                                                      {!this.state.isAdd ? (
                                                        <div
                                                          className={
                                                            styles.scheduleContainer
                                                          }
                                                        >
                                                          <FieldSelect
                                                            label='Type'
                                                            name='operation'
                                                            data-test='operation'
                                                            component='select'
                                                            placeholder='Select a schedule'
                                                            value={
                                                              operation &&
                                                              operation._id !=
                                                                ''
                                                                ? operation._id
                                                                : ''
                                                            }
                                                            onChange={event =>
                                                              this.handleScheduleSelected(
                                                                {
                                                                  event,
                                                                  operations,
                                                                  setFieldTouched,
                                                                  setFieldValue
                                                                }
                                                              )
                                                            }
                                                          >
                                                            <option
                                                              defaultValue
                                                              value=''
                                                              disabled
                                                            >
                                                              Select a schedule
                                                            </option>
                                                            {!!operations &&
                                                              operations
                                                                .filter(
                                                                  operation =>
                                                                    operation &&
                                                                    operation.schedule &&
                                                                    operation
                                                                      .schedule
                                                                      .scheduleType ===
                                                                      'operational'
                                                                )
                                                                .map(
                                                                  operation => (
                                                                    <option
                                                                      value={
                                                                        operation._id
                                                                      }
                                                                      key={
                                                                        operation._id
                                                                      }
                                                                    >
                                                                      {
                                                                        operation.scheduleName
                                                                      }
                                                                    </option>
                                                                  )
                                                                )}
                                                          </FieldSelect>
                                                          <div
                                                            className={
                                                              styles.scheduleContainerRight
                                                            }
                                                          >
                                                            <button
                                                              type='button'
                                                              className={classNames(
                                                                styles.button,
                                                                styles.buttonPrimary
                                                              )}
                                                              onClick={() =>
                                                                this.handleToggleAdd()
                                                              }
                                                            >
                                                              <i className='material-icons'>
                                                                add
                                                              </i>
                                                              Add
                                                            </button>
                                                          </div>
                                                        </div>
                                                      ) : (
                                                        <div
                                                          className={
                                                            styles.newScheduleContainer
                                                          }
                                                        >
                                                          <div
                                                            className={
                                                              styles.newScheduleName
                                                            }
                                                          >
                                                            <FieldSelect
                                                              id='scheduleName'
                                                              name='scheduleName'
                                                              component='input'
                                                              label='Schedule Name'
                                                              type='text'
                                                              value={
                                                                this.state
                                                                  .newScheduleName
                                                              }
                                                              placeholder=''
                                                              onChange={event => {
                                                                this.setState({
                                                                  newScheduleName:
                                                                    event.target
                                                                      .value
                                                                })
                                                              }}
                                                            />
                                                          </div>
                                                          <div
                                                            className={
                                                              styles.newScheduleAnnualHours
                                                            }
                                                          >
                                                            <FieldSelect
                                                              id='scheduleAnnualHours'
                                                              name='scheduleAnnualHours'
                                                              component='input'
                                                              label='Annual Hours'
                                                              type='number'
                                                              value={
                                                                this.state
                                                                  .newScheduleAnnualHours
                                                              }
                                                              placeholder=''
                                                              onChange={event => {
                                                                this.setState({
                                                                  newScheduleAnnualHours:
                                                                    event.target
                                                                      .value
                                                                })
                                                              }}
                                                            />
                                                          </div>
                                                          <div
                                                            className={
                                                              styles.newScheduleButtonGroups
                                                            }
                                                          >
                                                            <button
                                                              type='button'
                                                              className={classNames(
                                                                styles.button,
                                                                styles.buttonPrimary,
                                                                {
                                                                  [styles.buttonDisable]:
                                                                    !isNewScheduleValid ||
                                                                    addOperationLoading
                                                                }
                                                              )}
                                                              onClick={() =>
                                                                this.handleAddOperation(
                                                                  executeMutation,
                                                                  refetchOperation,
                                                                  setFieldValue,
                                                                  setFieldTouched
                                                                )
                                                              }
                                                            >
                                                              {addOperationLoading ? (
                                                                <Loader
                                                                  size='button'
                                                                  color='white'
                                                                />
                                                              ) : (
                                                                <i className='material-icons'>
                                                                  check
                                                                </i>
                                                              )}
                                                            </button>
                                                            <button
                                                              type='button'
                                                              className={classNames(
                                                                styles.button,
                                                                styles.buttonSecondary,
                                                                {
                                                                  [styles.buttonDisable]: addOperationLoading
                                                                }
                                                              )}
                                                              onClick={() =>
                                                                this.handleToggleAdd()
                                                              }
                                                            >
                                                              <i className='material-icons'>
                                                                close
                                                              </i>
                                                            </button>
                                                          </div>
                                                        </div>
                                                      )}
                                                      {!this.state.isAdd &&
                                                        operation && (
                                                          <div
                                                            className={
                                                              styles.scheduleNameLink
                                                            }
                                                          >
                                                            <div
                                                              onClick={() =>
                                                                this.setOperation(
                                                                  operation,
                                                                  refetchOperation
                                                                )
                                                              }
                                                            >
                                                              {`${
                                                                operation.scheduleName
                                                              } (${
                                                                operation.annualHours ==
                                                                '-1'
                                                                  ? 0
                                                                  : operation.annualHours
                                                              } hrs/yr)`}

                                                              <span
                                                                onClick={e => {
                                                                  e.stopPropagation()
                                                                  e.preventDefault()
                                                                  this.setState(
                                                                    {
                                                                      newScheduleName: null
                                                                    }
                                                                  )
                                                                  setFieldTouched(
                                                                    'operation'
                                                                  )
                                                                  setFieldValue(
                                                                    'operation',
                                                                    {
                                                                      _id: '',
                                                                      scheduleName:
                                                                        ''
                                                                    }
                                                                  )
                                                                }}
                                                              >
                                                                <i className='material-icons'>
                                                                  close
                                                                </i>
                                                              </span>
                                                            </div>
                                                          </div>
                                                        )}
                                                    </div>
                                                  )
                                              }}
                                            </Query>
                                          )}
                                        </Mutation>
                                      </FormSection>
                                    )
                                  }}
                                </UserFeature>
                                {!this.props.hideLocation && (
                                  <FormSection
                                    title='Location'
                                    description='Add the location this equipment applies to such as exterior, offices, or a room number.'
                                    setSectionRef={this.props.setSectionRef}
                                  >
                                    <Query
                                      query={GET_BUILDING_LOCATIONS}
                                      variables={{
                                        id: this.props.building._id
                                      }}
                                    >
                                      {({ loading, error, data }) => {
                                        if (loading || error)
                                          return (
                                            <div className={styles.List}>
                                              <Loader />
                                            </div>
                                          )
                                        if (
                                          values.location &&
                                          values.location._id
                                        ) {
                                          return (
                                            <TagList
                                              values={[values.location]}
                                              getDisplayValue={
                                                getLocationDisplayName
                                              }
                                              onDelete={value =>
                                                setFieldValue('location', null)
                                              }
                                            />
                                          )
                                        }
                                        if (
                                          !values.location ||
                                          !values.location._id
                                        ) {
                                          return (
                                            <AutoSuggest
                                              name='location'
                                              dontDisable
                                              values={data.building.locations.map(
                                                buildingLocation =>
                                                  buildingLocation.location
                                              )}
                                              getSuggestionValue={s =>
                                                getLocationDisplayName(s)
                                              }
                                              onAdd={(
                                                addedLocation,
                                                inputValue
                                              ) => {
                                                // addedLocation is null if it is not already on the building
                                                // e.g. if the user types in a free form text
                                                if (addedLocation) {
                                                  setFieldValue(
                                                    'location',
                                                    addedLocation
                                                  )
                                                } else {
                                                  this.handleOpenLocation(
                                                    inputValue
                                                  )
                                                }
                                              }}
                                              renderSuggestion={s => (
                                                <span data-test='location-suggestion'>
                                                  {getLocationDisplayName(s)}
                                                </span>
                                              )}
                                            />
                                          )
                                        }
                                      }}
                                    </Query>
                                  </FormSection>
                                )}
                                <FormSection
                                  title='Comments'
                                  description='Add comments related to this equipment.'
                                  setSectionRef={this.props.setSectionRef}
                                >
                                  <Field
                                    label='Comments'
                                    component='textarea'
                                    name='comments'
                                    placeholder='Add comments about this equipment'
                                  />
                                </FormSection>
                                <FormSection
                                  title='Images'
                                  description='Take photos or import images related to this equipment. Note images are compressed.'
                                  setSectionRef={this.props.setSectionRef}
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
                                        Object.keys(images).map(
                                          k => images[k].uploadUrl
                                        )
                                      )
                                    }}
                                  />
                                </FormSection>
                                <Feature name='equipmentProject'>
                                  {({ enabled }) => {
                                    if (!enabled) return null
                                    return (
                                      <FormSection
                                        title='Projects'
                                        description='Add complete projects related to this action'
                                        setSectionRef={this.props.setSectionRef}
                                      >
                                        {values.projects && (
                                          <SortableList
                                            listData={values.projects}
                                            loading={false}
                                            showTotals={false}
                                            columns={{
                                              name: {
                                                header: 'Project',
                                                size: 3,
                                                sortKey: 'displayName',
                                                render: (
                                                  displayName,
                                                  project
                                                ) => (
                                                  <div
                                                    className={
                                                      styles.formProjectListItem
                                                    }
                                                    onClick={() =>
                                                      this.handleOpenProject(
                                                        project
                                                      )
                                                    }
                                                  >
                                                    {displayName}
                                                  </div>
                                                )
                                              }
                                            }}
                                          />
                                        )}
                                        <div
                                          className={styles.assetFormInputRow}
                                          style={{
                                            justifyContent: 'flex-start'
                                          }}
                                        >
                                          <i
                                            data-test='building-equipment-add-project'
                                            className={classNames(
                                              styles.formIconButton,
                                              'material-icons'
                                            )}
                                            onClick={() =>
                                              this.handleOpenProject()
                                            }
                                          >
                                            add
                                          </i>
                                        </div>
                                      </FormSection>
                                    )
                                  }}
                                </Feature>
                              </div>
                            )}
                            <Footer>
                              <button
                                type='button'
                                className={classNames(
                                  styles.button,
                                  styles.buttonSecondary
                                )}
                                onClick={this.props.onClose}
                              >
                                Cancel
                              </button>
                              <button
                                className={classNames(
                                  styles.button,
                                  styles.buttonPrimary,
                                  {
                                    [styles.buttonDisable]: !isValid
                                  }
                                )}
                                disabled={!isValid}
                                type='submit'
                                data-test='building-equipment-add-button'
                              >
                                {submitText}
                              </button>
                            </Footer>
                            {this.state.projectModalOpen && (
                              <ProjectsModal
                                {...this.props.projectProps}
                                nestedModal
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
                          </Form>
                          {this.state.locationModalOpen && (
                            <LocationModal
                              user={this.props.user}
                              building={this.props.building}
                              organization={this.props.organization}
                              onClose={location =>
                                this.handleCloseLocation(
                                  location,
                                  setFieldValue
                                )
                              }
                              modalView='addLocation'
                              initialName={this.state.newLocationValue}
                              fromEquipment
                            />
                          )}
                          {this.state.isOperationOpen && (
                            <OperationModal
                              user={this.props.user}
                              building={this.props.building}
                              onClose={this.handleCloseOperationModal}
                              operation={this.state.selectedOperation}
                              modalView={'editOperation'}
                            />
                          )}
                        </div>
                      )
                    }}
                  </Formik>
                )
              }}
            </Mutation>
          )
        }}
      </Mutation>
    )
  }
}
export default withApollo(EquipmentForm)
