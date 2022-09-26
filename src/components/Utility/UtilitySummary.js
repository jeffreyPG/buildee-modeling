import React from 'react'
import PropTypes from 'prop-types'
import styles from './UtilitySummary.scss'
import { formatNumbersWithCommas, defaultUtilUnitsFromType } from 'utils/Utils'
import { UNIT_DETAILS } from 'static/utility-units'

export class UtilitySummary extends React.Component {
  static propTypes = {
    building: PropTypes.object.isRequired,
    allUtilities: PropTypes.object.isRequired,
    utilityMetrics: PropTypes.object.isRequired,
    datePicker: PropTypes.object.isRequired,
    activeDates: PropTypes.object.isRequired
  }

  handleRemoveDashes = str => {
    return str.replace(/-/g, ' ')
  }

  handleCapitalizeWords = str => {
    return str.replace(/\w\S*/g, function(txt) {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    })
  }

  handleFormatName = utilName => {
    if (UNIT_DETAILS[utilName]) {
      return UNIT_DETAILS[utilName].title
    }
    return this.handleCapitalizeWords(this.handleRemoveDashes(utilName))
  }

  renderUtilSummary = util => {
    const { totalUtilUsages } = this.props.utilityMetrics
    const { building, commoditySettings } = this.props
    const { rates = {} } = building
    let utiltyMap = {
      electric: 'electric',
      'natural-gas': 'gas',
      water: 'water',
      steam: 'steam',
      'fuel-oil-2': 'fuelOil2',
      'fuel-oil-4': 'fuelOil4',
      'fuel-oil-5-6': 'fuelOil56',
      diesel: 'diesel'
    }

    return (
      <div className={styles.utilitySummaryRow}>
        <div>
          <p>{this.handleFormatName(util)}</p>
          <h2>
            {formatNumbersWithCommas(totalUtilUsages[util])}&nbsp;
            {defaultUtilUnitsFromType(util, commoditySettings)}
          </h2>
        </div>
        <div>
          <p>Blended Rate</p>
          <h2>
            ${rates[utiltyMap[util]] ? _.round(rates[utiltyMap[util]], 4) : 0}/
            {defaultUtilUnitsFromType(util, commoditySettings)}
          </h2>
        </div>
      </div>
    )
  }

  checkEmptyState = () => {
    const { allUtilities = {} } = this.props
    const keys = (allUtilities && Object.keys(allUtilities)) || []
    return keys.length === 0
  }

  render() {
    const { totalUtilUsages, eui = '' } = this.props.utilityMetrics
    const { allUtilities, activeDates, utilityMetrics } = this.props
    const emptyState = this.checkEmptyState()

    return (
      <div className={styles.utilitySummary}>
        <div className={styles.panelHeader}>
          <h3>
            Summary&nbsp;
            {(activeDates && activeDates.startDate) || ''}
          </h3>
        </div>

        <div className={styles.panelContent}>
          {allUtilities && emptyState && (
            <div className={styles.empty}>
              <div className={styles.emptyBody}>
                <div className={styles.emptyBodyTitle}>Add Meter Data</div>
                <div className={styles.emptyBodyDescription}>
                  Add data in Utilities or import from ENERGY STAR Portfolio
                  Manager.
                </div>
              </div>
            </div>
          )}
          {allUtilities && !emptyState && (
            <div>
              <div className={styles.utilitySummaryRow}>
                <div>
                  <p>Total Energy Cost</p>
                  <h2>
                    $
                    {utilityMetrics.totalCost
                      ? formatNumbersWithCommas(utilityMetrics.totalCost)
                      : 0}
                  </h2>
                </div>
                <div>
                  <p>Energy Cost Index (ECI)</p>
                  <h2>
                    ${utilityMetrics.costPerSqFoot}/ft{'\u00B2'}
                  </h2>
                </div>
              </div>

              <div className={styles.utilitySummaryRow}>
                <div>
                  <p>Total Energy</p>
                  <h2>
                    {utilityMetrics.totalEneryUsage
                      ? formatNumbersWithCommas(
                          _.round(utilityMetrics.totalEneryUsage)
                        )
                      : 0}{' '}
                    kBtu
                  </h2>
                </div>
                <div>
                  <p>Site Energy Use Intensity (EUI)</p>
                  {eui !== '' && eui !== '-' && (
                    <h2>
                      {formatNumbersWithCommas(eui)} kBtu/ft{'\u00B2'}
                    </h2>
                  )}
                </div>
              </div>

              {totalUtilUsages.electric > 0 &&
                this.renderUtilSummary('electric')}
              {totalUtilUsages['natural-gas'] > 0 &&
                this.renderUtilSummary('natural-gas')}

              {totalUtilUsages.water > 0 && this.renderUtilSummary('water')}

              {totalUtilUsages.steam > 0 && this.renderUtilSummary('steam')}

              {totalUtilUsages['fuel-oil-2'] > 0 &&
                this.renderUtilSummary('fuel-oil-2')}

              {totalUtilUsages['fuel-oil-4'] > 0 &&
                this.renderUtilSummary('fuel-oil-4')}

              {totalUtilUsages['fuel-oil-5-6'] > 0 &&
                this.renderUtilSummary('fuel-oil-5-6')}

              {totalUtilUsages.diesel > 0 && this.renderUtilSummary('diesel')}
            </div>
          )}
        </div>
      </div>
    )
  }
}

export default UtilitySummary
