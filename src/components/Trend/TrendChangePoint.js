import React from 'react'
import PropTypes from 'prop-types'
import { Loader } from 'utils/Loader'
import {
  formatCamelCaseNotation,
  defaultUtilUnitsFromType,
  formatHyphenNotationLabel
} from 'utils/Utils'
import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  CartesianGrid,
  Tooltip
} from 'recharts'
import { roundSignificantNumbers } from '../Utility/UtilityHelpers'

import classNames from 'classnames'
import styles from './TrendVisualization.scss'

export class TrendChangePoint extends React.Component {
  static propTypes = {
    changePointData: PropTypes.array,
    fitData: PropTypes.array,
    scatterPlotData: PropTypes.array,
    utilityName: PropTypes.string.isRequired
  }

  state = {
    chartData: [],
    scatterPlotData: []
  }

  componentDidMount = () => {
    if (this.props.changePointData && this.props.fitData) {
      this.handleChartData()
    }

    if (this.props.scatterPlotData) {
      this.handleScatterPlots(this.props.scatterPlotData)
    }
  }

  componentDidUpdate = prevProps => {
    if (prevProps.changePointData !== this.props.changePointData) {
      if (this.props.changePointData && this.props.fitData) {
        this.handleChartData()
      }
    }
    if (prevProps.scatterPlotData !== this.props.scatterPlotData) {
      if (this.props.scatterPlotData) {
        this.handleScatterPlots(this.props.scatterPlotData)
      }
    }
  }

  handleChartData = () => {
    const { changePointData, fitData } = this.props
    let chartObject = changePointData[0]
    let fitObject = fitData[0]
    let tempChartData = []

    if (chartObject && fitData) {
      let baseload = chartObject.baseload
      let coolingCP = chartObject.cooling_change_point
      let coolingS = chartObject.cooling_sensitivity
      let heatingS = chartObject.heating_sensitivity
      let heatingCP = chartObject.heating_change_point
      let minTemp = fitObject.tmin ? fitData[0].tmin : 0
      let maxTemp = fitObject.tmax ? fitData[0].tmax : 100

      const _setYPos = (temp, changePoint, sensitivity) => {
        return baseload + (temp - changePoint) * sensitivity
      }

      if (chartObject.model_type === '2P') {
        tempChartData.push({
          temp: minTemp,
          energy: _setYPos(minTemp, coolingCP, coolingS)
        })
        tempChartData.push({
          temp: maxTemp,
          energy: _setYPos(maxTemp, coolingCP, coolingS)
        })
        this.setState({ chartData: tempChartData })
        return
      }

      if (chartObject.model_type === '3PC') {
        tempChartData.push({ temp: minTemp, energy: baseload })
        tempChartData.push({ temp: coolingCP, energy: baseload })
        tempChartData.push({
          temp: maxTemp,
          energy: coolingS * maxTemp + (baseload - coolingS * coolingCP)
        })
        this.setState({ chartData: tempChartData })
        return
      }

      if (chartObject.model_type === '3PH') {
        tempChartData.push({
          temp: minTemp,
          energy: heatingS * minTemp + (baseload - heatingS * heatingCP)
        })
        tempChartData.push({ temp: heatingCP, energy: baseload })
        tempChartData.push({ temp: maxTemp, energy: baseload })
        this.setState({ chartData: tempChartData })
        return
      }

      if (chartObject.model_type === '4P') {
        tempChartData.push({
          temp: minTemp,
          energy: baseload + heatingS * (minTemp - heatingCP)
        })
        tempChartData.push({ temp: heatingCP, energy: baseload })
        tempChartData.push({
          temp: maxTemp,
          energy: (maxTemp - coolingCP) * coolingS + baseload
        })
        this.setState({ chartData: tempChartData })
        return
      }

      if (chartObject.model_type === '5P') {
        tempChartData.push({
          temp: minTemp,
          energy: _setYPos(minTemp, heatingCP, heatingS)
        })
        tempChartData.push({ temp: heatingCP, energy: baseload })
        tempChartData.push({ temp: coolingCP, energy: baseload })
        tempChartData.push({
          temp: maxTemp,
          energy: _setYPos(maxTemp, coolingCP, coolingS)
        })
        this.setState({ chartData: tempChartData })
        return
      }
    }
  }

  handleScatterPlots = scatterPlots => {
    let tempScatterData = []
    // plot scatter points
    if (scatterPlots) {
      scatterPlots.map(plot => {
        tempScatterData.push({
          temp: Math.round(plot.OAT * 100) / 100,
          energy: plot.usage,
          date: plot.end_date
        })
      })
      this.setState({ scatterPlotData: tempScatterData })
      return
    }
  }

  handleToggleTable = () => {
    this.setState(prevState => ({
      showFitTable: !prevState.showFitTable
    }))
  }

  customTooltip = e => {
    const { active } = e
    if (active) {
      const { payload } = e
      const monthMap = [
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
      const date = new Date(payload[0].payload.date)
      const month = date.getMonth() + 1
      const day = date.getDate()
      const year = date.getFullYear()

      return (
        <div className={styles.customTooltip}>
          <p>Temp: {roundSignificantNumbers(payload[0].value, 2)}°F</p>
          <p>{`${formatCamelCaseNotation(
            payload[1].name
          )}: ${roundSignificantNumbers(
            payload[1].value,
            2
          )} ${defaultUtilUnitsFromType(
            this.props.utilityName
          )}/ft² per day`}</p>
          {payload[0].payload.date && (
            <p>
              Date: {monthMap[month - 1]} {day + 1}, '
              {year.toString().slice(-2)}
            </p>
          )}
        </div>
      )
    }
  }

  renderNoShape = props => {
    const { cx, cy, fill } = props
    if (props.key === 'symbol-0' || props.key === 'symbol-2') {
      return null
    }
    return (
      <g>
        <circle cx={cx} cy={cy} r={5} fill={fill} />
      </g>
    )
  }

  render() {
    const { utilityName, changePointData, fitData } = this.props
    const { chartData, scatterPlotData } = this.state

    return (
      <div className={classNames(styles.trendChangePoint, styles.panel)}>
        <div className={styles.panelHeader}>
          <h3>
            {formatHyphenNotationLabel(utilityName)} - Change Point
            {changePointData && changePointData[0]
              ? ' - ' + changePointData[0].model_type
              : ''}
          </h3>
        </div>

        {changePointData && changePointData.length <= 0 && (
          <div className={styles.panelContent}>
            <Loader />
          </div>
        )}

        {changePointData && changePointData.length > 0 && (
          <div
            className={classNames(
              styles.trendChart,
              this.state.showFitTable ? '' : styles.addMargin
            )}
          >
            {changePointData && changePointData[0] && (
              <ResponsiveContainer width="100%" height={450}>
                <ScatterChart>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    type="number"
                    dataKey="temp"
                    tick={{ fontSize: 12 }}
                    unit="°F"
                    stroke="#858C92"
                  />
                  <YAxis
                    type="number"
                    dataKey="energy"
                    tick={{ fontSize: 12 }}
                    stroke="#858C92"
                    label={{
                      value: `${defaultUtilUnitsFromType(
                        this.props.utilityName
                      )}/ft² per day`,
                      angle: -90,
                      position: 'insideLeft',
                      fontSize: 12,
                      fill: '#858C92'
                    }}
                  />
                  <Tooltip content={this.customTooltip} />
                  <ZAxis range={[80]} />
                  <Scatter
                    data={scatterPlotData}
                    fill="#17253f"
                    shape="circle"
                  />
                  <Scatter
                    data={chartData}
                    fill="#54BE85"
                    line
                    shape={this.renderNoShape}
                  />
                </ScatterChart>
              </ResponsiveContainer>
            )}
          </div>
        )}

        {fitData &&
          fitData.length > 0 &&
          changePointData &&
          changePointData[0] && (
            <div
              className={classNames(
                styles.tableToggle,
                this.state.showFitTable ? '' : styles.hide
              )}
              onClick={this.handleToggleTable}
            >
              <small>
                {this.state.showFitTable ? 'Hide' : 'Show'} Modeling Results
                {this.state.showFitTable ? (
                  <i className="material-icons">expand_less</i>
                ) : (
                  <i className="material-icons">expand_more</i>
                )}
              </small>
            </div>
          )}

        {this.state.showFitTable && (
          <div className={styles.trendResults}>
            {fitData &&
              fitData.length > 0 &&
              changePointData &&
              changePointData[0] && (
                <div className={styles.table}>
                  <div className={styles.tableHeader}>
                    <div className={styles.tableRowItem}>
                      Utility Data Modeling Results
                    </div>
                  </div>
                  <div className={styles.tableRow}>
                    <div className={styles.tableRowItem}>Model</div>
                    <div className={styles.tableRowItem}>
                      {fitData[0].model_type}
                    </div>
                  </div>
                  <div className={styles.tableRow}>
                    <div className={styles.tableRowItem}>Baseload</div>
                    <div className={styles.tableRowItem}>
                      {roundSignificantNumbers(changePointData[0].baseload, 2)}{' '}
                      kWh/ft2 per day
                    </div>
                  </div>
                  <div className={styles.tableRow}>
                    <div className={styles.tableRowItem}>Cooling Load</div>
                    <div className={styles.tableRowItem}>
                      {changePointData[0].cool_load
                        ? roundSignificantNumbers(
                            changePointData[0].cool_load,
                            2
                          ) + ' kWh/ft2'
                        : 'N/A'}
                    </div>
                  </div>
                  <div className={styles.tableRow}>
                    <div className={styles.tableRowItem}>
                      Cooling Sensitivity
                    </div>
                    <div className={styles.tableRowItem}>
                      {changePointData[0].cooling_sensitivity
                        ? roundSignificantNumbers(
                            changePointData[0].cooling_sensitivity,
                            2
                          ) + ' kWh/ft2 per degree F'
                        : 'N/A'}
                    </div>
                  </div>
                  <div className={styles.tableRow}>
                    <div className={styles.tableRowItem}>Heating Load</div>
                    <div className={styles.tableRowItem}>
                      {changePointData[0].heat_load
                        ? roundSignificantNumbers(
                            changePointData[0].heat_load,
                            2
                          ) + ' kWh/ft2'
                        : 'N/A'}
                    </div>
                  </div>
                  <div className={styles.tableRow}>
                    <div className={styles.tableRowItem}>
                      Heating Sensitivity
                    </div>
                    <div className={styles.tableRowItem}>
                      {changePointData[0].heating_sensitivity
                        ? roundSignificantNumbers(
                            changePointData[0].heating_sensitivity,
                            2
                          ) + ' kWh/ft2 per degree F'
                        : 'N/A'}
                    </div>
                  </div>
                  <div className={styles.tableRow}>
                    <div className={styles.tableRowItem}>R2</div>
                    <div className={styles.tableRowItem}>
                      {roundSignificantNumbers(fitData[0].r2, 2)}
                    </div>
                  </div>
                  <div className={styles.tableRow}>
                    <div className={styles.tableRowItem}>CV-RMSE</div>
                    <div className={styles.tableRowItem}>
                      {roundSignificantNumbers(fitData[0].cv_rmse, 2)}
                    </div>
                  </div>
                </div>
              )}
          </div>
        )}
      </div>
    )
  }
}

export default TrendChangePoint
