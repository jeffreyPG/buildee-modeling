import React, { Component } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import _ from 'lodash'
import { connect } from 'react-redux'
import { push } from 'react-router-redux'
import styles from './PortfolioContainer.scss'
import buildingStyles from '../Building/Building.scss'
import FilterContainer from './FilterContainer'
import ColumnList from '../UI/Column/ColumnList'
import TimeRange from '../UI/TimeRange'
import { Loader } from 'utils/Loader'
import ScenarioModal from '../../containers/Modal/ScenarioModal'
import PortfolioBuildingTable from '../UI/PortfolioTables/PortfolioBuildingTable'
import {
  updateDashboardFilters,
  updateBuildingSort,
  updateBuildingColumnList,
  updateBuildingColumnIndex,
  createBuildingGroup,
  fetchBuildingGroups,
  updateBuildingGroup,
  deleteBuildingGroup,
  setBuildingGroup,
  toggleBuildingGroup
} from '../../routes/Portfolio/modules/portfolio'
import {
  updateBuildingTab,
  updateBuildingViewMode,
  createSampleBuilding
} from '../../routes/Building/modules/building'
import {
  updateCurrentOrganization,
  toggleManageAllOrgs
} from '../../routes/Organization/modules/organization'
import {
  _getValueFromObjPerPath,
  formatNumbersWithCommas,
  findBuildingUseName
} from 'utils/Utils'
import {
  handleSort,
  handleSearchFilter,
  checkOrganizationFilterChange,
  getValueArrayFromArray,
  getArrayFromBuildingTimeRange,
  getAverageOfArray
} from 'utils/Portfolio'
import {
  BuildingFilterOptions,
  buildingColumnOptions,
  defaultBuildingColumn
} from 'utils/PortfolioOptions'
import UserFeature from 'utils/Feature/UserFeature'
import { CSVLink } from 'react-csv'
import PortfolioSyncPopup from './PortfolioSyncPopup'

class PortfolioBuildingList extends Component {
  static propTypes = {
    user: PropTypes.object.isRequired,
    push: PropTypes.func.isRequired,
    buildingList: PropTypes.array.isRequired,
    organizationView: PropTypes.object.isRequired,
    filters: PropTypes.array.isRequired,
    sort: PropTypes.object.isRequired,
    columnList: PropTypes.array.isRequired,
    columnIndex: PropTypes.number.isRequired,
    loading: PropTypes.bool.isRequired,
    timeRange: PropTypes.object.isRequired,
    handleTimeRangeChange: PropTypes.func.isRequired,
    hardReload: PropTypes.func.isRequired
  }

  state = {
    showFilter: false,
    showFilterContainer: true,
    loadingSearch: false,
    showColumn: false,
    searchValue: '',
    buildingList: [],
    showExtras: false,
    modalOpen: false,
    modalView: null,
    csvReport: {
      data: [],
      headers: [],
      filename: 'Report.csv'
    },
    isCreatingBuilding: false,
    showPopup: false
  }

  UNSAFE_componentWillMount() {
    document.addEventListener('mousedown', this.handleClick, false)
    if (this.props.buildingGroups.length === 0) {
      this.props.fetchBuildingGroups()
    }
  }

  componentDidMount() {
    if (!this.props.loading) {
      const { searchValue } = this.state
      let { filters, sort, timeRange } = this.props
      filters = filters.filter(filter => filter.tab === 'building')
      let projectFilters = this.props.filters.filter(
        filter => filter.tab === 'project'
      )
      let buildingList = handleSearchFilter(
        this.props.user,
        this.props.buildingList,
        searchValue,
        filters,
        timeRange,
        this.props.buildingGroups,
        this.props.selectedBuildingGroupId,
        this.props.editBuildingGroup
      )

      let buildingIds = this.getFilteredBuildingIds(
        buildingList,
        this.props.projectList,
        projectFilters
      )
      buildingList = buildingList.filter(building =>
        buildingIds.includes(building._id)
      )
      handleSort('building', buildingList, sort, timeRange).then(
        buildingList => {
          this.setState({ buildingList })
        }
      )
    }
  }

  componentWillUnmount = () => {
    document.removeEventListener('mousedown', this.handleClick, false)
    this.setState({ showExtras: false })
  }

  UNSAFE_componentWillReceiveProps = nextProps => {
    if (
      nextProps.buildingList != this.props.buildingList ||
      (nextProps.user.products &&
        this.props.user.products &&
        nextProps.user.products.buildeeNYC !==
          this.props.user.products.buildeeNYC) ||
      nextProps.timeRange != this.props.timeRange ||
      nextProps.selectedBuildingGroupId !==
        this.props.selectedBuildingGroupId ||
      nextProps.editBuildingGroup !== this.props.editBuildingGroup
    ) {
      const { searchValue } = this.state
      let { filters, sort, timeRange } = nextProps
      filters = filters.filter(filter => filter.tab === 'building')
      let projectFilters = nextProps.filters.filter(
        filter => filter.tab === 'project'
      )
      let buildingList = handleSearchFilter(
        nextProps.user,
        nextProps.buildingList,
        searchValue,
        filters,
        timeRange,
        nextProps.buildingGroups,
        nextProps.selectedBuildingGroupId,
        nextProps.editBuildingGroup
      )
      let buildingIds = this.getFilteredBuildingIds(
        buildingList,
        nextProps.projectList,
        projectFilters
      )
      buildingList = buildingList.filter(building =>
        buildingIds.includes(building._id)
      )
      handleSort('building', buildingList, sort, timeRange).then(
        buildingList => {
          this.setState({ buildingList, loading: false })
        }
      )
    }
  }

  getFilteredBuildingIds = (buildingList, projectListCopy, projectFilters) => {
    let buildingIds = buildingList.map(building => building._id)
    if (projectListCopy.length === 0 || projectFilters.length === 0)
      return buildingIds
    let projectList = projectListCopy.filter(project => {
      if (project.building_id) {
        return buildingIds.indexOf(project.building_id) != -1
      }
      return false
    })
    projectList = handleSearchFilter(
      this.props.user,
      projectList,
      '',
      projectFilters
    )
    buildingIds = projectList
      .map(project => project && project.building && project.building._id)
      .filter(id => !!id)
    return buildingIds
  }

  handleToggleExtras = () => {
    this.setState(prevState => ({
      showExtras: !prevState.showExtras
    }))
  }

  handleClick = e => {
    if (this.node && this.node.contains(e.target)) {
      // the click is inside, continue to menu links
      return
    }
    // otherwise, toggle (close) the dropdowns
    this.setState({ showExtras: false })
  }

  handleToggleFilter = toggle => {
    if (toggle != undefined) this.setState({ showFilter: toggle })
    else {
      this.setState(prevState => ({
        showFilter: !prevState.showFilter
      }))
    }
  }

  handleToggleFilterContainer = toggle => {
    if (toggle != undefined)
      this.setState({
        showFilterContainer: toggle,
        showFilter: toggle ? true : false
      })
    else {
      this.setState(prevState => ({
        showFilterContainer: !prevState.showFilterContainer
      }))
    }
  }

  handleToggleColumn = toggle => {
    if (toggle != undefined) this.setState({ showColumn: toggle })
    else {
      this.setState(prevState => ({
        showColumn: !prevState.showColumn
      }))
    }
  }

  handleFilterChange = options => {
    let { filters } = this.props
    this.props.updateDashboardFilters(options)
    if (
      checkOrganizationFilterChange(
        filters,
        options,
        this.props.organizationView,
        this.props.organizationList
      )
    ) {
      const { searchValue } = this.state
      let { sort, timeRange } = this.props
      filters = options.filter(filter => filter.tab === 'building')
      let projectFilters = options.filter(filter => filter.tab === 'project')
      const selectedBuildingIds = this.state.buildingList.reduce(
        (agg, building) => {
          if (building.isInGroup) {
            agg.push(building._id)
          }
          return agg
        },
        []
      )
      let buildingList = handleSearchFilter(
        this.props.user,
        this.props.buildingList,
        searchValue,
        filters,
        timeRange,
        this.props.buildingGroups,
        this.props.selectedBuildingGroupId,
        this.props.editBuildingGroup,
        selectedBuildingIds
      )
      let buildingIds = this.getFilteredBuildingIds(
        buildingList,
        this.props.projectList,
        projectFilters
      )
      buildingList = buildingList.filter(building =>
        buildingIds.includes(building._id)
      )
      handleSort('building', buildingList, sort, timeRange).then(
        buildingList => {
          this.setState({ buildingList })
        }
      )
    }
  }

  handleColumnChange = (columnList, index = null) => {
    this.props.updateBuildingColumnList(columnList)
    this.props.updateBuildingColumnIndex(
      index != null ? index : columnList.length - 1
    )
  }

  handleCurrentColumnChange = index => {
    this.props.updateBuildingColumnIndex(index)
  }

  handleOpenFilter = () => {
    this.setState({
      showFilterContainer: true,
      showFilter: true
    })
  }

  handleOpenColumn = () => {
    this.setState(prevState => ({
      showColumn: !prevState.showColumn
    }))
  }

  handleToggleTimeRange = toggle => {
    if (toggle != undefined) {
      this.setState({ showTimeRange: toggle })
    } else {
      this.setState(prevState => ({
        showTimeRange: !prevState.showTimeRange
      }))
    }
  }

  handleClickSort = key => {
    let tempSort = { ...this.props.sort }
    const { timeRange } = this.props
    if (key === tempSort.key) {
      if (tempSort.direction === 'ASC') {
        tempSort.direction = 'DESC'
      } else {
        tempSort.direction = 'ASC'
      }
    } else {
      tempSort.key = key
      tempSort.direction = 'ASC'
    }
    let buildingList = [...this.state.buildingList]
    this.props.updateBuildingSort(tempSort)
    console.log('timeRange', timeRange)
    handleSort('building', buildingList, tempSort, timeRange).then(
      buildingList => {
        this.setState({ buildingList })
      }
    )
  }

  handleSearch = () => {
    let { filters, timeRange } = this.props
    filters = filters.filter(filter => filter.tab == 'building')
    let { searchValue } = this.state
    let updatedList = this.props.buildingList
    let projectFilters = this.props.filters.filter(
      filter => filter.tab === 'project'
    )
    const selectedBuildingIds = this.state.buildingList.reduce(
      (agg, building) => {
        if (building.isInGroup) {
          agg.push(building._id)
        }
        return agg
      },
      []
    )
    updatedList = handleSearchFilter(
      this.props.user,
      updatedList,
      searchValue,
      filters,
      timeRange,
      this.props.buildingGroups,
      this.props.selectedBuildingGroupId,
      this.props.editBuildingGroup,
      selectedBuildingIds
    )
    let buildingIds = this.getFilteredBuildingIds(
      updatedList,
      this.props.projectList,
      projectFilters
    )
    updatedList = updatedList.filter(building =>
      buildingIds.includes(building._id)
    )
    this.setState({ buildingList: updatedList })
  }

  handleSearchChange = ({ target: { value } }) => {
    const searchBy = value || ''
    this.setState({ searchValue: searchBy }, () => {
      this.handleSearch()
    })
  }

  handleOpenScenarioModal = () => {
    this.setState({
      modalOpen: true,
      modalView: 'addScenario'
    })
  }

  handleCloseScenarioModal = () => {
    this.setState({ modalOpen: false, modalView: null })
  }

  renderTimeRange = () => {
    const { timeRange } = this.props
    if (!timeRange || !timeRange.type || !timeRange.start || !timeRange.end)
      return 'Year Range'
    if (timeRange.type === 'Calendar')
      return `${timeRange.start} - ${timeRange.end}`
    return `FY\'${timeRange.start % 100} - FY\'${timeRange.end % 100}`
  }

  getHeaders = () => {
    const { columnList, columnIndex, user } = this.props
    let columns =
      (columnList && columnList.length && columnList[columnIndex].column) ||
      defaultBuildingColumn
    columns = columns.filter(column => column.value !== 'buildingname')
    if (!user.products || user.products.buildeeNYC !== 'access')
      columns = columns.filter(column => !column.value.includes('nycfields'))
    let headers = [{ label: 'Name', key: 'buildingname' }]
    let otherHeaders =
      columns.map(column => {
        let label = column.label || ''
        let unit = column.unit || ''
        return {
          label: label ? (unit ? label + '(' + unit + ')' : label) : '-',
          key: column.value
        }
      }) || []
    return [...headers, ...otherHeaders]
  }

  getData = () => {
    const { columnList, columnIndex, timeRange } = this.props
    const { buildingList } = this.state
    let columns =
      (columnList && columnList.length && columnList[columnIndex].column) ||
      defaultBuildingColumn
    let data =
      buildingList.map(building => {
        let buildingData = {
          buildingname: building.buildingname
        }
        for (let column of columns) {
          let label = '-'
          let value = _getValueFromObjPerPath.call(building, column.value)
          if (column.value === 'updated' || column.value === 'created') {
            if (value === null) value = '-'
            else value = new Date(value).toLocaleDateString('en-US')
          } else if (column.value === 'projects')
            value = (building.projects && building.projects.length) || 0
          if (
            typeof value === 'number' &&
            value == +value &&
            column.value !== 'buildyear' &&
            column.value !== 'location_zipcode'
          )
            value = formatNumbersWithCommas(value)
          label = value ? value : '-'
          if (typeof value === 'boolean') label = value ? 'Yes' : 'No'
          if (column.value.includes('buildingUseTypes')) {
            const buildingUseTypes = _getValueFromObjPerPath.call(
              building,
              'buildingUseTypes'
            )
            value = getValueArrayFromArray(
              buildingUseTypes,
              column.value.substring(
                column.value.indexOf('buildingUseTypes') +
                  'buildingUseTypes'.length +
                  1
              )
            )
            value = value
              .map(item => {
                let string = item
                if (typeof string === 'number') {
                  string = formatNumbersWithCommas(string)
                  string = string ? string : ''
                } else if (column.value !== 'buildingUseTypes.use') {
                  string =
                    string[0].toUpperCase() + string.substring(1, string.length)
                } else {
                  string = findBuildingUseName(string)
                  if (string == '-') return ''
                }
                return string
              })
              .filter(item => item)
            if (column.value === 'buildingUseTypes.use') {
              let buildingUse = _getValueFromObjPerPath.call(
                building,
                'buildinguse'
              )
              if (!buildingUse && buildingUse.length) {
                buildingUse = findBuildingUseName(buildingUse)
              }
              value = value.filter(item => item != buildingUse)
            }
            label = value.join(', ')
            if (!label.length) label = '-'
          } else if (column.value.includes('monthlyUtilities')) {
            let monthlyUtilities =
              _getValueFromObjPerPath.call(building, 'monthlyUtilities') || []
            monthlyUtilities =
              getArrayFromBuildingTimeRange(monthlyUtilities, timeRange) || []
            value = getValueArrayFromArray(
              monthlyUtilities,
              column.value.substring(
                column.value.indexOf('monthlyUtilities') +
                  'monthlyUtilities'.length +
                  1
              )
            )
            value = getAverageOfArray(value)
            if (column.unit === 'MMBTU') value = (value * 1.0) / 1000
            value = _.round(value, 2)
            label = value != 0 ? formatNumbersWithCommas(value) : '-'
          } else if (column.value == 'buildingPmScores.score') {
            let buildingPmScores =
              _getValueFromObjPerPath.call(building, 'buildingPmScores') || []
            buildingPmScores =
              getArrayFromBuildingTimeRange(buildingPmScores, timeRange) || []
            value = getValueArrayFromArray(
              buildingPmScores,
              column.value.substring(
                column.value.indexOf('buildingPmScores') +
                  'buildingPmScores'.length +
                  1
              )
            )
            value = value
              .filter(item => !!item && !isNaN(item))
              .map(item => +item)
            value = getAverageOfArray(value)
            value = _.round(value, 2)
            label = value != 0 ? formatNumbersWithCommas(value) : '-'
          } else if (column.value === 'buildinguse') {
            label = label[0].toUpperCase() + label.substring(1, label.length)
          }
          buildingData[column.value] = label
        }
        return buildingData
      }) || []
    return data
  }

  downloadReport = (event, done) => {
    const date = new Date().toLocaleDateString('en-US')
    const data = this.getData()
    const headers = this.getHeaders()
    const objReport = {
      filename: `Portfolio Buildings Export_${date}.csv`,
      headers: headers,
      data: data
    }
    this.setState({ csvReport: objReport }, () => {
      done()
    })
  }

  handleClickAddBuilding = () => {
    this.props.push('/building/new')
  }

  handleClickAddSampleBuilding = () => {
    this.setState({ isCreatingBuilding: true })
    this.props
      .createSampleBuilding()
      .then(() => {
        this.props.updateBuildingViewMode('portfolio/building')
        this.setState({ isCreatingBuilding: false })
      })
      .catch(() => {
        this.setState({ isCreatingBuilding: false })
      })
  }

  showPopup = () => {
    this.setState({ showPopup: true })
  }

  hidePopup = () => {
    this.setState({ showPopup: false })
  }

  renderEmptyState = () => {
    const { loading } = this.props

    return (
      <div>
        <div className={styles.empty}>
          <div className={styles.emptyBody}>
            <div className={styles.emptyBodyTitle}>
              Add a building to get started
            </div>
            <div className={styles.emptyBodyDescription}>
              Add your own building or work from a sample building.
            </div>
            <div className={styles.emptyButtons}>
              <button
                className={classNames(styles.button, styles.buttonPrimary)}
                onClick={this.handleClickAddBuilding}
              >
                <i className="material-icons">add</i> Add Building
              </button>
              {this.state.isCreatingBuilding === false && (
                <button
                  className={classNames(styles.button, styles.buttonPrimary)}
                  onClick={this.handleClickAddSampleBuilding}
                >
                  <i className="material-icons">add</i> Sample Building
                </button>
              )}
              {this.state.isCreatingBuilding === true && (
                <button
                  className={classNames(
                    styles.button,
                    styles.buttonPrimary,
                    styles.buttonDisable
                  )}
                  type="submit"
                  disabled
                >
                  <Loader size="button" color="white" />
                </button>
              )}
            </div>
          </div>
        </div>

        {loading && (
          <div className={styles.portfolioContainerLoading}>
            <Loader />
            <div className={styles.loadingBuilding}>
              <div>One moment while we get your data...</div>
            </div>
          </div>
        )}
      </div>
    )
  }

  checkEmptyState = () => {
    const { buildingList } = this.props
    let archivedBuilding = buildingList.filter(
      building => building.archived === false
    )
    return archivedBuilding.length === 0
  }

  toggleEditGroup = value => {
    this.props.toggleBuildingGroup(value)
  }

  onAddGroup = () => {
    const { buildingList } = this.state
    const newBuildingList = buildingList.map(building => ({
      ...building,
      isInGroup: false
    }))
    this.setState({ buildingList: newBuildingList })
    this.props.toggleBuildingGroup(true)
    this.props.setBuildingGroup()
  }

  onUpdateGroup = groupName => {
    const { buildingList } = this.state
    const { selectedBuildingGroupId } = this.props
    const buildingIds = buildingList.reduce((agg, building) => {
      if (building.isInGroup) {
        agg.push(building._id)
      }
      return agg
    }, [])
    const orgIds = []
    const updatedBuildingList = buildingList.filter(building => {
      if (
        building.isInGroup &&
        orgIds.indexOf(building.organization._id) === -1
      ) {
        orgIds.push(building.organization._id)
      }
      return building.isInGroup
    })
    const newBuildingGroup = {
      buildingIds,
      name: groupName,
      orgIds
    }
    if (!selectedBuildingGroupId) {
      this.props.createBuildingGroup(newBuildingGroup).then(group => {
        this.setState({
          buildingList: updatedBuildingList
        })
      })
    } else {
      this.props
        .updateBuildingGroup(selectedBuildingGroupId, newBuildingGroup)
        .then(group => {
          this.setState({
            buildingList: updatedBuildingList
          })
        })
    }
  }

  onSelectGroup = groupId => {
    const { buildingGroups, organizationList } = this.props
    const selectedGroup =
      groupId != 'all' && buildingGroups.find(group => group._id === groupId)
    if (
      selectedGroup &&
      selectedGroup.orgIds &&
      selectedGroup.orgIds.length > 1 &&
      organizationList.length > 1
    ) {
      this.props.toggleManageAllOrgs(true)
      this.props.push('/organization/all/portfolio/building')
    }
    this.props.setBuildingGroup(groupId !== 'all' ? groupId : null)
    this.props.toggleBuildingGroup(false)
  }

  onEditGroup = groupId => {
    this.props.toggleBuildingGroup(true)
    this.props.setBuildingGroup(groupId)
  }

  onDeleteGroup = groupId => {
    this.props.deleteBuildingGroup(groupId)
  }

  onGroupSelected = buildingId => e => {
    const { buildingList } = this.state
    const index = buildingList.findIndex(
      building => building._id === buildingId
    )
    if (index > -1) {
      const newBuildingList = [...buildingList]
      newBuildingList[index] = {
        ...newBuildingList[index],
        isInGroup: !newBuildingList[index].isInGroup
      }
      this.setState({ buildingList: newBuildingList })
    }
  }

  onGroupSelectAll = event => {
    const { buildingList } = this.state
    const isCheckedAll = event.target.value === 'true'
    const newBuildingList = buildingList.map(building => ({
      ...building,
      isInGroup: !isCheckedAll
    }))
    this.setState({ buildingList: newBuildingList })
  }

  render() {
    const {
      filters,
      sort,
      columnList,
      columnIndex,
      loading,
      timeRange,
      buildingGroups,
      selectedBuildingGroupId,
      editBuildingGroup
    } = this.props
    const {
      buildingList,
      showFilter,
      showFilterContainer,
      showColumn,
      searchValue,
      showTimeRange
    } = this.state
    const { user } = this.props
    const columns =
      (columnList && columnList.length && columnList[columnIndex].column) ||
      defaultBuildingColumn
    let checkEmpty = this.checkEmptyState()

    return (
      <div>
        <div className={styles.portfolioContainerSecondHeader}>
          <div className={styles.container}>
            <div
              className={classNames(
                styles.panelFilter,
                loading ? styles.disable : ''
              )}
            >
              <div className={styles.searchFilter}>
                <input
                  placeholder="Search for buildings"
                  type="search"
                  value={searchValue}
                  onChange={this.handleSearchChange}
                />
                <i className="material-icons">search</i>
                {this.state.loadingSearch && <Loader size="button" />}
              </div>
              <div
                className={classNames(
                  buildingStyles.buildingButtons,
                  styles.filterButtons
                )}
              >
                <div className={styles.dropDown}>
                  <div
                    className={styles.filterSelect}
                    onClick={this.handleOpenColumn}
                  >
                    Columns &nbsp; <i className="material-icons">view_column</i>
                  </div>
                  {showColumn && (
                    <ColumnList
                      user={user}
                      columnList={columnList}
                      defaultColumn={defaultBuildingColumn}
                      ColumnOptions={buildingColumnOptions}
                      currrentIndex={columnIndex}
                      handleToggleColumn={this.handleToggleColumn}
                      handleColumnChange={this.handleColumnChange}
                      handleCurrentColumnChange={this.handleCurrentColumnChange}
                    />
                  )}
                </div>
                {/* <div className={styles.buildingButtonsAdd}>
                  <div
                    className={styles.filterSelect}
                    onClick={this.handleOpenFilter}
                  >
                    Filter &nbsp;
                    <i className="material-icons">tune</i>
                  </div>
                </div> */}
                <CSVLink
                  className={classNames(styles.filterSelect, styles.export)}
                  {...this.state.csvReport}
                  asyncOnClick={true}
                  onClick={this.downloadReport}
                >
                  Export&nbsp;
                  <i className="material-icons">cloud_download</i>
                </CSVLink>
                <UserFeature name="scenario">
                  {({ enabled }) => {
                    if (!enabled) return null
                    return (
                      <div
                        className={styles.filterSelect}
                        onClick={this.handleOpenScenarioModal}
                      >
                        <i className="material-icons">add</i>
                        Scenario&nbsp;
                        <i className="material-icons">science</i>
                      </div>
                    )
                  }}
                </UserFeature>
                <div className={styles.buildingButtonsAdd}>
                  <div
                    className={styles.filterSelect}
                    onClick={this.props.hardReload}
                    onMouseEnter={this.showPopup}
                    onMouseLeave={this.hidePopup}
                  >
                    <i className="material-icons">replay</i>
                  </div>
                  {this.state.showPopup && <PortfolioSyncPopup />}
                </div>
              </div>
            </div>
            <FilterContainer
              user={user}
              filters={filters}
              showFilter={showFilter}
              handleFilterChange={this.handleFilterChange}
              handleToggleFilter={this.handleToggleFilter}
              handleShowFilter={this.handleToggleFilterContainer}
              FilterOptions={BuildingFilterOptions}
              itemList={this.props.buildingList}
              activeTab={'building'}
              loading={loading}
              buildingGroups={buildingGroups}
              toggleEditGroup={this.toggleEditGroup}
              onUpdateGroup={this.onUpdateGroup}
              onSelectGroup={this.onSelectGroup}
              onEditGroup={this.onEditGroup}
              onDeleteGroup={this.onDeleteGroup}
              onAddGroup={this.onAddGroup}
              buildingList={this.props.buildingList}
              selectedBuildingGroupId={selectedBuildingGroupId}
              editBuildingGroup={editBuildingGroup}
              showTimeRange={showTimeRange}
              timeRange={timeRange}
              handleTimeRangeChange={this.props.handleTimeRangeChange}
              handleToggleTimeRange={this.handleToggleTimeRange}
            />
          </div>
        </div>
        {!!checkEmpty && this.renderEmptyState()}
        {!checkEmpty && (
          <div className={styles.container}>
            <div
              className={classNames(
                styles.panel,
                loading ? styles.cursorWait : ''
              )}
            >
              {loading && (
                <div className={styles.portfolioContainerLoading}>
                  <Loader />
                  <div className={styles.loadingBuilding}>
                    <div>One moment while we get your data...</div>
                  </div>
                </div>
              )}
              <PortfolioBuildingTable
                buildings={buildingList}
                columns={columns}
                user={this.props.user}
                sortOption={sort}
                timeRangeOption={timeRange}
                filterList={filters}
                pushFunc={this.props.push}
                sortFunc={this.handleClickSort}
                loading={loading}
                updateOrganization={this.props.updateCurrentOrganization}
                updateBuildingTab={this.props.updateBuildingTab}
                updateBuildingViewMode={this.props.updateBuildingViewMode}
                editBuildingGroup={editBuildingGroup}
                onGroupSelected={this.onGroupSelected}
                onGroupSelectAll={this.onGroupSelectAll}
              />
              {this.state.modalOpen && (
                <ScenarioModal
                  user={this.props.user}
                  onClose={this.handleCloseScenarioModal}
                  modalView={this.state.modalView}
                  filters={filters}
                  scenario={null}
                  routeOrganizationId={this.props.routeOrganizationId}
                />
              )}
            </div>
          </div>
        )}
      </div>
    )
  }
}

const mapDispatchToProps = {
  push,
  updateDashboardFilters,
  updateBuildingSort,
  updateBuildingColumnList,
  updateBuildingColumnIndex,
  updateCurrentOrganization,
  updateBuildingTab,
  updateBuildingViewMode,
  createSampleBuilding,
  createBuildingGroup,
  fetchBuildingGroups,
  updateBuildingGroup,
  deleteBuildingGroup,
  toggleManageAllOrgs,
  setBuildingGroup,
  toggleBuildingGroup
}

const mapStateToProps = state => ({
  user: state.login.user || {},
  buildingList: state.portfolio.dashboard.buildings || [],
  buildingGroups: state.portfolio.buildingGroups,
  projectList: state.portfolio.dashboard.projects || [],
  organizationView: state.organization.organizationView || {},
  organizationList: state.organization.organizationList || [],
  filters: state.portfolio.dashboardFilters || [],
  sort: state.portfolio.buildingSort || {},
  columnList: state.portfolio.buildingColumnList || [
    {
      name: 'Default',
      column: defaultBuildingColumn
    }
  ],
  columnIndex: state.portfolio.buildingColumnIndex || 0,
  loading: state.portfolio.loading || false,
  selectedBuildingGroupId: state.portfolio.selectedBuildingGroupId,
  editBuildingGroup: state.portfolio.editBuildingGroup
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(PortfolioBuildingList)
