import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import BuildingDetailsEditIdentifiers from './BuildingDetailsEditIdentifiers'
import BuildingDetailsEditTags from './BuildingDetailsEditTags'
import styles from './BuildingDetailsEdit.scss'
import buildingTypes from 'static/building-types'
import {
  espmRequirements,
  espmLabelOption,
  espmFieldNameMatch
} from 'static/espm-requirements'
import contactRoles from 'static/contact-roles.json'
import contactQualifications from 'static/contact-qualification.json'
import { RenderField, RenderSelect, Field } from '../FormFields'
import { Loader } from 'utils/Loader'
import { Resize, formatCamelCaseNotation, getStates } from 'utils/Utils'
import UseTypeDropDown from 'components/UI/UseTypeDropDown'
import { isEmpty } from 'lodash'

export class BuildingDetailsEdit extends React.Component {
  static propTypes = {
    buildingInfo: PropTypes.object.isRequired,
    onBuildingDetailsSubmit: PropTypes.func.isRequired,
    cancelEditForm: PropTypes.func.isRequired,
    getBuildingIdentifiers: PropTypes.func.isRequired,
    user: PropTypes.object.isRequired
  }

  state = {
    eaAudits: [],
    loadingStatus: '',
    formValues: {
      buildingName: '',
      country: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      customFields: [],
      contacts: [],
      floorCount: '',
      belowGradeFloorCount: '0',
      squareFeet: '',
      buildYear: '',
      open247: '',
      buildingUse: '',
      buildingUseTypes: [],
      auditId:
        this.props.buildingInfo &&
        this.props.buildingInfo.firebaseRefs &&
        this.props.buildingInfo.firebaseRefs.auditId,
      buildingImage: '',
      clientName: '',
      siteName: '',
      tags: [],
      nycFields: {},
      areaErrorMessage: ''
    },
    contactFieldsOrder: [
      'firstName',
      'lastName',
      'title',
      'company',
      'phoneNumber',
      'emailAddress',
      'role',
      'qualification',
      'certificateNumber',
      'expirationDate',
      'yearsOfExperience'
    ],
    newFieldValues: {},
    newFields: []
  }

  componentDidMount = () => {
    const { buildingInfo } = this.props
    this.setFormValues(buildingInfo)
    if (buildingInfo.eaAuditsInfo && buildingInfo.eaAuditsInfo.length) {
      this.setState({ eaAudits: buildingInfo.eaAuditsInfo })
    }
    this.setState({
      newFieldValues: buildingInfo.newFieldValues || {},
      newFields: buildingInfo.newFields || []
    })
  }

  setFormValues = buildingInfo => {
    let tempFormState = { ...this.state.formValues }
    if (buildingInfo && Object.keys(buildingInfo).length > 0) {
      if (buildingInfo.buildingName) {
        tempFormState.buildingName = buildingInfo.buildingName
      }
      if (buildingInfo.buildingImage) {
        tempFormState.buildingImage = buildingInfo.buildingImage
      }
      if (buildingInfo.location && buildingInfo.location.country) {
        tempFormState.country = buildingInfo.location.country
      }
      if (buildingInfo.location && buildingInfo.location.address) {
        tempFormState.address = buildingInfo.location.address
      }
      if (buildingInfo.location && buildingInfo.location.city) {
        tempFormState.city = buildingInfo.location.city
      }
      if (buildingInfo.location && buildingInfo.location.state) {
        tempFormState.state = buildingInfo.location.state
      }
      if (buildingInfo.location && buildingInfo.location.zipCode) {
        tempFormState.zipCode = buildingInfo.location.zipCode
      }
      if (buildingInfo.customFields) {
        tempFormState.customFields = buildingInfo.customFields
      }
      if (buildingInfo.floorCount) {
        tempFormState.floorCount = buildingInfo.floorCount
      }
      if (buildingInfo.belowGradeFloorCount) {
        tempFormState.belowGradeFloorCount =
          buildingInfo.belowGradeFloorCount || '0'
      }
      if (buildingInfo.squareFeet) {
        tempFormState.squareFeet = buildingInfo.squareFeet
      }
      if (buildingInfo.buildYear) {
        tempFormState.buildYear = buildingInfo.buildYear
      }
      if (buildingInfo.open247) {
        tempFormState.open247 = buildingInfo.open247
      }
      if (buildingInfo.buildingUse) {
        tempFormState.buildingUse = buildingInfo.buildingUse
      }
      if (buildingInfo.contacts) {
        tempFormState.contacts = buildingInfo.contacts
      }
      if (buildingInfo.nycFields) {
        tempFormState.nycFields = buildingInfo.nycFields
      }
      if (buildingInfo.buildingUseTypes) {
        tempFormState.buildingUseTypes = buildingInfo.buildingUseTypes
      }
      if (buildingInfo.clientName) {
        tempFormState.clientName = buildingInfo.clientName
      }
      if (buildingInfo.siteName) {
        tempFormState.siteName = buildingInfo.siteName
      }
      if (buildingInfo.tags) {
        tempFormState.tags = buildingInfo.tags
      }
      if (buildingInfo.nycFields) {
        tempFormState.nycFields = buildingInfo.nycFields
      }
      if (buildingInfo.clientIndustry) {
        tempFormState.clientIndustry = buildingInfo.clientIndustry
      }
    }
    this.setState({ formValues: tempFormState })
  }

  handleFindUserId = (obj, key, value) => {
    return obj.find(function(v) {
      return v[key] === value
    })
  }

  handleInputChange = event => {
    const nycNames = [
      'borough',
      'block',
      'taxLot',
      'bin',
      'historicBuilding',
      'percentOwned',
      'percentLeased',
      'multiTenant',
      'sharedEnergySystemsOrMetersForMultipleBuildingsOnSingleLot',
      'sharedEnergySystemsOrMetersForMultipleBuildingsOnMultipleLots'
    ]
    let tempFormState = { ...this.state.formValues }

    if (nycNames.includes(event.target.name)) {
      tempFormState.nycFields[event.target.name] = event.target.value
    } else {
      tempFormState[event.target.name] = event.target.value
    }

    if (event.target.name === 'squareFeet') {
      let useTypeTotalArea = tempFormState.buildingUseTypes.reduce(
        (a, b) => a + Number(b.squareFeet),
        0
      )
      if (useTypeTotalArea !== Number(tempFormState.squareFeet)) {
        tempFormState.areaErrorMessage = `Gross Floor Area mismatch. Entered: ${tempFormState.squareFeet} Calculated: ${useTypeTotalArea}`
      } else {
        tempFormState.areaErrorMessage = ''
      }
    }

    if (event.target.name === 'country') {
      tempFormState.state = ''
    }

    this.setState({ formValues: tempFormState })
  }

  handleCustomInputChange = (fieldName, value) => {
    let tempFormState = { ...this.state.formValues }
    tempFormState[fieldName] = value
    this.setState({ formValues: tempFormState })
  }

  handleInputClientNameChange = name => {
    let tempFormState = { ...this.state.formValues }
    tempFormState.clientName = name
    this.setState({ formValues: tempFormState })
  }

  handleInputClientIndustryChange = name => {
    let tempFormState = { ...this.state.formValues }
    tempFormState.clientIndustry = name
    this.setState({ formValues: tempFormState })
  }

  handleInputSiteNameChange = name => {
    let tempFormState = { ...this.state.formValues }
    tempFormState.siteName = name
    this.setState({ formValues: tempFormState })
  }

  handleAddTag = tag => {
    let tempFormState = { ...this.state.formValues }
    tempFormState.tags.push(tag)
    this.setState({ formValues: tempFormState })
  }

  handleDeleteTag = index => {
    let tempFormState = { ...this.state.formValues }
    tempFormState.tags.splice(index, 1)
    this.setState({ formValues: tempFormState })
  }

  handleClearInputValue = e => {
    e.target.value = ''
  }

  handleImageUpload = e => {
    var file = e.target.files[0]
    var self = this
    var maxWidth = 900
    var maxHeight = 900
    this.setState({ loadingStatus: 'loading' })

    Resize(file, maxWidth, maxHeight, function(resizedDataUrl) {
      const data = new FormData()
      data.append('file', resizedDataUrl)
      data.append('filename', file.name)

      self.props
        .uploadProjectImage(data)
        .then(imageUrl => {
          let tempState = { ...self.state }
          tempState.loadingStatus = 'success'
          tempState.formValues.buildingImage = imageUrl
          self.setState(tempState)
        })
        .catch(() => {
          self.setState({ loadingStatus: 'fail' })
        })
    })
  }

  handleImageRemove = () => {
    let tempFormValues = { ...this.state.formValues }
    tempFormValues.buildingImage = ''
    this.setState({ formValues: tempFormValues })
  }

  addCustomField = () => {
    let tempFormValues = { ...this.state.formValues }
    tempFormValues.customFields.push({ key: '', value: '' })
    this.setState({ formValues: tempFormValues })
  }

  handleEditCustomField = (e, index) => {
    let tempFormValues = { ...this.state.formValues }
    tempFormValues.customFields[index][e.target.name] = e.target.value
    this.setState({ formValues: tempFormValues })
  }

  handleCustomFieldsRemove = (e, index) => {
    let tempFormValues = { ...this.state.formValues }
    tempFormValues.customFields.splice(index, 1)
    this.setState({ formValues: tempFormValues })
  }

  addContact = () => {
    let tempFormValues = { ...this.state.formValues }
    tempFormValues.contacts.push({
      firstName: '',
      lastName: '',
      company: '',
      title: '',
      role: '',
      phoneNumber: '',
      emailAddress: '',
      qualification: '',
      certificateNumber: '',
      expirationDate: '',
      yearsOfExperience: 0
    })
    this.setState({ formValues: tempFormValues })
  }

  changeContactField = (e, index) => {
    let tempFormValues = { ...this.state.formValues }
    tempFormValues.contacts[index][e.target.name] = e.target.value
    this.setState({ formValues: tempFormValues })
  }

  removeContact = (e, index) => {
    let tempFormValues = { ...this.state.formValues }
    tempFormValues.contacts.splice(index, 1)
    this.setState({ formValues: tempFormValues })
  }

  addField = (field, initialValue = { key: '', value: '' }) => {
    let tempFormValues = { ...this.state.formValues }
    tempFormValues[field].push(initialValue)
    this.setState({ formValues: tempFormValues })
  }

  handleEditUseTypeFields = (e, index) => {
    try {
      let tempFormValues = { ...this.state.formValues }
      tempFormValues['buildingUseTypes'][index][e.target.name] = e.target.value
      if (e.target.name === 'grossFloorArea') {
        let useTypeTotalArea = tempFormValues.buildingUseTypes.reduce(
          (a, b) => a + Number(b.squareFeet),
          0
        )
        if (useTypeTotalArea !== Number(tempFormValues.squareFeet)) {
          tempFormValues.areaErrorMessage = `Gross Floor Area mismatch. Entered: ${tempFormValues.squareFeet} Calculated: ${useTypeTotalArea}`
        } else {
          tempFormValues.areaErrorMessage = ''
        }
      }
      this.setState({ formValues: tempFormValues })
    } catch (error) {
      console.log('error', error)
    }
  }

  handleUpdateUseType = (value, index) => {
    let tempFormValues = { ...this.state.formValues }
    tempFormValues['buildingUseTypes'][index]['use'] = value
    this.setState({ formValues: tempFormValues })
  }

  handleFieldsRemove = (field, e, index) => {
    let tempFormValues = { ...this.state.formValues }
    tempFormValues[field].splice(index, 1)
    this.setState({ formValues: tempFormValues })
  }

  handleSubmitForm = () => {
    let formValues = JSON.parse(JSON.stringify(this.state.formValues))
    let contacts = [...formValues.contacts]
    contacts = contacts.filter(contact => contact.firstName && contact.lastName)
    formValues.contacts = contacts
    this.props.onBuildingDetailsSubmit({
      formValues,
      newFieldValues: this.state.newFieldValues || {}
    })
  }

  showAdditionalFields() {
    return <div className={styles.buildingDetailsEdit} />
  }

  checkDisableSubmit = () => {
    const { contacts } = this.state.formValues
    return contacts.some(item => !item.firstName || !item.lastName)
  }

  handleChangeNewfields = (event, field) => {
    const { newFieldValues = {} } = this.state
    this.setState({
      newFieldValues: {
        ...newFieldValues,
        [field]: event.target.value || ''
      }
    })
  }

  renderNewField = field => {
    const { newFieldValues = {} } = this.state
    switch (field.type) {
      case 'Input':
        return (
          <div className={styles.detail}>
            <label htmlFor={field.title}>{field.label}</label>
            <input
              value={newFieldValues[field.title] || ''}
              name={field.title}
              type='text'
              placeholder={field.placeHolder}
              onChange={event => this.handleChangeNewfields(event, field.title)}
            />
          </div>
        )
      case 'InputNumber':
        return (
          <div className={styles.detail}>
            <label htmlFor={field.title}>{field.label}</label>
            <input
              value={newFieldValues[field.title] || ''}
              name={field.title}
              type='number'
              placeholder={field.placeHolder}
              onChange={event => this.handleChangeNewfields(event, field.title)}
            />
          </div>
        )
      case 'InputEmail':
        return (
          <div className={styles.detail}>
            <label htmlFor={field.title}>{field.label}</label>
            <input
              value={newFieldValues[field.title] || ''}
              name={field.title}
              type='email'
              placeholder={field.placeHolder}
              onChange={event => this.handleChangeNewfields(event, field.title)}
            />
          </div>
        )
      case 'Select':
        return (
          <div className={styles.detail}>
            <label htmlFor={field.title}>{field.label}</label>
            <div className={classNames(styles.selectContainer)}>
              <select
                name={field.title}
                value={newFieldValues[field.title] || field.defaultValue || ''}
                onChange={event =>
                  this.handleChangeNewfields(event, field.title)
                }
              >
                <option defaultValue value='' disabled>
                  Select {field.title}
                </option>
                {field.options.map(option => (
                  <option
                    key={`${field.title}-option-${option}`}
                    value={option}
                  >
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )
      case 'Date':
        return (
          <div className={styles.detail}>
            <label htmlFor={field.title}>{field.label}</label>
            <input
              value={newFieldValues[field.title] || ''}
              name={field.title}
              type='date'
              placeholder={field.placeHolder}
              onChange={event => this.handleChangeNewfields(event, field.title)}
            />
          </div>
        )
      default:
        return null
    }
  }

  renderESPMField = (field, key, value, fieldIndex) => {
    let fieldName = espmFieldNameMatch[key] || key
    let htmlName = espmLabelOption[key] || key
    let fieldType = 'text'
    let isOptional = value === 'Optional'
    let selectOptions = [
      'singleStore',
      'exteriorEntranceToThePublic',
      'highSchool',
      'cookingFacilities',
      'computerLab',
      'diningHall',
      'ownedBy',
      'nutrientRemoval',
      'fixedFilmTrickleFiltrationProcess',
      'supplementalHeating',
      'weekendOperation'
    ]
    let numberOptions = [
      'eligibleForScore',
      'minimumGrossFloorAreaSf',
      'numberOfBuildings',
      'weeklyOperatingHours',
      'minimumOperatingHours',
      'numberOfWorkersOnMainShift',
      'minimumNumberOfWorkersOnMainShift',
      'percentThatCanBeCooled',
      'percentThatCanBeHeated',
      'totalNumberOfResidentialLivingUnits',
      'numberOfRooms',
      'numberOfComputers',
      'numberOfCommercialRefrigerationUnits',
      'numberOfWalkInRefrigerationUnits',
      'areaOfAllWalkInRefrigerationUnits',
      'numberOfOpenClosedRefrigerationUnits',
      'lengthOfAllOpenClosedRefrigerationUnits',
      'numberOfCashRegisters',
      'requiredNumberOfStores',
      'studentSeatingCapacity',
      'monthsInUse',
      'grossFloorAreaUsedForFoodPreparation',
      'gymnasiumFloorArea',
      'maximumNumberOfFloors',
      'numberOfStaffedBeds',
      'minimumNumberOfStaffedBeds',
      'numberOfFullTimeEquivalentWorkers',
      'numberOfMriMachines',
      'surgeryCenterFloorArea',
      'numberOfSurgicalOperatingBeds',
      'percentUsedForColdStorage',
      'clearHeight',
      'numberOfGuestMealsServedPerYear',
      'hoursPerDayGuestsOnsite',
      'amountOfLaundryProcessedOnsiteAnnually',
      'fullserviceSpaFloorArea',
      'gymfitnessCenterFloorArea',
      'numberOfResidentialLivingUnitsInALowriseSetting',
      'numberOfResidentialLivingUnitsInAMidriseSetting',
      'numberOfResidentialLivingUnitsInAHighriseSetting',
      'numberOfBedrooms',
      'numberOfLaundryHookupsInAllUnits',
      'numberOfLaundryHookupsInCommonAreas',
      'maximumResidentCapacity',
      'averageNumberOfResidents',
      'maximumAverageNumberOfResidents',
      'numberOfResidentialWashingMachines',
      'numberOfCommercialWashingMachines',
      'numberOfResidentialElectronicLiftSystems',
      'plantDesignFlowRate',
      'minimumPlantDesignFlowRate',
      'averageInfluentBiologicalOxygenDemand',
      'minimumAverageInfluentBiologicalOxygenDemand',
      'averageEffluentBiologicalOxygenDemand',
      'minimumAverageEffluentBiologicalOxygenDemand',
      'seatingCapacity',
      'minimumSeatingCapacity',
      'numberOfWeekdaysOpen',
      'openFootage',
      'partiallyEnclosedFootage',
      'completelyEnclosedFootage',
      'occupancy'
    ]
    if (value === true) {
      if (selectOptions.includes(key)) fieldType = 'select'
      else if (numberOptions.includes(key)) {
        fieldType = 'number'
      } else {
        fieldType = typeof value === 'number' ? 'number' : 'text'
      }

      if (fieldType === 'number' || fieldType === 'text') {
        let inputValue = field[fieldName] || ''
        if (fieldType === 'number') inputValue = inputValue || value || ''
        return (
          <div className={styles.nestedFieldsRow}>
            <label htmlFor={fieldName}>{htmlName}</label>
            <input
              value={inputValue}
              name={fieldName}
              type={fieldType}
              onChange={e => this.handleEditUseTypeFields(e, fieldIndex)}
              required={!isOptional}
              placeholder='Use Default Value'
            />
          </div>
        )
      } else if (fieldType === 'select') {
        return (
          <div className={styles.nestedFieldsRow}>
            <label htmlFor={fieldName}>{htmlName}</label>
            <div className={styles.selectContainer}>
              <select
                value={field[fieldName]}
                name={fieldName}
                onChange={e => this.handleEditUseTypeFields(e, fieldIndex)}
              >
                <option value=''>Use Default Value</option>
                <option value='Yes'>Yes</option>
                <option value='No'>No</option>
              </select>
            </div>
          </div>
        )
      }
    }
    return null
  }

  renderESPMRequirements = (field, fieldIndex) => {
    if (!espmRequirements[field.use]) {
      if (!field.use) return null
      // need to show square feet, Occupancy, Number of Occupants
      let fields = ['squareFeet', 'occupancy', 'numberOfOccupancy']
      let htmlName = {
        squareFeet: 'Square Feet',
        occupancy: 'Occupancy (%)',
        numberOfOccupancy: 'Number Of Occupancy'
      }
      return (
        <div>
          {fields.map((item, index) => {
            let inputValue = field[item] || ''
            return (
              <div className={styles.nestedFieldsRow}>
                <label htmlFor={item}>{htmlName[item] || item}</label>
                <input
                  value={inputValue}
                  name={item}
                  type='number'
                  onChange={e => this.handleEditUseTypeFields(e, fieldIndex)}
                  required
                  placeholder='Use Default Value'
                />
              </div>
            )
          })}
        </div>
      )
    }
    let keys = Object.keys(espmRequirements[field.use])
    if (keys.includes('numberOfBuildings') && !field?.['numberOfBuildings']) {
      this.handleEditUseTypeFields(
        {
          target: {
            name: 'numberOfBuildings',
            value: '1'
          }
        },
        fieldIndex
      )
    }
    if (keys.length === 0) return null
    keys = keys.filter(
      key =>
        key !== 'buildingType' &&
        key !== 'numberOfReqdFields' &&
        key !== 'buildingTypeKey' &&
        key !== 'numberOfBuildings' &&
        key !== 'consecutiveMonthsOfEnergyData' &&
        espmRequirements[field.use][key]
    )
    return (
      <div>
        {keys.map((key, index) => (
          <div key={index}>
            {this.renderESPMField(
              field,
              key,
              espmRequirements[field.use][key],
              fieldIndex
            )}
          </div>
        ))}
      </div>
    )
  }

  render() {
    const { buildingInfo, user } = this.props
    const { formValues, newFields } = this.state
    const country = formValues.country || ''
    const stateOptions = getStates(country)
    const disableSubmit = this.checkDisableSubmit()

    return (
      <div className={styles.buildingDetailsEdit}>
        <div className={styles.panelContent}>
          <div className={styles.detail}>
            <label htmlFor='buildingName'>Name*</label>
            <input
              value={this.state.formValues.buildingName}
              name='buildingName'
              type='text'
              placeholder='Name'
              onChange={this.handleInputChange}
            />
          </div>
          <div className={styles.detail}>
            <label htmlFor='address'>Address*</label>
            <div className={styles.addressFields}>
              <div
                className={classNames(
                  styles.selectContainer,
                  styles.countrySelectContainer
                )}
              >
                <select
                  value={this.state.formValues.country}
                  name='country'
                  className={classNames(
                    this.state.formValues.country === ''
                      ? styles.selectPlaceholder
                      : ''
                  )}
                  onChange={this.handleInputChange}
                >
                  <option value='' disabled>
                    Country
                  </option>
                  <option value='United States'>United States</option>
                  <option value='Canada'>Canada</option>
                </select>
              </div>
              <input
                className={styles.street}
                value={this.state.formValues.address}
                name='address'
                type='text'
                placeholder='Street'
                onChange={this.handleInputChange}
              />
              <input
                className={styles.city}
                value={this.state.formValues.city}
                name='city'
                type='text'
                placeholder='City'
                onChange={this.handleInputChange}
              />
              <div className={classNames(styles.selectContainer, styles.state)}>
                <select
                  value={this.state.formValues.state}
                  name='state'
                  className={classNames(
                    this.state.formValues.state === ''
                      ? styles.selectPlaceholder
                      : ''
                  )}
                  onChange={this.handleInputChange}
                >
                  <option value='' disabled>
                    State/Province
                  </option>
                  {stateOptions.map(state => (
                    <option key={state} value={state}>
                      {state}
                    </option>
                  ))}
                </select>
              </div>
              <input
                className={styles.zip}
                value={this.state.formValues.zipCode}
                name='zipCode'
                type='text'
                placeholder='Postal Code'
                onChange={this.handleInputChange}
              />
            </div>
          </div>

          <div className={styles.detail}>
            <p className={styles.customFieldsLabel}>Custom Fields</p>
            <div className={styles.customFieldsInputs}>
              {this.state.formValues.customFields.map((field, index) => {
                return (
                  <div key={index} className={styles.customFieldsSingle}>
                    <input
                      value={field.key}
                      name='key'
                      type='text'
                      placeholder='Label'
                      onChange={e => this.handleEditCustomField(e, index)}
                    />
                    <input
                      value={field.value}
                      name='value'
                      type='text'
                      placeholder='Value'
                      onChange={e => this.handleEditCustomField(e, index)}
                    />
                    <div
                      className={styles.customFieldsRemove}
                      onClick={e => this.handleCustomFieldsRemove(e, index)}
                    >
                      <i className='material-icons'>close</i>
                    </div>
                  </div>
                )
              })}
              <button
                onClick={this.addCustomField}
                className={classNames(styles.button, styles.buttonPrimary)}
              >
                Add custom field
              </button>
            </div>
          </div>

          <div className={styles.detail}>
            <label htmlFor='floorCount'>Above Grade Floors*</label>
            <input
              value={this.state.formValues.floorCount}
              name='floorCount'
              type='number'
              placeholder='Above Grade Floors'
              min={0}
              onChange={this.handleInputChange}
            />
          </div>
          <div className={styles.detail}>
            <label htmlFor='floorCount'>Below Grade Floors*</label>
            <input
              value={this.state.formValues.belowGradeFloorCount}
              name='belowGradeFloorCount'
              type='number'
              placeholder='Below Grade Floors'
              min={0}
              onChange={this.handleInputChange}
            />
          </div>
          <div className={styles.detail}>
            <label htmlFor='buildYear'>Year Built*</label>
            <input
              value={this.state.formValues.buildYear}
              name='buildYear'
              type='number'
              placeholder='Year built'
              onChange={this.handleInputChange}
            />
          </div>
          <div className={styles.detail}>
            <label htmlFor='open247'>Open 24/7?*</label>
            <div>
              <div className={styles.radioContainer}>
                <label>
                  <input
                    type='radio'
                    id='yes'
                    name='open247'
                    value='yes'
                    checked={
                      this.state.formValues.open247 === 'yes' ||
                      this.state.formValues.open247 === 'Yes'
                    }
                    onChange={this.handleInputChange}
                  />
                  <span>Yes</span>
                </label>
              </div>
              <div className={styles.radioContainer}>
                <label>
                  <input
                    type='radio'
                    id='no'
                    name='open247'
                    value='no'
                    checked={this.state.formValues.open247 === 'no'}
                    onChange={this.handleInputChange}
                  />
                  <span>No</span>
                </label>
              </div>
            </div>
          </div>
          <div className={classNames(styles.detail, styles.detailMarginSmall)}>
            <label htmlFor='grossFloorArea'>Gross Floor Area*</label>
            <div className={styles.customFieldsInputs}>
              <div className={styles.customFieldsSingle}>
                <input
                  value={this.state.formValues.squareFeet}
                  name='squareFeet'
                  type='number'
                  placeholder='Square feet'
                  onChange={this.handleInputChange}
                />
              </div>
            </div>
          </div>
          <div className={classNames(styles.detail, styles.detailMarginSmall)}>
            <label htmlFor='buildingUse'>Primary Use*</label>
            <div>
              <div
                className={classNames(
                  styles.customFieldsSingle,
                  styles.useTypeDropdownContainer
                )}
              >
                <UseTypeDropDown
                  useType={this.state.formValues.buildingUse}
                  onChange={value =>
                    this.handleCustomInputChange('buildingUse', value)
                  }
                />
              </div>
            </div>
          </div>
          <div className={classNames(styles.detail, styles.detailMarginSmall)}>
            <label htmlFor='buildingUse'>Building Use List*</label>
            <div className={styles.nestedFieldsInputs}>
              {this.state.formValues.buildingUseTypes.map((field, index) => {
                return (
                  <div key={index} className={styles.nestedFieldsSingle}>
                    <div className={styles.nestedFieldsRow}>
                      <div className={styles.useTypeDropdownContainer}>
                        <UseTypeDropDown
                          useType={field.use}
                          onChange={value =>
                            this.handleUpdateUseType(value, index)
                          }
                        />
                      </div>
                      <div
                        className={styles.nestedFieldsRemove}
                        onClick={e =>
                          this.handleFieldsRemove('buildingUseTypes', e, index)
                        }
                      >
                        <i className='material-icons'>close</i>
                      </div>
                    </div>
                    {this.renderESPMRequirements(field, index)}
                  </div>
                )
              })}
              <button
                onClick={() => this.addField('buildingUseTypes', {})}
                className={classNames(styles.button, styles.buttonPrimary)}
              >
                Add use type
              </button>
            </div>
          </div>
          <span>{this.state.formValues.areaErrorMessage}</span>

          <BuildingDetailsEditIdentifiers
            formValues={this.state.formValues}
            handleInputClientNameChange={this.handleInputClientNameChange}
            handleInputSiteNameChange={this.handleInputSiteNameChange}
            handleInputClientIndustryChange={
              this.handleInputClientIndustryChange
            }
            getBuildingIdentifiers={this.props.getBuildingIdentifiers}
          />

          <div className={styles.detail}>
            <label htmlFor='contacts'>Contacts</label>
            <div className={styles.contactsInputs}>
              {this.state.formValues.contacts.map((contact, contactIndex) => {
                return (
                  <div key={contactIndex} className={styles.contactsSingle}>
                    {this.state.contactFieldsOrder.map((field, index) => {
                      if (field === 'qualification' || field === 'role') {
                        return (
                          <div key={index}>
                            <label htmlFor={field}>
                              {formatCamelCaseNotation(field)}
                            </label>
                            <div className={styles.selectContainer}>
                              <select
                                value={
                                  this.state.formValues.contacts[contactIndex][
                                    field
                                  ] || ''
                                }
                                name={field}
                                onChange={e =>
                                  this.changeContactField(e, contactIndex)
                                }
                              >
                                <option value='' disabled>
                                  Select
                                </option>
                                {field === 'role' &&
                                  contactRoles.map((option, index) => {
                                    let roles = this.state.formValues.contacts.map(
                                      contact => contact.role
                                    )
                                    const disabled =
                                      roles.indexOf(option) !== -1
                                    return (
                                      <option
                                        key={index}
                                        value={option}
                                        disabled={disabled}
                                      >
                                        {option}
                                      </option>
                                    )
                                  })}
                                {field === 'qualification' &&
                                  contactQualifications.map((option, index) => {
                                    return (
                                      <option key={index} value={option}>
                                        {option}
                                      </option>
                                    )
                                  })}
                              </select>
                            </div>
                          </div>
                        )
                      } else {
                        return (
                          <div key={index}>
                            <label htmlFor={field}>
                              {field === 'certificateNumber'
                                ? 'Certificate/License No.'
                                : formatCamelCaseNotation(field)}
                            </label>
                            <input
                              value={
                                this.state.formValues.contacts[contactIndex][
                                  field
                                ] || ''
                              }
                              name={field}
                              required={
                                field === 'firstName' || field === 'lastName'
                              }
                              type={
                                field === 'yearsOfExperience'
                                  ? 'number'
                                  : 'text'
                              }
                              onChange={e =>
                                this.changeContactField(e, contactIndex)
                              }
                            />
                          </div>
                        )
                      }
                    })}
                    <div
                      className={styles.contactsRemove}
                      onClick={e => this.removeContact(e, contactIndex)}
                    >
                      <i className='material-icons'>close</i>
                    </div>
                  </div>
                )
              })}
              <button
                onClick={this.addContact}
                className={classNames(styles.button, styles.buttonPrimary)}
              >
                Add Contact
              </button>
            </div>
          </div>

          <div className={styles.detail}>
            <label>Building Image</label>
            <div>
              <div className={styles.buildingImage}>
                {this.state.formValues.buildingImage &&
                  this.state.loadingStatus !== 'loading' && (
                    <div>
                      <img src={this.state.formValues.buildingImage} />
                      <div
                        className={styles.buildingImageRemove}
                        onClick={() => {
                          this.handleImageRemove()
                        }}
                      >
                        <i className='material-icons'>close</i>
                      </div>
                    </div>
                  )}
                {!this.state.formValues.buildingImage &&
                  this.state.loadingStatus !== 'loading' && (
                    <div className={styles.buildingImageTemp}>
                      <i className='material-icons'>domain</i>
                    </div>
                  )}

                {this.state.loadingStatus === 'loading' && (
                  <div className={styles.buildingImageSpinner}>
                    <Loader />
                  </div>
                )}
              </div>

              {this.state.loadingStatus === 'fail' && (
                <p>
                  Sorry, we couldn't upload this image. Please try again or
                  upload a smaller image.
                </p>
              )}

              <div className={styles.fileInputContainer}>
                <label>
                  <input
                    type='file'
                    name='building-image'
                    accept='image/*'
                    onClick={e => {
                      this.handleClearInputValue(e)
                    }}
                    onChange={e => {
                      this.handleImageUpload(e)
                    }}
                  />
                  <span
                    className={classNames(
                      styles.button,
                      styles.buttonSecondary
                    )}
                  >
                    Add a building image
                  </span>
                </label>
              </div>
            </div>
          </div>

          <BuildingDetailsEditTags
            formValues={this.state.formValues}
            handleAddTag={this.handleAddTag}
            handleDeleteTag={this.handleDeleteTag}
            getBuildingIdentifiers={this.props.getBuildingIdentifiers}
          />

          {user.products &&
            user.products.buildeeNYC === 'access' &&
            buildingInfo.nycFields && (
              <div className={styles.detail}>
                <label htmlFor='borough'>Borough</label>
                <input
                  value={this.state.formValues.nycFields.borough || ''}
                  name='borough'
                  type='text'
                  placeholder='Borough'
                  onChange={this.handleInputChange}
                />
              </div>
            )}
          {user.products &&
            user.products.buildeeNYC === 'access' &&
            buildingInfo.nycFields && (
              <div className={styles.detail}>
                <label htmlFor='block'>Block</label>
                <input
                  value={this.state.formValues.nycFields.block || ''}
                  name='block'
                  type='number'
                  placeholder='Block'
                  onChange={this.handleInputChange}
                />
              </div>
            )}
          {user.products &&
            user.products.buildeeNYC === 'access' &&
            buildingInfo.nycFields && (
              <div className={styles.detail}>
                <label htmlFor='taxLot'>Tax Lot</label>
                <input
                  value={this.state.formValues.nycFields.taxLot || ''}
                  name='taxLot'
                  type='number'
                  placeholder='Tax Lot'
                  onChange={this.handleInputChange}
                />
              </div>
            )}
          {user.products &&
            user.products.buildeeNYC === 'access' &&
            buildingInfo.nycFields && (
              <div className={styles.detail}>
                <label htmlFor='bin'>Bin</label>
                <input
                  value={this.state.formValues.nycFields.bin || ''}
                  name='bin'
                  type='number'
                  placeholder='BIN'
                  onChange={this.handleInputChange}
                />
              </div>
            )}
          {user.products &&
            user.products.buildeeNYC === 'access' &&
            buildingInfo.nycFields && (
              <div className={styles.detail}>
                <label htmlFor='historicBuilding'>Historic Building?</label>
                <div>
                  <div className={styles.radioContainer}>
                    <label>
                      <input
                        type='radio'
                        id='yes'
                        name='historicBuilding'
                        value='yes'
                        checked={
                          this.state.formValues.nycFields.historicBuilding ===
                          'yes'
                        }
                        onChange={this.handleInputChange}
                      />
                      <span>Yes</span>
                    </label>
                  </div>
                  <div className={styles.radioContainer}>
                    <label>
                      <input
                        type='radio'
                        id='no'
                        name='historicBuilding'
                        value='no'
                        checked={
                          this.state.formValues.nycFields.historicBuilding ===
                          'no'
                        }
                        onChange={this.handleInputChange}
                      />
                      <span>No</span>
                    </label>
                  </div>
                </div>
              </div>
            )}
          {user.products &&
            user.products.buildeeNYC === 'access' &&
            buildingInfo.nycFields && (
              <div className={styles.detail}>
                <label htmlFor='percentOwned'>Percent Owned</label>
                <input
                  value={this.state.formValues.nycFields.percentOwned || ''}
                  name='percentOwned'
                  type='number'
                  placeholder='Percent Owned'
                  min='0'
                  max='100'
                  onChange={this.handleInputChange}
                />
              </div>
            )}
          {user.products &&
            user.products.buildeeNYC === 'access' &&
            buildingInfo.nycFields && (
              <div className={styles.detail}>
                <label htmlFor='percentLeased'>Percent Leased</label>
                <input
                  value={this.state.formValues.nycFields.percentLeased || ''}
                  name='percentLeased'
                  type='number'
                  placeholder='Percent Leased'
                  min='0'
                  max='100'
                  onChange={this.handleInputChange}
                />
              </div>
            )}
          {user.products &&
            user.products.buildeeNYC === 'access' &&
            buildingInfo.nycFields && (
              <div className={styles.detail}>
                <label htmlFor='multiTenant'>Multi Tenant?</label>
                <div>
                  <div className={styles.radioContainer}>
                    <label>
                      <input
                        type='radio'
                        id='yes'
                        name='multiTenant'
                        value='yes'
                        checked={
                          this.state.formValues.nycFields.multiTenant === 'yes'
                        }
                        onChange={this.handleInputChange}
                      />
                      <span>Yes</span>
                    </label>
                  </div>
                  <div className={styles.radioContainer}>
                    <label>
                      <input
                        type='radio'
                        id='no'
                        name='multiTenant'
                        value='no'
                        checked={
                          this.state.formValues.nycFields.multiTenant === 'no'
                        }
                        onChange={this.handleInputChange}
                      />
                      <span>No</span>
                    </label>
                  </div>
                </div>
              </div>
            )}
          {user.products &&
            user.products.buildeeNYC === 'access' &&
            buildingInfo.nycFields && (
              <div className={styles.detail}>
                <label htmlFor='sharedEnergySystemsOrMetersForMultipleBuildingsOnSingleLot'>
                  Shared Energy Systems or Meters for Multiple Buildings on
                  Single Lot?
                </label>
                <div>
                  <div className={styles.radioContainer}>
                    <label>
                      <input
                        type='radio'
                        id='yes'
                        name='sharedEnergySystemsOrMetersForMultipleBuildingsOnSingleLot'
                        value='yes'
                        checked={
                          this.state.formValues.nycFields
                            .sharedEnergySystemsOrMetersForMultipleBuildingsOnSingleLot ===
                          'yes'
                        }
                        onChange={this.handleInputChange}
                      />
                      <span>Yes</span>
                    </label>
                  </div>
                  <div className={styles.radioContainer}>
                    <label>
                      <input
                        type='radio'
                        id='no'
                        name='sharedEnergySystemsOrMetersForMultipleBuildingsOnSingleLot'
                        value='no'
                        checked={
                          this.state.formValues.nycFields
                            .sharedEnergySystemsOrMetersForMultipleBuildingsOnSingleLot ===
                          'no'
                        }
                        onChange={this.handleInputChange}
                      />
                      <span>No</span>
                    </label>
                  </div>
                </div>
              </div>
            )}
          {user.products &&
            user.products.buildeeNYC === 'access' &&
            buildingInfo.nycFields && (
              <div className={styles.detail}>
                <label htmlFor='sharedEnergySystemsOrMetersForMultipleBuildingsOnMultipleLots'>
                  Shared Energy Systems or Meters for Multiple Buildings on
                  Multiple Lots?
                </label>
                <div>
                  <div className={styles.radioContainer}>
                    <label>
                      <input
                        type='radio'
                        id='yes'
                        name='sharedEnergySystemsOrMetersForMultipleBuildingsOnMultipleLots'
                        value='yes'
                        checked={
                          this.state.formValues.nycFields
                            .sharedEnergySystemsOrMetersForMultipleBuildingsOnMultipleLots ===
                          'yes'
                        }
                        onChange={this.handleInputChange}
                      />
                      <span>Yes</span>
                    </label>
                  </div>
                  <div className={styles.radioContainer}>
                    <label>
                      <input
                        type='radio'
                        id='no'
                        name='sharedEnergySystemsOrMetersForMultipleBuildingsOnMultipleLots'
                        value='no'
                        checked={
                          this.state.formValues.nycFields
                            .sharedEnergySystemsOrMetersForMultipleBuildingsOnMultipleLots ===
                          'no'
                        }
                        onChange={this.handleInputChange}
                      />
                      <span>No</span>
                    </label>
                  </div>
                </div>
              </div>
            )}

          {/* new buidling fields */}
          {/* {newFields.map((field, index) => {
            return <div key={field.title}>{this.renderNewField(field)}</div>
          })} */}
        </div>

        <div className={styles.panelActions}>
          <button
            onClick={this.props.cancelEditForm}
            className={classNames(styles.button, styles.buttonSecondary)}
          >
            Cancel
          </button>
          <button
            onClick={this.handleSubmitForm}
            className={classNames(styles.button, styles.buttonPrimary, {
              [styles.buttonDisable]: disableSubmit
            })}
            disabled={disableSubmit}
          >
            Save
          </button>
        </div>
      </div>
    )
  }
}

export default BuildingDetailsEdit
