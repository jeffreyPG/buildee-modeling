import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import moment from 'moment'
import _ from 'lodash'
import gql from 'graphql-tag'
import { Query } from 'react-apollo'

import { getYearList } from '../Utility/UtilityHelpers'
import styles from './BuildingView.scss'
import BuildingViewHeader from './BuildingViewHeader'
import { BuildingDetailsView } from '../BuildingDetails'
import { OverviewView } from '../Overview'
import { ProjectView } from '../Project'
import { AssetView } from '../Asset'
import { OperationsView } from '../Operations'
import { ActionsView } from '../Actions'
import { UtilityView } from '../Utility'
import { TrendView } from '../Trend'
import { ENABLED_FEATURES } from '../../utils/graphql/queries/user'
import StreemView from '../StreemView'
import { client as apolloClient } from 'utils/ApolloClient'
import { isProdEnv } from 'utils/Utils'
import { sortFunction } from 'utils/Portfolio'

const kbtConversionMap = {
  electric: 3.41214,
  'natural-gas': 100,
  steam: 1,
  'fuel-oil-2': 139.6,
  'fuel-oil-4': 145.1,
  'fuel-oil-5-6': 150.6,
  diesel: 139
}

const isDeliveryType = utilType => {
  return (
    utilType === 'fuel-oil-2' ||
    utilType === 'fuel-oil-5-6' ||
    utilType === 'fuel-oil-4' ||
    utilType === 'diesel'
  )
}

export class BuildingView extends React.Component {
  _isMounted = false
  _isUtilitiesLoaded = false

  static propTypes = {
    building: PropTypes.object.isRequired,
    getProjectsAndMeasures: PropTypes.func.isRequired,
    allBuildingsLink: PropTypes.func.isRequired,
    evaluateProject: PropTypes.func.isRequired,
    createOrganizationProject: PropTypes.func.isRequired,
    editOrganizationProject: PropTypes.func.isRequired,
    getOrganizationTemplates: PropTypes.func.isRequired,
    getOrganizationSpreadsheetTemplates: PropTypes.func.isRequired,
    addIncompleteProject: PropTypes.func.isRequired,
    deleteProject: PropTypes.func.isRequired,
    getBuilding: PropTypes.func.isRequired,
    push: PropTypes.func.isRequired,
    editBuilding: PropTypes.func.isRequired,
    createUtilities: PropTypes.func.isRequired,
    deleteUtility: PropTypes.func.isRequired,
    getUtilities: PropTypes.func.isRequired,
    getEndUse: PropTypes.func.isRequired,
    getEndUseUtil: PropTypes.func.isRequired,
    editUtility: PropTypes.func.isRequired,
    getBenchmark: PropTypes.func.isRequired,
    getBenchmarkUtil: PropTypes.func.isRequired,
    changeFirebaseAudit: PropTypes.func.isRequired,
    getEaMeasures: PropTypes.func.isRequired,
    getEaComponent: PropTypes.func.isRequired,
    uploadProjectImage: PropTypes.func.isRequired,
    user: PropTypes.object.isRequired,
    bulkAddProjects: PropTypes.func.isRequired,
    bulkEvaluateProjects: PropTypes.func.isRequired,
    deleteOrganizationProject: PropTypes.func.isRequired,
    getOrganizationProjects: PropTypes.func.isRequired,
    getBuildingIdentifiers: PropTypes.func.isRequired,
    getOrganizationName: PropTypes.func.isRequired,
    getOrganizationBuildings: PropTypes.func.isRequired,
    getUserById: PropTypes.func.isRequired,
    getWeather: PropTypes.func.isRequired,
    getChangePointAnalysis: PropTypes.func.isRequired,
    getOrganizations: PropTypes.func.isRequired,
    organization: PropTypes.object.isRequired,
    updateAsset: PropTypes.func.isRequired,
    deleteEquipment: PropTypes.func.isRequired,
    getEquipment: PropTypes.func.isRequired,
    getBuildingEquipment: PropTypes.func.isRequired,
    getPublicAssets: PropTypes.func.isRequired,
    pmImportUpdate: PropTypes.func.isRequired,
    pmExportUpdate: PropTypes.func.isRequired,
    updateBuildingTab: PropTypes.func.isRequired,
    updateProjectViewTab: PropTypes.func.isRequired,
    selectedView: PropTypes.object.isRequired,
    selectedProjectView: PropTypes.object.isRequired,
    getProjectPackages: PropTypes.func.isRequired,
    getMeasures: PropTypes.func.isRequired,
    deleteProjectPackage: PropTypes.func.isRequired,
    addIncompletePackageProject: PropTypes.func.isRequired,
    deleteMeasurePackage: PropTypes.func.isRequired,
    archiveBuilding: PropTypes.func.isRequired,
    deleteBulkMeasureForProject: PropTypes.func.isRequired,
    getBuildingRate: PropTypes.func.isRequired,
    getAllOrganizationTemplates: PropTypes.func.isRequired,
    manageAllOrgSelected: PropTypes.bool.isRequired,
    buildingList: PropTypes.array.isRequired
  }

  state = {
    editingForm: false,
    newAuditId: '',
    tempBenchmark: {},
    isBuildingLoaded: false,
    tabs: [
      {
        name: 'Overview',
        route: 'overview',
        active: true,
        featureFlag: 'buildingOverview'
      },
      { name: 'Property', route: 'property', active: true },
      {
        name: 'Utilities',
        route: 'utility',
        active: true,
        featureFlag: 'buildingUtilities'
      },
      { name: 'Trend', route: 'trend', active: true },
      {
        name: 'Operation',
        route: 'operation',
        active: true,
        featureFlag: 'buildingOperations'
      },
      {
        name: 'Assets',
        route: 'asset',
        active: true,
        featureFlag: 'buildingAssets'
      },
      {
        name: 'Projects',
        route: 'project',
        active: true,
        featureFlag: 'buildingProjects'
      },
      {
        name: 'Actions',
        route: 'action',
        active: true,
        featureFlag: 'buildingActions'
      },
      {
        name: 'Streem',
        route: 'streem',
        active: true,
        featureFlag: 'buildingStreem'
      }
    ],
    datePicker: {
      startDate: moment()
        .subtract(1, 'years')
        .format('YYYY'),
      endDate: moment().format('YYYY'),
      dateRangeError: ''
    },
    activeDates: {
      startDate: moment()
        // .subtract(1, 'years')
        .format('YYYY'),
      endDate: moment().format('YYYY')
    },
    trendDates: {
      startDate: moment()
        .subtract(2, 'years')
        .format('YYYY'),
      endDate: moment().format('YYYY'),
      dateRangeError: ''
    },
    activeTrendDates: {
      startDate: moment()
        .subtract(2, 'years')
        .format('YYYY'),
      endDate: moment().format('YYYY')
    },
    utilities: {},
    monthlyUtilities: [],
    trendUtilities: {},
    originalUtilities: {},
    totalUtilUsages: {},
    utilityMetrics: {
      totalCost: 0,
      totalWaterCost: 0,
      totalEnergyCost: 0,
      costPerSqFoot: 0,
      totalUtilUsages: 0,
      totalElectricDemand: 0,
      totalElectricDemandCost: 0
    },
    lastTwelveUtilityMetrics: {
      totalCost: 0,
      totalWaterCost: 0,
      totalEnergyCost: 0,
      costPerSqFoot: 0,
      totalUtilUsages: 0,
      totalElectricDemand: 0,
      totalElectricDemandCost: 0,
      ghg: 0
    },
    loading: false,
    loadingUtilities: false,
    loadingRate: false,
    endUse: {},
    rerunTrend: false,
    reRunProjects: false,
    utilityDatesLoaded: false,
    yearsCovered: []
  }

  UNSAFE_componentWillMount() {
    const { selectedView, routeParams } = this.props
    let { tab, subTab, buildingId } = routeParams
    const { tabs } = this.state
    let currentTab = _.find(tabs, { route: tab })
    if (currentTab) {
      tab = currentTab
    } else {
      tab = { name: 'Overview', route: 'overview', active: true }
    }
    if (
      Object.entries(selectedView).length != 0 &&
      selectedView.constructor === Object
    ) {
      if (tab.route === 'project') {
        if (!subTab) subTab = 'measure'
        let subTabName =
          subTab === 'measure'
            ? 'Measures'
            : subTab === 'proposal'
            ? 'Proposals'
            : 'Projects'
        this.props.updateBuildingTab({ name: tab.name })
        this.props.updateProjectViewTab({
          name: subTabName
        })
        this.props.push('/building/' + buildingId + `/project/${subTab}`)
      } else {
        this.props.updateBuildingTab({ name: tab.name })
        this.props.push('/building/' + buildingId + `/${tab.route}`)
      }
    } else {
      this.props.updateBuildingTab({ name: 'Overview' })
      this.props.push('/building/' + buildingId + '/overview')
    }
    if (tab.name === 'Overview') {
      apolloClient
        .query({
          query: gql`
            {
              enabledFeatures {
                name
              }
            }
          `
        })
        .then(({ data }) => {
          const hasFeature =
            data.enabledFeatures &&
            data.enabledFeatures.some(
              feature => feature.name === 'buildingOverview'
            )
          if (!hasFeature) {
            this.props.updateBuildingTab({ name: 'Property' })
            this.props.push('/building/' + buildingId + '/property')
          }
        })
    }
  }

  componentDidMount() {
    this._isMounted = true
    const { selectedView } = this.props
    this.props
      .getBuilding(this.props.params.buildingId)
      .then(building => {
        this.setState({ isBuildingLoaded: true })
        if (this.checkForIncompleteBuilding()) {
          this.handleGetUtilities()
            .then(() => {
              const { activeDates } = this.state
              const { startDate } = activeDates
              // call the api call for utility with initial year selection
              this.checkBenchmark()
              this.checkForEndUseData()
              this.calculateUtilitySummaries(this.state.utilities)
              this.calculateLastTwelveUtilitySummaries(this.state.utilities)
              this.updateRate(startDate)
              this._isUtilitiesLoaded = true
            })
            .catch(err => {
              this._isUtilitiesLoaded = true
              console.log(err)
            })
        } else {
          this.handleGetUtilities().then(() => {
            const { activeDates } = this.state
            const { startDate } = activeDates
            this.calculateUtilitySummaries()
            this.calculateLastTwelveUtilitySummaries()
            this.updateRate(startDate)
          })
          this._isUtilitiesLoaded = true
        }
      })
      .catch(err => {
        this._isUtilitiesLoaded = true
        this.setState({ isBuildingLoaded: true })
        this.updateRate(startDate)
        console.log(err)
      })
    if (
      Object.entries(selectedView).length === 0 ||
      !selectedView ||
      !selectedView.name
    ) {
      const { tabs } = this.state
      let tempState = Object.assign({}, tabs[0])
      this.props.updateBuildingTab(tempState)
    }

    // If the user does not have the trends project paid for
    if (this.props.user.products && this.props.user.products.trend !== 'show') {
      // remove the trend tab from the menu
      let tempTabs = [...this.state.tabs]
      tempTabs = tempTabs.filter(tab => tab.name !== 'Trend')
      this.setState({ tabs: tempTabs })
    }
    window.addEventListener('beforeunload', this.componentCleanup)
  }

  componentCleanup = () => {
    this._isMounted = false
    if (this.props.location.pathname !== window.location.pathname) {
      this.props.updateBuildingTab({ name: 'Overview' })
    }
  }

  componentWillUnmount() {
    this.componentCleanup()
    window.removeEventListener('beforeunload', this.componentCleanup)
  }

  componentDidUpdate = async (prevProps, prevState) => {
    const stateOriginalUtilities = this.state.originalUtilities || []
    const preStateOriginalUtilities = prevState.originalUtilities || []
    const currentPropsUtilityIds = this.props.building.utilityIds || []
    const prevPropsUtilityIds = prevProps.building.utilityIds || []
    if (!this.state.isBuildingLoaded) return
    if (
      (JSON.stringify(stateOriginalUtilities) !==
        JSON.stringify(preStateOriginalUtilities) ||
        JSON.stringify(currentPropsUtilityIds) !==
          JSON.stringify(prevPropsUtilityIds)) &&
      this._isMounted &&
      JSON.stringify(currentPropsUtilityIds) !==
        JSON.stringify(this.props.building.utilityIds)
    ) {
      // OriginalUtilities is updated and we need to update year range selection
      if (this._isUtilitiesLoaded) {
        await this.handleGetUtilities()
        await this.checkForEndUseData()
        const { activeDates } = this.state
        const { startDate } = activeDates
        this.updateRate(startDate)
      }
      let { originalUtilities } = this.state
      let utilities = []
      for (let key in originalUtilities) {
        utilities = [...utilities, ...originalUtilities[key]]
      }
      let utilDates = this.getUtilityStartEndDates(utilities)
      const earliestStartYear = new Date(
        utilDates.earliestStartDate
      ).getFullYear()
      const latestEndYear = new Date(utilDates.latestEndDate).getFullYear()
      const yearList = getYearList(earliestStartYear, latestEndYear)
      const { datePicker } = this.state
      const { startDate } = datePicker
      if (!yearList.includes(startDate)) {
        let tempDatePicker = { ...this.state.datePicker }
        let tempTrendDates = { ...this.state.trendDates }
        let tempActiveDates = { ...this.state.activeDates }
        tempDatePicker.startDate = String(latestEndYear)
        tempDatePicker.endDate = String(latestEndYear + 1)
        tempActiveDates.startDate = String(latestEndYear)
        tempActiveDates.endDate = String(latestEndYear + 1)
        tempTrendDates.startDate = String(latestEndYear - 3)
        tempTrendDates.endDate = String(latestEndYear)
        this.setState({
          datePicker: tempDatePicker,
          trendDates: tempTrendDates,
          utilityDatesLoaded: true,
          activeDates: tempActiveDates,
          yearsCovered: yearList
        })
      } else {
        this.setState({
          yearsCovered: yearList
        })
      }
    }
  }

  getUtilityAndBenchmarkInformation = async () => {
    const building = this.props.building
    try {
      if (this._isUtilitiesLoaded) {
        await this.handleGetUtilities()
      }
      await this.calculateUtilitySummaries(this.state.utilities)

      if (building && building.benchmark) {
        // if the benchmark object is empty (or the general object in the benchmark object), run the analyses to get the benchmark
        if (
          (Object.keys(building.benchmark).length === 0 &&
            building.benchmark.constructor === Object) ||
          (Object.keys(building.benchmark.general).length === 0 &&
            building.benchmark.general.constructor === Object)
        ) {
          this.checkBenchmark()
          // benchmark is full, so set the tempbenchmark to the bechmark
        } else {
          this.setState({ tempBenchmark: building.benchmark })
        }
      }
      if (building && building.endUse) {
        // if the enduse object is empty, run the analyses to get the enduse
        if (
          Object.keys(building.endUse).length === 0 &&
          building.endUse.constructor === Object
        ) {
          this.checkForEndUseData()
          // end use is full, so set the enduse
        } else {
          this.setState({ endUse: building.endUse })
        }
      }
    } catch (err) {
      console.log(err)
    }
  }

  getUtilityStartEndDates = utilities => {
    if (utilities && utilities.length > 0) {
      let singleUtilMeterData = []
      utilities.forEach((utility, index) => {
        if (utility.meterData.length > 0) {
          utility.meterData.forEach(meter => {
            singleUtilMeterData.push(meter)
          })
        }
      })
      // sort by end date
      let orderedByEndDate = singleUtilMeterData.sort((a, b) => {
        return new Date(b.endDate) - new Date(a.endDate)
      })
      if (orderedByEndDate.length === 0) {
        return new Date()
      }
      return {
        earliestStartDate: new Date(
          orderedByEndDate[orderedByEndDate.length - 1].startDate
        ),
        latestEndDate: new Date(orderedByEndDate[0].endDate)
      }
    } else {
      return new Date()
    }
  }

  handleInitialDatePicker = async utilities => {
    let tempDatePicker = { ...this.state.datePicker }
    let tempTrendDates = { ...this.state.trendDates }
    let tempActiveDates = { ...this.state.activeDates }
    let utilDates = this.getUtilityStartEndDates(utilities)
    const earliestStartYear = new Date(
      utilDates.earliestStartDate
    ).getFullYear()
    const latestEndYear = new Date(utilDates.latestEndDate).getFullYear()
    const yearList = getYearList(earliestStartYear, latestEndYear)
    if (
      !this.state.utilityDatesLoaded &&
      utilDates &&
      earliestStartYear &&
      latestEndYear
    ) {
      tempDatePicker.startDate = String(latestEndYear)
      tempDatePicker.endDate = String(latestEndYear + 1)
      tempActiveDates.startDate = String(latestEndYear)
      tempActiveDates.endDate = String(latestEndYear + 1)
      tempTrendDates.startDate = String(latestEndYear - 3)
      tempTrendDates.endDate = String(latestEndYear)
      this.setState({
        datePicker: tempDatePicker,
        trendDates: tempTrendDates,
        utilityDatesLoaded: true,
        activeDates: tempActiveDates,
        yearsCovered: yearList
      })
    }
  }

  checkForEndUseData = () => {
    // if there are utilities
    if (this.state.utilities && Object.keys(this.state.utilities).length > 0) {
      this.calculateUtilitySummaries(this.state.utilities).then(
        utilityMetrics => {
          // if electric or natural gas utilities exist, send to different endpoint
          if (
            this.props.building._id &&
            utilityMetrics.totalUtilUsages &&
            (utilityMetrics.totalUtilUsages.electric >= 0 ||
              utilityMetrics.totalUtilUsages['natural-gas'] >= 0)
          ) {
            this.props
              .getEndUseUtil(
                this.props.building._id,
                utilityMetrics.totalUtilUsages,
                utilityMetrics.totalCost,
                this.state.datePicker.startDate
              )
              .then(endUse => {
                if (this._isMounted) {
                  this.setState({ endUse: endUse })
                }
              })
          } else {
            this.props.getEndUse(this.props.building._id).then(endUse => {
              if (this._isMounted) {
                this.setState({ endUse: endUse })
              }
            })
          }
        }
      )
      // if there are no utilities at all
    } else {
      this.props.getEndUse(this.props.building._id).then(endUse => {
        if (this._isMounted) {
          this.setState({ endUse: endUse })
        }
      })
    }
  }

  // if building does not have all data points only allow user to visit the details page
  checkForIncompleteBuilding = () => {
    const { building } = this.props
    if (
      !building.floorCount ||
      !building.location.zipCode ||
      !building.buildingName ||
      !building.buildingUse ||
      !building.buildYear ||
      !building.squareFeet ||
      !building.open247
    ) {
      return false
    } else {
      return true
    }
  }

  checkBenchmark = () => {
    const { building } = this.props
    if (Object.entries(building).length === 0 || !building) {
      return null
    }

    let hasWater = false

    let utilities = this.state.utilities

    if (!building.benchmark) {
      building.benchmark = {}
    }

    if (building.squareFeet >= 200000) {
      hasWater = true
    }

    // calculate summary for all utilities
    this.calculateUtilitySummaries(utilities).then(utilityMetrics => {
      this.setState({ loading: true })

      // if there are electric utilities, send to benchmark utility endpoint
      if (Object.keys(utilities).includes('electric')) {
        this.props
          .getBenchmarkUtil(
            building._id,
            utilityMetrics.totalUtilUsages,
            utilityMetrics.totalCost
          )
          .then(benchmark => {
            if (!hasWater && (benchmark.water || benchmark.water === 0)) {
              delete benchmark.water
            }
            this.setState({ tempBenchmark: benchmark, loading: false })
          })
          .catch(err => {
            this.setState({ loading: false })
          })
        // if there are no electric utilities, send to regular endpoint
      } else {
        this.props
          .getBenchmark(building._id)
          .then(benchmark => {
            if (!hasWater && (benchmark.water || benchmark.water === 0)) {
              delete benchmark.water
            }
            this.setState({ tempBenchmark: benchmark, loading: false })
          })
          .catch(err => {
            this.setState({ loading: false })
          })
      }
    })
  }

  calculateUtilitySummaries = utilities => {
    // const { activeDates } = this.state
    const latestEndYear = this.state.trendDates.endDate
    const monthlyUtilities = this.state.monthlyUtilities.filter(
      item => item.year === latestEndYear
    )

    return new Promise(resolve => {
      let totalUtilityCosts = 0
      let totalUtilityWaterCosts = 0
      let totalElectricDemand = 0
      let totalElectricDemandCost = 0
      let totalUtilUsages = {}
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
        totalUtilityCosts += monthlyUtility.totalEnergyCost || 0
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
          let totalUsage = data?.totalUsage || 0
          let demand = data?.demand || 0
          let demandCost = data?.demandCost || 0
          totalUtilUsages[utilityName] += totalUsage
          if (utilityName === 'electric') {
            totalElectricDemand += demand
            totalElectricDemandCost += demandCost
          }
        })
      })
      let utilityMetrics = {
        totalCost: Math.round(totalUtilityCosts),
        totalWaterCost: Math.round(totalUtilityWaterCosts),
        totalEnergyCost: Math.round(totalUtilityCosts - totalUtilityWaterCosts),
        costPerSqFoot:
          Math.round(
            (totalUtilityCosts / this.props.building.squareFeet) * 100
          ) / 100,
        totalUtilUsages: totalUtilUsages,
        totalEneryUsage,
        eui: (totalEneryUsage / this.props.building.squareFeet).toFixed(2),
        totalElectricDemand: totalElectricDemand,
        totalElectricDemandCost: totalElectricDemandCost
      }
      this.setState({ utilityMetrics: utilityMetrics })
      resolve(utilityMetrics)
    })

    // return new Promise(resolve => {
    //   let totalUtilityCosts = 0
    //   let totalElectricDemand = 0
    //   let totalUtilUsages = {}
    //   let totalEneryUsage = 0
    //   let { activeDates } = this.state
    //   const startDate = moment()
    //     .set('year', activeDates.startDate)
    //     .utc()
    //     .startOf('month')
    //   const endDate = moment()
    //     .set('year', activeDates.startDate)
    //     .utc()
    //     .endOf('year')
    //   if (Object.keys(utilities).length !== 0) {
    //     Object.keys(utilities).forEach(utilType => {
    //       let utilUsage = 0
    //       utilities[utilType].forEach(utility => {
    //         const isDelivery = isDeliveryType(utilType)
    //         const utilityData =
    //           (isDelivery ? utility.deliveryData : utility.meterData) || []
    //         utilityData.forEach(dataPoint => {
    //           // calculate CorrespondingToCurrentMonth
    //           let mStartDate = moment(dataPoint.startDate)
    //           let mEndDate = moment(dataPoint.endDate).subtract(
    //             1,
    //             'millisecond'
    //           )
    //           if (!isDelivery) {
    //             mEndDate = moment(dataPoint.startDate)
    //               .add(1, 'day')
    //               .subtract(1, 'millisecond')
    //           }
    //           const startEndDaysDiff = mEndDate.diff(mStartDate, 'day') + 1
    //           let daysCorrespondingToCurrentMonth
    //           if (
    //             mStartDate.isBetween(startDate, endDate) &&
    //             !mEndDate.isBetween(startDate, endDate)
    //           ) {
    //             daysCorrespondingToCurrentMonth =
    //               endDate.diff(mStartDate, 'day') + 1
    //           } else if (
    //             mEndDate.isBetween(startDate, endDate) &&
    //             !mStartDate.isBetween(startDate, endDate)
    //           ) {
    //             daysCorrespondingToCurrentMonth =
    //               mEndDate.diff(startDate, 'day') + 1
    //           }

    //           let totalCost = Number(dataPoint['totalCost'] || 0)
    //           let totalUsage = Number(dataPoint['totalUsage'] || 0)
    //           let demand = Number(dataPoint['demand'] || 0)
    //           let demandCost = Number(dataPoint['demandCost'] || 0)
    //           let usage = isDelivery ? dataPoint.quantity : dataPoint.totalUsage
    //           usage = Number(usage || 0)

    //           if (daysCorrespondingToCurrentMonth) {
    //             totalCost =
    //               (totalCost / startEndDaysDiff) *
    //               daysCorrespondingToCurrentMonth
    //             totalUsage =
    //               (totalUsage / startEndDaysDiff) *
    //               daysCorrespondingToCurrentMonth
    //             usage =
    //               (usage / startEndDaysDiff) * daysCorrespondingToCurrentMonth
    //             demand =
    //               (demand / startEndDaysDiff) * daysCorrespondingToCurrentMonth
    //             demandCost =
    //               (demandCost / startEndDaysDiff) *
    //               daysCorrespondingToCurrentMonth
    //           }
    //           utilUsage += usage
    //           const conversionUnit = kbtConversionMap[utilType]
    //           if (conversionUnit) {
    //             totalEneryUsage += usage * conversionUnit
    //           }
    //           // get total cost
    //           if (utility.utilType === 'electric') {
    //             totalUtilityCosts += totalCost + demandCost
    //             totalElectricDemand += demand
    //           } else if (utility.utilType !== 'water') {
    //             totalUtilityCosts += totalCost
    //           }
    //         })
    //         totalUtilUsages[utilType] = utilUsage
    //       })
    //     })
    //     let utilityMetrics = {
    //       totalCost: Math.round(totalUtilityCosts),
    //       costPerSqFoot:
    //         Math.round(
    //           (totalUtilityCosts / this.props.building.squareFeet) * 100
    //         ) / 100,
    //       totalUtilUsages: totalUtilUsages,
    //       totalEneryUsage,
    //       eui: (totalEneryUsage / this.props.building.squareFeet).toFixed(2),
    //       totalElectricDemand: totalElectricDemand
    //     }
    //     this.setState({ utilityMetrics: utilityMetrics })
    //     resolve(utilityMetrics)
    //   } else {
    //     resolve()
    //   }
    // })
  }

  calculateLastTwelveUtilitySummaries = utilities => {
    let monthlyUtilities = this.state.monthlyUtilities
    monthlyUtilities = sortFunction(monthlyUtilities, 'year')

    if (monthlyUtilities.length > 12) {
      const endPos = monthlyUtilities.length
      const startPos = monthlyUtilities.length - 12
      monthlyUtilities = monthlyUtilities.slice(startPos, endPos)
    }
    return new Promise(resolve => {
      let totalUtilityCosts = 0
      let totalUtilityWaterCosts = 0
      let totalElectricDemand = 0
      let totalElectricDemandCost = 0
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
      let ghg = 0
      monthlyUtilities.forEach(monthlyUtility => {
        totalEneryUsage += monthlyUtility.totalEnergy?.value || 0
        totalUtilityCosts += monthlyUtility.totalCost || 0
        totalUtilityWaterCosts += monthlyUtility.water.totalCost || 0
        utilityTypes.forEach(utilityName => {
          let data = {}
          if (utilityName === 'electric') {
            data = monthlyUtility['electric']
            ghg += monthlyUtility['electric'].ghg
          }
          if (utilityName === 'natural-gas') {
            data = monthlyUtility['naturalgas']
            ghg += monthlyUtility['naturalgas'].ghg
          }
          if (utilityName === 'water') {
            data = monthlyUtility['water']
          }
          if (utilityName === 'steam') {
            data = monthlyUtility['steam']
          }
          if (utilityName === 'fuel-oil-2') {
            data = monthlyUtility['fueloil2']
            ghg += monthlyUtility['fueloil2'].ghg
          }
          if (utilityName === 'fuel-oil-4') {
            data = monthlyUtility['fueloil4']
            ghg += monthlyUtility['fueloil4'].ghg
          }
          if (utilityName === 'fuel-oil-5-6') {
            data = monthlyUtility['fueloil56']
            ghg += monthlyUtility['fueloil56'].ghg
          }
          if (utilityName === 'diesel') {
            data = monthlyUtility['diesel']
            ghg += monthlyUtility['diesel'].ghg
          }
          if (utilityName === 'other') {
            data = monthlyUtility['other']
            ghg += monthlyUtility['other'].ghg
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
          let demand = data.demand || 0
          let demandCost = data.demandCost || 0
          let totalCost = data.totalCost || 0
          let totalGhg = data.ghg || 0
          totalUtilUsages[utilityName] += totalUsage
          totalUtilCosts[utilityName] += totalCost
          totalUtilGhg[utilityName] += totalGhg
          if (utilityName === 'electric') {
            totalElectricDemand += demand
            totalElectricDemandCost += demandCost
          }
        })
      })
      let utilityMetrics = {
        totalCost: Math.round(totalUtilityCosts),
        totalWaterCost: Math.round(totalUtilityWaterCosts),
        totalEnergyCost: Math.round(totalUtilityCosts - totalUtilityWaterCosts),
        costPerSqFoot:
          Math.round(
            (totalUtilityCosts / this.props.building.squareFeet) * 100
          ) / 100,
        totalUtilUsages: totalUtilUsages,
        totalUtilCosts: totalUtilCosts,
        totalUtilGhg: totalUtilGhg,
        totalEneryUsage,
        eui: (totalEneryUsage / this.props.building.squareFeet).toFixed(2),
        totalElectricDemand: totalElectricDemand,
        totalElectricDemandCost: totalElectricDemandCost,
        ghg: ghg.toFixed(2)
      }
      this.setState({ lastTwelveUtilityMetrics: utilityMetrics })
      resolve(utilityMetrics)
    })
  }

  handleGetUtilities = () => {
    return new Promise((resolve, reject) => {
      if (this.props.building._id && this._isMounted) {
        // get all utilities from DB based on utilities ids on the building
        this.setState({ loadingUtilities: true })
        this.props
          .getUtilities(this.props.building._id)
          .then(({ utilities, monthlyUtilities }) => {
            if (utilities && utilities.length > 0) {
              this.handleInitialDatePicker(utilities)
              let tempUtilState = {}
              utilities.map(utility => {
                if (!tempUtilState[utility.utilType]) {
                  tempUtilState[utility.utilType] = []
                }
                tempUtilState[utility.utilType].push(utility)
              })

              // set state with all utilities from DB
              if (this._isMounted) {
                this.setState({
                  // utilities: tempUtilState,
                  originalUtilities: tempUtilState,
                  monthlyUtilities
                })
              }

              this.trimUtilitiesByDates()
                .then(trimmedUtilities => {
                  if (this._isMounted) {
                    this.setState({
                      utilities: trimmedUtilities.sortedUtils,
                      trendUtilities: trimmedUtilities.sortedTrendUtils,
                      monthlyUtilities
                    })
                  }
                  resolve()
                })
                .catch(err => {
                  console.log(err)
                  resolve()
                })
            } else {
              // clear utils in state if none come back from db
              if (this._isMounted) {
                this.setState({
                  utilities: {},
                  originalUtilities: {},
                  monthlyUtilities: []
                })
              }
              resolve()
            }
            this.setState({ loadingUtilities: false })
          })
          .catch(err => {
            this.setState({ loadingUtilities: false })
            console.log(err)
            resolve()
          })
      }
    })
  }

  handleChangeDates = e => {
    let tempDatePicker = { ...this.state.datePicker }
    tempDatePicker.dateRangeError = ''

    tempDatePicker['startDate'] = e.target.value
    tempDatePicker['endDate'] = String(Number(e.target.value) + 1)
    this.setState({ datePicker: tempDatePicker })
  }

  handleCreateUtilities = payload => {
    const isNewUtility = !this.state.originalUtilities[payload.utilType]
    return this.props.createUtilities({
      ...payload,
      isNewUtility
    })
  }

  handleChangeTrendDates = (e, field) => {
    let tempTrendDates = { ...this.state.trendDates }
    tempTrendDates.dateRangeError = ''

    tempTrendDates[field] = e.target.value
    this.setState({ trendDates: tempTrendDates })
  }

  trimUtilitiesByDates = async () => {
    // trims a deep copy of the original utilities to display
    const startDate = this.state.datePicker.startDate
    const endDate = this.state.datePicker.endDate
    const trendStartDate = this.state.trendDates.startDate
    const trendEndDate = this.state.trendDates.endDate
    // create deep copy of object to edit later based on dates

    let orgUtilsCopy = JSON.parse(JSON.stringify(this.state.originalUtilities))
    let orgUtilsTrendCopy = JSON.parse(
      JSON.stringify(this.state.originalUtilities)
    )
    const sortedUtils = await new Promise((resolve, reject) => {
      if (Object.keys(orgUtilsCopy).length > 0) {
        Object.keys(orgUtilsCopy).forEach(utility => {
          orgUtilsCopy[utility].forEach(util => {
            let newMeterData = []
            let newDeliveryData = []
            if (util.meterData && util.meterData.length > 0) {
              util.meterData.forEach(meter => {
                const start = new Date(startDate)
                const end = new Date(endDate)

                let meterStartDate = new Date(meter.startDate)
                let meterEndDate = new Date(meter.endDate)
                const median = new Date(
                  (meterStartDate.getTime() + meterEndDate.getTime()) / 2
                )
                if (median > start && median < end) {
                  newMeterData.push(meter)
                }
              })
            }
            if (util.deliveryData && util.deliveryData.length > 0) {
              util.deliveryData.forEach(delivery => {
                const start = new Date(startDate)
                const end = new Date(endDate)
                const deliveryDate = new Date(delivery.deliveryDate)
                if (deliveryDate >= start && deliveryDate <= end) {
                  newDeliveryData.push(delivery)
                }
              })
            }
            util.meterData = newMeterData
            util.deliveryData = newDeliveryData
          })
        })
        resolve(orgUtilsCopy)
      } else {
        resolve({})
      }
    })

    const sortedTrendUtils = await new Promise((resolve, reject) => {
      if (Object.keys(orgUtilsTrendCopy).length > 0) {
        Object.keys(orgUtilsTrendCopy).forEach(utility => {
          orgUtilsTrendCopy[utility].forEach(util => {
            let newMeterData = []

            if (util.meterData && util.meterData.length > 0) {
              util.meterData.forEach(meter => {
                const start = new Date(trendStartDate)
                const end = new Date(trendEndDate)

                let meterStartDate = new Date(meter.startDate)
                let meterEndDate = new Date(meter.endDate)
                const median = new Date(
                  (meterStartDate.getTime() + meterEndDate.getTime()) / 2
                )
                if (median > start && median < end) {
                  newMeterData.push(meter)
                }
              })
            }
            util.meterData = newMeterData
          })
        })
        resolve(orgUtilsTrendCopy)
      } else {
        resolve({})
      }
    })
    return { sortedUtils, sortedTrendUtils }
  }

  applyDates = () => {
    const startDate = this.state.datePicker.startDate
    const endDate = this.state.datePicker.endDate
    // update building object with applied dates
    this.handleGetUtilities().then(() => {
      this.checkBenchmark()
      this.checkForEndUseData()
      this.updateRate(startDate)
      // set flag for trend to run next time you visit the tab
      this.setState({
        activeDates: { startDate, endDate },
        datePicker: {
          ...this.state.datePicker,
          startDate: startDate,
          endDate: endDate
        }
      })
    })
  }

  applyTrendDates = () => {
    const startDate = this.state.trendDates.startDate
    const endDate = this.state.trendDates.endDate

    const dateStartDate = new Date(startDate)
    const dateEndDate = new Date(endDate)

    // const yearDiff = yearDifference(dateStartDate, dateEndDate)
    const yearDiff = Number(endDate - startDate)

    // if the end date is after start date
    if (dateStartDate.getTime() > dateEndDate.getTime()) {
      const temptrendDates = this.state.trendDates
      temptrendDates.dateRangeError = 'Start date must come before end date'
      this.setState({ trendDates: temptrendDates })
      return
    }

    // check to make sure dates are exactly one year apart
    if (yearDiff <= 2) {
      const temptrendDates = this.state.trendDates
      temptrendDates.dateRangeError =
        'Start date and end date must be at least 3 years apart.'
      this.setState({ trendDates: temptrendDates })
      return
    }
    // update building object with applied dates
    // this.handleGetUtilities().then(() => {
    // this.checkBenchmark()
    // this.checkForEndUseData()
    // set flag for trend to run next time you visit the tab

    return new Promise(async (resolve, reject) => {
      if (this.props.building._id) {
        // get all utilities from DB based on utilities ids on the building
        this.props
          .getUtilities(this.props.building._id)
          .then(async ({ utilities, monthlyUtilities }) => {
            if (utilities && utilities.length > 0) {
              let tempDatePicker = { ...this.state.datePicker }
              let tempTrendDates = { ...this.state.trendDates }

              let utilDates = this.getUtilityStartEndDates(utilities)
              const latestStartDate = new Date(
                utilDates.earliestStartDate
              ).getFullYear()
              const latestEndDate = new Date(
                utilDates.latestEndDate
              ).getFullYear()
              const yearList = getYearList(latestStartDate, latestEndDate)

              if (
                !this.state.utilityDatesLoaded &&
                utilDates &&
                latestStartDate &&
                latestEndDate
              ) {
                tempDatePicker.startDate = String(latestEndDate)
                tempDatePicker.endDate = String(latestEndDate + 1)
                tempTrendDates.startDate = String(latestEndDate - 3)
                tempTrendDates.endDate = String(latestEndDate)
                this.setState({
                  datePicker: tempDatePicker,
                  trendDates: tempTrendDates,
                  utilityDatesLoaded: true,
                  yearsCovered: yearList
                })
              }

              let tempUtilState = {}
              utilities.map(utility => {
                if (!tempUtilState[utility.utilType]) {
                  tempUtilState[utility.utilType] = []
                }
                tempUtilState[utility.utilType].push(utility)
              })

              // set state with all utilities from DB
              this.setState({
                // utilities: tempUtilState,
                originalUtilities: tempUtilState,
                monthlyUtilities
              })

              // trims a deep copy of the original utilities to display
              const trendStartDate = this.state.trendDates.startDate
              const trendEndDate = this.state.trendDates.endDate
              // create deep copy of object to edit later based on dates

              let orgUtilsTrendCopy = JSON.parse(
                JSON.stringify(this.state.originalUtilities)
              )

              const sortedTrendUtils = await new Promise((resolve, reject) => {
                if (Object.keys(orgUtilsTrendCopy).length > 0) {
                  Object.keys(orgUtilsTrendCopy).forEach(utility => {
                    orgUtilsTrendCopy[utility].forEach(util => {
                      let newMeterData = []

                      if (util.meterData && util.meterData.length > 0) {
                        util.meterData.forEach(meter => {
                          const start = new Date(trendStartDate)
                          const end = new Date(trendEndDate)

                          let meterStartDate = new Date(meter.startDate)
                          let meterEndDate = new Date(meter.endDate)
                          const median = new Date(
                            (meterStartDate.getTime() +
                              meterEndDate.getTime()) /
                              2
                          )
                          if (median > start && median < end) {
                            newMeterData.push(meter)
                          }
                        })
                      }
                      util.meterData = newMeterData
                    })
                  })
                  resolve(orgUtilsTrendCopy)
                } else {
                  resolve({})
                }
              })
              this.setState({
                trendUtilities: sortedTrendUtils,
                monthlyUtilities
              })
              resolve()
            } else {
              // clear utils in state if none come back from db
              this.setState({
                utilities: {},
                originalUtilities: {},
                monthlyUtilities
              })
              resolve()
            }
          })
          .catch(err => {
            console.log(err)
            resolve()
          })
      }
    })

    this.setState({
      rerunTrend: true,
      activeTrendDates: { startDate, endDate }
    })
    // })
  }

  changeType = clickedType => {
    let tempUtilities = { ...this.state.utilities }
    tempUtilities[clickedType] = []
    this.setState({ utilities: tempUtilities })
  }

  stopRerunTrend = () => {
    this.setState({ rerunTrend: false })
  }

  handleStartEdit = event => {
    this.setState({ editingForm: true })
  }
  cancelEditForm = () => {
    this.setState({ editingForm: false })
  }

  onBuildingDetailsSubmit = ({ formValues: values, newFieldValues }) => {
    let payload = {
      location: { ...this.props.building.location },
      firebaseRefs: { ...this.props.building.firebaseRefs }
    }

    let customFields = []
    // clear empties out
    values.customFields.forEach(field => {
      if (field.key !== '' && field.value) {
        customFields.push(field)
      }
    })

    payload.location.address = values.address
    payload.firebaseRefs.auditId = values.auditId
    payload.buildYear = values.buildYear
    payload.buildingName = values.buildingName
    payload.buildingUse = values.buildingUse
    payload.buildingUseTypes = values.buildingUseTypes
    payload.location.city = values.city
    payload.customFields = customFields
    payload.contacts = values.contacts
    payload.floorCount = values.floorCount
    payload.belowGradeFloorCount = values.belowGradeFloorCount
    payload.open247 = values.open247
    payload.squareFeet = values.squareFeet
    payload.location.country = values.country
    payload.location.state = values.state
    payload.location.zipCode = values.zipCode
    payload.tags = values.tags
    payload.nycFields = values.nycFields
    payload.buildingImage = values.buildingImage

    // since they can be empty
    payload.clientName = values.clientName
    payload.siteName = values.siteName
    payload.clientIndustry = values.clientIndustry

    // New Building field values
    payload.newFieldValues = newFieldValues || {}

    this.props
      .editBuilding(payload, this.props.building._id, true)
      .then(() => {
        this.setState({ editingForm: false })
        this.props.getBuilding(this.props.building._id)
      })
      .catch(err => {
        console.log('err: ', err)
      })
  }

  handleTabChange = (index, name, active, enabledFeatures) => {
    if (active && name !== this.props.selectedView.name) {
      let { selectedProjectView, routeParams } = this.props
      let { buildingId } = routeParams
      let tempState = this.state.tabs.find(tab => tab.name === name)
      this.props.updateBuildingTab(tempState)
      if (name === 'Projects') {
        let isProposalEnabled =
          enabledFeatures &&
          enabledFeatures.some(feature => feature.name === 'projectProposal')
        let isProjectEnabled =
          enabledFeatures &&
          enabledFeatures.some(feature => feature.name === 'projectProject')
        let isProjectsEnabled = enabledFeatures.some(
          feature => feature.name === 'buildingProjects'
        )
        if (isProjectEnabled) {
          selectedProjectView = {
            name: 'Projects'
          }
        }

        if (isProposalEnabled) {
          selectedProjectView = {
            name: 'Proposals'
          }
        }

        if (isProjectsEnabled) {
          selectedProjectView = {
            name: 'Measures'
          }
        }

        this.props.updateProjectViewTab(selectedProjectView)
        let subRoute =
          selectedProjectView.name === 'Measures'
            ? 'measure'
            : selectedProjectView.name === 'Projects'
            ? 'project'
            : 'proposal'
        this.props.push('/building/' + buildingId + `/project/${subRoute}`)
      } else {
        this.props.push('/building/' + buildingId + `/${tempState.route}`)
      }
    }
  }

  changeReRunProjects = boolean => {
    this.setState({ reRunProjects: boolean })
  }

  updateRate = startYear => {
    const buildingId = this.props.building._id
    const options = {
      year: startYear,
      startMonth: 'Jan',
      endMonth: 'Dec',
      yearType: 'CY'
    }
    this.setState({ loadingRate: true })
    this.props
      .getBuildingRate(buildingId, options)
      .then(res => {
        this.setState({ loadingRate: false })
      })
      .catch(err => {
        this.setState({ loadingRate: false })
      })
  }

  render() {
    const {
      building,
      user,
      allBuildingsLink,
      getOrganizationTemplates,
      getOrganizationSpreadsheetTemplates,
      selectedView
    } = this.props
    const { tabs, datePicker, isBuildingLoaded, loadingUtilities } = this.state
    if (
      Object.entries(building).length === 0 ||
      !building ||
      !isBuildingLoaded
    ) {
      return null
    }

    const commoditySettings = Object.assign(
      {},
      this.props.organization.commoditySettings,
      building.commoditySettings
    )
    return (
      <div className={styles.buildingView}>
        <BuildingViewHeader
          buildingInfo={building}
          allBuildingsLink={allBuildingsLink}
          getOrganizationTemplates={getOrganizationTemplates}
          getAllOrganizationTemplates={this.props.getAllOrganizationTemplates}
          manageAllOrgSelected={this.props.manageAllOrgSelected}
          getOrganizationSpreadsheetTemplates={
            getOrganizationSpreadsheetTemplates
          }
          datePicker={datePicker}
          user={user}
          loading={this.state.loadingUtilities}
          archiveBuilding={this.props.archiveBuilding}
        />

        <div className={styles.buildingViewTabs}>
          <div className={styles.tabs}>
            <Query query={ENABLED_FEATURES}>
              {({ loading, error, data }) => {
                if (loading || !data) return null
                const enabledFeatures = data.enabledFeatures

                return (
                  <div className={styles.container}>
                    {this.state.tabs
                      .filter(({ name, featureFlag }) => {
                        if (name === 'Assets') {
                          return (
                            enabledFeatures.some(
                              feature => feature.name === 'buildingAssets'
                            ) ||
                            enabledFeatures.some(
                              feature => feature.name === 'buildingSystem'
                            ) ||
                            enabledFeatures.some(
                              feature => feature.name === 'buildingConstruction'
                            )
                          )
                        }
                        if (name === 'Projects') {
                          return (
                            enabledFeatures.some(
                              feature => feature.name === 'buildingProjects'
                            ) ||
                            enabledFeatures.some(
                              feature => feature.name === 'projectProposal'
                            ) ||
                            enabledFeatures.some(
                              feature => feature.name === 'projectProject'
                            )
                          )
                        }
                        return (
                          !featureFlag ||
                          (enabledFeatures &&
                            enabledFeatures.some(
                              feature => feature.name === featureFlag
                            ))
                        )
                      })
                      .map((tab, index) => {
                        if (tab.name === 'Projects') {
                          let isProposalEnabled =
                            enabledFeatures &&
                            enabledFeatures.some(
                              feature => feature.name === 'projectProposal'
                            )
                          let isProjectEnabled =
                            enabledFeatures &&
                            enabledFeatures.some(
                              feature => feature.name === 'projectProject'
                            )
                          if (!isProposalEnabled && !isProjectEnabled)
                            return (
                              <div
                                key={index}
                                name={`${tab.name}Tab`}
                                onClick={() => {
                                  this.handleTabChange(
                                    index,
                                    tab.name,
                                    tab.active,
                                    enabledFeatures
                                  )
                                }}
                                className={classNames(
                                  styles.tab,
                                  tab.name === selectedView.name
                                    ? styles.tabActive
                                    : '',
                                  tab.active ? '' : styles.tabInactive
                                )}
                              >
                                {'Measures'}
                              </div>
                            )
                        }

                        return (
                          <div
                            key={index}
                            name={`${tab.name}Tab`}
                            onClick={() => {
                              this.handleTabChange(
                                index,
                                tab.name,
                                tab.active,
                                enabledFeatures
                              )
                            }}
                            className={classNames(
                              styles.tab,
                              tab.name === selectedView.name
                                ? styles.tabActive
                                : '',
                              tab.active ? '' : styles.tabInactive
                            )}
                          >
                            {tab.name}
                          </div>
                        )
                      })}
                  </div>
                )
              }}
            </Query>
          </div>
        </div>

        <div className={styles.container}>
          {selectedView.name === 'Overview' && (
            <OverviewView
              building={building}
              tempBenchmark={this.state.tempBenchmark}
              endUse={this.state.endUse}
              getUtilities={this.props.getUtilities}
              datePicker={this.state.datePicker}
              activeDates={this.state.activeDates}
              yearsCovered={this.state.yearsCovered}
              handleChangeDates={this.handleChangeDates}
              applyDates={this.applyDates}
              loading={this.state.loading}
              loadingUtilities={loadingUtilities}
              clearDates={this.clearDates}
              handleTabChange={this.handleTabChange}
              checkBenchmark={this.checkBenchmark}
              push={this.props.push}
              getBuildingData={this.getUtilityAndBenchmarkInformation}
              utilities={this.state.utilities}
              utilityMetrics={this.state.utilityMetrics}
              lastTwelveUtilityMetrics={this.state.lastTwelveUtilityMetrics}
              pmImportUpdate={this.props.pmImportUpdate}
              pmExportUpdate={this.props.pmExportUpdate}
              editBuilding={this.props.editBuilding}
              changeReRunProjects={this.changeReRunProjects}
              loadingRate={this.state.loadingRate}
              monthlyUtilities={this.state.monthlyUtilities}
              routeParams={this.props.routeParams}
              getOrganizationBuildings={this.props.getOrganizationBuildings}
              organization={this.props.organization}
              buildingList={this.props.buildingList}
              getEndUse={this.props.getEndUse}
              user={this.props.user}
              onBuildingDetailsSubmit={this.onBuildingDetailsSubmit}
            />
          )}
          {selectedView.name === 'Property' && (
            <BuildingDetailsView
              buildingInfo={building}
              onBuildingDetailsSubmit={this.onBuildingDetailsSubmit}
              cancelEditForm={this.cancelEditForm}
              handleStartEdit={this.handleStartEdit}
              editingForm={this.state.editingForm}
              changeFirebaseAudit={this.props.changeFirebaseAudit}
              user={user}
              uploadProjectImage={this.props.uploadProjectImage}
              getBuildingIdentifiers={this.props.getBuildingIdentifiers}
              getUserById={this.props.getUserById}
            />
          )}
          {selectedView.name === 'Utilities' && (
            <UtilityView
              building={building}
              getWeather={this.props.getWeather}
              editBuilding={this.props.editBuilding}
              createUtilities={this.handleCreateUtilities}
              deleteUtility={this.props.deleteUtility}
              editUtility={this.props.editUtility}
              endUse={this.state.endUse}
              getUtilities={this.props.getUtilities}
              utilities={this.state.utilities}
              user={user}
              originalUtilities={this.state.originalUtilities}
              datePicker={this.state.datePicker}
              activeDates={this.state.activeDates}
              yearsCovered={this.state.yearsCovered}
              handleChangeDates={this.handleChangeDates}
              applyDates={this.applyDates}
              loading={this.state.loading}
              clearDates={this.clearDates}
              utilityMetrics={this.state.utilityMetrics}
              changeType={this.changeType}
              changeReRunProjects={this.changeReRunProjects}
              getBuildingData={this.getUtilityAndBenchmarkInformation}
              handleGetUtilities={this.handleGetUtilities}
              handleTabChange={this.handleTabChange}
              monthlyUtilities={this.state.monthlyUtilities}
              commoditySettings={commoditySettings}
            />
          )}
          {/* Double check that the user is paying for the trend product */}
          {selectedView.name === 'Trend' &&
            user.products &&
            user.products.trend === 'show' && (
              <TrendView
                applyTrendDates={this.applyTrendDates}
                building={building}
                trendDates={this.state.trendDates}
                yearsCovered={this.state.yearsCovered}
                getChangePointAnalysis={this.props.getChangePointAnalysis}
                getOrganizationBuildings={this.props.getOrganizationBuildings}
                getOrganizations={this.props.getOrganizations}
                handleChangeTrendDates={this.handleChangeTrendDates}
                loading={this.state.loading}
                organization={this.props.organization}
                rerunTrend={this.state.rerunTrend}
                stopRerunTrend={this.stopRerunTrend}
                user={user}
                utilities={this.state.trendUtilities}
              />
            )}
          {selectedView.name === 'Projects' && (
            <ProjectView
              building={building}
              endUse={this.state.endUse}
              utilityMetrics={this.state.utilityMetrics}
              uploadProjectImage={this.props.uploadProjectImage}
              evaluateProject={this.props.evaluateProject}
              createOrganizationProject={this.props.createOrganizationProject}
              editOrganizationProject={this.props.editOrganizationProject}
              addIncompleteProject={this.props.addIncompleteProject}
              deleteProject={this.props.deleteProject}
              getProjectsAndMeasures={this.props.getProjectsAndMeasures}
              editBuilding={this.props.editBuilding}
              getEaMeasures={this.props.getEaMeasures}
              getOrganizationProjects={this.props.getOrganizationProjects}
              deleteOrganizationProject={this.props.deleteOrganizationProject}
              bulkAddProjects={this.props.bulkAddProjects}
              bulkEvaluateProjects={this.props.bulkEvaluateProjects}
              getEaComponent={this.props.getEaComponent}
              getOrganizationName={this.props.getOrganizationName}
              reRunProjects={this.state.reRunProjects}
              changeReRunProjects={this.changeReRunProjects}
              getUserById={this.props.getUserById}
              getProjectPackages={this.props.getProjectPackages}
              deleteProjectPackage={this.props.deleteProjectPackage}
              user={this.props.user}
              getMeasures={this.props.getMeasures}
              addIncompletePackageProject={
                this.props.addIncompletePackageProject
              }
              selectedProjectView={this.props.selectedProjectView}
              updateProjectViewTab={this.props.updateProjectViewTab}
              deleteMeasurePackage={this.props.deleteMeasurePackage}
              deleteBulkMeasureForProject={
                this.props.deleteBulkMeasureForProject
              }
              push={this.props.push}
              getProposals={this.props.getProposals}
              deleteProposal={this.props.deleteProposal}
            />
          )}
          {selectedView.name === 'Assets' && (
            <AssetView
              user={user}
              building={building}
              deleteEquipment={this.props.deleteEquipment}
              getEquipment={this.props.getEquipment}
              getBuildingEquipment={this.props.getBuildingEquipment}
              getPublicAssets={this.props.getPublicAssets}
              organization={this.props.organization}
              updateAsset={this.props.updateAsset}
              // Project Modal Props
              uploadProjectImage={this.props.uploadProjectImage}
              evaluateProject={this.props.evaluateProject}
              createOrganizationProject={this.props.createOrganizationProject}
              editOrganizationProject={this.props.editOrganizationProject}
              addIncompleteProject={this.props.addIncompleteProject}
              getProjectsAndMeasures={this.props.getProjectsAndMeasures}
              getUserById={this.props.getUserById}
              getOrganizationName={this.props.getOrganizationName}
              getOrganizationProjects={this.props.getOrganizationProjects}
              deleteOrganizationProject={this.props.deleteOrganizationProject}
              bulkAddProjects={this.props.bulkAddProjects}
            />
          )}
          {selectedView.name === 'Operation' && (
            <OperationsView
              user={user}
              building={building}
              deleteEquipment={this.props.deleteEquipment}
              getEquipment={this.props.getEquipment}
              getBuildingEquipment={this.props.getBuildingEquipment}
              getPublicAssets={this.props.getPublicAssets}
              organization={this.props.organization}
              updateAsset={this.props.updateAsset}
            />
          )}
          {selectedView.name === 'Actions' && (
            <ActionsView
              user={user}
              building={building}
              // Project Modal Props
              uploadProjectImage={this.props.uploadProjectImage}
              evaluateProject={this.props.evaluateProject}
              createOrganizationProject={this.props.createOrganizationProject}
              editOrganizationProject={this.props.editOrganizationProject}
              addIncompleteProject={this.props.addIncompleteProject}
              getProjectsAndMeasures={this.props.getProjectsAndMeasures}
              getUserById={this.props.getUserById}
              getOrganizationName={this.props.getOrganizationName}
              getOrganizationProjects={this.props.getOrganizationProjects}
              deleteOrganizationProject={this.props.deleteOrganizationProject}
              bulkAddProjects={this.props.bulkAddProjects}
            />
          )}
          {selectedView.name === 'Streem' && <StreemView />}
        </div>
      </div>
    )
  }
}

export default BuildingView
