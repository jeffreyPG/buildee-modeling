import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import _ from 'lodash'
import styles from './OverviewUtilitySummary.scss'
import { Loader } from 'utils/Loader'
import { formatNumbersWithCommas, defaultUtilUnitsFromType } from 'utils/Utils'
import { OverviewSettingModal } from '../../containers/Modal'
import { getYearList } from '../Utility/UtilityHelpers'
import StackedChart from '../Chart/StackedChart'
import ToolTip from 'components/ToolTip'
import TimeRangeBuilding from '../UI/TimeRangeBuilding'

export class OverviewUtilitySummary extends React.Component {
  static propTypes = {
    building: PropTypes.object.isRequired,
    allUtilities: PropTypes.object.isRequired,
    utilityMetrics: PropTypes.object.isRequired,
    lastTwelveUtilityMetrics: PropTypes.object.isRequired,
    endUse: PropTypes.object.isRequired,
    loading: PropTypes.bool.isRequired,
    activeDates: PropTypes.object.isRequired,
    handleTabChange: PropTypes.func.isRequired,
    editBuilding: PropTypes.func.isRequired,
    originMonthlyUtilities: PropTypes.array.isRequired,
    changeReRunProjects: PropTypes.func.isRequired,
    yearsCovered: PropTypes.array.isRequired
  }

  state = {
    emissionsError: '',
    openOverviewSettingModal: false,
    recentFullCalendarYear: '',
    baseline: {
      costPerSqFoot: 0,
      eui: 0,
      totalCost: 0,
      totalEnergyCost: 0,
      totalEneryUsage: 0,
      totalUtilUsages: {},
      totalWaterCost: 0,
      ghg: 0
    },
    yearList: [],
    baselineYear: '',
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
    categories: [],
    dataset: [],
    chartConfig: {
      usePlotGradientColor: '0',
      showBorder: 0,
      legendPosition: 'bottom-left',
      legendAllowDrag: '1',
      theme: 'fusion',
      showValues: 1,
      valuePosition: 'inside',
      legendItemFontSize: '12',
      valueFontSize: '9',
      valueFontBold: '1',
      valueFontColor: '#FFFFFF',
      palettecolors: 'FFB30F, E05263, 203765, 48A272, E57FEF, A4036F'
    },
    chartYearlist: [],
    visualizationOptions: [
      {
        value: 'energyUse',
        label: 'Energy Use Breakdown'
      },
      {
        value: 'energyCost',
        label: 'Energy Cost Breakdown'
      },
      {
        value: 'utilityCost',
        label: 'Utility Cost Breakdown'
      },
      {
        value: 'ghg',
        label: 'GHG Emissions Breakdown'
      }
    ],
    chartType: 'energyUse',
    showTimeRange: false,
    timeRange: {
      type: 'Calendar',
      start: '',
      end: ''
    }
  }

  componentDidMount = async () => {
    if (this.props.building.rates) {
      let tempRates = Object.assign(
        {},
        this.state.rates,
        this.props.building.rates
      )
      this.setState({ rates: tempRates })
    }

    await this.getRecentFullCalendarYear()
    await this.getDefaultBaseline()
    this.createChartData()
  }

  componentDidUpdate = prevProps => {
    if (this.props.yearsCovered !== prevProps.yearsCovered) {
      const yearsCovered = this.props.yearsCovered
      this.setState({
        timeRange: {
          type: 'Calendar',
          start: yearsCovered[0],
          end: yearsCovered[0] * 1 + 2
        }
      })

      this.setState({
        chartYearlist: [yearsCovered[0], yearsCovered[1], yearsCovered[2]]
      })
    }
  }

  handleUpdateEmissions = totalUtilUsages => {
    const { rates } = this.state
    const utilityTypes = this.getUtilityTypes(this.props.monthlyUtilities)

    let totalEmissions = 0
    let electricityEmissions = 0
    let naturalGasEmissions = 0
    let steamEmissions = 0
    let fuelOil2Emissions = 0
    let fuelOil4Emissions = 0
    let fuelOil56Emissions = 0
    let dieselEmissions = 0

    let electricGHGFactor =
      rates && rates.electricGHG ? rates.electricGHG : 0.000744
    let gasGHGFactor = rates && rates.gasGHG ? rates.gasGHG : 0.0053
    let steamGHGFactor = rates && rates.steamGHG ? rates.steamGHG : 0
    let fuelOil2GHGFactor =
      rates && rates.fuelOil2GHG ? rates.fuelOil2GHG : 0.01021
    let fuelOil4GHGFactor =
      rates && rates.fuelOil4GHG ? rates.fuelOil4GHG : 0.01096
    let fuelOil56GHGFactor =
      rates && rates.fuelOil56GHG ? rates.fuelOil56GHG : 0.01021
    let dieselGHGFactor = rates && rates.dieselGHG ? rates.dieselGHG : 0.01021

    // check for missing data
    if (utilityTypes.length === 0 || this.checkEmptyStateForGHG(utilityTypes)) {
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

    return totalEmissions || 0
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

  handleRemoveDashes = str => {
    return str.replace(/-/g, ' ')
  }

  handleCapitalizeWords = str => {
    return str.replace(/\w\S*/g, function(txt) {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    })
  }

  handleFormatName = utilName => {
    if (utilName === 'fuel-oil-5-6') {
      return 'Fuel Oil 5 & 6'
    } else if (utilName === 'electric') {
      return 'Electricity'
    }
    return this.handleCapitalizeWords(this.handleRemoveDashes(utilName))
  }

  renderUtilSummary = util => {
    const { totalUtilUsages } = this.props.utilityMetrics
    const { building } = this.props
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
            {defaultUtilUnitsFromType(util)}
          </h2>
        </div>
        <div>
          <p>Blended Rate</p>
          <h2>
            ${rates[utiltyMap[util]] ? _.round(rates[utiltyMap[util]], 4) : 0}/
            {defaultUtilUnitsFromType(util)}
          </h2>
        </div>
      </div>
    )
  }

  checkEmptyState = () => {
    const { allUtilities } = this.props
    const keys = (allUtilities && Object.keys(allUtilities)) || []
    return keys.length === 0
  }

  checkEmptyStateForGHG = types => {
    const utilityTypes = types
      .map(item => {
        if (item === 'natural-gas') return 'gas'
        return item
      })
      .filter(item => item !== 'water')
    return utilityTypes.length === 0
  }

  openOverviewSettingModal = action => {
    this.setState({ openOverviewSettingModal: action })
  }

  getRecentFullCalendarYear = () => {
    let fullCalendarYear = ''
    let yearList = []
    const fullMonthlyUtilities = this.props.originMonthlyUtilities

    let counts = {}
    fullMonthlyUtilities.forEach(function(el) {
      const year = el.year
      counts[year] = (counts[year] || 0) + 1
    })

    for (let k in counts) {
      yearList.push(k)
      if (counts[k] == 12) {
        fullCalendarYear = k
      }
    }

    this.setState({
      recentFullCalendarYear: fullCalendarYear,
      yearList: yearList
    })
  }

  getDefaultBaseline = () => {
    const recentFullCalendarYear = this.state.recentFullCalendarYear
    let that = this
    this.getYearBaseline([recentFullCalendarYear]).then(function(result) {
      that.setState({ baseline: result })
    })
    this.setState({
      baselineYear: recentFullCalendarYear
    })
  }

  getYearBaseline = years => {
    const yearLength = years.length
    let monthlyUtilities = []
    this.props.originMonthlyUtilities.forEach(el => {
      if (years.includes(el.year)) {
        monthlyUtilities.push(el)
      }
    })

    return new Promise(resolve => {
      let totalUtilityCosts = 0
      let totalUtilityWaterCosts = 0
      let totalUtilUsages = {}
      let totalUtilCosts = {}
      let totalUtilGhg = {}
      let totalEneryUsage = 0
      let utilityTypes = [
        'electric',
        'natural-gas',
        'water',
        'steam',
        'fuel-oil-2',
        'fuel-oil-4',
        'fuel-oil-5-6',
        'diesel',
        'other'
      ]
      monthlyUtilities.forEach(monthlyUtility => {
        totalEneryUsage += monthlyUtility.totalEnergy?.value || 0
        totalUtilityCosts += monthlyUtility.totalCost || 0
        totalUtilityWaterCosts += monthlyUtility.water.totalCost || 0
        utilityTypes.forEach(utilityName => {
          let data = {}
          if (utilityName === 'electric') {
            data = monthlyUtility['electric']
          }
          if (utilityName === 'natural-gas') {
            data = monthlyUtility['naturalgas']
          }
          if (utilityName === 'water') {
            data = monthlyUtility['water']
          }
          if (utilityName === 'steam') {
            data = monthlyUtility['steam']
          }
          if (utilityName === 'fuel-oil-2') {
            data = monthlyUtility['fueloil2']
          }
          if (utilityName === 'fuel-oil-4') {
            data = monthlyUtility['fueloil4']
          }
          if (utilityName === 'fuel-oil-5-6') {
            data = monthlyUtility['fueloil56']
          }
          if (utilityName === 'diesel') {
            data = monthlyUtility['diesel']
          }
          if (utilityName === 'other') {
            data = monthlyUtility['other']
          }
          if (totalUtilUsages[utilityName] === undefined) {
            totalUtilUsages[utilityName] = 0
          }
          if (totalUtilCosts[utilityName] === undefined) {
            totalUtilCosts[utilityName] = 0
          }
          if (totalUtilGhg[utilityName] === undefined) {
            totalUtilGhg[utilityName] = 0
          }
          let totalUsage = data.kbtu || 0
          let totalCost = data.totalCost || 0
          let totalGhg = data.ghg || 0
          totalUtilUsages[utilityName] += totalUsage / yearLength
          totalUtilCosts[utilityName] += totalCost / yearLength
          totalUtilGhg[utilityName] += totalGhg / yearLength
        })
      })

      const ghg = this.handleUpdateEmissions(totalUtilUsages)

      let utilityMetrics = {
        totalCost: Math.round(totalUtilityCosts / yearLength),
        totalWaterCost: Math.round(totalUtilityWaterCosts / yearLength),
        totalEnergyCost: Math.round(
          (totalUtilityCosts - totalUtilityWaterCosts) / yearLength
        ),
        costPerSqFoot:
          Math.round(
            ((totalUtilityCosts / this.props.building.squareFeet) * 100) /
              yearLength
          ) / 100,
        totalUtilUsages: totalUtilUsages,
        totalUtilCosts: totalUtilCosts,
        totalUtilGhg: totalUtilGhg,
        totalEneryUsage: totalEneryUsage / yearLength,
        eui: (
          totalEneryUsage /
          this.props.building.squareFeet /
          yearLength
        ).toFixed(2),
        ghg: ghg.toFixed(2)
      }

      return resolve(utilityMetrics)
    })
  }

  renderBaseLine = (lastValue, baseline, isUnit) => {
    return (
      <div className={styles.baseline}>
        {lastValue < baseline && (
          <span className={styles.downValue}>
            <i className={classNames(styles.materialIcons, 'material-icons')}>
              arrow_downward
            </i>
            {isUnit ? '$' : ' '}
            {Math.abs(lastValue - baseline).toFixed(2)}
          </span>
        )}
        {lastValue == baseline && (
          <span className={styles.sameValue}>
            {isUnit ? '$' : ' '}
            {Math.abs(lastValue - baseline).toFixed(2)}
          </span>
        )}
        {lastValue > baseline && (
          <span className={styles.largeValue}>
            <i className={classNames(styles.materialIcons, 'material-icons')}>
              arrow_upward
            </i>
            {isUnit ? '$' : ' '}
            {Math.abs(lastValue - baseline).toFixed(2)}
          </span>
        )}
      </div>
    )
  }

  applySetting = async option => {
    const yearList = getYearList(option.timeRange.start, option.timeRange.end)
    let that = this
    this.getYearBaseline(yearList).then(function(result) {
      that.setState({ baseline: result })
    })
    this.openOverviewSettingModal(false)
    if (yearList.length > 1) {
      await this.setState({
        baselineYear: option.timeRange.start + ' ~ ' + option.timeRange.end
      })
    } else {
      await this.setState({
        baselineYear: option.timeRange.start
      })
    }

    await this.setState({
      rates: option.rates
    })

    this.createChartData()
  }

  createChartData = async () => {
    let categories = []
    let category = []
    const chartYearlist = this.state.chartYearlist
    let utilityArray = []
    let dataset = [
      {
        seriesname: 'Electricity',
        data: []
      },
      {
        seriesname: 'Diesel',
        data: []
      },
      {
        seriesname: 'Fuel Oil 2',
        data: []
      },
      {
        seriesname: 'Fuel Oil 4',
        data: []
      },
      {
        seriesname: 'Fuel Oil 5 & 6',
        data: []
      },
      {
        seriesname: 'Natural Gas',
        data: []
      }
    ]
    category.push({
      label: this.state.baselineYear
    })

    chartYearlist.forEach(el => {
      category.push({
        label: el
      })
    })

    categories.push({
      category: category
    })

    this.setState({
      categories: categories
    })

    if (this.state.chartType == 'energyUse') {
      utilityArray.push(this.state.baseline.totalUtilUsages)
      for (let i = 0; i < chartYearlist.length; i++) {
        await this.getYearBaseline([chartYearlist[i]]).then(function(result) {
          utilityArray.push(result.totalUtilUsages)
        })
      }
    } else if (this.state.chartType == 'energyCost') {
      utilityArray.push(this.state.baseline.totalUtilCosts)
      for (let i = 0; i < chartYearlist.length; i++) {
        await this.getYearBaseline([chartYearlist[i]]).then(function(result) {
          utilityArray.push(result.totalUtilCosts)
        })
      }
    } else if (this.state.chartType == 'utilityCost') {
      dataset.push({
        seriesname: 'Water',
        valueFontColor: '#FFFFFF',
        data: []
      })

      utilityArray.push(this.state.baseline.totalUtilCosts)
      for (let i = 0; i < chartYearlist.length; i++) {
        await this.getYearBaseline([chartYearlist[i]]).then(function(result) {
          utilityArray.push(result.totalUtilCosts)
        })
      }
    } else if (this.state.chartType == 'ghg') {
      utilityArray.push(this.state.baseline.totalUtilGhg)
      for (let i = 0; i < chartYearlist.length; i++) {
        await this.getYearBaseline([chartYearlist[i]]).then(function(result) {
          utilityArray.push(result.totalUtilGhg)
        })
      }
    }

    utilityArray.forEach(el => {
      for (var key in el) {
        if (el.hasOwnProperty(key)) {
          if (key === 'electric') {
            dataset
              .find(x => x.seriesname == 'Electricity')
              .data.push({
                value: el[key]
              })
          }
          if (key === 'diesel') {
            dataset
              .find(x => x.seriesname == 'Diesel')
              .data.push({
                value: el[key]
              })
          }
          if (key === 'fuel-oil-2') {
            dataset
              .find(x => x.seriesname == 'Fuel Oil 2')
              .data.push({
                value: el[key]
              })
          }
          if (key === 'fuel-oil-4') {
            dataset
              .find(x => x.seriesname == 'Fuel Oil 4')
              .data.push({
                value: el[key]
              })
          }
          if (key === 'fuel-oil-5-6') {
            dataset
              .find(x => x.seriesname == 'Fuel Oil 5 & 6')
              .data.push({
                value: el[key]
              })
          }
          if (key === 'natural-gas') {
            dataset
              .find(x => x.seriesname == 'Natural Gas')
              .data.push({
                value: el[key]
              })
          }
          if (key === 'water' && this.state.chartType == 'utilityCost') {
            dataset
              .find(x => x.seriesname == 'Natural Gas')
              .data.push({
                value: el[key]
              })
          }
        }
      }
    })

    let newDataset = []
    for (let i = 0; i < dataset.length; i++) {
      const num = dataset[i].data.filter(el => {
        return el.value != 0
      }).length
      if (num != 0) {
        newDataset.push(dataset[i])
      }
    }

    this.setState({
      dataset: newDataset
    })
  }

  handleChartChange = event => {
    const tempValue = event.target.value
    const that = this
    this.setState({ chartType: tempValue }, function() {
      that.createChartData()
    })
  }

  customTooltip = type => {
    if (type == 'totalCosts') {
      const { totalUtilCosts, totalCost } = this.props.lastTwelveUtilityMetrics
      if (totalUtilCosts && totalCost) {
        const utilities = [
          'electric',
          'diesel',
          'fuel-oil-2',
          'fuel-oil-4',
          'fuel-oil-5-6',
          'natural-gas',
          'water',
          'steam',
          'other'
        ]
        const result = this.renderBreakdownTooltip(
          totalCost,
          totalUtilCosts,
          utilities,
          '$',
          false
        )
        return result
      }
    } else if (type == 'ghgEmissions') {
      const { totalUtilGhg, ghg } = this.props.lastTwelveUtilityMetrics
      if (totalUtilGhg && ghg) {
        const utilities = [
          'electric',
          'diesel',
          'fuel-oil-2',
          'fuel-oil-4',
          'fuel-oil-5-6',
          'natural-gas',
          'water',
          'steam',
          'other'
        ]
        const result = this.renderBreakdownTooltip(
          ghg,
          totalUtilGhg,
          utilities,
          false,
          'mtCO2e'
        )
        return result
      }
    } else if (type == 'energyCost') {
      const {
        totalUtilCosts,
        totalEnergyCost
      } = this.props.lastTwelveUtilityMetrics
      if (totalUtilCosts && totalEnergyCost) {
        const utilities = [
          'electric',
          'diesel',
          'fuel-oil-2',
          'fuel-oil-4',
          'fuel-oil-5-6',
          'natural-gas',
          'steam',
          'other'
        ]
        const result = this.renderBreakdownTooltip(
          totalEnergyCost,
          totalUtilCosts,
          utilities,
          '$',
          false
        )
        return result
      }
    } else if (type == 'energyUse') {
      const {
        totalUtilUsages,
        totalEneryUsage
      } = this.props.lastTwelveUtilityMetrics
      if (totalUtilUsages && totalEneryUsage) {
        const utilities = [
          'electric',
          'diesel',
          'fuel-oil-2',
          'fuel-oil-4',
          'fuel-oil-5-6',
          'natural-gas',
          'steam',
          'other'
        ]
        const result = this.renderBreakdownTooltip(
          totalEneryUsage,
          totalUtilUsages,
          utilities,
          false,
          'kBtu'
        )
        return result
      }
    } else if (type == 'costIndensity') {
      let costPerSqFootObject = {}
      const {
        totalUtilCosts,
        costPerSqFoot
      } = this.props.lastTwelveUtilityMetrics
      if (totalUtilCosts && costPerSqFoot) {
        const utilities = [
          'electric',
          'diesel',
          'fuel-oil-2',
          'fuel-oil-4',
          'fuel-oil-5-6',
          'natural-gas',
          'water',
          'steam',
          'other'
        ]

        for (var key in totalUtilCosts) {
          if (totalUtilCosts.hasOwnProperty(key)) {
            costPerSqFootObject[key] =
              Math.round(
                (totalUtilCosts[key] / this.props.building.squareFeet) * 100
              ) / 100
          }
        }

        const result = this.renderBreakdownTooltip(
          costPerSqFoot,
          costPerSqFootObject,
          utilities,
          '$',
          '/ft\u00B2'
        )
        return result
      }
    } else if (type == 'energyIndensity') {
      let euiObject = {}
      const { totalUtilUsages, eui } = this.props.lastTwelveUtilityMetrics
      if (totalUtilUsages && eui) {
        const utilities = [
          'electric',
          'diesel',
          'fuel-oil-2',
          'fuel-oil-4',
          'fuel-oil-5-6',
          'natural-gas',
          'water',
          'steam',
          'other'
        ]

        for (var key in totalUtilUsages) {
          if (totalUtilUsages.hasOwnProperty(key)) {
            euiObject[key] =
              Math.round(
                (totalUtilUsages[key] / this.props.building.squareFeet) * 100
              ) / 100
          }
        }

        const result = this.renderBreakdownTooltip(
          eui,
          euiObject,
          utilities,
          false,
          'kBtu/ft\u00B2'
        )
        return result
      }
    }
  }

  renderBreakdownTooltip = (total, values, utilities, preUnit, sufUnit) => {
    return (
      <div>
        {total != 0 && (
          <p>
            Total: {preUnit ? preUnit : ''}
            {formatNumbersWithCommas(total)}
            {sufUnit ? sufUnit : ''}
          </p>
        )}
        {utilities.includes('electric') && values['electric'] != 0 && (
          <p>
            Electric: {preUnit ? preUnit : ''}
            {formatNumbersWithCommas(values['electric'])}
            {sufUnit ? sufUnit : ''}
          </p>
        )}
        {utilities.includes('diesel') && values['diesel'] != 0 && (
          <p>
            Diesel: {preUnit ? preUnit : ''}
            {formatNumbersWithCommas(values['diesel'])}
            {sufUnit ? sufUnit : ''}
          </p>
        )}
        {utilities.includes('fuel-oil-2') && values['fuel-oil-2'] != 0 && (
          <p>
            Fuel Oil 2: {preUnit ? preUnit : ''}
            {formatNumbersWithCommas(values['fuel-oil-2'])}
            {sufUnit ? sufUnit : ''}
          </p>
        )}
        {utilities.includes('fuel-oil-4') && values['fuel-oil-4'] != 0 && (
          <p>
            Fuel Oil 4: {preUnit ? preUnit : ''}
            {formatNumbersWithCommas(values['fuel-oil-4'])}
            {sufUnit ? sufUnit : ''}
          </p>
        )}
        {utilities.includes('fuel-oil-5-6') && values['fuel-oil-5-6'] != 0 && (
          <p>
            Fuel Oil 5 & 6: {preUnit ? preUnit : ''}
            {formatNumbersWithCommas(values['fuel-oil-5-6'])}
            {sufUnit ? sufUnit : ''}
          </p>
        )}
        {utilities.includes('natural-gas') && values['natural-gas'] != 0 && (
          <p>
            Natural Gas: {preUnit ? preUnit : ''}
            {formatNumbersWithCommas(values['natural-gas'])}
            {sufUnit ? sufUnit : ''}
          </p>
        )}
        {utilities.includes('water') && values['water'] != 0 && (
          <p>
            Water: {preUnit ? preUnit : ''}
            {formatNumbersWithCommas(values['water'])}
            {sufUnit ? sufUnit : ''}
          </p>
        )}
        {utilities.includes('steam') && values['steam'] != 0 && (
          <p>
            Steam: {preUnit ? preUnit : ''}
            {formatNumbersWithCommas(values['steam'])}
            {sufUnit ? sufUnit : ''}
          </p>
        )}
        {utilities.includes('other') && values['other'] != 0 && (
          <p>
            Other: {preUnit ? preUnit : ''}
            {formatNumbersWithCommas(values['other'])}
            {sufUnit ? sufUnit : ''}
          </p>
        )}
      </div>
    )
  }

  handleToggleTimeRange = toggle => {
    if (toggle != undefined) {
      this.setState({ showTimeRange: toggle })
    } else {
      this.setState(prevState => ({
        showTimeRange: !prevState.showTimeRange
      }))
    }
  }

  handleTimeRangeChange = options => {
    const that = this
    const chartYearlist = [
      options.start.toString(),
      (options.start * 1 + 1).toString(),
      options.end.toString()
    ]

    this.setState(
      {
        chartYearlist: chartYearlist,
        timeRange: options
      },
      function() {
        that.createChartData()
      }
    )
  }

  renderTimeRange = () => {
    const { timeRange } = this.state
    if (!timeRange || !timeRange.type || !timeRange.start || !timeRange.end)
      return 'Year Range'
    if (timeRange.type === 'Calendar')
      return `${timeRange.start} - ${timeRange.end}`
    return `FY\'${timeRange.start % 100} - FY\'${timeRange.end % 100}`
  }

  render() {
    const { eui = '' } = this.props.lastTwelveUtilityMetrics
    const { allUtilities, lastTwelveUtilityMetrics, yearsCovered } = this.props
    const {
      baseline,
      baselineYear,
      visualizationOptions,
      showTimeRange,
      timeRange
    } = this.state
    const emptyState = this.checkEmptyState()

    return (
      <div className={styles.utilitySummary}>
        <div className={styles.panelHeader}>
          <h3>Last 12 Month vs Baseline ({baselineYear})</h3>
          <h3>
            <i
              className='material-icons'
              onClick={() => {
                this.openOverviewSettingModal(true)
              }}
            >
              settings
            </i>
          </h3>
        </div>

        <div className={styles.panelContent}>
          <div className={styles.summaryContent}>
            <div className={styles.valueBlock}>
              <div className={styles.valueItem}>
                <div>Total Costs</div>
                <div className={styles.breakdownTooltip}>
                  {lastTwelveUtilityMetrics.totalCost &&
                  lastTwelveUtilityMetrics.totalCost != 0 ? (
                    <ToolTip content={this.customTooltip('totalCosts')}>
                      <b>
                        $
                        {formatNumbersWithCommas(
                          lastTwelveUtilityMetrics.totalCost
                        )}
                      </b>
                    </ToolTip>
                  ) : (
                    <b>$0</b>
                  )}
                </div>
                {this.renderBaseLine(
                  lastTwelveUtilityMetrics.totalCost,
                  baseline.totalCost,
                  true
                )}
              </div>
              <div className={styles.valueItem}>
                <div>Cost Intensity</div>
                <div className={styles.breakdownTooltip}>
                  {lastTwelveUtilityMetrics.costPerSqFoot &&
                  lastTwelveUtilityMetrics.costPerSqFoot != 0 ? (
                    <ToolTip content={this.customTooltip('costIndensity')}>
                      <b>
                        ${lastTwelveUtilityMetrics.costPerSqFoot}/ft{'\u00B2'}
                      </b>
                    </ToolTip>
                  ) : (
                    <b>$0/ft{'\u00B2'}</b>
                  )}
                </div>
                {this.renderBaseLine(
                  lastTwelveUtilityMetrics.costPerSqFoot,
                  baseline.costPerSqFoot,
                  true
                )}
              </div>
              <div className={styles.valueItem}>
                <div>Energy Costs</div>
                <div className={styles.breakdownTooltip}>
                  {lastTwelveUtilityMetrics.totalEnergyCost &&
                  lastTwelveUtilityMetrics.totalEnergyCost != 0 ? (
                    <ToolTip content={this.customTooltip('energyCost')}>
                      <b>
                        $
                        {formatNumbersWithCommas(
                          lastTwelveUtilityMetrics.totalEnergyCost
                        )}
                      </b>
                    </ToolTip>
                  ) : (
                    <b>$0</b>
                  )}
                </div>
                {this.renderBaseLine(
                  lastTwelveUtilityMetrics.totalEnergyCost,
                  baseline.totalEnergyCost,
                  true
                )}
              </div>
              <div className={styles.valueItem}>
                <div>Energy Use</div>
                <div className={styles.breakdownTooltip}>
                  {lastTwelveUtilityMetrics.totalEneryUsage &&
                  lastTwelveUtilityMetrics.totalEneryUsage != 0 ? (
                    <ToolTip content={this.customTooltip('energyUse')}>
                      <b>
                        {formatNumbersWithCommas(
                          _.round(lastTwelveUtilityMetrics.totalEneryUsage)
                        )}{' '}
                        kBtu
                      </b>
                    </ToolTip>
                  ) : (
                    <b>0 kBtu</b>
                  )}
                </div>
                {this.renderBaseLine(
                  lastTwelveUtilityMetrics.totalEneryUsage,
                  baseline.totalEneryUsage,
                  false
                )}
              </div>
              <div className={styles.valueItem}>
                <div>Energy Intensity</div>
                <div className={styles.breakdownTooltip}>
                  {eui !== '' && eui !== '-' && eui !== 0 ? (
                    <ToolTip content={this.customTooltip('energyIndensity')}>
                      <b>
                        {formatNumbersWithCommas(eui)} kBtu/ft{'\u00B2'}
                      </b>
                    </ToolTip>
                  ) : (
                    <b>0 kBtu/ft{'\u00B2'}</b>
                  )}
                </div>
                {this.renderBaseLine(eui, baseline.eui, false)}
              </div>
              <div className={styles.valueItem}>
                <div>GHG Emissions</div>
                <div className={styles.breakdownTooltip}>
                  {lastTwelveUtilityMetrics.ghg &&
                  lastTwelveUtilityMetrics.ghg != 0 ? (
                    <ToolTip content={this.customTooltip('ghgEmissions')}>
                      <b>
                        {formatNumbersWithCommas(lastTwelveUtilityMetrics.ghg)}{' '}
                        mtCO2e
                      </b>
                    </ToolTip>
                  ) : (
                    <b>0 mtCO2e</b>
                  )}
                </div>
                {this.renderBaseLine(
                  lastTwelveUtilityMetrics.ghg,
                  baseline.ghg,
                  false
                )}
              </div>
              <div className={styles.valueItem}>
                <div>Water Costs</div>
                <div>
                  <b>
                    $
                    {lastTwelveUtilityMetrics.totalWaterCost
                      ? formatNumbersWithCommas(
                          lastTwelveUtilityMetrics.totalWaterCost
                        )
                      : 0}
                  </b>
                </div>
                {this.renderBaseLine(
                  lastTwelveUtilityMetrics.totalWaterCost,
                  baseline.totalWaterCost,
                  true
                )}
              </div>
            </div>
            <div className={styles.chartBlock}>
              <div className={styles.chartSettingContent}>
                <div
                  className={classNames(
                    styles.selectContainer,
                    styles.chartTypeContainer
                  )}
                >
                  <select
                    value={this.state.chartType}
                    name='chartType'
                    onChange={this.handleChartChange}
                  >
                    {visualizationOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className={styles.dropDown}>
                  <div
                    className={styles.timeRangeFilter}
                    onClick={this.handleToggleTimeRange}
                  >
                    {this.renderTimeRange()}
                  </div>
                  {showTimeRange && (
                    <TimeRangeBuilding
                      handleToggleSelect={this.handleToggleTimeRange}
                      handleTimeRangeChange={this.handleTimeRangeChange}
                      timeRange={timeRange}
                      yearsCovered={yearsCovered}
                    />
                  )}
                </div>
                <div className={styles.baselineLabel}>Baseline</div>
              </div>
              <StackedChart
                chartConfig={this.state.chartConfig}
                categories={this.state.categories}
                dataset={this.state.dataset}
              ></StackedChart>
            </div>
          </div>
          {allUtilities && emptyState && (
            <div className={styles.empty}>
              <div className={styles.emptyBody}>
                <div className={styles.emptyBodyTitle}>Add Meter Data</div>
                <div className={styles.emptyBodyDescription}>
                  Add data in Utilities or import from ENERGY STAR Portfolio
                  Manager.
                </div>
                <div className={styles.emptyButtons}>
                  <button
                    className={classNames(styles.button, styles.buttonPrimary)}
                    onClick={() => {
                      this.props.handleTabChange(3, 'Utilities', true)
                    }}
                  >
                    Go to utilities
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* {this.props.loading && <Loader />} */}
        </div>
        {/* <div className={styles.panelFooter}>
          <div
            className={styles.link}
            onClick={() => {
              this.props.handleTabChange(6, 'Projects', true)
            }}
          >
            Explore cost-saving projects & incentives&nbsp;
            <i className="material-icons">keyboard_arrow_right</i>
          </div>
        </div> */}
        {this.state.openOverviewSettingModal && (
          <OverviewSettingModal
            openOverviewSettingModal={this.openOverviewSettingModal}
            building={this.props.building}
            yearsCovered={this.state.yearList}
            applySetting={this.applySetting}
            rates={this.state.rates}
            editBuilding={this.props.editBuilding}
            changeReRunProjects={this.props.changeReRunProjects}
          ></OverviewSettingModal>
        )}
      </div>
    )
  }
}

export default OverviewUtilitySummary
