import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router'
import styles from './Portfolio.scss'
import classNames from 'classnames'
import { Loader } from 'utils/Loader'
import PMlogo from '../../images/PM_logo.png'

import {
  ManageAccounts,
  PortfolioAccounts,
  PortfolioImport,
  PortfolioExport,
  PortfolioHistory
} from './'
import { getOrganizationBuildings } from '../../routes/Organization/modules/organization'

export class Portfolio extends React.Component {
  static propTypes = {
    connectedAccounts: PropTypes.array.isRequired,
    building: PropTypes.object.isRequired,
    push: PropTypes.func.isRequired,
    portfolioAddAccount: PropTypes.func.isRequired,
    getConnectedAccounts: PropTypes.func.isRequired,
    pmImport: PropTypes.func.isRequired,
    pmExportUpdate: PropTypes.func.isRequired,
    getPortfolioPropertyList: PropTypes.func.isRequired,
    getPortfolioMeterList: PropTypes.func.isRequired,
    getPortfolioMeter: PropTypes.func.isRequired,
    deletePortfolioConnection: PropTypes.func.isRequired,
    pmImportUpdate: PropTypes.func.isRequired,
    organizationView: PropTypes.object.isRequired,
    pmExport: PropTypes.func.isRequired,
    linkToBuildeeBuilding: PropTypes.func.isRequired,
    getOrganizationBuildings: PropTypes.func.isRequired,
    manageAllOrgSelected: PropTypes.bool.isRequired
  }

  state = {
    addingAccount: false,
    toggleActive: false,
    toggleIndex: undefined,
    propertiesList: [],
    showExtras: false,
    extrasIndex: 0,
    loading: false,
    loadingIndexes: [],
    estimatedTime: 0,
    selectedTab: 'accounts',
    buildeeBuildings: [],
    returnBuildingDetails: []
  }

  componentWillUnmount = () => {
    this.setState({
      showExtras: false,
      extrasIndex: ''
    })
  }

  componentDidMount = () => {
    const { routeParams, manageAllOrgSelected } = this.props
    const { target } = routeParams
    if (target === 'connect') {
      this.handleConnectNewAccount()
    }
    this.props.getConnectedAccounts()
    if (!manageAllOrgSelected) {
      // Just in case the user doesn't come from the building page
      this.props.getOrganizationBuildings(this.props.organizationView._id)
    } else {
      this.setState({ selectedTab: null })
    }
    let filteredList = this.props.building.buildingList.filter(
      building => !building.archived
    )
    this.setState({ buildeeBuildings: filteredList })
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (this.props.building.buildingList !== nextProps.building.buildingList) {
      let filteredList = nextProps.building.buildingList.filter(
        building => !building.archived
      )
      this.setState({ buildeeBuildings: filteredList })
    }
  }

  goToBuilding = buildingId => {
    this.props.push('/building/' + buildingId)
  }

  toggleBuildings = (index, runProperties) => {
    // dont toggle buildings if loading
    if (this.state.loading) {
      return
    }

    runProperties = runProperties || false

    if (index !== this.state.toggleIndex || runProperties) {
      this.setState({
        loading: true,
        toggleActive: true,
        toggleIndex: index,
        propertiesList: []
      })

      this.props
        .getPortfolioPropertyList(this.props.connectedAccounts[index].accountId)
        .then(properties => {
          this.setState({ propertiesList: properties, loading: false })
        })
    } else {
      this.setState(prevState => ({
        toggleActive: !prevState.toggleActive
      }))
    }
  }

  createPayload = (buildings, accountId, accountUsername) => {
    let tempPropertiesList = [...this.state.propertiesList]
    let payload = []
    let indexes = []

    return new Promise((resolve, reject) => {
      var buildingPromise = buildings.forEach(building => {
        let buildingObj = {
          index: tempPropertiesList.findIndex(i => i.id === building.id),
          username: accountUsername,
          accountId: accountId,
          id: building.id
        }

        if (building.buildingId) {
          buildingObj.buildingId = building.buildingId
        }
        indexes.push(tempPropertiesList.findIndex(i => i.id === building.id))
        payload.push(buildingObj)
      })

      Promise.all([buildingPromise]).then(() => {
        this.setState({ loadingIndexes: indexes, loading: true })
        resolve(payload)
      })
    })
  }

  pmExport = (pmAccount, property, accountUsername) => {
    let tempBuildeeBuildings = [...this.state.buildeeBuildings]
    let newBuildings
    let totalBuildings = [{}]

    if (property) {
      newBuildings = [property]
    } else {
      totalBuildings = tempBuildeeBuildings.filter(
        property => !property.info.energystarIds.length > 0
      )
    }

    this.setState({ loading: true, estimatedTime: totalBuildings.length * 8.5 })

    this.props
      .pmExport(pmAccount, newBuildings, accountUsername)
      .then(newBuildingDetails => {
        this.setState({
          returnBuildingDetails: newBuildingDetails,
          loading: false
        })
      })
      .catch(() => {
        this.setState({
          returnBuildingDetails: [],
          loading: false,
          estimatedTime: 0,
          loadingIndexes: []
        })
      })
  }

  pmExportUpdate = (pmAccount, property, accountUsername) => {
    let tempBuildeeBuildings = [...this.state.buildeeBuildings]
    let syncBuildings
    let totalBuildings = [{}]

    if (property) {
      syncBuildings = [property]
    } else {
      totalBuildings = tempBuildeeBuildings.filter(
        property => property.info.energystarIds.length > 0
      )
    }

    this.setState({ loading: true, estimatedTime: totalBuildings.length * 8.5 })
    this.props
      .pmExportUpdate(pmAccount, syncBuildings, accountUsername)
      .then(newBuildingDetails => {
        this.setState({
          returnBuildingDetails: newBuildingDetails,
          loading: false
        })
      })
      .catch(() => {
        this.setState({
          returnBuildingDetails: [],
          loading: false,
          estimatedTime: 0,
          loadingIndexes: []
        })
      })
  }

  pmImport = (accountId, building, accountUsername) => {
    let tempPropertiesList = [...this.state.propertiesList]

    let newBuildings

    if (building) {
      newBuildings = [building]
    } else {
      newBuildings = tempPropertiesList.filter(property => !property.sync)
    }

    if (newBuildings.length > 0) {
      this.setState({ estimatedTime: newBuildings.length * 8.5 })
    }

    this.createPayload(newBuildings, accountId, accountUsername).then(
      payload => {
        this.props
          .pmImport(payload)
          .then(newBuildingDetails => {
            this.setState({
              returnBuildingDetails: newBuildingDetails,
              loading: false,
              estimatedTime: 0,
              loadingIndexes: []
            })
          })
          .catch(() => {
            this.setState({
              loading: false,
              estimatedTime: 0,
              loadingIndexes: []
            })
          })
      }
    )
  }

  pmImportUpdate = (accountId, building, accountUsername) => {
    let tempPropertiesList = [...this.state.propertiesList]
    let syncBuildings

    if (building) {
      syncBuildings = [building]
    } else {
      syncBuildings = tempPropertiesList.filter(property => property.sync)
    }

    if (syncBuildings && syncBuildings.length > 0) {
      this.setState({
        estimatedTime: syncBuildings.length * 8.5,
        loading: true
      })
    } else {
      this.setState({ loading: true })
    }

    this.createPayload(syncBuildings, accountId, accountUsername).then(
      payload => {
        this.props
          .pmImportUpdate(payload)
          .then(returnBuildingDetails => {
            this.setState({
              returnBuildingDetails,
              loading: false,
              estimatedTime: 0,
              loadingIndexes: []
            })
          })
          .catch(() => {
            this.setState({
              returnBuildingDetails: [],
              loading: false,
              estimatedTime: 0,
              loadingIndexes: []
            })
          })
      }
    )
  }

  handleTabChange = tab => {
    if (tab !== this.state.selectedTab) {
      this.setState({ selectedTab: tab, returnBuildingDetails: [] })
    }
  }

  handleConnectNewAccount = () => {
    this.setState(prevState => ({
      addingAccount: !prevState.addingAccount,
      toggleIndex: null,
      extrasIndex: null
    }))
  }

  deleteConnection = index => {
    this.props.deletePortfolioConnection(
      this.props.connectedAccounts[index]._id
    )
  }

  render() {
    const { manageAllOrgSelected } = this.props
    return (
      <div className={styles.portfolio}>
        <div className={styles.container}>
          <div className={styles.portfolioHeading}>
            <h2>Portfolio Manager</h2>
          </div>

          <div className={styles.portfolioWrap}>
            <div
              className={classNames(
                styles.panel,
                styles.panelContent,
                styles.portfolioSidebar
              )}
            >
              <img src={PMlogo} />
            </div>

            <div
              className={classNames(
                styles.panel,
                styles.portfolioMain,
                manageAllOrgSelected && styles.portfolioMainCenter
              )}
            >
              {manageAllOrgSelected && (
                <span className={styles.portfolioDisabledMsg}>
                  Managing Energy Star Portfolio Manager connnections and
                  syncing is not available when the organization is set to "View
                  All"
                </span>
              )}
              {!manageAllOrgSelected && (
                <div className={styles.tabs}>
                  <div
                    className={classNames(
                      styles.tab,
                      this.state.selectedTab === 'accounts'
                        ? styles.tabActive
                        : ''
                    )}
                    onClick={() => {
                      this.handleTabChange('accounts')
                    }}
                  >
                    <p>Accounts</p>
                  </div>
                  <div
                    className={classNames(
                      styles.tab,
                      this.state.selectedTab === 'import'
                        ? styles.tabActive
                        : '',
                      this.state.addingAccount ? styles.disable : ''
                    )}
                    onClick={() => {
                      if (!this.state.addingAccount)
                        this.handleTabChange('import')
                    }}
                  >
                    <p>Import</p>
                  </div>
                  <div
                    className={classNames(
                      styles.tab,
                      this.state.selectedTab === 'export'
                        ? styles.tabActive
                        : '',
                      this.state.addingAccount ? styles.disable : ''
                    )}
                    onClick={() => {
                      if (!this.state.addingAccount)
                        this.handleTabChange('export')
                    }}
                  >
                    <p>Export</p>
                  </div>
                  <div
                    className={classNames(
                      styles.tab,
                      this.state.selectedTab === 'history'
                        ? styles.tabActive
                        : '',
                      this.state.addingAccount ? styles.disable : ''
                    )}
                    onClick={() => {
                      if (!this.state.addingAccount)
                        this.handleTabChange('history')
                    }}
                  >
                    <p>History</p>
                  </div>
                </div>
              )}

              {this.state.selectedTab === 'accounts' && (
                <PortfolioAccounts
                  addingAccount={this.state.addingAccount}
                  handleConnectNewAccount={this.handleConnectNewAccount}
                  connectedAccounts={this.props.connectedAccounts}
                  push={this.props.push}
                  portfolioAddAccount={this.props.portfolioAddAccount}
                  deleteConnection={this.deleteConnection}
                />
              )}

              {this.state.selectedTab === 'import' && (
                <PortfolioImport
                  buildingList={this.state.buildeeBuildings}
                  returnBuildingDetails={this.state.returnBuildingDetails}
                  connectedAccounts={this.props.connectedAccounts}
                  toggleActive={this.state.toggleActive}
                  toggleIndex={this.state.toggleIndex}
                  propertiesList={this.state.propertiesList}
                  estimatedTime={this.state.estimatedTime}
                  loading={this.state.loading}
                  loadingIndexes={this.state.loadingIndexes}
                  toggleBuildings={this.toggleBuildings}
                  pmImport={this.pmImport}
                  pmImportUpdate={this.pmImportUpdate}
                  goToBuilding={this.goToBuilding}
                  linkToBuildeeBuilding={this.props.linkToBuildeeBuilding}
                />
              )}

              {this.state.selectedTab === 'export' && (
                <PortfolioExport
                  buildingList={this.state.buildeeBuildings}
                  returnBuildingDetails={this.state.returnBuildingDetails}
                  connectedAccounts={this.props.connectedAccounts}
                  goToBuilding={this.goToBuilding}
                  estimatedTime={this.state.estimatedTime}
                  loading={this.state.loading}
                  pmExport={this.pmExport}
                  pmExportUpdate={this.pmExportUpdate}
                />
              )}

              {this.state.selectedTab === 'history' && (
                <PortfolioHistory
                  organizationView={this.props.organizationView}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default Portfolio
