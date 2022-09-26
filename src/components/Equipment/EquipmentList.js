import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { Mutation, Query, withApollo } from 'react-apollo'
import styles from './EquipmentList.scss'
import EquipmentModal from '../../containers/Modal/EquipmentModal'
import SortableList from '../UI/SortableList'
import ListSearch from '../UI/ListSearch'
import {
  COPY_BUILDING_EQUIPMENT,
  GET_BUILDING_EQUIPMENT,
  GET_BUILDING_EQUIPMENT_LIST,
  REMOVE_BUILDING_EQUIPMENT
} from '../../utils/graphql/queries/equipment'
import { getLocationDisplayName } from '../../containers/Form/EquipmentForms/selectors'
import { REMOVE_BUILDING_LOCATION_EQUIPMENT } from '../../utils/graphql/queries/location'
import DeleteConfirmationModal from '../../containers/Modal/DeleteConfirmationModal'
import { GalleryView } from '../GalleryView/GalleryView'
import moment from 'moment'

const EQUIPMENT_KEYS = {
  applications: 'application',
  categories: 'category',
  technologies: 'technology',
  name: 'name'
}

const BUILDING_EQUIPMENT_KEYS = {
  floor: 'floor',
  media: 'mediaCount',
  projects: 'projectCount',
  quantity: 'quantity',
  space: 'space',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
}

const getVisibleEquipment = ({ filters, buildingEquipment, keyword }) => {
  const equipmentMatchingFilters = buildingEquipment.filter(e => {
    return Object.entries(filters).every(([filter, filterValue]) => {
      let equipmentKey =
        (e.libraryEquipment && e.libraryEquipment[EQUIPMENT_KEYS[filter]]) || ''
      return (
        filterValue === 'default' ||
        filterValue === 'all' ||
        equipmentKey === filterValue ||
        e[BUILDING_EQUIPMENT_KEYS[filter]] === filterValue
      )
    })
  })

  if (keyword.length === 0) {
    return equipmentMatchingFilters
  }
  const regex = new RegExp(keyword, 'i')
  return equipmentMatchingFilters.filter(e => {
    let name = (e.libraryEquipment && e.libraryEquipment.name) || ''
    const tag = e.configs.find(({ field }) => field === 'tagID')
    const id = e.configs.find(({ field }) => field === 'identifier')
    return (
      regex.test(name) ||
      (tag && tag.value && regex.test(tag.value)) ||
      (id && id.value && regex.test(id.value))
    )
  })
}

const getVisibleEquipmentImages = ({ filters, buildingEquipment, keyword }) => {
  const equipmentList = getVisibleEquipment({
    filters,
    buildingEquipment,
    keyword
  })
  return equipmentList.reduce((acc, equipment) => {
    if (equipment.images && equipment.images.length > 0) {
      acc = acc.concat(equipment.images)
    }
    return acc
  }, [])
}

export class EquipmentList extends React.Component {
  static propTypes = {
    building: PropTypes.object.isRequired,
    modalOpen: PropTypes.bool,
    modalView: PropTypes.oneOf([
      'addEquipment',
      'editEquipment',
      'copyEquipment',
      'deleteConfirmation'
    ]),
    onCloseModal: PropTypes.func.isRequired,
    onOpenModal: PropTypes.func.isRequired,
    onOpenDeleteConfirmationModal: PropTypes.func,
    organization: PropTypes.object.isRequired,
    user: PropTypes.object.isRequired,
    selectedView: PropTypes.string.isRequired,
    showActions: PropTypes.bool,
    selectedCategory: PropTypes.string
  }

  state = {
    columns: {
      tag: {
        header: 'Tag',
        sortKey: 'configs',
        getValue: (configs = []) => {
          const config = configs?.find(({ field }) => field === 'tagID')
          return (config && config.value) || '-'
        },
        getTotal: '-'
      },
      id: {
        header: 'ID',
        sortKey: 'configs',
        getValue: (configs = []) => {
          const config = configs?.find(({ field }) => field === 'identifier')
          return (config && config.value) || '-'
        },
        getTotal: '-'
      },
      name: {
        sortKey: 'libraryEquipment',
        getValue: e => (e && e.name) || '-',
        getTotal: listData => listData.length
      },
      floor: {
        sortKey: 'location',
        getValue: l =>
          (l && l.floor && l.floor.toString().replace('-', 'B')) || '-',
        getTotal: listData => {
          const floors = listData.reduce((agg, data) => {
            if (data.location && data.location.floor)
              agg[data.location.floor] = true
            return agg
          }, {})
          return Object.keys(floors).length
        }
      },
      space: {
        sortKey: 'location',
        getValue: l => (l && getLocationDisplayName(l)) || '-',
        getTotal: '-'
      },
      quantity: {
        sortKey: 'quantity',
        getTotal: listData =>
          listData.reduce((total, data) => total + data.quantity, 0)
      },
      media: {
        sortKey: 'images',
        getValue: media => {
          return media ? media.length : 0
        },
        getTotal: listData =>
          listData.reduce(
            (total, data) => total + ((data.images && data.images.length) || 0),
            0
          )
      },
      schedule: {
        header: 'Schedule',
        sortKey: 'operation',
        getValue: e => e?.name ?? '-',
        getTotal: '-'
      },
      author: {
        header: 'Author',
        sortKey: 'createdByUser',
        getValue: e => (e && e.name) || '-',
        getTotal: '-'
      },
      createdAt: {
        header: 'Created',
        sortKey: 'createdAt',
        getValue: e => (e && moment.unix(e / 1000).format('MM/DD/YYYY')) || '-',
        getTotal: '-'
      },
      updatedAt: {
        header: 'Updated',
        sortKey: 'updatedAt',
        getValue: e => (e && moment.unix(e / 1000).format('MM/DD/YYYY')) || '-',
        getTotal: '-'
      }
    },
    currentBuildingEquipment: null,
    currentLibraryEquipment: null,
    filters: {
      categories: this.props.selectedCategory || 'default',
      applications: 'default',
      technologies: 'default'
    },
    keyword: '',
    modalOpen: false,
    deleteConfirmationOpen: false,
    itemToDelete: null,
    sort: {
      key: 'updated',
      direction: 'DESC'
    },
    sortKeys: {
      applications: 'value',
      categories: 'value',
      technologies: 'value'
    }
  }

  handleColumns = ({ applications }) => {
    const applicationDisplayNames = applications.reduce((acc, application) => {
      return {
        ...acc,
        [application.value]: application.displayName
      }
    }, {})
    return Object.assign(
      {},
      {
        application: {
          getTotal: 'Total',
          sortKey: 'libraryEquipment',
          getValue: e => {
            if (!e) {
              return '-'
            }
            return applicationDisplayNames[e.application] || '-'
          }
        }
      },
      this.state.columns
    )
  }

  handleOpenDeleteConfirmationModal = buildingEquipment => {
    this.props.onOpenDeleteConfirmationModal('deleteConfirmation')
    this.setState({
      currentBuildingEquipment: buildingEquipment,
      currentLibraryEquipment: buildingEquipment.libraryEquipment,
      // deleteConfirmationOpen: !this.state.deleteConfirmationOpen,
      itemToDelete: buildingEquipment
    })
  }

  handleDeleteEquipment = (buildingEquipment, removeBuildingEquipment) => {
    removeBuildingEquipment({
      variables: {
        input: {
          building: this.props.building._id,
          _id: buildingEquipment._id
        }
      }
    })

    this.props.onCloseModal()
  }

  handleEditEquipment = buildingEquipment => {
    this.props.onOpenModal('editEquipment', buildingEquipment)
    this.setState({
      currentBuildingEquipment: buildingEquipment,
      currentLibraryEquipment: buildingEquipment.libraryEquipment
    })
  }

  handleCopyEquipment = buildingEquipment => {
    this.props.onOpenModal('copyEquipment')
    this.setState({
      currentBuildingEquipment: buildingEquipment,
      currentLibraryEquipment: buildingEquipment.libraryEquipment
    })
  }

  handleSearch = keyword => {
    this.setState({ keyword })
  }

  handleFilter = filters => {
    this.setState({ filters })
  }

  onImageClick = buildingEquipment => event => {
    if (event && event.target) {
      const imageUrl = event.target.src
      const selectedEquipment = buildingEquipment.find(equipment => {
        return equipment.images && equipment.images.indexOf(imageUrl) !== -1
      })
      if (selectedEquipment) this.handleEditEquipment(selectedEquipment)
    }
  }

  render() {
    const { building, client, selectedView, showActions = true } = this.props
    const { filters, keyword } = this.state
    const { applications, categories, technologies } = filters
    const buildingId = building._id
    return (
      <Query
        skip={!buildingId}
        query={GET_BUILDING_EQUIPMENT_LIST}
        variables={{ buildingId }}
        fetchPolicy='cache-and-network'
      >
        {({ loading, error, data }) => {
          const { buildingEquipment = [] } = data
          return (
            <Mutation
              mutation={REMOVE_BUILDING_EQUIPMENT}
              refetchQueries={result => [
                { query: GET_BUILDING_EQUIPMENT, variables: { buildingId } }
              ]}
              onCompleted={data => {
                const buildingEquipmentId = data.removeBuildingEquipment._id
                const locationId =
                  (data.removeBuildingEquipment.location &&
                    data.removeBuildingEquipment.location._id) ||
                  null

                if (locationId) {
                  client.mutate({
                    mutation: REMOVE_BUILDING_LOCATION_EQUIPMENT,
                    variables: {
                      input: {
                        buildingId,
                        locationId,
                        buildingEquipmentId
                      }
                    }
                  })
                }
              }}
            >
              {(
                removeBuildingEquipment,
                {
                  loading: mutationLoading,
                  error: mutationError,
                  data: mutationData
                }
              ) => {
                return (
                  <Mutation
                    mutation={COPY_BUILDING_EQUIPMENT}
                    refetchQueries={result => [
                      {
                        query: GET_BUILDING_EQUIPMENT,
                        variables: { buildingId }
                      }
                    ]}
                  >
                    {(
                      copyBuildingEquipment,
                      {
                        loading: mutationLoading,
                        error: mutationError,
                        data: mutationData
                      }
                    ) => {
                      const mutation = data
                      return (
                        <div
                          className={styles.equipmentList}
                          data-test='building-equipment-list'
                        >
                          <div>
                            <div
                              className={styles.equipmentListExtras}
                              data-test='building-equipment-filters'
                            >
                              {(buildingEquipment.length !== 0 ||
                                loading ||
                                mutationLoading) && (
                                <ListSearch
                                  listData={buildingEquipment || []}
                                  sortKeys={this.state.sortKeys}
                                  filters={this.state.filters}
                                  hasCategorization={true}
                                  showFilters={true}
                                  onSearch={this.handleSearch}
                                  onFilter={this.handleFilter}
                                  lookupDisplayName={
                                    (mutation && mutation.applications) || []
                                  }
                                />
                              )}
                            </div>
                            {(buildingEquipment.length !== 0 ||
                              loading ||
                              mutationLoading) && (
                              <div data-test='building-equipment-table'>
                                {selectedView === 'table' ? (
                                  <SortableList
                                    listData={getVisibleEquipment({
                                      buildingEquipment,
                                      filters: {
                                        applications,
                                        categories,
                                        technologies
                                      },
                                      keyword
                                    })}
                                    loading={loading || mutationLoading}
                                    error={error}
                                    columns={this.handleColumns({
                                      applications: mutation.applications || []
                                    })}
                                    rowActions={
                                      showActions
                                        ? [
                                            {
                                              text: 'Edit',
                                              icon: 'create',
                                              handler: this.handleEditEquipment
                                            },
                                            {
                                              text: 'Copy',
                                              icon: 'file_copy',
                                              handler: this.handleCopyEquipment
                                            },
                                            {
                                              text: 'Delete',
                                              icon: 'delete',
                                              handler: buildingEquipment =>
                                                this.handleOpenDeleteConfirmationModal(
                                                  buildingEquipment
                                                )
                                            }
                                          ]
                                        : []
                                    }
                                    onItemClick={this.handleEditEquipment}
                                    scrollable={true}
                                  />
                                ) : (
                                  <GalleryView
                                    urls={getVisibleEquipmentImages({
                                      buildingEquipment,
                                      filters: {
                                        applications,
                                        categories,
                                        technologies
                                      },
                                      keyword
                                    })}
                                    onImageClick={this.onImageClick(
                                      buildingEquipment
                                    )}
                                  />
                                )}
                              </div>
                            )}

                            {buildingEquipment.length === 0 && (
                              <div className={styles.empty}>
                                <div className={styles.emptyBody}>
                                  <div className={styles.emptyBodyTitle}>
                                    Add Equipment to Track Assets & How They Use
                                    Energy
                                  </div>
                                  <div className={styles.emptyBodyDescription}>
                                    Browse the equipment library or add one from
                                    scratch.
                                  </div>
                                  <div className={styles.emptyButtons}>
                                    <button
                                      className={classNames(
                                        styles.button,
                                        styles.buttonPrimary
                                      )}
                                      onClick={() =>
                                        this.props.onOpenModal('addEquipment')
                                      }
                                    >
                                      <i className='material-icons'>add</i> Add
                                      Equipment
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )}

                            {this.props.modalOpen &&
                              this.props.modalView !== 'deleteConfirmation' && (
                                <EquipmentModal
                                  building={this.props.building}
                                  buildingEquipment={
                                    this.state.currentBuildingEquipment
                                  }
                                  equipment={this.state.currentLibraryEquipment}
                                  onClose={this.props.onCloseModal}
                                  organization={this.props.organization}
                                  modalView={this.props.modalView}
                                  user={this.props.user}
                                  projectProps={this.props.projectProps}
                                />
                              )}
                            {this.props.modalOpen &&
                              this.props.modalView === 'deleteConfirmation' && (
                                <DeleteConfirmationModal
                                  title={
                                    this.state.itemToDelete.libraryEquipment
                                      .name
                                  }
                                  confirmationFunction={() =>
                                    this.handleDeleteEquipment(
                                      this.state.itemToDelete,
                                      removeBuildingEquipment
                                    )
                                  }
                                  onClose={this.props.onCloseModal}
                                />
                              )}
                          </div>
                        </div>
                      )
                    }}
                  </Mutation>
                )
              }}
            </Mutation>
          )
        }}
      </Query>
    )
  }
}

export default withApollo(EquipmentList)
