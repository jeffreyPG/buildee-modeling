import React from 'react'
import PropTypes from 'prop-types'
import { Query, Mutation } from 'react-apollo'
import ConstructionModal from '../../containers/Modal/ConstructionModal'
import SortableList from '../UI/SortableList'
import ListSearch from '../UI/ListSearch'
import classNames from 'classnames'
import styles from './ConstructionTab.scss'

import {
  GET_BUILDING_CONSTRUCTIONS,
  REMOVE_BUILDING_CONSTRUCTION
} from '../../utils/graphql/queries/construction.js'
import DeleteConfirmationModal from '../../containers/Modal/DeleteConfirmationModal'
import GalleryView from '../GalleryView/GalleryView'
import moment from 'moment'

const CONSTRUCTION_APPLICATION_DISPLAY_VALUES = {
  WALL: 'Wall',
  FOUNDATION: 'Foundation',
  INTERIOR_FLOOR: 'Interior Floor',
  EXTERIOR_FLOOR: 'Exterior Floor',
  ROOF: 'Roof',
  WINDOW: 'Window'
}

export class ConstructionTab extends React.Component {
  static propTypes = {
    user: PropTypes.object.isRequired,
    building: PropTypes.object.isRequired,
    onOpenModal: PropTypes.func.isRequired,
    onOpenDeleteConfirmationModal: PropTypes.func.isRequired,
    onCloseModal: PropTypes.func.isRequired,
    modalView: PropTypes.oneOf([
      'viewConstruction',
      'addConstruction',
      'editConstruction',
      'copyConstruction',
      'deleteConfirmation'
    ]),
    modalOpen: PropTypes.bool
  }

  state = {
    keyword: '',
    filters: {},
    sortKeys: {
      name: 'name',
      application: 'application',
      rvalue: 'rvalue',
      vvalue: 'vvalue',
      media: 'images'
    },
    columns: {
      application: {
        getTotal: 'Total',
        sortKey: 'construction',
        getValue: construction =>
          (construction &&
            CONSTRUCTION_APPLICATION_DISPLAY_VALUES[
              construction.application
            ]) ||
          '-'
      },
      name: {
        getTotal: x => x.length,
        sortKey: 'construction',
        getValue: construction => construction && construction.name
      },
      rvalue: {
        getTotal: '-',
        sortKey: 'construction',
        header: 'R-Value',
        getValue: construction =>
          (construction &&
            construction.fields.rValue &&
            construction.fields.rValue.value) ||
          '-'
      },
      vvalue: {
        getTotal: '-',
        sortKey: 'construction',
        header: 'U-Value',
        getValue: construction =>
          (construction &&
            construction.fields.uvalue &&
            construction.fields.uvalue.value) ||
          '-'
      },
      media: {
        sortKey: 'images',
        getTotal: function(listData) {
          return listData.reduce((total, data) => total + data.images.length, 0)
        },
        getValue: images => images.length
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
    currentConstruction: null,
    equipmentModal: false,
    itemToDelete: null
  }

  handleSearch = keyword => {
    this.setState({ keyword })
  }

  handleFilter = filters => {
    this.setState({ filters })
  }

  handleCloseConstruction = () => {
    this.props.onCloseModal()
    this.setState({ currentConstruction: null })
  }

  handleEditConstruction = construction => {
    this.setState({ currentConstruction: construction })
    this.props.onOpenModal('editConstruction')
  }

  handleCopyConstruction = ({ construction, images, comments }) => {
    this.setState({
      currentConstruction: {
        construction,
        images,
        comments
      }
    })
    this.props.onOpenModal('copyConstruction')
  }

  handleOpenDeleteConfirmationModal = construction => {
    this.props.onOpenDeleteConfirmationModal('deleteConfirmation')
    this.setState({
      itemToDelete: construction,
      currentConstruction: construction
    })
  }

  handleDeleteConstruction = (construction, removeBuildingConstruction) => {
    removeBuildingConstruction({
      variables: {
        input: {
          building: this.props.building._id,
          _id: construction._id
        }
      }
    })

    this.props.onCloseModal()
  }

  filterData = buildingConstructions => {
    let filtered = Array.from(buildingConstructions)
    if (this.state.keyword) {
      const regex = new RegExp(this.state.keyword, 'i')
      filtered = buildingConstructions.filter(bc =>
        regex.test(bc.construction.name)
      )
    }
    Object.keys(this.state.filters).forEach(filter => {
      let filterValue = this.state.filters[filter]
      if (filterValue !== 'default' && filterValue !== 'all') {
        filtered = filtered.filter(bc => {
          if (!bc[filter] && bc.construction[filter]) {
            return bc.construction[filter] === filterValue
          }
          return bc[filter] === filterValue
        })
      }
    })

    return filtered
  }

  getVisibleImages = buildingConstructions => {
    const filteredData = this.filterData(buildingConstructions) || []
    return filteredData.reduce((acc, data) => {
      if (data.images && data.images.length > 0) {
        acc = acc.concat(data.images)
      }
      return acc
    }, [])
  }

  onImageClick = buildingConstructions => event => {
    if (event && event.target) {
      const imageUrl = event.target.src
      const selectedData = buildingConstructions.find(data => {
        return data.images && data.images.indexOf(imageUrl) !== -1
      })
      if (selectedData) this.handleEditConstruction(selectedData)
    }
  }

  render() {
    const { selectedView, building } = this.props
    const buildingId = building._id
    return (
      <Query query={GET_BUILDING_CONSTRUCTIONS} variables={{ id: buildingId }}>
        {({
          loading,
          error,
          data: { building: { constructions = [] } = {} }
        }) => {
          console.log('constructions', constructions)
          return (
            <Mutation
              mutation={REMOVE_BUILDING_CONSTRUCTION}
              refetchQueries={result => [
                {
                  query: GET_BUILDING_CONSTRUCTIONS,
                  variables: { id: buildingId }
                }
              ]}
            >
              {(
                removeBuildingConstruction,
                {
                  loading: mutationLoading,
                  error: mutationError,
                  data: mutationData
                }
              ) => {
                return (
                  <div>
                    {(constructions.length !== 0 || loading) && (
                      <ListSearch
                        listData={constructions}
                        sortKeys={this.state.sortKeys}
                        filters={{
                          application: 'default'
                        }}
                        showFilters={true}
                        onSearch={this.handleSearch}
                        onFilter={this.handleFilter}
                      />
                    )}
                    {(constructions.length !== 0 || loading) && (
                      <div>
                        {selectedView === 'table' ? (
                          <SortableList
                            listData={this.filterData(constructions)}
                            loading={loading}
                            error={error}
                            columns={this.state.columns}
                            rowActions={[
                              {
                                text: 'Edit',
                                icon: 'create',
                                handler: this.handleEditConstruction
                              },
                              {
                                text: 'Copy',
                                icon: 'file_copy',
                                handler: this.handleCopyConstruction
                              },
                              {
                                text: 'Delete',
                                icon: 'delete',
                                handler: construction =>
                                  this.handleOpenDeleteConfirmationModal(
                                    construction
                                  )
                              }
                            ]}
                            onItemClick={this.handleEditConstruction}
                          />
                        ) : (
                          <GalleryView
                            urls={this.getVisibleImages(constructions)}
                            onImageClick={this.onImageClick(constructions)}
                          />
                        )}
                      </div>
                    )}
                    {constructions.length === 0 && (
                      <div className={styles.empty}>
                        <div className={styles.emptyBody}>
                          <div className={styles.emptyBodyTitle}>
                            Add Building Envelope Construction Types
                          </div>
                          <div className={styles.emptyBodyDescription}>
                            Browse typical assemblies and their energy
                            properties.
                          </div>
                          <div className={styles.emptyButtons}>
                            <button
                              className={classNames(
                                styles.button,
                                styles.buttonPrimary
                              )}
                              onClick={() =>
                                this.props.onOpenModal('addConstruction')
                              }
                            >
                              <i className="material-icons">add</i> Add
                              Construction
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {this.props.modalOpen &&
                      this.props.modalView !== 'deleteConfirmation' && (
                        <ConstructionModal
                          user={this.props.user}
                          building={this.props.building}
                          onClose={this.handleCloseConstruction}
                          construction={this.state.currentConstruction}
                          modalView={this.props.modalView}
                        />
                      )}
                    {this.props.modalOpen &&
                      this.props.modalView === 'deleteConfirmation' && (
                        <DeleteConfirmationModal
                          title={this.state.itemToDelete.construction.name}
                          confirmationFunction={() =>
                            this.handleDeleteConstruction(
                              this.state.itemToDelete,
                              removeBuildingConstruction
                            )
                          }
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
export default ConstructionTab
