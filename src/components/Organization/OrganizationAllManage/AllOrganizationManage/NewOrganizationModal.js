import React, { useState } from 'react'

import classNames from 'classnames'

import BaseModal from 'components/BaseModal'

import styles from './NewOrganizationModal.scss'

const NewOrganizationModal = props => {
  const [newOrganizationName, setNewOrganizationName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      await props.createOrganization({
        name: newOrganizationName
      })
      setIsSubmitting(false)
    } catch (error) {
      console.log('error', error)
      setIsSubmitting(false)
    } finally {
      props.onClose()
    }
  }

  const header = <h2>Add Organization</h2>
  const body = (
    <input
      type="text"
      placeholder="Name"
      value={newOrganizationName}
      onChange={e => setNewOrganizationName(e.target.value)}
    />
  )

  const footer = (
    <div className={styles.modalFooterRight}>
      <button
        type="button"
        className={classNames(styles.button, styles.buttonPrimary, {
          [styles.buttonDisable]: !newOrganizationName || isSubmitting
        })}
        onClick={handleSubmit}
        disabled={!newOrganizationName || props.isSubmitting}
      >
        {props.isSubmitting ? <Loader size="button" color="white" /> : 'Add'}
      </button>
    </div>
  )
  return (
    <BaseModal
      onClose={props.onClose}
      header={header}
      body={body}
      footer={footer}
      className={styles}
    />
  )
}

export default NewOrganizationModal
