import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import styles from './OverviewGHG.scss'
import { formatNumbersWithCommas } from 'utils/Utils'

export class OverviewGHG extends React.Component {
  static propTypes = {
    building: PropTypes.object.isRequired,
    allUtilities: PropTypes.object.isRequired,
    handleTabChange: PropTypes.func.isRequired,
    editBuilding: PropTypes.func.isRequired,
    changeReRunProjects: PropTypes.func.isRequired
  }

  state = {
    totalEmissions: 0,
    vehiclesPerYear: 0,
    barrelsOfOil: 0,
    railcarsOfCoal: 0,
    emissionsError: '',
    emissionsWarning: '',
    isEditing: false,
    rates: {
      electric: '',
      gas: '',
      water: '',
      steam: '',
      fuelOil2: '',
      fuelOil4: '',
      fuelOil56: '',
      diesel: '',
      other: '',
      electricGHG: '',
      gasGHG: '',
      steamGHG: '',
      fuelOil2GHG: '',
      fuelOil4GHG: '',
      fuelOil56GHG: '',
      dieselGHG: ''
    },
    showGHGFactors: false
  }

  componentDidMount = () => {
    if (this.props.building.rates) {
      let tempRates = Object.assign(
        {},
        this.state.rates,
        this.props.building.rates
      )
      this.setState({ rates: tempRates })
    }
    this.handleUpdateEmissions()
  }

  componentDidUpdate = prevProps => {
    if (prevProps.monthlyUtilities !== this.props.monthlyUtilities) {
      this.handleUpdateEmissions()
    }
  }

  handleEditToggle = () => {
    this.setState(prevState => ({
      isEditing: !prevState.isEditing
    }))

    // reset rates to clear any unsaved data
    if (!this.state.isEditing) {
      let tempRates = Object.assign(
        {},
        this.state.rates,
        this.props.building.rates
      )
      this.setState({ rates: tempRates })
    }
  }

  handleChange = event => {
    let tempRates = { ...this.state.rates }
    const value = event.target.value.replace(/-/g, '')
    tempRates[event.target.name] = value
    this.setState({ rates: tempRates })
  }

  checkEmptyState = types => {
    const utilityTypes = types
      .map(item => {
        if (item === 'natural-gas') return 'gas'
        return item
      })
      .filter(item => item !== 'water')
    return utilityTypes.length === 0
  }

  getUtilityTypes = monthlyUtilities => {
    let items = [
      'electric',
      'naturalgas',
      'water',
      'steam',
      'fueloil2',
      'fueloil4',
      'fueloil56',
      'diesel',
      'other'
    ]
    let obj = {}
    items.forEach(item => {
      let key = item
      if (item === 'naturalgas') key = 'natural-gas'
      if (item === 'fueloil2') key = 'fuel-oil-2'
      if (item === 'fueloil4') key = 'fuel-oil-4'
      if (item === 'fueloil56') key = 'fuel-oil-5-6'
      obj[key] =
        (monthlyUtilities &&
          monthlyUtilities.some(utility => utility?.[item]?.totalUsage)) ||
        false
    })
    return Object.keys(obj).filter(item => !!obj[item])
  }

  handleUpdateEmissions = () => {
    // Electricity emissions = sum(kWhrs for all utility data) * 7.44 * 10-4
    // Natural Gas Emissions = sum(therms for all utility data) * 100 * (53.11 / 1000)
    // total emissions = electricity emissions + natural gas emissions

    // Equivalents:
    // Passenger vehicles per year = total emissions / 4.67
    // barrels of oil = total emissions / 0.43
    // railcars of coal = total emissions / 183.22

    const { building } = this.props
    const utilityTypes = this.getUtilityTypes(this.props.monthlyUtilities)
    let totalUtilUsages = {}
    let totalEmissions = 0
    let electricityEmissions = 0
    let naturalGasEmissions = 0
    let steamEmissions = 0
    let fuelOil2Emissions = 0
    let fuelOil4Emissions = 0
    let fuelOil56Emissions = 0
    let dieselEmissions = 0

    let electricGHGFactor =
      building.rates && building.rates.electricGHG
        ? building.rates.electricGHG
        : 0.000744
    let gasGHGFactor =
      building.rates && building.rates.gasGHG ? building.rates.gasGHG : 0.0053
    let steamGHGFactor =
      building.rates && building.rates.steamGHG ? building.rates.steamGHG : 0
    let fuelOil2GHGFactor =
      building.rates && building.rates.fuelOil2GHG
        ? building.rates.fuelOil2GHG
        : 0.01021
    let fuelOil4GHGFactor =
      building.rates && building.rates.fuelOil4GHG
        ? building.rates.fuelOil4GHG
        : 0.01096
    let fuelOil56GHGFactor =
      building.rates && building.rates.fuelOil56GHG
        ? building.rates.fuelOil56GHG
        : 0.01021
    let dieselGHGFactor =
      building.rates && building.rates.dieselGHG
        ? building.rates.dieselGHG
        : 0.01021

    // check for missing data
    if (utilityTypes.length === 0 || this.checkEmptyState(utilityTypes)) {
      this.setState({
        emissionsError:
          'Add your utility data to learn more about how you spend and where you can save.'
      })
      return
    }
    if (!utilityTypes.includes('electric')) {
      this.setState({
        emissionsWarning:
          'You have natural gas data, but no electric data. These emissions may be incorrect.'
      })
    } else if (!utilityTypes.includes('natural-gas')) {
      this.setState({
        emissionsWarning:
          'You have electric data, but no natural gas data. These emissions may be incorrect.'
      })
    } else {
      this.setState({ emissionsWarning: '' })
    }

    utilityTypes.forEach(utilType => {
      let utilUsage = 0
      // we don't need water calculated in co2 emissions
      if (utilType !== 'water') {
        let key = utilType
        if (utilType === 'natural-gas') key = 'naturalgas'
        if (utilType === 'fuel-oil-2') key = 'fueloil2'
        if (utilType === 'fuel-oil-4') key = 'fueloil4'
        if (utilType === 'fuel-oil-5-6') key = 'fueloil56'
        this.props.monthlyUtilities.forEach(utility => {
          utilUsage += utility?.[key]?.totalUsage || 0
        })
      }
      totalUtilUsages[utilType] = utilUsage
    })

    electricityEmissions = totalUtilUsages.electric * electricGHGFactor || 0
    naturalGasEmissions = totalUtilUsages['natural-gas'] * gasGHGFactor || 0
    steamEmissions = totalUtilUsages.steam * steamGHGFactor || 0
    fuelOil2Emissions = totalUtilUsages['fuel-oil-2'] * fuelOil2GHGFactor || 0
    fuelOil4Emissions = totalUtilUsages['fuel-oil-4'] * fuelOil4GHGFactor || 0
    fuelOil56Emissions =
      totalUtilUsages['fuel-oil-5-6'] * fuelOil56GHGFactor || 0
    dieselEmissions = totalUtilUsages.diesel * dieselGHGFactor || 0

    totalEmissions =
      electricityEmissions +
      naturalGasEmissions +
      steamEmissions +
      fuelOil2Emissions +
      fuelOil4Emissions +
      fuelOil56Emissions +
      dieselEmissions

    this.setState({
      totalEmissions: totalEmissions || 0,
      vehiclesPerYear: totalEmissions / 4.67,
      barrelsOfOil: totalEmissions / 0.43,
      railcarsOfCoal: totalEmissions / 183.22,
      emissionsError: ''
    })
  }

  submitForm = () => {
    let tempRates = { ...this.state.rates }

    for (var key in tempRates) {
      tempRates[key] = parseFloat(tempRates[key])
    }

    let allRates = Object.assign({}, this.props.building.rates, tempRates)
    let building = {}
    building.rates = allRates

    this.props
      .editBuilding(building, this.props.building._id, true)
      .then(() => {
        this.props.changeReRunProjects(true)
        this.setState({ isEditing: false })
      })
  }

  handleToggleFactors = () => {
    this.setState(prevState => ({
      showGHGFactors: !prevState.showGHGFactors
    }))
  }

  render() {
    const { building } = this.props

    return (
      <div className={styles.utilityGHG}>
        <div className={styles.panelHeader}>
          <div>
            <h3>GHG Emissions</h3>
          </div>
        </div>

        <div className={styles.panelContent}>
          {this.state.emissionsError !== '' &&
            this.state.emissionsError !==
              'Add your utility data to learn more about how you spend and where you can save.' && (
              <p>{this.state.emissionsError}</p>
            )}
          {this.state.emissionsError ===
            'Add your utility data to learn more about how you spend and where you can save.' && (
            <div className={styles.empty}>
              <div className={styles.emptyBody}>
                <div className={styles.emptyBodyTitle}>
                  Add Meter Data to Calculate Emissions
                </div>
                <div className={styles.emptyBodyDescription}>
                  Add Electricity or Natural Gas data in Utilities or import
                  from ENERGY STAR Portfolio Manager.
                </div>
                {this.props.modeFrom === 'overview' && (
                  <div className={styles.emptyButtons}>
                    <button
                      className={classNames(
                        styles.button,
                        styles.buttonPrimary
                      )}
                      onClick={() => {
                        this.props.handleTabChange(2, 'Utilities', true)
                      }}
                    >
                      Go to utilities
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {this.state.emissionsError === '' && (
            <div>
              {this.state.emissionsWarning !== '' && (
                <div className={styles.utilityGHGWarning}>
                  <p>
                    <i className="material-icons warning">warning</i>{' '}
                    {this.state.emissionsWarning}
                  </p>
                </div>
              )}
              <div className={styles.utilityGHGTotals}>
                <div>
                  <h1>{formatNumbersWithCommas(this.state.totalEmissions)}</h1>
                  <h3>Metric tons of CO2e</h3>
                </div>
                {this.props.building.squareFeet && (
                  <div>
                    <h1>
                      {formatNumbersWithCommas(
                        (this.state.totalEmissions * 1000) /
                          this.props.building.squareFeet
                      )}
                    </h1>
                    <h3>kgCO2e/ft²</h3>
                  </div>
                )}
                <p>equivalent to:</p>
              </div>

              <div className={styles.utilityGHGEquivalent}>
                <div>
                  <h3>{formatNumbersWithCommas(this.state.vehiclesPerYear)}</h3>
                  Vehicles driven in a year
                </div>
                <svg xmlns="http://www.w3.org/2000/svg">
                  <g fill="none" fillRule="evenodd">
                    <path
                      fill="#E05263"
                      d="M50.011 23.333H52c-.197-11.708-9.372-11.56-12.754-11.81-.547-.041-.68-.398-.817-.938C37.713 7.755 34.738-.055 24.045 0c-.274.002-2.725 0-2.991.008C8.278.392 6.556 8.08 6.338 10.713c-.043.516-.429.883-.918 1.023C-.23 13.356 0 23.333 0 23.333h1.605"
                    />
                    <ellipse
                      cx="10.866"
                      cy="23.333"
                      fill="#8FA4AF"
                      stroke="#36474F"
                      strokeWidth="2"
                      rx="4.657"
                      ry="4.667"
                    />
                    <ellipse
                      cx="40.358"
                      cy="23.333"
                      fill="#8FA4AF"
                      stroke="#36474F"
                      strokeWidth="2"
                      rx="4.657"
                      ry="4.667"
                    />
                    <path
                      fill="#FFF"
                      d="M36 11c-.055-4.022-2.389-7.022-7-9v9h7zM8 11c2.075-6.822 7.742-9.766 17-8.831V11H8z"
                    />
                  </g>
                </svg>
              </div>
              <div className={styles.utilityGHGEquivalent}>
                <div>
                  <h3>{formatNumbersWithCommas(this.state.barrelsOfOil)}</h3>
                  Barrels of oil consumed
                </div>
                <svg xmlns="http://www.w3.org/2000/svg">
                  <g fill="none" fillRule="evenodd">
                    <path
                      fill="#000"
                      fillRule="nonzero"
                      d="M8.51 54.646L18.19 50l-8.134-3.904-1.547 8.55zm-.44 2.43l-.61 3.37a2.5 2.5 0 0 1-4.92-.891L5.264 44.5H.5v-4h5.488l4.342-24H7.5v-4h3.554l2.17-12h14.22l2.229 12H33.5v4h-3.084l4.456 24H39.5v4h-3.885l2.793 15.044a2.5 2.5 0 1 1-4.916.912l-.634-3.415L20.5 51.11 8.07 57.076zm22.765-10.928L22.811 50l9.595 4.606-1.57-8.458zM29.647 44.5H11.353l9.147 4.39 9.147-4.39zm-18.145-4l7.125-4.5-6.052-3.823-1.506 8.323h.433zm3.746 0h10.504L20.5 37.183 15.248 40.5zM27.73 30.25H13.27l7.231 4.567 7.231-4.567zm.53 2.031L22.373 36l7.125 4.5h.289l-1.526-8.219zm-14.372-7.369l4.069-3.106-3.081-2.352-.988 5.458zm1.544 1.338h8.345l-4.173-3.185-4.172 3.185zm9.475-9.75h-9.497l-.134.743 4.328 3.305 5.303-4.048zm.78 1.922l-4.435 3.384 5.82 4.444h.068l-1.454-7.828zM16.134 12.5h8.453l-1.3-7H17.4l-1.266 7z"
                    />
                  </g>
                </svg>
              </div>
              <div className={styles.utilityGHGEquivalent}>
                <div>
                  <h3>{formatNumbersWithCommas(this.state.railcarsOfCoal)}</h3>
                  Railcars of coal burned
                </div>
                <svg xmlns="http://www.w3.org/2000/svg">
                  <g fill="none" fillRule="evenodd" transform="translate(0 -2)">
                    <g fill="#353A41" transform="translate(3)">
                      <rect
                        width="13.857"
                        height="14.012"
                        x="12.925"
                        y="2.847"
                        rx="5.6"
                        transform="rotate(45 19.853 9.853)"
                      />
                      <rect
                        width="13.857"
                        height="14.012"
                        x="2.925"
                        y="2.847"
                        rx="5.6"
                        transform="rotate(45 9.853 9.853)"
                      />
                      <rect
                        width="13.857"
                        height="14.012"
                        x="22.925"
                        y="2.847"
                        rx="5.6"
                        transform="rotate(45 29.853 9.853)"
                      />
                      <rect
                        width="13.857"
                        height="14.012"
                        x="30.925"
                        y="2.847"
                        rx="5.6"
                        transform="rotate(45 37.853 9.853)"
                      />
                    </g>
                    <path
                      fill="#C56464"
                      d="M2.124 9h50.752a1 1 0 0 1 .993 1.116l-2.456 21a1 1 0 0 1-.993.884H4.58a1 1 0 0 1-.993-.884l-2.456-21A1 1 0 0 1 2.124 9z"
                    />
                    <circle
                      cx="9.5"
                      cy="31.5"
                      r="2.5"
                      fill="#8FA4AF"
                      stroke="#36474F"
                      strokeWidth="1.6"
                    />
                    <circle
                      cx="43.5"
                      cy="31.5"
                      r="2.5"
                      fill="#8FA4AF"
                      stroke="#36474F"
                      strokeWidth="1.6"
                    />
                    <rect width="54" height="3" y="6" fill="#994F4F" rx="1.5" />
                    <path fill="#FFB30F" d="M1 11h53l-.82 7H1.788z" />
                    <rect
                      width="52"
                      height="1"
                      x="1.5"
                      y="24.5"
                      fill="#D8D8D8"
                      stroke="#753D3D"
                      rx=".5"
                    />
                  </g>
                </svg>
              </div>
            </div>
          )}
        </div>
        {/* <div className={styles.panelFooter}>
          <div
            className={styles.link}
            onClick={() => {
              this.props.handleTabChange(2, 'Utilities', true)
            }}
          >
            Add meters to improve accuracy&nbsp;
            <i className="material-icons">keyboard_arrow_right</i>
          </div>
        </div> */}

        <div>
          {!this.state.isEditing && Object.keys(building).length > 0 && (
            <div className={styles.utilityGHGDisplay}>
              {/* <div
                className={classNames(
                  styles.panelContent,
                  this.state.showGHGFactors ? '' : styles.extraPadding
                )}
              >
                {building.rates.electric !== '' &&
                  building.rates.electric !== 0 &&
                  building.rates.electric && (
                    <div className={styles.utilityGHGSingle}>
                      <span>
                        <i className="material-icons">flash_on</i>Electricity
                      </span>
                      <p>${building.rates.electric || ' - '}/kWh</p>
                    </div>
                  )}
                {building.rates.gas !== '' &&
                  building.rates.gas !== 0 &&
                  building.rates.gas && (
                    <div className={styles.utilityGHGSingle}>
                      <span>
                        <i className="material-icons">whatshot</i>Natural Gas
                      </span>
                      <p>${building.rates.gas || ' - '}/therm</p>
                    </div>
                  )}
                {building.rates.water !== '' &&
                  building.rates.water !== 0 &&
                  building.rates.water && (
                    <div className={styles.utilityGHGSingle}>
                      <span>
                        <i className="material-icons">waves</i>Water
                      </span>
                      <p>${building.rates.water || ' - '}/kG</p>
                    </div>
                  )}
                {building.rates.steam !== '' &&
                  building.rates.steam !== 0 &&
                  building.rates.steam && (
                    <div className={styles.utilityGHGSingle}>
                      <span>
                        <i className="material-icons">scatter_plot</i>Steam
                      </span>
                      <p>
                        ${building.rates.steam || ' - '}/ft{'\u00B3'}
                      </p>
                    </div>
                  )}
                {building.rates.fuelOil2 !== '' &&
                  building.rates.fuelOil2 !== 0 &&
                  building.rates.fuelOil2 && (
                    <div className={styles.utilityGHGSingle}>
                      <span>
                        <svg xmlns="http://www.w3.org/2000/svg">
                          <g fill="none" fillRule="evenodd">
                            <path
                              fill="#2C3444"
                              d="M34 24.955C34 18.303 22 0 22 0S10 18.303 10 24.955C10 31.607 15.373 37 22 37c6.628 0 12-5.393 12-12.045z"
                            />
                            <path
                              stroke="#FFF"
                              strokeWidth="2"
                              d="M17.356 18C16.006 20.851 15 23.542 15 25.206c0 4.245 2.978 7.807 7 8.794"
                            />
                            <path
                              fill="#2C3444"
                              d="M9 9.443C9 6.926 4.5 0 4.5 0S0 6.926 0 9.443C0 11.96 2.015 14 4.5 14S9 11.96 9 9.443z"
                            />
                          </g>
                        </svg>
                        Fuel Oil 2
                      </span>
                      <p>${building.rates.fuelOil2 || ' - '}/gal</p>
                    </div>
                  )}
                {building.rates.fuelOil4 !== '' &&
                  building.rates.fuelOil4 !== 0 &&
                  building.rates.fuelOil4 && (
                    <div className={styles.utilityGHGSingle}>
                      <span>
                        <svg xmlns="http://www.w3.org/2000/svg">
                          <g fill="none" fillRule="evenodd">
                            <path
                              fill="#2C3444"
                              d="M34 24.955C34 18.303 22 0 22 0S10 18.303 10 24.955C10 31.607 15.373 37 22 37c6.628 0 12-5.393 12-12.045z"
                            />
                            <path
                              stroke="#FFF"
                              strokeWidth="2"
                              d="M17.356 18C16.006 20.851 15 23.542 15 25.206c0 4.245 2.978 7.807 7 8.794"
                            />
                            <path
                              fill="#2C3444"
                              d="M9 9.443C9 6.926 4.5 0 4.5 0S0 6.926 0 9.443C0 11.96 2.015 14 4.5 14S9 11.96 9 9.443z"
                            />
                          </g>
                        </svg>
                        Fuel Oil 4
                      </span>
                      <p>${building.rates.fuelOil4 || ' - '}/gal</p>
                    </div>
                  )}
                {building.rates.fuelOil56 !== '' &&
                  building.rates.fuelOil56 !== 0 &&
                  building.rates.fuelOil56 && (
                    <div className={styles.utilityGHGSingle}>
                      <span>
                        <svg xmlns="http://www.w3.org/2000/svg">
                          <g fill="none" fillRule="evenodd">
                            <path
                              fill="#2C3444"
                              d="M34 24.955C34 18.303 22 0 22 0S10 18.303 10 24.955C10 31.607 15.373 37 22 37c6.628 0 12-5.393 12-12.045z"
                            />
                            <path
                              stroke="#FFF"
                              strokeWidth="2"
                              d="M17.356 18C16.006 20.851 15 23.542 15 25.206c0 4.245 2.978 7.807 7 8.794"
                            />
                            <path
                              fill="#2C3444"
                              d="M9 9.443C9 6.926 4.5 0 4.5 0S0 6.926 0 9.443C0 11.96 2.015 14 4.5 14S9 11.96 9 9.443z"
                            />
                          </g>
                        </svg>
                        Fuel Oil 5 & 6
                      </span>
                      <p>${building.rates.fuelOil56 || ' - '}/gal</p>
                    </div>
                  )}
                {building.rates.diesel !== '' &&
                  building.rates.diesel !== 0 &&
                  building.rates.diesel && (
                    <div className={styles.utilityGHGSingle}>
                      <span>
                        <svg xmlns="http://www.w3.org/2000/svg">
                          <g fill="none" fillRule="evenodd">
                            <path
                              fill="#2C3444"
                              d="M34 24.955C34 18.303 22 0 22 0S10 18.303 10 24.955C10 31.607 15.373 37 22 37c6.628 0 12-5.393 12-12.045z"
                            />
                            <path
                              stroke="#FFF"
                              strokeWidth="2"
                              d="M17.356 18C16.006 20.851 15 23.542 15 25.206c0 4.245 2.978 7.807 7 8.794"
                            />
                            <path
                              fill="#2C3444"
                              d="M9 9.443C9 6.926 4.5 0 4.5 0S0 6.926 0 9.443C0 11.96 2.015 14 4.5 14S9 11.96 9 9.443z"
                            />
                          </g>
                        </svg>
                        Diesel
                      </span>
                      <p>${building.rates.diesel || ' - '}/gal</p>
                    </div>
                  )}
                {building.rates.other !== '' &&
                  building.rates.other !== 0 &&
                  building.rates.other && (
                    <div
                      className={classNames(
                        styles.utilityGHGSingle,
                        styles.utilityGHGSingleNoBorder
                      )}
                    >
                      <span>
                        <i className="material-icons">scatter_plot</i>Other
                      </span>
                      <p>${building.rates.other || ' - '}/kWh</p>
                    </div>
                  )}

                {!building.rates.electric &&
                  !building.rates.gas &&
                  !building.rates.water &&
                  !building.rates.steam &&
                  !building.rates.diesel &&
                  !building.rates.fuelOil2 &&
                  !building.rates.fuelOil4 &&
                  !building.rates.fuelOil56 &&
                  !building.rates.other && (
                    <div className={styles.empty}>
                      <div className={styles.emptyBody}>
                        <div className={styles.emptyBodyTitle}>
                          Add Meters to Fuel Types to Calculate
                        </div>
                        <div className={styles.emptyBodyDescription}>
                          Emission factors can be managed below.
                        </div>
                      </div>
                    </div>
                  )}
              </div> */}

              <div className={styles.sourceLink}>
                *Source:
                <a
                  href="https://www.epa.gov/energy/greenhouse-gases-equivalencies-calculator-calculations-and-references"
                  target="_blank"
                >
                  U.S. EPA
                </a>
              </div>
              <div
                className={classNames(
                  styles.tableToggle,
                  this.state.showGHGFactors ? '' : styles.tableToggleShow
                )}
                onClick={this.handleToggleFactors}
              >
                <small>
                  {this.state.showGHGFactors ? 'Hide' : 'Show'} GHG Factors
                  {this.state.showGHGFactors ? (
                    <i className="material-icons">expand_less</i>
                  ) : (
                    <i className="material-icons">expand_more</i>
                  )}
                </small>
              </div>

              {this.state.showGHGFactors && (
                <div
                  className={classNames(styles.panelContent, styles.factors)}
                >
                  <div className={styles.factorsHeader}>
                    <h3>GHG Factors</h3>
                    {!this.state.isEditing && (
                      <div
                        name="editUtilityRates"
                        className={classNames(
                          styles.panelEdit,
                          this.state.hideUtilityRates
                            ? styles.panelEditHide
                            : ''
                        )}
                        onClick={this.handleEditToggle}
                      >
                        <i className="material-icons">edit</i>
                      </div>
                    )}
                  </div>
                  {building.rates.electricGHG !== '' &&
                    building.rates.electricGHG !== 0 &&
                    building.rates.electricGHG && (
                      <div className={styles.utilityGHGSingle}>
                        <span>
                          <i className="material-icons">flash_on</i>Electricity
                        </span>
                        <p>{building.rates.electricGHG || ' - '} mtCO2e/kWh</p>
                      </div>
                    )}
                  {building.rates.gasGHG !== '' &&
                    building.rates.gasGHG !== 0 &&
                    building.rates.gasGHG && (
                      <div className={styles.utilityGHGSingle}>
                        <span>
                          <i className="material-icons">whatshot</i>Natural Gas
                        </span>
                        <p>{building.rates.gasGHG || ' - '} mtCO2e/therm</p>
                      </div>
                    )}
                  {building.rates.steamGHG !== '' &&
                    building.rates.steamGHG !== 0 &&
                    building.rates.steamGHG && (
                      <div className={styles.utilityGHGSingle}>
                        <span>
                          <i className="material-icons">scatter_plot</i>Steam
                        </span>
                        <p>{building.rates.steamGHG || ' - '} mtCO2e/Mlb</p>
                      </div>
                    )}
                  {building.rates.fuelOil2GHG !== '' &&
                    building.rates.fuelOil2GHG !== 0 &&
                    building.rates.fuelOil2GHG && (
                      <div className={styles.utilityGHGSingle}>
                        <span>
                          <svg xmlns="http://www.w3.org/2000/svg">
                            <g fill="none" fillRule="evenodd">
                              <path
                                fill="#2C3444"
                                d="M34 24.955C34 18.303 22 0 22 0S10 18.303 10 24.955C10 31.607 15.373 37 22 37c6.628 0 12-5.393 12-12.045z"
                              />
                              <path
                                stroke="#FFF"
                                strokeWidth="2"
                                d="M17.356 18C16.006 20.851 15 23.542 15 25.206c0 4.245 2.978 7.807 7 8.794"
                              />
                              <path
                                fill="#2C3444"
                                d="M9 9.443C9 6.926 4.5 0 4.5 0S0 6.926 0 9.443C0 11.96 2.015 14 4.5 14S9 11.96 9 9.443z"
                              />
                            </g>
                          </svg>
                          Fuel Oil 2
                        </span>
                        <p>{building.rates.fuelOil2GHG || ' - '} mtCO2e/gal</p>
                      </div>
                    )}
                  {building.rates.fuelOil4GHG !== '' &&
                    building.rates.fuelOil4GHG !== 0 &&
                    building.rates.fuelOil4GHG && (
                      <div className={styles.utilityGHGSingle}>
                        <span>
                          <svg xmlns="http://www.w3.org/2000/svg">
                            <g fill="none" fillRule="evenodd">
                              <path
                                fill="#2C3444"
                                d="M34 24.955C34 18.303 22 0 22 0S10 18.303 10 24.955C10 31.607 15.373 37 22 37c6.628 0 12-5.393 12-12.045z"
                              />
                              <path
                                stroke="#FFF"
                                strokeWidth="2"
                                d="M17.356 18C16.006 20.851 15 23.542 15 25.206c0 4.245 2.978 7.807 7 8.794"
                              />
                              <path
                                fill="#2C3444"
                                d="M9 9.443C9 6.926 4.5 0 4.5 0S0 6.926 0 9.443C0 11.96 2.015 14 4.5 14S9 11.96 9 9.443z"
                              />
                            </g>
                          </svg>
                          Fuel Oil 4
                        </span>
                        <p>{building.rates.fuelOil4GHG || ' - '} mtCO2e/gal</p>
                      </div>
                    )}
                  {building.rates.fuelOil56GHG !== '' &&
                    building.rates.fuelOil56GHG !== 0 &&
                    building.rates.fuelOil56GHG && (
                      <div className={styles.utilityGHGSingle}>
                        <span>
                          <svg xmlns="http://www.w3.org/2000/svg">
                            <g fill="none" fillRule="evenodd">
                              <path
                                fill="#2C3444"
                                d="M34 24.955C34 18.303 22 0 22 0S10 18.303 10 24.955C10 31.607 15.373 37 22 37c6.628 0 12-5.393 12-12.045z"
                              />
                              <path
                                stroke="#FFF"
                                strokeWidth="2"
                                d="M17.356 18C16.006 20.851 15 23.542 15 25.206c0 4.245 2.978 7.807 7 8.794"
                              />
                              <path
                                fill="#2C3444"
                                d="M9 9.443C9 6.926 4.5 0 4.5 0S0 6.926 0 9.443C0 11.96 2.015 14 4.5 14S9 11.96 9 9.443z"
                              />
                            </g>
                          </svg>
                          Fuel Oil 5 & 6
                        </span>
                        <p>{building.rates.fuelOil56GHG || ' - '} mtCO2e/gal</p>
                      </div>
                    )}
                  {building.rates.dieselGHG !== '' &&
                    building.rates.dieselGHG !== 0 &&
                    building.rates.dieselGHG && (
                      <div className={styles.utilityGHGSingle}>
                        <span>
                          <svg xmlns="http://www.w3.org/2000/svg">
                            <g fill="none" fillRule="evenodd">
                              <path
                                fill="#2C3444"
                                d="M34 24.955C34 18.303 22 0 22 0S10 18.303 10 24.955C10 31.607 15.373 37 22 37c6.628 0 12-5.393 12-12.045z"
                              />
                              <path
                                stroke="#FFF"
                                strokeWidth="2"
                                d="M17.356 18C16.006 20.851 15 23.542 15 25.206c0 4.245 2.978 7.807 7 8.794"
                              />
                              <path
                                fill="#2C3444"
                                d="M9 9.443C9 6.926 4.5 0 4.5 0S0 6.926 0 9.443C0 11.96 2.015 14 4.5 14S9 11.96 9 9.443z"
                              />
                            </g>
                          </svg>
                          Diesel
                        </span>
                        <p>{building.rates.dieselGHG || ' - '} mtCO2e/gal</p>
                      </div>
                    )}

                  {!building.rates.electricGHG &&
                    !building.rates.gasGHG &&
                    !building.rates.steamGHG &&
                    !building.rates.fuelOil2GHG &&
                    !building.rates.fuelOil4GHG &&
                    !building.rates.fuelOil56GHG &&
                    !building.rates.dieselGHG && <p>Add your GHG rates</p>}
                </div>
              )}
            </div>
          )}

          {this.state.isEditing && (
            <div
              className={classNames(styles.utilityGHGForm, styles.panelContent)}
            >
              {/* <div className={styles.utilityGHGSingle}>
                <span>
                  <i className="material-icons">flash_on</i>Electricity
                </span>
                <div className={styles.utilityGHGInput}>
                  $
                  <input
                    name="electric"
                    onChange={this.handleChange.bind(this)}
                    value={this.state.rates.electric || ''}
                    type="number"
                    step=".01"
                  />
                  /kWh
                </div>
              </div>

              <div className={styles.utilityGHGSingle}>
                <span>
                  <i className="material-icons">whatshot</i>Natural Gas
                </span>
                <div className={styles.utilityGHGInput}>
                  $
                  <input
                    name="gas"
                    onChange={this.handleChange.bind(this)}
                    value={this.state.rates.gas || ''}
                    type="number"
                    step=".01"
                  />
                  /therm
                </div>
              </div>
              <div className={styles.utilityGHGSingle}>
                <span>
                  <i className="material-icons">waves</i>Water
                </span>
                <div className={styles.utilityGHGInput}>
                  $
                  <input
                    name="water"
                    onChange={this.handleChange.bind(this)}
                    value={this.state.rates.water || ''}
                    type="number"
                    step=".01"
                  />
                  /kG
                </div>
              </div>
              <div className={styles.utilityGHGSingle}>
                <span>
                  <i className="material-icons">scatter_plot</i>Steam
                </span>
                <div className={styles.utilityGHGInput}>
                  $
                  <input
                    name="steam"
                    onChange={this.handleChange.bind(this)}
                    value={this.state.rates.steam || ''}
                    type="number"
                    step=".01"
                  />
                  /ccf
                </div>
              </div>
              <div className={styles.utilityGHGSingle}>
                <span>
                  <svg xmlns="http://www.w3.org/2000/svg">
                    <g fill="none" fillRule="evenodd">
                      <path
                        fill="#2C3444"
                        d="M34 24.955C34 18.303 22 0 22 0S10 18.303 10 24.955C10 31.607 15.373 37 22 37c6.628 0 12-5.393 12-12.045z"
                      />
                      <path
                        stroke="#FFF"
                        strokeWidth="2"
                        d="M17.356 18C16.006 20.851 15 23.542 15 25.206c0 4.245 2.978 7.807 7 8.794"
                      />
                      <path
                        fill="#2C3444"
                        d="M9 9.443C9 6.926 4.5 0 4.5 0S0 6.926 0 9.443C0 11.96 2.015 14 4.5 14S9 11.96 9 9.443z"
                      />
                    </g>
                  </svg>
                  Fuel Oil 2
                </span>
                <div className={styles.utilityGHGInput}>
                  $
                  <input
                    name="fuelOil2"
                    onChange={this.handleChange.bind(this)}
                    value={this.state.rates.fuelOil2 || ''}
                    type="number"
                    step=".01"
                  />
                  /gal
                </div>
              </div>
              <div className={styles.utilityGHGSingle}>
                <span>
                  <svg xmlns="http://www.w3.org/2000/svg">
                    <g fill="none" fillRule="evenodd">
                      <path
                        fill="#2C3444"
                        d="M34 24.955C34 18.303 22 0 22 0S10 18.303 10 24.955C10 31.607 15.373 37 22 37c6.628 0 12-5.393 12-12.045z"
                      />
                      <path
                        stroke="#FFF"
                        strokeWidth="2"
                        d="M17.356 18C16.006 20.851 15 23.542 15 25.206c0 4.245 2.978 7.807 7 8.794"
                      />
                      <path
                        fill="#2C3444"
                        d="M9 9.443C9 6.926 4.5 0 4.5 0S0 6.926 0 9.443C0 11.96 2.015 14 4.5 14S9 11.96 9 9.443z"
                      />
                    </g>
                  </svg>
                  Fuel Oil 4
                </span>
                <div className={styles.utilityGHGInput}>
                  $
                  <input
                    name="fuelOil4"
                    onChange={this.handleChange.bind(this)}
                    value={this.state.rates.fuelOil4 || ''}
                    type="number"
                    step=".01"
                  />
                  /gal
                </div>
              </div>
              <div className={styles.utilityGHGSingle}>
                <span>
                  <svg xmlns="http://www.w3.org/2000/svg">
                    <g fill="none" fillRule="evenodd">
                      <path
                        fill="#2C3444"
                        d="M34 24.955C34 18.303 22 0 22 0S10 18.303 10 24.955C10 31.607 15.373 37 22 37c6.628 0 12-5.393 12-12.045z"
                      />
                      <path
                        stroke="#FFF"
                        strokeWidth="2"
                        d="M17.356 18C16.006 20.851 15 23.542 15 25.206c0 4.245 2.978 7.807 7 8.794"
                      />
                      <path
                        fill="#2C3444"
                        d="M9 9.443C9 6.926 4.5 0 4.5 0S0 6.926 0 9.443C0 11.96 2.015 14 4.5 14S9 11.96 9 9.443z"
                      />
                    </g>
                  </svg>
                  Fuel Oil 5 & 6
                </span>
                <div className={styles.utilityGHGInput}>
                  $
                  <input
                    name="fuelOil56"
                    onChange={this.handleChange.bind(this)}
                    value={this.state.rates.fuelOil56 || ''}
                    type="number"
                    step=".01"
                  />
                  /gal
                </div>
              </div>
              <div className={styles.utilityGHGSingle}>
                <span>
                  <svg xmlns="http://www.w3.org/2000/svg">
                    <g fill="none" fillRule="evenodd">
                      <path
                        fill="#2C3444"
                        d="M34 24.955C34 18.303 22 0 22 0S10 18.303 10 24.955C10 31.607 15.373 37 22 37c6.628 0 12-5.393 12-12.045z"
                      />
                      <path
                        stroke="#FFF"
                        strokeWidth="2"
                        d="M17.356 18C16.006 20.851 15 23.542 15 25.206c0 4.245 2.978 7.807 7 8.794"
                      />
                      <path
                        fill="#2C3444"
                        d="M9 9.443C9 6.926 4.5 0 4.5 0S0 6.926 0 9.443C0 11.96 2.015 14 4.5 14S9 11.96 9 9.443z"
                      />
                    </g>
                  </svg>
                  Diesel
                </span>
                <div className={styles.utilityGHGInput}>
                  $
                  <input
                    name="diesel"
                    onChange={this.handleChange.bind(this)}
                    value={this.state.rates.diesel || ''}
                    type="number"
                    step=".01"
                  />
                  /gal
                </div>
              </div>
              <div
                className={classNames(
                  styles.utilityGHGSingle,
                  styles.utilityGHGSingleNoBorder
                )}
              >
                <span>
                  <i className="material-icons">scatter_plot</i>Other
                </span>
                <div className={styles.utilityGHGInput}>
                  $
                  <input
                    name="other"
                    onChange={this.handleChange.bind(this)}
                    value={this.state.rates.other || ''}
                    type="number"
                    step=".01"
                  />
                  /kWh
                </div>
              </div> */}

              <h3>GHG Factors</h3>
              <div className={styles.utilityGHGSingle}>
                <span>
                  <i className="material-icons">flash_on</i>Electricity
                </span>
                <div className={styles.utilityGHGInput}>
                  <input
                    name="electricGHG"
                    onChange={this.handleChange.bind(this)}
                    value={this.state.rates.electricGHG || ''}
                    type="number"
                    step=".01"
                  />{' '}
                  mtCO2e/kWh
                </div>
              </div>
              <div className={styles.utilityGHGSingle}>
                <span>
                  <i className="material-icons">whatshot</i>Natural Gas
                </span>
                <div className={styles.utilityGHGInput}>
                  <input
                    name="gasGHG"
                    onChange={this.handleChange.bind(this)}
                    value={this.state.rates.gasGHG || ''}
                    type="number"
                    step=".01"
                  />{' '}
                  mtCO2e/therm
                </div>
              </div>
              <div className={styles.utilityGHGSingle}>
                <span>
                  <i className="material-icons">scatter_plot</i>Steam
                </span>
                <div className={styles.utilityGHGInput}>
                  <input
                    name="steamGHG"
                    onChange={this.handleChange.bind(this)}
                    value={this.state.rates.steamGHG || ''}
                    type="number"
                    step=".01"
                  />{' '}
                  mtCO2e/ccf
                </div>
              </div>
              <div className={styles.utilityGHGSingle}>
                <span>
                  <svg xmlns="http://www.w3.org/2000/svg">
                    <g fill="none" fillRule="evenodd">
                      <path
                        fill="#2C3444"
                        d="M34 24.955C34 18.303 22 0 22 0S10 18.303 10 24.955C10 31.607 15.373 37 22 37c6.628 0 12-5.393 12-12.045z"
                      />
                      <path
                        stroke="#FFF"
                        strokeWidth="2"
                        d="M17.356 18C16.006 20.851 15 23.542 15 25.206c0 4.245 2.978 7.807 7 8.794"
                      />
                      <path
                        fill="#2C3444"
                        d="M9 9.443C9 6.926 4.5 0 4.5 0S0 6.926 0 9.443C0 11.96 2.015 14 4.5 14S9 11.96 9 9.443z"
                      />
                    </g>
                  </svg>
                  Fuel Oil 2
                </span>
                <div className={styles.utilityGHGInput}>
                  <input
                    name="fuelOil2GHG"
                    onChange={this.handleChange.bind(this)}
                    value={this.state.rates.fuelOil2GHG || ''}
                    type="number"
                    step=".01"
                  />{' '}
                  mtCO2e/gal
                </div>
              </div>
              <div className={styles.utilityGHGSingle}>
                <span>
                  <svg xmlns="http://www.w3.org/2000/svg">
                    <g fill="none" fillRule="evenodd">
                      <path
                        fill="#2C3444"
                        d="M34 24.955C34 18.303 22 0 22 0S10 18.303 10 24.955C10 31.607 15.373 37 22 37c6.628 0 12-5.393 12-12.045z"
                      />
                      <path
                        stroke="#FFF"
                        strokeWidth="2"
                        d="M17.356 18C16.006 20.851 15 23.542 15 25.206c0 4.245 2.978 7.807 7 8.794"
                      />
                      <path
                        fill="#2C3444"
                        d="M9 9.443C9 6.926 4.5 0 4.5 0S0 6.926 0 9.443C0 11.96 2.015 14 4.5 14S9 11.96 9 9.443z"
                      />
                    </g>
                  </svg>
                  Fuel Oil 4
                </span>
                <div className={styles.utilityGHGInput}>
                  <input
                    name="fuelOil4GHG"
                    onChange={this.handleChange.bind(this)}
                    value={this.state.rates.fuelOil4GHG || ''}
                    type="number"
                    step=".01"
                  />{' '}
                  mtCO2e/gal
                </div>
              </div>
              <div className={styles.utilityGHGSingle}>
                <span>
                  <svg xmlns="http://www.w3.org/2000/svg">
                    <g fill="none" fillRule="evenodd">
                      <path
                        fill="#2C3444"
                        d="M34 24.955C34 18.303 22 0 22 0S10 18.303 10 24.955C10 31.607 15.373 37 22 37c6.628 0 12-5.393 12-12.045z"
                      />
                      <path
                        stroke="#FFF"
                        strokeWidth="2"
                        d="M17.356 18C16.006 20.851 15 23.542 15 25.206c0 4.245 2.978 7.807 7 8.794"
                      />
                      <path
                        fill="#2C3444"
                        d="M9 9.443C9 6.926 4.5 0 4.5 0S0 6.926 0 9.443C0 11.96 2.015 14 4.5 14S9 11.96 9 9.443z"
                      />
                    </g>
                  </svg>
                  Fuel Oil 5 & 6
                </span>
                <div className={styles.utilityGHGInput}>
                  <input
                    name="fuelOil56GHG"
                    onChange={this.handleChange.bind(this)}
                    value={this.state.rates.fuelOil56GHG || ''}
                    type="number"
                    step=".01"
                  />{' '}
                  mtCO2e/gal
                </div>
              </div>
              <div className={styles.utilityGHGSingle}>
                <span>
                  <svg xmlns="http://www.w3.org/2000/svg">
                    <g fill="none" fillRule="evenodd">
                      <path
                        fill="#2C3444"
                        d="M34 24.955C34 18.303 22 0 22 0S10 18.303 10 24.955C10 31.607 15.373 37 22 37c6.628 0 12-5.393 12-12.045z"
                      />
                      <path
                        stroke="#FFF"
                        strokeWidth="2"
                        d="M17.356 18C16.006 20.851 15 23.542 15 25.206c0 4.245 2.978 7.807 7 8.794"
                      />
                      <path
                        fill="#2C3444"
                        d="M9 9.443C9 6.926 4.5 0 4.5 0S0 6.926 0 9.443C0 11.96 2.015 14 4.5 14S9 11.96 9 9.443z"
                      />
                    </g>
                  </svg>
                  Diesel
                </span>
                <div className={styles.utilityGHGInput}>
                  <input
                    name="dieselGHG"
                    onChange={this.handleChange.bind(this)}
                    value={this.state.rates.dieselGHG || ''}
                    type="number"
                    step=".01"
                  />{' '}
                  mtCO2e/gal
                </div>
              </div>
            </div>
          )}
        </div>
        {this.state.isEditing && (
          <div className={styles.defaultFactor}>
            *Default factors from the &nbsp;
            <a
              href="https://www.epa.gov/energy/greenhouse-gases-equivalencies-calculator-calculations-and-references"
              target="_blank"
            >
              U.S. EPA
            </a>
          </div>
        )}
        {this.state.isEditing && (
          <div
            className={classNames(
              styles.panelActions,
              this.state.hideUtilityRates ? styles.panelActionsHide : ''
            )}
          >
            <button
              name="cancelUtilityRates"
              onClick={this.handleEditToggle}
              className={classNames(styles.button, styles.buttonSecondary)}
            >
              Cancel
            </button>
            <button
              name="saveUtilityRates"
              onClick={this.submitForm}
              className={classNames(styles.button, styles.buttonPrimary)}
            >
              Save
            </button>
          </div>
        )}
      </div>
    )
  }
}

export default OverviewGHG
