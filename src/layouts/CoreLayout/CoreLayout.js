import React from 'react'
import PropTypes from 'prop-types'

import styles from './CoreLayout.scss'
import 'styles/main.scss'

export const CoreLayout = ({ children }) => (
  <div className={styles['core-layout']}>
    <div className={styles['core-layout__viewport']}>{children}</div>
  </div>
)

CoreLayout.propTypes = {
  children: PropTypes.element.isRequired
}

export default CoreLayout
