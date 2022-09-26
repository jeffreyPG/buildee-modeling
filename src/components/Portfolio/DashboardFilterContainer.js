import React, { Component } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import _ from 'lodash'
import styles from './PortfolioContainer.scss'
import DashboardFilter from '../UI/DashboardFilter'
import Range from '../UI/Range'
import MultiSelect from '../UI/MultiSelect'
import SingleSelect from '../UI/SingleSelect'
import CostRange from '../UI/CostRange'
import DateRange from '../UI/DateRange'
import YearRange from '../UI/YearRange'
import TimeRange from '../UI/TimeRange'
import { formatUnit } from 'utils/Portfolio'
import { formatStringUpperCase } from '../Project/ProjectHelpers'
import { findBuildingUseName } from 'utils/Utils'
import BuildingGroupFilter from './BuildingGroupFilter'

class DashboardFilterContainer extends Component {
  static propTypes = {
    user: PropTypes.object.isRequired,
    handleShowFilter: PropTypes.func.isRequired,
    handleFilterChange: PropTypes.func.isRequired,
    showFilter: PropTypes.bool.isRequired,
    FilterOptions: PropTypes.array.isRequired,
    activeTab: PropTypes.string.isRequired,
    dashboard: PropTypes.object.isRequired,
    dashboardFilters: PropTypes.array.isRequired,
    loading: PropTypes.bool.isRequired
  }

  state = {
    selectedFilterItem: null,
    editFilterItem: null,
    editFilterIndex: -1,
    collapse: true
  }

  UNSAFE_componentWillReceiveProps = nextProps => {
    if (nextProps.showFilter != this.props.showFilter && nextProps.showFilter) {
      let filters = nextProps.dashboardFilters || []
      let alltext = filters
        .filter((item, index) => !this.isAlreadyShownMultiSelect(item, index))
        .map(item => this.renderFilterText(item))
        .join('')
      this.setState({ collapse: alltext.length >= 125 ? false : false })
    }
  }

  collapse = () => {
    this.setState(prevState => ({
      collapse: !prevState.collapse
    }))
  }

  removeFilter = (event, item) => {
    event.stopPropagation()
    const { dashboardFilters, handleFilterChange } = this.props
    if (item.select !== 'multiSelect') {
      let index = dashboardFilters.findIndex(
        filter => filter.value === item.value
      )
      if (index !== -1)
        handleFilterChange([
          ...dashboardFilters.slice(0, index),
          ...dashboardFilters.slice(index + 1)
        ])
    } else {
      let newFilters =
        dashboardFilters.filter(filter => filter.value !== item.value) || []
      handleFilterChange(newFilters)
    }
  }

  handleAddFilter = item => {
    this.setState({ selectedFilterItem: item })
  }

  handleEditFilter = (item, index) => {
    this.setState({ editFilterItem: item, editFilterIndex: index })
  }

  handleFilterOptionSelect = (options, selectedAll) => {
    const { selectedFilterItem } = this.state
    let { dashboardFilters: filters } = this.props
    if (options) {
      const index = filters.findIndex(
        filter =>
          filter &&
          filter.value !== undefined &&
          filter.value === selectedFilterItem.value
      )
      if (selectedFilterItem.select === 'multiSelect') {
        let oldFilters = filters.filter((filter, index) => {
          if (filter.value !== selectedFilterItem.value) return filter
          const optionIndex = options.findIndex(
            option =>
              filter &&
              filter.value !== undefined &&
              filter.value === selectedFilterItem.value &&
              filter.options &&
              filter.options.value === option.value
          )
          if (optionIndex !== -1) {
            options = [
              ...options.slice(0, optionIndex),
              ...options.slice(optionIndex + 1)
            ]
            return filter
          }
        })
        const newFilters = options.map((option, index) => {
          return {
            ...selectedFilterItem,
            options: option
          }
        })
        if (!selectedAll)
          this.props.handleFilterChange([...oldFilters, ...newFilters])
        else {
          oldFilters = filters.filter(
            filter =>
              filter &&
              filter.value !== undefined &&
              filter.value !== selectedFilterItem.value
          )
          this.props.handleFilterChange([
            ...oldFilters,
            {
              ...selectedFilterItem,
              options: {
                selectedAll: selectedAll
              }
            }
          ])
        }
      } else {
        if (index !== -1) {
          this.props.handleFilterChange([
            ...filters.slice(0, index),
            {
              ...selectedFilterItem,
              options: options
            },
            ...filters.slice(index + 1)
          ])
        } else {
          this.props.handleFilterChange([
            ...filters,
            {
              ...selectedFilterItem,
              options: options
            }
          ])
        }
      }
    }
    this.setState({ selectedFilterItem: null, selectedFilterItem: -1 })
  }

  handleEditFilterOption = (options, selectedAll) => {
    const { editFilterItem } = this.state
    let { dashboardFilters: filters } = this.props
    if (options) {
      const index = filters.findIndex(
        filter =>
          filter &&
          filter.value !== undefined &&
          filter.value === editFilterItem.value
      )
      if (editFilterItem.select === 'multiSelect') {
        let oldFilters = filters.filter((filter, index) => {
          if (filter.value !== editFilterItem.value) return filter
          const optionIndex = options.findIndex(
            option =>
              filter &&
              filter.value !== undefined &&
              filter.value === editFilterItem.value &&
              filter.options &&
              filter.options.value === option.value
          )
          if (optionIndex !== -1) {
            options = [
              ...options.slice(0, optionIndex),
              ...options.slice(optionIndex + 1)
            ]
            return filter
          }
        })
        const newFilters = options.map((option, index) => {
          return {
            ...editFilterItem,
            options: option
          }
        })
        if (!selectedAll)
          this.props.handleFilterChange([...oldFilters, ...newFilters])
        else {
          oldFilters = filters.filter(
            filter =>
              filter &&
              filter.value !== undefined &&
              filter.value !== editFilterItem.value
          )
          this.props.handleFilterChange([
            ...oldFilters,
            {
              ...editFilterItem,
              options: {
                selectedAll: selectedAll
              }
            }
          ])
        }
      } else {
        if (index !== -1) {
          this.props.handleFilterChange([
            ...filters.slice(0, index),
            {
              ...editFilterItem,
              options: options
            },
            ...filters.slice(index + 1)
          ])
        } else {
          this.props.handleFilterChange([
            ...filters,
            {
              ...editFilterItem,
              options: options
            }
          ])
        }
      }
    }
    this.setState({ editFilterItem: null, editFilterIndex: -1 })
  }

  getItemList = item => {
    let itemList = []
    if (item) {
      switch (item.tab) {
        case 'building':
          itemList =
            (this.props.dashboard && this.props.dashboard.buildings) || []
          break
        case 'project':
          itemList =
            (this.props.dashboard && this.props.dashboard.projects) || []
          break
        case 'projectPackage':
          itemList =
            (this.props.dashboard && this.props.dashboard.projectPackages) || []
          break
        case 'proposal':
          itemList =
            (this.props.dashboard && this.props.dashboard.proposals) || []
          break
        case 'all':
          {
            switch (this.props.activeTab) {
              case 'building':
                itemList =
                  (this.props.dashboard && this.props.dashboard.buildings) || []
                break
              case 'project':
                itemList =
                  (this.props.dashboard && this.props.dashboard.projects) || []
                break
              case 'projectPackage':
                itemList =
                  (this.props.dashboard &&
                    this.props.dashboard.projectPackages) ||
                  []
                break
              case 'proposal':
                itemList =
                  (this.props.dashboard && this.props.dashboard.proposals) || []
                break
              default:
                itemList =
                  (this.props.dashboard && this.props.dashboard.buildings) || []
                break
            }
          }
          break
      }
    }
    return itemList
  }

  renderFilterComponent = (item, handleFilter) => {
    let { dashboardFilters } = this.props
    let filters = dashboardFilters
    let itemList = this.getItemList(item)

    switch (item.select) {
      case 'multiSelect':
        return (
          <MultiSelect
            filters={filters}
            itemList={itemList}
            selectedItem={item}
            handleFilterOptionSelect={handleFilter}
          />
        )
      case 'singleSelect':
        return (
          <SingleSelect
            selectedItem={item}
            itemList={itemList}
            handleFilterOptionSelect={handleFilter}
          />
        )
      case 'range':
        return (
          <Range
            selectedItem={item}
            handleFilterOptionSelect={handleFilter}
            itemList={itemList}
          />
        )
      case 'yearRange':
        return (
          <YearRange
            selectedItem={item}
            handleFilterOptionSelect={handleFilter}
            itemList={itemList}
          />
        )
      case 'dateRange':
        return (
          <DateRange
            selectedItem={item}
            handleFilterOptionSelect={handleFilter}
          />
        )
      case 'costRange':
        return (
          <CostRange
            selectedItem={item}
            handleFilterOptionSelect={handleFilter}
            itemList={itemList}
          />
        )
    }
  }

  renderAddFilterComponent = () => {
    const { selectedFilterItem } = this.state
    if (selectedFilterItem == null) return null
    return this.renderFilterComponent(
      selectedFilterItem,
      this.handleFilterOptionSelect
    )
  }

  renderEditFilterComponent = index => {
    const { editFilterItem, editFilterIndex } = this.state
    if (editFilterItem == null || index !== editFilterIndex) return null
    return this.renderFilterComponent(
      editFilterItem,
      this.handleEditFilterOption
    )
  }

  renderCollapse = () => {
    let { dashboardFilters } = this.props
    let filters = dashboardFilters || []
    let alltext = filters
      .filter((item, index) => !this.isAlreadyShownMultiSelect(item, index))
      .map(item => this.renderFilterText(item))
      .join('')
    if (alltext.length >= 125) {
      return (
        <div className={styles.collapse}>
          {this.state.collapse ? (
            <i className="material-icons" onClick={() => this.collapse()}>
              expand_more
            </i>
          ) : (
            <i className="material-icons" onClick={() => this.collapse()}>
              expand_less
            </i>
          )}
        </div>
      )
    }
  }

  renderFilterText = item => {
    let text = ''
    const { options } = item
    switch (item.select) {
      case 'dateRange': {
        let { label } = item
        if (item.value.includes('created') || item.value.includes('updated')) {
          if (item.value.includes('building')) label = 'Building - ' + label
          if (item.value.includes('project')) label = 'Measure - ' + label
          if (item.value.includes('projectPackage'))
            label = 'Project - ' + label
          if (item.value.includes('proposal')) label = 'Proposal - ' + label
        }
        let { end, start } = options
        text = `${label} : ${new Date(start).toLocaleDateString('en-US', {
          timeZone: 'UTC'
        })} - ${new Date(end).toLocaleDateString('en-US', {
          timeZone: 'UTC'
        })}`
        break
      }
      case 'range':
      case 'yearRange': {
        let { unit, label } = item
        let { end, start } = options
        if (unit === '$ /mtCO2e') {
          unit = '$/mtCO2e'
        }
        text = `${label} : ${formatUnit(unit, start)} - ${formatUnit(
          unit,
          end
        )}`
        break
      }
      case 'costRange':
        text = `${item.label} : ${options.option} ${formatUnit(
          item.unit,
          options.cost
        )}`
        break
      default: {
        let label = item.label
        if (item.value.includes('createdBy.id')) {
          if (item.value.includes('building')) label = 'Building - ' + label
          if (item.value.includes('project')) label = 'Measure - ' + label
          if (item.value.includes('projectPackage'))
            label = 'Project - ' + label
          if (item.value.includes('proposal')) label = 'Proposal - ' + label
        }
        if (options.selectedAll) text = `${label} : All`
        else {
          let { dashboardFilters } = this.props
          let allOptions =
            dashboardFilters.filter(filter => filter.value === item.value) || []
          let allValues = allOptions.map(option => option.options.value) || []
          if (
            item.value === 'organization.name' ||
            item.value.includes('createdBy.id')
          )
            allValues = allOptions.map(option => option.options.name) || []
          if (
            item.value === 'buildingUseTypes.use' ||
            item.value.includes('buildinguse')
          ) {
            allValues = (
              allOptions.map(option => {
                let value = option.options.value
                let label = findBuildingUseName(value)
                if (label === '-') return ''
                return label
              }) || []
            ).filter(item => item)
          }
          allValues = allValues
            .map(value => formatStringUpperCase(value))
            .join(', ')
          text = `${label} : ${allValues}`
          if (text.length > 60) text = text ? text.slice(0, 57) + '...' : ''
        }
        break
      }
    }
    return text
  }

  isAlreadyShownMultiSelect = (item, index) => {
    const { dashboardFilters } = this.props
    if (item.select !== 'multiSelect') return false
    let firstIndex = _.findIndex(
      dashboardFilters,
      filter => {
        return filter.value === item.value
      },
      0
    )
    return firstIndex < index
  }

  renderTimeRange = () => {
    const { timeRange } = this.props
    if (!timeRange || !timeRange.type || !timeRange.start || !timeRange.end)
      return 'Year Range'
    if (timeRange.type === 'Calendar')
      return `${timeRange.start} - ${timeRange.end}`
    return `FY\'${timeRange.start % 100} - FY\'${timeRange.end % 100}`
  }

  render() {
    let {
      dashboardFilters,
      showFilter,
      FilterOptions,
      loading,
      showTimeRange,
      timeRange,
      buildingGroups,
      toggleEditGroup,
      onUpdateGroup,
      onSelectGroup,
      onEditGroup,
      onDeleteGroup,
      onAddGroup,
      selectedBuildingGroupId
    } = this.props
    const { collapse } = this.state
    let flagRight = false
    if (showFilter && this.node) {
      const element = this.node.getClientRects()[0]
      const left = element.left + window.scrollX
      if (left + 300 > innerWidth) flagRight = true
    }
    let filterString = ''
    dashboardFilters = dashboardFilters.filter(
      (item, index) => !this.isAlreadyShownMultiSelect(item, index)
    )
    return (
      <div
        className={classNames(
          styles.panelFilterContainer,
          loading ? styles.disable : ''
        )}
      >
        <div className={classNames(styles.panelShowFilter)}>
          <span>Filters</span>
          <div
            className={classNames(
              styles.showFilterContainer,
              collapse ? styles.collapseContainer : ''
            )}
          >
            <div className={styles.dropDown}>
              <div
                className={styles.timeRangeFilter}
                onClick={this.props.handleToggleTimeRange}
              >
                &nbsp; {this.renderTimeRange()}
                <i className="material-icons">calendar_today</i>
              </div>
              {showTimeRange && (
                <TimeRange
                  handleToggleSelect={this.props.handleToggleTimeRange}
                  handleTimeRangeChange={this.props.handleTimeRangeChange}
                  buildingList={this.props.dashboard.buildings}
                  timeRange={timeRange}
                />
              )}
            </div>
            {buildingGroups && (
              <BuildingGroupFilter
                buildingGroups={buildingGroups}
                toggleEditGroup={toggleEditGroup}
                onUpdateGroup={onUpdateGroup}
                onSelectGroup={onSelectGroup}
                onEditGroup={onEditGroup}
                onDeleteGroup={onDeleteGroup}
                onAddGroup={onAddGroup}
                selectedBuildingGroupId={selectedBuildingGroupId}
                user={this.props.user}
              />
            )}
            {dashboardFilters.map((item, index) => {
              let text = this.renderFilterText(item)
              filterString = filterString + text
              let hideFilter = filterString.length >= 125
              if (collapse && hideFilter) return null
              return (
                <div
                  className={classNames(styles.showFilterSelect)}
                  key={`filter-${index}`}
                  onClick={() => this.handleEditFilter(item, index)}
                >
                  <div>{text}&nbsp;</div>
                  &nbsp;
                  <i
                    className={classNames('material-icons', styles.deleteIcon)}
                    onClick={event => this.removeFilter(event, item)}
                  >
                    close
                  </i>
                  {this.renderEditFilterComponent(index)}
                </div>
              )
            })}
            <div
              className={classNames(
                styles.addFilter,
                collapse && filterString.length >= 125
                  ? styles.hideFilterSelect
                  : ''
              )}
            >
              <span
                onClick={() => {
                  this.props.handleShowFilter(true)
                }}
                ref={node => {
                  if (node) {
                    this.node = node
                    if (this.state.top != node.getBoundingClientRect().top)
                      this.setState({ top: node.getBoundingClientRect().top })
                  }
                }}
              >
                +&nbsp; Add filter
              </span>
              {showFilter && (
                <DashboardFilter
                  handleToggleFilter={this.props.handleToggleFilter}
                  FilterOptions={FilterOptions}
                  handleAddFilter={this.handleAddFilter}
                  flagRight={flagRight}
                  user={this.props.user}
                />
              )}
              {this.renderAddFilterComponent()}
            </div>
          </div>
          {this.renderCollapse()}
        </div>
      </div>
    )
  }
}

export default DashboardFilterContainer
