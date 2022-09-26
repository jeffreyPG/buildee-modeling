import React from 'react'
import PropTypes from 'prop-types'
import styles from './ManageUsers.scss'
import classNames from 'classnames'
import {
  validateEmail,
  checkInternalOrg,
  checkInternalUser,
  capitalizeFirstLetter,
  isDisabledUser
} from 'utils/Utils'
import { Loader } from 'utils/Loader'

export class ManageUsers extends React.Component {
  static propTypes = {
    currentUser: PropTypes.object.isRequired,
    organizationView: PropTypes.object.isRequired,
    getOrganizationUsers: PropTypes.func.isRequired,
    addOrganizationUser: PropTypes.func.isRequired,
    removeOrganizationUser: PropTypes.func.isRequired,
    updateOrganizationUser: PropTypes.func.isRequired,
    manageAllOrgSelected: PropTypes.bool.isRequired,
    organizationList: PropTypes.array.isRequired
  }

  state = {
    users: [],
    loading: false,
    error: '',
    emailLoading: false,
    email: '',
    disableEmailInvite: true,
    selectedUser: null
  }

  componentDidMount = () => {
    this.getUsers()
  }

  componentDidUpdate = prevProps => {
    if (prevProps.organizationView !== this.props.organizationView) {
      this.getUsers()
    }
  }

  getUsers = () => {
    if (
      (this.props.organizationView && this.props.organizationView._id) ||
      this.props.manageAllOrgSelected
    ) {
      this.setState({ loading: true })
      this.props
        .getOrganizationUsers()
        .then(users => {
          const userList = [...users].filter(user => {
            if (
              (checkInternalOrg(this.props.organizationView) &&
                checkInternalUser(user)) ||
              isDisabledUser(user)
            )
              return false
            return true
          })
          this.setState({
            loading: false,
            users: userList
          })
        })
        .catch(() => {
          this.setState({
            loading: false,
            error: 'Issues getting users. Please try again.'
          })
        })
    }
  }

  handleChangeUserRole = (e, userId) => {
    this.props
      .updateOrganizationUser(userId, e.target.value)
      .then(() => {})
      .catch(err => {})
  }

  handleToggleShowConfirmation = index => {
    let tempObj = [...this.state.users]
    tempObj.map(obj => {
      obj.showDeleteConfirmation = false
    })
    tempObj[index].showDeleteConfirmation = true
    this.setState({ items: tempObj })
  }

  handleToggleHideConfirmation = index => {
    let tempObj = [...this.state.users]
    tempObj[index].showDeleteConfirmation = false
    this.setState({ items: tempObj })
  }

  handleRemoveUser = (orgId, userId) => {
    this.props
      .removeOrganizationUser(orgId, userId)
      .then(() => {
        let tempObj = [...this.state.users]
        tempObj.map(obj => {
          obj.showDeleteConfirmation = false
        })
        this.setState({ items: tempObj })
      })
      .catch(err => {})
  }

  displayRoleChange = (user, currentUserRole) => {
    const { currentUser } = this.props
    // can't change roles of owner or yourself
    // also can't change roles of anyone if you're not an owner or admin
    if (
      userRole === 'owner' ||
      this.props.currentUser._id === user.id ||
      (currentUserRole !== 'owner' && currentUserRole !== 'admin')
    ) {
      return <div>{capitalizeFirstLetter(user.role)}</div>
    }
    // can change the role of someone else, if you're an owner or admin
    if (user.id !== currentUser._id) {
      return (
        <div className={styles.selectContainer}>
          <select
            value={user.role}
            onChange={e => this.handleChangeUserRole(e, user.id)}
          >
            <option value="admin">Admin</option>
            <option value="editor">Editor</option>
            <option value="user">User</option>
            <option value="guest">Guest</option>
          </select>
        </div>
      )
    }
    return
  }

  displayDeleteUser = (index, user, currentUserRole, selectedOrg = {}) => {
    const { currentUser } = this.props
    const userRole = user.role[selectedOrg._id]
    // if you are an owner or admin, leave an empty div
    if (
      currentUser._id === user.id &&
      (userRole === 'owner' || userRole === 'admin')
    ) {
      return (
        <div
          className={classNames(styles.tableRowItem, styles['delete-toggle'])}
        />
      )
    }

    // if you are an owner or admin, you can't delete the owner
    if (
      userRole === 'owner' &&
      (currentUserRole === 'owner' || currentUserRole === 'admin')
    ) {
      return (
        <div
          className={classNames(styles.tableRowItem, styles['delete-toggle'])}
        />
      )
    }

    // if you're not an owner or admin, remove empty space
    if (
      userRole !== 'owner' &&
      userRole !== 'admin' &&
      currentUser._id === user.id
    ) {
      return (
        <div
          className={classNames(styles.tableRowItem, styles['delete-toggle'])}
        />
      )
    }

    // can delete other users, if you are an owner or admin
    if (
      currentUser._id !== user.id &&
      (currentUserRole === 'owner' || currentUserRole === 'admin')
    ) {
      return (
        <div
          className={classNames(styles.tableRowItem, styles['delete-toggle'])}
        >
          <i
            onClick={() => this.handleToggleShowConfirmation(index)}
            className="material-icons"
          >
            delete
          </i>
          {this.state.users[index].showDeleteConfirmation && (
            <div className={styles['delete-option']}>
              <span>Are you sure?</span>
              <button
                className={classNames(styles.button, styles.buttonError)}
                onClick={() => this.handleRemoveUser(selectedOrg._id, user.id)}
              >
                Remove
              </button>
              <button
                className={classNames(styles.button, styles.buttonPrimary)}
                onClick={() => this.handleToggleHideConfirmation(index)}
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      )
    }
    return (
      <div
        className={classNames(styles.tableRowItem, styles['delete-toggle'])}
      />
    )
  }

  handleEmailChange = event => {
    // clear error, if any
    this.setState({ error: '' })

    if (validateEmail(event.target.value)) {
      let tempUserEmail = { ...this.state.email }
      tempUserEmail = event.target.value
      this.setState({
        email: tempUserEmail,
        disableEmailInvite: false
      })
    } else {
      this.setState({ disableEmailInvite: true })
    }
  }

  handleSubmitEmail = e => {
    e.preventDefault()
    this.setState({ emailLoading: true })
    const emailObj = { email: this.state.email }
    const emailExists = this.state.users.filter(
      obj => obj.email === this.state.email
    )

    if (emailExists && emailExists.length > 0) {
      this.setState({
        error:
          'A user with that email already exists in this organization. Please enter another email.',
        emailLoading: false
      })
      return
    }

    this.props
      .addOrganizationUser(emailObj, this.props.organizationView._id)
      .then(() => {
        this.setState({ emailLoading: false })
      })
      .catch(err => {
        this.setState({ emailLoading: false })
      })
  }

  onSelectOrganization = selectedUser => () => {
    this.setState({ selectedUser })
  }

  renderUserModal = () => {
    const { selectedUser } = this.state
    return (
      <div
        className={classNames(
          styles.modal,
          styles.templatesModal,
          styles['fade-in'],
          selectedUser ? styles.visible : ''
        )}
      >
        <div className={classNames(styles.modalOuter, styles.modalOuterSmall)}>
          <div className={styles.modalInner}>
            <div className={styles.templates}>
              <div className={styles.templatesHeading}>
                <h2>{`${selectedUser.name}'s Organizations`}</h2>
                <div
                  className={styles.modalClose}
                  onClick={this.onSelectOrganization()}
                >
                  <i className="material-icons">close</i>
                </div>
              </div>
              <div className={styles.templatesInner}>
                <div className={styles.table}>
                  <div className={styles.tableHeader}>
                    <div
                      className={classNames(
                        styles.tableRowItem,
                        styles.tableRowItem_4
                      )}
                    >
                      Organization
                    </div>
                    <div
                      className={classNames(
                        styles.tableRowItem,
                        styles.tableRowItem_2
                      )}
                    >
                      Role
                    </div>
                    <div
                      className={classNames(
                        styles.tableRowItem,
                        styles['delete-toggle']
                      )}
                    >
                      <span>Remove</span>
                    </div>
                  </div>
                  {this.props.organizationList.map((org, index) => {
                    if (!selectedUser.orgIds.includes(org._id)) {
                      return
                    }
                    return (
                      <div key={index} className={classNames(styles.tableRow)}>
                        <div
                          className={classNames(
                            styles.tableRowItem,
                            styles.tableRowItem_4
                          )}
                        >
                          {org.name}
                        </div>
                        <div
                          className={classNames(
                            styles.tableRowItem,
                            styles.tableRowItem_2
                          )}
                        >
                          {capitalizeFirstLetter(selectedUser.role[org._id])}
                        </div>
                        {this.displayDeleteUser(
                          index,
                          selectedUser,
                          selectedUser.role[org._id],
                          org
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  render() {
    const { currentUser, organizationView, manageAllOrgSelected } = this.props
    const { selectedUser } = this.state
    const currentUserInOrg =
      currentUser &&
      currentUser._id &&
      organizationView &&
      organizationView.users
        ? organizationView.users.find(obj => {
            return obj.userId.toString() === currentUser._id.toString()
          })
        : { userRole: 'user' }
    const currentUserRole = currentUserInOrg?.userRole || 'user'

    return (
      <div className={classNames(styles.users, styles.panelContent)}>
        <h1>Users</h1>

        {(currentUserRole === 'owner' || currentUserRole === 'admin') && (
          <div className={styles.usersAdd}>
            <h3>Invite a new user by email</h3>
            <div className={styles.usersEmail}>
              <form onSubmit={this.handleSubmitEmail.bind(this)}>
                <input
                  name="email"
                  type="email"
                  placeholder="Enter a valid email address"
                  onChange={this.handleEmailChange.bind(this)}
                />
                {!this.state.emailLoading && !this.state.disableEmailInvite && (
                  <button
                    type="submit"
                    className={classNames(styles.button, styles.buttonPrimary)}
                  >
                    Invite
                  </button>
                )}
                {this.state.emailLoading && (
                  <button
                    disabled
                    className={classNames(
                      styles.button,
                      styles.buttonPrimary,
                      styles['button--loading']
                    )}
                  >
                    <Loader size="button" color="white" />
                  </button>
                )}
                {this.state.disableEmailInvite && (
                  <button
                    disabled
                    className={classNames(
                      styles.button,
                      styles.buttonPrimary,
                      styles.buttonDisable
                    )}
                  >
                    Invite
                  </button>
                )}
              </form>
            </div>
            {this.state.error !== '' && (
              <p className={styles.error}>{this.state.error}</p>
            )}
          </div>
        )}

        {this.state.loading && <Loader />}

        {!this.state.loading && (
          <div className={styles.usersWrap}>
            {this.state.users && this.state.users.length > 0 && (
              <div className={styles.table}>
                <div className={styles.tableHeader}>
                  <div
                    className={classNames(
                      styles.tableRowItem,
                      styles.tableRowItem_2
                    )}
                  >
                    Name
                  </div>
                  <div
                    className={classNames(
                      styles.tableRowItem,
                      styles.tableRowItem_4
                    )}
                  >
                    Email
                  </div>
                  <div
                    className={classNames(
                      styles.tableRowItem,
                      styles.tableRowItem_2
                    )}
                  >
                    {manageAllOrgSelected ? 'Organization' : 'Role'}
                  </div>
                  {
                    <div
                      className={classNames(
                        styles.tableRowItem,
                        !manageAllOrgSelected && styles.tableRowItem_2
                      )}
                    >
                      Created
                    </div>
                  }
                  {(currentUserRole === 'owner' ||
                    currentUserRole === 'admin') &&
                    !manageAllOrgSelected && (
                      <div
                        className={classNames(
                          styles.tableRowItem,
                          styles['delete-toggle']
                        )}
                      >
                        <span>Remove</span>
                      </div>
                    )}
                </div>
                {this.state.users.map((user, index) => {
                  return (
                    <div
                      key={index}
                      className={classNames(
                        // currentUser._id === user.id ? styles.currentUser : '',
                        styles.tableRow
                      )}
                    >
                      <div
                        className={classNames(
                          styles.tableRowItem,
                          styles.tableRowItem_2
                        )}
                      >
                        {user.name}
                      </div>
                      <div
                        className={classNames(
                          styles.tableRowItem,
                          styles.tableRowItem_4
                        )}
                      >
                        {user.email}
                      </div>
                      {manageAllOrgSelected ? (
                        <div
                          className={classNames(
                            styles.tableRowItem,
                            styles.tableRowItem_2,
                            styles.highlightText
                          )}
                          onClick={this.onSelectOrganization(user)}
                        >
                          {user.orgIds?.length || 0}
                        </div>
                      ) : (
                        <div
                          className={classNames(
                            styles.tableRowItem,
                            styles.tableRowItem_2
                          )}
                        >
                          {capitalizeFirstLetter(
                            user.role[organizationView._id]
                          )}
                        </div>
                      )}
                      {
                        <div
                          className={classNames(
                            styles.tableRowItem,
                            !manageAllOrgSelected && styles.tableRowItem_2
                          )}
                        >
                          {new Date(user.created).toLocaleDateString('en-US')}
                        </div>
                      }
                      {!manageAllOrgSelected &&
                        this.displayDeleteUser(
                          index,
                          user,
                          currentUserRole,
                          organizationView
                        )}
                    </div>
                  )
                })}
              </div>
            )}
            {selectedUser && this.renderUserModal()}
          </div>
        )}
      </div>
    )
  }
}

export default ManageUsers
