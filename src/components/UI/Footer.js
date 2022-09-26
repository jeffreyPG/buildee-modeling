import React from 'react'
import PropTypes from 'prop-types'
import styles from './Footer.scss'

export const Footer = ({ children }) => (
  <div className={styles.footer}>
    <div className={styles.footerContainer}>{children}</div>
  </div>
)

Footer.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node
  ]).isRequired
}
