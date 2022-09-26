import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import styles from './UtilityView.scss'
import { UtilityWidget } from './'
import AddUtility from './AddUtility'
import TimeRange from 'components/UI/TimeRange'
import moment from 'moment'
import { UNIT_DETAILS } from 'static/utility-units'

export class UtilityView extends React.Component {
  static propTypes = {
    building: PropTypes.object.isRequired,
    createUtilities: PropTypes.func.isRequired,
    endUse: PropTypes.object.isRequired,
    editBuilding: PropTypes.func.isRequired,
    deleteUtility: PropTypes.func.isRequired,
    editUtility: PropTypes.func.isRequired,
    getBuildingData: PropTypes.func.isRequired,
    getWeather: PropTypes.func.isRequired,
    utilities: PropTypes.object.isRequired,
    originalUtilities: PropTypes.object.isRequired,
    datePicker: PropTypes.object.isRequired,
    yearsCovered: PropTypes.array.isRequired,
    utilityMetrics: PropTypes.object.isRequired,
    loading: PropTypes.bool.isRequired,
    changeType: PropTypes.func.isRequired,
    changeReRunProjects: PropTypes.func.isRequired,
    handleGetUtilities: PropTypes.func.isRequired,
    commoditySettings: PropTypes.object
  }

  state = {
    unusedTypes: [],
    utilityOrder: Object.keys(UNIT_DETAILS),
    showNewWidget: false,
    showExtras: false,
    modalView: null,
    fuelType: null,
    utilities: {},
    showTimeRange: false,
    timeRange: {
      type: 'Calendar',
      start: '',
      end: ''
    },
    buildingList: [],
    chartMonthlyUtilities: []
  }

  UNSAFE_componentWillMount() {
    document.addEventListener('mousedown', this.handleClick, false)
  }

  componentDidMount = () => {
    this.props.getBuildingData()
    this.handleCheckForTypes()
    this.setDefaultTimeRange()
  }

  componentDidUpdate = prevProps => {
    if (
      prevProps.utilities !== this.props.utilities &&
      Object.keys(this.props.utilities).length > 0
    ) {
      this.handleCheckForTypes()
    }
    if (prevProps.yearsCovered !== this.props.yearsCovered) {
      this.setDefaultTimeRange()
    }
    if (prevProps.originalUtilities !== this.props.originalUtilities) {
      this.createChartMonthlyUtilities()
    }
  }

  componentWillUnmount = () => {
    document.removeEventListener('mousedown', this.handleClick, false)
    this.setState({ showExtras: false })
  }

  setDefaultTimeRange = () => {
    let { timeRange } = this.state
    const { yearsCovered } = this.props
    const lastIndex = yearsCovered.length - 1
    timeRange = {
      type: 'Calendar',
      start: yearsCovered[lastIndex - 1],
      end: yearsCovered[lastIndex]
    }
    this.setState({ timeRange })
  }

  handleToggleExtras = () => {
    this.setState(prevState => ({
      showExtras: !prevState.showExtras
    }))
  }

  handleClick = e => {
    if (this.node && this.node.contains(e.target)) return
    this.setState({ showExtras: false })
  }

  handleChangeType = clickedType => {
    this.props.changeType(clickedType)
    this.setState({
      showNewWidget: false,
      showExtras: false,
      modalView: 'addUtility',
      fuelType: clickedType
    })
  }

  handleCheckForTypes = () => {
    const unusedTypes = [...this.state.utilityOrder]
    let utilities = {
      ...this.props.utilities
    }

    let buildingUtilityTypes =
      (this.props.building && this.props.building.utilityTypes) || []
    buildingUtilityTypes.forEach(item => {
      if (!utilities.hasOwnProperty(item)) utilities[item] = []
    })

    Object.keys(utilities).map(utils => {
      // if the util is included in the unusedTypes array
      if (unusedTypes.includes(utils) && utilities[utils]) {
        // remove it!
        const index = unusedTypes.indexOf(utils)
        if (index !== -1) unusedTypes.splice(index, 1)
      }
    })
    this.setState({ unusedTypes, utilities })
  }

  renderFuelIcon = utilName => {
    switch (utilName) {
      case 'electric':
        return <i className='material-icons'>flash_on</i>
      case 'natural-gas':
        return <i className='material-icons'>whatshot</i>
      case 'water':
        return <i className='material-icons'>waves</i>
      case 'steam':
        return <i className='material-icons'>scatter_plot</i>
      case 'fuel-oil-2':
        return (
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
        )
      case 'fuel-oil-4':
        return (
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
        )
      case 'fuel-oil-5-6':
        return (
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
        )
      case 'diesel':
        return (
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
        )
      case 'other':
        return <i className='material-icons'>scatter_plot</i>
      default:
        return null
    }
  }

  handleFormatName = utilName => {
    if (utilName === 'fuel-oil-5-6') {
      return 'Fuel Oil 5 & 6'
    } else if (utilName === 'electric') {
      return 'Electricity'
    }
    return utilName
      .replace(/-/g, ' ')
      .replace(
        /\w\S*/g,
        txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
      )
  }

  handleCloseAddUtilities = () => {
    this.setState({
      fuelType: null,
      modalView: null
    })
    this.handleCheckForTypes()
    this.props.handleGetUtilities()
  }

  renderEmptyState = () => {
    return (
      <div className={styles.empty}>
        <div className={styles.emptyBody}>
          <div className={styles.emptyBodyTitle}>Add Meter Data</div>
          <div className={styles.emptyBodyDescription}>
            Add data or import from ENERGY STAR Portfolio Manager.
          </div>
          <div className={styles.emptyButtons}>
            {this.renderAddFuelTypeButton()}
          </div>
        </div>
      </div>
    )
  }

  renderAddFuelTypeButton = () => {
    const { showExtras } = this.state
    return (
      <div
        className={classNames(
          styles.extras,
          showExtras ? styles.extrasShow : styles.extrasHide
        )}
        ref={node => (this.node = node)}
      >
        <button
          className={classNames(styles.button, styles.buttonPrimary)}
          onClick={this.handleToggleExtras}
        >
          <i className='material-icons'>add</i> Fuel Type
        </button>
        <div
          className={classNames(
            styles.extrasDropdown,
            styles.extrasDropdownRight
          )}
        >
          {this.state.unusedTypes.map((type, index) => {
            return (
              <div
                key={index}
                name={`${type}AddMeter`}
                className={styles.extrasLink}
                onClick={() => this.handleChangeType(type)}
              >
                {this.renderFuelIcon(type)}
                {this.handleFormatName(type)}
              </div>
            )
          })}
        </div>
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

  renderTimeRange = () => {
    const { timeRange } = this.state
    if (!timeRange || !timeRange.type || !timeRange.start || !timeRange.end)
      return 'Year Range'
    if (timeRange.type === 'Calendar')
      return `${timeRange.start} - ${timeRange.end}`
    return `FY\'${timeRange.start % 100} - FY\'${timeRange.end % 100}`
  }

  handleTimeRangeChange = options => {
    this.setState(
      {
        timeRange: options
      },
      function() {
        this.createChartMonthlyUtilities()
      }
    )
  }

  createChartMonthlyUtilities = () => {
    const { timeRange } = this.state
    let monthlyUtilities = []
    for (let i = timeRange.start; i <= timeRange.end; i++) {
      const yearRange = this.getYearRange(i)
      let monthlyRangeDates = this.getMonthlyDateRanges(yearRange)
      for (let monthRange of monthlyRangeDates) {
        const startDate = moment(monthRange.start)
        const endDate = moment(monthRange.end)
        const monthlyData = this.getMonthlyDataByUtilType(startDate, endDate)
        monthlyUtilities.push(monthlyData)
      }
    }
    this.setState({
      chartMonthlyUtilities: monthlyUtilities
    })
  }

  getMonthlyDataByUtilType = (start, end) => {
    const startDate = start && moment(start)
    const endDate = end && moment(end)
    const medianDate = new Date(
      (new Date(startDate).getTime() + new Date(endDate).getTime()) / 2
    )
    const month = medianDate.getMonth() + 1
    const year = startDate.format('YYYY')

    let utilities = this.props.originalUtilities
    const keyMappings = {
      electric: 'electric',
      'natural-gas': 'naturalgas',
      water: 'water',
      steam: 'steam',
      'fuel-oil-2': 'fueloil2',
      'fuel-oil-4': 'fueloil4',
      'fuel-oil-5-6': 'fueloil56',
      diesel: 'diesel',
      other: 'other'
    }
    const keys = Object.keys(keyMappings)
    let monthlyData = {}
    for (let key of keys) {
      if (utilities && utilities[key]) {
        utilities[key].forEach(el => {
          if (!monthlyData[key]) {
            monthlyData[key] = []
          }
          const meterName = el.meterNumber
          let tempMeters = []
          const monthlyUtilityData = {
            totalUsage: 0,
            totalCost: 0,
            meterName: meterName,
            startDate: startDate,
            endDate: endDate,
            month: month,
            year: year
          }
          if (key === 'electric') {
            monthlyUtilityData['demand'] = 0
            monthlyUtilityData['demandCost'] = 0
          }

          el.meterData.forEach(mdata => {
            if (
              moment(mdata.startDate)
                .add(1, 'millisecond')
                .isBetween(startDate, endDate) ||
              moment(mdata.endDate)
                .subtract(1, 'millisecond')
                .isBetween(startDate, endDate)
            ) {
              tempMeters.push(mdata)
            }
          })

          if (tempMeters.length !== 0) {
            for (let mdata of tempMeters) {
              const mStartDate = moment(mdata.startDate)
              const mEndDate = moment(mdata.endDate).subtract(1, 'millisecond')
              const startEndDaysDiff = mEndDate.diff(mStartDate, 'day') + 1
              if (startEndDaysDiff >= 1) {
                let daysCorrespondingToCurrentMonth
                if (
                  mStartDate.isBetween(startDate, endDate) &&
                  !mEndDate.isBetween(startDate, endDate)
                ) {
                  daysCorrespondingToCurrentMonth =
                    endDate.diff(mStartDate, 'day') + 1
                } else if (
                  mEndDate.isBetween(startDate, endDate) &&
                  !mStartDate.isBetween(startDate, endDate)
                ) {
                  daysCorrespondingToCurrentMonth =
                    mEndDate.diff(startDate, 'day') + 1
                } else {
                  if (
                    endDate.isBetween(mStartDate, mEndDate) &&
                    mEndDate.isAfter(endDate)
                  ) {
                    daysCorrespondingToCurrentMonth =
                      endDate.diff(startDate, 'day') + 1
                  }
                }
                let totalCost = Number(mdata['totalCost'] || 0),
                  totalUsage = Number(mdata['totalUsage'] || 0),
                  demand = Number(mdata['demand'] || 0),
                  demandCost = Number(mdata['demandCost'] || 0)

                if (daysCorrespondingToCurrentMonth) {
                  totalCost =
                    (totalCost / startEndDaysDiff) *
                    daysCorrespondingToCurrentMonth
                  totalUsage =
                    (totalUsage / startEndDaysDiff) *
                    daysCorrespondingToCurrentMonth
                }
                if (key === 'electric') {
                  if (daysCorrespondingToCurrentMonth) {
                    demand =
                      (demand / startEndDaysDiff) *
                      daysCorrespondingToCurrentMonth
                    demandCost =
                      (demandCost / startEndDaysDiff) *
                      daysCorrespondingToCurrentMonth
                  }
                  // totalCost += demandCost;
                  monthlyUtilityData['demand'] += demand
                  monthlyUtilityData['demandCost'] += demandCost
                }
                monthlyUtilityData['totalCost'] += totalCost
                monthlyUtilityData['totalUsage'] += totalUsage
              }
            }
            monthlyData[key].push(monthlyUtilityData)
          }
        })
      }
    }
    return monthlyData
  }

  getMonthlyDateRanges = ({ start, end }) => {
    start =
      moment(start) ||
      moment()
        .utc()
        .startOf('year')
    end =
      moment(end) ||
      moment()
        .utc()
        .endOf('year')

    const startAndEndDates = []
    while (start.isSameOrBefore(end)) {
      const obj = {
        start: start
          .utc()
          .startOf('month')
          .toISOString(),
        end: start
          .utc()
          .endOf('month')
          .toISOString()
      }
      startAndEndDates.push(obj)
      start = start.add(1, 'month')
    }
    return startAndEndDates
  }

  getYearRange = year => {
    year = year || moment().format('YYYY')
    const obj = {}
    if (year) {
      obj.start = moment()
        .utc()
        .set({ year })
        .startOf('year')
        .toISOString()
      obj.end = moment()
        .utc()
        .set({ year })
        .endOf('year')
        .toISOString()
    }
    return obj
  }

  isNewUtility = () => {
    const { fuelType, utilities } = this.state
    if (!fuelType) return false
    return !utilities[fuelType] || utilities[fuelType].length === 0
  }

  render() {
    const { datePicker, yearsCovered } = this.props
    const {
      showExtras,
      utilities,
      timeRange,
      showTimeRange,
      buildingList
    } = this.state
    const startDate = datePicker.startDate
    const monthlyUtilities = this.props.monthlyUtilities.filter(item => {
      if (timeRange.start <= item.year && timeRange.end >= item.year)
        return item
    })
    return (
      <div className={styles.utilities}>
        <div className={styles.utilitiesHeading}>
          <h2>Utilities</h2>
          <div className={styles.dates}>
            <div className={styles.relative}>
              <div
                className={styles.timeRangeFilter}
                onClick={this.handleToggleTimeRange}
              >
                &nbsp; {this.renderTimeRange()}
                <i className='material-icons'>calendar_today</i>
              </div>
              {showTimeRange && (
                <TimeRange
                  handleToggleSelect={this.handleToggleTimeRange}
                  handleTimeRangeChange={this.handleTimeRangeChange}
                  buildingList={buildingList}
                  timeRange={timeRange}
                  isOneBuilding={true}
                  yearsCovered={yearsCovered}
                  modalDirect={'right'}
                />
              )}
            </div>
          </div>

          {this.state.unusedTypes.length > 0 &&
            utilities &&
            Object.keys(utilities).length > 0 &&
            this.renderAddFuelTypeButton()}
        </div>

        {datePicker.dateRangeError !== '' && (
          <p className={styles.utilitiesDateRangeError}>
            {datePicker.dateRangeError}
          </p>
        )}

        {utilities &&
          this.props.building._id &&
          // give a set order to displaying the utilities
          this.state.utilityOrder.map(utility => {
            // if it exists in the utilities props
            if (utilities.hasOwnProperty(utility)) {
              const { isConsumption, title } = UNIT_DETAILS[utility] || {}
              const consumptionOrDelivery = isConsumption
                ? 'consumption'
                : 'delivery'
              return (
                <UtilityWidget
                  key={utility}
                  type={utility}
                  getWeather={this.props.getWeather}
                  deleteUtility={this.props.deleteUtility}
                  editUtility={this.props.editUtility}
                  utilityName={title}
                  consumptionOrDelivery={consumptionOrDelivery}
                  createUtilities={this.props.createUtilities}
                  originalUtilities={this.props.originalUtilities}
                  allUtilities={utilities}
                  utility={utilities[utility]}
                  originalUtility={this.props.originalUtilities[utility] || []}
                  buildingId={this.props.building._id}
                  handleGetUtilities={this.props.handleGetUtilities}
                  monthlyUtilities={monthlyUtilities}
                  timeRange={this.state.timeRange}
                  chartMonthlyUtilities={this.state.chartMonthlyUtilities}
                  commoditySettings={this.props.commoditySettings}
                />
              )
            }
          })}

        {utilities &&
          Object.keys(utilities).length <= 0 &&
          this.renderEmptyState()}

        {this.state.fuelType && this.state.modalView === 'addUtility' && (
          <AddUtility
            type={this.state.fuelType}
            handleToggleAddUtility={this.handleCloseAddUtilities}
            buildingId={this.props.building._id}
            createUtilities={this.props.createUtilities}
            consumptionOrDelivery={
              UNIT_DETAILS[this.state.fuelType]?.isConsumption
                ? 'consumption'
                : 'delivery'
            }
            isUnusedUtility={this.isNewUtility()}
            commoditySettings={this.props.commoditySettings}
          />
        )}
      </div>
    )
  }
}

export default UtilityView
