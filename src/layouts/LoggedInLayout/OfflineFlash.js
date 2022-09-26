import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import styles from './OfflineFlash.scss'

export class OfflineFlash extends React.Component {
  state = {
    // Disable flash temp[BUIL-7442]
    flashStatus: 'hidden'
  }

  hideFlash = () => {
    this.setState({ flashStatus: 'hidden' })
  }

  render() {
    return (
      <div
        onClick={this.hideFlash}
        className={classNames(
          styles.flash,
          styles['flash--' + this.state.flashStatus]
        )}
      >
        <div
          className={classNames(styles['flash--warning'])}
          onClick={this.hideFlash}
        >
          <i className="material-icons">warning</i>
          You are currently offline. Limited functionality may exist.
        </div>
      </div>
    )
  }
}

export default OfflineFlash
