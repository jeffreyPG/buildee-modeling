import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { Query, Mutation } from 'react-apollo'
import styles from './ActionsView.scss'
import SortableList from '../UI/SortableList'
import ListSearch from '../UI/ListSearch'
import ActionModal from '../../containers/Modal/ActionModal'
import moment from 'moment'

import { detectMobileTouch } from 'utils/Utils'

import {
  GET_ACTIONS,
  DELETE_ACTION,
  updateAfterDeleteAction
} from '../../utils/graphql/queries/actions.js'
import DeleteConfirmationModal from '../../containers/Modal/DeleteConfirmationModal'

export class ActionsView extends React.Component {
  static propTypes = {
    user: PropTypes.object.isRequired,
    building: PropTypes.object.isRequired,

    //Projects Props
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
    projectModalOpen: false,
    modalView: null,

    keyword: '',
    filters: {},
    sortKeys: {
      type: 'name'
    },
    columns: {
      type: {
        sortKey: 'name'
      },
      date: {
        sortKey: 'date',
        getValue: timestamp =>
          moment(new Date(parseInt(timestamp))).format('MM/DD/YYYY')
      }
    },
    currentAction: null,
    currentProject: {}
  }

  componentDidMount = () => {
    this.props.getProjectsAndMeasures(this.props.building._id)
  }

  handleOpenActionModal = modalView => {
    let state = { modalOpen: true, modalView }
    switch (modalView) {
      case 'viewAction':
      case 'addAction':
      case 'editAction':
        this.setState(state)
        break
    }
  }

  handleAddAction = () => {
    this.setState({ currentAction: null })
    this.handleOpenActionModal('addAction')
  }

  handleEditAction = action => {
    this.setState({ currentAction: action })
    this.handleOpenActionModal('editAction')
  }

  handleOpenDeleteConfirmationModal = action => {
    this.setState({
      modalOpen: true,
      modalView: 'deleteConfirmation',
      currentAction: action
    })
  }
  handleDeleteAction = (action, deleteAction) => {
    deleteAction({
      variables: {
        action: {
          _id: action._id
        }
      }
    })
    this.handleCloseActionModal()
  }

  handleCloseActionModal = () => {
    this.setState({ modalOpen: false, modalView: null })
  }

  handleSearch = keyword => {
    this.setState({ keyword })
  }

  handleFilter = filters => {
    this.setState({ filters })
  }

  handleListSearch = actions => {
    if (this.state.keyword) {
      const regex = new RegExp(this.state.keyword, 'i')
      actions = actions.filter(e => regex.test(e.name))
    }

    Object.keys(this.state.filters).forEach(filter => {
      let filterValue = this.state.filters[filter]
      if (filterValue !== 'default' && filterValue !== 'all') {
        let sortKey = this.state.columns[filter].sortKey
        actions = actions.filter(e => e[sortKey] === filterValue)
      }
    })

    return actions
  }

  render() {
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

    const buildingId = this.props.building._id
    return (
      <Query
        query={GET_ACTIONS}
        variables={{ action: { buildingId: buildingId } }}
      >
        {({ loading, error, data: { actions = [] } }) => {
          return (
            <Mutation
              mutation={DELETE_ACTION}
              update={(...args) =>
                updateAfterDeleteAction(...args, { action: { buildingId } })
              }
              refetchQueries={result => [
                {
                  query: GET_ACTIONS,
                  variables: {
                    action: {
                      buildingId: this.props.building._id,
                      type: 'LL87_RCX'
                    }
                  }
                },
                {
                  query: GET_ACTIONS,
                  variables: {
                    action: {
                      buildingId: this.props.building._id,
                      type: 'LL87_ENERGY_AUDIT'
                    }
                  }
                }
              ]}
            >
              {deleteAction => {
                return (
                  <div className={styles.actions}>
                    <div className={styles.actionsHeading}>
                      <h2>Actions</h2>
                      <button
                        className={classNames(
                          styles.button,
                          styles.buttonPrimary
                        )}
                        onClick={() => this.handleAddAction()}
                      >
                        <i className="material-icons">add</i>New
                      </button>
                    </div>
                    {actions.length > 0 && (
                      <ListSearch
                        listData={actions}
                        sortKeys={this.state.sortKeys}
                        filters={{
                          type: 'default'
                        }}
                        filtersOptions={{
                          type: { title: 'types' }
                        }}
                        showFilters={true}
                        showSearch={true}
                        onSearch={this.handleSearch}
                        onFilter={this.handleFilter}
                      />
                    )}
                    {actions.length > 0 && (
                      <SortableList
                        listData={this.handleListSearch(actions)}
                        loading={loading}
                        error={error}
                        showTotals={false}
                        columns={this.state.columns}
                        rowActions={[
                          {
                            text: 'Edit',
                            icon: 'create',
                            handler: this.handleEditAction
                          },
                          {
                            text: 'Delete',
                            icon: 'delete',
                            handler: action =>
                              this.handleOpenDeleteConfirmationModal(action)
                          }
                        ]}
                        onItemClick={this.handleEditAction}
                      />
                    )}
                    {actions.length === 0 && (
                      <div className={styles.actionsEmpty}>
                        <p>Add Action</p>
                        <button
                          className={classNames(
                            styles.button,
                            styles.buttonPrimary
                          )}
                          onClick={() => this.handleAddAction()}
                        >
                          <i className="material-icons">add</i>&nbsp;New Action
                        </button>
                      </div>
                    )}

                    {this.state.modalOpen &&
                      this.state.modalView !== 'deleteConfirmation' && (
                        <ActionModal
                          user={this.props.user}
                          building={this.props.building}
                          onClose={this.handleCloseActionModal}
                          onOpenProject={this.handleOpenProject}
                          action={this.state.currentAction}
                          modalView={this.state.modalView}
                          projectModalProps={projectProps}
                        />
                      )}
                    {this.state.modalOpen &&
                      this.state.modalView === 'deleteConfirmation' && (
                        <DeleteConfirmationModal
                          title={this.state.currentAction.name}
                          confirmationFunction={() =>
                            this.handleDeleteAction(
                              this.state.currentAction,
                              deleteAction
                            )
                          }
                          onClose={this.handleCloseActionModal}
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

export default ActionsView
