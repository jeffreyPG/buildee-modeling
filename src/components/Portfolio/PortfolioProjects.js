import React, { Component } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import _ from 'lodash'
import { connect } from 'react-redux'
import { push } from 'react-router-redux'
import { CSVLink } from 'react-csv'
import FilterContainer from './FilterContainer'
import ColumnList from '../UI/Column/ColumnList'
import { Loader } from 'utils/Loader'
import PortfolioProjectTable from '../UI/PortfolioTables/PortfolioProjectTable'
import {
  updateDashboardFilters,
  updateProjectSort,
  updateProjectColumnList,
  updateProjectColumnIndex,
  getTableauToken,
  fetchBuildingGroups,
  deleteBuildingGroup,
  setBuildingGroup,
  toggleBuildingGroup
} from '../../routes/Portfolio/modules/portfolio'
import {
  updateCurrentOrganization,
  toggleManageAllOrgs
} from '../../routes/Organization/modules/organization'
import {
  updateBuildingTab,
  updateProjectViewTab,
  updateBuildingViewMode,
  createSampleBuilding
} from '../../routes/Building/modules/building'
import portfolioStyles from './PortfolioContainer.scss'
import buildingStyles from '../Building/Building.scss'
import projectViewStyles from '../Project/ProjectView.scss'
import {
  handleSort,
  handleSearchFilter,
  checkOrganizationFilterChange,
  multiSelectChecker
} from 'utils/Portfolio'
import {
  _getValueFromObjPerPath,
  formatNumbersWithCommas,
  isProdEnv
} from 'utils/Utils'
import {
  projectFilterOptions,
  projectColumnOptions,
  defaultProjectColumn
} from 'utils/PortfolioOptions'
import { formatStringUpperCase } from '../Project/ProjectHelpers'
import PortfolioSyncPopup from './PortfolioSyncPopup'
import UserFeature from '../../utils/Feature/UserFeature'
import PortfolioProposalModal from '../../containers/Modal/PortfolioProposalModal'

class PortfolioProjects extends Component {
  static propTypes = {
    user: PropTypes.object.isRequired,
    push: PropTypes.func.isRequired,
    buildingList: PropTypes.array.isRequired,
    projectList: PropTypes.array.isRequired,
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
    showFilterContainer: true,
    projectList: [],
    showExtras: false,
    csvReport: {
      data: [],
      headers: [],
      filename: 'Report.csv'
    },
    isCreatingBuilding: false,
    height: window.innerHeight,
    showPopup: false,
    isCheckable: false,
    selectedItems: [],
    modalOpen: false,
    modalView: null
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
      let { filters, sort, projectList, user } = this.props
      let buildingFilters = filters.filter(
        filter =>
          filter.tab == 'building' && !filter.value.includes('organization')
      )
      filters = filters.filter(
        filter =>
          filter.tab === 'project' ||
          filter.value.includes('organization') ||
          filter.value === 'building.buildingname'
      )
      if (buildingFilters.length || this.props.buildingGroups.length) {
        let buildingList = handleSearchFilter(
          this.props.user,
          this.props.buildingList,
          '',
          buildingFilters,
          this.props.timeRange,
          this.props.buildingGroups,
          this.props.selectedBuildingGroupId,
          this.props.editBuildingGroup
        )
        let buildingIds = buildingList.map(item => item._id)
        projectList = projectList.filter(project => {
          if (project.building_id) {
            return buildingIds.indexOf(project.building_id) != -1
          }
          return false
        })
      }
      projectList = handleSearchFilter(
        user,
        projectList,
        searchValue,
        filters,
        this.props.timeRange
      )
      handleSort('project', projectList, sort).then(projectList => {
        this.setState({ projectList })
      })
    }
    window.addEventListener('resize', this.resize)
  }

  componentWillUnmount = () => {
    document.removeEventListener('mousedown', this.handleClick, false)
    window.removeEventListener('resize', this.resize)
  }

  UNSAFE_componentWillReceiveProps = nextProps => {
    if (
      nextProps.projectList != this.props.projectList ||
      nextProps.selectedBuildingGroupId !== this.props.selectedBuildingGroupId
    ) {
      const { searchValue } = this.state
      let { filters, sort } = this.props
      let buildingFilters = filters.filter(
        filter =>
          filter.tab == 'building' && !filter.value.includes('organization')
      )
      filters = filters.filter(
        filter =>
          filter.tab == 'project' ||
          filter.value.includes('organization') ||
          filter.value === 'building.buildingname'
      )
      let projectList = nextProps.projectList
      if (buildingFilters.length || nextProps.buildingGroups.length) {
        let buildingList = handleSearchFilter(
          this.props.user,
          this.props.buildingList,
          '',
          buildingFilters,
          this.props.timeRange,
          nextProps.buildingGroups,
          nextProps.selectedBuildingGroupId,
          nextProps.editBuildingGroup
        )
        let buildingIds = buildingList.map(item => item._id)
        projectList = projectList.filter(project => {
          if (project.building_id) {
            return buildingIds.indexOf(project.building_id) != -1
          }
          return false
        })
      }
      projectList = handleSearchFilter(
        nextProps.user,
        projectList,
        searchValue,
        filters,
        this.props.timeRange
      )
      handleSort('project', projectList, sort).then(projectList => {
        this.setState({ projectList })
      })
    }
  }

  resize = () => {
    this.setState({ height: window.innerHeight })
  }

  // handleOpenFilter = () => {
  //   this.setState({
  //     showFilterContainer: true,
  //     showFilter: true
  //   })
  // }

  handleOpenColumn = () => {
    this.setState(prevState => ({
      showColumn: !prevState.showColumn
    }))
  }

  handleSearch = () => {
    let { filters } = this.props
    let { searchValue } = this.state
    let updatedList = this.props.projectList
    let buildingFilters = filters.filter(
      filter =>
        filter.tab == 'building' && !filter.value.includes('organization')
    )
    filters = filters.filter(
      filter =>
        filter.tab == 'project' ||
        filter.value.includes('organization') ||
        filter.value === 'building.buildingname'
    )
    if (buildingFilters.length || this.props.buildingGroups.length) {
      let buildingList = handleSearchFilter(
        this.props.user,
        this.props.buildingList,
        '',
        buildingFilters,
        this.props.timeRange,
        this.props.buildingGroups,
        this.props.selectedBuildingGroupId,
        this.props.editBuildingGroup
      )
      let buildingIds = buildingList.map(item => item._id)
      updatedList = updatedList.filter(project => {
        if (project.building_id) {
          return buildingIds.indexOf(project.building_id) != -1
        }
        return false
      })
    }
    updatedList = handleSearchFilter(
      this.props.user,
      updatedList,
      searchValue,
      filters,
      this.props.timeRange
    )
    this.setState({ projectList: updatedList })
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
      let updatedList = this.props.projectList
      let buildingFilters = options.filter(
        filter =>
          filter.tab == 'building' && !filter.value.includes('organization')
      )
      filters = options.filter(
        filter =>
          filter.tab == 'project' || filter.value.includes('organization')
      )
      if (buildingFilters.length || this.props.buildingGroups.length) {
        let buildingList = handleSearchFilter(
          this.props.user,
          this.props.buildingList,
          '',
          buildingFilters,
          this.props.timeRange,
          this.props.buildingGroups,
          this.props.selectedBuildingGroupId,
          this.props.editBuildingGroup
        )
        let buildingIds = buildingList.map(item => item._id)
        updatedList = updatedList.filter(project => {
          if (project.building_id) {
            return buildingIds.indexOf(project.building_id) != -1
          }
          return false
        })
      }
      updatedList = handleSearchFilter(
        this.props.user,
        updatedList,
        searchValue,
        filters,
        this.props.timeRange
      )
      this.setState({
        projectList: updatedList
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
    this.props.updateProjectColumnList(columnList)
    this.props.updateProjectColumnIndex(
      index != null ? index : columnList.length - 1
    )
  }

  handleCurrentColumnChange = index => {
    this.props.updateProjectColumnIndex(index)
  }

  handleClick = e => {
    if (this.node && this.node.contains(e.target)) {
      // the click is inside, continue to menu links
      return
    }
    // otherwise, toggle (close) the dropdowns
    this.setState({ showExtras: false })
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

    this.props.updateProjectSort(tempSort).then(() => {
      let projectList = [...this.state.projectList]
      handleSort('project', projectList, tempSort).then(projectList => {
        this.setState({
          projectList: projectList
        })
      })
    })
  }

  getData = () => {
    const { columnList, columnIndex, timeRange } = this.props
    const { projectList } = this.state
    let columns =
      (columnList && columnList.length && columnList[columnIndex].column) ||
      defaultProjectColumn
    let data = projectList.map(project => {
      let projectData = {
        displayname: project.displayname
      }
      for (let column of columns) {
        let label = '-'
        let value = _getValueFromObjPerPath.call(project, column.value)
        if (column.value === 'updated' || column.value === 'created') {
          if (value === null) value = '-'
          else value = new Date(value).toLocaleDateString('en-US')
        }
        if (value === 'Infinity' || value == null || value == undefined)
          value = 0
        if (typeof value === 'number' && value == +value)
          value = formatNumbersWithCommas(value)
        label = value ? value : '-'
        if (typeof value === 'boolean') label = value ? 'Yes' : 'No'
        projectData[column.value] = formatStringUpperCase(label)
      }
      return projectData
    })
    return data
  }

  getHeaders = () => {
    const { columnList, columnIndex, user } = this.props
    let columns =
      (columnList && columnList.length && columnList[columnIndex].column) ||
      defaultProjectColumn
    columns = columns.filter(column => column.value !== 'displayname')
    let headers = [{ label: 'Name', key: 'displayname' }]
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

  downloadReport = (event, done) => {
    const date = new Date().toLocaleDateString('en-US')
    const data = this.getData()
    const headers = this.getHeaders()
    const objReport = {
      filename: `Portfolio Measures Export_${date}.csv`,
      headers: headers,
      data: data
    }
    this.setState({ csvReport: objReport }, () => {
      done()
    })
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

  handleClickAddBuilding = () => {
    this.props.push('/building/new')
  }

  handleClickAddSampleBuilding = () => {
    this.setState({ isCreatingBuilding: true })
    this.props
      .createSampleBuilding()
      .then(() => {
        this.props.updateBuildingViewMode('portfolio/measure')
        this.setState({ isCreatingBuilding: false })
      })
      .catch(() => {
        this.setState({ isCreatingBuilding: false })
      })
  }

  renderEmptyState = status => {
    const { loading } = this.props

    if (status == 1) {
      return (
        <div>
          <div className={portfolioStyles.empty}>
            <div className={portfolioStyles.emptyBody}>
              <div className={portfolioStyles.emptyBodyTitle}>
                Create a new building to start tracking measures
              </div>
              <div className={portfolioStyles.emptyBodyDescription}>
                Add your own building or work from a sample building.
              </div>
              <div className={portfolioStyles.emptyButtons}>
                <button
                  className={classNames(
                    portfolioStyles.button,
                    portfolioStyles.buttonPrimary
                  )}
                  onClick={this.handleClickAddBuilding}
                >
                  <i className="material-icons">add</i> Add Building
                </button>
                {this.state.isCreatingBuilding === false && (
                  <button
                    className={classNames(
                      portfolioStyles.button,
                      portfolioStyles.buttonPrimary
                    )}
                    onClick={this.handleClickAddSampleBuilding}
                  >
                    <i className="material-icons">add</i> Sample Building
                  </button>
                )}
                {this.state.isCreatingBuilding === true && (
                  <button
                    className={classNames(
                      portfolioStyles.button,
                      portfolioStyles.buttonPrimary,
                      portfolioStyles.buttonDisable
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
            <div className={portfolioStyles.portfolioContainerLoading}>
              <Loader />
              <div className={portfolioStyles.loadingBuilding}>
                <div>One moment while we get your data...</div>
              </div>
            </div>
          )}
        </div>
      )
    } else {
      return (
        <div className={portfolioStyles.empty}>
          <div className={portfolioStyles.emptyBody}>
            <div className={portfolioStyles.emptyBodyTitle}>
              Add a measure to a building to start tracking...
            </div>
            <div className={portfolioStyles.emptyBodyDescription}>
              your portfolio improvement opportunities.
            </div>
            <div className={portfolioStyles.emptyButtons}>
              <button
                className={classNames(
                  portfolioStyles.button,
                  portfolioStyles.buttonPrimary
                )}
                onClick={() => {
                  this.props.handleTabChange(2, 'Buildings', true)
                }}
              >
                Go To Buildings
              </button>
            </div>
          </div>
          {loading && (
            <div className={portfolioStyles.portfolioContainerLoading}>
              <Loader />
              <div className={portfolioStyles.loadingBuilding}>
                <div>One moment while we get your data...</div>
              </div>
            </div>
          )}
        </div>
      )
    }
  }

  checkEmptyState = () => {
    let { buildingList, filters, projectList } = this.props
    let { searchValue } = this.state
    searchValue = ''
    let buildingFilters = filters.filter(
      filter =>
        filter.tab == 'building' && !filter.value.includes('organization')
    )
    filters = filters.filter(
      filter =>
        filter.tab == 'project' ||
        filter.value.includes('organization') ||
        filter.value === 'building.buildingname'
    )
    if (buildingFilters.length || this.props.buildingGroups.length) {
      let buildingList = handleSearchFilter(
        this.props.user,
        this.props.buildingList,
        '',
        buildingFilters,
        this.props.timeRange,
        this.props.buildingGroups,
        this.props.selectedBuildingGroupId,
        this.props.editBuildingGroup
      )
      let buildingIds = buildingList.map(item => item._id)
      if (buildingIds.length == 0) return 1
      projectList = projectList.filter(project => {
        if (project.building_id) {
          return buildingIds.indexOf(project.building_id) != -1
        }
        return false
      })
    } else {
      if (buildingList.length == 0) return 1
    }
    // projectList = handleSearchFilter(
    //   this.props.user,
    //   projectList,
    //   searchValue,
    //   filters
    // )
    if (projectList.length == 0) return 2
    return 0
  }

  showPopup = () => {
    this.setState({ showPopup: true })
  }

  hidePopup = () => {
    this.setState({ showPopup: false })
  }

  handleCheckableProject = () => {
    this.setState(prevState => ({
      isCheckable: !prevState.isCheckable,
      selectedItems: []
    }))
  }

  handleSelectItems = (event, id) => {
    event.stopPropagation()
    let { selectedItems, projectList } = this.state
    if (id === 'all') {
      let ids = projectList.map(item => item._id)
      let checkedAll =
        multiSelectChecker(ids, selectedItems) &&
        multiSelectChecker(selectedItems, ids)
      selectedItems = checkedAll ? [] : ids
    } else {
      let ids = []
      if (selectedItems.indexOf(id) === -1) ids = [...selectedItems, id]
      else ids = selectedItems.filter(item => item !== id)
      ids = [...new Set(ids)]
      selectedItems = ids
    }
    if (selectedItems && selectedItems.length) {
      let firstProject = _.find(projectList, { _id: selectedItems[0] })
      if (firstProject) {
        let firstOrg = firstProject.organization._id
        let projects =
          projectList.filter(
            project =>
              selectedItems.indexOf(project._id) > -1 &&
              project.organization._id == firstOrg
          ) || []
        let ids = projects.map(item => item._id)
        selectedItems = ids
      }
    }
    this.setState({ selectedItems })
  }

  handleOpenProposalModal = () => {
    this.setState(prevState => ({
      modalOpen: true,
      modalView: 'addProposal',
      isCheckable: !prevState.isCheckable
    }))
  }

  handleCloseAddProposal = () => {
    this.setState({
      modalOpen: false,
      modalView: null,
      selectedItems: []
    })
  }

  getOrganizationId = () => {
    const { orgagnizationView, routeOrganizationId } = this.props
    const { selectedItems, projectList } = this.state
    let orgID =
      (orgagnizationView && orgagnizationView._id) || routeOrganizationId
    const selectedProjects = projectList.filter(
      project => selectedItems.indexOf(project._id) > -1
    )
    if (selectedProjects && selectedProjects.length) {
      let selectedOrgId =
        selectedProjects[0] &&
        selectedProjects[0].organization &&
        selectedProjects[0].organization._id
      if (selectedOrgId) orgID = selectedOrgId
    }
    return orgID
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
      this.props.push('/organization/all/portfolio/measure')
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
      projectList,
      showColumn,
      selectedItems,
      isCheckable
    } = this.state
    const {
      user,
      filters,
      columnList,
      columnIndex,
      sort,
      loading,
      buildingGroups,
      selectedBuildingGroupId
    } = this.props
    const columns =
      (columnList && columnList.length && columnList[columnIndex].column) ||
      defaultProjectColumn
    let checkEmpty = this.checkEmptyState()
    let maxLength = (this.state.height - 420) / 60
    maxLength = Math.max(Math.trunc(maxLength), 0)
    let length =
      projectList.length >= maxLength ? maxLength : projectList.length
    let height = (length + 2) * 60
    if (navigator.appVersion.indexOf('Win') != -1) height += 17
    let selectedMeasures =
      projectList.filter(
        project => selectedItems.indexOf(project._id) !== -1
      ) || []

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
              <div className={portfolioStyles.searchFilter}>
                <input
                  placeholder="Search for measures"
                  type="search"
                  value={searchValue}
                  onChange={this.handleSearchChange}
                />
                <i className="material-icons">search</i>
              </div>
              <div
                className={classNames(
                  buildingStyles.buildingButtons,
                  portfolioStyles.filterButtons
                )}
              >
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
                      defaultColumn={defaultProjectColumn}
                      ColumnOptions={projectColumnOptions}
                      currrentIndex={columnIndex}
                      handleToggleColumn={this.handleToggleColumn}
                      handleColumnChange={this.handleColumnChange}
                      handleCurrentColumnChange={this.handleCurrentColumnChange}
                    />
                  )}
                </div>
                {/* <div className={portfolioStyles.buildingButtonsAdd}>
                  <div
                    className={portfolioStyles.filterSelect}
                    onClick={this.handleOpenFilter}
                  >
                    Filter &nbsp;
                    <i className="material-icons">tune</i>
                  </div>
                </div> */}
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

                <UserFeature name="projectProposal">
                  {({ enabled }) => {
                    if (!enabled) return null
                    return (
                      <div
                        className={portfolioStyles.filterSelect}
                        onClick={this.handleCheckableProject}
                      >
                        <i className="material-icons">add</i>Proposal&nbsp;
                        <i className="material-icons">summarize</i>
                      </div>
                    )
                  }}
                </UserFeature>
                <div className={portfolioStyles.buildingButtonsAdd}>
                  <div
                    className={portfolioStyles.filterSelect}
                    onClick={this.props.hardReload}
                    onMouseEnter={this.showPopup}
                    onMouseLeave={this.hidePopup}
                  >
                    <i className="material-icons">replay</i>
                  </div>
                  {this.state.showPopup && <PortfolioSyncPopup />}{' '}
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
              FilterOptions={projectFilterOptions}
              itemList={this.props.projectList}
              activeTab={'project'}
              loading={loading}
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
        {!!checkEmpty && this.renderEmptyState(checkEmpty)}
        {!checkEmpty && (
          <div>
            <div className={portfolioStyles.container}>
              <div
                className={classNames(
                  portfolioStyles.panel,
                  loading ? portfolioStyles.cursorWait : ''
                )}
              >
                <div style={{ marginBottom: `${height}px` }}>
                  <div
                    className={classNames(
                      portfolioStyles.panel,
                      loading ? portfolioStyles.cursorWait : ''
                    )}
                  >
                    {loading && (
                      <div
                        className={portfolioStyles.portfolioContainerLoading}
                      >
                        <Loader />
                        <div className={portfolioStyles.loadingBuilding}>
                          <div>One moment while we get your data...</div>
                        </div>
                      </div>
                    )}
                    <PortfolioProjectTable
                      projects={projectList}
                      columns={columns}
                      user={this.props.user}
                      sortOption={sort}
                      filterList={filters}
                      pushFunc={this.props.push}
                      sortFunc={this.handleClickSort}
                      loading={loading}
                      updateOrganization={this.props.updateCurrentOrganization}
                      updateBuildingTab={this.props.updateBuildingTab}
                      updateProjectViewTab={this.props.updateProjectViewTab}
                      updateBuildingViewMode={this.props.updateBuildingViewMode}
                      isCheckable={this.state.isCheckable}
                      handleSelectItems={this.handleSelectItems}
                      selectedItems={this.state.selectedItems}
                    />
                  </div>
                </div>
              </div>
            </div>
            {isCheckable && (
              <div className={projectViewStyles.proposalFooter}>
                <div className={projectViewStyles.container}>
                  <div className={projectViewStyles.proposalFooterButtons}>
                    <div
                      className={projectViewStyles.proposalFooterButtonsLeft}
                    >
                      <div>
                        Check measures to include the proposal and select next.
                      </div>
                    </div>
                    <div
                      className={projectViewStyles.proposalFooterButtonsRight}
                    >
                      <button
                        className={classNames(
                          projectViewStyles.button,
                          projectViewStyles.buttonSecondary
                        )}
                        onClick={this.handleCheckableProject}
                      >
                        Cancel
                      </button>
                      <button
                        className={classNames(
                          projectViewStyles.button,
                          projectViewStyles.buttonPrimary,
                          {
                            [projectViewStyles.buttonDisable]: !selectedItems.length
                          }
                        )}
                        disabled={!selectedItems.length}
                        onClick={this.handleOpenProposalModal}
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {this.state.modalOpen && this.state.modalView === 'addProposal' && (
          <PortfolioProposalModal
            user={this.props.user}
            onClose={this.handleCloseAddProposal}
            viewMode={this.state.modalView}
            proposal={null}
            proposalMode={'Measure'}
            selectedMeasures={selectedMeasures}
          />
        )}
      </div>
    )
  }
}

const mapDispatchToProps = {
  push,
  updateDashboardFilters,
  updateProjectSort,
  updateProjectColumnList,
  updateProjectColumnIndex,
  updateCurrentOrganization,
  updateBuildingTab,
  updateProjectViewTab,
  updateBuildingViewMode,
  getTableauToken,
  createSampleBuilding,
  fetchBuildingGroups,
  deleteBuildingGroup,
  toggleManageAllOrgs,
  setBuildingGroup,
  toggleBuildingGroup
}

const mapStateToProps = state => ({
  user: state.login.user || {},
  organizationView: state.organization.organizationView || {},
  organizationList: state.organization.organizationList || [],
  projectList: state.portfolio.dashboard.projects || [],
  buildingList: state.portfolio.dashboard.buildings || [],
  buildingGroups: state.portfolio.buildingGroups,
  filters: state.portfolio.dashboardFilters || [],
  sort: state.portfolio.projectSort || [],
  columnList: state.portfolio.projectColumnList || [
    {
      name: 'Default',
      column: defaultProjectColumn
    }
  ],
  columnIndex: state.portfolio.projectColumnIndex || 0,
  loading: state.portfolio.loading || false,
  tableauToken: state.portfolio.tableauToken,
  selectedBuildingGroupId: state.portfolio.selectedBuildingGroupId,
  manageAllOrgSelected: state.organization.manageAllOrgSelected || false
})

export default connect(mapStateToProps, mapDispatchToProps)(PortfolioProjects)
