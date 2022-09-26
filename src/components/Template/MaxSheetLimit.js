import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import styles from './Template.scss'

export class MaxSheetLimit extends React.Component {
  static propTypes = {
    message: PropTypes.string.isRequired,
    onConfirm: PropTypes.func.isRequired,
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
            data-test="delete"
          >
            Ok
          </button>
          
        </div>
      </div>
    )
  }
}

export default MaxSheetLimit
