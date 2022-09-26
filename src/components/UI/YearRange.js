import React, { Component } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import moment from 'moment'
import styles from './YearRange.scss'
import { _getValueFromObjPerPath } from 'utils/Utils'

class YearRange extends Component {
  static propTypes = {
    handleFilterOptionSelect: PropTypes.func.isRequired,
    selectedItem: PropTypes.object.isRequired,
    itemList: PropTypes.array.isRequired
  }

  state = {
    show: true,
    start: '',
    end: '',
    yearList: []
  }

  UNSAFE_componentWillMount = () => {
    const { selectedItem, itemList } = this.props
    let num = 0
    let yearList = []

    document.addEventListener('mousedown', this.handleClick, false)
    let years = itemList.map(item =>
      _getValueFromObjPerPath.call(item, selectedItem.value)
    )
    const max = Math.max(...years)
    const min = Math.min(...years)
    if (max && min) {
      for (let i = max; i >= min; i--) {
        yearList.push(i)
      }
    } else {
      yearList = Array.apply(null, { length: 100 }).map(
        (e, i) =>
          +moment()
            .subtract(num++, 'years')
            .format('YYYY')
      )
    }
    this.setState({ yearList })
  }

  componentWillUnmount = () => {
    document.removeEventListener('mousedown', this.handleClick, false)
    this.setState({ show: false })
  }

  componentDidMount() {
    const { yearList } = this.state
    const { selectedItem } = this.props
    this.setState(prevState => ({
      start:
        selectedItem.options && selectedItem.options.start
          ? selectedItem.options.start
          : prevState.start === ''
          ? yearList[yearList.length - 1]
          : prevState.start,
      end:
        selectedItem.options && selectedItem.options.end
          ? selectedItem.options.end
          : prevState.end === ''
          ? yearList[0]
          : prevState.end
    }))
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
    const { show, yearList, start, end } = this.state
    if (!show) return <div></div>
    return (
      <div
        className={classNames(styles.yearRangeContainer)}
        ref={node => (this.node = node)}
      >
        <div className={styles.yearRangeContainerHeader}>
          <p>Year Range</p>
          <i
            className={classNames('material-icons', styles.deleteIcon)}
            onClick={this.handleToggle}
          >
            close
          </i>
        </div>
        <div className={styles.yearRangeContainerBody}>
          <div
            className={classNames(styles.selectContainer, styles.rangeField)}
          >
            <select value={start} onChange={e => this.handleChangeStart(e)}>
              <option defaultValue disabled value="">
                Select Range
              </option>
              {yearList.map((item, index) =>
                item < end ? (
                  <option value={item} key={`options-${item}-${index}`}>
                    {item}
                  </option>
                ) : (
                  ''
                )
              )}
            </select>
          </div>
          <i className="material-icons">remove</i>
          <div
            className={classNames(styles.selectContainer, styles.rangeField)}
          >
            <select value={end} onChange={e => this.handleChangeEnd(e)}>
              <option defaultValue disabled value="">
                Select Range
              </option>
              {yearList.map((item, index) =>
                item > start ? (
                  <option value={item} key={`options-${item}-${index}`}>
                    {item}
                  </option>
                ) : (
                  ''
                )
              )}
            </select>
          </div>
        </div>
        <div className={styles.yearRangeContainerFooter}>
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
export default YearRange
