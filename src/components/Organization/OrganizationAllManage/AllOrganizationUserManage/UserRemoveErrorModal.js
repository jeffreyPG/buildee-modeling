import React from 'react'

import BaseModal from 'components/BaseModal'

import styles from './UserRemoveErrorModal.scss'

export const UserRemoveErrorModal = props => {
  const header = <div>Unable to remove this user</div>
  const body = (
    <div className={styles.bodyText}>
      Owner users cannot remove themeselves if no other owners exist in this org
    </div>
  )
  return (
    <BaseModal
      onClose={props.onClose}
      header={header}
      body={body}
      footer={null}
      className={styles}
    />
  )
}

export default UserRemoveErrorModal
