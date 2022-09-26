import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { Query, Mutation } from 'react-apollo'
import styles from './OperationsView.scss'
import SortableList from '../UI/SortableList'
import ListSearch from '../UI/ListSearch'
import OperationModal from '../../containers/Modal/OperationModal'

import {
  GET_BUILDING_OPERATIONS,
  REMOVE_BUILDING_OPERATION
} from '../../utils/graphql/queries/operation.js'
import DeleteConfirmationModal from '../../containers/Modal/DeleteConfirmationModal'
import moment from 'moment'

const getTitleCase = name => {
  if (name === null) return ''
  return name
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

export class OperationsView extends React.Component {
  static propTypes = {
    user: PropTypes.object.isRequired,
    building: PropTypes.object.isRequired
  }

  state = {
    modalOpen: false,
    modalView: null,
    buildingOperations: [],

    keyword: '',
    filters: {},
    sortKeys: {
      type: 'type',
      name: 'name'
    },
    columns: {
      type: {
        getTotal: 'Total',
        sortKey: 'schedule',
        getValue: schedule =>
          getTitleCase((schedule && schedule.scheduleType) || '')
      },
      name: {
        getTotal: x => x.length,
        sortKey: 'name',
        getValue: item => item.scheduleName,
        flag: true
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
    currentOperation: null
  }

  handleOpenOperationModal = modalView => {
    let state = { modalOpen: true, modalView }
    switch (modalView) {
      case 'viewOperation':
      case 'addOperation':
      case 'editOperation':
        this.setState(state)
        break
    }
  }

  handleAddOperation = () => {
    this.setState({ currentOperation: null })
    this.handleOpenOperationModal('addOperation')
  }

  handleEditOperation = operation => {
    this.setState({ currentOperation: operation })
    this.handleOpenOperationModal('editOperation')
  }

  handleCopyOperation = ({ _id, ...attributes }) => {
    this.setState({
      currentOperation: {
        ...attributes
      }
    })
    this.handleOpenOperationModal('addOperation')
  }

  handleOpenDeleteConfirmationModal = operation => {
    this.setState({
      modalOpen: true,
      modalView: 'deleteConfirmation',
      currentOperation: operation
    })
  }

  handleDeleteOperation = (construction, removeBuildingConstruction) => {
    removeBuildingConstruction({
      variables: {
        input: {
          building: this.props.building._id,
          _id: construction._id
        }
      }
    })

    this.handleCloseOperationModal()
  }

  handleCloseOperationModal = (refetchOperation = null) => {
    if (refetchOperation) refetchOperation()
    this.setState({ modalOpen: false, modalView: null })
  }

  handleSearch = keyword => {
    this.setState({ keyword })
  }

  handleType = type => {
    this.setState({ type })
  }

  handleListSearch = operations => {
    if (this.state.keyword) {
      const regex = new RegExp(this.state.keyword, 'i')
      operations = operations.filter(e => regex.test(e.name))
    }

    let filterValue = this.state.type
    if (filterValue !== 'default' && filterValue !== 'all') {
      operations = operations.filter(e => e.type === filterValue)
    }

    return operations
  }

  render() {
    const buildingId = this.props.building._id
    return (
      <Query
        query={GET_BUILDING_OPERATIONS}
        variables={{ id: buildingId }}
        fetchPolicy="cache-and-network"
      >
        {({
          loading,
          error,
          data: { building: { operations = [] } = {} },
          refetch: refetchOperation
        }) => {
          return (
            <Mutation mutation={REMOVE_BUILDING_OPERATION}>
              {(removeBuildingOperation, { data: mutationData }) => {
                return (
                  <div className={styles.operations}>
                    <div className={styles.operationsHeading}>
                      <h2>Operation</h2>
                      {operations.length !== 0 && (
                        <button
                          className={classNames(
                            styles.button,
                            styles.buttonPrimary
                          )}
                          onClick={() => this.handleAddOperation()}
                        >
                          <i className="material-icons">add</i>New
                          <span />
                        </button>
                      )}
                    </div>
                    {operations.length !== 0 && (
                      <ListSearch
                        listData={operations}
                        sortKeys={this.state.sortKeys}
                        showFilters={false}
                        showSearch={true}
                        showType={true}
                        onSearch={this.handleSearch}
                        onType={this.handleType}
                      />
                    )}
                    {(operations.length !== 0 || loading) && (
                      <SortableList
                        listData={this.handleListSearch(operations)}
                        loading={loading}
                        error={error}
                        columns={this.state.columns}
                        rowActions={[
                          {
                            text: 'Edit',
                            icon: 'create',
                            handler: this.handleEditOperation
                          },
                          {
                            text: 'Copy',
                            icon: 'file_copy',
                            handler: this.handleCopyOperation
                          },
                          {
                            text: 'Delete',
                            icon: 'delete',
                            handler: operation =>
                              this.handleOpenDeleteConfirmationModal(operation)
                          }
                        ]}
                        onItemClick={this.handleEditOperation}
                      />
                    )}
                    {/* {operations.length === 0 && (
                      <div className={styles.operationsEmpty}>
                        <p>Add operation</p>
                        <button
                          className={classNames(
                            styles.button,
                            styles.buttonPrimary
                          )}
                          onClick={() => this.handleAddOperation()}
                        >
                          <i className="material-icons">add</i>New
                          <span />
                        </button>
                      </div>
                    )} */}
                    {operations.length === 0 && (
                      <div className={styles.empty}>
                        <div className={styles.emptyBody}>
                          <div className={styles.emptyBodyTitle}>
                            Add Operational & Setpoint Schedules
                          </div>
                          <div className={styles.emptyBodyDescription}>
                            Track at the building level and/or attach to
                            equipment.
                          </div>
                          <div className={styles.emptyButtons}>
                            <button
                              className={classNames(
                                styles.button,
                                styles.buttonPrimary
                              )}
                              onClick={() => this.handleAddOperation()}
                            >
                              <i className="material-icons">add</i> Add Schedule
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {this.state.modalOpen &&
                      this.state.modalView !== 'deleteConfirmation' && (
                        <OperationModal
                          user={this.props.user}
                          building={this.props.building}
                          onClose={() => {
                            this.handleCloseOperationModal(refetchOperation)
                          }}
                          operation={this.state.currentOperation}
                          modalView={this.state.modalView}
                        />
                      )}
                    {this.state.modalOpen &&
                      this.state.modalView === 'deleteConfirmation' && (
                        <DeleteConfirmationModal
                          title={
                            this.state.currentOperation &&
                            this.state.currentOperation.schedule &&
                            this.state.currentOperation.schedule.name
                          }
                          confirmationFunction={() =>
                            this.handleDeleteOperation(
                              this.state.currentOperation,
                              removeBuildingOperation
                            )
                          }
                          onClose={this.handleCloseOperationModal}
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

export default OperationsView
