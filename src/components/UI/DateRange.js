import React, { Component } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import moment from 'moment'
import styles from './DateRange.scss'
import { _getValueFromObjPerPath } from 'utils/Utils'

class DateRange extends Component {
  static propTypes = {
    handleFilterOptionSelect: PropTypes.func.isRequired
  }

  state = {
    show: true,
    start: '',
    end: ''
  }

  componentWillMount = () => {
    document.addEventListener('mousedown', this.handleClick, false)
    this.setState({
      start: moment()
        .subtract(1, 'month')
        .utc()
        .format('YYYY-MM-DD'),
      end: moment()
        .utc()
        .format('YYYY-MM-DD')
    })
  }

  componentWillUnmount = () => {
    document.removeEventListener('mousedown', this.handleClick, false)
    this.setState({ show: false })
  }

  componentDidMount() {
    const { selectedItem } = this.props
    const { options } = selectedItem
    if (options) {
      this.setState({
        start: options.start,
        end: options.end
      })
    }
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
    this.props.handleFilterOptionSelect()
  }

  handleChangeStart = e => {
    this.setState({ start: e.target.value })
  }

  handleChangeEnd = e => {
    this.setState({ end: e.target.value })
  }

  handleApplySelect = () => {
    const { start, end } = this.state
    this.props.handleFilterOptionSelect({ start, end })
    this.setState({ show: false })
  }

  render() {
    const { show, start, end } = this.state
    if (!show) return <div></div>
    return (
      <div
        className={classNames(styles.dateRangeContainer)}
        ref={node => (this.node = node)}
      >
        <div className={styles.dateRangeContainerHeader}>
          <p>Date Range</p>
          <i
            className={classNames('material-icons', styles.deleteIcon)}
            onClick={this.handleToggle}
          >
            close
          </i>
        </div>
        <div className={styles.dateRangeContainerBody}>
          <div className={classNames(styles.dateRangeField)}>
            <input
              type="date"
              name="start"
              value={start || ''}
              onChange={e => this.handleChangeStart(e)}
            />
          </div>
          <i className="material-icons">remove</i>
          <div className={classNames(styles.dateRangeField)}>
            <input
              type="date"
              name="end"
              value={end || ''}
              onChange={e => this.handleChangeEnd(e)}
            />
          </div>
        </div>
        <div className={styles.dateRangeContainerFooter}>
          <button
            className={classNames(styles.button, styles.buttonPrimary)}
            onClick={this.handleApplySelect}
          >
            Apply
          </button>
        </div>
      </div>
    )
  }
}
export default DateRange
