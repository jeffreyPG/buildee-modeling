import React from 'react'
import PropTypes from 'prop-types'
import Tag from './Tag'
import styles from './TagList.scss'

const TagList = ({ values, getDisplayValue, onDelete }) => (
  <div className={styles.container}>
    {values.map((value, index) => (
      <Tag
        key={index}
        name={getDisplayValue(value)}
        onDelete={() => onDelete(value)}
      />
    ))}
  </div>
)

TagList.propTypes = {
  getDisplayValue: PropTypes.func.isRequired,
  values: PropTypes.arrayOf(PropTypes.object).isRequired,
  onDelete: PropTypes.func
}

export default TagList
