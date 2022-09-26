import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import styles from './ProjectSearch.scss'

const ProjectSearch = props => {
  const handleChange = event => {
    props.handleSearch(event.target.value)
  }

  return (
    <div className={styles.projectSearch}>
      <input
        type="search"
        placeholder={props.placeholder || 'Search for keywords'}
        value={props.searchValue}
        onChange={handleChange}
      />
      <i className="material-icons">search</i>
    </div>
  )
}

export default ProjectSearch
