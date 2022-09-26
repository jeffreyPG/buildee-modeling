import React from 'react'
import PropTypes from 'prop-types'
import styles from './Header.scss'

export const Header = ({ children, text, description }) => (
  <div className={styles.wrapper}>
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.title}>
          <h3>{text}</h3>
          <p className={styles.description}>{description}</p>
        </div>
        <div className={styles.content}>{children}</div>
      </div>
    </div>
  </div>
)

Header.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node
  ]).isRequired,
  text: PropTypes.string,
  description: PropTypes.string
}
