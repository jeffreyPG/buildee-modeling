import React from 'react'
import PropTypes from 'prop-types'
import styles from './Link.scss'

const Link = ({ onClick, title, className = '' }) => (
  <span
    className={`${styles.link} ${className}`}
    onClick={() => onClick && onClick()}
  >
    {title}
  </span>
)

Link.propTypes = {
  onClick: PropTypes.func,
  title: PropTypes.string.isRequired,
  className: PropTypes.string
}

export default Link
