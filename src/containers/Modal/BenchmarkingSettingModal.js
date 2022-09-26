import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'

import { connect } from 'react-redux'
import styles from './BenchmarkingSettingModal.scss'
import UseTypeDropDown from 'components/UI/UseTypeDropDown'
import {
  espmRequirements,
  espmLabelOption,
  espmFieldNameMatch
} from 'static/espm-requirements'

export class BenchmarkingSettingModal extends React.Component {
  static propTypes = {
    openBenchmarkingSettingModal: PropTypes.func.isRequired,
    buildingInfo: PropTypes.object.isRequired,
    onBuildingDetailsSubmit: PropTypes.func.isRequired
  }

  state = {
    didMount: false,
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
    newFieldValues: {}
  }

  componentDidMount = () => {
    const { buildingInfo } = this.props
    this.setFormValues(buildingInfo)
    this.setState({
      newFieldValues: buildingInfo.newFieldValues || {}
    })
    setTimeout(() => {
      this.setState({ didMount: true })
    }, 0)
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

  handleCustomInputChange = (fieldName, value) => {
    let tempFormState = { ...this.state.formValues }
    tempFormState[fieldName] = value
    this.setState({ formValues: tempFormState })
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

  renderESPMRequirements = (field, fieldIndex) => {
    console.log('field.use', field.use)
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
    if (keys.length === 0) return null
    keys = keys.filter(
      key =>
        key !== 'buildingType' &&
        key !== 'numberOfReqdFields' &&
        key !== 'buildingTypeKey' &&
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

  handleEditUseTypeFields = (e, index) => {
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
  }

  addField = (field, initialValue = { key: '', value: '' }) => {
    let tempFormValues = { ...this.state.formValues }
    tempFormValues[field].push(initialValue)
    this.setState({ formValues: tempFormValues })
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

  handleSubmitForm = () => {
    let formValues = JSON.parse(JSON.stringify(this.state.formValues))
    let contacts = [...formValues.contacts]
    contacts = contacts.filter(contact => contact.firstName && contact.lastName)
    formValues.contacts = contacts
    this.props.onBuildingDetailsSubmit({
      formValues,
      newFieldValues: this.state.newFieldValues || {}
    })
    this.props.openBenchmarkingSettingModal(false)
  }

  render() {
    return (
      <div
        className={classNames(
          styles.modal,
          styles.templatesModal,
          styles['fade-in'],
          this.state.didMount ? styles.visible : ''
        )}
      >
        <div className={classNames(styles.modalOuter, styles.modalOuterMiddle)}>
          <div className={styles.modalInner}>
            <div className={styles.templates}>
              <div className={styles.templatesHeading}>
                <h2>Settings</h2>
                <div
                  className={styles.modalClose}
                  onClick={() => this.props.openBenchmarkingSettingModal(false)}
                >
                  <i className='material-icons'>close</i>
                </div>
              </div>
              <p className={styles.modalDescription}>
                Portfolio Maager use type details can be defined below. Note
                changing the use types will impact the use types for the entire
                building in buildee.
              </p>

              <div className={styles.detail}>
                <label htmlFor='buildingUse'>Primary Use</label>
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

              <div
                className={classNames(styles.detail, styles.detailMarginSmall)}
              >
                <label htmlFor='buildingUse'>Use Types</label>
                <div className={styles.nestedFieldsInputs}>
                  {this.state.formValues.buildingUseTypes.map(
                    (field, index) => {
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
                                this.handleFieldsRemove(
                                  'buildingUseTypes',
                                  e,
                                  index
                                )
                              }
                            >
                              <i className='material-icons'>close</i>
                            </div>
                          </div>
                          {this.renderESPMRequirements(field, index)}
                        </div>
                      )
                    }
                  )}
                  <button
                    onClick={() => this.addField('buildingUseTypes', {})}
                    className={classNames(styles.button, styles.buttonPrimary)}
                  >
                    Add use type
                  </button>
                </div>
              </div>

              <div className={styles.templatesFooter}>
                <button
                  className={classNames(styles.button, styles.buttonSecondary)}
                  onClick={() => this.props.openBenchmarkingSettingModal(false)}
                >
                  Cancel
                </button>
                <button
                  className={classNames(styles.button, styles.buttonPrimary)}
                  onClick={this.handleSubmitForm}
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}
const mapStateToProps = state => ({
  user: (state.login && state.login.user) || {},
  building: (state.building && state.building.buildingView) || {},
  organization:
    (state.organization && state.organization.organizationView) || {}
})

const mapDispatchToProps = {}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(BenchmarkingSettingModal)
