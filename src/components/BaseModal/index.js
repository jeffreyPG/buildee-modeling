import React from 'react'
import classNames from 'classnames'

import styles from './BaseModal.scss'

const BaseModal = props => {
  const { className } = props
  return (
    <div
      className={classNames(styles.modal, className ? className['modal'] : '')}
    >
      <div
        className={classNames(
          styles.modalInner,
          className ? className['modalInner'] : ''
        )}
      >
        <div
          className={classNames(
            styles.modalHeading,
            className ? className['modalHeading'] : ''
          )}
        >
          <div>{props.header}</div>
          <div
            className={classNames(
              styles.modalClose,
              className ? className['modalClose'] : ''
            )}
            onClick={props.onClose}
          >
            <i className="material-icons">close</i>
          </div>
        </div>
        <div
          className={classNames(
            styles.modalBody,
            className ? className['modalBody'] : ''
          )}
        >
          {props.body}
        </div>
        {props.footer && (
          <div
            className={classNames(
              styles.modalFooter,
              className ? className['modalFooter'] : ''
            )}
          >
            {props.footer}
          </div>
        )}
      </div>
    </div>
  )
}

export default BaseModal
