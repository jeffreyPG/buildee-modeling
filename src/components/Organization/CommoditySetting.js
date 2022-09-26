import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router'
import styles from './CommoditySetting.scss'
import classNames from 'classnames'
import { Loader } from 'utils/Loader'
import { UNIT_DETAILS, UTILITY_UNITS_OPTIONS } from '../../static/utility-units'
import TimePeriod from '../UI/TimePeriod'

export class CommoditySetting extends React.Component {
  static propTypes = {
    commoditySettings: PropTypes.object.isRequired,
    handleUnitChanged: PropTypes.func.isRequired
  }

  state = {
    methodology: '',
    yearsCovered: ['2017', '2018', '2019', '2020', '2021', '2022'],
    defaultTimePeriod: ''
  }

  handleInputChange = event => {
    let tempOrgState = { ...this.state.orgValues }
    tempOrgState[event.target.name] = event.target.value
    this.setState({ orgValues: tempOrgState })
  }

  render() {
    const {
      commoditySettings,
      handleUnitChanged,
      handleEmissionFactorChanged,
      onSaveCommoditySettings
    } = this.props
    return (
      <div className={styles.container}>
        <div className={styles.settingContainer}>
          <div className={styles.baselineBlock}>
            <div className={styles.baseLineContainer}>
              <div className={styles.label}>
                <p>Default Time Period Format</p>
              </div>
              <div
                className={classNames(
                  styles.selectContainer,
                  styles.defaultTimePeriod
                )}
              >
                <select
                  value={this.state.defaultTimePeriod}
                  name='defaultTimePeriod'
                  onChange={this.handleInputChange}
                >
                  <option value='Calendar'>Calendar Year</option>
                  <option value='Fiscal'>Fiscal Year(July - June)</option>
                </select>
              </div>
              <div className={styles.label}>
                <p className={styles.subLabel}>Methodology</p>
              </div>
              <div className={styles.methodologyValue}>
                Calculated Based on Consumption Data
              </div>
              <div className={styles.label}>
                <p className={styles.subLabel}>Time Period</p>
              </div>
              <div>
                <TimePeriod
                  handleTimeRangeChange={this.handleTimeRangeChange}
                  yearsCovered={this.state.yearsCovered}
                />
              </div>
            </div>
          </div>
          <div className={styles.commidityBlock}>
            <p>Default Commodity Settings</p>
            {Object.entries(UTILITY_UNITS_OPTIONS).map(([commodity, units]) => {
              const { title, icon, isFuel } = UNIT_DETAILS[commodity]
              return (
                <div
                  className={styles.commodityItem}
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
                  <span className={styles.commodityTitle}>{title}</span>
                  <div
                    className={classNames(
                      styles.selectContainer,
                      styles.unitsForm
                    )}
                  >
                    <select
                      value={commoditySettings[commodity]?.unit}
                      onChange={handleUnitChanged(commodity)}
                    >
                      {units.map(unit => (
                        <option value={unit}>{unit}</option>
                      ))}
                    </select>
                  </div>
                  <div
                    className={classNames(
                      styles.commodityItemInput,
                      styles.siteFactors
                    )}
                  >
                    <input
                      name='electricGHG'
                      onChange={handleEmissionFactorChanged(
                        commodity,
                        'siteEmissionFactor'
                      )}
                      value={commoditySettings[commodity]?.siteEmissionFactor}
                      type='number'
                      step='.01'
                    />{' '}
                    mtCO2e/kWh
                  </div>
                  <div
                    className={classNames(
                      styles.commodityItemInput,
                      styles.sourceFactors
                    )}
                  >
                    <input
                      name='electricGHG'
                      onChange={handleEmissionFactorChanged(
                        commodity,
                        'sourceEmissionFactor'
                      )}
                      value={commoditySettings[commodity]?.sourceEmissionFactor}
                      type='number'
                      step='.01'
                    />{' '}
                    mtCO2e/kWh
                  </div>
                </div>
              )
            })}
          </div>
        </div>
        <button
          className={classNames(
            styles.button,
            styles.buttonPrimary,
            styles.saveButton
          )}
          onClick={onSaveCommoditySettings}
        >
          Save
        </button>
      </div>
    )
  }
}

export default CommoditySetting
