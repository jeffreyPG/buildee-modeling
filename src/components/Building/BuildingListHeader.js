import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import PortfolioImportXMLModal from 'components/Portfolio/PortfolioImportXMLModal'

import { Loader } from 'utils/Loader'
import UserFeature from 'utils/Feature/UserFeature'

import styles from './Building.scss'

export class BuildingListHeader extends React.Component {
  static propTypes = {
    building: PropTypes.object.isRequired,
    user: PropTypes.object.isRequired,
    handlePopulateBuildingList: PropTypes.func.isRequired,
    handleClickImportEA: PropTypes.func.isRequired,
    getEaBuildings: PropTypes.bool.isRequired,
    loadingEABuildings: PropTypes.bool.isRequired,
    buildingListStatus: PropTypes.string.isRequired,
    toggleTargetModal: PropTypes.func.isRequired,
    isOrganizationOwner: PropTypes.bool.isRequired
  }

  state = {
    showCategories: false,
    showBuildingExtras: false,
    showExtras: false,
    isCreatingBuilding: false,
    modalView: null
  }

  UNSAFE_componentWillMount = () => {
    document.addEventListener('mousedown', this.handleClick, false)
  }

  componentWillUnmount = () => {
    document.removeEventListener('mousedown', this.handleClick, false)
    this.setState({
      showCategories: false,
      showExtras: false,
      showBuildingExtras: false
    })
  }

  handleClick = e => {
    if (this.node && this.node.contains(e.target)) {
      // the click is inside, continue to menu links
      return
    }
    // otherwise, toggle (close) the dropdowns
    this.setState({ showCategories: false, showExtras: false })
  }

  handleToggleBuildingExtras = () => {
    this.setState(prevState => ({
      showExtras: false,
      showBuildingExtras: !prevState.showBuildingExtras
    }))
  }

  handleClickImportPM = () => {
    this.props.push('/portfolio')
  }

  handleClickAddBuilding = event => {
    this.props.push('/building/new')
  }

  handleClickImportBuilding = () => {
    this.props.push('/portfolio')
  }

  handleToggleExtras = () => {
    this.setState(prevState => ({
      showExtras: !prevState.showExtras,
      showBuildingExtras: false
    }))
  }

  handleToggleCategories = () => {
    this.setState(prevState => ({
      showCategories: !prevState.showCategories
    }))
  }

  handleListCounts = option => {
    const { buildingList } = this.props.building

    if (option === 'buildings') {
      return buildingList.filter(x => !x.archived).length
    } else if (option === 'archive') {
      return buildingList.filter(x => x.archived).length
    }
  }

  handleClickAddSampleBuilding = () => {
    this.setState({ isCreatingBuilding: true })
    this.props
      .createSampleBuilding()
      .then(() => {
        this.setState({ isCreatingBuilding: false })
      })
      .catch(() => {
        this.setState({ isCreatingBuilding: false })
      })
  }

  handleClickOpenXMLBuilding = () => {
    this.setState({
      modalView: 'XMLUploadBuilding',
      showBuildingExtras: false
    })
  }

  handleCloseScenarioModal = () => {
    this.setState({ modalView: null })
  }

  render() {
    const { user } = this.props
    const { buildingListStatus, buildingList } = this.props.building
    let checkItems =
      buildingList.filter(building => {
        if (buildingListStatus === 'buildings') return !building.archived
        else return building.archived
      }) || []
    return (
      <div className={styles.buildingHeader}>
        <div className={styles.container} ref={node => (this.node = node)}>
          <div className={styles.buildingTotals}>
            <div
              className={classNames(
                styles.buildingButtonsMore,
                styles.extras,
                this.state.showCategories
                  ? styles.extrasShow
                  : styles.extrasHide
              )}
            >
              <h2>
                {this.props.buildingListStatus === 'buildings' ? (
                  'My Buildings'
                ) : (
                  <div className={styles.archivedHeader}>
                    <div
                      className={styles.archivedHeaderBack}
                      onClick={() => {
                        this.props.handlePopulateBuildingList('buildings')
                      }}
                    >
                      <i className="material-icons">arrow_back</i>
                      Back to Buildings
                    </div>
                    &nbsp;&nbsp;Archived
                  </div>
                )}
              </h2>
              <div
                className={classNames(
                  styles.extrasDropdown,
                  styles.extrasDropdownLeft
                )}
              >
                <div
                  className={classNames(
                    styles.extrasLink,
                    this.props.buildingListStatus === 'buildings'
                      ? styles.extrasLinkActive
                      : styles.extrasLinkInactive
                  )}
                  onClick={() =>
                    this.props.handlePopulateBuildingList('buildings')
                  }
                >
                  <i className="material-icons">domain</i>
                  My Buildings
                  <span className={styles.extrasCount}>
                    {this.handleListCounts('buildings')}
                  </span>
                </div>
                <div
                  className={classNames(
                    styles.extrasLink,
                    this.props.buildingListStatus === 'archive'
                      ? styles.extrasLinkActive
                      : styles.extrasLinkInactive
                  )}
                  onClick={() =>
                    this.props.handlePopulateBuildingList('archive')
                  }
                >
                  <i className="material-icons">archive</i>
                  Archive
                  <span className={styles.extrasCount}>
                    {this.handleListCounts('archive')}
                  </span>
                </div>
              </div>
            </div>
          </div>
          {this.props.buildingListStatus === 'buildings' &&
            checkItems.length !== 0 && (
              <div className={styles.buildingButtons}>
                <div
                  className={classNames(
                    styles.buildingButtonsAdd,
                    styles.extras,
                    this.state.showBuildingExtras
                      ? styles.extrasShow
                      : styles.extrasHide
                  )}
                >
                  <button
                    className={classNames(styles.button, styles.buttonPrimary)}
                    onClick={this.handleToggleBuildingExtras}
                  >
                    <i className="material-icons">add</i>Add
                    <span> Building</span>
                  </button>
                  <div
                    className={classNames(
                      styles.extrasDropdown,
                      styles.extrasDropdownRight
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
                      className={styles.extrasLink}
                      onClick={this.handleClickImportBuilding}
                    >
                      <i className="material-icons">add</i>Import from ENERGY
                      STAR
                    </div>
                    {user &&
                      user.products &&
                      user.products.buildeeNYC === 'access' && (
                        <div
                          className={styles.extrasLink}
                          onClick={this.handleClickOpenXMLBuilding}
                        >
                          <i className="material-icons">add</i>Import
                          BuildingSync File
                        </div>
                      )}
                  </div>
                </div>

                <div
                  onClick={this.handleToggleExtras}
                  className={classNames(
                    styles.buildingButtonsMore,
                    styles.extras,
                    this.state.showExtras
                      ? styles.extrasShow
                      : styles.extrasHide
                  )}
                >
                  <span className={styles.extrasButton} />
                  <div
                    className={classNames(
                      styles.extrasDropdown,
                      styles.extrasDropdownRight
                    )}
                  >
                    <div
                      className={styles.extrasLink}
                      onClick={() => {
                        this.props.handlePopulateBuildingList('archive')
                      }}
                    >
                      <i className="material-icons">archive</i>Archived
                      Buildings
                    </div>
                    <div
                      className={styles.extrasLink}
                      onClick={this.handleClickImportPM}
                    >
                      <i className="material-icons">star</i>Manage Portfolio
                      Manager
                    </div>
                  </div>
                </div>
              </div>
            )}
        </div>

        {this.state.modalView === 'XMLUploadBuilding' && (
          <PortfolioImportXMLModal onClose={this.handleCloseScenarioModal} />
        )}
      </div>
    )
  }
}

export default BuildingListHeader
