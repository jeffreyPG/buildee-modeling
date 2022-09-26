import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { round } from 'lodash'
import styles from './OverviewEndUse.scss'
import { Loader } from 'utils/Loader'
import { formatNumbersWithCommas, checkIsResidentalEndUse } from 'utils/Utils'
import Donut2DChart from '../Chart/Donut2DChart'

const COLORS = [
  '#FFB30F',
  '#E05263',
  '#73D2DE',
  '#48A272',
  '#E57FEF',
  '#A4036F'
]

export class OverviewEndUse extends React.Component {
  static propTypes = {
    building: PropTypes.object.isRequired,
    endUse: PropTypes.object.isRequired,
    allUtilities: PropTypes.object.isRequired,
    loading: PropTypes.bool.isRequired,
    handleTabChange: PropTypes.func.isRequired,
    utilityMetrics: PropTypes.object.isRequired,
    buildingList: PropTypes.array.isRequired,
    getEndUse: PropTypes.func.isRequired,
    user: PropTypes.object.isRequired,
    getOrganizationBuildings: PropTypes.func.isRequired,
    organization: PropTypes.object.isRequired
  }

  state = {
    pieData: [],
    showExtras: false,
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
    chartData: [
      {
        label: 'Food',
        value: '28504'
      },
      {
        label: 'Apparels',
        value: '14633'
      },
      {
        label: 'Electronics',
        value: '10507'
      },
      {
        label: 'Household',
        value: '4910'
      }
    ],
    chartConfig: {
      decimals: '2',
      showpercentvalues: '1',
      showLabels: '0',
      showValues: '0',
      showVLineLabelBorder: '0',
      showLegend: '1',
      legendPosition: 'top',
      theme: 'fusion',
      legendIconSides: 4,
      legendNumColumns: 2,
      legendItemFontSize: 12,
      showToolTip: 0,
      doughnutRadius: 55,
      pieRadius: 70
    },
    chartLoading: false,
    currentEndUse: {}
  }

  UNSAFE_componentWillMount() {
    document.addEventListener('mousedown', this.handleClick, false)
  }

  componentDidMount = () => {
    if (this.props.endUse && Object.keys(this.props.endUse).length > 0) {
      this.setState(
        {
          currentEndUse: this.props.endUse
        },
        function() {
          this.transformEndUseData()
        }
      )
    }
  }

  componentDidUpdate = prevProps => {
    if (
      prevProps.endUse !== this.props.endUse ||
      prevProps.utilityMetrics !== this.props.utilityMetrics
    ) {
      if (this.props.endUse && Object.keys(this.props.endUse).length > 0) {
        this.setState(
          {
            currentEndUse: this.props.endUse
          },
          function() {
            this.transformEndUseData()
          }
        )
      }
    }
  }

  componentWillUnmount = () => {
    document.removeEventListener('mousedown', this.handleClick, false)
  }

  handleClick = e => {
    if (this.node && this.node.contains(e.target)) {
      // the click is inside, continue to menu links
      return
    }
    // otherwise, toggle (close) the dropdowns
    this.setState({ showExtras: false })
  }

  sumValues = (array, key) => {
    var total = 0
    for (var i = 0, _len = array.length; i < _len; i++) {
      total += array[i][key]
    }
    return total
  }

  transformEndUseData = () => {
    const { utilityMetrics } = this.props
    const energyType = this.state.energyTypes.value
    let pieArray = []
    let total = 0
    const endUse = this.state.currentEndUse

    const defaultEndUseLabels = [
      { name: 'computing-energy-estimate', label: 'Computing' },
      { name: 'cooking-energy-estimate', label: 'Cooking' },
      { name: 'cooling-energy-estimate', label: 'Cooling' },
      { name: 'dhw-energy-estimate', label: 'Water Heating' },
      { name: 'heating-energy-estimate', label: 'Heating' },
      { name: 'lighting-energy-estimate', label: 'Lighting' },
      { name: 'office-equipment-energy-estimate', label: 'Office Equipment' },
      { name: 'other-estimate', label: 'Other' },
      { name: 'refrigeration-energy-estimate', label: 'Refrigeration' },
      { name: 'ventilation-estimate', label: 'Ventilation' }
    ]
    const residentalEndUseLabels = [
      { name: 'dishwasher-energy-estimate', label: 'Dishwashers' },
      { name: 'heating-energy-estimate', label: 'Heating' },
      { name: 'hw-energy-estimate', label: 'Water Heating' },
      { name: 'microwave-energy-estimate', label: 'Microwaves' },
      { name: 'cooking-energy-estimate', label: 'Cooking' },
      { name: 'lighting-energy-estimate', label: 'Lighting' },
      { name: 'other-estimate', label: 'Other' },
      { name: 'refrigeration-energy-estimate', label: 'Refrigeration' },
      { name: 'freezer-energy-estimate', label: 'Freezers' },
      { name: 'pool-energy-estimate', label: 'Pools' },
      { name: 'laundry-energy-estimate', label: 'Laundry' },
      { name: 'fan-energy-estimate', label: 'Fans' },
      { name: 'tv-energy-estimate', label: 'TVs' },
      { name: 'cooling-energy-estimate', label: 'Cooling' }
    ]
    const isResidentalEndUse = checkIsResidentalEndUse(
      this.props.building.buildingUse
    )
    const endUseLabels = isResidentalEndUse
      ? residentalEndUseLabels
      : defaultEndUseLabels
    Object.entries(endUse).map(([use, analysis]) => {
      const endUseLabel = endUseLabels.find(o => o.name === use)
      if (energyType == 'energyUse') {
        if (endUseLabel && analysis.percentage && analysis.percentage > 0) {
          pieArray.push({
            label:
              endUseLabel.label +
              ' ' +
              formatNumbersWithCommas(analysis.estimated_consumption),
            value: analysis.estimated_consumption
          })
        }
      } else if (energyType == 'energyCost') {
        if (endUseLabel && analysis.percentage && analysis.percentage > 0) {
          pieArray.push({
            label:
              endUseLabel.label +
              ' ' +
              formatNumbersWithCommas(analysis.estimated_cost),
            value: analysis.estimated_cost
          })
        }
      } else if (energyType == 'electricityUse') {
        if (endUseLabel && analysis.pct_elec && analysis.pct_elec > 0) {
          pieArray.push({
            label:
              endUseLabel.label +
              ' ' +
              formatNumbersWithCommas(
                analysis.estimated_consumption * analysis.pct_elec
              ),
            value: analysis.estimated_consumption * analysis.pct_elec
          })
        }
      } else if (energyType == 'electricityCost') {
        if (endUseLabel && analysis.pct_elec && analysis.pct_elec > 0) {
          pieArray.push({
            label:
              endUseLabel.label +
              ' ' +
              formatNumbersWithCommas(
                analysis.estimated_cost * analysis.pct_elec
              ),
            value: analysis.estimated_cost * analysis.pct_elec
          })
        }
      } else if (energyType == 'naturalGasUse') {
        if (endUseLabel && analysis.pct_gas && analysis.pct_gas > 0) {
          pieArray.push({
            label:
              endUseLabel.label +
              ' ' +
              formatNumbersWithCommas(
                analysis.estimated_consumption * analysis.pct_gas
              ),
            value: analysis.estimated_consumption * analysis.pct_gas
          })
        }
      } else if (energyType == 'naturalGasCost') {
        if (endUseLabel && analysis.pct_gas && analysis.pct_gas > 0) {
          pieArray.push({
            label:
              endUseLabel.label +
              ' ' +
              formatNumbersWithCommas(
                analysis.estimated_cost * analysis.pct_gas
              ),
            value: analysis.estimated_cost * analysis.pct_gas
          })
        }
      }
      pieArray = pieArray.filter(item => !!item.value)
    })

    pieArray = pieArray.sort((a, b) => b.value - a.value)
    pieArray.forEach(pieItem => {
      total += pieItem.value * 1
    })
    this.setState({
      chartConfig: {
        ...this.state.chartConfig,
        defaultCenterLabel: 'Total ' + formatNumbersWithCommas(total)
      }
    })

    this.setState({ pieData: pieArray })
  }

  renderCustomizedLegend = props => {
    const { payload } = props
    return (
      <div className={styles.rechartsLegend}>
        {payload.map((entry, index) => {
          const { value, color, payload } = entry
          return (
            <div key={index} className={styles.rechartsLegendSingle}>
              <svg xmlns='http://www.w3.org/2000/svg' height='15' width='15'>
                <circle cx='8' cy='8' r='5' fill={color} />
              </svg>
              <span>{value}</span>
              <h3>{round(payload.percent * 100, 2)}%</h3>
            </div>
          )
        })}
      </div>
    )
  }

  handleToggleToolTip = () => {
    this.setState(prevState => ({
      showExtras: !prevState.showExtras
    }))
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
        this.transformEndUseData()
      }
    )
  }

  handleChangeBuildingDropdown = async e => {
    this.setState({
      chartLoading: true
    })
    let newEndUse = {}
    const buildingType = e.target.value
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
        this.transformEndUseData()
      }
    )
    this.setState({
      chartLoading: false
    })
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

  render() {
    const {
      pieData,
      showExtras,
      energyTypes,
      buildingTypes,
      chartLoading
    } = this.state
    const { loading } = this.props

    const isResidentalEndUse = checkIsResidentalEndUse(
      this.props.building.buildingUse
    )

    return (
      <div className={styles.utilityEnduse}>
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
          {pieData &&
            pieData.length > 0 &&
            loading === false &&
            chartLoading === false && (
              <div className={styles.utilityEnduseChart}>
                <Donut2DChart
                  chartConfig={this.state.chartConfig}
                  data={pieData}
                ></Donut2DChart>
              </div>
            )}

          {pieData && pieData.length == 0 && loading === false && (
            <div className={styles.utilityEnduseError}>
              <p>End Use is not currently available.</p>
            </div>
          )}

          {(loading === true || chartLoading === true) && <Loader />}
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
              this.props.handleTabChange(5, 'Assets', true)
            }}
          >
            Add assets to learn how your building performs&nbsp;
            <i className="material-icons">keyboard_arrow_right</i>
          </div>
        </div> */}
      </div>
    )
  }
}

export default OverviewEndUse
