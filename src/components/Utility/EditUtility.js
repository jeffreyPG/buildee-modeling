import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import styles from './AddUtility.scss'
import AddUtilityManual from './AddUtilityManual'
import {
  getUtilityUnits,
  validateConsumptionUtilities,
  validateDeliveryUtilities
} from './UtilityHelpers'
import { Loader } from 'utils/Loader'

export class EditUtility extends React.Component {
  static propTypes = {
    type: PropTypes.string.isRequired,
    consumptionOrDelivery: PropTypes.string.isRequired,
    buildingId: PropTypes.string.isRequired,
    handleUtilityClose: PropTypes.func.isRequired,
    utility: PropTypes.object.isRequired,
    editUtility: PropTypes.func.isRequired
  }

  state = {
    utilityName: '',
    utilityNumber: '',
    utilityAccountNumber: '',
    utilityPurpose: '',
    meterType: '',
    utilityConfiguration: '',
    utilityMeterShared: '',
    units: '',
    utilityInput: '',
    manualUtilities: [],
    saveErrors: '',
    disableSubmit: false
  }

  componentDidMount = () => {
    this.handlePopulateData()
  }

  componentDidUpdate = prevProps => {
    if (prevProps.utility !== this.props.utility) {
      this.handlePopulateData()
    }
  }

  handlePopulateData = () => {
    const { utility, consumptionOrDelivery } = this.props
    let tempMeterData = []
    let orderedByDate
    if (consumptionOrDelivery === 'consumption') {
      tempMeterData = [...utility.meterData]
      tempMeterData.map((data, index) => {
        tempMeterData[index].startDate = data.startDate.toString().split('T')[0]
        tempMeterData[index].endDate = data.endDate.toString().split('T')[0]
      })
      orderedByDate = tempMeterData.sort((a, b) => {
        return new Date(a.startDate) - new Date(b.startDate)
      })
    } else if (consumptionOrDelivery === 'delivery') {
      tempMeterData = [...utility.deliveryData]
      tempMeterData.map((data, index) => {
        tempMeterData[index].deliveryDate = data.deliveryDate
          .toString()
          .split('T')[0]
      })
      orderedByDate = tempMeterData.sort((a, b) => {
        return new Date(a.deliveryDate) - new Date(b.deliveryDate)
      })
    }

    this.setState({
      utilityName: utility.name,
      utilityNumber: utility.meterNumber,
      utilityAccountNumber: utility.accountNumber,
      utilityPurpose: utility.meterPurpose,
      meterType: utility.meterType,
      utilityConfiguration: utility.meterConfiguration,
      utilityMeterShared: utility.meterShared,
      units: utility.units,
      utilityInput: utility.source,
      manualUtilities: orderedByDate
    })
  }

  handleInputChange = event => {
    this.setState({ [event.target.name]: event.target.value })
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

  addManualUtilities = utilsArr => {
    this.setState({ manualUtilities: utilsArr })
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
    const { manualUtilities } = this.state

    validateConsumptionUtilities(manualUtilities)
      .then(() => {
        let payload = {}
        payload.name = this.state.utilityName
        payload.number = this.state.utilityNumber
        payload.accountNumber = this.state.utilityAccountNumber
        payload.meterPurpose = this.state.utilityPurpose
        payload.meterType = this.state.meterType
        payload.meterConfiguration = this.state.utilityConfiguration
        payload.meterShared = this.state.utilityMeterShared
        payload.units = this.state.units
        payload.buildingId = this.props.buildingId
        payload.type = this.props.type
        payload.source = this.state.utilityInput
        payload.consumptionOrDelivery = 'consumption'
        payload.upload = { manual: manualUtilities }

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
          manualUtilities.length === 0 ||
          (Object.keys(manualUtilities[0]).length === 0 &&
            manualUtilities[0].constructor === Object)
        ) {
          this.setState({
            saveErrors: 'Please fill out data for this utility.'
          })
          return
        }

        this.setState({ disableSubmit: true })
        this.props
          .editUtility(payload, this.props.utility._id)
          .then(() => {
            this.setState({ disableSubmit: false })
            this.props.handleUtilityClose()
          })
          .catch(err => {
            this.setState({ disableSubmit: false, fileError: err.errors })
          })
      })
      .catch(err => {
        this.setState({ saveErrors: err })
      })
  }
  handleSubmitDelivery = () => {
    const { manualUtilities } = this.state

    validateDeliveryUtilities(manualUtilities)
      .then(() => {
        let payload = {}
        payload.name = this.state.utilityName
        payload.number = this.state.utilityNumber
        payload.accountNumber = this.state.utilityAccountNumber
        payload.meterPurpose = this.state.utilityPurpose
        payload.meterType = this.state.meterType
        payload.meterConfiguration = this.state.utilityConfiguration
        payload.meterShared = this.state.utilityMeterShared
        payload.units = this.state.units
        payload.buildingId = this.props.buildingId
        payload.type = this.props.type
        payload.source = this.state.utilityInput
        payload.consumptionOrDelivery = 'delivery'
        payload.upload = { manual: manualUtilities }

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
          manualUtilities.length === 0 ||
          (Object.keys(manualUtilities[0]).length === 0 &&
            manualUtilities[0].constructor === Object)
        ) {
          this.setState({
            saveErrors: 'Please fill out data for this utility.'
          })
          return
        }

        this.setState({ disableSubmit: true })
        this.props
          .editUtility(payload, this.props.utility._id)
          .then(() => {
            this.setState({ disableSubmit: false })
            this.props.handleUtilityClose()
          })
          .catch(err => {
            this.setState({ disableSubmit: false, fileError: err.errors })
          })
      })
      .catch(err => {
        this.setState({ saveErrors: err })
      })
  }

  getText = type => {
    if (type === 'electric' || type === 'natural-gas') return 'Meter'
    else return 'Delivery'
  }

  render() {
    const { manualUtilities } = this.state
    const { type, utility } = this.props
    const submitText = `Save Data`
    const title = `Edit ${this.getText(type)}`
    const description =
      utility && utility.createdByUserId
        ? `Author: ${utility.createdByUserId.name}`
        : ''
    let utilUnits = getUtilityUnits(type)

    return (
      <div
        data-test="utilities-modal"
        className={classNames(styles.utilityModal)}
      >
        <div className={styles.utilityModalHeader}>
          <div className={styles.utilityModalTitle}>
            <div className={styles.container}>
              <h3>{title}</h3>
              <h3>{description}</h3>
              <div
                className={styles.utilityModalClose}
                onClick={() => {
                  this.props.handleUtilityClose()
                }}
              >
                <i className="material-icons">close</i>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.addUtilityBody}>
          <div className={styles.container}>
            <div className={styles.addUtility}>
              <div className={styles.addUtilityHeader}>
                <h3>Edit Utility Bill</h3>
              </div>

              <div className={styles.addUtilityInfo}>
                <label>Utility Name</label>
                <input
                  required
                  type="text"
                  value={this.state.utilityName}
                  name="utilityName"
                  onChange={e => this.handleNameChange(e)}
                />
              </div>

              <div className={styles.addUtilityInfo}>
                <label>Meter Name/No.</label>
                <input
                  required
                  type="text"
                  value={this.state.utilityNumber}
                  name="utilityNumber"
                  onChange={e => this.handleNumberChange(e)}
                />
              </div>

              <div className={styles.addUtilityInfo}>
                <label>
                  <small>Account Name/No.</small>
                </label>
                <input
                  type="text"
                  value={this.state.utilityAccountNumber}
                  name="utilityAccountNumber"
                  onChange={this.handleInputChange.bind(this)}
                />
              </div>

              <div className={styles.addUtilityInfo}>
                <label>
                  <small>Meter Purpose</small>
                </label>
                <select
                  value={this.state.utilityPurpose}
                  name="utilityPurpose"
                  onChange={this.handleInputChange.bind(this)}
                  className={classNames(
                    styles.selectInput,
                    this.state.utilityPurpose === ''
                      ? styles.selectPlaceholder
                      : ''
                  )}
                >
                  <option value="" disabled>
                    Meter Purpose
                  </option>
                  <option value="residential">Residential</option>
                  <option value="commercial">Commercial</option>
                </select>
              </div>

              <div className={styles.addUtilityInfo}>
                <label>
                  <small>Metering Type</small>
                </label>
                <select
                  value={this.state.meterType}
                  name="meterType"
                  onChange={this.handleInputChange.bind(this)}
                  className={classNames(
                    styles.selectInput,
                    this.state.meterType === '' ? styles.selectPlaceholder : ''
                  )}
                >
                  <option value="" disabled>
                    Metering Type
                  </option>
                  <option value="direct">Direct Meter</option>
                  <option value="masterMeterWithoutSubMetering">
                    Master Meter without Sub-Metering
                  </option>
                  <option value="masterMeterWithSubMetering">
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
                  name="utilityConfiguration"
                  onChange={this.handleInputChange.bind(this)}
                  className={classNames(
                    styles.selectInput,
                    this.state.utilityConfiguration === ''
                      ? styles.selectPlaceholder
                      : ''
                  )}
                >
                  <option value="" disabled>
                    Meter Configuration
                  </option>
                  <option value="tenantsDirectlyMetered">
                    Tenants Directly Metered
                  </option>
                  <option value="tenantsSubMeteredByOwner">
                    Tenants Sub-Metered by Owner
                  </option>
                  <option value="masterMeterWithSubMetering">
                    Tenants Not Metered
                  </option>
                </select>
              </div>

              <div className={styles.addUtilityInfo}>
                <label>
                  <small>Shared Meter</small>
                </label>
                <select
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
                </select>
              </div>

              <div className={styles.addUtilityInfo}>
                <label>Units</label>
                <div>{this.state.units}</div>
              </div>

              <AddUtilityManual
                type={this.props.type}
                consumptionOrDelivery={this.props.consumptionOrDelivery}
                manualUtilities={manualUtilities}
                handleChangeManualUtilities={this.handleChangeManualUtilities}
              />

              {this.state.saveErrors !== '' && (
                <div className={styles.addUtilityErrors}>
                  {this.state.saveErrors}
                </div>
              )}

              <div className={styles.utilityModalFooter}>
                <div className={styles.container}>
                  <div className={styles.utilityModalFooterButtons}>
                    <div
                      className={styles.projectsModalFooterButtonsLeft}
                    ></div>
                    <div className={styles.projectsModalFooterButtonsRight}>
                      <button
                        className={classNames(
                          styles.button,
                          styles.buttonSecondary
                        )}
                        onClick={this.props.handleUtilityClose}
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
                          <Loader size="button" color="white" />
                        </button>
                      )}

                      {!this.state.disableSubmit && (
                        <button
                          className={classNames(
                            styles.button,
                            styles.buttonPrimary
                          )}
                          onClick={this.handleSubmit}
                        >
                          Save Data
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default EditUtility
