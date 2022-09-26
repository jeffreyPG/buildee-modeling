import React, { Component } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import styles from './Range.scss'
import { _getValueFromObjPerPath } from 'utils/Utils'
import { getValueArrayFromArray, getAverageOfArray } from 'utils/Portfolio'
import { round } from 'lodash'
class Range extends Component {
  static propTypes = {
    handleFilterOptionSelect: PropTypes.func.isRequired,
    selectedItem: PropTypes.object.isRequired,
    itemList: PropTypes.arrayOf(PropTypes.object).isRequired
  }

  state = {
    show: true,
    start: 0,
    end: 1
  }

  UNSAFE_componentWillMount = () => {
    document.addEventListener('mousedown', this.handleClick, false)
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
    } else {
      let values = []
      this.props.itemList.forEach(item => {
        let value
        if (selectedItem.value.includes('monthlyUtilities')) {
          let monthlyUtilities =
            _getValueFromObjPerPath.call(item, 'monthlyUtilities') || []
          value =
            getValueArrayFromArray(
              monthlyUtilities,
              selectedItem.value.substring(
                selectedItem.value.indexOf('monthlyUtilities') +
                  'monthlyUtilities'.length +
                  1
              )
            ) || []
          if (value.length) {
            value = getAverageOfArray(value)
          } else value = 0
          values = [...values, value]
        } else if (selectedItem.value === 'buildingPmScores.score') {
          let buildingPmScores =
            _getValueFromObjPerPath.call(item, 'buildingPmScores') || []
          value =
            getValueArrayFromArray(
              buildingPmScores,
              selectedItem.value.substring(
                selectedItem.value.indexOf('buildingPmScores') +
                  'buildingPmScores'.length +
                  1
              )
            ) || []
          value = value
            .filter(item => !!item && !isNaN(item))
            .map(item => +item)
          if (value.length) {
            value = Math.max(...value)
          } else value = 0
          values = [...values, value]
        } else if (selectedItem.value.includes('buildingUseTypes')) {
          let buildingUseTypes =
            _getValueFromObjPerPath.call(item, 'buildingUseTypes') || []
          value =
            getValueArrayFromArray(
              buildingUseTypes,
              selectedItem.value.substring(
                selectedItem.value.indexOf('buildingUseTypes') +
                  'buildingUseTypes'.length +
                  1
              )
            ).filter(item => item != undefined) || []
          values = [...values, ...value]
        } else if (selectedItem.value == 'projects') {
          value = (item.projects && item.projects.length) || 0
          values.push(value)
        } else {
          value = _getValueFromObjPerPath.call(item, selectedItem.value)
          if (value != undefined) values.push(value)
        }
      })
      if (values.length) {
        const max = Math.max(...values)
        const min = Math.min(...values)
        this.setState({
          start: round(min),
          end: round(max)
        })
      } else {
        this.setState({
          start: 0,
          end: 1
        })
      }
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

  handleChange = (e, key) => {
    this.setState({ [key]: e.target.value })
  }

  handleApplySelect = () => {
    let { start, end } = this.state
    start = +start
    end = +end
    this.props.handleFilterOptionSelect({ start, end })
    this.setState({ show: false })
  }

  render() {
    const { show, start, end } = this.state

    if (!show) return <div></div>
    return (
      <div
        className={classNames(styles.rangeContainer)}
        ref={node => (this.node = node)}
      >
        <div className={styles.rangeContainerHeader}>
          <p>Range</p>
          <i
            className={classNames('material-icons', styles.deleteIcon)}
            onClick={this.handleToggle}
          >
            close
          </i>
        </div>
        <div className={styles.rangeContainerBody}>
          <div className={classNames(styles.rangeField)}>
            <input
              type="number"
              onChange={e => this.handleChange(e, 'start')}
              value={start}
            />
          </div>
          <i className="material-icons">remove</i>
          <div className={classNames(styles.rangeField)}>
            <input
              type="number"
              onChange={e => this.handleChange(e, 'end')}
              value={end}
            />
          </div>
        </div>
        <div className={styles.validationError}>
          {+start > +end ? 'Please select correct Start and End Range.' : ''}
        </div>
        <div className={styles.rangeContainerFooter}>
          <button
            className={classNames(styles.button, styles.buttonPrimary, {
              [styles.buttonDisable]: +start > +end
            })}
            onClick={this.handleApplySelect}
            disabled={+start > +end}
          >
            Apply
          </button>
        </div>
      </div>
    )
  }
}
export default Range
