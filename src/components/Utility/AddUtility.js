import React, { Component } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { Loader } from '../../utils/Loader'
import styles from './AddUtility.scss'
import AddUtilityCSV from './AddUtilityCSV'
import AddUtilityManual from './AddUtilityManual'
import {
  getUtilityHeadingData,
  validateConsumptionUtilities,
  validateDeliveryUtilities
} from './UtilityHelpers'
import { UNIT_DETAILS, UTILITY_UNITS_OPTIONS } from 'static/utility-units'

const MODAL_OPEN_CLASS = 'bodyModalOpen'

class AddUtility extends Component {
  static propTypes = {
    type: PropTypes.string.isRequired,
    consumptionOrDelivery: PropTypes.string.isRequired,
    buildingId: PropTypes.string.isRequired,
    createUtilities: PropTypes.func.isRequired,
    handleToggleAddUtility: PropTypes.func.isRequired,
    isUnusedUtility: PropTypes.bool.isRequired,
    commoditySettings: PropTypes.object
  }
  state = {
    isSubmitting: false,
    disableSubmit: false,
    utilityName: '',
    utilityNumber: '',
    utilityAccountNumber: '',
    utilityPurpose: '',
    meteringType: '',
    utilityConfiguration: '',
    utilityMeterShared: false,
    units: '',
    utilityInput: 'csv',
    manualUtilities: [],
    file: [],
    fileError: '',
    saveErrors: ''
  }

  componentWillUnmount() {
    document.body.classList.remove(MODAL_OPEN_CLASS)
  }

  componentDidMount = () => {
    document.body.classList.add(MODAL_OPEN_CLASS)
    const { type, commoditySettings } = this.props
    let defaultUnit = ''
    if (commoditySettings && commoditySettings[type]) {
      defaultUnit = commoditySettings[type].unit
    } else {
      defaultUnit = UNIT_DETAILS[type].defaultUnit
    }
    this.setState({ units: defaultUnit })
  }

  handleSetInput = input => {
    this.setState({ utilityInput: input })
    // clear error if it was a type error
    if (this.state.saveErrors === 'Please add a utility input.') {
      this.setState({ saveErrors: '' })
    }
  }

  handleNameChange = event => {
    let tempUtilName = { ...this.state.utilityName }
    tempUtilName = event.target.value
    this.setState({ utilityName: tempUtilName })
    // clear error if it was a name error
    if (
      this.state.saveErrors === 'Please enter a name for your utility bill.'
    ) {
      this.setState({ saveErrors: '' })
    }
  }

  handleNumberChange = event => {
    let tempUtilName = { ...this.state.utilityNumber }
    tempUtilName = event.target.value
    this.setState({ utilityNumber: tempUtilName })
    // clear error if it was a number error
    if (
      this.state.saveErrors === 'Please enter a number for your utility bill.'
    ) {
      this.setState({ saveErrors: '' })
    }
  }

  handleUnitChange = event => {
    let tempUnits = { ...this.state.units }
    tempUnits = event.target.value
    this.setState({ units: tempUnits })
  }

  handleInputChange = event => {
    this.setState({ [event.target.name]: event.target.value })
  }

  handleUploadFile = file => {
    this.setState({ file: file })
  }

  handleClearFileErrors = () => {
    this.setState({ fileError: '' })
  }

  handleChangeManualUtilities = utilsArr => {
    this.setState({ manualUtilities: utilsArr })
  }

  handleSubmit = () => {
    if (this.props.consumptionOrDelivery === 'consumption') {
      this.handleSubmitConsumption()
    } else if (this.props.consumptionOrDelivery === 'delivery') {
      this.handleSubmitDelivery()
    }
  }
  handleSubmitConsumption = () => {
    const { file, manualUtilities } = this.state

    validateConsumptionUtilities(manualUtilities)
      .then(() => {
        if (!this.state.disableSubmit) {
          let payload = {}
          payload.name = this.state.utilityName
          payload.number = this.state.utilityNumber
          payload.accountNumber = this.state.utilityAccountNumber
          payload.meterPurpose = this.state.utilityPurpose
          payload.meterType = this.state.meteringType
          payload.meterConfiguration = this.state.utilityConfiguration
          payload.meterShared = this.state.utilityMeterShared
          payload.units = this.state.units
          payload.buildingId = this.props.buildingId
          payload.type = this.props.type
          payload.source = this.state.utilityInput
          payload.consumptionOrDelivery = 'consumption'
          payload.upload =
            this.state.utilityInput === 'csv'
              ? { csv: file }
              : { manual: manualUtilities }

          if (!this.props.buildingId) return

          if (!payload.name) {
            this.setState({
              saveErrors: 'Please enter a name for your utility bill.'
            })
            return
          }

          if (!payload.number) {
            this.setState({
              saveErrors: 'Please enter a number for your utility bill.'
            })
            return
          }

          if (!this.state.utilityInput) {
            this.setState({ saveErrors: 'Please add a utility input.' })
            return
          }

          if (
            this.state.utilityInput === 'csv' &&
            Object.keys(file).length === 0 &&
            file.constructor === Object
          ) {
            this.setState({ saveErrors: 'Please upload a utility bill.' })
            return
          }

          if (
            (this.state.utilityInput === 'manual' &&
              manualUtilities.length === 0) ||
            (this.state.utilityInput === 'manual' &&
              Object.keys(manualUtilities[0]).length === 0 &&
              manualUtilities[0].constructor === Object)
          ) {
            this.setState({
              saveErrors: 'Please fill out the manual data for this utility.'
            })
            return
          }

          this.setState({ disableSubmit: true })
          this.props
            .createUtilities(payload)
            .then(() => {
              this.setState({ disableSubmit: false })
              this.props.handleToggleAddUtility()
            })
            .catch(err => {
              this.setState({ disableSubmit: false, fileError: err.errors })
            })
        }
      })
      .catch(err => {
        this.setState({ saveErrors: err })
      })
  }

  handleSubmitDelivery = () => {
    const { file, manualUtilities } = this.state

    validateDeliveryUtilities(manualUtilities)
      .then(() => {
        if (!this.state.disableSubmit) {
          let payload = {}
          payload.name = this.state.utilityName
          payload.number = this.state.utilityNumber
          payload.accountNumber = this.state.utilityAccountNumber
          payload.meterPurpose = this.state.utilityPurpose
          payload.meterType = this.state.meteringType
          payload.meterConfiguration = this.state.utilityConfiguration
          payload.meterShared = this.state.utilityMeterShared
          payload.units = this.state.units
          payload.buildingId = this.props.buildingId
          payload.type = this.props.type
          payload.source = this.state.utilityInput
          payload.consumptionOrDelivery = 'delivery'
          payload.upload =
            this.state.utilityInput === 'csv'
              ? { csv: file }
              : { manual: manualUtilities }

          if (!this.props.buildingId) return

          if (!payload.name) {
            this.setState({
              saveErrors: 'Please enter a name for your utility bill.'
            })
            return
          }

          if (!payload.number) {
            this.setState({
              saveErrors: 'Please enter a number for your utility bill.'
            })
            return
          }

          if (!this.state.utilityInput) {
            this.setState({ saveErrors: 'Please add a utility input.' })
            return
          }

          if (
            this.state.utilityInput === 'csv' &&
            Object.keys(file).length === 0 &&
            file.constructor === Object
          ) {
            this.setState({ saveErrors: 'Please upload a utility bill.' })
            return
          }

          if (
            (this.state.utilityInput === 'manual' &&
              manualUtilities.length === 0) ||
            (this.state.utilityInput === 'manual' &&
              Object.keys(manualUtilities[0]).length === 0 &&
              manualUtilities[0].constructor === Object)
          ) {
            this.setState({
              saveErrors: 'Please fill out the manual data for this utility.'
            })
            return
          }

          this.setState({ disableSubmit: true })
          this.props
            .createUtilities(payload)
            .then(() => {
              this.setState({ disableSubmit: false })
              this.props.handleToggleAddUtility()
            })
            .catch(err => {
              this.setState({ disableSubmit: false, fileError: err.errors })
            })
        }
      })
      .catch(err => {
        this.setState({ saveErrors: err })
      })
  }

  getText = type => {
    if (type === 'electric' || type === 'natural-gas' || type === 'water')
      return 'Meter'
    else return 'Delivery'
  }

  handleSetInput = input => {
    this.setState({ utilityInput: input })
    // clear error if it was a type error
    if (this.state.saveErrors === 'Please add a utility input.') {
      this.setState({ saveErrors: '' })
    }
  }

  render() {
    const { type, isUnusedUtility } = this.props
    const { utilityInput, file, fileError, manualUtilities } = this.state
    const { heading, subHeading } = getUtilityHeadingData(type)
    const submitText = `Add ${this.getText(type)}`
    const title = `New ${this.getText(type)}`
    return (
      <div
        data-test='utilities-modal'
        className={classNames(styles.utilityModal)}
      >
        <div className={styles.utilityModalHeader}>
          <div className={styles.utilityModalTitle}>
            <div className={styles.container}>
              <h3>{title}</h3>
              <div
                className={styles.utilityModalClose}
                onClick={() => {
                  this.props.handleToggleAddUtility()
                }}
              >
                <i className='material-icons'>close</i>
              </div>
            </div>
          </div>
        </div>
        <div className={styles.addUtilityBody}>
          <div className={styles.container}>
            <div className={styles.addUtility}>
              <div className={styles.addUtilityHeader}>
                <h3>{heading}</h3>
                <h5>{subHeading}</h5>
              </div>

              <div className={styles.addUtilityInfo}>
                <label>
                  <small>Utility Name</small>
                </label>
                <input
                  required
                  type='text'
                  value={this.state.utilityName}
                  name='utilityName'
                  onChange={e => this.handleNameChange(e)}
                />
              </div>

              <div className={styles.addUtilityInfo}>
                <label>
                  <small>Meter Name/No.</small>
                </label>
                <input
                  required
                  type='text'
                  value={this.state.utilityNumber}
                  name='utilityNumber'
                  onChange={e => this.handleNumberChange(e)}
                />
              </div>

              <div className={styles.addUtilityInfo}>
                <label>
                  <small>Account Name/No.</small>
                </label>
                <input
                  type='text'
                  value={this.state.utilityAccountNumber}
                  name='utilityAccountNumber'
                  onChange={this.handleInputChange.bind(this)}
                />
              </div>

              <div className={styles.addUtilityInfo}>
                <label>
                  <small>Meter Purpose</small>
                </label>
                <select
                  value={this.state.utilityPurpose}
                  name='utilityPurpose'
                  onChange={this.handleInputChange.bind(this)}
                  className={classNames(
                    styles.selectInput,
                    this.state.utilityPurpose === ''
                      ? styles.selectPlaceholder
                      : ''
                  )}
                >
                  <option value='' disabled>
                    Meter Purpose
                  </option>
                  <option value='residential'>Residential</option>
                  <option value='commercial'>Commercial</option>
                </select>
              </div>

              <div className={styles.addUtilityInfo}>
                <label>
                  <small>Metering Type</small>
                </label>
                <select
                  value={this.state.meteringType}
                  name='meteringType'
                  onChange={this.handleInputChange.bind(this)}
                  className={classNames(
                    styles.selectInput,
                    this.state.meteringType === ''
                      ? styles.selectPlaceholder
                      : ''
                  )}
                >
                  <option value='' disabled>
                    Metering Type
                  </option>
                  <option value='direct'>Direct Meter</option>
                  <option value='masterMeterWithoutSubMetering'>
                    Master Meter without Sub-Metering
                  </option>
                  <option value='masterMeterWithSubMetering'>
                    Master Meter with Sub-Metering
                  </option>
                </select>
              </div>

              <div className={styles.addUtilityInfo}>
                <label>
                  <small>Meter Configuration</small>
                </label>
                <select
                  value={this.state.utilityConfiguration}
                  name='utilityConfiguration'
                  onChange={this.handleInputChange.bind(this)}
                  className={classNames(
                    styles.selectInput,
                    this.state.utilityConfiguration === ''
                      ? styles.selectPlaceholder
                      : ''
                  )}
                >
                  <option value='' disabled>
                    Meter Configuration
                  </option>
                  <option value='tenantsDirectlyMetered'>
                    Tenants Directly Metered
                  </option>
                  <option value='tenantsSubMeteredByOwner'>
                    Tenants Sub-Metered by Owner
                  </option>
                  <option value='masterMeterWithSubMetering'>
                    Tenants Not Metered
                  </option>
                </select>
              </div>

              <div
                className={classNames(
                  styles.addUtilityInfo,
                  styles.checkboxContainer
                )}
              >
                <label>
                  <small>Shared Meter</small>

                  {/* <select
            value={this.state.utilityMeterShared}
            name="utilityMeterShared"
            onChange={this.handleInputChange.bind(this)}
            className={classNames(
              styles.selectInput,
              this.state.utilityMeterShared === ''
                ? styles.selectPlaceholder
                : ''
            )}
          >
            <option value="" disabled>
              Shared Meter
            </option>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select> */}
                  <input
                    type='checkbox'
                    value={this.state.utilityMeterShared}
                    onChange={() =>
                      this.setState({
                        utilityMeterShared: !this.state.utilityMeterShared
                      })
                    }
                    className={
                      this.state.utilityMeterShared ? styles.checked : ''
                    }
                  />
                  <span />
                </label>
              </div>
              <div className={styles.addUtilityInfo}>
                <label>
                  <small>Units</small>
                </label>
                <div
                  className={classNames(
                    styles.selectContainer,
                    !isUnusedUtility && styles.selectDisabled
                  )}
                >
                  <select
                    onChange={e => this.handleUnitChange(e)}
                    value={this.state.units}
                    disabled={!isUnusedUtility}
                  >
                    {UTILITY_UNITS_OPTIONS[type].map((unit, i) => {
                      return (
                        <option key={i} value={unit.name}>
                          {unit}
                        </option>
                      )
                    })}
                  </select>
                </div>
              </div>
              <label>
                <small>Billing Data</small>
              </label>
              <div className={styles.addUtilityOptions}>
                <div
                  name='addCSVMeter'
                  className={classNames(
                    utilityInput === 'csv' ? styles.active : ''
                  )}
                  onClick={() => this.handleSetInput('csv')}
                >
                  <p>Import CSV</p>
                </div>
                <div
                  name='addManualMeter'
                  className={classNames(
                    utilityInput === 'manual' ? styles.active : ''
                  )}
                  onClick={() => this.handleSetInput('manual')}
                >
                  <p>Enter Manually</p>
                </div>
              </div>

              {utilityInput === 'csv' && (
                <AddUtilityCSV
                  consumptionOrDelivery={this.props.consumptionOrDelivery}
                  handleUploadFile={this.handleUploadFile}
                  handleClearFileErrors={this.handleClearFileErrors}
                  file={file}
                  fileError={fileError}
                  type={this.props.type}
                />
              )}

              {utilityInput === 'manual' && (
                <AddUtilityManual
                  type={this.props.type}
                  consumptionOrDelivery={this.props.consumptionOrDelivery}
                  manualUtilities={manualUtilities}
                  handleChangeManualUtilities={this.handleChangeManualUtilities}
                />
              )}

              {this.state.saveErrors !== '' && (
                <div className={styles.addUtilityErrors}>
                  {this.state.saveErrors}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className={styles.utilityModalFooter}>
          <div className={styles.container}>
            <div className={styles.utilityModalFooterButtons}>
              <div className={styles.projectsModalFooterButtonsLeft}></div>
              <div className={styles.projectsModalFooterButtonsRight}>
                <button
                  className={classNames(styles.button, styles.buttonSecondary)}
                  onClick={() => this.props.handleToggleAddUtility()}
                >
                  Cancel
                </button>

                {this.state.disableSubmit && (
                  <button
                    className={classNames(
                      styles.button,
                      styles.buttonPrimary,
                      styles.buttonDisable
                    )}
                  >
                    <Loader size='button' color='white' />
                  </button>
                )}

                {!this.state.disableSubmit && (
                  <button
                    className={classNames(styles.button, styles.buttonPrimary)}
                    onClick={this.handleSubmit}
                  >
                    {submitText}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default AddUtility
