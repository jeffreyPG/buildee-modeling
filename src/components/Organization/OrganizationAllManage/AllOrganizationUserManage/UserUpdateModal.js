import React, { useState, useMemo, useEffect } from 'react'

import classNames from 'classnames'

import { connect } from 'react-redux'

import { Loader } from 'utils/Loader'
import BaseModal from 'components/BaseModal'

import { updateUser } from 'routes/Organization/modules/organization'
import { formatCamelCaseNotation } from 'utils/Utils'

import styles from './UserUpdateModal.scss'

import {
  removeOrganizationUser,
  updateSpecificOrganizationUser as updateOrganizationUser
} from 'routes/Organization/modules/organization'

export const UserUpdateModal = props => {
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { refetch, onClose, organizationList } = props
  const [selectedUser, setSelectedUser] = useState(props.selectedUser)
  const [newOrg, setNewOrg] = useState(null)
  const [newRole, setNewRole] = useState(null)

  useEffect(() => {
    setSelectedUser(selectedUser)
  }, [props.selectedUser])

  const handleAddOrganization = async () => {
    setIsLoading(true)
    try {
      const roles = { ...(selectedUser.roles || {}) }
      roles[newOrg] = newRole || 'editor'
      const payload = {
        ...selectedUser,
        orgIds: [...(selectedUser.organizationList || []), newOrg],
        roles
      }
      const updatedUser = await props.updateUser(payload)
      setSelectedUser(updatedUser)
      setIsLoading(false)
      onClose()
      refetch()
      setNewOrg(null)
      setNewRole(null)
    } catch (error) {
      console.log('error', error)
      setIsLoading(false)
    }
  }

  const handleChangeUserRole = async (e, orgId) => {
    setIsSubmitting(true)
    const value = e.target.value
    await props
      .updateOrganizationUser(orgId, selectedUser._id, value)
      .then(() => {
        const userRoles = Object.assign({}, selectedUser.roles || {})
        userRoles[orgId] = value
        setSelectedUser({
          ...selectedUser,
          roles: userRoles
        })
        setIsSubmitting(false)
        refetch()
      })
      .catch(err => {
        setIsSubmitting(false)
        console.log('err', err)
      })
  }

  const handleRemoveOrganization = async orgId => {
    try {
      setIsSubmitting(true)
      await props.removeOrganizationUser(orgId, selectedUser._id)
      setIsSubmitting(false)
      refetch()
    } catch (error) {
      console.log('error', errror)
      setIsSubmitting(false)
    }
  }

  const getCanDoAdminActions = organizationData => {
    const organizationRoles = (organizationData && organizationData.roles) || {}
    const organizationRole = organizationRoles[props.user._id] || 'editor'
    return organizationRole === 'admin' || organizationRole === 'owner'
  }

  const checkIsOnlyOneOwner = (currentOrg, user) => {
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

  const availableOrganizationList = useMemo(() => {
    const roles = selectedUser.roles || {}
    const keys = Object.keys(roles)
    return organizationList.filter(
      org => getCanDoAdminActions(org) && !keys.includes(org._id)
    )
  }, [organizationList, selectedUser])

  const oranizationKeys = Object.keys(selectedUser.roles || {})

  const header = <div>{selectedUser.name}'s Organizations</div>
  const body = isLoading ? (
    <div className={styles.loader}>
      <Loader />
    </div>
  ) : (
    <div className={styles.table}>
      <div className={styles.tableHeader}>
        <div className={classNames(styles.tableRowItem)}>Organization</div>
        <div className={classNames(styles.tableRowItem)}>Role</div>
        <div className={classNames(styles.tableRowItem)}>Remove</div>
      </div>
      {oranizationKeys.length &&
        oranizationKeys.map(orgId => {
          const userRole = (selectedUser.roles || {})[orgId] || 'editor'
          const organizationData = organizationList.find(
            org => org._id === orgId
          )
          const canDoAdminActions = getCanDoAdminActions(organizationData)
          if (!organizationData) return null
          const isOnlyOneOwner = checkIsOnlyOneOwner(
            organizationData,
            selectedUser
          )
          return (
            <div key={orgId} className={styles.tableRow}>
              <div
                className={classNames(styles.tableRowItem, styles.leftAlign)}
              >
                {organizationData?.name}
              </div>
              <div className={classNames(styles.tableRowItem)}>
                {!isOnlyOneOwner && canDoAdminActions ? (
                  <div className={styles.selectContainer}>
                    <select
                      value={userRole}
                      onChange={e => handleChangeUserRole(e, orgId)}
                    >
                      <option value='owner'>Owner</option>
                      <option value='admin'>Admin</option>
                      <option value='editor'>Editor</option>
                    </select>
                  </div>
                ) : (
                  <>{formatCamelCaseNotation(userRole)}</>
                )}
              </div>
              <div
                className={classNames(
                  styles.tableRowItem,
                  styles.tableRowRemoveItem
                )}
              >
                <i
                  onClick={() => handleRemoveOrganization(orgId)}
                  className={classNames('material-icons', {
                    [styles.iconDisabled]: isOnlyOneOwner || !canDoAdminActions
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

  const footer = (
    <div className={styles.newModalFooter}>
      <div className={styles.text}>Add to Organization(s)</div>
      <div className={styles.newModalFooterAction}>
        <div className={styles.newModalFooterActionLeft}>
          <div className={styles.selectContainer}>
            <select value={newOrg} onChange={e => setNewOrg(e.target.value)}>
              <option defaultValue value=''>
                Select organization(s)
              </option>
              {availableOrganizationList
                .filter(org => !org.isArchived)
                .map(org => (
                  <option value={org._id} key={org._id}>
                    {org.name}
                  </option>
                ))}
            </select>
          </div>
          {newOrg && (
            <div className={styles.selectContainer}>
              <select
                value={newRole}
                onChange={e => setNewRole(e.target.value)}
              >
                <option defaultValue value=''>
                  Select Role
                </option>
                <option value='owner'>Owner</option>
                <option value='admin'>Admin</option>
                <option value='editor'>Editor</option>
              </select>
            </div>
          )}
        </div>
        <div className={styles.newModalFooterActionRight}>
          <button
            type='button'
            className={classNames(styles.button, styles.buttonPrimary, {
              [styles.buttonDisable]:
                isLoading || isSubmitting || !newOrg || !newRole
            })}
            disabled={isLoading || isSubmitting || !newOrg || !newRole}
            onClick={handleAddOrganization}
          >
            <i className='material-icons'>add</i>
            Add
          </button>
        </div>
      </div>
    </div>
  )
  return (
    <div>
      <BaseModal
        onClose={onClose}
        header={header}
        body={body}
        footer={footer}
        className={styles}
      />
    </div>
  )
}

const mapStateToProps = state => ({
  user: state.login.user || {}
})

const mapDispatchToProps = {
  updateUser,
  removeOrganizationUser,
  updateOrganizationUser
}

export default connect(mapStateToProps, mapDispatchToProps)(UserUpdateModal)
