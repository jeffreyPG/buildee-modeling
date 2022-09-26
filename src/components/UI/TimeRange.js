import React, { Component } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { _getValueFromObjPerPath } from 'utils/Utils'
import styles from './TimeRange.scss'
import moment from 'moment'

class TimeRange extends Component {
  static propTypes = {
    handleToggleSelect: PropTypes.func.isRequired,
    handleTimeRangeChange: PropTypes.func.isRequired,
    timeRange: PropTypes.object.isRequired,
    buildingList: PropTypes.arrayOf(PropTypes.object).isRequired,
    isOneBuilding: PropTypes.bool,
    yearsCovered: PropTypes.array
  }

  state = {
    show: true,
    yearList: [],
    options: [
      {
        value: 'Calendar',
        label: 'Calendar Year'
      },
      {
        value: 'Fiscal',
        label: 'Fiscal Year(July - June)'
      }
    ]
  }

  UNSAFE_componentWillMount = () => {
    document.addEventListener('mousedown', this.handleClick, false)
    let { timeRange, isOneBuilding, yearsCovered } = this.props
    let yearList = []
    let values = []
    let min = timeRange.start
    let max = timeRange.end
    if (!isOneBuilding) {
      this.props.buildingList.forEach(building => {
        let value
        let monthlyUtilities =
          _getValueFromObjPerPath.call(building, 'monthlyUtilities') || []
        value = monthlyUtilities
          .filter(utility => utility.year_type == timeRange.type)
          .map(item => +item.year)
        values = [...values, ...value]
      })
      values = values.filter(item => item != 0)
      max = Math.max(...values, timeRange.end)
      min = Math.min(...values, timeRange.start)
      if (values.length == 0) {
        min = +moment()
          .subtract(4, 'years')
          .format('YYYY')
        max = +moment()
          // .add(1, 'years')
          .format('YYYY')
      }
      // if (this.props.featureYear) {
      //   max = this.props.featureYear
      // }
      for (let i = min; i <= max; i++) {
        let label = i
        if (timeRange.type == 'Fiscal') label = `FY\'${i % 100}`
        yearList.push({
          value: i,
          label: label
        })
      }
    } else {
      for (
        let i = yearsCovered[0];
        i <= yearsCovered[yearsCovered.length - 1];
        i++
      ) {
        let label = i
        if (timeRange.type == 'Fiscal') label = `FY\'${i % 100}`
        yearList.push({
          value: i,
          label: label
        })
      }
    }

    this.setState({
      yearList: yearList,
      timeRange: timeRange
    })
  }

  componentDidMount = () => {
    const { timeRange } = this.props
    this.setState({ timeRange })
  }

  componentWillUnmount = () => {
    document.removeEventListener('mousedown', this.handleClick, false)
    this.setState({ show: false })
  }

  handleClick = e => {
    if (this.node && this.node.contains(e.target)) {
      // the click is inside, continue to menu links
      return
    }
    // otherwise, toggle (close) the dropdowns
    this.handleToggle()
  }

  handleToggle = () => {
    this.setState({ show: false })
    this.props.handleToggleSelect()
  }

  handleYearType = e => {
    const yearType = e.target.value
    const { isOneBuilding } = this.props
    let yearList = []
    if (!isOneBuilding) {
      let values = []
      this.props.buildingList.forEach(building => {
        let value
        let monthlyUtilities =
          _getValueFromObjPerPath.call(building, 'monthlyUtilities') || []
        value = monthlyUtilities
          .filter(utility => utility.year_type == yearType)
          .map(item => +item.year)
        values = [...values, ...value]
      })
      let end = +moment()
          // .add(1, 'years')
          .format('YYYY'),
        start = 0
      if (values.length) {
        end = Math.max(...values, end)
        start = Math.min(...values)
      } else {
        start = +moment()
          .subtract(4, 'years')
          .format('YYYY')
        end = +moment()
          // .add(1, 'years')
          .format('YYYY')
      }

      // if (this.props.featureYear) {
      //   end = this.props.featureYear
      // }
      let max = 2021
      for (let i = start; i <= max; i++) {
        let label = i
        if (yearType == 'Fiscal') label = `FY\'${i % 100}`
        yearList.push({
          value: i,
          label
        })
      }
      this.setState({
        yearList: yearList,
        timeRange: {
          type: yearType,
          start,
          end
        }
      })
    } else {
      const currentYearlist = this.state.yearList
      if (currentYearlist.length !== 0) {
        for (
          let i = currentYearlist[0].value;
          i <= currentYearlist[currentYearlist.length - 1].value;
          i++
        ) {
          let label = i
          if (yearType == 'Fiscal') label = `FY\'${i % 100}`
          yearList.push({
            value: i,
            label
          })
        }
      }
      this.setState({
        yearList: yearList,
        timeRange: {
          ...this.state.timeRange,
          type: yearType
        }
      })
    }
  }

  handleApplySelect = () => {
    const { timeRange } = this.state
    this.props.handleTimeRangeChange(timeRange)
    this.setState({ show: false })
  }

  handleChange = (e, key) => {
    let value = +e.target.value
    this.setState(prevState => ({
      timeRange: {
        ...prevState.timeRange,
        [key]: value
      }
    }))
  }

  onMouseDown = event => {
    event.stopPropagation()
  }

  onMouseUp = event => {
    event.stopPropagation()
  }

  render() {
    const { show, timeRange, options, yearList } = this.state
    const { modalDirect } = this.props
    if (!show) return <div></div>

    return (
      <div
        className={classNames(
          styles.timeRangeContainer,
          modalDirect == 'right' ? styles.rightModal : styles.leftModal
        )}
        ref={node => (this.node = node)}
      >
        <div className={styles.timeRangeContainerHeader}>
          <p>Year Selection</p>
          <br />
          <i
            className={classNames('material-icons', styles.deleteIcon)}
            onClick={this.handleToggle}
          >
            close
          </i>
        </div>
        <div className={styles.timeRangeContainerBody}>
          <div className={styles.fullWidth}>
            <div
              className={classNames(styles.selectContainer, styles.fullWidth)}
            >
              <select
                onChange={e => this.handleYearType(e)}
                value={(timeRange && timeRange.type) || ''}
                name='Range'
                id='Range'
                onMouseDown={this.onMouseDown}
                onMouseUp={this.onMouseUp}
              >
                <option defaultValue value='' disabled>
                  Select Year Type
                </option>
                {options.map((item, i) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <br />
          {timeRange && timeRange.type !== '' && (
            <div className={classNames(styles.fullWidth, styles.selection)}>
              <div
                className={classNames(
                  styles.selectContainer,
                  styles.selectionItem
                )}
              >
                <select
                  onChange={e => this.handleChange(e, 'start')}
                  // defaultValue={(timeRange && timeRange.start) || ''}
                  value={(timeRange && timeRange.start) || ''}
                  onMouseDown={this.onMouseDown}
                  onMouseUp={this.onMouseUp}
                >
                  <option defaultValue value='' disabled>
                    Select Year Type
                  </option>
                  {yearList.map((item, index) =>
                    item.value < timeRange.end ? (
                      <option
                        value={item.value}
                        key={`start-options-${item.value}-${index}`}
                      >
                        {item.label}
                      </option>
                    ) : (
                      ''
                    )
                  )}
                </select>
              </div>
              <i className='material-icons'>remove</i>
              <div
                className={classNames(
                  styles.selectContainer,
                  styles.selectionItem
                )}
              >
                <select
                  onChange={e => this.handleChange(e, 'end')}
                  // defaultValue={(timeRange && timeRange.end) || ''}
                  value={(timeRange && timeRange.end) || ''}
                  onMouseDown={this.onMouseDown}
                  onMouseUp={this.onMouseUp}
                >
                  <option defaultValue value='' disabled>
                    Select Year Type
                  </option>
                  {yearList.map((item, index) =>
                    item.value > timeRange.start ? (
                      <option
                        value={item.value}
                        key={`end-options-${item.value}-${index}`}
                      >
                        {item.label}
                      </option>
                    ) : (
                      ''
                    )
                  )}
                </select>
              </div>
            </div>
          )}
        </div>
        <div className={styles.timeRangeContainerFooter}>
          <button
            className={classNames(styles.button, styles.buttonSecondary)}
            onClick={this.handleToggle}
          >
            Cancel
          </button>
          <button
            className={classNames(styles.button, styles.buttonPrimary, {
              [styles.buttonDisable]:
                timeRange && timeRange.start > timeRange.end
            })}
            onClick={this.handleApplySelect}
            disabled={timeRange && timeRange.start > timeRange.end}
          >
            Apply
          </button>
        </div>
      </div>
    )
  }
}
export default TimeRange
