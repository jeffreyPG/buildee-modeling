import React, { Component } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { _getValueFromObjPerPath } from 'utils/Utils'
import styles from './TimeRange.scss'
import moment from 'moment'

class TimeRangeBuilding extends Component {
  static propTypes = {
    handleToggleSelect: PropTypes.func.isRequired,
    handleTimeRangeChange: PropTypes.func.isRequired,
    timeRange: PropTypes.object.isRequired,
    yearsCovered: PropTypes.array.isRequired
  }

  state = {
    show: true,
    startYearList: [],
    endYearList: [],
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
    let { timeRange } = this.props
    this.setYearlist(timeRange.yearType)
    this.setState({
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

  setYearlist = yearType => {
    let { yearsCovered } = this.props
    let startYearList = []
    let endYearList = []
    const smin = yearsCovered[0]
    const smax = yearsCovered[yearsCovered.length - 3]
    const emin = yearsCovered[2]
    const emax = yearsCovered[yearsCovered.length - 1]

    for (let i = smin; i <= smax; i++) {
      let label = i
      if (yearType == 'Fiscal') label = `FY\'${i % 100}`
      startYearList.push({
        value: i,
        label: label
      })
    }
    for (let i = emin; i <= emax; i++) {
      let label = i
      if (yearType == 'Fiscal') label = `FY\'${i % 100}`
      endYearList.push({
        value: i,
        label: label
      })
    }
    this.setState({
      startYearList: startYearList,
      endYearList: endYearList
    })
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
    this.setYearlist(yearType)
    this.setState(prevState => ({
      timeRange: {
        ...prevState.timeRange,
        type: yearType
      }
    }))
  }

  handleApplySelect = () => {
    const { timeRange } = this.state
    this.props.handleTimeRangeChange(timeRange)
    this.setState({ show: false })
  }

  handleChange = (e, key) => {
    let value = +e.target.value
    if (key == 'start') {
      this.setState(prevState => ({
        timeRange: {
          ...prevState.timeRange,
          start: value,
          end: value + 2
        }
      }))
    } else {
      this.setState(prevState => ({
        timeRange: {
          ...prevState.timeRange,
          start: value - 2,
          end: value
        }
      }))
    }
  }

  onMouseDown = event => {
    event.stopPropagation()
  }

  onMouseUp = event => {
    event.stopPropagation()
  }

  render() {
    const { show, timeRange, options, startYearList, endYearList } = this.state
    if (!show) return <div></div>

    return (
      <div
        className={classNames(styles.timeRangeContainer)}
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
                  defaultValue={(timeRange && timeRange.start) || ''}
                  value={(timeRange && timeRange.start) || ''}
                  onMouseDown={this.onMouseDown}
                  onMouseUp={this.onMouseUp}
                >
                  <option defaultValue value='' disabled>
                    Select Year Type
                  </option>
                  {startYearList.map(
                    (item, index) => (
                      // item.value < timeRange.end ? (
                      <option
                        value={item.value}
                        key={`start-options-${item.value}-${index}`}
                      >
                        {item.label}
                      </option>
                    )
                    // ) : (
                    // ''
                    // )
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
                  defaultValue={(timeRange && timeRange.end) || ''}
                  value={(timeRange && timeRange.end) || ''}
                  onMouseDown={this.onMouseDown}
                  onMouseUp={this.onMouseUp}
                >
                  <option defaultValue value=''>
                    Select Year Type
                  </option>
                  {endYearList.map(
                    (item, index) => (
                      // item.value > timeRange.start ? (
                      <option
                        value={item.value}
                        key={`end-options-${item.value}-${index}`}
                      >
                        {item.label}
                      </option>
                    )
                    // ) : (
                    //   ''
                    // )
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
export default TimeRangeBuilding
