import React, { Component } from 'react'
import moment from 'moment'
import PropTypes from 'prop-types'
import styles from './CustomYearRange.scss'

export class CustomYearRange extends Component {
  static propTypes = {
    monthList: PropTypes.array.isRequired,
    yearList: PropTypes.array.isRequired,
    startMonth: PropTypes.string.isRequired,
    startYear: PropTypes.string.isRequired,
    endMonth: PropTypes.string.isRequired,
    endYear: PropTypes.string.isRequired,
    handleChange: PropTypes.func.isRequired
  }
  constructor(props) {
    super(props)
  }
  render() {
    let {
      monthList,
      yearList,
      startMonth,
      startYear,
      endMonth,
      endYear,
      startDate,
      endDate
    } = this.props

    let momentStartDate = moment(startDate)
      .utc()
      .startOf('month')
    let momentEndDate = moment(endDate)
      .utc()
      .endOf('month')
    let dateInvalid = momentEndDate.diff(momentStartDate, 'years') <= 2

    return (
      <div>
        <div className={styles.customYear}>
          <div>Starting : </div>
          <label>Month</label>
          <div className={styles.selectContainer}>
            <select
              name={'selectedStartMonth'}
              type={'selectedStartMonth'}
              id="selectedStartMonth"
              value={startMonth || ''}
              onChange={e => {
                this.props.handleChange(e)
              }}
            >
              <option defaultValue value="" disabled>
                Select Month
              </option>
              {monthList.map(({ label, value }) => {
                let date = moment(`${startYear} ${label}`, 'YYYY MMMM')
                  .utc()
                  .startOf('month')
                let valid = endDate.diff(date, 'month') > 0
                if (valid)
                  return (
                    <option value={value} key={`options-${label}-${value}`}>
                      {label}
                    </option>
                  )
                return ''
              })}
            </select>
          </div>
          <label>Year</label>
          <div className={styles.selectContainer}>
            <select
              name={'selectedStartYear'}
              type={'selectedStartYear'}
              id="selectedStartYear"
              value={startYear || ''}
              onChange={e => {
                this.props.handleChange(e)
              }}
            >
              <option defaultValue value="" disabled>
                Select Year
              </option>
              {yearList.map(({ label, value }) => {
                let date = moment(`${label} ${startMonth}`, 'YYYY MMMM')
                  .utc()
                  .startOf('month')
                let valid = endDate.diff(date, 'month') > 0
                if (valid)
                  return (
                    <option value={value} key={`options-${label}-${value}`}>
                      {label}
                    </option>
                  )
                return ''
              })}
            </select>
          </div>
        </div>
        <div className={styles.customYear}>
          <div>Ending : </div>
          <label>Month</label>
          <div className={styles.selectContainer}>
            <select
              name={'selectedEndMonth'}
              type={'selectedEndMonth'}
              id="selectedEndMonth"
              value={endMonth || ''}
              onChange={e => {
                this.props.handleChange(e)
              }}
            >
              <option defaultValue value="">
                Select Month
              </option>
              {monthList.map(({ label, value }) => {
                let date = moment(`${endYear} ${label}`, 'YYYY MMMM')
                  .utc()
                  .startOf('month')
                let now = moment()
                  .utc()
                  .startOf('month')
                let valid =
                  date.diff(startDate, 'month') > 0 &&
                  now.diff(date, 'month') >= 0
                if (valid)
                  return (
                    <option value={value} key={`options-${label}-${value}`}>
                      {label}
                    </option>
                  )
                return ''
              })}
            </select>
          </div>
          <label>Year</label>
          <div className={styles.selectContainer}>
            <select
              name={'selectedEndYear'}
              type={'selectedEndYear'}
              id="selectedEndYear"
              value={endYear || ''}
              onChange={e => {
                this.props.handleChange(e)
              }}
            >
              <option defaultValue value="">
                Select Year
              </option>
              {yearList.map(({ label, value }) => {
                let date = moment(`${label} ${endMonth}`, 'YYYY MMMM')
                  .utc()
                  .startOf('month')
                let valid = date.diff(startDate, 'month') > 0
                if (valid)
                  return (
                    <option value={value} key={`options-${label}-${value}`}>
                      {label}
                    </option>
                  )
                return ''
              })}
            </select>
          </div>
        </div>
        {!dateInvalid && (
          <div className={styles.error}>
            <span>Limited to 3 years</span>
          </div>
        )}
      </div>
    )
  }
}
export default CustomYearRange
