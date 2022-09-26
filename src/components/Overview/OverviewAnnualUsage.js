import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import styles from './OverviewAnnualUsage.scss'
import { formatNumbersWithCommas, checkIsResidentalEndUse } from 'utils/Utils'

export class OverviewAnnualUsage extends React.Component {
  static propTypes = {
    endUse: PropTypes.object.isRequired,
    squareFootage: PropTypes.number,
    buildingUse: PropTypes.string.isRequired,
    hasUtilities: PropTypes.bool,
    handleTabChange: PropTypes.func.isRequired
  }

  state = {
    iterationCount: 4,
    quartiles: [],
    ratio: '',
    details: {
      percentage: '',
      text: ''
    }
  }

  componentDidMount = () => {
    if (this.props.endUse && Object.keys(this.props.endUse).length > 0) {
      this.structureEndUses()
    }
  }

  componentDidUpdate = prevProps => {
    if (prevProps.endUse !== this.props.endUse) {
      this.structureEndUses()
    }
  }

  structureEndUses = () => {
    if (
      this.props.endUse &&
      Object.keys(this.props.endUse).length > 0 &&
      this.props.endUse['total-energy-estimate']
    ) {
      let tempQuartiles = [
        {
          name: 'Median',
          value: this.props.endUse['total-energy-estimate']['quantile-50']
        },
        {
          name: '75th percentile',
          value: this.props.endUse['total-energy-estimate']['quantile-75']
        },
        {
          name: '90th percentile',
          value: this.props.endUse['total-energy-estimate']['quantile-90']
        },
        {
          name: 'You',
          value: this.props.endUse['total-energy-estimate'][
            'estimated_consumption'
          ]
        }
      ]
      tempQuartiles = tempQuartiles.sort(function(a, b) {
        return b.value - a.value
      })

      //get details percentage
      let medianObj = tempQuartiles.find(quartile => quartile.name === 'Median')
      let youObj = tempQuartiles.find(quartile => quartile.name === 'You')
      let objDiff = medianObj.value - youObj.value

      let tempObj = { text: '', percentage: '' }

      if (objDiff > 0) {
        tempObj.text = 'lower'
      } else {
        tempObj.text = 'higher'
      }

      tempObj.percentage = Math.abs(
        Math.round((Number(objDiff) / Number(medianObj.value)) * 100)
      )

      this.setState({
        details: tempObj,
        quartiles: tempQuartiles,
        ratio: tempQuartiles[0]['value']
      })
    }
  }

  calculatePercentage = value => {
    let percent = Math.round((100 * value) / Number(this.state.ratio))
    if (percent <= 0) {
      return null
    }
    return `${percent}%`
  }

  squared = '\u00B2'

  render() {
    const isResidentalEndUse = checkIsResidentalEndUse(
      this.props.buildingUseType
    )
    return (
      <div className={styles.benchmarkAnnualUsage}>
        <div className={styles.panelHeader}>
          {!this.props.hasUtilities && (
            <h3>
              Typical Energy Usage for{' '}
              <span>{this.props.buildingUse} Buildings</span>
            </h3>
          )}
          {this.props.hasUtilities && <h3>Annual Energy Usage vs Typical</h3>}
        </div>

        <div className={styles.panelContent}>
          <div className={styles.benchmarkAnnualUsageSubHeading}>
            {/* <div className={styles.benchmarkAnnualUsageIcon}>
              <span>
                <i className="material-icons">flash_on</i>
              </span>
            </div> */}
            <div className={styles.benchmarkAnnualUsageDetails}>
              {/* {this.state.details.text &&
                <span>
                  {this.state.details.text === 'higher' &&
                    <i className="material-icons arrow_upward">arrow_upward</i>
                  }
                  {this.state.details.text === 'lower' &&
                    <i className="material-icons arrow_downward">arrow_downward</i>
                  }
                </span>
              }   */}
              {this.state.details.percentage !== '' && (
                <h1
                  className={
                    this.state.details.text === 'higher'
                      ? styles.red
                      : styles.green
                  }
                >
                  {this.state.details.percentage + '%'}
                </h1>
              )}
              {this.state.details.text !== '' && (
                <h3>
                  <span
                    className={
                      this.state.details.text === 'higher'
                        ? styles.red
                        : styles.green
                    }
                  >
                    {this.state.details.text}{' '}
                  </span>
                  than typical {this.props.buildingUse} buildings
                </h3>
              )}
              {this.state.details.text === '' && (
                <h1 className={styles.benchmarkAnnualUsageEmptyText}>
                  Empty Text
                </h1>
              )}
            </div>
          </div>
          <div className={styles.benchmarkAnnualUsageBars}>
            {[...Array(this.state.iterationCount)].map((x, i) => (
              <div key={i} className={styles.benchmarkAnnualUsageBar}>
                <div className={styles.benchmarkAnnualUsageLabel}>
                  <p>
                    {this.state.quartiles[i] && this.state.quartiles[i].name
                      ? this.state.quartiles[i].name === 'You'
                        ? this.props.hasUtilities
                          ? 'Your building'
                          : 'Similar buildings in your area'
                        : this.state.quartiles[i].name
                      : 'Loading'}
                  </p>
                </div>
                <div className={styles.benchmarkAnnualUsageSVG}>
                  <svg
                    width={
                      Object.keys(this.state.quartiles).length > 0
                        ? this.calculatePercentage(
                            this.state.quartiles[i].value
                          )
                          ? this.calculatePercentage(
                              this.state.quartiles[i].value
                            )
                          : '0'
                        : '100%'
                    }
                    height="20px"
                  >
                    <g className="bars">
                      <rect
                        className={classNames(
                          Object.keys(this.state.quartiles).length > 0
                            ? this.state.quartiles[i].name === 'You'
                              ? this.state.details.text === 'higher'
                                ? styles.red
                                : styles.green
                              : styles.gray
                            : styles.white
                        )}
                        width="100%"
                        height="40"
                      />
                    </g>
                  </svg>
                  <div>
                    <p>
                      {this.state.quartiles[i]
                        ? formatNumbersWithCommas(
                            Math.round(this.state.quartiles[i].value)
                          ) + ' kBTU'
                        : ''}
                    </p>
                    {this.props.squareFootage && (
                      <p>
                        {this.state.quartiles[i]
                          ? Number(
                              this.state.quartiles[i].value /
                                this.props.squareFootage
                            ).toFixed(2) +
                            ' kBTU/ft' +
                            this.squared
                          : ''}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        {isResidentalEndUse ? (
          <div className={styles.sourceLink}>
            *Source:
            <a
              href="https://www.eia.gov/consumption/residential/data/2015/"
              target="_blank"
            >
              RECS 2015
            </a>
          </div>
        ) : (
          <div className={styles.sourceLink}>
            *Source:
            <a
              href="https://www.eia.gov/consumption/commercial/data/2012"
              target="_blank"
            >
              CBECS 2012
            </a>
          </div>
        )}
        {/* <div className={styles.panelFooter}>
          <div
            className={styles.link}
            onClick={() => {
              this.props.handleTabChange(2, 'Utilities', true)
            }}
          >
            Add all meters to improve accuracy&nbsp;
            <i className="material-icons">keyboard_arrow_right</i>
          </div>
        </div> */}
      </div>
    )
  }
}

export default OverviewAnnualUsage
