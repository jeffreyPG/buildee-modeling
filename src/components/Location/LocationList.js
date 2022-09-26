import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { Mutation, Query, withApollo } from 'react-apollo'
import SortableList from '../UI/SortableList'
import ListSearch from '../UI/ListSearch'
import styles from './LocationList.scss'
import LocationModal from '../../containers/Modal/LocationModal'
import LocationBulkForm from '../../containers/Form/LocationForms/LocationBulkForm'
import {
  GET_BUILDING_LOCATIONS,
  REMOVE_BUILDING_LOCATION
} from '../../utils/graphql/queries/location'
import useTypeOptions from '../../static/building-types'
import DeleteConfirmationModal from '../../containers/Modal/DeleteConfirmationModal'
import {
  REMOVE_BUILDING_EQUIPMENTS,
  GET_BUILDING_EQUIPMENT_LIST
} from '../../utils/graphql/queries/equipment'
import moment from 'moment'
import { uniqBy } from 'lodash'

const getEquipmentMatchingCategory = ({ equipment, category }) => {
  if (!equipment) return []
  const equipmentList = uniqBy(equipment, item => item._id)
  return equipmentList.filter(equipment => {
    return (
      equipment &&
      equipment.libraryEquipment &&
      equipment.libraryEquipment.category === category
    )
  })
}

const formatLocationData = (locations = []) => {
  const filteredLocations = locations.reduce((agg, item) => {
    if (!item.location) return agg
    if (agg[item.location._id]) {
      const existingItem = { ...agg[item.location._id] }
      existingItem.equipment =
        existingItem &&
        existingItem.equipment &&
        existingItem.equipment.concat(item.equipment)
      agg[item.location._id] = existingItem
    } else {
      agg[item.location._id] = item
    }
    return agg
  }, {})
  return Object.values(filteredLocations)
}

const getAllEquipmentMatchingCategory = ({ buildingLocations, category }) => {
  if (!buildingLocations) return []
  const equipment = buildingLocations
    .map(x => x.equipment || [])
    .reduce((x, y) => x.concat(y), [])

  return getEquipmentMatchingCategory({ equipment, category })
}

const getEquipmentCountByCategory = ({ equipment, category }) => {
  return getEquipmentMatchingCategory({
    equipment,
    category
  }).reduce((total, equipment) => equipment.quantity + total, 0)
}

const getAllEquipmentCountByCategory = ({ buildingLocations, category }) =>
  getAllEquipmentMatchingCategory({
    buildingLocations,
    category
  }).reduce((total, equipment) => equipment.quantity + total, 0)

export class LocationList extends React.Component {
  static propTypes = {
    user: PropTypes.object.isRequired,
    building: PropTypes.object.isRequired,
    onCloseModal: PropTypes.func.isRequired,
    onOpenModal: PropTypes.func.isRequired,
    onOpenDeleteConfirmationModal: PropTypes.func.isRequired,
    modalView: PropTypes.oneOf([
      'viewLocation',
      'addLocation',
      'editLocation',
      'deleteConfirmation'
    ]),
    modalOpen: PropTypes.bool
  }

  state = {
    showBulkExtras: '',
    keyword: '',
    filters: {},
    currentLocation: null,
    columns: {
      'Use Type': {
        getTotal: 'Total',
        sortKey: 'location',
        getValue: (location, data) => {
          const useType = useTypeOptions.find(
            useType => location.usetype === useType.value
          )
          if (data?.location.isDuplicate) {
            return (
              <span title='Duplicate Location Record'>
                <i className='material-icons warning'>warning</i>&ensp;
                {useType.name}
              </span>
            )
          } else {
            return useType && useType.name
          }
        }
      },
      name: {
        getTotal: x => x.length,
        sortKey: 'location',
        getValue: l => l.name
      },
      floor: {
        getTotal: listData =>
          listData.reduce(
            (total, { location }) =>
              total.includes(location.floor)
                ? total
                : [...total, location.floor],
            []
          ).length,
        sortKey: 'location',
        getValue: l => l.floor && l.floor.replace('-', 'B')
      },
      'Sq.Ft': {
        sortKey: 'location',
        getTotal: listData =>
          listData.reduce(
            (total, data) => total + Number(data.location.area),
            0
          ),
        getValue: l => Number(l.area, 0)
      },
      lighting: {
        sortKey: 'equipment',
        getTotal: buildingLocations =>
          getAllEquipmentCountByCategory({
            buildingLocations,
            category: 'LIGHTING'
          }),
        getValue: equipment =>
          getEquipmentCountByCategory({
            equipment,
            category: 'LIGHTING'
          })
      },
      heating: {
        sortKey: 'equipment',
        getTotal: buildingLocations =>
          getAllEquipmentCountByCategory({
            buildingLocations,
            category: 'HEATING'
          }),
        getValue: equipment =>
          getEquipmentCountByCategory({
            equipment,
            category: 'HEATING'
          })
      },
      cooling: {
        sortKey: 'equipment',
        getTotal: buildingLocations =>
          getAllEquipmentCountByCategory({
            buildingLocations,
            category: 'COOLING'
          }),
        getValue: equipment =>
          getEquipmentCountByCategory({
            equipment,
            category: 'COOLING'
          })
      },
      process: {
        sortKey: 'equipment',
        getTotal: buildingLocations =>
          getAllEquipmentCountByCategory({
            buildingLocations,
            category: 'PROCESS'
          }),
        getValue: equipment =>
          getEquipmentCountByCategory({
            equipment,
            category: 'PROCESS'
          })
      },
      'Air Distribution': {
        sortKey: 'equipment',
        getTotal: buildingLocations =>
          getAllEquipmentCountByCategory({
            buildingLocations,
            category: 'AIR_DISTRIBUTION'
          }),
        getValue: equipment =>
          getEquipmentCountByCategory({
            equipment,
            category: 'AIR_DISTRIBUTION'
          })
      },
      'Water Heating': {
        sortKey: 'equipment',
        getTotal: buildingLocations =>
          getAllEquipmentCountByCategory({
            buildingLocations,
            category: 'WATER_HEATING'
          }),
        getValue: equipment =>
          getEquipmentCountByCategory({
            equipment,
            category: 'WATER_HEATING'
          })
      },
      author: {
        header: 'Author',
        sortKey: 'location',
        getValue: e => (e && e.createdByUserId?.name) || '-',
        getTotal: '-'
      },
      createdAt: {
        header: 'Created',
        sortKey: 'location',
        getValue: e =>
          (e &&
            e.createdAt &&
            moment.unix(e.createdAt / 1000).format('MM/DD/YYYY')) ||
          '-',
        getTotal: '-'
      },
      updatedAt: {
        header: 'Updated',
        sortKey: 'location',
        getValue: e =>
          (e &&
            e.updatedAt &&
            moment.unix(e.updatedAt / 1000).format('MM/DD/YYYY')) ||
          '-',
        getTotal: '-'
      }
    },
    itemToDelete: null
  }

  handleSearch = keyword => {
    this.setState({ keyword })
  }

  handleFilter = filters => {
    this.setState({ filters })
  }

  handleCloseLocation = refetch => {
    this.props.onCloseModal()
    this.setState({ currentLocation: null })
    if (refetch) refetch()
  }

  handleEditLocation = buildingLocation => {
    this.setState({ currentLocation: buildingLocation })
    this.props.onOpenModal('editLocation')
  }

  handleCopyLocation = buildingLocation => {
    this.setState({ currentLocation: buildingLocation })
    this.toggleBulkExtras('bulkAddLocation')
  }

  toggleBulkExtras = view => {
    // toggle off
    if (view === this.state.showBulkExtras) {
      this.setState({ showBulkExtras: '' })
      return
    }
    this.setState({ showBulkExtras: view })
  }

  handleOpenDeleteConfirmationModal = buildingLocation => {
    this.props.onOpenDeleteConfirmationModal('deleteConfirmation')
    this.setState({
      itemToDelete: buildingLocation,
      currentLocation: buildingLocation
    })
  }

  handleDeleteLocation = (
    buildingLocation,
    removeBuildingLocation,
    deleteEquipment = null
  ) => {
    if (deleteEquipment) {
      this.props.client.mutate({
        mutation: REMOVE_BUILDING_EQUIPMENTS,
        variables: {
          input: {
            building: this.props.building._id,
            buildingEquipmentIds: deleteEquipment
          }
        }
      })
      removeBuildingLocation({
        variables: {
          input: {
            buildingId: this.props.building._id,
            _id: buildingLocation._id,
            locationId: buildingLocation.location._id
          }
        }
      })
    } else {
      removeBuildingLocation({
        variables: {
          input: {
            buildingId: this.props.building._id,
            _id: buildingLocation._id,
            locationId: buildingLocation.location._id
          }
        }
      })
    }

    this.props.onCloseModal()
  }

  filterData = buildingLocations => {
    let visibleLocations = Array.from(buildingLocations)
    if (this.state.keyword) {
      const regex = new RegExp(this.state.keyword, 'i')
      visibleLocations = visibleLocations.filter(
        bl => bl.location && regex.test(bl.location.name)
      )
    }

    Object.entries(this.state.filters).forEach(([filter, filterValue]) => {
      if (filterValue !== 'default' && filterValue !== 'all') {
        visibleLocations = visibleLocations.filter(
          buildingLocation => buildingLocation.location[filter] === filterValue
        )
      }
    })
    return visibleLocations
  }

  render() {
    const buildingId = this.props.building._id
    return (
      <Query
        query={GET_BUILDING_LOCATIONS}
        variables={{ id: buildingId }}
        skip={!buildingId}
      >
        {({ loading, error, data, refetch }) => {
          const locationsLoading = loading

          if (error) {
            return (
              <div className={styles.locationList}>
                <div>{error}</div>
              </div>
            )
          }

          const { building = {} } = data
          const locations = formatLocationData(building.locations)
          return (
            <Mutation
              mutation={REMOVE_BUILDING_LOCATION}
              refetchQueries={result => [
                {
                  query: GET_BUILDING_LOCATIONS,
                  variables: { id: buildingId }
                },
                {
                  query: GET_BUILDING_EQUIPMENT_LIST,
                  variables: { buildingId }
                }
              ]}
            >
              {(removeBuildingLocation, { loading, error, data }) => {
                return (
                  <div data-test='building-locations-list'>
                    {(locations.length !== 0 ||
                      loading ||
                      locationsLoading) && (
                      <ListSearch
                        listData={locations
                          .filter(
                            buildingLocation =>
                              buildingLocation && buildingLocation.location
                          )
                          .map(buildingLocation => buildingLocation.location)}
                        sortKeys={{
                          floor: 'floor',
                          usetype: 'usetype'
                        }}
                        filters={{
                          floor: 'default',
                          usetype: 'default'
                        }}
                        filtersOptions={{
                          floor: {
                            sort: (a, b) => +a - +b,
                            template: value =>
                              value.toString().replace('-', 'B'),
                            title: 'Floors'
                          },
                          usetype: {
                            title: 'Use Types',
                            template: value =>
                              value
                                .toString()
                                .replace(/-/g, ' ')
                                .toLowerCase()
                                .replace(/(\b[a-z](?!\s))/g, x =>
                                  x.toUpperCase()
                                )
                          }
                        }}
                        showFilters={true}
                        onSearch={this.handleSearch}
                        onFilter={this.handleFilter}
                      />
                    )}
                    {this.state.showBulkExtras === 'bulkAddLocation' && (
                      <LocationBulkForm
                        building={this.props.building}
                        buildingLocation={this.state.currentLocation}
                        onClose={() => this.toggleBulkExtras('')}
                      />
                    )}
                    {(locations.length !== 0 ||
                      loading ||
                      locationsLoading) && (
                      <SortableList
                        listData={this.filterData(
                          locations
                            .filter(location => location && location.location)
                            .map(location =>
                              Object.assign({}, location, {
                                isDuplicate:
                                  locations.find(
                                    otherLocation =>
                                      otherLocation.location &&
                                      otherLocation.location.usetype ===
                                        location.location.usetype &&
                                      otherLocation.location._id &&
                                      otherLocation.location._id !==
                                        location.location._id
                                  ) || false
                              })
                            )
                        )}
                        columns={this.state.columns}
                        loading={loading || locationsLoading}
                        rowActions={[
                          {
                            text: 'Edit',
                            icon: 'create',
                            handler: this.handleEditLocation
                          },
                          {
                            text: 'Bulk Copy',
                            icon: 'file_copy',
                            handler: this.handleCopyLocation
                          },
                          {
                            text: 'Delete',
                            icon: 'delete',
                            handler: location =>
                              this.handleOpenDeleteConfirmationModal(location)
                          }
                        ]}
                        onItemClick={this.handleEditLocation}
                      />
                    )}
                    {locations.length === 0 && (
                      <div className={styles.empty}>
                        <div className={styles.emptyBody}>
                          <div className={styles.emptyBodyTitle}>
                            Add Locations to Track Where Assets are Located
                          </div>
                          <div className={styles.emptyBodyDescription}>
                            Locations can be rooms, unit types, multi-room
                            areas, exterior locations & more.
                          </div>
                          <div className={styles.emptyButtons}>
                            <button
                              className={classNames(
                                styles.button,
                                styles.buttonPrimary
                              )}
                              onClick={() =>
                                this.props.onOpenModal('addLocation')
                              }
                            >
                              <i className='material-icons'>add</i> Add Location
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                    {this.props.modalOpen &&
                      this.props.modalView !== 'deleteConfirmation' && (
                        <LocationModal
                          building={this.props.building}
                          buildingLocation={this.state.currentLocation}
                          onClose={() => this.handleCloseLocation(refetch)}
                          organization={this.props.organization}
                          modalView={this.props.modalView}
                          user={this.props.user}
                        />
                      )}
                    {this.props.modalOpen &&
                      this.props.modalView === 'deleteConfirmation' && (
                        <DeleteConfirmationModal
                          title={this.state.itemToDelete.location.name}
                          confirmationFunction={deleteEquipment =>
                            this.handleDeleteLocation(
                              this.state.itemToDelete,
                              removeBuildingLocation,
                              deleteEquipment
                            )
                          }
                          itemToDelete={this.state.itemToDelete}
                          onClose={this.props.onCloseModal}
                        />
                      )}
                  </div>
                )
              }}
            </Mutation>
          )
        }}
      </Query>
    )
  }
}
export default withApollo(LocationList)
