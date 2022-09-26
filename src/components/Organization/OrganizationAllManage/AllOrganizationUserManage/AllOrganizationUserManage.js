/* eslint-disable eqeqeq */
/* eslint-disable react/prop-types */
import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { connect } from 'react-redux'
import classNames from 'classnames'
import _ from 'lodash'

import ToolTip from 'components/ToolTip'
import { truncateText, formatFeatureFlagName } from 'utils/Utils'
import { Loader } from 'utils/Loader'
import UserFeature from 'utils/Feature/UserFeature'

import {
  getAllOrganizations,
  getAllOrganizationUsers,
  updateUser,
  inviteNewUser,
  removeUser,
  removeOrganizationUser
} from 'routes/Organization/modules/organization'

import {
  getFeatureFlagList,
  updateUserFeatureFlag
} from 'routes/FeatureFlags/modules/featureFlags'

import UserUpdateModal from './UserUpdateModal'
import { NewUserModal } from './NewUserModal'
import UserRemoveErrorModal from './UserRemoveErrorModal'

import styles from './AllOrganizationUserManage.scss'
import DeleteConfirmationModal from 'containers/Modal/DeleteConfirmationModal'

const featureFlagOrder = [
  'buildingOverview',
  'buildingUtilities',
  'buildingOperations',
  'buildingAssets',
  'buildingSystem',
  'buildingConstruction',
  // 'buildingStreem',
  // 'buildingActions',
  'buildingProjects',
  'projectProposal',
  'projectProject',
  'reportDocuments',
  'reportSpreadsheets',
  'portfolio',
  'team',
  'nycExport',
  'docuSign'
  // 'library'
]

const defaultLockFeatures = ['nycExport', 'docuSign']

export const AllOrganizationUserManage = props => {
  const { organizationId } = props
  const [organizationList, setOrganizationList] = useState()
  const [isLoading, setIsLoading] = useState(false)
  const [userList, setUserList] = useState([])
  const [isUpdating, setIsUpdating] = useState(false)
  const [originalUserList, setOriginalUserList] = useState([])
  const [modalMode, setModalMode] = useState('null')
  const [selectedUser, setSelectedUser] = useState(null)
  const [sort, setSort] = useState({
    key: 'name',
    direction: 'ASC'
  })

  const handleOpenNewUser = () => {
    setModalMode('NEW_USER')
    setSelectedUser(null)
  }

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const organizations = await props.getAllOrganizations()
      const users = await props.getAllOrganizationUsers(organizationId)
      setOrganizationList(organizations)
      setUserList(users)
      setOriginalUserList(users)
    } catch (error) {
      console.log('error', error)
      setOrganizationList([])
      setUserList([])
      setOriginalUserList([])
    } finally {
      setIsLoading(false)
    }
  }

  const fetchFeatureList = () => {
    props.getFeatureFlagList(organizationId)
  }

  useEffect(() => {
    fetchFeatureList()
    fetchData()
  }, [])

  const toggleSort = key => {
    setSort(prevState => ({
      key,
      direction:
        key === prevState.key
          ? prevState.direction === 'ASC'
            ? 'DESC'
            : 'ASC'
          : 'ASC'
    }))
  }

  const sortedFeatureFlagList = useMemo(() => {
    return [...props.featureFlagList]
      .sort((itemA, itemB) => {
        let valueA = featureFlagOrder.indexOf(itemA.name)
        let valueB = featureFlagOrder.indexOf(itemB.name)
        if (valueA === -1) valueA = 10000
        if (valueB === -1) valueB = 10000
        if (valueA == valueB) {
          valueA = itemA.name
          valueB = itemB.name
          if (valueA === valueB) return 0
          return valueA.toLowerCase() > valueB.toLowerCase()
            ? -1
            : valueB.toLowerCase() > valueA.toLowerCase()
            ? 1
            : 0
        }
        return valueA - valueB
      })
      .filter(item => {
        let value = featureFlagOrder.indexOf(item.name)
        return value !== -1
      })
  }, [props.featureFlagList])

  const sortedUserList = useMemo(() => {
    const list = [...originalUserList].sort((itemA, itemB) => {
      if (sort.direction === 'ASC') {
        if (sort.key === 'name') {
          const valueA = itemA.name
          const valueB = itemB.name
          if (valueA === valueB) return 0
          return valueA.toLowerCase() < valueB.toLowerCase()
            ? -1
            : valueB.toLowerCase() < valueA.toLowerCase()
            ? 1
            : 0
        } else if (sort.key === 'email') {
          const valueA = itemA.email
          const valueB = itemB.email
          if (valueA === valueB) return 0
          return valueA.toLowerCase() < valueB.toLowerCase()
            ? -1
            : valueB.toLowerCase() < valueA.toLowerCase()
            ? 1
            : 0
        } else if (sort.key === 'created') {
          const valueA = itemA.created
          const valueB = itemB.created
          if (valueA === valueB) return 0
          return valueA < valueB ? -1 : valueB < valueA ? 1 : 0
        } else if (sort.key === 'organizationCount') {
          const valueA = itemA.organizationCount || 0
          const valueB = itemB.organizationCount || 0
          if (valueA === valueB) return 0
          return valueA < valueB ? -1 : valueB < valueA ? 1 : 0
        }
      } else {
        if (sort.key === 'name') {
          const valueA = itemA.name
          const valueB = itemB.name
          if (valueA === valueB) return 0
          return valueA.toLowerCase() > valueB.toLowerCase()
            ? -1
            : valueB.toLowerCase() > valueA.toLowerCase()
            ? 1
            : 0
        } else if (sort.key === 'email') {
          const valueA = itemA.email
          const valueB = itemB.email
          if (valueA === valueB) return 0
          return valueA.toLowerCase() > valueB.toLowerCase()
            ? -1
            : valueB.toLowerCase() > valueA.toLowerCase()
            ? 1
            : 0
        } else if (sort.key === 'created') {
          const valueA = itemA.created
          const valueB = itemB.created
          if (valueA === valueB) return 0
          return valueA > valueB ? -1 : valueB > valueA ? 1 : 0
        } else if (sort.key === 'organizationCount') {
          const valueA = itemA.organizationCount || 0
          const valueB = itemB.organizationCount || 0
          if (valueA === valueB) return 0
          return valueA > valueB ? -1 : valueB > valueA ? 1 : 0
        }
      }
    })
    return list
      .map(item => {
        const user = userList.find(userItem => userItem._id === item._id)
        return user
      })
      .filter(item => !!item)
  }, [originalUserList, sort, userList])

  const checkIsAdmin = useCallback(
    userId => {
      const currentUserId = userId || props.user._id
      if (organizationId === 'all') return true
      const filertedOrganization = organizationList.find(
        org => org._id === organizationId
      )
      if (!filertedOrganization) return false
      return filertedOrganization.roles[currentUserId] === 'admin'
    },
    [props.user._id, organizationList, organizationId]
  )

  const checkIsOwner = useCallback(
    userId => {
      const currentUserId = userId || props.user._id
      if (organizationId === 'all') return true
      const filertedOrganization = organizationList.find(
        org => org._id === organizationId
      )
      if (!filertedOrganization) return false
      return filertedOrganization.roles[currentUserId] === 'owner'
    },
    [props.user._id, organizationList, organizationId]
  )

  const checkChangedData = (origin, updated) => {
    let obj = {}
    for (let key in origin) {
      if (origin[key] !== updated[key]) obj[key] = true
    }
    return obj
  }

  const editUser = useCallback(
    (userId, targetKey, value) => {
      let itemList = []
      let originalUser = originalUserList.find(user => user._id === userId)
      for (let user of userList) {
        if (user._id === userId) {
          const updatedData = {
            ...user,
            [targetKey]: value
          }
          const originalData = Object.assign({}, originalUser)
          delete originalData['changed']
          delete updatedData['changed']
          itemList.push({
            ...updatedData,
            changed: checkChangedData(originalData, updatedData)
          })
        } else {
          itemList.push(user)
        }
      }
      setUserList(itemList)
    },
    [originalUserList, checkChangedData]
  )

  const fetchUserList = async () => {
    setIsLoading(true)
    try {
      const users = await props.getAllOrganizationUsers(organizationId)
      setUserList(users)
    } catch (error) {
      console.log('error', error)
    }
    setIsLoading(false)
  }

  const handleUserSave = useCallback(
    async (user, key) => {
      const originData = originalUserList.find(
        userItem => userItem._id === user._id
      )
      const payload = {
        _id: originData._id,
        name: originData.name,
        email: originData.email,
        orgIds: originData.organizationList
      }
      if (key === 'organizationList') {
        payload.orgIds = user.organizationList || []
      } else {
        payload[key] = user[key]
      }

      const checkOriginalData = Object.assign({}, originData)
      checkOriginalData[key] = payload[key]
      const checkUpdatedData = Object.assign({}, user)
      delete checkOriginalData['changed']
      delete checkUpdatedData['changed']
      delete checkOriginalData['features']
      delete checkUpdatedData['features']
      const updatedData = {
        ...originData
      }
      if (key === 'organizationList') {
        updatedData.organizationList = payload.orgIds || []
      } else {
        updatedData[key] = payload[key]
      }

      setIsUpdating(true)
      props
        .updateUser(payload)
        .then(() => {
          setUserList(prevState => {
            let newItems = []
            for (let item of prevState) {
              if (item._id === user._id) {
                newItems.push({
                  ...updatedData,
                  changed: checkChangedData(checkOriginalData, checkUpdatedData)
                })
              } else newItems.push(item)
            }
            return newItems
          })
          setOriginalUserList(prevState => {
            let newItems = []
            for (let item of prevState) {
              if (item._id === user._id) {
                newItems.push(updatedData)
              } else newItems.push(item)
            }
            return newItems
          })
          setIsUpdating(false)
        })
        .catch(err => {
          console.log(err)
          setIsUpdating(false)
        })
    },
    [
      originalUserList,
      setIsUpdating,
      setOriginalUserList,
      props.updateUse,
      setUserList,
      setOriginalUserList
    ]
  )

  const checkIsOnlyOneOwner = useCallback(
    user => {
      if (props.organizationId === 'all') {
        return organizationList.some(currentOrg => {
          let userRoles = currentOrg.roles || {}
          let keys = []
          if (userRoles[user._id] !== 'owner') return false
          for (let key in userRoles) {
            if (userRoles[key] === 'owner') {
              keys.push(key)
            }
          }
          keys = keys.filter(item => item !== user._id)
          return keys.length === 0
        })
      } else {
        const currentOrg = organizationList.find(
          org => org._id === props.organizationId
        )
        if (!currentOrg) return false
        let userRoles = currentOrg.roles || {}
        if (userRoles[user._id] !== 'owner') return false
        let keys = []
        for (let key in userRoles) {
          if (userRoles[key] === 'owner') {
            keys.push(key)
          }
        }
        keys = keys.filter(item => item !== user._id)
        return keys.length === 0
      }
    },
    [props.organizationId, organizationList]
  )

  const handleRemoveUser = useCallback(
    async user => {
      props
        .removeUser(user._id, organizationId)
        .then(() => {
          fetchUserList()
          handleCloseUserDeleteConfirmation()
        })
        .catch(err => {
          console.log(err)
        })
    },
    [checkIsOnlyOneOwner, props.removeUser, fetchUserList]
  )

  const handleOpenUserDeleteConfirmation = user => {
    const isOnlyOneOwner = checkIsOnlyOneOwner(user)
    if (!isOnlyOneOwner) {
      setModalMode('DELETE_USER_CONFIRMATION')
      setSelectedUser(user)
    } else {
      setModalMode('USER_REMOVE_ERROR')
    }
  }

  const handleCloseUserDeleteConfirmation = () => {
    setModalMode(null)
    setSelectedUser(null)
  }

  const handleOpenUserModal = user => {
    setModalMode('UPDATE_USER')
    setSelectedUser(user)
  }

  const handleCloseModal = () => {
    setModalMode(null)
    setSelectedUser(null)
  }

  const handleUpdateFeatureFlag = useCallback(
    async (value, userId, featureId) => {
      setIsLoading(true)
      try {
        await props.updateUserFeatureFlag(userId, featureId, value)
        setIsLoading(false)
        const originData = originalUserList.find(
          userItem => userItem._id === userId
        )
        let newFeatureList = originData?.features || []
        newFeatureList = newFeatureList.filter(feature => feature !== featureId)
        if (value) {
          newFeatureList.push(featureId)
        }
        setUserList(prevState => {
          let newItems = []
          for (let item of prevState) {
            if (item._id === userId) {
              newItems.push({
                ...item,
                features: newFeatureList
              })
            } else newItems.push(item)
          }
          return newItems
        })
        setOriginalUserList(prevState => {
          let newItems = []
          for (let item of prevState) {
            if (item._id === userId) {
              newItems.push({
                ...item,
                features: newFeatureList
              })
            } else newItems.push(item)
          }
          return newItems
        })
      } catch (error) {
        console.log('error', error)
        setIsLoading(false)
      }
    },
    [
      props.updateUserFeatureFlag,
      setOriginalUserList,
      setIsLoading,
      setUserList,
      originalUserList
    ]
  )

  const tableBodyContent = useMemo(
    () => (
      <tbody>
        {sortedUserList.length > 0 &&
          sortedUserList.map(user => {
            const { email, organizationCount, name, created } = user
            const formatedDate = created
              ? new Date(created).toLocaleDateString('en-US')
              : '-'
            const isOwner = checkIsOwner()
            const isAdmin = checkIsAdmin()

            const canDoAdminActions =
              (isOwner || isAdmin) && user?._id !== props?.user?._id

            const canRemoverUser =
              !checkIsOnlyOneOwner(user) && canDoAdminActions

            let obj = {}
            const features = user.features || []
            features.forEach(feature => {
              obj[feature] = true
            })

            return (
              <tr key={user._id}>
                <td data-header='User Name'>
                  {canDoAdminActions ? (
                    <div className={styles.withCheckSave}>
                      <input
                        type='text'
                        value={name}
                        disabled={isUpdating}
                        onChange={e => {
                          editUser(user._id, 'name', e.target.value)
                        }}
                        required
                      />

                      {user.changed?.['name'] && name.length > 0 && (
                        <i
                          className={classNames(
                            'material-icons',
                            isUpdating ? styles.iconDisabled : ''
                          )}
                          onClick={() => handleUserSave(user, 'name')}
                        >
                          check
                        </i>
                      )}
                    </div>
                  ) : (
                    name
                  )}
                </td>
                <td data-header='Email Address'>
                  {canDoAdminActions ? (
                    <div className={styles.withCheckSave}>
                      <input
                        type='text'
                        value={email}
                        disabled={isUpdating}
                        onChange={e => {
                          editUser(user._id, 'email', e.target.value)
                        }}
                        required
                      />
                      {user.changed?.['email'] && email.length > 0 && (
                        <i
                          className={classNames(
                            'material-icons',
                            isUpdating ? styles.iconDisabled : ''
                          )}
                          onClick={() => handleUserSave(user, 'email')}
                        >
                          check
                        </i>
                      )}
                    </div>
                  ) : (
                    email
                  )}
                </td>
                <td data-header='Organization Count'>
                  <div>
                    <div
                      className={classNames(styles.linkButton, {
                        [styles.linkButtonDisabled]: !canDoAdminActions
                      })}
                      onClick={() => {
                        handleOpenUserModal(user)
                      }}
                    >
                      {organizationCount}
                    </div>
                    {user.changed?.['organizationList'] && (
                      <i
                        className={classNames(
                          'material-icons',
                          isUpdating ? styles.iconDisabled : ''
                        )}
                        onClick={() => handleUserSave(user, 'organizationList')}
                      >
                        check
                      </i>
                    )}
                  </div>
                </td>

                <td data-header='Updated'>{formatedDate}</td>

                {sortedFeatureFlagList.map(featureFlag => {
                  return (
                    <UserFeature name='payment' key={featureFlag._id}>
                      {({ enabled }) => {
                        let isLocked =
                          defaultLockFeatures.includes(featureFlag.name) &&
                          !enabled
                        let isChecked = !!obj[featureFlag._id]
                        if (featureFlag.name === 'team') {
                          const portfolioFeatureFlag = _.find(
                            sortedFeatureFlagList,
                            { name: 'portfolio' }
                          )
                          if (portfolioFeatureFlag) {
                            isLocked = !obj[portfolioFeatureFlag._id]
                          }
                        }
                        // if (
                        //   ['portfolio', 'team'].includes(featureFlag.name)
                        // ) {
                        //   isLocked = true
                        // } else if (
                        //   ['nycExport', 'docuSign'].includes(
                        //     featureFlag.name
                        //   )
                        // ) {
                        //   isChecked = false
                        // }

                        return (
                          <td key={featureFlag._id}>
                            <div
                              className={classNames(styles.checkboxContainer, {
                                [styles.disabledCheckBoxContainer]: isLocked
                              })}
                            >
                              <label>
                                <input
                                  checked={isChecked}
                                  onChange={e =>
                                    handleUpdateFeatureFlag(
                                      e.target.checked,
                                      user._id,
                                      featureFlag._id
                                    )
                                  }
                                  className={classNames(
                                    isChecked ? styles['checked'] : ''
                                  )}
                                  type='checkbox'
                                  disabled={isLocked}
                                />
                                <span />
                              </label>
                            </div>
                          </td>
                        )
                      }}
                    </UserFeature>
                  )
                })}

                <td
                  className={classNames(styles.tableRowRemoveItem)}
                  data-header='delete'
                >
                  <i
                    onClick={() => {
                      handleOpenUserDeleteConfirmation(user)
                    }}
                    className={classNames(
                      'material-icons',
                      canRemoverUser ? '' : styles.iconDisabled
                    )}
                  >
                    delete
                  </i>
                </td>
              </tr>
            )
          })}
        {sortedUserList.length === 0 && (
          <tr>
            <td className={styles.emptyList}>Sorry, no users to show.</td>
            <td colSpan={props.featureFlagList.length + 5} />
          </tr>
        )}
      </tbody>
    ),
    [
      sortedUserList,
      checkIsOwner,
      checkIsAdmin,
      props.user,
      editUser,
      handleUserSave,
      handleOpenUserModal,
      sortedFeatureFlagList,
      defaultLockFeatures,
      handleUpdateFeatureFlag,
      handleRemoveUser,
      checkIsOnlyOneOwner
    ]
  )

  return (
    <div>
      <div className={styles.header}>
        <h2>Users</h2>
        <div className={styles.headerAction}>
          <button
            className={classNames(styles.button, styles.buttonPrimary, {
              [styles.buttonDisable]: isLoading
            })}
            onClick={handleOpenNewUser}
            disabled={isLoading}
          >
            <i className='material-icons'>add</i> Add
          </button>
        </div>
      </div>

      <div className={styles.scrollTableContainer}>
        <table>
          <thead>
            <tr className={styles.firstRow}>
              <th className={styles.bold}>User Info</th>
              <th />
              <th />
              <th />
              {sortedFeatureFlagList.map((feature, index) => {
                if (index === 0) {
                  return (
                    <th
                      key={index}
                      colSpan={2}
                      className={classNames(styles.bold, styles.headerColumn)}
                    >
                      Products & Features
                    </th>
                  )
                }
                if (index < 2) return null
                return <th key={index} />
              })}
              <th />
            </tr>
            <tr
              className={classNames(
                sort.direction === 'ASC' ? styles.sortASC : ''
              )}
            >
              <th onClick={() => toggleSort('name')}>
                User&nbsp;
                {sort.key === 'name' ? (
                  <i className='material-icons'>arrow_downward</i>
                ) : (
                  ''
                )}
              </th>
              <th onClick={() => toggleSort('email')}>
                Email Address&nbsp;
                {sort.key === 'email' ? (
                  <i className='material-icons'>arrow_downward</i>
                ) : (
                  ''
                )}
              </th>
              <th onClick={() => toggleSort('organizationCount')}>
                Organizations&nbsp;
                {sort.key === 'organizationCount' ? (
                  <i className='material-icons'>arrow_downward</i>
                ) : (
                  ''
                )}
              </th>
              <th onClick={() => toggleSort('created')}>
                Created&nbsp;
                {sort.key === 'created' ? (
                  <i className='material-icons'>arrow_downward</i>
                ) : (
                  ''
                )}
              </th>

              {sortedFeatureFlagList.map(featureFlag => {
                let name = formatFeatureFlagName(featureFlag.name)
                let label = truncateText(name, 30)
                return (
                  <th key={featureFlag._id}>
                    {label !== name ? (
                      <ToolTip
                        content={
                          <span className={styles.whiteText}>{name}</span>
                        }
                        direction='right'
                      >
                        <div>{label}</div>
                      </ToolTip>
                    ) : (
                      label
                    )}
                  </th>
                )
              })}
              <th>Remove</th>
            </tr>
          </thead>
          {tableBodyContent}
        </table>
      </div>

      {isLoading && (
        <div className={styles.loader}>
          <Loader />
        </div>
      )}
      {modalMode === 'UPDATE_USER' && (
        <UserUpdateModal
          onClose={handleCloseModal}
          selectedUser={selectedUser}
          refetch={fetchUserList}
          organizationList={organizationList}
          currentOrganizationId={organizationId}
        />
      )}
      {modalMode === 'NEW_USER' && (
        <NewUserModal
          onClose={handleCloseModal}
          refetch={fetchUserList}
          organizationList={organizationList}
          inviteNewUser={props.inviteNewUser}
          user={props.user}
          featureFlagList={sortedFeatureFlagList}
        />
      )}
      {modalMode === 'USER_REMOVE_ERROR' && (
        <UserRemoveErrorModal onClose={handleCloseModal} />
      )}
      {modalMode === 'DELETE_USER_CONFIRMATION' && (
        <DeleteConfirmationModal
          title={selectedUser?.name}
          confirmationFunction={() => handleRemoveUser(selectedUser)}
          onClose={handleCloseUserDeleteConfirmation}
        />
      )}
    </div>
  )
}

const mapStateToProps = state => ({
  user: state.login.user || {},
  isFeatureListLoading: state.featureFlag?.loading || false,
  featureFlagList: state.featureFlag?.list || []
})

const mapDispatchToProps = {
  getAllOrganizations,
  getAllOrganizationUsers,
  updateUser,
  inviteNewUser,
  removeUser,
  removeOrganizationUser,
  getFeatureFlagList,
  updateUserFeatureFlag
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(AllOrganizationUserManage)
