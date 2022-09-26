import React, { Component } from 'react'
import styles from './PortfolioSyncPopup.scss'

class PortfolioSyncPopup extends Component {
  render() {
    return (
      <div className={styles.popup}>
        <b>We're compiling your data...</b>
        <br />
        <br />
        <span>Updates can take up to 15 minutes.</span>
      </div>
    )
  }
}
export default PortfolioSyncPopup
