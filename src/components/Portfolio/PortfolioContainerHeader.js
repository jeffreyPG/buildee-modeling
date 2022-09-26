import React, { Component } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { connect } from 'react-redux'
import { push } from 'react-router-redux'
import _ from 'lodash'
import styles from './PortfolioContainer.scss'
import buildingStyles from '../Building/Building.scss'
import ScenarioModal from '../../containers/Modal/ScenarioModal'
import PortfolioProposalModal from '../../containers/Modal/PortfolioProposalModal'
import UserFeature from 'utils/Feature/UserFeature'
import { handleSearchFilter } from 'utils/Portfolio'
import { Loader } from 'utils/Loader'
import {
  updateBuildingViewMode,
  createSampleBuilding
} from '../../routes/Building/modules/building'
import PortfolioImportXMLModal from './PortfolioImportXMLModal'

class PortfolioContainerHeader extends Component {
  static propTypes = {
    user: PropTypes.object.isRequired,
    push: PropTypes.func.isRequired,
    handleTabChange: PropTypes.func.isRequired,
    toggleTargetModal: PropTypes.func.isRequired,
    tabs: PropTypes.arrayOf(PropTypes.object).isRequired,
    selectedView: PropTypes.object.isRequired,
    orgId: PropTypes.string.isRequired,
    isOrganizationOwner: PropTypes.bool.isRequired
  }

  state = {
    showExtras: false,
    showBuildingExtras: false,
    showProposalExtras: false,
    modalOpen: false,
    modalView: null,
    isCreatingBuilding: false,
    proposalMode: ''
  }

  UNSAFE_componentWillMount = () => {
    document.addEventListener('mousedown', this.handleClick, false)
  }

  componentWillUnmount = () => {
    document.removeEventListener('mousedown', this.handleClick, false)
    this.setState({ showExtras: false, showBuildingExtras: false })
  }

  handleClickAddBuilding = event => {
    this.props.push('/building/new')
  }

  handleClickAddSampleBuilding = () => {
    const { selectedView } = this.props
    this.setState({ isCreatingBuilding: true })
    this.props
      .createSampleBuilding()
      .then(() => {
        let { name = 'Dashboard' } = selectedView
        let tabs = [
          { name: 'Dashboard', route: 'dashboard', active: true },
          { name: 'Buildings', route: 'building', active: true },
          { name: 'Measures', route: 'measure', active: true },
          { name: 'Projects', route: 'project', active: true },
          // { name: 'Equipments', route: 'equipment', active: true },
          {
            name: 'Proposals',
            route: 'proposal',
            active: true
          },
          {
            name: 'Scenarios',
            route: 'scenario',
            active: true,
            featureFlag: true
          }
        ]
        let currentTab = _.find(tabs, { name })
        if (!currentTab)
          currentTab = { name: 'Dashboard', route: 'dashboard', active: true }
        this.props.updateBuildingViewMode(`portfolio/${currentTab.route}`)
        this.setState({ isCreatingBuilding: false })
      })
      .catch(() => {
        this.setState({ isCreatingBuilding: false })
      })
  }

  handleClickImportBuilding = () => {
    this.props.push('/portfolio')
  }

  handleClickOpenXMLBuilding = event => {
    this.setState({
      modalOpen: true,
      modalView: 'XMLUploadBuilding',
      showBuildingExtras: false
    })
  }

  handleClickImportPM = () => {
    this.props.push('/portfolio')
  }

  handleToggleExtras = () => {
    this.setState(prevState => ({
      showExtras: !prevState.showExtras,
      showBuildingExtras: false,
      showProposalExtras: false
    }))
  }

  handleToggleBuildingExtras = () => {
    this.setState(prevState => ({
      showExtras: false,
      showBuildingExtras: !prevState.showBuildingExtras,
      showProposalExtras: false
    }))
  }

  handleToggleProposalExtras = () => {
    this.setState(prevState => ({
      showExtras: false,
      showBuildingExtras: false,
      showProposalExtras: !prevState.showProposalExtras
    }))
  }

  handleClick = e => {
    if (this.state.showExtras) {
      if (this.node && this.node.contains(e.target)) return
      this.setState({ showExtras: false })
    }

    if (this.state.showBuildingExtras) {
      if (this.nodeBuilding && this.nodeBuilding.contains(e.target)) return
      this.setState({ showBuildingExtras: false })
    }

    if (this.state.showProposalExtras) {
      if (this.nodeProposal && this.nodeProposal.contains(e.target)) return
      this.setState({ showProposalExtras: false })
    }
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

  handleOpenProposalModal = proposalMode => {
    this.setState({
      modalOpen: true,
      modalView: 'addProposal',
      proposalMode
    })
  }

  handleCloseProposalModal = () => {
    this.setState({ modalOpen: false, modalView: null })
  }

  handleArchived = () => {
    this.props.updateBuildingListStatus('archive').then(() => {
      this.props.push('/organization/' + this.props.orgId + '/building')
    })
  }

  checkEmpty = selectedView => {
    let { name = 'Dashboard' } = selectedView
    if (name === 'Dashboard') {
      const {
        buildings = [],
        projectPackages = [],
        projects = []
      } = this.props.dashboard
      let archivedBuilding = buildings.filter(
        building => building.archived === false
      )
      if (archivedBuilding.length === 0) return true
      let flag = buildings.every(
        building =>
          !building.monthlyUtilities || building.monthlyUtilities.length === 0
      )
      if (flag && projects.length === 0 && projectPackages.length === 0)
        return true
      return false
    } else if (name === 'Buildings' || name === 'Scenarios') {
      const { dashboard = {} } = this.props
      const { buildings = [] } = dashboard
      let archivedBuilding = buildings.filter(
        building => building.archived === false
      )
      return archivedBuilding.length === 0
    } else if (name === 'Measures') {
      let { dashboard = {}, filters = [] } = this.props
      let {
        buildings: buildingList = [],
        projects: projectList = []
      } = dashboard
      let searchValue = ''
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
      if (buildingFilters.length) {
        let buildingList = handleSearchFilter(
          this.props.user,
          this.props.buildingList,
          '',
          buildingFilters
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
      return false
    } else if (name === 'Projects') {
      let { dashboard = {}, filters = [] } = this.props
      let {
        buildings: buildingList = [],
        projectPackages: projectPackageList = []
      } = dashboard
      let searchValue = ''
      let buildingFilters = filters.filter(
        filter =>
          filter.tab == 'building' && !filter.value.includes('organization')
      )
      filters = filters.filter(
        filter =>
          filter.tab == 'projectPackage' ||
          filter.value.includes('organization') ||
          filter.value === 'building.buildingname'
      )
      if (buildingFilters.length) {
        let buildingList = handleSearchFilter(
          this.props.user,
          this.props.buildingList,
          '',
          buildingFilters
        )
        let buildingIds = buildingList.map(item => item._id)
        if (buildingIds.length == 0) return true
        projectPackageList = projectPackageList.filter(project => {
          if (project.building_id) {
            return buildingIds.indexOf(project.building_id) != -1
          }
          return false
        })
      } else {
        if (buildingList.length == 0) return true
      }
      projectPackageList = handleSearchFilter(
        this.props.user,
        projectPackageList,
        searchValue,
        filters
      )
      if (projectPackageList.length == 0) return true
      return false
    }
    return false
  }

  humanReadableText = selectedView => {
    if (
      !selectedView ||
      selectedView.name === 'Dashboard' ||
      selectedView.name === 'Scenarios'
    )
      return ''
    return selectedView.name
  }

  getOrganizationId = () => {
    const { orgagnizationView, routeOrganizationId } = this.props
    return (orgagnizationView && orgagnizationView._id) || routeOrganizationId
  }

  render() {
    const { selectedView, user } = this.props
    const checkEmpty = this.checkEmpty(selectedView)
    const title = this.humanReadableText(selectedView)

    return (
      <div className={classNames(styles.portfolioContainerHeader)}>
        <div className={styles.container} ref={node => (this.node = node)}>
          <div className={buildingStyles.buildingTotals}>
            {!!title ? <h2>{title}</h2> : <h2>&nbsp;</h2>}
          </div>
          {selectedView && selectedView.name === 'Buildings' && (
            <div className={buildingStyles.buildingButtons}>
              {!checkEmpty && (
                <div
                  className={classNames(
                    buildingStyles.buildingButtonsAdd,
                    buildingStyles.extras,
                    this.state.showBuildingExtras
                      ? buildingStyles.extrasShow
                      : buildingStyles.extrasHide
                  )}
                  ref={node => (this.nodeBuilding = node)}
                >
                  <button
                    className={classNames(
                      buildingStyles.button,
                      buildingStyles.buttonPrimary
                    )}
                    onClick={this.handleToggleBuildingExtras}
                  >
                    <i className="material-icons">add</i>Add
                    <span> Building</span>
                  </button>

                  <div
                    className={classNames(
                      buildingStyles.extrasDropdown,
                      buildingStyles.extrasDropdownRight
                    )}
                  >
                    <div
                      className={styles.extrasLink}
                      onClick={this.handleClickAddBuilding}
                    >
                      <i className="material-icons">add</i>New Building
                    </div>
                    <div
                      className={styles.extrasLink}
                      onClick={this.handleClickAddSampleBuilding}
                    >
                      <i className="material-icons">add</i>Sample Building
                      &nbsp; &nbsp;
                      {!!this.state.isCreatingBuilding && (
                        <Loader size="button" />
                      )}
                    </div>
                    <div
                      className={buildingStyles.extrasLink}
                      onClick={this.handleClickImportBuilding}
                    >
                      <i className="material-icons">add</i>Import from ENERGY
                      STAR
                    </div>
                    {user &&
                      user.products &&
                      user.products.buildeeNYC === 'access' && (
                        <div
                          className={buildingStyles.extrasLink}
                          onClick={this.handleClickOpenXMLBuilding}
                        >
                          <i className="material-icons">add</i>Import
                          BuildingSync File
                        </div>
                      )}
                  </div>
                </div>
              )}
              <div
                onClick={this.handleToggleExtras}
                className={classNames(
                  buildingStyles.buildingButtonsMore,
                  buildingStyles.extras,
                  this.state.showExtras
                    ? buildingStyles.extrasShow
                    : buildingStyles.extrasHide
                )}
              >
                <span
                  className={classNames(
                    buildingStyles.extrasButton,
                    styles.extrasButton
                  )}
                />
                <div
                  className={classNames(
                    buildingStyles.extrasDropdown,
                    buildingStyles.extrasDropdownRight
                  )}
                >
                  <div
                    className={styles.extrasLink}
                    onClick={() => this.handleArchived()}
                  >
                    <i className="material-icons">archive</i>Archived Buildings
                  </div>
                  <div
                    className={buildingStyles.extrasLink}
                    onClick={this.handleClickImportPM}
                  >
                    <i className="material-icons">star</i>Manage Portfolio
                    Manager
                  </div>
                  {/* {this.props.isOrganizationOwner && (
                    <div
                      className={buildingStyles.extrasLink}
                      onClick={this.props.toggleTargetModal}
                    >
                      <i className="material-icons">star</i>Manage Targets
                    </div>
                  )} */}
                </div>
              </div>
            </div>
          )}
          {selectedView.name === 'Proposals' && (
            <div className={buildingStyles.buildingButtons}>
              <div
                className={classNames(
                  buildingStyles.buildingButtonsAdd,
                  buildingStyles.extras,
                  this.state.showProposalExtras
                    ? buildingStyles.extrasShow
                    : buildingStyles.extrasHide
                )}
                ref={node => (this.nodeProposal = node)}
              >
                <button
                  className={classNames(
                    buildingStyles.button,
                    buildingStyles.buttonPrimary
                  )}
                  onClick={this.handleToggleProposalExtras}
                >
                  <i className="material-icons">add</i>Add
                  <span> Proposal</span>
                </button>

                <div
                  className={classNames(
                    buildingStyles.extrasDropdown,
                    buildingStyles.extrasDropdownRight
                  )}
                >
                  <div
                    className={styles.extrasLink}
                    onClick={() => this.handleOpenProposalModal('Measure')}
                  >
                    <i className="material-icons">add</i>Proposal From Measures
                  </div>
                  <div
                    className={styles.extrasLink}
                    onClick={() => this.handleOpenProposalModal('Project')}
                  >
                    <i className="material-icons">add</i>Proposal From Projects
                  </div>
                </div>
              </div>
            </div>
          )}
          {selectedView.name === 'Scenarios' && (
            <div className={buildingStyles.buildingButtons}>
              {!checkEmpty && (
                <div className={buildingStyles.buildingButtonsAdd}>
                  <button
                    className={classNames(
                      buildingStyles.button,
                      buildingStyles.buttonPrimary
                    )}
                    onClick={this.handleOpenScenarioModal}
                  >
                    <i className="material-icons">add</i>Add
                    <span> Scenario</span>
                  </button>
                </div>
              )}
              {this.props.isOrganizationOwner && (
                <div
                  onClick={this.handleToggleExtras}
                  className={classNames(
                    buildingStyles.buildingButtonsMore,
                    buildingStyles.extras,
                    this.state.showExtras
                      ? buildingStyles.extrasShow
                      : buildingStyles.extrasHide
                  )}
                >
                  <span
                    className={classNames(
                      buildingStyles.extrasButton,
                      styles.extrasButton
                    )}
                  />
                  {/* <div
                    className={classNames(
                      buildingStyles.extrasDropdown,
                      buildingStyles.extrasDropdownRight
                    )}
                  >
                    <div
                      className={buildingStyles.extrasLink}
                      onClick={this.props.toggleTargetModal}
                    >
                      <i className="material-icons">star</i>Manage Targets
                    </div>
                  </div> */}
                </div>
              )}
            </div>
          )}
        </div>
        {this.state.modalOpen && this.state.modalView === 'addScenario' && (
          <ScenarioModal
            user={this.props.user}
            onClose={this.handleCloseScenarioModal}
            modalView={this.state.modalView}
            filters={[]}
            scenario={null}
          />
        )}{' '}
        {this.state.modalOpen && this.state.modalView === 'addProposal' && (
          <PortfolioProposalModal
            user={this.props.user}
            onClose={this.handleCloseProposalModal}
            viewMode={this.state.modalView}
            proposal={null}
            proposalMode={this.state.proposalMode}
            orgId={this.getOrganizationId()}
            selectedMeasures={[]}
            selectedProjects={[]}
          />
        )}
        {this.state.modalOpen &&
          this.state.modalView === 'XMLUploadBuilding' && (
            <PortfolioImportXMLModal onClose={this.handleCloseScenarioModal} />
          )}
      </div>
    )
  }
}

const mapDispatchToProps = {
  push,
  createSampleBuilding,
  updateBuildingViewMode
}

const mapStateToProps = state => ({
  user: state.login.user || {},
  dashboard: state.portfolio.dashboard || {},
  filters: state.portfolio.dashboardFilters || [],
  organizationView: state.organization.organizationView || {}
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(PortfolioContainerHeader)
