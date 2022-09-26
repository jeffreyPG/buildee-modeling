import React, { Component } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { connect } from 'react-redux'
import { push } from 'react-router-redux'
import { CSVLink } from 'react-csv'

import {
  updateDashboardFilters,
  updateTeamSort,
  updateTeamColumnList,
  updateTeamColumnIndex,
  fetchBuildingGroups,
  deleteBuildingGroup,
  setBuildingGroup,
  toggleBuildingGroup
} from 'routes/Portfolio/modules/portfolio'
import {
  updateCurrentOrganization,
  toggleManageAllOrgs
} from 'routes/Organization/modules/organization'

import {
  handleSort,
  checkOrganizationFilterChange,
  formatUnit,
  getTeamData,
  filterOrganizationsForTeam
} from 'utils/Portfolio'
import { _getValueFromObjPerPath, formatNumbersWithCommas } from 'utils/Utils'
import {
  dashboardFilterOptions,
  getTeamColumnOptions
} from 'utils/PortfolioOptions'
import { Loader } from 'utils/Loader'

import FilterContainer from './FilterContainer'
import ColumnList from 'components/UI/Column/ColumnList'
import { ToggleTab } from 'components/Asset/ToggleTab'
import PortfolioTeamTable from 'components/UI/PortfolioTables/PortfolioTeamTable'

import portfolioStyles from './PortfolioContainer.scss'
import buildingStyles from '../Building/Building.scss'

class PortfolioTeam extends Component {
  static propTypes = {
    user: PropTypes.object.isRequired,
    push: PropTypes.func.isRequired,
    organizationView: PropTypes.object.isRequired,
    filters: PropTypes.array.isRequired,
    sort: PropTypes.object.isRequired,
    columnList: PropTypes.array.isRequired,
    columnIndex: PropTypes.number.isRequired,
    loading: PropTypes.bool.isRequired,
    hardReload: PropTypes.func.isRequired
  }

  state = {
    searchValue: '',
    showFilter: false,
    showFilterContainer: false,
    teamList: [],
    csvReport: {
      data: [],
      headers: [],
      filename: 'Report.csv'
    },
    showTimeRange: false
  }

  UNSAFE_componentWillMount() {
    document.addEventListener('mousedown', this.handleClick, false)
    if (this.props.buildingGroups.length === 0) {
      this.props.fetchBuildingGroups()
    }
  }

  componentDidMount = () => {
    if (!this.props.loading) {
      const { searchValue } = this.state
      let {
        filters,
        sort,
        dashboard,
        user,
        timeRange,
        selectedView
      } = this.props
      let teamList = getTeamData(
        user,
        dashboard,
        filters,
        searchValue,
        timeRange,
        selectedView,
        this.props.buildingGroups,
        this.props.selectedBuildingGroupId
      )
      handleSort('team', teamList, sort).then(teamList => {
        this.setState({ teamList })
      })
    }
  }

  UNSAFE_componentWillReceiveProps = nextProps => {
    if (
      nextProps.dashboard !== this.props.dashboard ||
      nextProps.timeRange !== this.props.timeRange ||
      nextProps.selectedView !== this.props.selectedView ||
      nextProps.selectedBuildingGroupId !== this.props.selectedBuildingGroupId
    ) {
      const { searchValue } = this.state
      let {
        filters,
        sort,
        dashboard,
        user,
        timeRange,
        selectedView
      } = nextProps
      let teamList = getTeamData(
        user,
        dashboard,
        filters,
        searchValue,
        timeRange,
        selectedView,
        nextProps.buildingGroups,
        nextProps.selectedBuildingGroupId
      )
      handleSort('team', teamList, sort).then(teamList => {
        this.setState({ teamList })
      })
    }
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

  handleSearch = () => {
    let { searchValue } = this.state
    let {
      filters,
      sort,
      dashboard,
      user,
      timeRange,
      selectedView,
      buildingGroups,
      selectedBuildingGroupId
    } = this.props
    let teamList = getTeamData(
      user,
      dashboard,
      filters,
      searchValue,
      timeRange,
      selectedView,
      buildingGroups,
      selectedBuildingGroupId
    )
    handleSort('team', teamList, sort).then(teamList => {
      this.setState({ teamList })
    })
  }

  handleSearchChange = ({ target: { value } }) => {
    const searchBy = value || ''
    this.setState({ searchValue: searchBy }, () => {
      this.handleSearch()
    })
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
      let { searchValue } = this.state

      let {
        sort,
        dashboard,
        user,
        timeRange,
        selectedView,
        buildingGroups,
        selectedBuildingGroupId
      } = this.props
      let teamList = getTeamData(
        user,
        dashboard,
        options,
        searchValue,
        timeRange,
        selectedView,
        buildingGroups,
        selectedBuildingGroupId
      )
      handleSort('team', teamList, sort).then(teamList => {
        this.setState({ teamList })
      })
    }
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

  handleColumnChange = (columnList, index = null) => {
    const { selectedView } = this.props
    this.props.updateTeamColumnList(selectedView || 'Measure', columnList)
    this.props.updateTeamColumnIndex(
      selectedView || 'Measure',
      index != null ? index : columnList.length - 1
    )
  }

  handleCurrentColumnChange = index => {
    const { selectedView } = this.props
    this.props.updateTeamColumnIndex(selectedView || 'Measure', index)
  }

  handleClickSort = key => {
    let tempSort = { ...this.props.sort }
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

    this.props.updateTeamSort(tempSort).then(() => {
      let teamList = [...this.state.teamList]
      handleSort('team', teamList, tempSort).then(teamList => {
        this.setState({
          teamList: teamList
        })
      })
    })
  }

  getData = () => {
    const { columnList, columnIndex, selectedView } = this.props
    const { teamList } = this.state
    const { defaultTeamColumn } = getTeamColumnOptions(selectedView)
    let columns =
      (columnList && columnList.length && columnList[columnIndex].column) ||
      defaultTeamColumn
    let data = teamList.map(team => {
      let teamData = {
        name: team.name
      }
      for (let column of columns) {
        let label = '-'
        let value = _getValueFromObjPerPath.call(team, column.value)
        if (column.value === 'updated' || column.value === 'created') {
          if (value === null) value = '-'
          else value = new Date(value).toLocaleDateString('en-US')
        }
        if (column.value === 'organization.name') {
          let organizations = team.organizations || []
          organizations = filterOrganizationsForTeam(
            organizations,
            this.props.filters,
            this.props.organizationView
          )
          let names = organizations.map(organization => organization.name)
          value = names.join(', ')
        }
        if (value === 'Infinity' || value == null || value == undefined)
          value = 0
        if (typeof value === 'number' && value == +value)
          value = formatNumbersWithCommas(value)
        label = value ? formatUnit(column.unit, value) : '-'
        if (typeof value === 'boolean') label = value ? 'Yes' : 'No'
        teamData[column.value] = label
      }
      return teamData
    })
    return data
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
    const { columnList, columnIndex, selectedView } = this.props
    const { defaultTeamColumn } = getTeamColumnOptions(selectedView)
    let columns =
      (columnList && columnList.length && columnList[columnIndex].column) ||
      defaultTeamColumn
    columns = columns.filter(column => column.value !== 'name')
    let headers = [{ label: 'Name', key: 'name' }]
    let otherHeaders =
      columns.map(column => {
        return {
          label: column.label,
          key: column.value
        }
      }) || []
    return [...headers, ...otherHeaders]
  }

  downloadReport = (event, done) => {
    const date = new Date().toLocaleDateString('en-US')
    const data = this.getData()
    const headers = this.getHeaders()
    const objReport = {
      filename: `Portfolio Teams Export_${date}.csv`,
      headers: headers,
      data: data
    }
    this.setState({ csvReport: objReport }, () => {
      done()
    })
  }

  handleUpdateView = value => {
    this.setState({
      selectedView: value
    })
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

  toggleEditGroup = value => {
    this.props.toggleBuildingGroup(value)
  }

  onAddGroup = () => {
    const { manageAllOrgSelected, organizationView } = this.props
    this.props.toggleBuildingGroup(true)
    this.props.setBuildingGroup()
    if (manageAllOrgSelected) {
      this.props.push('/organization/all/portfolio/building')
    } else {
      this.props.push(
        `/organization/${organizationView._id}/portfolio/building`
      )
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
      this.props.push('/organization/all/portfolio/team')
    }
    this.props.setBuildingGroup(groupId !== 'all' ? groupId : null)
    this.props.toggleBuildingGroup(false)
  }

  onEditGroup = groupId => {
    const { buildingGroups, organizationView, organizationList } = this.props
    this.props.toggleBuildingGroup(true)
    this.props.setBuildingGroup(groupId)
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
    } else {
      this.props.push(
        `/organization/${organizationView._id}/portfolio/building`
      )
    }
  }

  onDeleteGroup = groupId => {
    this.props.deleteBuildingGroup(groupId)
  }

  render() {
    const {
      searchValue,
      showFilter,
      teamList,
      showColumn,
      showTimeRange
    } = this.state
    const {
      user,
      filters,
      columnList,
      columnIndex,
      sort,
      loading,
      selectedView,
      options,
      handleUpdateView,
      timeRange,
      buildingGroups,
      selectedBuildingGroupId
    } = this.props
    const { defaultTeamColumn, teamColumnOptions } = getTeamColumnOptions(
      selectedView
    )
    const columns =
      (columnList && columnList.length && columnList[columnIndex].column) ||
      defaultTeamColumn

    return (
      <div>
        <div className={portfolioStyles.portfolioContainerSecondHeader}>
          <div className={portfolioStyles.container}>
            <div
              className={classNames(
                portfolioStyles.panelFilter,
                loading ? portfolioStyles.disable : ''
              )}
            >
              <div>
                <ToggleTab
                  options={options}
                  defaultOption={selectedView}
                  onToggle={handleUpdateView}
                />
              </div>
              <div
                className={classNames(
                  buildingStyles.buildingButtons,
                  portfolioStyles.filterButtons
                )}
              >
                <div className={portfolioStyles.teamSearchFilter}>
                  <input
                    placeholder="Search for members"
                    type="search"
                    value={searchValue}
                    onChange={this.handleSearchChange}
                  />
                  <i className="material-icons">search</i>
                </div>
                <div className={portfolioStyles.dropDown}>
                  <div
                    className={portfolioStyles.filterSelect}
                    onClick={this.handleOpenColumn}
                  >
                    Columns &nbsp; <i className="material-icons">view_column</i>
                  </div>
                  {showColumn && (
                    <ColumnList
                      user={user}
                      columnList={columnList}
                      defaultColumn={defaultTeamColumn}
                      ColumnOptions={teamColumnOptions}
                      currrentIndex={columnIndex}
                      handleToggleColumn={this.handleToggleColumn}
                      handleColumnChange={this.handleColumnChange}
                      handleCurrentColumnChange={this.handleCurrentColumnChange}
                    />
                  )}
                </div>
                <div>
                  <CSVLink
                    className={classNames(
                      portfolioStyles.filterSelect,
                      portfolioStyles.export
                    )}
                    {...this.state.csvReport}
                    asyncOnClick={true}
                    onClick={this.downloadReport}
                  >
                    Export&nbsp;
                    <i className="material-icons">cloud_download</i>
                  </CSVLink>
                </div>
                <div className={portfolioStyles.buildingButtonsAdd}>
                  <div
                    className={portfolioStyles.filterSelect}
                    onClick={this.props.hardReload}
                  >
                    <i className="material-icons">replay</i>
                  </div>
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
              FilterOptions={dashboardFilterOptions}
              itemList={teamList}
              activeTab={'team'}
              loading={loading}
              buildingList={
                (this.props.dashboard && this.props.dashboard.buildingList) ||
                []
              }
              showTimeRange={showTimeRange}
              timeRange={timeRange}
              handleTimeRangeChange={this.props.handleTimeRangeChange}
              handleToggleTimeRange={this.handleToggleTimeRange}
              buildingGroups={buildingGroups}
              toggleEditGroup={this.toggleEditGroup}
              onSelectGroup={this.onSelectGroup}
              onEditGroup={this.onEditGroup}
              onDeleteGroup={this.onDeleteGroup}
              onAddGroup={this.onAddGroup}
              selectedBuildingGroupId={selectedBuildingGroupId}
            />
          </div>
        </div>
        <div className={portfolioStyles.container}>
          <div
            className={classNames(
              portfolioStyles.panel,
              loading ? portfolioStyles.cursorWait : ''
            )}
          >
            {loading && (
              <div className={portfolioStyles.portfolioContainerLoading}>
                <Loader />
                <div className={portfolioStyles.loadingBuilding}>
                  <div>One moment while we get your data...</div>
                </div>
              </div>
            )}
            <PortfolioTeamTable
              teams={teamList}
              columns={columns}
              user={this.props.user}
              sortOption={sort}
              user={user}
              filterList={filters}
              pushFunc={this.props.push}
              sortFunc={this.handleClickSort}
              loading={loading}
              organizationView={this.props.organizationView}
            />
          </div>
        </div>
      </div>
    )
  }
}

const mapDispatchToProps = {
  push,
  updateDashboardFilters,
  updateTeamSort,
  updateTeamColumnList,
  updateTeamColumnIndex,
  updateCurrentOrganization,
  fetchBuildingGroups,
  deleteBuildingGroup,
  toggleManageAllOrgs,
  setBuildingGroup,
  toggleBuildingGroup
}

const mapStateToProps = (state, ownProps) => ({
  user: state.login.user || {},
  organizationView: state.organization.organizationView || {},
  organizationList: state.organization.organizationList || [],
  buildingGroups: state.portfolio.buildingGroups,
  dashboard: state.portfolio.dashboard || {},
  filters: state.portfolio.dashboardFilters || [],
  sort: state.portfolio.teamSort || [],
  columnList:
    state.portfolio[`team${ownProps.selectedView || 'Measure'}ColumnList`],
  columnIndex:
    state.portfolio[`team${ownProps.selectedView || 'Measure'}ColumnIndex`] ||
    0,
  loading: state.portfolio.loading || false,
  selectedBuildingGroupId: state.portfolio.selectedBuildingGroupId,
  manageAllOrgSelected: state.organization.manageAllOrgSelected || false
})

export default connect(mapStateToProps, mapDispatchToProps)(PortfolioTeam)
