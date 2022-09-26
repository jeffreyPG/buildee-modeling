import React from 'react'
import PropTypes from 'prop-types'
import styles from './LoggedOutLayout.scss'
import 'styles/main.scss'

export const LoggedOutLayout = ({ children }) => (
  <div className={styles['logged-out-layout']}>
    <div className={styles['logged-out-layout__viewport']}>{children}</div>
  </div>
)

LoggedOutLayout.propTypes = {
  children: PropTypes.element.isRequired
}

export default LoggedOutLayout
