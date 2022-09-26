/* eslint-disable react/prop-types */
import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { connect } from 'react-redux'
import classNames from 'classnames'

import { Loader } from 'utils/Loader'

import {
  getOrganizations,
  updateOrganization,
  archiveOrganization,
  createOrganization
} from 'routes/Organization/modules/organization'

import DropdownCheckbox from 'components/DropdownCheckbox'

import NewOrganizationModal from './NewOrganizationModal'
import AddOrganizationUserModal from './AddOrganizationUser'

import styles from './AllOrganizationManagement.scss'
import DeleteConfirmationModal from 'containers/Modal/DeleteConfirmationModal'

const AllOrganizationManagement = props => {
  const [isLoading, setIsLoading] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [organizationList, setOrganizationlist] = useState([])
  const [originalOrganizationList, setOriginalOrganizationlist] = useState([])
  const [allOrganizationList, setAllOrganizationList] = useState([])
  const [modalMode, setModalMode] = useState(null)
  const [selectedOrganization, setSelectedOrganization] = useState(null)
  const [sort, setSort] = useState({
    key: 'name',
    direction: 'ASC'
  })

  const handleOpenNewOrganization = () => {
    setModalMode('NEW')
    setSelectedOrganization(null)
  }

  const fetchOrganizationList = async () => {
    setIsLoading(true)
    try {
      const allList = await props.getOrganizations('all', true)
      setAllOrganizationList(
        allList.filter(organization => {
          const userRole = getUserRole(organization)
          return userRole === 'owner' || userRole === 'admin'
        })
      )
      const result = allList.filter(item => {
        if (props.organizationId === 'all') return true
        return item._id === props.organizationId
      })
      setOrganizationlist(
        result.map(item => ({
          ...item,
          changed: {}
        }))
      )
      setOriginalOrganizationlist(
        result.map(item => ({
          ...item,
          changed: {}
        }))
      )
    } catch (error) {
      console.log('error', error)
      setOrganizationlist([])
      setOriginalOrganizationlist([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchOrganizationList()
  }, [props.organizationId])

  const sortedOrganizationList = useMemo(() => {
    const list = [...originalOrganizationList].sort((itemA, itemB) => {
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
        } else if (sort.key === 'created') {
          const valueA = itemA.created
          const valueB = itemB.created
          if (valueA === valueB) return 0
          return valueA < valueB ? -1 : valueB < valueA ? 1 : 0
        } else if (sort.key === 'userCount') {
          const valueA = itemA.userCount || 0
          const valueB = itemB.userCount || 0
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
        } else if (sort.key === 'created') {
          const valueA = itemA.created
          const valueB = itemB.created
          if (valueA === valueB) return 0
          return valueA > valueB ? -1 : valueB > valueA ? 1 : 0
        } else if (sort.key === 'userCount') {
          const valueA = itemA.userCount || 0
          const valueB = itemB.userCount || 0
          if (valueA === valueB) return 0
          return valueA > valueB ? -1 : valueB > valueA ? 1 : 0
        }
      }
    })
    return list
      .map(item => {
        const org = organizationList.find(orgItem => orgItem._id === item._id)
        return org
      })
      .filter(item => !!item)
  }, [originalOrganizationList, organizationList, sort])

  const checkChangedData = (origin, updated) => {
    let obj = {}
    for (let key in origin) {
      if (origin[key] !== updated[key]) obj[key] = true
    }
    return obj
  }

  const editOrganization = (organizationId, targetKey, value) => {
    let itemList = []
    let originalOrganization = originalOrganizationList.find(
      org => org._id === organizationId
    )
    for (let org of organizationList) {
      if (org._id === organizationId) {
        const updatedData = {
          ...org,
          [targetKey]:
            value && value.length && value.length > 0 ? value : [organizationId]
        }
        const originalData = Object.assign({}, originalOrganization)
        delete originalData['changed']
        delete updatedData['changed']
        itemList.push({
          ...updatedData,
          changed: checkChangedData(originalData, updatedData)
        })
      } else {
        itemList.push(org)
      }
    }
    setOrganizationlist(itemList)
  }

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

  const handleOrganizationSave = async (organization, key) => {
    const originData = originalOrganizationList.find(
      org => org._id === organization._id
    )
    const payload = {
      name: originData.name,
      sharedMeasureOrgs: originData.sharedMeasureOrgs || [],
      sharedTemplateOrgs: originData.sharedTemplateOrgs || [],
      users: originData.users || []
    }

    payload[key] = key !== 'name' ? organization[key] || [] : organization[key]

    const checkOriginalData = Object.assign({}, originData)
    checkOriginalData[key] = payload[key]
    const checkUpdatedData = Object.assign({}, organization)
    delete checkOriginalData['changed']
    delete checkUpdatedData['changed']

    const updatedData = {
      ...originData,
      [key]: payload[key]
    }

    setIsUpdating(true)

    props
      .updateOrganization(organization._id, payload)
      .then(() => {
        setOrganizationlist(prevState => {
          let newItems = []
          for (let item of prevState) {
            if (item._id === organization._id) {
              newItems.push({
                ...updatedData,
                changed: checkChangedData(checkOriginalData, checkUpdatedData)
              })
            } else newItems.push(item)
          }
          return newItems
        })
        setOriginalOrganizationlist(prevState => {
          let newItems = []
          for (let item of prevState) {
            if (item._id === organization._id) {
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
  }

  const handleRemoveOrganization = async id => {
    props
      .archiveOrganization(id)
      .then(() => {
        fetchOrganizationList()
        handleCloseOrgDeleteConfirmation()
      })
      .catch(err => console.log('err', err))
  }

  const handleOpenOrgDeleteConfirmation = organization => {
    setModalMode('DELETE_ORG_CONFIRMATION')
    setSelectedOrganization(organization)
  }

  const handleCloseOrgDeleteConfirmation = () => {
    setModalMode(null)
    setSelectedOrganization(null)
  }

  const getLabelFromOrgs = values =>
    organizationList
      .filter(({ _id, name }) => values.includes(_id))
      .map(({ name }) => name)
      .join(', ') || ''

  const getUserRole = useCallback(
    organization => {
      const users = (organization && organization.users) || []
      const userItem = users.find(user => user.userId === props.user._id)
      return userItem?.userRole || 'editor'
    },
    [props.user._id]
  )

  const handleOpenUserModal = useCallback(
    organization => {
      setModalMode('USER')
      setSelectedOrganization(organization)
    },
    [setModalMode, setSelectedOrganization]
  )

  const renderUserManamgent = () => {
    if (!selectedOrganization) return
    const userRole = getUserRole(selectedOrganization)
    const isOwner = userRole === 'owner'
    const isAdmin = userRole === 'admin'
    const onClose = () => {
      setModalMode(null)
      setSelectedOrganization(null)
    }

    return (
      <AddOrganizationUserModal
        isAdmin={isAdmin}
        isOwner={isOwner}
        organization={selectedOrganization}
        onClose={onClose}
        refresh={fetchOrganizationList}
      />
    )
  }

  const tableHeader = useMemo(
    () => (
      <div
        className={classNames(
          styles.tableHeader,
          sort.direction === 'ASC'
            ? styles.tableHeaderSortASC
            : styles.tableHeaderSortDESC
        )}
      >
        <div
          className={classNames(styles.tableRowItem)}
          onClick={() => toggleSort('name')}
        >
          Organization&nbsp;
          {sort.key === 'name' ? (
            <i className='material-icons'>arrow_downward</i>
          ) : (
            ''
          )}
        </div>
        <div className={classNames(styles.tableRowItem)}>My Libraries From</div>
        <div className={classNames(styles.tableRowItem)}>
          Report Templates From
        </div>
        <div
          className={classNames(styles.tableRowItem)}
          onClick={() => toggleSort('userCount')}
        >
          Users&nbsp;
          {sort.key === 'userCount' ? (
            <i className='material-icons'>arrow_downward</i>
          ) : (
            ''
          )}
        </div>
        <div
          className={classNames(styles.tableRowItem)}
          onClick={() => toggleSort('created')}
        >
          Created&nbsp;
          {sort.key === 'created' ? (
            <i className='material-icons'>arrow_downward</i>
          ) : (
            ''
          )}
        </div>
        <div className={classNames(styles.tableRowItem)}>Remove</div>
      </div>
    ),
    [toggleSort, sort]
  )

  const tableBody = useMemo(
    () => (
      <>
        {sortedOrganizationList.map(organization => {
          var date = organization.created
          var formatedDate = new Date(date).toLocaleDateString('en-US')
          const userCount = organization.userCount || '-'
          const sharedMeasureOrgs =
            organization.sharedMeasureOrgs &&
            organization.sharedMeasureOrgs.length > 0
              ? organization.sharedMeasureOrgs
              : [organization._id]
          const sharedTemplateOrgs =
            organization.sharedTemplateOrgs &&
            organization.sharedTemplateOrgs.length > 0
              ? organization.sharedTemplateOrgs
              : [organization._id]
          const sharedMeasureOrgsLabel = getLabelFromOrgs(sharedMeasureOrgs)
          const sharedTemplateOrgsLabel = getLabelFromOrgs(sharedTemplateOrgs)
          const userRole = getUserRole(organization)
          const isOwner = userRole === 'owner'
          const isAdmin = userRole === 'admin'
          return (
            <div key={organization._id} className={classNames(styles.tableRow)}>
              <div
                className={classNames(styles.tableRowItem)}
                data-header='Organization Name'
              >
                {isAdmin || isOwner ? (
                  <div className={styles.withCheckSave}>
                    <input
                      type='text'
                      disabled={isUpdating}
                      value={organization.name || ''}
                      onChange={e => {
                        editOrganization(
                          organization._id,
                          'name',
                          e.target.value
                        )
                      }}
                    />

                    {organization.changed?.['name'] && (
                      <i
                        className={classNames(
                          'material-icons',
                          isUpdating ? styles.iconDisabled : ''
                        )}
                        onClick={() =>
                          handleOrganizationSave(organization, 'name')
                        }
                      >
                        check
                      </i>
                    )}
                  </div>
                ) : (
                  <>{organization.name}</>
                )}
              </div>
              <div
                className={classNames(styles.tableRowItem)}
                data-header='Measure Organizations'
              >
                {isAdmin || isOwner ? (
                  <div className={styles.withCheckSave}>
                    <DropdownCheckbox
                      options={allOrganizationList
                        .map(org => ({
                          value: org._id,
                          label: org.name
                        }))
                        .sort((itemA, itemB) => {
                          const valueA = itemA.label
                          const valueB = itemB.label
                          return valueA.toLowerCase() < valueB.toLowerCase()
                            ? -1
                            : valueB.toLowerCase() < valueA.toLowerCase()
                            ? 1
                            : 0
                        })}
                      selectedValues={sharedMeasureOrgs}
                      handleSelect={values => {
                        editOrganization(
                          organization._id,
                          'sharedMeasureOrgs',
                          values
                        )
                      }}
                      truncatTextLength={15}
                    />

                    {organization.changed?.['sharedMeasureOrgs'] && (
                      <i
                        className={classNames(
                          'material-icons',
                          isUpdating ? styles.iconDisabled : ''
                        )}
                        onClick={() =>
                          handleOrganizationSave(
                            organization,
                            'sharedMeasureOrgs'
                          )
                        }
                      >
                        check
                      </i>
                    )}
                  </div>
                ) : (
                  <>{sharedMeasureOrgsLabel}</>
                )}
              </div>
              <div
                className={classNames(styles.tableRowItem)}
                data-header='Roles'
              >
                {isAdmin || isOwner ? (
                  <div className={styles.withCheckSave}>
                    <DropdownCheckbox
                      options={allOrganizationList.map(org => ({
                        value: org._id,
                        label: org.name
                      }))}
                      selectedValues={sharedTemplateOrgs}
                      handleSelect={values =>
                        editOrganization(
                          organization._id,
                          'sharedTemplateOrgs',
                          values
                        )
                      }
                      truncatTextLength={15}
                    />

                    {organization.changed?.['sharedTemplateOrgs'] && (
                      <i
                        className={classNames(
                          'material-icons',
                          isUpdating ? styles.iconDisabled : ''
                        )}
                        onClick={() =>
                          handleOrganizationSave(
                            organization,
                            'sharedTemplateOrgs'
                          )
                        }
                      >
                        check
                      </i>
                    )}
                  </div>
                ) : (
                  <>{sharedTemplateOrgsLabel}</>
                )}
              </div>

              <div
                className={classNames(styles.tableRowItem)}
                data-header='userCount'
              >
                <div
                  className={classNames(styles.linkButton, {
                    // [styles.linkButtonDisabled]: !(isAdmin || isOwner)
                  })}
                  onClick={() => {
                    handleOpenUserModal(organization)
                  }}
                >
                  {userCount}
                </div>
              </div>
              <div
                className={classNames(styles.tableRowItem)}
                data-header='Updated'
              >
                {formatedDate}
              </div>
              <div
                className={classNames(
                  styles.tableRowItem,
                  styles.tableRowRemoveItem
                )}
                data-header='delete'
              >
                <i
                  onClick={() => {
                    if (!isOwner || organization._id === props.organizationId) {
                      return
                    }
                    handleOpenOrgDeleteConfirmation(organization)
                  }}
                  className={classNames(
                    'material-icons',
                    isLoading ||
                      organization._id === props.organizationId ||
                      !isOwner
                      ? styles.iconDisabled
                      : ''
                  )}
                >
                  delete
                </i>
              </div>
            </div>
          )
        })}
      </>
    ),
    [
      sortedOrganizationList,
      getLabelFromOrgs,
      getUserRole,
      editOrganization,
      handleOrganizationSave,
      handleOpenUserModal,
      handleRemoveOrganization
    ]
  )

  return (
    <div className={styles.manage}>
      <div className={styles.header}>
        <h2>Organizations</h2>
        <div className={styles.headerAction}>
          <button
            className={classNames(styles.button, styles.buttonPrimary, {
              [styles.buttonDisable]: isLoading
            })}
            onClick={handleOpenNewOrganization}
            disabled={isLoading}
          >
            <i className='material-icons'>add</i> Add
          </button>
        </div>
      </div>
      <div className={classNames(styles.table)}>
        {tableHeader}
        {tableBody}
        {sortedOrganizationList.length === 0 && (
          <div className={styles.tableRow}>
            <div className={styles.tableRowItem}>
              Sorry, we didn't find any organizations.
            </div>
          </div>
        )}
      </div>
      {isLoading && (
        <div className={styles.loader}>
          <Loader />
        </div>
      )}
      {modalMode === 'USER' && renderUserManamgent()}
      {modalMode === 'NEW' && (
        <NewOrganizationModal
          onClose={() => setModalMode(null)}
          refetch={fetchOrganizationList}
          createOrganization={props.createOrganization}
        />
      )}
      {modalMode === 'DELETE_ORG_CONFIRMATION' && (
        <DeleteConfirmationModal
          title={selectedOrganization?.name}
          confirmationFunction={() =>
            handleRemoveOrganization(selectedOrganization._id)
          }
          onClose={handleCloseOrgDeleteConfirmation}
        />
      )}
    </div>
  )
}

const mapStateToProps = state => ({
  user: state.login.user || {},
  organizationList: state.organization.organizationList || []
})

const mapDispatchToProps = {
  getOrganizations,
  archiveOrganization,
  updateOrganization,
  createOrganization
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(AllOrganizationManagement)
