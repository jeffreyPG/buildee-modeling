import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import styles from './Template.scss'

export class TemplateMessage extends React.Component {
  static propTypes = {
    message: PropTypes.string.isRequired,
    onCancel: PropTypes.func.isRequired,
    onConfirm: PropTypes.func.isRequired
  }

  render() {
    return (
      <div className={styles.templateMessage}>
        <div className={styles.templateMessageInner}>
          <h3>{this.props.message}</h3>
          <button
            onClick={() => {
              this.props.onConfirm()
            }}
            className={classNames(styles.button, styles.buttonPrimary)}
          >
            Yes, leave this page.
          </button>
          <button
            onClick={() => {
              this.props.onCancel()
            }}
            className={classNames(styles.button, styles.buttonSecondary)}
          >
            No, stay on this page.
          </button>
        </div>
      </div>
    )
  }
}

export default TemplateMessage
