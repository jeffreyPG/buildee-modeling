import React, { Component } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import buildingTypes from 'static/building-types'
import { parentNodeHasClass } from 'utils/Utils'

import styles from './UseTypeDropDown.scss'
import headerStyles from 'containers/Header/LoggedInHeader.scss'

const cleanBuildingTypes = (
  removeUseTypes,
  onlyAvailableBuildingUseTypes = []
) => {
  let disabledUseTypes = removeUseTypes.map(item => item.toLowerCase())
  let availableUseTypes = onlyAvailableBuildingUseTypes.map(item =>
    item.toLowerCase()
  )
  let mode = 'NORMAL'

  if (disabledUseTypes.length > 0 && availableUseTypes.length === 0) {
    mode = 'REMOVE'
  }
  if (disabledUseTypes.length === 0 && availableUseTypes.length > 0) {
    mode = 'ONLY_AVAILABLE'
  }

  let allBuildingTypes = buildingTypes.filter(buildingUseType => {
    let value = buildingUseType.value.toLowerCase()
    if (mode === 'REMOVE' || mode === 'NORMAL') {
      if (disabledUseTypes.includes(value)) return false
      for (let disabledUseType of disabledUseTypes) {
        if (value.includes(disabledUseType)) return false
      }
      return true
    } else {
      if (availableUseTypes.includes(value)) return true
      for (let disabledUseType of disabledUseTypes) {
        if (availableUseTypes.includes(disabledUseType)) return true
      }
      return false
    }
  })

  let cleanedBuildingTypes = allBuildingTypes.filter(
    item => !item.value.includes('other')
  )
  let otherItems = buildingTypes.filter(item => item.value.includes('other'))
  if (availableUseTypes.length === 0 || availableUseTypes.includes('other')) {
    cleanedBuildingTypes.push({
      value: 'other',
      name: 'Other',
      subFields: otherItems
    })
  }
  return cleanedBuildingTypes
}

class UseTypeDropDown extends Component {
  static propTypes = {
    useType: PropTypes.string,
    onChange: PropTypes.func,
    removeUseTypes: PropTypes.array,
    onlyAvailableBuildingUseTypes: PropTypes.array
  }

  state = {
    cleanedBuildingTypes: [],
    showUseTypeDropDown: false,
    showOtherList: false,
    top: 0,
    left: 0
  }

  UNSAFE_componentWillMount = () => {
    this.refs = []
    document.addEventListener('mousedown', this.handleReportsClick, false)
    document.addEventListener('scroll', this.handleScroll, false)
  }

  componentDidMount = () => {
    const {
      removeUseTypes = [],
      onlyAvailableBuildingUseTypes = []
    } = this.props
    this.setState({
      cleanedBuildingTypes: cleanBuildingTypes(
        removeUseTypes,
        onlyAvailableBuildingUseTypes
      )
    })
  }

  componentWillUnmount = () => {
    document.removeEventListener('mousedown', this.handleReportsClick, false)
    document.removeEventListener('scroll', this.handleScroll, false)
  }

  handleReportsClick = e => {
    // the click is inside, continue to menu links
    if (parentNodeHasClass(e.target, 'reportsClick')) return
    // otherwise, toggle (close) the dropdowns
    this.setState({ showUseTypeDropDown: false, showOtherList: false })
  }

  toogleUseTypeDropdown = () => {
    const showUseTypeDropDown = this.state.showUseTypeDropDown
    if (showUseTypeDropDown) {
      const dropdownElement = document.getElementById('firstDropdown')
      if (dropdownElement) {
        dropdownElement.removeEventListener('scroll', this.handleScroll, false)
      }
    }
    this.setState(prevState => {
      return {
        ...prevState,
        showUseTypeDropDown: !prevState.showUseTypeDropDown
      }
    })
  }

  handleScroll = () => {
    if (this.state.showUseTypeDropDown) {
      const dropdownElement = document.getElementById('firstDropdown')
      let top = 0
      let left = 0
      const rect = dropdownElement.getBoundingClientRect()
      if (rect) {
        top = rect.bottom - 30
        left = rect.left + rect.width
      }
      this.setState({
        top,
        left
      })
    }
  }

  handleSelectUseType = (event, useType) => {
    event.stopPropagation()
    if (useType === 'other') {
      this.setState({
        showUseTypeDropDown: true,
        showOtherList: true
      })
      const dropdownElement = document.getElementById('firstDropdown')
      if (dropdownElement) {
        dropdownElement.addEventListener('scroll', this.handleScroll, false)
      }
      this.handleScroll()
    } else {
      this.setState({
        showUseTypeDropDown: false,
        showOtherList: false
      })
      const dropdownElement = document.getElementById('firstDropdown')
      if (dropdownElement) {
        dropdownElement.removeEventListener('scroll', this.handleScroll, false)
      }
      this.props.onChange(useType)
    }
  }

  render() {
    const { useType } = this.props
    const {
      cleanedBuildingTypes,
      showUseTypeDropDown,
      showOtherList
    } = this.state
    let useTypeName = 'Select'
    if (useType) {
      let buildingType = _.find(buildingTypes, { value: useType })
      if (buildingType) useTypeName = buildingType.name
    }
    return (
      <div
        className={classNames(headerStyles.link, 'reportsClick', styles.main)}
      >
        <div
          className={classNames(
            styles.dropdown,
            headerStyles.link,
            'reportsClick'
          )}
          onClick={this.toogleUseTypeDropdown}
          data-test="use-type-link"
        >
          <span>{useTypeName}</span>
          <div className={styles.selectIcons}>
            <i className={classNames('material-icons', styles.selectArrow)}>
              arrow_drop_down
            </i>
          </div>
          {showUseTypeDropDown && (
            <ul className={styles.firstDropdown} id="firstDropdown">
              {cleanedBuildingTypes.map(buildingType => {
                const isOtherUseType = buildingType.value === 'other'
                const subFields = buildingType.subFields || []
                return (
                  <div key={buildingType.name}>
                    <li
                      onClick={event =>
                        this.handleSelectUseType(event, buildingType.value)
                      }
                      ref={node => {
                        this.refs[buildingType.value] = node
                      }}
                    >
                      <div className={styles.usetypeLabel}>
                        {buildingType.name}
                      </div>
                      {showOtherList && isOtherUseType && !!subFields.length && (
                        <ul
                          className={styles.secondDropdown}
                          style={{
                            top: this.state.top,
                            left: this.state.left
                          }}
                        >
                          {subFields.map(subField => (
                            <div key={subField.name}>
                              <li
                                onClick={event =>
                                  this.handleSelectUseType(
                                    event,
                                    subField.value
                                  )
                                }
                              >
                                {subField.name}
                              </li>
                            </div>
                          ))}
                        </ul>
                      )}
                    </li>
                  </div>
                )
              })}
            </ul>
          )}
        </div>
      </div>
    )
  }
}
export default UseTypeDropDown
