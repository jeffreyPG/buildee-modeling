import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import styles from './OverviewAnnualCost.scss'
import { formatNumbersWithCommas, checkIsResidentalEndUse } from 'utils/Utils'

export class OverviewAnnualCost extends React.Component {
  static propTypes = {
    endUse: PropTypes.object.isRequired,
    squareFootage: PropTypes.number,
    buildingUse: PropTypes.string.isRequired,
    hasUtilities: PropTypes.bool,
    handleTabChange: PropTypes.func.isRequired,
    buildingList: PropTypes.array.isRequired,
    getEndUse: PropTypes.func.isRequired,
    user: PropTypes.object.isRequired,
    getOrganizationBuildings: PropTypes.func.isRequired,
    organization: PropTypes.object.isRequired,
    building: PropTypes.object.isRequired
  }

  state = {
    showExtras: false,
    iterationCount: 4,
    quartiles: [],
    ratio: '',
    details: {
      percentage: '',
      text: ''
    },
    energyTypes: {
      value: 'energyUse',
      options: [
        {
          value: 'energyUse',
          label: 'Energy Use'
        },
        {
          value: 'energyCost',
          label: 'Energy Cost'
        },
        {
          value: 'electricityUse',
          label: 'Electricity Use'
        },
        {
          value: 'electricityCost',
          label: 'Electricity Cost'
        },
        {
          value: 'naturalGasUse',
          label: 'Natural Gas Use'
        },
        {
          value: 'naturalGasCost',
          label: 'Natural Gas Cost'
        }
      ]
    },
    buildingTypes: {
      value: 'typicalBuildings',
      options: [
        {
          value: 'typicalBuildings',
          label: 'Typical Buildings'
        },
        {
          value: 'currentOrgBuildings',
          label: 'My Buildings of the Same Type in This Organization'
        },
        {
          value: 'allOrgBuildings',
          label: 'My Buildings of the Same Type in All of my Organizations'
        }
      ]
    },
    mainPreUnit: '',
    mainSufUnit: '',
    subPreUnit: '',
    subSufUnit: '',
    currentEndUse: {}
  }

  componentDidMount = () => {
    if (this.props.endUse && Object.keys(this.props.endUse).length > 0) {
      this.setState(
        {
          currentEndUse: this.props.endUse
        },
        function() {
          this.structureEndUses()
        }
      )
    }
  }

  componentDidUpdate = prevProps => {
    if (prevProps.endUse !== this.props.endUse) {
      this.setState(
        {
          currentEndUse: this.props.endUse
        },
        function() {
          this.structureEndUses()
        }
      )
    }
  }

  structureEndUses = () => {
    if (
      this.state.currentEndUse &&
      Object.keys(this.state.currentEndUse).length > 0 &&
      this.state.currentEndUse['total-energy-estimate']
    ) {
      const energyType = this.state.energyTypes.value
      let tempQuartiles = []
      if (energyType == 'energyUse') {
        tempQuartiles = [
          {
            name: 'Median',
            value: this.state.currentEndUse['total-energy-estimate'][
              'quantile-50'
            ]
          },
          {
            name: '75th percentile',
            value: this.state.currentEndUse['total-energy-estimate'][
              'quantile-75'
            ]
          },
          {
            name: '90th percentile',
            value: this.state.currentEndUse['total-energy-estimate'][
              'quantile-90'
            ]
          },
          {
            name: 'You',
            value: this.state.currentEndUse['total-energy-estimate'][
              'estimated_consumption'
            ]
          }
        ]
        this.setState({
          mainPreUnit: '',
          mainSufUnit: 'kBTU',
          subPreUnit: '',
          subSufUnit: 'kBTU/ft²'
        })
      } else if (energyType == 'energyCost') {
        tempQuartiles = [
          {
            name: 'Median',
            value: this.state.currentEndUse['cost-estimate']['quantile-50']
          },
          {
            name: '75th percentile',
            value: this.state.currentEndUse['cost-estimate']['quantile-75']
          },
          {
            name: '90th percentile',
            value: this.state.currentEndUse['cost-estimate']['quantile-90']
          },
          {
            name: 'You',
            value: this.state.currentEndUse['cost-estimate'][
              'estimated_consumption'
            ]
          }
        ]
        this.setState({
          mainPreUnit: '$',
          mainSufUnit: '',
          subPreUnit: '$',
          subSufUnit: '/ft²'
        })
      } else if (energyType == 'electricityUse') {
        tempQuartiles = [
          {
            name: 'Median',
            value: this.state.currentEndUse['electric-energy-estimate'][
              'quantile-50'
            ]
          },
          {
            name: '75th percentile',
            value: this.state.currentEndUse['electric-energy-estimate'][
              'quantile-75'
            ]
          },
          {
            name: '90th percentile',
            value: this.state.currentEndUse['electric-energy-estimate'][
              'quantile-90'
            ]
          },
          {
            name: 'You',
            value: this.state.currentEndUse['electric-energy-estimate'][
              'estimated_consumption'
            ]
          }
        ]
        this.setState({
          mainPreUnit: '',
          mainSufUnit: 'kBTU',
          subPreUnit: '',
          subSufUnit: 'kBTU/ft²'
        })
      } else if (energyType == 'electricityCost') {
        tempQuartiles = [
          {
            name: 'Median',
            value: this.state.currentEndUse['electric-cost-estimate'][
              'quantile-50'
            ]
          },
          {
            name: '75th percentile',
            value: this.state.currentEndUse['electric-cost-estimate'][
              'quantile-75'
            ]
          },
          {
            name: '90th percentile',
            value: this.state.currentEndUse['electric-cost-estimate'][
              'quantile-90'
            ]
          },
          {
            name: 'You',
            value: this.state.currentEndUse['electric-cost-estimate'][
              'estimated_consumption'
            ]
          }
        ]
        this.setState({
          mainPreUnit: '$',
          mainSufUnit: '',
          subPreUnit: '$',
          subSufUnit: '/ft²'
        })
      } else if (energyType == 'naturalGasUse') {
        tempQuartiles = [
          {
            name: 'Median',
            value: this.state.currentEndUse['gas-energy-estimate'][
              'quantile-50'
            ]
          },
          {
            name: '75th percentile',
            value: this.state.currentEndUse['gas-energy-estimate'][
              'quantile-75'
            ]
          },
          {
            name: '90th percentile',
            value: this.state.currentEndUse['gas-energy-estimate'][
              'quantile-90'
            ]
          },
          {
            name: 'You',
            value: this.state.currentEndUse['gas-energy-estimate'][
              'estimated_consumption'
            ]
          }
        ]
        this.setState({
          mainPreUnit: '',
          mainSufUnit: 'kBTU',
          subPreUnit: '',
          subSufUnit: 'kBTU/ft²'
        })
      } else if (energyType == 'naturalGasCost') {
        tempQuartiles = [
          {
            name: 'Median',
            value: this.state.currentEndUse['gas-cost-estimate']['quantile-50']
          },
          {
            name: '75th percentile',
            value: this.state.currentEndUse['gas-cost-estimate']['quantile-75']
          },
          {
            name: '90th percentile',
            value: this.state.currentEndUse['gas-cost-estimate']['quantile-90']
          },
          {
            name: 'You',
            value: this.state.currentEndUse['gas-cost-estimate'][
              'estimated_consumption'
            ]
          }
        ]
        this.setState({
          mainPreUnit: '$',
          mainSufUnit: '',
          subPreUnit: '$',
          subSufUnit: '/ft²'
        })
      }

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

  handleChangeEnergyDropdown = e => {
    const energyType = e.target.value
    this.setState(
      {
        energyTypes: {
          ...this.state.energyTypes,
          value: energyType
        }
      },
      function() {
        this.structureEndUses()
      }
    )
  }

  handleChangeBuildingDropdown = async e => {
    const buildingType = e.target.value
    let newEndUse = {}
    this.setState({
      buildingTypes: {
        ...this.state.buildingTypes,
        value: buildingType
      }
    })
    if (buildingType == 'currentOrgBuildings') {
      newEndUse = await this.createNewEndUse(this.props.buildingList)
    } else if (buildingType == 'typicalBuildings') {
      newEndUse = this.props.endUse
    } else if (buildingType == 'allOrgBuildings') {
      const orgIds = this.props.user.orgIds
      let buildingList = []
      for (let i = 0; i < orgIds.length; i++) {
        const buildings = await this.props.getOrganizationBuildings(
          this.props.organization._id
        )
        buildingList = buildingList.concat(buildings)
      }
      newEndUse = await this.createNewEndUse(buildingList)
    }

    this.setState(
      {
        currentEndUse: newEndUse
      },
      function() {
        this.structureEndUses()
      }
    )
  }

  createNewEndUse = async buildingList => {
    const buildingUse = this.props.building.buildingUse
    let orgBuildings = []
    let newEndUse = {}
    for (let i = 0; i < buildingList.length; i++) {
      const el = buildingList[i]
      if (!el.archived && el.info.buildingUse == buildingUse) {
        orgBuildings.push(el)
      }
    }

    const arrayLeng = orgBuildings.length

    for (let i = 0; i < orgBuildings.length; i++) {
      const el = orgBuildings[i]
      if (!el.archived && el.info.buildingUse == buildingUse) {
        await this.props.getEndUse(el._id).then(endUse => {
          for (const key in endUse) {
            if (endUse.hasOwnProperty(key) && typeof endUse[key] === 'object') {
              if (!newEndUse[key]) {
                newEndUse[key] = {}
              }
              for (const subKey in endUse[key]) {
                if (endUse[key].hasOwnProperty(subKey)) {
                  const elValue = endUse[key][subKey]
                  if (!newEndUse[key][subKey]) {
                    newEndUse[key][subKey] = 0
                  }
                  newEndUse[key][subKey] += elValue / arrayLeng
                }
              }
            }
          }
        })
      }
    }

    return newEndUse
  }

  handleToggleToolTip = () => {
    this.setState(prevState => ({
      showExtras: !prevState.showExtras
    }))
  }

  squared = '\u00B2'

  render() {
    const {
      showExtras,
      energyTypes,
      buildingTypes,
      mainPreUnit,
      mainSufUnit,
      subPreUnit,
      subSufUnit
    } = this.state
    const isResidentalEndUse = checkIsResidentalEndUse(
      this.props.buildingUseType
    )
    return (
      <div className={styles.benchmarkAnnualCost}>
        <div className={classNames(styles.panelContent, styles.relative)}>
          <div className={styles.chartSetting}>
            <div className={styles.selectContainer}>
              <select
                onChange={e => this.handleChangeEnergyDropdown(e)}
                value={energyTypes.value}
                name='EnergyTypes'
                id='EnergyTypes'
              >
                <option defaultValue value='' disabled>
                  Select Energy Type
                </option>
                {energyTypes.options.map((item, i) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>
            <div>vs</div>
            <div className={styles.selectContainer}>
              <select
                onChange={e => this.handleChangeBuildingDropdown(e)}
                value={buildingTypes.value}
                name='BuildingTypes'
                id='BuildingTypes'
              >
                <option defaultValue value='' disabled>
                  Select Building Type
                </option>
                {buildingTypes.options.map((item, i) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className={styles.benchmarkAnnualCostDetails}>
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
              <h3
                className={
                  this.state.details.text === 'higher'
                    ? styles.red
                    : styles.green
                }
              >
                {this.state.details.percentage + '%'}
              </h3>
            )}
            {this.state.details.text !== '' && (
              <h5>
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
              </h5>
            )}
            {this.state.details.text === '' && (
              <h3 className={styles.benchmarkAnnualCostEmptyText}>
                Empty Text
              </h3>
            )}
          </div>
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
                <h3>Learn more about benchmarking with buildee here</h3>
              </div>
            </div>
          </div>
          <div className={styles.benchmarkAnnualCostBars}>
            {[...Array(this.state.iterationCount)].map((x, i) => (
              <div key={i} className={styles.benchmarkAnnualCostBar}>
                <div className={styles.benchmarkAnnualCostLabel}>
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
                <div className={styles.benchmarkAnnualCostSVG}>
                  <div className={styles.chartImage}>
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
                      height='20'
                    >
                      <g className='bars'>
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
                          width='100%'
                          height='20'
                        />
                      </g>
                    </svg>
                    <div className={styles.chartCurrentLabel}>
                      <p>
                        {this.state.quartiles[i]
                          ? mainPreUnit +
                            formatNumbersWithCommas(
                              Math.round(this.state.quartiles[i].value)
                            ) +
                            mainSufUnit
                          : ''}
                      </p>
                      {this.props.squareFootage && (
                        <p>
                          &nbsp; (
                          {this.state.quartiles[i]
                            ? subPreUnit +
                              Number(
                                this.state.quartiles[i].value /
                                  this.props.squareFootage
                              ).toFixed(2) +
                              subSufUnit
                            : ''}
                          )
                        </p>
                      )}
                    </div>
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
              href='https://www.eia.gov/consumption/residential/data/2015/'
              target='_blank'
            >
              RECS 2015
            </a>
          </div>
        ) : (
          <div className={styles.sourceLink}>
            *Source:
            <a
              href='https://www.eia.gov/consumption/commercial/data/2012'
              target='_blank'
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

export default OverviewAnnualCost
