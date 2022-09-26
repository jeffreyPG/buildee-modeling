import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import styles from './BuildingList.scss'
import { Loader } from 'utils/Loader'
import {
  parentNodeHasClass,
  formatNumbersWithCommas,
  isProdEnv
} from 'utils/Utils'
import UserFeature from '../../utils/Feature/UserFeature'

export class BuildingList extends React.Component {
  static propTypes = {
    buildingList: PropTypes.array.isRequired,
    deleteBuilding: PropTypes.func.isRequired,
    archiveBuilding: PropTypes.func.isRequired,
    buildingListStatus: PropTypes.string.isRequired,
    push: PropTypes.func.isRequired
  }

  state = {
    items: [],
    sort: {
      key: 'updated',
      direction: 'DESC'
    },
    searchValue: '',
    loadingSearch: false,
    showExtras: '',
    windowWidth: '',
    expandBuildingInfo: '',
    isCreatingBuilding: false
  }

  componentDidMount = () => {
    if (this.props.buildingList && this.props.buildingList.length > 0) {
      this.sortBuildingList(this.props.buildingList).then(buildings => {
        this.setState({ items: buildings })
      })
    }
    document.addEventListener('mousedown', this.handleClick, false)
    window.addEventListener('resize', this.handleUpdateDimensions)
  }

  componentWillUnmount = () => {
    this.setState({ showExtras: '', expandBuildingInfo: '' })
    document.removeEventListener('mousedown', this.handleClick, false)
    window.removeEventListener('resize', this.handleUpdateDimensions)
  }

  UNSAFE_componentWillReceiveProps = nextProps => {
    if (this.props.buildingList !== nextProps.buildingList) {
      this.sortBuildingList(nextProps.buildingList).then(buildings => {
        this.setState({ items: buildings })
      })
    }
  }

  handleClick = e => {
    if (parentNodeHasClass(e.target, 'extrasClick')) {
      return
    }
    // otherwise, toggle (close) the extras dropdown
    this.setState({ showExtras: '', expandBuildingInfo: '' })
  }

  handleUpdateDimensions = () => {
    this.setState({ windowWidth: window.innerWidth })
  }

  handleMobileBuildingInfo = buildingId => {
    if (this.state.windowWidth <= 699) {
      // toggle off
      if (buildingId === this.state.expandBuildingInfo) {
        this.setState({ expandBuildingInfo: '' })
        return
      }
      this.setState({ expandBuildingInfo: buildingId })
    }
  }

  sortBuildingList = buildings => {
    return new Promise(resolve => {
      buildings = buildings.sort(function(a, b) {
        return a.info.updated > b.info.updated
          ? -1
          : b.info.updated > a.info.updated
          ? 1
          : 0
      })

      resolve(buildings)
    })
  }

  handleFilter = searchBy => {
    let updatedList = this.props.buildingList.filter(function(item) {
      if (item) {
        return (
          JSON.stringify(item)
            .toLowerCase()
            .indexOf(searchBy.toString().toLowerCase()) > -1
        )
      }
    })
    this.setState({ items: updatedList, loadingSearch: false })
  }

  handleClickSort = key => {
    let tempSort = { ...this.state.sort }

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

    let buildings = [...this.state.items]

    if (tempSort.direction === 'ASC') {
      buildings = buildings.sort(function(a, b) {
        if (key === 'buildingName' || key === 'buildingUse') {
          return a.info[key].toLowerCase() < b.info[key].toLowerCase()
            ? -1
            : b.info[key].toLowerCase() < a.info[key].toLowerCase()
            ? 1
            : 0
        } else if (key === 'squareFeet') {
          return a.info[key] > b.info[key]
            ? -1
            : b.info[key] > a.info[key]
            ? 1
            : 0
        } else if (key === 'updated') {
          return a.info[key].toLowerCase() > b.info[key].toLowerCase()
            ? -1
            : b.info[key].toLowerCase() > a.info[key].toLowerCase()
            ? 1
            : 0
        } else if (key === 'score') {
          let aScore = a.benchmark.portfolioManager
            ? a.benchmark.portfolioManager * 0.01
            : a.benchmark.general.quantile
            ? a.benchmark.general.quantile
            : 0
          let bScore = b.benchmark.portfolioManager
            ? b.benchmark.portfolioManager * 0.01
            : b.benchmark.general.quantile
            ? b.benchmark.general.quantile
            : 0
          return aScore > bScore ? -1 : bScore > aScore ? 1 : 0
        } else if (key === 'projects') {
          const buildingProjectsA =
            a.projectIds && a.projectIds.length > 0
              ? [...new Set(a.projectIds)]
              : []
          const buildingProjectsB =
            b.projectIds && b.projectIds.length > 0
              ? [...new Set(b.projectIds)]
              : []
          return buildingProjectsA.length > buildingProjectsB.length
            ? -1
            : buildingProjectsB.length > buildingProjectsA.length
            ? 1
            : 0
        }
      })
    } else {
      buildings = buildings.sort(function(a, b) {
        if (key === 'buildingName' || key === 'buildingUse') {
          return a.info[key].toLowerCase() > b.info[key].toLowerCase()
            ? -1
            : b.info[key].toLowerCase() > a.info[key].toLowerCase()
            ? 1
            : 0
        } else if (key === 'squareFeet') {
          return a.info[key] < b.info[key]
            ? -1
            : b.info[key] < a.info[key]
            ? 1
            : 0
        } else if (key === 'updated') {
          return a.info[key].toLowerCase() < b.info[key].toLowerCase()
            ? -1
            : b.info[key].toLowerCase() < a.info[key].toLowerCase()
            ? 1
            : 0
        } else if (key === 'score') {
          let aScore = a.benchmark.portfolioManager
            ? a.benchmark.portfolioManager * 0.01
            : a.benchmark.general.quantile
            ? a.benchmark.general.quantile
            : 0
          let bScore = b.benchmark.portfolioManager
            ? b.benchmark.portfolioManager * 0.01
            : b.benchmark.general.quantile
            ? b.benchmark.general.quantile
            : 0
          return aScore < bScore ? -1 : bScore < aScore ? 1 : 0
        } else if (key === 'projects') {
          const buildingProjectsA =
            a.projectIds && a.projectIds.length > 0
              ? [...new Set(a.projectIds)]
              : []
          const buildingProjectsB =
            b.projectIds && b.projectIds.length > 0
              ? [...new Set(b.projectIds)]
              : []
          return buildingProjectsA.length < buildingProjectsB.length
            ? -1
            : buildingProjectsB.length < buildingProjectsA.length
            ? 1
            : 0
        }
      })
    }
    this.setState({ items: buildings, sort: tempSort })
  }

  filterList = event => {
    let searchBy = event.target.value || event.target.id || ''
    let updatedList = this.props.buildingList
    this.setState({ searchValue: searchBy, loadingSearch: true })

    if (searchBy) {
      this.handleFilter(searchBy)
    } else {
      this.setState({ items: updatedList, loadingSearch: false })
    }
  }

  handleClickOpenBuilding = (id, tabName) => {
    this.props.updateBuildingTab({ name: tabName }).then(() => {
      this.props.updateBuildingViewMode().then(() => {
        this.props.push('/building/' + id + '/' + tabName.toLowerCase())
      })
    })
  }

  handleToggleShowConfirmation = index => {
    let tempObj = [...this.state.items]
    tempObj.map(obj => {
      obj.showDeleteConfirmation = false
    })
    tempObj[index].showDeleteConfirmation = true
    this.setState({ items: tempObj })
  }

  handleToggleHideConfirmation = index => {
    let tempObj = [...this.state.items]
    tempObj[index].showDeleteConfirmation = false
    this.setState({ items: tempObj })
  }

  handleToggleExtras = index => {
    // toggle off
    if (index === this.state.showExtras) {
      this.setState({ showExtras: '' })
      return
    }
    this.setState({ showExtras: index })
  }

  handleDeleteBuilding = id =>
    this.props
      .deleteBuilding(id)
      .then(() => {})
      .catch(err => {})

  handleClickArchiveBuilding = (buildingId, bool) => {
    this.props
      .archiveBuilding(buildingId, { archived: bool })
      .then(() => {})
      .catch(err => {})
  }

  handleClickAddBuilding = event => {
    this.props.push('/building/new')
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

  render() {
    const { buildingListStatus, buildingList } = this.props
    let checkItems =
      buildingList.filter(building => {
        if (buildingListStatus === 'buildings') return !building.archived
        else return building.archived
      }) || []

    return (
      <div className={styles.buildingList}>
        {checkItems.length !== 0 && (
          <div className={styles.buildingListSearch}>
            <div className={styles.buildingListSearchInput}>
              <input
                type="search"
                value={this.state.searchValue}
                placeholder="Search for keywords"
                onChange={this.filterList}
              />
              <i className="material-icons">search</i>
              {this.state.loadingSearch && <Loader size="button" />}
            </div>
          </div>
        )}

        {buildingListStatus === 'buildings' && checkItems.length !== 0 && (
          <div className={styles.table}>
            <div
              className={classNames(
                styles.tableHeader,
                this.state.sort.direction === 'ASC'
                  ? styles.tableHeaderSortASC
                  : styles.tableHeaderSortDESC
              )}
            >
              <div
                className={classNames(
                  styles.tableRowItem,
                  styles.tableRowItem_4
                )}
                onClick={() => this.handleClickSort('buildingName')}
              >
                Name&nbsp;
                {this.state.sort.key === 'buildingName' ? (
                  <i className="material-icons">arrow_downward</i>
                ) : (
                  ''
                )}
              </div>

              <div
                className={styles.tableRowItem}
                onClick={() => this.handleClickSort('buildingUse')}
              >
                Use Type&nbsp;
                {this.state.sort.key === 'buildingUse' ? (
                  <i className="material-icons">arrow_downward</i>
                ) : (
                  ''
                )}
              </div>

              <div
                className={styles.tableRowItem}
                onClick={() => this.handleClickSort('squareFeet')}
              >
                Square Feet&nbsp;
                {this.state.sort.key === 'squareFeet' ? (
                  <i className="material-icons">arrow_downward</i>
                ) : (
                  ''
                )}
              </div>
              {/*
              <div
                className={styles.tableRowItem}
                onClick={() => this.handleClickSort('score')}
              >
                Energy Star&nbsp;
                {this.state.sort.key === 'score' ? (
                  <i className="material-icons">arrow_downward</i>
                ) : (
                  ''
                )}
              </div> */}
              <div
                className={styles.tableRowItem}
                onClick={() => this.handleClickSort('projects')}
              >
                Measures&nbsp;
                {this.state.sort.key === 'projects' ? (
                  <i className="material-icons">arrow_downward</i>
                ) : (
                  ''
                )}
              </div>
              <div
                className={styles.tableRowItem}
                onClick={() => this.handleClickSort('updated')}
              >
                Updated&nbsp;
                {this.state.sort.key === 'updated' ? (
                  <i className="material-icons">arrow_downward</i>
                ) : (
                  ''
                )}
              </div>
              <div className={styles.tableRowItem} />
            </div>

            {this.state.items.map((building, index) => {
              var date = building.info.updated || building.info.created
              var formatedDate = new Date(date).toLocaleDateString('en-US')
              const buildingProjects =
                building.projectIds && building.projectIds.length > 0
                  ? [...new Set(building.projectIds)]
                  : '-'
              const useType = building.info.buildingUse
                ? building.info.buildingUse[0].toUpperCase() +
                  building.info.buildingUse.substring(
                    1,
                    building.info.buildingUse.length
                  )
                : null
              const squareFeet = building.info.squareFeet
                ? formatNumbersWithCommas(building.info.squareFeet)
                : null

              if (!building.archived) {
                return (
                  <div
                    key={building._id}
                    className={classNames(
                      styles.tableRow,
                      this.state.expandBuildingInfo === building._id
                        ? styles.tableMobileRowActive
                        : ''
                    )}
                  >
                    <div
                      className={classNames(
                        styles.tableRowItem,
                        styles.tableRowItem_4,
                        styles.buildingListContent
                      )}
                      data-header="Building Name"
                    >
                      <UserFeature name="buildingOverview">
                        {({ enabled }) => {
                          return (
                            <div
                              className={styles.buildingListImage}
                              onClick={() =>
                                this.handleClickOpenBuilding(
                                  building._id,
                                  enabled ? 'Overview' : 'Property'
                                )
                              }
                            >
                              {building.info.buildingImage ? (
                                <img src={building.info.buildingImage} />
                              ) : (
                                <span>
                                  <i className="material-icons">domain</i>
                                </span>
                              )}
                            </div>
                          )
                        }}
                      </UserFeature>
                      <div className={styles.buildingListInfo}>
                        <UserFeature name="buildingOverview">
                          {({ enabled }) => {
                            return (
                              <div
                                className={styles.buildingListName}
                                onClick={() =>
                                  this.handleClickOpenBuilding(
                                    building._id,
                                    enabled ? 'Overview' : 'Property'
                                  )
                                }
                                data-test="building-name"
                              >
                                <span>{building.info.buildingName}</span>
                                <span>{building.info.buildingAddress}</span>
                              </div>
                            )
                          }}
                        </UserFeature>
                        {(building.clientName ||
                          building.siteName ||
                          (building.tags && building.tags.length > 0)) && (
                          <div
                            className={classNames(
                              styles.tags,
                              styles.tableMobileHide
                            )}
                          >
                            {building.clientName && (
                              <div
                                onClick={this.filterList}
                                className={styles.tag}
                              >
                                <span>
                                  <small id={building.clientName}>
                                    {building.clientName}
                                  </small>
                                </span>
                              </div>
                            )}
                            {building.siteName && (
                              <div
                                onClick={this.filterList}
                                className={styles.tag}
                              >
                                <span>
                                  <small id={building.siteName}>
                                    {building.siteName}
                                  </small>
                                </span>
                              </div>
                            )}
                            {building.tags.length > 0
                              ? building.tags.map((tag, index) => {
                                  return (
                                    <div
                                      key={index}
                                      onClick={this.filterList}
                                      className={styles.tag}
                                    >
                                      <span>
                                        <small id={tag}>{tag}</small>
                                      </span>
                                    </div>
                                  )
                                })
                              : null}
                          </div>
                        )}
                      </div>
                      <div
                        className={classNames(
                          styles.tableMobileOpenInfo,
                          styles.tableMobileShow
                        )}
                        onClick={() =>
                          this.handleMobileBuildingInfo(building._id)
                        }
                      >
                        <i className="material-icons">expand_more</i>
                      </div>
                    </div>
                    <div
                      className={classNames(
                        styles.tableRowItem,
                        styles.tableMobileBoxTop,
                        styles.tableMobileRowItem,
                        this.state.expandBuildingInfo === building._id
                          ? styles.tableMobileRowItemActive
                          : ''
                      )}
                      data-header="Use Type"
                    >
                      <label className={styles.tableMobileShow}>Use Type</label>
                      {building.info.buildingUse ? useType : '-'}
                    </div>
                    <div
                      className={classNames(
                        styles.tableRowItem,
                        styles.tableMobileBoxTop,
                        styles.tableMobileRowItem,
                        this.state.expandBuildingInfo === building._id
                          ? styles.tableMobileRowItemActive
                          : ''
                      )}
                      data-header="Square Feet"
                    >
                      <label className={styles.tableMobileShow}>
                        Square Feet
                      </label>
                      {building.info.squareFeet
                        ? `${squareFeet} ft${'\u00B2'}`
                        : '-'}
                    </div>
                    {/* <div
                      className={classNames(
                        styles.tableRowItem,
                        styles.tableMobileBoxTop,
                        styles.tableMobileRowItem,
                        this.state.expandBuildingInfo === building._id
                          ? styles.tableMobileRowItemActive
                          : ''
                      )}
                      data-header="Score"
                    >
                      <label className={styles.tableMobileShow}>
                        Energy Star
                      </label>
                      {building.benchmark.portfolioManager
                        ? building.benchmark.portfolioManager
                        : building.info.energystarIds &&
                          building.info.energystarIds.length > 0
                        ? 'N/A'
                        : '-'}
                    </div> */}
                    <div
                      className={classNames(
                        styles.tableRowItem,
                        styles.tableMobileBoxMiddle,
                        styles.tableMobileRowItem,
                        this.state.expandBuildingInfo === building._id
                          ? styles.tableMobileRowItemActive
                          : ''
                      )}
                      data-header="Projects"
                    >
                      <label className={styles.tableMobileShow}>Projects</label>
                      {buildingProjects.constructor === Array &&
                      buildingProjects.length > 0
                        ? buildingProjects.length
                        : '-'}
                    </div>
                    <div
                      className={classNames(
                        styles.tableRowItem,
                        styles.tableMobileBoxMiddle,
                        styles.tableMobileRowItem,
                        this.state.expandBuildingInfo === building._id
                          ? styles.tableMobileRowItemActive
                          : ''
                      )}
                      data-header="Updated"
                    >
                      <label className={styles.tableMobileShow}>
                        Last Updated
                      </label>
                      {formatedDate}
                    </div>
                    <div
                      className={classNames(
                        styles.tableRowItem,
                        styles.tableMobileBoxBottom,
                        styles.tableMobileShow,
                        styles.tableMobileRowItem,
                        this.state.expandBuildingInfo === building._id
                          ? styles.tableMobileRowItemActive
                          : ''
                      )}
                    >
                      <label className={styles.tableMobileShow}>Tags</label>
                      {(building.clientName ||
                        building.siteName ||
                        (building.tags && building.tags.length > 0)) && (
                        <div className={styles.tags}>
                          {building.clientName && (
                            <div
                              onClick={this.filterList}
                              className={styles.tag}
                            >
                              <span>
                                <small id={building.clientName}>
                                  {building.clientName}
                                </small>
                              </span>
                            </div>
                          )}
                          {building.siteName && (
                            <div
                              onClick={this.filterList}
                              className={styles.tag}
                            >
                              <span>
                                <small id={building.siteName}>
                                  {building.siteName}
                                </small>
                              </span>
                            </div>
                          )}
                          {building.tags.length > 0
                            ? building.tags.map((tag, index) => {
                                return (
                                  <div
                                    key={index}
                                    onClick={this.filterList}
                                    className={styles.tag}
                                  >
                                    <span>
                                      <small id={tag}>{tag}</small>
                                    </span>
                                  </div>
                                )
                              })
                            : null}
                        </div>
                      )}
                    </div>
                    <div
                      className={classNames(
                        styles.tableRowItem,
                        'extrasClick',
                        styles.tableMobileRowItem,
                        styles.tableMobileRowItem,
                        this.state.expandBuildingInfo === building._id
                          ? styles.tableMobileRowItemActive
                          : ''
                      )}
                      data-header="More"
                    >
                      <div
                        className={classNames(
                          styles.tableMobileShow,
                          styles.tableMobileRowItem_5
                        )}
                      >
                        <UserFeature name="buildingOverview">
                          {({ enabled }) => {
                            return (
                              <button
                                className={classNames(
                                  styles.button,
                                  styles.buttonPrimary
                                )}
                                onClick={() =>
                                  this.handleClickOpenBuilding(
                                    building._id,
                                    enabled ? 'Overview' : 'Property'
                                  )
                                }
                              >
                                View Building
                              </button>
                            )
                          }}
                        </UserFeature>
                      </div>
                      <div
                        onClick={() => this.handleToggleExtras(index)}
                        className={classNames(
                          styles.extras,
                          this.state.showExtras === index
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
                            onClick={() =>
                              this.handleClickArchiveBuilding(
                                building._id,
                                true
                              )
                            }
                          >
                            <i className="material-icons">archive</i>Archive
                            Building
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              }
            })}

            {this.state.items.length === 0 && this.state.searchValue !== '' && (
              <div className={styles.tableRow}>
                <div className={styles.tableRowItem}>
                  Sorry, we didn't find any buildings matching your search. Try
                  another term.
                </div>
              </div>
            )}
          </div>
        )}

        {buildingListStatus === 'buildings' && checkItems.length === 0 && (
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
        )}

        {buildingListStatus === 'archive' && checkItems.length !== 0 && (
          <div className={styles.buildingListArchives}>
            <div className={styles.table}>
              <div className={styles.tableHeader}>
                <div className={styles.tableRowItem}>Building Name</div>
                <div
                  className={classNames(
                    styles.tableRowItem,
                    styles.buildingListArchive
                  )}
                >
                  <span>Restore</span>
                </div>
                {/* <div className={styles.tableRowItem}>Delete</div> */}
              </div>
              {this.state.items.map((building, index) => {
                if (building.archived) {
                  return (
                    <div key={building._id} className={styles.tableRow}>
                      <UserFeature name="buildingOverview">
                        {({ enabled }) => {
                          return (
                            <div
                              onClick={() =>
                                this.handleClickOpenBuilding(
                                  building._id,
                                  enabled ? 'Overview' : 'Property'
                                )
                              }
                              className={styles.tableRowItem}
                            >
                              {building.info.buildingName}
                            </div>
                          )
                        }}
                      </UserFeature>

                      <div
                        className={classNames(
                          styles.tableRowItem,
                          styles.buildingListArchive
                        )}
                      >
                        <span>
                          <i
                            className="material-icons"
                            onClick={() =>
                              this.handleClickArchiveBuilding(
                                building._id,
                                false
                              )
                            }
                          >
                            undo
                          </i>
                        </span>
                      </div>
                      {/* <div className={styles.tableRowItem}>
                        {!this.state.items[index].showDeleteConfirmation && (
                          <i
                            onClick={() =>
                              this.handleToggleShowConfirmation(index)
                            }
                            className="material-icons"
                          >
                            delete
                          </i>
                        )}
                        {this.state.items[index].showDeleteConfirmation && (
                          <div className={styles['delete-option']}>
                            <span>Are you sure?</span>
                            <button
                              className={classNames(
                                styles.button,
                                styles.buttonError
                              )}
                              onClick={() =>
                                this.handleDeleteBuilding(building._id)
                              }
                            >
                              Delete
                            </button>
                            <button
                              className={classNames(
                                styles.button,
                                styles.buttonPrimary
                              )}
                              onClick={() =>
                                this.handleToggleHideConfirmation(index)
                              }
                            >
                              Cancel
                            </button>
                          </div>
                        )}
                      </div> */}
                    </div>
                  )
                }
              })}
            </div>
          </div>
        )}

        {buildingListStatus === 'archive' && checkItems.length === 0 && (
          <div className={styles.empty}>
            <div className={styles.emptyBody}>
              <div className={styles.emptyBodyTitle}>No buildings archived</div>
              <div className={styles.emptyBodyDescription}>
                When a building is archived it will appear here.
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }
}

export default BuildingList
