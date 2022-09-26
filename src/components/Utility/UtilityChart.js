import React from 'react'
import PropTypes, { func } from 'prop-types'
import classNames from 'classnames'
import styles from './UtilityChart.scss'
import moment from 'moment'
import { defaultUtilUnitsFromType, formatNumbersWithCommas } from 'utils/Utils'
import { UTILITY_TYPES } from 'static/utility-units'
import { isEqual } from 'lodash'
import Stackedcolumn2dlineChart from '../Chart/Stackedcolumn2dlineChart'

export class UtilityChart extends React.Component {
  static propTypes = {
    utilities: PropTypes.array.isRequired,
    getWeather: PropTypes.func.isRequired,
    utilityName: PropTypes.string.isRequired,
    consumptionOrDelivery: PropTypes.string.isRequired,
    totalsDisplay: PropTypes.object.isRequired,
    timeRange: PropTypes.object.isRequired,
    originalUtility: PropTypes.array.isRequired,
    chartMonthlyUtilities: PropTypes.array.isRequired
  }

  state = {
    selectedTab: 'usage',
    chartConfig: {
      divLineDashed: '1',
      theme: 'fusion',
      sNumberSuffix: '°F'
    },
    categories: [],
    dataset: [],
    meters: [],
    chartData: []
  }

  monthMap = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec'
  ]

  componentDidMount = () => {
    this.createChartData()
  }

  componentDidUpdate = prevProps => {
    if (
      !isEqual(
        prevProps.chartMonthlyUtilities,
        this.props.chartMonthlyUtilities
      )
    ) {
      this.createChartData()
    }
  }

  createChartData = async () => {
    const isWater = this.props.utilityName === 'water'

    let { chartMonthlyUtilities, utilityName } = this.props
    let chartData = []
    let categories = [
      {
        category: []
      }
    ]
    let meters = []
    let uniqueMeters = []

    chartMonthlyUtilities.forEach(utility => {
      if (utility[utilityName].length !== 0) {
        utility[utilityName].forEach(el => {
          uniqueMeters.push(el)
        })
      }
    })

    let newUniqueMeters = []

    if (uniqueMeters.length) {
      if (!isWater) {
        await this.getWeather(uniqueMeters).then(metersWithWeather => {
          if (metersWithWeather.length >= uniqueMeters.length) {
            for (let i = 0; i < uniqueMeters.length; i++) {
              newUniqueMeters.push({
                ...uniqueMeters[i],
                ...metersWithWeather[i]
              })
            }
          } else {
            newUniqueMeters = uniqueMeters
          }
        })
      } else {
        newUniqueMeters = uniqueMeters
      }

      newUniqueMeters.forEach(el => {
        if (!meters.includes(el.meterName)) meters.push(el.meterName)
        const dateKey = moment(el.startDate)
          .add(1, 'days')
          .format("MMM ' YY")
        if (!chartData[dateKey]) {
          chartData[dateKey] = []
          categories[0].category.push({
            label: dateKey,
            value: el.startDate
          })
        }
        chartData[dateKey].push(el)
        uniqueMeters.push(el)
      })
    }

    categories[0].category = categories[0].category.sort(function(a, b) {
      return moment.utc(a.value).diff(moment.utc(b.value))
    })

    categories[0].category.forEach(function(v) {
      delete v.value
    })

    this.setState(
      {
        categories: categories,
        meters: meters,
        chartData: chartData
      },
      function() {
        this.createDataset()
      }
    )
  }

  createDataset = () => {
    const { selectedTab, categories, meters, chartData } = this.state
    let dataset = []

    // create main var chart data
    meters.forEach(meter => {
      let tempData = {
        seriesname: meter,
        data: []
      }

      categories[0].category.forEach(cate => {
        let isEmpty = true
        let val = 0
        for (let i = 0; i < chartData[cate.label].length; i++) {
          if (chartData[cate.label][i].meterName == meter) {
            if (selectedTab === 'usage') {
              val += chartData[cate.label][i].totalUsage
              isEmpty = false
            } else if (selectedTab === 'usageCost') {
              val += chartData[cate.label][i].totalCost
              isEmpty = false
            } else if (selectedTab === 'demand') {
              val += chartData[cate.label][i].demand
              isEmpty = false
            } else if (selectedTab === 'demandCost') {
              val += chartData[cate.label][i].demandCost
              isEmpty = false
            }
          }
        }
        if (isEmpty) {
          tempData.data.push({
            value: 0
          })
        } else {
          tempData.data.push({
            value: val
          })
        }
      })
      dataset.push(tempData)
    })

    // create weather line chart data
    let tempLineData = {
      seriesname: 'Weather',
      renderAs: 'line',
      showValues: '0',
      parentyaxis: 'S',
      data: []
    }
    categories[0].category.forEach(cate => {
      let weatherVal = 0
      for (let i = 0; i < chartData[cate.label].length; i++) {
        weatherVal += chartData[cate.label][i].weather
      }
      tempLineData.data.push({
        value: weatherVal / chartData[cate.label].length
      })
    })

    dataset.push(tempLineData)

    this.setState({
      dataset: dataset
    })
  }

  getWeather = uniqueMeters => {
    let self = this
    let newArray = []
    return new Promise(function(resolve) {
      let uniqueMetersPromise = []
      let dayStart = uniqueMeters[0].startDate.format('MM/DD/YYYY')
      let dayEnd = uniqueMeters[uniqueMeters.length - 1].endDate.format(
        'MM/DD/YYYY'
      )

      self.props
        .getWeather(dayStart, dayEnd)
        .then(weatherArr => {
          let timeseries = (weatherArr && weatherArr.timeseries) || []
          let uniqueMetersMap = timeseries.map((weather, index) => {
            let month =
              new Date(
                new Date(weather.datetime).getTime() -
                  new Date(weather.datetime).getTimezoneOffset() * -60000
              ).getMonth() + 1
            let year = new Date(
              new Date(weather.datetime).getTime() -
                new Date(weather.datetime).getTimezoneOffset() * -60000
            ).getFullYear()
            let obj = uniqueMeters.findIndex(
              o => o.month === month && o.year === year
            )
            let foundItem = newArray.findIndex(
              a => a.month === month && a.year === year
            )
            if (foundItem < 0) {
              // if the month and year don't exist in the array
              if (obj >= 0) {
                // there is utility data for this month
                let newObj = { ...uniqueMeters[obj] }
                ;(newObj.weather = parseFloat(
                  (weather.temperatureCelsius.avg * 1.8 + 32).toFixed(1)
                )), // convert C to F degrees
                  newArray.push(newObj)
              } else {
                // there is no utility data for this month, add just weather object to fill gap
                let abbrYear = year.toString().split('')
                let newObj = {
                  month: month,
                  year: year,
                  weather: parseFloat(
                    (weather.temperatureCelsius.avg * 1.8 + 32).toFixed(1)
                  ), // convert C to F degrees
                  name:
                    self.monthMap[month - 1] + " '" + abbrYear[2] + abbrYear[3]
                }
                newArray.push(newObj)
              }
            } else {
              // there is already an item in the array with this same month and year
              // take the average of the two weather points
              newArray[foundItem].weather =
                (newArray[foundItem].weather +
                  parseFloat(
                    (weather.temperatureCelsius.avg * 1.8 + 32).toFixed(1)
                  )) /
                2
            }
          })
          uniqueMetersPromise.push(uniqueMetersMap)

          Promise.all(uniqueMetersPromise).then(() => {
            resolve(newArray)
          })
        })
        .catch(err => {
          console.log(err)
        })
    })
  }

  handleTabChange = tab => {
    if (tab !== this.state.selectedTab) {
      this.setState({ selectedTab: tab }, function() {
        this.createDataset()
      })
    }
  }

  customTooltip = e => {
    const { active } = e

    const _addUnits = (value, dataKey) => {
      const formattedValue = formatNumbersWithCommas(value)

      if (dataKey === 'demand') {
        return (
          <p>
            {formattedValue}
            <span>kW</span>
          </p>
        )
      } else if (dataKey === 'totalCost' || dataKey === 'demandCost') {
        return (
          <p>
            <span>$</span>
            {formattedValue}
          </p>
        )
      } else {
        return (
          <p>
            {formattedValue}
            <span>
              {defaultUtilUnitsFromType(
                this.props.utilityName,
                this.props.commoditySettings
              )}
            </span>
          </p>
        )
      }
    }

    if (active) {
      const { payload, label } = e

      return (
        <div className={styles.customTooltip}>
          <h3>{label}</h3>
          {payload && payload[0] && (
            <div>
              <p>{payload[0].name}</p>
              {_addUnits(payload[0].value, payload[0].dataKey)}
            </div>
          )}
          {/* if weather exists */}
          {payload && payload[1] && (
            <div>
              <p>{payload[1].name}</p>
              <p>{formatNumbersWithCommas(payload[1].value)} °F</p>
            </div>
          )}
        </div>
      )
    }
  }

  render() {
    const { utilities, totalsDisplay, utilityName } = this.props
    const isWater = utilityName === 'water'
    const existingData = Boolean(utilities && utilities.length > 0)
    return (
      <div className={styles.utilityChart}>
        <div className={styles.tabs}>
          {this.props.consumptionOrDelivery === 'consumption' && (
            <div className={styles.tabs}>
              <div
                name='usageTabMeters'
                className={classNames(
                  styles.tab,
                  this.state.selectedTab === 'usage' ? styles.active : ''
                )}
                onClick={() => {
                  this.handleTabChange('usage')
                }}
              >
                <p>
                  Usage (
                  {defaultUtilUnitsFromType(
                    this.props.utilityName,
                    this.props.commoditySettings
                  )}
                  )
                </p>
                <h2>{existingData ? totalsDisplay.usage : '—'}</h2>
                {!isWater &&
                  existingData &&
                  !isNaN(totalsDisplay.usagePercent) && (
                    <span>({totalsDisplay.usagePercent}% overall)</span>
                  )}
              </div>
              <div
                name='usageCostTabMeters'
                className={classNames(
                  styles.tab,
                  this.state.selectedTab === 'usageCost' ? styles.active : ''
                )}
                onClick={() => {
                  this.handleTabChange('usageCost')
                }}
              >
                <p>Usage Cost (USD)</p>
                <h2>{existingData ? totalsDisplay.usageCost : '—'}</h2>
                {existingData && !isNaN(totalsDisplay.usageCostPercent) ? (
                  <span>{totalsDisplay.usageCostPercent}% overall</span>
                ) : null}
              </div>
              {this.props.utilityName === UTILITY_TYPES.ELECTRICITY && (
                <div
                  name='demandTabMeters'
                  className={classNames(
                    styles.tab,
                    this.state.selectedTab === 'demand' ? styles.active : ''
                  )}
                  onClick={() => {
                    this.handleTabChange('demand')
                  }}
                >
                  <p>Demand (kW)</p>
                  <h2>{existingData ? totalsDisplay.demand : '—'}</h2>
                </div>
              )}
              {this.props.utilityName === UTILITY_TYPES.ELECTRICITY && (
                <div
                  name='demandCostTabMeters'
                  className={classNames(
                    styles.tab,
                    this.state.selectedTab === 'demandCost' ? styles.active : ''
                  )}
                  onClick={() => {
                    this.handleTabChange('demandCost')
                  }}
                >
                  <p>Demand (USD)</p>
                  <h2>{existingData ? totalsDisplay.demandCost : '—'}</h2>
                </div>
              )}
            </div>
          )}
        </div>
        {this.props.consumptionOrDelivery === 'delivery' && (
          <div className={styles.tabs}>
            <div
              name='usageTabMeters'
              className={classNames(
                styles.tab,
                this.state.selectedTab === 'usage' ? styles.active : ''
              )}
              onClick={() => {
                this.handleTabChange('usage')
              }}
            >
              <p>
                Quantity (
                {defaultUtilUnitsFromType(
                  this.props.utilityName,
                  this.props.commoditySettings
                )}
                )
              </p>
              <h2>{existingData ? totalsDisplay.deliveryQuantity : '—'}</h2>
              {!isNaN(totalsDisplay.deliveryQuantityPercent) && (
                <span>({totalsDisplay.deliveryQuantityPercent}% overall)</span>
              )}
            </div>
            <div
              name='usageCostTabMeters'
              className={classNames(
                styles.tab,
                this.state.selectedTab === 'usageCost' ? styles.active : ''
              )}
              onClick={() => {
                this.handleTabChange('usageCost')
              }}
            >
              <p>Total Cost (USD)</p>
              <h2>{existingData ? totalsDisplay.deliveryCost : '—'}</h2>
              {existingData && !isNaN(totalsDisplay.deliveryCostPercent) ? (
                <span>{totalsDisplay.deliveryCostPercent}% overall</span>
              ) : null}
            </div>
          </div>
        )}
        {this.state.categories[0] &&
          this.state.categories[0].category.length > 0 && (
            <Stackedcolumn2dlineChart
              chartConfig={this.state.chartConfig}
              categories={this.state.categories}
              dataset={this.state.dataset}
            ></Stackedcolumn2dlineChart>
          )}
      </div>
    )
  }
}

export default UtilityChart
