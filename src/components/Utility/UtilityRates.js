import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import styles from './UtilityRates.scss'

export class UtilityRates extends React.Component {
  static propTypes = {
    building: PropTypes.object.isRequired,
    editBuilding: PropTypes.func.isRequired,
    changeReRunProjects: PropTypes.func.isRequired
  }

  state = {
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
    showGHGFactors: false,
    hideUtilityRates: true
  }

  // on component did mount set the rates from the building
  componentDidMount = () => {
    if (this.props.building.rates) {
      let tempRates = Object.assign(
        {},
        this.state.rates,
        this.props.building.rates
      )
      this.setState({ rates: tempRates })
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

  handleHideUtilitytRates = () => {
    this.setState(prevState => ({
      hideUtilityRates: !prevState.hideUtilityRates
    }))

    if (this.state.hideUtilityRates) {
      this.setState({ isEditing: false })
    }
  }

  handleToggleFactors = () => {
    this.setState(prevState => ({
      showGHGFactors: !prevState.showGHGFactors
    }))
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

  render() {
    const { building } = this.props

    return (
      <div className={styles.utilityRates}>
        <div className={styles.panelHeader}>
          <div className={styles.utilityRatesHeader}>
            <div
              className={styles.panelDropdownClick}
              onClick={this.handleHideUtilitytRates}
            >
              {this.state.hideUtilityRates ? (
                <i className="material-icons">arrow_drop_up</i>
              ) : (
                <i className="material-icons">arrow_drop_down</i>
              )}
            </div>
            <h3>Utility Rates</h3>
          </div>
          {!this.state.isEditing && (
            <div
              name="editUtilityRates"
              className={classNames(
                styles.panelEdit,
                this.state.hideUtilityRates ? styles.panelEditHide : ''
              )}
              onClick={this.handleEditToggle}
            >
              <i className="material-icons">edit</i>
            </div>
          )}
        </div>

        <div
          className={classNames(
            this.state.hideUtilityRates ? styles.panelContentHide : ''
          )}
        >
          {!this.state.isEditing &&
            Object.keys(building).length > 0 &&
            !building.rates &&
            !building.rates.electric &&
            !building.rates.fuelOil2 &&
            !building.rates.fuelOil4 &&
            !building.rates.fuelOil56 &&
            !building.rates.gas &&
            !building.rates.diesel &&
            !building.rates.other &&
            !building.rates.steam &&
            !building.rates.water && (
              <p>
                <i className="material-icons warning">warning</i> Fill out
                blended utility rates to see financial information for projects.
              </p>
            )}

          {!this.state.isEditing && Object.keys(building).length > 0 && (
            <div className={styles.utilityRatesDisplay}>
              <div
                className={classNames(
                  styles.panelContent,
                  this.state.showGHGFactors ? '' : styles.extraPadding
                )}
              >
                {building.rates.electric !== '' &&
                  building.rates.electric !== 0 &&
                  building.rates.electric && (
                    <div className={styles.utilityRatesSingle}>
                      <span>
                        <i className="material-icons">flash_on</i>Electricity
                      </span>
                      <p>${building.rates.electric || ' - '}/kWh</p>
                    </div>
                  )}
                {building.rates.gas !== '' &&
                  building.rates.gas !== 0 &&
                  building.rates.gas && (
                    <div className={styles.utilityRatesSingle}>
                      <span>
                        <i className="material-icons">whatshot</i>Natural Gas
                      </span>
                      <p>${building.rates.gas || ' - '}/therm</p>
                    </div>
                  )}
                {building.rates.water !== '' &&
                  building.rates.water !== 0 &&
                  building.rates.water && (
                    <div className={styles.utilityRatesSingle}>
                      <span>
                        <i className="material-icons">waves</i>Water
                      </span>
                      <p>${building.rates.water || ' - '}/kG</p>
                    </div>
                  )}
                {building.rates.steam !== '' &&
                  building.rates.steam !== 0 &&
                  building.rates.steam && (
                    <div className={styles.utilityRatesSingle}>
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
                    <div className={styles.utilityRatesSingle}>
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
                    <div className={styles.utilityRatesSingle}>
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
                    <div className={styles.utilityRatesSingle}>
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
                    <div className={styles.utilityRatesSingle}>
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
                        styles.utilityRatesSingle,
                        styles.utilityRatesSingleNoBorder
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
              </div>

              <div
                className={classNames(
                  styles.tableToggle,
                  this.state.showGHGFactors ? '' : styles.show
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
                  <h3>GHG Factors</h3>
                  {building.rates.electricGHG !== '' &&
                    building.rates.electricGHG !== 0 &&
                    building.rates.electricGHG && (
                      <div className={styles.utilityRatesSingle}>
                        <span>
                          <i className="material-icons">flash_on</i>Electricity
                        </span>
                        <p>
                          {building.rates.electricGHG || ' - '} tons CO²/kWh
                        </p>
                      </div>
                    )}
                  {building.rates.gasGHG !== '' &&
                    building.rates.gasGHG !== 0 &&
                    building.rates.gasGHG && (
                      <div className={styles.utilityRatesSingle}>
                        <span>
                          <i className="material-icons">whatshot</i>Natural Gas
                        </span>
                        <p>{building.rates.gasGHG || ' - '} tons CO²/therm</p>
                      </div>
                    )}
                  {building.rates.steamGHG !== '' &&
                    building.rates.steamGHG !== 0 &&
                    building.rates.steamGHG && (
                      <div className={styles.utilityRatesSingle}>
                        <span>
                          <i className="material-icons">scatter_plot</i>Steam
                        </span>
                        <p>{building.rates.steamGHG || ' - '} tons CO²/ccf</p>
                      </div>
                    )}
                  {building.rates.fuelOil2GHG !== '' &&
                    building.rates.fuelOil2GHG !== 0 &&
                    building.rates.fuelOil2GHG && (
                      <div className={styles.utilityRatesSingle}>
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
                        <p>
                          {building.rates.fuelOil2GHG || ' - '} tons CO²/gal
                        </p>
                      </div>
                    )}
                  {building.rates.fuelOil4GHG !== '' &&
                    building.rates.fuelOil4GHG !== 0 &&
                    building.rates.fuelOil4GHG && (
                      <div className={styles.utilityRatesSingle}>
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
                        <p>
                          {building.rates.fuelOil4GHG || ' - '} tons CO²/gal
                        </p>
                      </div>
                    )}
                  {building.rates.fuelOil56GHG !== '' &&
                    building.rates.fuelOil56GHG !== 0 &&
                    building.rates.fuelOil56GHG && (
                      <div className={styles.utilityRatesSingle}>
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
                        <p>
                          {building.rates.fuelOil56GHG || ' - '} tons CO²/gal
                        </p>
                      </div>
                    )}
                  {building.rates.dieselGHG !== '' &&
                    building.rates.dieselGHG !== 0 &&
                    building.rates.dieselGHG && (
                      <div className={styles.utilityRatesSingle}>
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
                        <p>{building.rates.dieselGHG || ' - '} tons CO²/gal</p>
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
              className={classNames(
                styles.utilityRatesForm,
                styles.panelContent
              )}
            >
              <div className={styles.utilityRatesSingle}>
                <span>
                  <i className="material-icons">flash_on</i>Electricity
                </span>
                <div className={styles.utilityRatesInput}>
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

              <div className={styles.utilityRatesSingle}>
                <span>
                  <i className="material-icons">whatshot</i>Natural Gas
                </span>
                <div className={styles.utilityRatesInput}>
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
              <div className={styles.utilityRatesSingle}>
                <span>
                  <i className="material-icons">waves</i>Water
                </span>
                <div className={styles.utilityRatesInput}>
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
              <div className={styles.utilityRatesSingle}>
                <span>
                  <i className="material-icons">scatter_plot</i>Steam
                </span>
                <div className={styles.utilityRatesInput}>
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
              <div className={styles.utilityRatesSingle}>
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
                <div className={styles.utilityRatesInput}>
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
              <div className={styles.utilityRatesSingle}>
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
                <div className={styles.utilityRatesInput}>
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
              <div className={styles.utilityRatesSingle}>
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
                <div className={styles.utilityRatesInput}>
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
              <div className={styles.utilityRatesSingle}>
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
                <div className={styles.utilityRatesInput}>
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
                  styles.utilityRatesSingle,
                  styles.utilityRatesSingleNoBorder
                )}
              >
                <span>
                  <i className="material-icons">scatter_plot</i>Other
                </span>
                <div className={styles.utilityRatesInput}>
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
              </div>

              <h3>GHG Factors</h3>
              <div className={styles.utilityRatesSingle}>
                <span>
                  <i className="material-icons">flash_on</i>Electricity
                </span>
                <div className={styles.utilityRatesInput}>
                  <input
                    name="electricGHG"
                    onChange={this.handleChange.bind(this)}
                    value={this.state.rates.electricGHG || ''}
                    type="number"
                    step=".01"
                  />{' '}
                  tons CO²/kWh
                </div>
              </div>
              <div className={styles.utilityRatesSingle}>
                <span>
                  <i className="material-icons">whatshot</i>Natural Gas
                </span>
                <div className={styles.utilityRatesInput}>
                  <input
                    name="gasGHG"
                    onChange={this.handleChange.bind(this)}
                    value={this.state.rates.gasGHG || ''}
                    type="number"
                    step=".01"
                  />{' '}
                  tons CO²/therm
                </div>
              </div>
              <div className={styles.utilityRatesSingle}>
                <span>
                  <i className="material-icons">scatter_plot</i>Steam
                </span>
                <div className={styles.utilityRatesInput}>
                  <input
                    name="steamGHG"
                    onChange={this.handleChange.bind(this)}
                    value={this.state.rates.steamGHG || ''}
                    type="number"
                    step=".01"
                  />{' '}
                  tons CO²/ccf
                </div>
              </div>
              <div className={styles.utilityRatesSingle}>
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
                <div className={styles.utilityRatesInput}>
                  <input
                    name="fuelOil2GHG"
                    onChange={this.handleChange.bind(this)}
                    value={this.state.rates.fuelOil2GHG || ''}
                    type="number"
                    step=".01"
                  />{' '}
                  tons CO²/gal
                </div>
              </div>
              <div className={styles.utilityRatesSingle}>
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
                <div className={styles.utilityRatesInput}>
                  <input
                    name="fuelOil4GHG"
                    onChange={this.handleChange.bind(this)}
                    value={this.state.rates.fuelOil4GHG || ''}
                    type="number"
                    step=".01"
                  />{' '}
                  tons CO²/gal
                </div>
              </div>
              <div className={styles.utilityRatesSingle}>
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
                <div className={styles.utilityRatesInput}>
                  <input
                    name="fuelOil56GHG"
                    onChange={this.handleChange.bind(this)}
                    value={this.state.rates.fuelOil56GHG || ''}
                    type="number"
                    step=".01"
                  />{' '}
                  tons CO²/gal
                </div>
              </div>
              <div className={styles.utilityRatesSingle}>
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
                <div className={styles.utilityRatesInput}>
                  <input
                    name="dieselGHG"
                    onChange={this.handleChange.bind(this)}
                    value={this.state.rates.dieselGHG || ''}
                    type="number"
                    step=".01"
                  />{' '}
                  tons CO²/gal
                </div>
              </div>
            </div>
          )}
        </div>

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

export default UtilityRates
