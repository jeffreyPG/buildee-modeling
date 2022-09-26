import React, { Component } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import styles from './SingleSelect.scss'
import { _getValueFromObjPerPath } from 'utils/Utils'
import { getValueArrayFromArray, sortFunction } from 'utils/Portfolio'

class SingleSelect extends Component {
  static propTypes = {
    handleFilterOptionSelect: PropTypes.func.isRequired,
    selectedItem: PropTypes.object.isRequired,
    itemList: PropTypes.array
  }

  state = {
    show: true,
    option: '',
    optionList: []
  }

  UNSAFE_componentWillMount = () => {
    document.addEventListener('mousedown', this.handleClick, false)
  }

  componentWillUnmount = () => {
    document.removeEventListener('mousedown', this.handleClick, false)
    this.setState({ show: false })
  }

  componentDidMount = () => {
    this.setOptions(this.props.selectedItem)
  }

  UNSAFE_componentWillReceiveProps = nextProps => {
    if (nextProps.selectedItem.value != this.props.selectedItem.value) {
      this.setOptions(nextProps.selectedItem)
    }
  }

  setOptions = selectedItem => {
    const { itemList } = this.props
    let option = { value: '', name: '' }

    if (selectedItem.options) {
      option = selectedItem.options
    }
    let optionList = []
    itemList.forEach(item => {
      let value
      if (selectedItem.value === 'buildingUseTypes.use') {
        const buildingUseTypes = _getValueFromObjPerPath.call(
          item,
          'buildingUseTypes'
        )
        value = getValueArrayFromArray(
          buildingUseTypes,
          selectedItem.value.substring(
            selectedItem.value.indexOf('buildingUseTypes') +
              'buildingUseTypes'.length +
              1
          )
        )
      } else value = _getValueFromObjPerPath.call(item, selectedItem.value)
      if (typeof value === 'object') {
        if (value) {
          value.map(item =>
            optionList.push({
              value: item,
              name: item
            })
          )
        }
      } else if (value) {
        optionList.push({
          value: value,
          name: value
        })
      }
    })
    optionList = optionList
      .filter(item => item != undefined)
      .reduce((option, current) => {
        const index = option.find(item => item.value === current.value)
        let label = current
        if (selectedItem.value === 'buildinguse')
          label.name =
            label.name[0].toUpperCase() +
            label.name.substring(1, label.name.length)
        if (!index) {
          return option.concat([label])
        }
        return option
      }, [])

    optionList = sortFunction(optionList, 'name')

    this.setState({
      optionList: optionList,
      option,
      show: true
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
    this.props.handleFilterOptionSelect()
  }

  handleSelectOption = (e, item) => {
    this.setState({ option: item })
  }

  handleApplySelect = () => {
    const { option } = this.state
    this.props.handleFilterOptionSelect(option)
    this.setState({ show: false })
  }

  render() {
    const { show, optionList, option } = this.state
    const { selectedItem } = this.props

    if (!show) return <div></div>
    return (
      <div
        className={classNames(styles.singleSelectContainer)}
        ref={node => (this.node = node)}
      >
        <div className={styles.singleSelectContainerHeader}>
          <p>Select {selectedItem.label}</p>
          <i
            className={classNames('material-icons', styles.deleteIcon)}
            onClick={this.handleToggle}
          >
            close
          </i>
        </div>
        <div
          className={classNames(
            styles.singleSelectContainerBody,
            styles.radioContainer
          )}
        >
          {optionList.map((item, index) => {
            return (
              <label key={`singleSelect-${index}`}>
                <input
                  type="radio"
                  name="open247"
                  value={item.value}
                  checked={option.value === item.value}
                  onChange={e => this.handleSelectOption(e, item)}
                />
                <span className={styles.radioSpan}>{item.name}</span>
              </label>
            )
          })}
        </div>
        <div className={styles.singleSelectContainerFooter}>
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
export default SingleSelect
