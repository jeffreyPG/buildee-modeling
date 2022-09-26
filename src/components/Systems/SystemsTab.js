import React from 'react'
import PropTypes from 'prop-types'
import { Query, Mutation, withApollo } from 'react-apollo'
import SystemModal from '../../containers/Modal/SystemModal'
import SortableList from '../UI/SortableList'
import ListSearch from '../UI/ListSearch'
import classNames from 'classnames'
import styles from './SystemsTab.scss'

import {
  GET_SYSTEMS,
  DELETE_SYSTEM,
  updateAfterDeleteSystem
} from '../../utils/graphql/queries/systems.js'
import DeleteConfirmationModal from '../../containers/Modal/DeleteConfirmationModal'
import {
  REMOVE_BUILDING_EQUIPMENTS,
  GET_BUILDING_EQUIPMENT_LIST
} from '../../utils/graphql/queries/equipment'
import GalleryView from '../GalleryView/GalleryView'
import moment from 'moment'

export class SystemTab extends React.Component {
  static propTypes = {
    user: PropTypes.object.isRequired,
    building: PropTypes.object.isRequired,
    organization: PropTypes.object.isRequired,
    onOpenModal: PropTypes.func.isRequired,
    onOpenDeleteConfirmationModal: PropTypes.func.isRequired,
    onCloseModal: PropTypes.func.isRequired,
    modalView: PropTypes.oneOf([
      'viewSystem',
      'addSystem',
      'editSystem',
      'deleteConfirmation'
    ]),
    modalOpen: PropTypes.bool
  }

  state = {
    modalOpen: false,
    modalView: null,

    keyword: '',
    filters: {},
    type: 'all',
    sortKeys: {
      name: 'name'
    },
    columns: {
      name: {
        sortKey: 'name',
        getTotal: 'Total'
      },
      type: {
        sortKey: 'template',
        getValue: template => (template && template.name) || '-',
        getTotal: listData => listData.reduce((total, data) => total + 1, 0)
      },
      author: {
        header: 'Author',
        sortKey: 'createdByUserId',
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
    currentSystem: null,
    itemToDelete: null
  }

  handleSearch = keyword => {
    this.setState({ keyword })
  }

  handleFilter = filters => {
    this.setState({ filters })
  }

  handleCloseSystem = () => {
    this.props.onCloseModal()
    this.setState({ currentSystem: null })
  }

  handleEditSystem = system => {
    this.setState({ currentSystem: system })
    this.props.onOpenModal('editSystem')
  }

  handleCopySystem = ({ _id, images, comments, ...system }) => {
    this.setState({
      currentSystem: {
        ...system
      }
    })
    this.props.onOpenModal('addSystem')
  }

  handleOpenDeleteConfirmationModal = system => {
    this.props.onOpenDeleteConfirmationModal('deleteConfirmation')
    this.setState({
      itemToDelete: system,
      currentSystem: system
    })
  }

  handleDeleteSystem = (system, deleteSystem, deleteEquipment = null) => {
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
      deleteSystem({
        variables: {
          system: {
            _id: system._id
          }
        }
      })
    } else {
      deleteSystem({
        variables: {
          system: {
            _id: system._id
          }
        }
      })
    }

    this.props.onCloseModal()
  }

  filterData = systems => {
    if (this.state.keyword) {
      const regex = new RegExp(this.state.keyword, 'i')
      return systems.filter(e => regex.test(e.name))
    }

    return systems
  }

  getVisibleImages = systems => {
    const filteredData = this.filterData(systems) || []
    return filteredData.reduce((acc, data) => {
      if (data.images && data.images.length > 0) {
        acc = acc.concat(data.images)
      }
      return acc
    }, [])
  }

  onImageClick = systems => event => {
    if (event && event.target) {
      const imageUrl = event.target.src
      const selectedSystem = systems.find(data => {
        return data.images && data.images.indexOf(imageUrl) !== -1
      })
      if (selectedSystem) this.handleEditSystem(selectedSystem)
    }
  }

  render() {
    const { selectedView, building } = this.props
    const buildingId = building._id
    const updateVariables = { system: { building: buildingId } }
    return (
      <Query
        query={GET_SYSTEMS}
        variables={{ system: { building: buildingId } }}
      >
        {({ loading, error, data: { systems = [] } }) => {
          return (
            <Mutation
              mutation={DELETE_SYSTEM}
              update={(...args) =>
                updateAfterDeleteSystem(...args, updateVariables)
              }
              refetchQueries={result => [
                {
                  query: GET_BUILDING_EQUIPMENT_LIST,
                  variables: { buildingId }
                }
              ]}
            >
              {(
                deleteSystem,
                {
                  loading: mutationLoading,
                  error: mutationError,
                  data: mutationData
                }
              ) => {
                return (
                  <div data-test="building-systems-list">
                    {(systems.length !== 0 || loading) && (
                      <ListSearch
                        listData={systems}
                        sortKeys={this.state.sortKeys}
                        showFilters={false}
                        onSearch={this.handleSearch}
                        onFilter={this.handleFilter}
                      />
                    )}
                    {(systems.length !== 0 || loading) && (
                      <div>
                        {selectedView === 'table' ? (
                          <SortableList
                            listData={this.filterData(systems)}
                            loading={loading}
                            error={error}
                            showTotals={systems.length > 0}
                            columns={this.state.columns}
                            rowActions={[
                              {
                                text: 'Edit',
                                icon: 'create',
                                handler: this.handleEditSystem
                              },
                              {
                                text: 'Copy',
                                icon: 'file_copy',
                                handler: this.handleCopySystem
                              },
                              {
                                text: 'Delete',
                                icon: 'delete',
                                handler: system =>
                                  this.handleOpenDeleteConfirmationModal(system)
                              }
                            ]}
                            onItemClick={this.handleEditSystem}
                          />
                        ) : (
                          <GalleryView
                            urls={this.getVisibleImages(systems)}
                            onImageClick={this.onImageClick(systems)}
                          />
                        )}
                      </div>
                    )}

                    {systems.length === 0 && (
                      <div className={styles.empty}>
                        <div className={styles.emptyBody}>
                          <div className={styles.emptyBodyTitle}>
                            Add Systems to Connect Equipment & Controls
                          </div>
                          <div className={styles.emptyBodyDescription}>
                            Browse typical system types and add or link
                            equipment.
                          </div>
                          <div className={styles.emptyButtons}>
                            <button
                              className={classNames(
                                styles.button,
                                styles.buttonPrimary
                              )}
                              onClick={() =>
                                this.props.onOpenModal('addSystem')
                              }
                            >
                              <i className="material-icons">add</i> Add System
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {this.props.modalOpen &&
                      this.props.modalView !== 'deleteConfirmation' && (
                        <SystemModal
                          user={this.props.user}
                          building={this.props.building}
                          organization={this.props.organization}
                          onClose={this.handleCloseSystem}
                          system={this.state.currentSystem}
                          modalView={this.props.modalView}
                        />
                      )}
                    {this.props.modalOpen &&
                      this.props.modalView === 'deleteConfirmation' && (
                        <DeleteConfirmationModal
                          title={this.state.itemToDelete.name}
                          confirmationFunction={deleteEquipment =>
                            this.handleDeleteSystem(
                              this.state.itemToDelete,
                              deleteSystem,
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
export default withApollo(SystemTab)
