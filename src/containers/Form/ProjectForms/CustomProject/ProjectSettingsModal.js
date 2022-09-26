import React, { Component } from 'react'

import PropTypes from 'prop-types'

import { ProjectRates } from 'components/Project'
import styles from './ProjectSettingsModal.scss'

class ProjectSettingsModal extends Component {
  static propTypes = {
    rates: PropTypes.object.isRequired,
    onClose: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired
  }

  componentDidMount() {
    document.addEventListener('mousedown', this.handleClick, false)
  }

  componentWillUnmount() {
    document.removeEventListener('mousedown', this.handleClick, false)
  }

  handleClick = e => {
    if (this.node && this.node.contains(e.target)) {
      return
    }
    this.props.onClose()
  }

  render() {
    const { rates = {}, onClose, onSubmit } = this.props

    return (
      <div className={styles.modal}>
        <div className={styles.modalInner} ref={node => (this.node = node)}>
          <div className={styles.modalHeading}>
            <h2>Settings</h2>
            <div className={styles.modalClose} onClick={onClose}>
              <i className="material-icons">close</i>
            </div>
          </div>
          <div className={styles.modalBody}>
            <ProjectRates
              onRatesSubmit={onSubmit}
              initialValues={rates}
              handleHideForm={onClose}
            />
          </div>
        </div>
      </div>
    )
  }
}
export default ProjectSettingsModal
