import React, { Component } from 'react'

import styles from './ProjectAnalyzeModal.scss'

class ProjectAnalyzeModal extends Component {
  render() {
    return (
      <div className={styles.modal}>
        <div className={styles.modalInner}>
          <div className={styles.modalBody}>
            <h3>Analyzing your measure...</h3>
            <p>
              We are using your inputs and settings to calculate energy savings,
              GHG emissions savings, and a cashflow analysis.
            </p>
          </div>
        </div>
      </div>
    )
  }
}
export default ProjectAnalyzeModal
