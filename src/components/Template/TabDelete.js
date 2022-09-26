import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import styles from './Template.scss'

export class TabDelete extends React.Component {
  static propTypes = {
    message: PropTypes.string.isRequired,
    onCancel: PropTypes.func.isRequired,
    onConfirm: PropTypes.func.isRequired,
    currentTab: PropTypes.object.isRequired
  }

  render() {
    const { currentTab } = this.props
    return (
      <div className={styles.templateMessage}>
        <div className={styles.templateMessageInner}>
          <h3>{this.props.message}</h3>
          <button
            onClick={() => {
              this.props.onConfirm(currentTab)
            }}
            className={classNames(styles.button, styles.buttonPrimary)}
            data-test="delete"
          >
            Yes
          </button>
          <button
            onClick={() => {
              this.props.onCancel()
            }}
            className={classNames(styles.button, styles.buttonSecondary)}
          >
            No
          </button>
        </div>
      </div>
    )
  }
}

export default TabDelete
