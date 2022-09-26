import React, { Component } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { connect } from 'react-redux'
import styles from './MultiSelect.scss'
import { findBuildingUseName, _getValueFromObjPerPath } from 'utils/Utils'
import { getValueArrayFromArray, sortFunction } from 'utils/Portfolio'
import { formatStringUpperCase } from '../../components/Project/ProjectHelpers'

class MutliSelect extends Component {
  static propTypes = {
    handleFilterOptionSelect: PropTypes.func.isRequired,
    selectedItem: PropTypes.object.isRequired,
    filters: PropTypes.arrayOf(PropTypes.object).isRequired,
    itemList: PropTypes.array.isRequired,
    organizationList: PropTypes.array.isRequired,
    organizationView: PropTypes.object.isRequired
  }

  state = {
    show: true,
    selectAll: false,
    deSelectedAll: false,
    options: [],
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
    if (
      nextProps.selectedItem.value != this.props.selectedItem.value ||
      nextProps.organizationList != this.props.organizationList ||
      nextProps.authors != this.props.authors
    ) {
      this.setOptions(nextProps.selectedItem)
    }
  }

  setOptions = selectedItem => {
    let options = []
    let optionList = []
    let { filters, itemList, organizationList, organizationView } = this.props
    filters = filters.filter(filter => filter.value === selectedItem.value)
    options = filters.map(item => item.options)
    if (
      selectedItem &&
      selectedItem.value &&
      selectedItem.value.toLowerCase().includes('organization')
    ) {
      optionList = organizationList
        .filter(organization => organization._id !== organizationView._id)
        .map(organization => {
          let value = organization.name || ''
          value =
            (value &&
              value[0].toUpperCase() + value.substring(1, value.length)) ||
            ''
          return {
            value: organization._id,
            name: value
          }
        })
      let selectedValue = organizationView.name || ''
      selectedValue =
        (selectedValue &&
          selectedValue[0].toUpperCase() +
            selectedValue.substring(1, selectedValue.length)) ||
        ''
      if (selectedValue)
        optionList = [
          {
            value: organizationView._id,
            name: selectedValue
          },
          ...optionList
        ]
      if (!options.length && selectedValue) {
        options = [
          {
            value: organizationView._id,
            name: selectedValue
          }
        ]
      }
    } else {
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
        } else if (selectedItem.value.includes('createdBy.id')) {
          value = _getValueFromObjPerPath.call(item, 'createdBy.name')
          let id = _getValueFromObjPerPath.call(item, 'createdBy.id')
          if (value) {
            optionList.push({
              value: id,
              name: value
            })
          }
          return
        } else value = _getValueFromObjPerPath.call(item, selectedItem.value)
        if (value && typeof value === 'object') {
          if (selectedItem.value === 'buildingUseTypes.use') {
            value.forEach(item => {
              let label = findBuildingUseName(item)
              optionList.push({
                value: item,
                name: label
              })
            })
          } else {
            value.forEach(item =>
              optionList.push({
                value: item,
                name: item
              })
            )
          }
        } else if (value) {
          if (selectedItem.value === 'buildinguse') {
            let label = findBuildingUseName(value)
            if (label !== '-') {
              optionList.push({
                value: value,
                name: label
              })
            }
          } else {
            optionList.push({
              value: value,
              name: value
            })
          }
        }
      })
      // authors
      if (selectedItem.value.includes('createdBy.id')) {
        // let { authors = [] } = this.props
        // authors = authors.map(item => ({
        //   value: item.id,
        //   name: item.name
        // }))
        // let newOptionList = [...optionList, ...authors]
        let newOptionList = [...optionList]
        optionList = []
        let authorSet = new Set()
        for (let item of newOptionList) {
          if (!authorSet.has(item.value)) {
            optionList.push({
              value: item.value,
              name: item.name
            })
            authorSet.add(item.value)
          }
        }
      } else {
        //remove the depulicates from optionList
        optionList = optionList.reduce((option, current) => {
          const index = option.find(item => item.value === current.value)
          let label = current
          if (!index) {
            return option.concat([current])
          }
          return option
        }, [])
      }
      // sort by name
      optionList = sortFunction(optionList, 'name')
    }
    if (
      (selectedItem.options && selectedItem.options.selectedAll) ||
      (filters.length && filters[0].options.selectedAll)
    )
      options = optionList
    this.setState({
      optionList: optionList,
      options: options,
      selectedAll: optionList.length
        ? options.length === optionList.length
        : false,
      deSelectedAll: optionList.length ? options.length === 0 : false
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

  handleCheckOption = (e, item) => {
    let { options, optionList, selectedAll, deSelectedAll } = this.state
    if (item === 'selectAll') {
      if (!selectedAll) options = optionList
      else options = []
    } else if (item === 'deSelectAll') {
      if (!deSelectedAll) options = []
      else options = optionList
    } else {
      const index = options.findIndex(
        option =>
          option && option.value !== undefined && option.value === item.value
      )
      if (index === -1) {
        options = [...options, item]
      } else {
        options = [...options.slice(0, index), ...options.slice(index + 1)]
      }
    }
    this.setState({
      options,
      selectedAll: options.length === optionList.length,
      deSelectedAll: options.length === 0
    })
  }

  handleApplySelect = () => {
    const { options, optionList } = this.state
    this.props.handleFilterOptionSelect(
      options,
      options.length === optionList.length
    )
    this.setState({ show: false })
  }

  render() {
    const { show, optionList, options } = this.state
    const { selectedItem } = this.props

    if (!show) return <div></div>
    return (
      <div
        className={classNames(styles.multiSelectContainer)}
        ref={node => (this.node = node)}
      >
        <div className={styles.multiSelectContainerHeader}>
          <p>Select {selectedItem.label}</p>
          <i
            className={classNames('material-icons', styles.deleteIcon)}
            onClick={this.handleToggle}
          >
            close
          </i>
        </div>
        <div className={classNames(styles.multiSelectContainerBody)}>
          <label
            key={`multiSelect-select-all`}
            className={classNames(
              styles['__input'],
              styles['__input--checkboxes']
            )}
          >
            <input
              defaultChecked={this.state.selectedAll}
              value={this.state.selectedAll}
              onChange={e => this.handleCheckOption(e, 'selectAll')}
              className={classNames(
                this.state.selectedAll ? styles.checked : ''
              )}
              type="checkbox"
            />
            <span>Select All</span>
          </label>

          <label
            key={`multiSelect-deselect-all`}
            className={classNames(
              styles['__input'],
              styles['__input--checkboxes']
            )}
          >
            <input
              defaultChecked={this.state.deSelectedAll}
              value={this.state.deSelectedAll}
              onChange={e => this.handleCheckOption(e, 'deSelectAll')}
              className={classNames(
                this.state.deSelectedAll ? styles.checked : ''
              )}
              type="checkbox"
            />
            <span>Deselect All</span>
          </label>

          {optionList.map((item, index) => {
            const checked =
              options.findIndex(
                option =>
                  option &&
                  option.value !== undefined &&
                  option.value === item.value
              ) !== -1

            return (
              <label
                key={`multiSelect-${index}`}
                className={classNames(
                  styles['__input'],
                  styles['__input--checkboxes']
                )}
              >
                <input
                  defaultChecked={checked}
                  value={item.value}
                  onChange={e => this.handleCheckOption(e, item)}
                  className={classNames(checked ? styles.checked : '')}
                  type="checkbox"
                />
                <span>{formatStringUpperCase(item.name)}</span>
              </label>
            )
          })}
        </div>
        <div className={styles.multiSelectContainerFooter}>
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
const mapDispatchToProps = {}

const mapStateToProps = state => ({
  organizationList: state.organization.organizationList,
  organizationView: state.organization.organizationView,
  authors: state.portfolio.authors
})

export default connect(mapStateToProps, mapDispatchToProps)(MutliSelect)
