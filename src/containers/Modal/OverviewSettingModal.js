import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import moment from 'moment'

import { connect } from 'react-redux'
import styles from './OverviewSettingModal.scss'
import TimePeriod from '../../components/UI/TimePeriod'
import { UNIT_DETAILS, UTILITY_UNITS_OPTIONS } from 'static/utility-units'

export class OverviewSettingModal extends React.Component {
  static propTypes = {
    openOverviewSettingModal: PropTypes.func.isRequired,
    building: PropTypes.object.isRequired,
    rates: PropTypes.object.isRequired,
    yearsCovered: PropTypes.array.isRequired,
    applySetting: PropTypes.func.isRequired,
    editBuilding: PropTypes.func.isRequired,
    changeReRunProjects: PropTypes.func.isRequired
  }

  state = {
    didMount: false,
    tabs: [{ name: 'Baseline' }, { name: 'GHG Factors' }],
    selectedView: { name: 'Baseline' },
    showExtras: false,
    formValues: {
      methodology: 'Calculated Based on Consumption Data',
      manualYear: '2017'
    },
    timeRange: {
      type: 'Calendar',
      start: this.props.yearsCovered[0],
      end: this.props.yearsCovered[this.props.yearsCovered.length - 1]
    },
    rates: {},
    manualYearOptions: ['2016', '2017', '2018', '2019'],
    units: ['kWh', 'kW', 'therms', 'Mlb', 'Gal'],
    unit: 'kWh'
  }

  componentDidMount = () => {
    setTimeout(() => {
      this.setState({ didMount: true })
    }, 0)
    const tempRates = Object.values(UNIT_DETAILS).reduce(
      (agg, { ghgSettingKey }) => {
        agg[ghgSettingKey] = this.props.rates[ghgSettingKey] || 0
        return agg
      },
      {}
    )
    this.setState({ rates: tempRates })
  }

  handleTabChange = (index, name) => {
    if (name !== this.state.selectedView.name) {
      let tempState = Object.assign({}, this.state.tabs[index])
      this.setState({ selectedView: tempState })
    }
  }

  handleToggleToolTip = () => {
    this.setState(prevState => ({
      showExtras: !prevState.showExtras
    }))
  }

  handleInputChange = event => {
    let tempFormState = { ...this.state.formValues }
    tempFormState[event.target.name] = event.target.value

    this.setState({ formValues: tempFormState })
  }

  handleTimeRangeChange = options => {
    this.setState({ timeRange: options })
  }

  handleApplySelect = () => {
    let { timeRange, rates } = this.state
    const option = {
      timeRange: timeRange,
      rates: rates
    }

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
        this.props.applySetting(option)
      })
  }

  handleChange = event => {
    let tempRates = { ...this.state.rates }
    const value = event.target.value.replace(/-/g, '')
    tempRates[event.target.name] = value
    this.setState({ rates: tempRates })
  }

  render() {
    const {
      tabs,
      selectedView,
      showExtras,
      manualYearOptions,
      units
    } = this.state
    const { organization, building } = this.props
    const commoditySettings = Object.assign(
      {},
      organization.commoditySettings,
      building.commoditySettings
    )
    let buildingList = []
    buildingList.push(this.props.building)

    return (
      <div
        className={classNames(
          styles.modal,
          styles.templatesModal,
          styles['fade-in'],
          this.state.didMount ? styles.visible : ''
        )}
      >
        <div className={classNames(styles.modalOuter, styles.modalOuterSmall)}>
          <div className={styles.modalInner}>
            <div className={styles.templates}>
              <div className={styles.templatesHeading}>
                <h2>Settings</h2>
                <div
                  className={styles.modalClose}
                  onClick={() => this.props.openOverviewSettingModal(false)}
                >
                  <i className='material-icons'>close</i>
                </div>
              </div>
              <div className={styles.tabs}>
                {tabs.map((tab, index) => {
                  return (
                    <div
                      key={index}
                      name={`${tab.name}Tab`}
                      onClick={() => {
                        this.handleTabChange(index, tab.name)
                      }}
                      className={classNames(
                        styles.tab,
                        tab.name === selectedView.name ? styles.tabActive : ''
                      )}
                    >
                      {tab.name}
                    </div>
                  )
                })}
              </div>
              {selectedView.name === 'Baseline' && (
                <div className={styles.baseLineContainer}>
                  <div className={styles.label}>
                    <p>Methodology</p>
                    <div
                      onMouseEnter={this.handleToggleToolTip}
                      onMouseLeave={this.handleToggleToolTip}
                      className={classNames(
                        styles.extras,
                        styles.extraTool,
                        showExtras ? styles.extrasShow : styles.extrasHide
                      )}
                      ref={node => (this.node = node)}
                    >
                      <i className={classNames('material-icons', styles.info)}>
                        info_outline
                      </i>
                      <div
                        className={classNames(
                          styles.extrasDropdown,
                          styles.extrasDropdownRight,
                          styles.customTooltip
                        )}
                      >
                        <div className={styles.infoTooltip}>
                          <p>
                            Calculated based on Consumption Data uses the
                            average of consumption and cost values in the period
                            defined. Manually Entered allows you to manually set
                            the values based on calculations performed outside
                            of buildee.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div
                    className={classNames(
                      styles.selectContainer,
                      styles.midWidthContainer
                    )}
                  >
                    <select
                      value={this.state.formValues.methodology}
                      name='methodology'
                      onChange={this.handleInputChange}
                    >
                      <option value='Calculated Based on Consumption Data'>
                        Calculated Based on Consumption Data
                      </option>
                      <option value='Manually Entered'>Manually Entered</option>
                    </select>
                  </div>
                  {this.state.formValues.methodology ===
                    'Calculated Based on Consumption Data' && (
                    <div className={styles.midWidthContainer}>
                      <div className={styles.label}>
                        <p>Time Period</p>
                      </div>
                      <div>
                        <TimePeriod
                          handleTimeRangeChange={this.handleTimeRangeChange}
                          yearsCovered={this.props.yearsCovered}
                        />
                      </div>
                    </div>
                  )}
                  {this.state.formValues.methodology === 'Manually Entered' && (
                    <>
                      <div className={styles.label}>
                        <p>Year</p>
                      </div>
                      <div
                        className={classNames(
                          styles.selectContainer,
                          styles.smWidthContainer
                        )}
                      >
                        <select
                          value={this.state.formValues.manualYear}
                          name='manualYear'
                          onChange={this.handleInputChange}
                        >
                          {manualYearOptions.map(function(year, index) {
                            return (
                              <option value={year} key={index}>
                                {year}
                              </option>
                            )
                          })}
                        </select>
                      </div>
                      <div
                        className={classNames(
                          styles.utilityGHGForm,
                          styles.panelContent,
                          styles.manualGHGForm
                        )}
                      >
                        <div className={classNames(styles.utilityGHGSingle)}>
                          <span className={styles.unitLabel}>
                            <i className='material-icons'>flash_on</i>
                            Electricity
                          </span>
                          <div
                            className={classNames(
                              styles.utilityGHGInput,
                              styles.mainValForm
                            )}
                          >
                            <input
                              name='electricGHG'
                              value={''}
                              type='number'
                              step='.01'
                            />
                            <div
                              className={classNames(
                                styles.selectContainer,
                                styles.unitOption
                              )}
                            >
                              <select
                                value={this.state.unit}
                                name='unit'
                                onChange={this.handleInputChange}
                              >
                                {units.map((item, i) => (
                                  <option key={item} value={item}>
                                    {item}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                          <div
                            className={classNames(
                              styles.utilityGHGInput,
                              styles.priceForm
                            )}
                          >
                            ${' '}
                            <input
                              name='electricGHG'
                              value={''}
                              type='number'
                              step='.01'
                            />
                          </div>
                          <div
                            className={classNames(
                              styles.utilityGHGInput,
                              styles.ghgForm
                            )}
                          >
                            <input
                              name='electricGHG'
                              value={''}
                              type='number'
                              step='.01'
                            />{' '}
                            mtCO2e
                          </div>
                        </div>
                        <div className={classNames(styles.utilityGHGSingle)}>
                          <span className={styles.unitLabel}>
                            <i className='material-icons'>flash_on</i>
                            Electricity Demand
                          </span>
                          <div
                            className={classNames(
                              styles.utilityGHGInput,
                              styles.mainValForm
                            )}
                          >
                            <input
                              name='electricGHG'
                              value={''}
                              type='number'
                              step='.01'
                            />
                            <div
                              className={classNames(
                                styles.selectContainer,
                                styles.unitOption
                              )}
                            >
                              <select
                                value={this.state.unit}
                                name='unit'
                                onChange={this.handleInputChange}
                              >
                                {units.map((item, i) => (
                                  <option key={item} value={item}>
                                    {item}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                          <div
                            className={classNames(
                              styles.utilityGHGInput,
                              styles.priceForm
                            )}
                          >
                            ${' '}
                            <input
                              name='electricGHG'
                              value={''}
                              type='number'
                              step='.01'
                            />
                          </div>
                          <div
                            className={classNames(
                              styles.utilityGHGInput,
                              styles.ghgForm
                            )}
                          >
                            <input
                              name='electricGHG'
                              value={''}
                              type='number'
                              step='.01'
                            />{' '}
                            mtCO2e
                          </div>
                        </div>
                        <div className={classNames(styles.utilityGHGSingle)}>
                          <span className={styles.unitLabel}>
                            <i className='material-icons'>whatshot</i>Natural
                            Gas
                          </span>
                          <div
                            className={classNames(
                              styles.utilityGHGInput,
                              styles.mainValForm
                            )}
                          >
                            <input
                              name='electricGHG'
                              value={''}
                              type='number'
                              step='.01'
                            />
                            <div
                              className={classNames(
                                styles.selectContainer,
                                styles.unitOption
                              )}
                            >
                              <select
                                value={this.state.unit}
                                name='unit'
                                onChange={this.handleInputChange}
                              >
                                {units.map((item, i) => (
                                  <option key={item} value={item}>
                                    {item}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                          <div
                            className={classNames(
                              styles.utilityGHGInput,
                              styles.priceForm
                            )}
                          >
                            ${' '}
                            <input
                              name='electricGHG'
                              value={''}
                              type='number'
                              step='.01'
                            />
                          </div>
                          <div
                            className={classNames(
                              styles.utilityGHGInput,
                              styles.ghgForm
                            )}
                          >
                            <input
                              name='electricGHG'
                              value={''}
                              type='number'
                              step='.01'
                            />{' '}
                            mtCO2e
                          </div>
                        </div>
                        <div className={classNames(styles.utilityGHGSingle)}>
                          <span className={styles.unitLabel}>
                            <i className='material-icons'>scatter_plot</i>Steam
                          </span>
                          <div
                            className={classNames(
                              styles.utilityGHGInput,
                              styles.mainValForm
                            )}
                          >
                            <input
                              name='electricGHG'
                              value={''}
                              type='number'
                              step='.01'
                            />
                            <div
                              className={classNames(
                                styles.selectContainer,
                                styles.unitOption
                              )}
                            >
                              <select
                                value={this.state.unit}
                                name='unit'
                                onChange={this.handleInputChange}
                              >
                                {units.map((item, i) => (
                                  <option key={item} value={item}>
                                    {item}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                          <div
                            className={classNames(
                              styles.utilityGHGInput,
                              styles.priceForm
                            )}
                          >
                            ${' '}
                            <input
                              name='electricGHG'
                              value={''}
                              type='number'
                              step='.01'
                            />
                          </div>
                          <div
                            className={classNames(
                              styles.utilityGHGInput,
                              styles.ghgForm
                            )}
                          >
                            <input
                              name='electricGHG'
                              value={''}
                              type='number'
                              step='.01'
                            />{' '}
                            mtCO2e
                          </div>
                        </div>
                        <div className={classNames(styles.utilityGHGSingle)}>
                          <span className={styles.unitLabel}>
                            <svg xmlns='http://www.w3.org/2000/svg'>
                              <g fill='none' fillRule='evenodd'>
                                <path
                                  fill='#2C3444'
                                  d='M34 24.955C34 18.303 22 0 22 0S10 18.303 10 24.955C10 31.607 15.373 37 22 37c6.628 0 12-5.393 12-12.045z'
                                />
                                <path
                                  stroke='#FFF'
                                  strokeWidth='2'
                                  d='M17.356 18C16.006 20.851 15 23.542 15 25.206c0 4.245 2.978 7.807 7 8.794'
                                />
                                <path
                                  fill='#2C3444'
                                  d='M9 9.443C9 6.926 4.5 0 4.5 0S0 6.926 0 9.443C0 11.96 2.015 14 4.5 14S9 11.96 9 9.443z'
                                />
                              </g>
                            </svg>
                            Fuel Oil 2
                          </span>
                          <div
                            className={classNames(
                              styles.utilityGHGInput,
                              styles.mainValForm
                            )}
                          >
                            <input
                              name='electricGHG'
                              value={''}
                              type='number'
                              step='.01'
                            />
                            <div
                              className={classNames(
                                styles.selectContainer,
                                styles.unitOption
                              )}
                            >
                              <select
                                value={this.state.unit}
                                name='unit'
                                onChange={this.handleInputChange}
                              >
                                {units.map((item, i) => (
                                  <option key={item} value={item}>
                                    {item}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                          <div
                            className={classNames(
                              styles.utilityGHGInput,
                              styles.priceForm
                            )}
                          >
                            ${' '}
                            <input
                              name='electricGHG'
                              value={''}
                              type='number'
                              step='.01'
                            />
                          </div>
                          <div
                            className={classNames(
                              styles.utilityGHGInput,
                              styles.ghgForm
                            )}
                          >
                            <input
                              name='electricGHG'
                              value={''}
                              type='number'
                              step='.01'
                            />{' '}
                            mtCO2e
                          </div>
                        </div>
                        <div className={classNames(styles.utilityGHGSingle)}>
                          <span className={styles.unitLabel}>
                            <svg xmlns='http://www.w3.org/2000/svg'>
                              <g fill='none' fillRule='evenodd'>
                                <path
                                  fill='#2C3444'
                                  d='M34 24.955C34 18.303 22 0 22 0S10 18.303 10 24.955C10 31.607 15.373 37 22 37c6.628 0 12-5.393 12-12.045z'
                                />
                                <path
                                  stroke='#FFF'
                                  strokeWidth='2'
                                  d='M17.356 18C16.006 20.851 15 23.542 15 25.206c0 4.245 2.978 7.807 7 8.794'
                                />
                                <path
                                  fill='#2C3444'
                                  d='M9 9.443C9 6.926 4.5 0 4.5 0S0 6.926 0 9.443C0 11.96 2.015 14 4.5 14S9 11.96 9 9.443z'
                                />
                              </g>
                            </svg>
                            Fuel Oil 4
                          </span>
                          <div
                            className={classNames(
                              styles.utilityGHGInput,
                              styles.mainValForm
                            )}
                          >
                            <input
                              name='electricGHG'
                              value={''}
                              type='number'
                              step='.01'
                            />
                            <div
                              className={classNames(
                                styles.selectContainer,
                                styles.unitOption
                              )}
                            >
                              <select
                                value={this.state.unit}
                                name='unit'
                                onChange={this.handleInputChange}
                              >
                                {units.map((item, i) => (
                                  <option key={item} value={item}>
                                    {item}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                          <div
                            className={classNames(
                              styles.utilityGHGInput,
                              styles.priceForm
                            )}
                          >
                            ${' '}
                            <input
                              name='electricGHG'
                              value={''}
                              type='number'
                              step='.01'
                            />
                          </div>
                          <div
                            className={classNames(
                              styles.utilityGHGInput,
                              styles.ghgForm
                            )}
                          >
                            <input
                              name='electricGHG'
                              value={''}
                              type='number'
                              step='.01'
                            />{' '}
                            mtCO2e
                          </div>
                        </div>
                        <div className={classNames(styles.utilityGHGSingle)}>
                          <span className={styles.unitLabel}>
                            <svg xmlns='http://www.w3.org/2000/svg'>
                              <g fill='none' fillRule='evenodd'>
                                <path
                                  fill='#2C3444'
                                  d='M34 24.955C34 18.303 22 0 22 0S10 18.303 10 24.955C10 31.607 15.373 37 22 37c6.628 0 12-5.393 12-12.045z'
                                />
                                <path
                                  stroke='#FFF'
                                  strokeWidth='2'
                                  d='M17.356 18C16.006 20.851 15 23.542 15 25.206c0 4.245 2.978 7.807 7 8.794'
                                />
                                <path
                                  fill='#2C3444'
                                  d='M9 9.443C9 6.926 4.5 0 4.5 0S0 6.926 0 9.443C0 11.96 2.015 14 4.5 14S9 11.96 9 9.443z'
                                />
                              </g>
                            </svg>
                            Fuel Oil 5 & 6
                          </span>
                          <div
                            className={classNames(
                              styles.utilityGHGInput,
                              styles.mainValForm
                            )}
                          >
                            <input
                              name='electricGHG'
                              value={''}
                              type='number'
                              step='.01'
                            />
                            <div
                              className={classNames(
                                styles.selectContainer,
                                styles.unitOption
                              )}
                            >
                              <select
                                value={this.state.unit}
                                name='unit'
                                onChange={this.handleInputChange}
                              >
                                {units.map((item, i) => (
                                  <option key={item} value={item}>
                                    {item}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                          <div
                            className={classNames(
                              styles.utilityGHGInput,
                              styles.priceForm
                            )}
                          >
                            ${' '}
                            <input
                              name='electricGHG'
                              value={''}
                              type='number'
                              step='.01'
                            />
                          </div>
                          <div
                            className={classNames(
                              styles.utilityGHGInput,
                              styles.ghgForm
                            )}
                          >
                            <input
                              name='electricGHG'
                              value={''}
                              type='number'
                              step='.01'
                            />{' '}
                            mtCO2e
                          </div>
                        </div>
                        <div className={classNames(styles.utilityGHGSingle)}>
                          <span className={styles.unitLabel}>
                            <svg xmlns='http://www.w3.org/2000/svg'>
                              <g fill='none' fillRule='evenodd'>
                                <path
                                  fill='#2C3444'
                                  d='M34 24.955C34 18.303 22 0 22 0S10 18.303 10 24.955C10 31.607 15.373 37 22 37c6.628 0 12-5.393 12-12.045z'
                                />
                                <path
                                  stroke='#FFF'
                                  strokeWidth='2'
                                  d='M17.356 18C16.006 20.851 15 23.542 15 25.206c0 4.245 2.978 7.807 7 8.794'
                                />
                                <path
                                  fill='#2C3444'
                                  d='M9 9.443C9 6.926 4.5 0 4.5 0S0 6.926 0 9.443C0 11.96 2.015 14 4.5 14S9 11.96 9 9.443z'
                                />
                              </g>
                            </svg>
                            Diesel
                          </span>
                          <div
                            className={classNames(
                              styles.utilityGHGInput,
                              styles.mainValForm
                            )}
                          >
                            <input
                              name='electricGHG'
                              value={''}
                              type='number'
                              step='.01'
                            />
                            <div
                              className={classNames(
                                styles.selectContainer,
                                styles.unitOption
                              )}
                            >
                              <select
                                value={this.state.unit}
                                name='unit'
                                onChange={this.handleInputChange}
                              >
                                {units.map((item, i) => (
                                  <option key={item} value={item}>
                                    {item}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                          <div
                            className={classNames(
                              styles.utilityGHGInput,
                              styles.priceForm
                            )}
                          >
                            ${' '}
                            <input
                              name='electricGHG'
                              value={''}
                              type='number'
                              step='.01'
                            />
                          </div>
                          <div
                            className={classNames(
                              styles.utilityGHGInput,
                              styles.ghgForm
                            )}
                          >
                            <input
                              name='electricGHG'
                              value={''}
                              type='number'
                              step='.01'
                            />{' '}
                            mtCO2e
                          </div>
                        </div>
                        <div className={classNames(styles.utilityGHGSingle)}>
                          <span className={styles.unitLabel}>
                            <i className='material-icons'>water</i>
                            Water
                          </span>
                          <div
                            className={classNames(
                              styles.utilityGHGInput,
                              styles.mainValForm
                            )}
                          >
                            <input
                              name='electricGHG'
                              value={''}
                              type='number'
                              step='.01'
                            />
                            <div
                              className={classNames(
                                styles.selectContainer,
                                styles.unitOption
                              )}
                            >
                              <select
                                value={this.state.unit}
                                name='unit'
                                onChange={this.handleInputChange}
                              >
                                {units.map((item, i) => (
                                  <option key={item} value={item}>
                                    {item}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                          <div
                            className={classNames(
                              styles.utilityGHGInput,
                              styles.priceForm
                            )}
                          >
                            ${' '}
                            <input
                              name='electricGHG'
                              value={''}
                              type='number'
                              step='.01'
                            />
                          </div>
                          <div
                            className={classNames(
                              styles.utilityGHGInput,
                              styles.ghgForm
                            )}
                          ></div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
              {selectedView.name === 'GHG Factors' && (
                <div className={styles.ghgFactorsContainer}>
                  <div
                    className={classNames(
                      styles.utilityGHGForm,
                      styles.panelContent
                    )}
                  >
                    {Object.entries(UTILITY_UNITS_OPTIONS).map(
                      ([commodity, units]) => {
                        const {
                          title,
                          icon,
                          isFuel,
                          ghgSettingKey
                        } = UNIT_DETAILS[commodity]
                        return (
                          <div
                            className={styles.utilityGHGSingle}
                            key={`commodity_${commodity}`}
                          >
                            <span className={styles.commodityIcon}>
                              {isFuel ? (
                                <svg xmlns='http://www.w3.org/2000/svg'>
                                  <g fill='none' fillRule='evenodd'>
                                    <path
                                      fill='#2C3444'
                                      d='M34 24.955C34 18.303 22 0 22 0S10 18.303 10 24.955C10 31.607 15.373 37 22 37c6.628 0 12-5.393 12-12.045z'
                                    />
                                    <path
                                      stroke='#FFF'
                                      strokeWidth='2'
                                      d='M17.356 18C16.006 20.851 15 23.542 15 25.206c0 4.245 2.978 7.807 7 8.794'
                                    />
                                    <path
                                      fill='#2C3444'
                                      d='M9 9.443C9 6.926 4.5 0 4.5 0S0 6.926 0 9.443C0 11.96 2.015 14 4.5 14S9 11.96 9 9.443z'
                                    />
                                  </g>
                                </svg>
                              ) : (
                                <i className='material-icons'>{icon}</i>
                              )}
                            </span>
                            <div className={styles.utilityGHGTitle}>
                              {title}
                            </div>
                            <div className={styles.utilityGHGInput}>
                              <input
                                name={ghgSettingKey}
                                onChange={this.handleChange.bind(this)}
                                value={this.state.rates[ghgSettingKey] || ''}
                                type='number'
                                step='.01'
                              />{' '}
                              <div
                                className={classNames(
                                  styles.selectContainer,
                                  styles.commodityOptions
                                )}
                              >
                                <select
                                  value={commoditySettings[commodity]?.unit}
                                  disabled={
                                    building.commoditySettings?.[commodity]
                                  }
                                >
                                  {units.map(unit => (
                                    <option value={unit}>{unit}</option>
                                  ))}
                                </select>
                              </div>
                            </div>
                          </div>
                        )
                      }
                    )}
                  </div>
                  <div className={styles.defaultFactor}>
                    *Default factors from the &nbsp;
                    <a
                      href='https://www.epa.gov/energy/greenhouse-gases-equivalencies-calculator-calculations-and-references'
                      target='_blank'
                    >
                      U.S. EPA
                    </a>
                  </div>
                </div>
              )}

              <div className={styles.templatesFooter}>
                <button
                  className={classNames(styles.button, styles.buttonSecondary)}
                  onClick={() => this.props.openOverviewSettingModal(false)}
                >
                  Cancel
                </button>
                <button
                  className={classNames(styles.button, styles.buttonPrimary)}
                  onClick={this.handleApplySelect}
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
)(OverviewSettingModal)
