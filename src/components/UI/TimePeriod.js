import React, { Component } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { _getValueFromObjPerPath } from 'utils/Utils'
import styles from './TimePeriod.scss'

class TimePeriod extends Component {
  static propTypes = {
    handleTimeRangeChange: PropTypes.func.isRequired,
    yearsCovered: PropTypes.array.isRequired
  }

  state = {
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
    ],
    timeRange: {
      type: 'Calendar',
      start: this.props.yearsCovered[0],
      end: this.props.yearsCovered[this.props.yearsCovered.length - 1]
    }
  }

  componentDidMount = () => {
    let yearsCovered = this.props.yearsCovered
    let yearList = []
    yearsCovered.forEach(el => {
      yearList.push({
        label: el,
        value: el
      })
    })
    this.setState({
      yearList: yearList
    })
  }

  handleYearType = e => {
    const yearType = e.target.value
    let yearList = []
    let start = this.state.timeRange.start
    let end = this.state.timeRange.end
    for (let i = start; i <= end; i++) {
      let label = i
      if (yearType == 'Fiscal') label = `FY\'${i % 100}`
      yearList.push({
        value: i,
        label: label
      })
    }
    this.setState(
      {
        yearList: yearList,
        timeRange: {
          type: yearType,
          start,
          end
        }
      },
      function() {
        this.props.handleTimeRangeChange(this.state.timeRange)
      }
    )
  }

  handleChange = (e, key) => {
    let value = +e.target.value
    this.setState(
      prevState => ({
        timeRange: {
          ...prevState.timeRange,
          [key]: value
        }
      }),
      function() {
        this.props.handleTimeRangeChange(this.state.timeRange)
      }
    )
  }

  render() {
    const { timeRange, options, yearList } = this.state

    return (
      <div
        className={classNames(styles.timeRangeContainer)}
        ref={node => (this.node = node)}
      >
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
                >
                  <option defaultValue value='' disabled>
                    Select Year
                  </option>
                  {yearList.map((item, index) =>
                    item.value <= timeRange.end ? (
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
                >
                  <option defaultValue value='' disabled>
                    Select Year
                  </option>
                  {yearList.map((item, index) =>
                    timeRange.start + 4 >= item.value * 1 &&
                    item.value * 1 >= timeRange.start * 1 ? (
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
      </div>
    )
  }
}
export default TimePeriod
