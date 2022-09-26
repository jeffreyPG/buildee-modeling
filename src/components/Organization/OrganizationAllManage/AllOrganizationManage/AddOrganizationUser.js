import React, { useState, useEffect, useMemo } from 'react'

import classNames from 'classnames'

import { connect } from 'react-redux'

import {
  checkInternalOrg,
  checkInternalUser,
  isDisabledUser
} from 'utils/Utils'

import { Loader } from 'utils/Loader'
import { formatUnderscoreNotation } from 'utils/Utils'

import BaseModal from 'components/BaseModal'

import {
  removeOrganizationUser,
  addOrganizationExistingUser,
  getSpecficOrganizationUsers as getOrganizationUsers,
  getAllOrganizationUsers,
  updateSpecificOrganizationUser as updateOrganizationUser
} from 'routes/Organization/modules/organization'

import styles from './AddOrganizationUser.scss'
import newUserStyles from './NewUser.scss'
import DeleteConfirmationModal from 'containers/Modal/DeleteConfirmationModal'

export const AddOrganizationUserModal = props => {
  const [isLoading, setIsLoading] = useState(true)
  const [isAllLoading, setIsAllLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [organizationUsers, setOrganizationUsers] = useState([])
  const [hiddenUsers, setHiddenUsers] = useState([])
  const [allUsers, setAllUsers] = useState([])
  const [email, setEmail] = useState('')
  const [showUserList, setShowUserList] = useState(false)
  const [newUser, setNewUser] = useState({
    id: '',
    role: null
  })
  const [mode, setMode] = useState('MANAGE_USER')
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const { organization, isAdmin, isOwner, onClose, refresh } = props

  const fetchAllUsers = async () => {
    try {
      setIsAllLoading(true)
      const allUserList = await props.getAllOrganizationUsers('all')
      setAllUsers(allUserList)
    } catch (error) {
      console.log('error', error)
    } finally {
      setIsAllLoading(false)
    }
  }

  const fetchData = async (disableFetchAll = false) => {
    setIsLoading(true)
    try {
      if (disableFetchAll) {
        fetchAllUsers()
      }
      const orgUsers = await props.getOrganizationUsers(organization._id)
      const userList = [...orgUsers].filter(user => {
        if (user._id === props.user._id) return true
        if (
          (checkInternalOrg(organization) && checkInternalUser(user)) ||
          isDisabledUser(user)
        )
          return false
        return true
      })
      const otherUserList = [...orgUsers].filter(user => {
        if (user._id === props.user._id) return false
        if (
          (checkInternalOrg(organization) && checkInternalUser(user)) ||
          isDisabledUser(user)
        )
          return true
        return false
      })
      setOrganizationUsers(userList)
      setHiddenUsers(otherUserList)
    } catch (error) {
    } finally {
      setIsLoading(false)
    }
  }

  const availableUsers = useMemo(() => {
    const ids = [...hiddenUsers, ...organizationUsers].map(user => user.id)
    return allUsers.filter(
      user =>
        !ids.includes(user._id) &&
        !isDisabledUser(user) &&
        !(checkInternalOrg(organization) && checkInternalUser(user))
    )
  }, [hiddenUsers, organizationUsers, allUsers])

  useEffect(() => {
    fetchData(true)
  }, [organization])

  useEffect(() => {
    fetchAllUsers()
  }, [])

  const handleRemoveUser = async id => {
    try {
      setIsSubmitting(true)
      await props.removeOrganizationUser(organization._id, id)
      setIsSubmitting(false)
      handleCloseUserDeleteConfirmation()
      fetchData(false)
      refresh()
    } catch (error) {
      setIsSubmitting(false)
    }
  }

  const handleOpenUserDeleteConfirmation = user => {
    setShowDeleteConfirmation(true)
    setSelectedUser(user)
  }

  const handleCloseUserDeleteConfirmation = () => {
    setShowDeleteConfirmation(false)
    setSelectedUser(null)
  }

  const handleOpenAddNew = () => {
    setMode('ADD_USER')
    setNewUser({
      id: '',
      role: 'editor'
    })
  }

  const getUserRole = (organization, userId) => {
    const users = organizationUsers || []
    const userItem = users.find(user => user.id === userId)
    return userItem?.role?.[organization._id] || 'editor'
  }

  const handleChangeUserRole = async (e, userId) => {
    setIsSubmitting(true)
    await props
      .updateOrganizationUser(organization._id, userId, e.target.value)
      .then(() => {
        setIsSubmitting(false)
        fetchData(true)
        refresh()
      })
      .catch(err => {
        setIsSubmitting(false)
        console.log('err', err)
      })
  }

  const handleSubmitNewUser = async () => {
    setIsSubmitting(true)
    try {
      await props.addOrganizationExistingUser(newUser, organization._id)
    } catch (error) {
      console.log('error', error)
    } finally {
      setIsSubmitting(false)
      setNewUser({
        id: '',
        role: 'editor'
      })
      setMode('MANAGE_USER')
      refresh()
      onClose()
    }
  }

  const checkIsOnlyOneOwner = user => {
    const currentOrg = Object.assign({}, organization)
    let roles = currentOrg.users || []
    const userRoles = {}
    for (let role of roles) {
      userRoles[role.userId] = role.userRole
    }
    if (userRoles[user.id] !== 'owner') return false
    let keys = []
    for (let key in userRoles) {
      if (userRoles[key] === 'owner') {
        keys.push(key)
      }
    }
    keys = keys.filter(item => item !== user.id)
    return keys.length === 0
  }

  const renderInitialStep = () => {
    const { name = '' } = organization || {}
    const users = [...organizationUsers]
    const header = <div>{name} Users</div>

    const body =
      isLoading || isAllLoading ? (
        <div className={styles.loader}>
          <Loader />
        </div>
      ) : (
        <div className={styles.table}>
          <div className={styles.tableHeader}>
            <div className={classNames(styles.tableRowItem)}>User</div>
            <div className={classNames(styles.tableRowItem)}>Role</div>
            <div className={classNames(styles.tableRowItem)}>Remove</div>
          </div>
          {users.length > 0 &&
            users.map(user => {
              const userRole = getUserRole(organization, user.id)
              const isOnlyOneOwner = checkIsOnlyOneOwner(user)
              return (
                <div key={user.id} className={styles.tableRow}>
                  <div
                    className={classNames(styles.tableRowItem, styles.textLeft)}
                  >
                    {user.name}
                  </div>
                  <div className={classNames(styles.tableRowItem)}>
                    {!isOnlyOneOwner &&
                    user.id !== props.user._id &&
                    (isOwner || isAdmin) ? (
                      <div className={styles.selectContainer}>
                        <select
                          value={userRole}
                          onChange={e => handleChangeUserRole(e, user.id)}
                        >
                          <option value='owner'>Owner</option>
                          <option value='admin'>Admin</option>
                          <option value='editor'>Editor</option>
                        </select>
                      </div>
                    ) : (
                      <>{formatUnderscoreNotation(userRole)}</>
                    )}
                  </div>
                  <div
                    className={classNames(
                      styles.tableRowItem,
                      styles.tableRowRemoveItem
                    )}
                  >
                    <i
                      onClick={() => handleOpenUserDeleteConfirmation(user)}
                      className={classNames('material-icons', {
                        [styles.iconDisabled]:
                          isOnlyOneOwner ||
                          !((isAdmin || isOwner) && user.id !== props.user._id)
                      })}
                    >
                      delete
                    </i>
                  </div>
                </div>
              )
            })}
        </div>
      )

    const footer =
      isOwner || isAdmin ? (
        <>
          <label>Add a user to this organization</label>
          <button
            type='button'
            className={classNames(styles.button, styles.buttonPrimary, {
              [styles.buttonDisable]: isLoading || isAllLoading || isSubmitting
            })}
            disabled={isLoading || isAllLoading || isSubmitting}
            onClick={handleOpenAddNew}
          >
            <i className='material-icons'>add</i> Add
          </button>
        </>
      ) : null

    return (
      <>
        <BaseModal
          onClose={onClose}
          header={header}
          body={body}
          footer={footer}
          className={styles}
        />
        {showDeleteConfirmation && renderDeleteUserConfirmation()}
      </>
    )
  }

  const handleChanageNewUser = (key, value) => {
    setNewUser(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const renderNewUser = () => {
    const users = [...availableUsers]
    const header = <div>New User</div>

    const filteredUsers = users.filter(
      user =>
        user.name &&
        (!email || user.email.toLowerCase().includes(email.toLowerCase()))
    )
    const filteredvailableUsers = availableUsers.filter(
      user =>
        user.name &&
        (!email || user.email.toLowerCase().includes(email.toLowerCase()))
    )

    const body = isAllLoading ? (
      <div className={styles.loader}>
        <Loader />
      </div>
    ) : (
      <div>
        <div className={newUserStyles.section}>
          <span>Select User</span>
          <div className={styles.inputField}>
            <input
              placeholder='Email Address'
              type='text'
              value={email}
              onChange={e => {
                const value = e.target.value
                if (!value) {
                  handleChanageNewUser('id', '')
                }
                setEmail(value)
                setShowUserList(true)
              }}
              onFocus={() => {
                setShowUserList(true)
              }}
            />
          </div>
          {showUserList && filteredUsers.length > 0 && (
            <div className={styles.userList}>
              {filteredUsers.map(user => (
                <div
                  key={user._id}
                  className={styles.userListItem}
                  onClick={event => {
                    event.preventDefault()
                    event.stopPropagation()
                    handleChanageNewUser('id', user._id)
                    setShowUserList(false)
                    setEmail(user.email)
                  }}
                >
                  {user.name} - {user.email}
                </div>
              ))}
            </div>
          )}

          {showUserList &&
            email &&
            filteredUsers.length == 0 &&
            filteredvailableUsers.length === 0 && (
              <div className={styles.notFound}>
                This user doesn’t exist in buildee. Add them in the Users tab.
              </div>
            )}

          {showUserList &&
            email &&
            filteredUsers.length === 0 &&
            filteredvailableUsers.length !== 0 && (
              <div className={styles.notFound}>
                This user is already existed to this organization.
              </div>
            )}
        </div>
        <div className={newUserStyles.section}>
          <span>Select Role</span>
          <div className={newUserStyles.selectContainer}>
            <select
              value={newUser.role}
              onChange={e => handleChanageNewUser('role', e.target.value)}
            >
              <option value='owner'>Owner</option>
              <option value='admin'>Admin</option>
              <option value='editor'>Editor</option>
            </select>
          </div>
        </div>
      </div>
    )

    const footer = (
      <div className={newUserStyles.modalFooterRight}>
        <button
          type='button'
          className={classNames(styles.button, styles.buttonPrimary, {
            [styles.buttonDisable]:
              isLoading || isAllLoading || isSubmitting || !newUser.id
          })}
          disabled={isLoading || isAllLoading || isSubmitting || !newUser.id}
          onClick={handleSubmitNewUser}
        >
          <div style={{ display: 'flex' }}>
            <i className='material-icons'>add</i>
            {isSubmitting ? <Loader size='button' color='white' /> : 'Add'}
          </div>
        </button>
      </div>
    )
    return (
      <BaseModal
        onClose={props.onClose}
        header={header}
        body={body}
        footer={footer}
        className={newUserStyles}
      />
    )
  }

  const renderDeleteUserConfirmation = () => {
    return (
      <DeleteConfirmationModal
        title={selectedUser?.name}
        confirmationFunction={() => handleRemoveUser(selectedUser.id)}
        onClose={handleCloseUserDeleteConfirmation}
        moveToTop={true}
      />
    )
  }

  if (mode === 'MANAGE_USER') return renderInitialStep()
  if (mode === 'ADD_USER') return renderNewUser()
  return <div>AddOrganizationUser</div>
}

const mapStateToProps = state => ({
  user: state.login.user || {}
})

const mapDispatchToProps = {
  removeOrganizationUser,
  getOrganizationUsers,
  addOrganizationExistingUser,
  getAllOrganizationUsers,
  updateOrganizationUser
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(AddOrganizationUserModal)
