import React, { Component } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { connect } from 'react-redux'
import { push } from 'react-router-redux'
import { CSVLink } from 'react-csv'
import PortfolioSyncPopup from '../PortfolioSyncPopup'
import ColumnList from '../../UI/Column/ColumnList'
import { Loader } from 'utils/Loader'
import FilterContainer from '../FilterContainer'
import PortfolioProposalTable from '../../UI/PortfolioTables/PortfolioProposalTable'
import {
  updateDashboardFilters,
  updateProposalSort,
  updateProposalColumnList,
  updateProposalColumnIndex,
  deletePortfolioProposal,
  fetchBuildingGroups,
  deleteBuildingGroup,
  setBuildingGroup,
  toggleBuildingGroup
} from 'routes/Portfolio/modules/portfolio'
import {
  handleSort,
  handleSearchFilter,
  checkOrganizationFilterChange,
  multiSelectChecker,
  getBuildingNamesFromProposal
} from 'utils/Portfolio'
import { toggleManageAllOrgs } from '../../../routes/Organization/modules/organization'
import {
  ProposalFilterOptions,
  proposalColumnOptions,
  defaultProposalColumn
} from 'utils/PortfolioOptions'
import { formatStringUpperCase } from '../../Project/ProjectHelpers'

import PortfolioProposalModal from '../../../containers/Modal/PortfolioProposalModal'
import portfolioStyles from '../PortfolioContainer.scss'
import buildingStyles from '../../Building/Building.scss'

import {
  _getValueFromObjPerPath,
  formatNumbersWithCommas,
  isProdEnv
} from 'utils/Utils'

class PortfolioProposal extends Component {
  static propTypes = {
    user: PropTypes.object.isRequired,
    push: PropTypes.func.isRequired,
    proposalList: PropTypes.array.isRequired,
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
    proposalList: this.props.proposalList || [],
    csvReport: {
      data: [],
      headers: [],
      filename: 'Report.csv'
    },
    height: window.innerHeight,
    showFilter: false,
    currentProposal: null,
    modalOpen: false,
    modalView: '',
    showExtras: ''
  }

  componentWillMount() {
    document.addEventListener('mousedown', this.handleClick, false)
    if (this.props.buildingGroups.length === 0) {
      this.props.fetchBuildingGroups()
    }
  }

  componentDidMount() {
    window.addEventListener('resize', this.resize)
    if (!this.props.loading) {
      const { searchValue } = this.state
      let { filters, sort } = this.props
      let newProposalList = this.props.proposalList || []
      filters = filters.filter(
        filter =>
          filter.tab === 'proposal' ||
          filter.value.includes('organization') ||
          filter.value === 'building.buildingname' ||
          filter.value === 'building.buildingName'
      )
      newProposalList = handleSearchFilter(
        this.props.user,
        newProposalList,
        searchValue,
        filters,
        this.props.timeRange
      )
      handleSort('proposal', newProposalList, sort).then(proposalList => {
        let updatedProposalList = proposalList
        if (this.props.selectedBuildingGroupId) {
          const selectedGroup = this.props.buildingGroups.find(
            group => group._id === this.props.selectedBuildingGroupId
          )
          if (selectedGroup) {
            updatedProposalList = updatedProposalList.reduce(
              (agg, proposal) => {
                proposal.isInGroup = selectedGroup.buildingIds.some(
                  buildingId => proposal.buildingIds.includes(buildingId)
                )
                if (proposal.isInGroup) {
                  agg.push(proposal)
                }
                return agg
              },
              []
            )
          }
        }
        this.setState({ proposalList: updatedProposalList })
      })
    }
  }

  componentWillUnmount() {
    document.removeEventListener('mousedown', this.handleClick, false)
    window.removeEventListener('resize', this.resize)
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (
      nextProps.proposalList != this.props.proposalList ||
      nextProps.selectedBuildingGroupId !== this.props.selectedBuildingGroupId
    ) {
      const { searchValue } = this.state
      let { filters, sort } = this.props
      let newProposalList = nextProps.proposalList || []
      filters = filters.filter(
        filter =>
          filter.tab === 'proposal' ||
          filter.value.includes('organization') ||
          filter.value === 'building.buildingname' ||
          filter.value === 'building.buildingName'
      )
      newProposalList = handleSearchFilter(
        nextProps.user,
        newProposalList,
        searchValue,
        filters,
        this.props.timeRange
      )
      handleSort('proposal', newProposalList, sort).then(proposalList => {
        let updatedProposalList = proposalList
        if (nextProps.selectedBuildingGroupId) {
          const selectedGroup = nextProps.buildingGroups.find(
            group => group._id === nextProps.selectedBuildingGroupId
          )
          if (selectedGroup) {
            updatedProposalList = updatedProposalList.reduce(
              (agg, proposal) => {
                proposal.isInGroup = selectedGroup.buildingIds.some(
                  buildingId => proposal.buildingIds.includes(buildingId)
                )
                if (proposal.isInGroup) {
                  agg.push(proposal)
                }
                return agg
              },
              []
            )
          }
        }
        this.setState({ proposalList: updatedProposalList })
      })
    }
  }

  resize = () => {
    this.setState({ height: window.innerHeight })
  }

  handleOpenColumn = () => {
    this.setState(prevState => ({
      showColumn: !prevState.showColumn
    }))
  }

  handleSearch = () => {
    let { filters } = this.props
    let { searchValue } = this.state
    let updatedList = this.props.proposalList

    filters = filters.filter(
      filter =>
        filter.tab === 'proposal' ||
        filter.value.includes('organization') ||
        filter.value === 'building.buildingname' ||
        filter.value === 'building.buildingName'
    )

    updatedList = handleSearchFilter(
      this.props.user,
      updatedList,
      searchValue,
      filters,
      this.props.timeRange
    )
    this.setState({ proposalList: updatedList })
  }

  handleSearchChange = ({ target: { value } }) => {
    const searchBy = value || ''
    this.setState({ searchValue: searchBy }, () => {
      this.handleSearch()
    })
  }

  getData = () => {
    const { columnList, columnIndex, timeRange } = this.props
    const { proposalList } = this.state
    let columns =
      (columnList && columnList.length && columnList[columnIndex].column) ||
      defaultProjectColumn
    let data = proposalList.map(project => {
      let projectData = {
        name: project.name
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
        if (column.value === 'building.buildingName') {
          label = getBuildingNamesFromProposal(project)
        }
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
    columns = columns.filter(column => column.value !== 'name')
    let headers = [{ label: 'Name', key: 'name' }]
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
      filename: `Portfolio Proposal Export_${date}.csv`,
      headers: headers,
      data: data
    }
    this.setState({ csvReport: objReport }, () => {
      done()
    })
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
    this.props.updateProposalColumnList(columnList)
    this.props.updateProposalColumnIndex(
      index != null ? index : columnList.length - 1
    )
  }

  handleCurrentColumnChange = index => {
    this.props.updateProposalColumnIndex(index)
  }

  checkEmptyState = () => {
    let { filters, proposalList } = this.props
    let { searchValue } = this.state
    let propoalFilters = filters.filter(
      filter =>
        filter.tab == 'proposal' || filter.value.includes('organization')
    )
    let updatedList = handleSearchFilter(
      this.props.user,
      proposalList,
      searchValue,
      propoalFilters,
      this.props.timeRange
    )
    if (updatedList.length === 0) return true
    return false
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
      let updatedList = this.props.proposalList
      let buildingFilters = options.filter(
        filter =>
          filter.tab == 'building' && !filter.value.includes('organization')
      )
      filters = options.filter(
        filter =>
          filter.tab == 'proposal' || filter.value.includes('organization')
      )
      if (buildingFilters.length) {
        let buildingList = handleSearchFilter(
          this.props.user,
          this.props.buildingList,
          '',
          buildingFilters,
          this.props.timeRange
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
        proposalList: updatedList
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

    this.props.updateProposalSort(tempSort).then(() => {
      let proposalList = [...this.state.proposalList]
      handleSort('proposal', proposalList, tempSort).then(proposalList => {
        this.setState({
          proposalList: proposalList
        })
      })
    })
  }

  handleOpenProposal = proposal => {
    this.setState({
      currentProposal: proposal,
      modalOpen: true,
      modalView: 'editProposal'
    })
  }

  handleCloseProposal = () => {
    this.setState({
      currentProposal: null,
      modalOpen: false,
      modalView: ''
    })
  }

  handleToggleExtras = index => {
    // toggle off
    if (index === this.state.showExtras) {
      this.setState({ showExtras: '' })
      return
    }
    this.setState({ showExtras: index })
  }

  deleteProposal = project => {
    this.props
      .deletePortfolioProposal(project._id)
      .then(() => {
        console.log('success')
      })
      .catch(error => {
        console.log('error', error)
      })
  }

  renderEmptyState() {
    return (
      <div className={portfolioStyles.empty}>
        <div className={portfolioStyles.emptyBody}>
          <div className={portfolioStyles.emptyBodyTitle}>
            Create a proposal from your measures…
          </div>
          <div className={portfolioStyles.emptyBodyDescription}>
            to share with others and convert into a project.
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
      </div>
    )
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
      this.props.push('/organization/all/portfolio/proposal')
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
    const { searchValue, showFilter, proposalList, showColumn } = this.state
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
      defaultProposalColumn

    let checkEmpty = this.checkEmptyState()
    let maxLength = (this.state.height - 420) / 60
    maxLength = Math.max(Math.trunc(maxLength), 0)
    let length =
      proposalList.length >= maxLength ? maxLength : proposalList.length
    let height = (length + 2) * 60
    if (navigator.appVersion.indexOf('Win') != -1) height += 17

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
                  placeholder="Search for proposals"
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
                      defaultColumn={defaultProposalColumn}
                      ColumnOptions={proposalColumnOptions}
                      currrentIndex={columnIndex}
                      handleToggleColumn={this.handleToggleColumn}
                      handleColumnChange={this.handleColumnChange}
                      handleCurrentColumnChange={this.handleCurrentColumnChange}
                    />
                  )}
                </div>
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
              FilterOptions={ProposalFilterOptions}
              itemList={this.props.proposalList}
              activeTab={'proposal'}
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
                    <div className={portfolioStyles.portfolioContainerLoading}>
                      <Loader />
                      <div className={portfolioStyles.loadingBuilding}>
                        <div>One moment while we get your data...</div>
                      </div>
                    </div>
                  )}
                  <PortfolioProposalTable
                    projects={proposalList}
                    columns={columns}
                    user={this.props.user}
                    sortOption={sort}
                    user={user}
                    filterList={filters}
                    pushFunc={this.props.push}
                    sortFunc={this.handleClickSort}
                    loading={loading}
                    selectProposal={this.handleOpenProposal}
                    showExtras={this.state.showExtras}
                    toggleShowExtra={this.handleToggleExtras}
                    deleteProposal={this.deleteProposal}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
        {this.state.modalOpen && this.state.modalView === 'editProposal' && (
          <PortfolioProposalModal
            user={this.props.user}
            onClose={this.handleCloseProposal}
            viewMode={this.state.modalView}
            proposal={this.state.currentProposal}
            proposalMode={this.state.currentProposal.mode || 'proposal'}
            orgId={this.state.currentProposal.organization._id}
          />
        )}
      </div>
    )
  }
}

const mapDispatchToProps = {
  push,
  updateDashboardFilters,
  updateProposalSort,
  updateProposalColumnList,
  updateProposalColumnIndex,
  deletePortfolioProposal,
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
  proposalList: state.portfolio.dashboard.proposals || [],
  buildingGroups: state.portfolio.buildingGroups,
  filters: state.portfolio.dashboardFilters || [],
  loading: state.portfolio.loading || false,
  columnList: state.portfolio.proposalColumnList || [
    {
      name: 'Default',
      column: defaultProposalColumn
    }
  ],
  columnIndex: state.portfolio.proposalColumnIndex || 0,
  sort: state.portfolio.proposalSort || [],
  selectedBuildingGroupId: state.portfolio.selectedBuildingGroupId,
  manageAllOrgSelected: state.organization.manageAllOrgSelected || false
})

export default connect(mapStateToProps, mapDispatchToProps)(PortfolioProposal)
