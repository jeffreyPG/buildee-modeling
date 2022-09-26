import React from 'react'
import PropTypes from 'prop-types'
import { Loader } from 'utils/Loader'
import {
  defaultUtilUnitsFromType,
  formatHyphenNotationLabel
} from 'utils/Utils'
import { roundSignificantNumbers } from '../Utility/UtilityHelpers'

import classNames from 'classnames'
import styles from './TrendVisualization.scss'
import vizStyles from '../Visualization/Visualization.scss'

export class TrendLEANAnalysis extends React.Component {
  static propTypes = {
    utilityName: PropTypes.string.isRequired,
    buildingConsumption: PropTypes.object.isRequired,
    organization: PropTypes.object.isRequired,
    checkedOrganizations: PropTypes.array.isRequired,
    heatMapData: PropTypes.object.isRequired,
    handleOrganizationIdCheck: PropTypes.func.isRequired,
    reRunLeanScores: PropTypes.func.isRequired,
    organizationSelections: PropTypes.array.isRequired
  }

  state = {
    leanScores: {
      baseload: '',
      cooling_change_point: '',
      cooling_sensitivity: '',
      heating_change_point: '',
      heating_sensitivity: ''
    }
  }

  componentDidMount = () => {
    this.findLeanScores()
  }

  componentDidUpdate = prevProps => {
    if (prevProps.heatMapData !== this.props.heatMapData) {
      this.findLeanScores()
    }
  }

  handleToggleOrgs = () => {
    this.setState(prevState => ({ showOrgs: !prevState.showOrgs }))
    this.props.reRunLeanScores(this.state.showOrgs)
  }

  findLeanScores() {
    const { heatMapData, buildingConsumption } = this.props
    let tempLeanScore = { ...this.state.leanScores }
    let leanScore = 0

    if (heatMapData && buildingConsumption) {
      Object.keys(heatMapData).forEach(key => {
        if (key !== 'results' && key !== 'data' && key !== 'fit') {
          // if there are any points in the array
          if (heatMapData[key].length > 4) {
            // sort the array first
            let sortedArray
            if (key === 'cooling_change_point') {
              sortedArray = heatMapData[key].sort((a, b) => a - b)
            } else {
              sortedArray = heatMapData[key].sort((a, b) => b - a)
            }
            // find the same key in the current building consumption object
            // get the position in array
            let curPosition = sortedArray.indexOf(buildingConsumption[key])
            // find lean score from current position, and assign it to the scores in state
            leanScore = (curPosition / heatMapData[key].length) * 100
            tempLeanScore[key] = leanScore
            this.setState({ leanScores: tempLeanScore })
          } else {
            tempLeanScore[key] =
              'Please add more change point data for more buildings to get an accurate result for the ' +
              this.formatUnderscoreNotationLabel(key) +
              '.'
            this.setState({ leanScores: tempLeanScore })
          }
        }
      })
    }
  }

  formatUnderscoreNotationLabel = field => {
    var ret = [],
      tmp
    field.split('_').map(ele => {
      tmp = ele.replace(/([A-Z])/g, ' $1')
      ret.push(tmp.charAt(0).toUpperCase() + tmp.slice(1))
    })
    return ret.join(' ')
  }

  renderHeatMaps = () => {
    const { heatMapData, buildingConsumption, utilityName } = this.props
    const { leanScores } = this.state

    return Object.keys(leanScores).map((key, index) => {
      // no data
      if (typeof leanScores[key] === 'string' || leanScores[key] === '') {
        return (
          <div key={index} className={styles.visualization}>
            <div className={vizStyles.visualizationHeading}>
              <p>{this.formatUnderscoreNotationLabel(key)} - </p>
              <p>
                <small>
                  {leanScores[key] || 'No data available for this metric.'}
                </small>
              </p>
            </div>
          </div>
        )
      } else if (typeof leanScores[key] === 'number') {
        return (
          <div key={index} className={styles.visualization}>
            <div className={vizStyles.visualizationHeading}>
              <p>
                {this.formatUnderscoreNotationLabel(key)} -
                {' ' + roundSignificantNumbers(buildingConsumption[key], 2)}
                {key.includes('change_point')
                  ? '°F'
                  : ` ${defaultUtilUnitsFromType(utilityName)}/ft² per day`}
              </p>
            </div>
            <div className={styles.visualizationBar}>
              <svg className={vizStyles.visualizationHeatMap} height="20">
                <g>
                  <g>
                    <rect
                      x={`${leanScores[key]}%`}
                      width="6px"
                      height="20"
                      fill="black"
                    />
                  </g>
                </g>
              </svg>
            </div>
            <div className={vizStyles.visualizationLabels}>
              <div className={vizStyles.visualizationLabel}>Worst</div>
              <div className={vizStyles.visualizationLabel}>Median</div>
              <div className={vizStyles.visualizationLabel}>Best</div>
            </div>
          </div>
        )
      }
    })
  }

  render() {
    const {
      utilityName,
      organizationSelections,
      checkedOrganizations
    } = this.props

    return (
      <div className={classNames(styles.trendLEANAnalysis, styles.panel)}>
        <div className={styles.panelHeader}>
          <h3>{formatHyphenNotationLabel(utilityName)} - LEAN</h3>
        </div>

        {organizationSelections && organizationSelections.length > 0 && (
          <div className={styles.orgSelect}>
            <div
              className={styles.orgSelectHeader}
              onClick={this.handleToggleOrgs}
            >
              <small>
                {this.state.showOrgs ? 'Apply' : 'Select'} Organizations
                {this.state.showOrgs ? (
                  <i className="material-icons">expand_less</i>
                ) : (
                  <i className="material-icons">expand_more</i>
                )}
              </small>
            </div>
            {this.state.showOrgs && (
              <div
                className={classNames(
                  styles.panelContent,
                  styles.orgSelectContent,
                  styles.checkboxContainer
                )}
              >
                {organizationSelections.map((org, index) => {
                  let checked = false
                  let disabled = false
                  let currentOrg = false
                  if (org._id === this.props.organization._id) {
                    checked = true
                    disabled = true
                    currentOrg = true
                  }
                  if (checkedOrganizations.includes(org._id)) {
                    checked = true
                  }
                  return (
                    <label key={index}>
                      <input
                        defaultChecked={checked}
                        disabled={disabled}
                        value={org._id}
                        onChange={e => this.props.handleOrganizationIdCheck(e)}
                        className={classNames(
                          checked ? styles['checked'] : '',
                          currentOrg ? styles['currentOrg'] : ''
                        )}
                        type="checkbox"
                        name="organizations"
                      />
                      <span />
                      <small>
                        {org.name}
                        {currentOrg ? ' (current organization)' : ''}
                      </small>
                    </label>
                  )
                })}
              </div>
            )}
          </div>
        )}

        <div className={styles.panelContent}>{this.renderHeatMaps()}</div>
      </div>
    )
  }
}

export default TrendLEANAnalysis
