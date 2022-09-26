import React from 'react'
import PropTypes from 'prop-types'
import styles from './Tag.scss'

const Tag = ({ name, onDelete }) => (
  <div className={styles.tag}>
    <small>
      {name}
      <span onClick={() => onDelete(name)}>
        <i className="material-icons">close</i>
      </span>
    </small>
  </div>
)

Tag.propTypes = {
  name: PropTypes.string.isRequired,
  onDelete: PropTypes.func
}
export default Tag
