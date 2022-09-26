import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router'

import classNames from 'classnames'
import styles from './Hire.scss'

export class Hire extends React.Component {
  static propTypes = {
    user: PropTypes.object.isRequired,

    push: PropTypes.func.isRequired
  }

  render() {
    const { user } = this.props
    return (
      <div className={styles.hire}>
        <div className={styles.container}>
          <h1>Hire and Expert</h1>
          <p>
            We're currently finding the perfect buildee expert for your project.
            We will email you at {user.email} within the next 24 hours.
          </p>
          <Link
            to="/building"
            className={classNames(styles.button, styles.buttonPrimary)}
          >
            Visit your buildings
          </Link>
        </div>
      </div>
    )
  }
}

export default Hire
