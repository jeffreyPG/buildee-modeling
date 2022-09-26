import React, { Component } from 'react'
import styles from './DocuTemplateModal.scss'

class DocuEmailStatusModal extends Component {
  render() {
    const { title, bodyText } = this.props
    return (
      <div className={styles.modal}>
        <div className={styles.modalStatusEmailInner}>
          <div className={styles.modalHeading}>
            <h2>{title}</h2>
            <div className={styles.modalClose} onClick={this.props.onClose}>
              <i className="material-icons">close</i>
            </div>
          </div>
          <div className={styles.modalStatusBody}>{bodyText}</div>
        </div>
      </div>
    )
  }
}

export default DocuEmailStatusModal
