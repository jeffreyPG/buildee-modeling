import React from 'react'
import { Mutation, Query, withApollo } from 'react-apollo'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import styles from './AssetView.scss'
import NavBar from '../../components/UI/NavBar'
import EquipmentList from '../Equipment/EquipmentList'
import LocationList from '../Location/LocationList'
import ConstructionTab from '../Construction/ConstructionTab'
import SystemsTab from '../Systems/SystemsTab'
import LocationBulkForm from '../../containers/Form/LocationForms/LocationBulkForm'
import ToggleButtonGroup from './ToggleButtonGroup/ToggleButtonGroup'
import { GET_BUILDING_EQUIPMENT_LIST } from '../../utils/graphql/queries/equipment'
import { GET_BUILDING_LOCATIONS } from '../../utils/graphql/queries/location'
import { GET_SYSTEMS } from '../../utils/graphql/queries/systems.js'
import { GET_BUILDING_CONSTRUCTIONS } from '../../utils/graphql/queries/construction.js'
import { ENABLED_FEATURES } from '../../utils/graphql/queries/user'

const displayOptions = [
  {
    value: 'table',
    icon: 'table_view'
  },
  {
    value: 'gallery',
    icon: 'collections'
  }
]

export class AssetView extends React.Component {
  static propTypes = {
    user: PropTypes.object.isRequired,
    building: PropTypes.object.isRequired,
    getEquipment: PropTypes.func.isRequired,
    getBuildingEquipment: PropTypes.func.isRequired,
    getPublicAssets: PropTypes.func.isRequired,
    organization: PropTypes.object.isRequired,

    // Projects Props
    uploadProjectImage: PropTypes.func.isRequired,
    evaluateProject: PropTypes.func.isRequired,
    createOrganizationProject: PropTypes.func.isRequired,
    editOrganizationProject: PropTypes.func.isRequired,
    addIncompleteProject: PropTypes.func.isRequired,
    getProjectsAndMeasures: PropTypes.func.isRequired,
    getUserById: PropTypes.func.isRequired,
    getOrganizationName: PropTypes.func.isRequired,
    getOrganizationProjects: PropTypes.func.isRequired,
    deleteOrganizationProject: PropTypes.func.isRequired,
    bulkAddProjects: PropTypes.func.isRequired
  }

  state = {
    modalOpen: false,
    modalView: null,
    selectedView: 'Equipment',
    showBulkExtras: '',
    viewOption: displayOptions[0].value
  }

  componentDidMount = () => {
    this.getBuildingEquipment()
    if (this.props.building && !this.props.building.measures) {
      this.props.getProjectsAndMeasures(this.props.building._id)
    }
  }

  componentDidUpdate = prevProps => {
    if (this.props.building !== prevProps.building) {
      this.getBuildingEquipment()
    }
  }

  getBuildingEquipment = () => {
    this.props.getBuildingEquipment().then(buildingEquipment => {
      this.setState({ buildingEquipment: buildingEquipment })
    })
  }

  handleTabChange = name => {
    if (name !== this.state.selectedView) {
      this.setState({
        selectedView: name,
        showExtras: '',
        viewOption: displayOptions[0].value
      })
    }
  }

  editEquipment = equipmentId => {
    this.props.getEquipment(equipmentId).then(equipment => {
      this.setState({ currentAsset: equipment })
      this.openEquipmentModal('equipmentDetails')
    })
  }

  handleOpenAddLocation = modalView => {
    this.setState({ modalOpen: true, modalView })
  }

  handleOpenEquipmentModal = modalView => {
    document.body.classList.add('bodyModalOpen')
    this.setState({ modalOpen: true, modalView })
  }

  handleOpenLocationModal = modalView => {
    document.body.classList.add('bodyModalOpen')
    this.setState({ modalOpen: true, modalView })
  }

  handleOpenConstructionModal = modalView => {
    switch (modalView) {
      case 'viewConstruction':
      case 'addConstruction':
      case 'copyConstruction':
      case 'editConstruction':
        this.setState({ modalOpen: true, modalView })
        break
    }
  }

  handleOpenSystemModal = modalView => {
    switch (modalView) {
      case 'viewSystem':
      case 'addSystem':
      case 'editSystem':
        this.setState({ modalOpen: true, modalView })
        break
    }
  }

  handleOpenDeleteConfirmationModal = modalView => {
    document.body.classList.add('bodyModalOpen')
    this.setState({ modalOpen: true, modalView })
  }

  handleCloseModal = () => {
    document.body.classList.remove('bodyModalOpen')
    this.setState({ modalOpen: false, modalView: null })
  }

  toggleExtras = view => {
    // toggle off
    if (view === this.state.showExtras) {
      this.setState({ showExtras: '' })
      return
    }
    this.setState({ showExtras: view })
  }

  toggleBulkExtras = view => {
    // toggle off
    if (view === this.state.showBulkExtras) {
      this.setState({ showBulkExtras: '' })
      return
    }
    this.setState({ showBulkExtras: view })
  }

  openImportCSV = () => {
    console.log('import csv')
  }

  onOptionsToggled = value => {
    this.setState({ viewOption: value })
  }

  render() {
    const { selectedView, viewOption } = this.state
    let buildingId = (this.props.building && this.props.building._id) || ''

    const projectProps = {
      uploadProjectImage: this.props.uploadProjectImage,
      evaluateProject: this.props.evaluateProject,
      createOrganizationProject: this.props.createOrganizationProject,
      editOrganizationProject: this.props.editOrganizationProject,
      addIncompleteProject: this.props.addIncompleteProject,
      getProjectsAndMeasures: this.props.getProjectsAndMeasures,
      getUserById: this.props.getUserById,
      getOrganizationName: this.props.getOrganizationName,
      getOrganizationProjects: this.props.getOrganizationProjects,
      deleteOrganizationProject: this.props.deleteOrganizationProject,
      bulkAddProjects: this.props.bulkAddProjects
    }

    return (
      <Query query={ENABLED_FEATURES}>
        {({ loading, error, data }) => {
          if (loading || !data) return null
          const enabledFeatures = data.enabledFeatures
          if (
            this.state.selectedView === 'Equipment' ||
            this.state.selectedView === 'Locations'
          ) {
            if (
              !enabledFeatures.some(
                feature => feature.name === 'buildingAssets'
              ) &&
              enabledFeatures.some(feature => feature.name === 'buildingSystem')
            ) {
              this.handleTabChange('Systems')
            } else if (
              (this.selectedView === 'Equipment' ||
                this.selectedView === 'Locations') &&
              !enabledFeatures.some(
                feature => feature.name === 'buildingAssets'
              ) &&
              enabledFeatures.some(
                feature => feature.name === 'buildingConstruction'
              )
            ) {
              this.handleTabChange('Systems')
            }
          }

          return (
            <div className={styles.assets}>
              <div className={styles.assetsHeading}>
                <h2>Assets</h2>
                {selectedView === 'Locations' && (
                  <Query
                    query={GET_BUILDING_LOCATIONS}
                    variables={{ id: buildingId }}
                    skip={!buildingId}
                  >
                    {({ loading, error, data, refetch }) => {
                      if (error) return null
                      const { building = {} } = data
                      const locations = building.locations || []
                      if (!locations.length) return null
                      return (
                        <div className={styles.assetsHeadingButtons}>
                          <button
                            className={classNames(
                              styles.button,
                              styles.buttonPrimary
                            )}
                            onClick={() =>
                              this.handleOpenLocationModal('addLocation')
                            }
                          >
                            <i className="material-icons">add</i>New
                            <span />
                          </button>
                          <div
                            onClick={() => this.toggleExtras('location')}
                            className={classNames(
                              styles.extras,
                              this.state.showExtras === 'location'
                                ? styles.extrasShow
                                : styles.extrasHide
                            )}
                            data-test="location-tab-extras"
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
                                  this.toggleBulkExtras('bulkAddLocation')
                                }
                              >
                                <div>
                                  <i className="material-icons">add</i>Bulk Add
                                </div>
                              </div>
                              {/* <div className={styles.extrasLink}>
                      <i className="material-icons">cloud_upload</i>Import CSV
                  </div> */}
                            </div>
                          </div>
                          {this.state.showBulkExtras === 'bulkAddLocation' && (
                            <LocationBulkForm
                              onClose={() => this.toggleBulkExtras('')}
                              building={this.props.building}
                            />
                          )}
                        </div>
                      )
                    }}
                  </Query>
                )}
                {selectedView === 'Equipment' && (
                  <Query
                    skip={!buildingId}
                    query={GET_BUILDING_EQUIPMENT_LIST}
                    variables={{ buildingId }}
                  >
                    {({ loading, error, data = {} }) => {
                      const { buildingEquipment = [] } = data
                      if (!buildingEquipment.length) return null
                      return (
                        <div className={styles.assetsHeadingButtons}>
                          <ToggleButtonGroup
                            onToggle={this.onOptionsToggled}
                            options={displayOptions}
                            selectedOption={viewOption}
                          />
                          <button
                            className={classNames(
                              styles.button,
                              styles.buttonPrimary
                            )}
                            onClick={() =>
                              this.handleOpenEquipmentModal('addEquipment')
                            }
                          >
                            <i className="material-icons">add</i>New
                            <span />
                          </button>
                          {/* {detectMobileTouch() === 'desktop' && (
                  <div
                    onClick={() => this.toggleExtras('equipment')}
                    className={classNames(
                      styles.extras,
                      this.state.showExtras === 'equipment'
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
                        onClick={() => this.openImportCSV()}
                      >
                        <i className="material-icons">cloud_upload</i>Import CSV
                      </div>
                    </div>
                  </div>
                )} */}
                        </div>
                      )
                    }}
                  </Query>
                )}
                {selectedView === 'Construction' && (
                  <Query
                    query={GET_BUILDING_CONSTRUCTIONS}
                    variables={{ id: buildingId }}
                  >
                    {({
                      loading,
                      error,
                      data: { building: { constructions = [] } = {} }
                    }) => {
                      if (loading || constructions.length == 0) return null
                      return (
                        <div className={styles.assetsHeadingButtons}>
                          <ToggleButtonGroup
                            onToggle={this.onOptionsToggled}
                            options={displayOptions}
                            selectedOption={viewOption}
                          />
                          <button
                            className={classNames(
                              styles.button,
                              styles.buttonPrimary
                            )}
                            onClick={() =>
                              this.handleOpenConstructionModal(
                                'addConstruction'
                              )
                            }
                          >
                            <i className="material-icons">add</i>New
                            <span />
                          </button>
                        </div>
                      )
                    }}
                  </Query>
                )}
                {selectedView === 'Systems' && (
                  <Query
                    query={GET_SYSTEMS}
                    variables={{ system: { building: buildingId } }}
                  >
                    {({ loading, error, data: { systems = [] } }) => {
                      if (loading || !systems.length) return null
                      return (
                        <div className={styles.assetsHeadingButtons}>
                          <ToggleButtonGroup
                            onToggle={this.onOptionsToggled}
                            options={displayOptions}
                            selectedOption={viewOption}
                          />
                          <button
                            className={classNames(
                              styles.button,
                              styles.buttonPrimary
                            )}
                            onClick={() =>
                              this.handleOpenSystemModal('addSystem')
                            }
                          >
                            <i className="material-icons">add</i>New
                            <span />
                          </button>
                        </div>
                      )
                    }}
                  </Query>
                )}
              </div>

              <NavBar
                selectedTab={this.state.selectedView}
                tabs={[
                  {
                    name: 'Equipment',
                    featureFlag: 'buildingAssets'
                  },
                  {
                    name: 'Locations',
                    featureFlag: 'buildingAssets'
                  },
                  {
                    name: 'Systems',
                    featureFlag: 'buildingSystem'
                  },
                  {
                    name: 'Construction',
                    featureFlag: 'buildingConstruction'
                  }
                ]}
                onChange={this.handleTabChange}
              />

              {selectedView === 'Equipment' && (
                <EquipmentList
                  building={this.props.building}
                  modalOpen={this.state.modalOpen}
                  modalView={this.state.modalView}
                  onOpenModal={this.handleOpenEquipmentModal}
                  onOpenDeleteConfirmationModal={
                    this.handleOpenDeleteConfirmationModal
                  }
                  onCloseModal={this.handleCloseModal}
                  organization={this.props.organization}
                  user={this.props.user}
                  projectProps={projectProps}
                  selectedView={viewOption}
                />
              )}

              {selectedView === 'Locations' && (
                <LocationList
                  building={this.props.building}
                  modalOpen={this.state.modalOpen}
                  modalView={this.state.modalView}
                  onOpenModal={this.handleOpenLocationModal}
                  onOpenDeleteConfirmationModal={
                    this.handleOpenDeleteConfirmationModal
                  }
                  onCloseModal={this.handleCloseModal}
                  organization={this.props.organization}
                  user={this.props.user}
                />
              )}

              {selectedView === 'Construction' && (
                <ConstructionTab
                  user={this.props.user}
                  building={this.props.building}
                  modalView={this.state.modalView}
                  modalOpen={this.state.modalOpen}
                  onOpenModal={this.handleOpenConstructionModal}
                  onOpenDeleteConfirmationModal={
                    this.handleOpenDeleteConfirmationModal
                  }
                  onCloseModal={this.handleCloseModal}
                  organization={this.props.organization}
                  getPublicAssets={this.props.getPublicAssets}
                  selectedView={viewOption}
                />
              )}

              {selectedView === 'Systems' && (
                <SystemsTab
                  user={this.props.user}
                  building={this.props.building}
                  modalView={this.state.modalView}
                  modalOpen={this.state.modalOpen}
                  onOpenModal={this.handleOpenSystemModal}
                  onOpenDeleteConfirmationModal={
                    this.handleOpenDeleteConfirmationModal
                  }
                  onCloseModal={this.handleCloseModal}
                  organization={this.props.organization}
                  getPublicAssets={this.props.getPublicAssets}
                  selectedView={viewOption}
                />
              )}
            </div>
          )
        }}
      </Query>
    )
  }
}

export default AssetView
