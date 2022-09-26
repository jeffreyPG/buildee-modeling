import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { Link } from 'react-router'

import styles from './NotFound.scss'

export class NotFound extends React.Component {
  static propTypes = {
    push: PropTypes.func.isRequired
  }

  handleGoHome = () => {
    this.props.push('/')
  }

  render() {
    return (
      <div className={styles['not-found']}>
        <div className={styles['not-found--wrapper']}>
          <h1>404</h1>
          <p>Page not found</p>
          <button
            onClick={this.handleGoHome}
            className={classNames(styles.button, styles.buttonPrimary)}
          >
            Go Home
          </button>
        </div>
      </div>
    )
  }
}

export default NotFound
