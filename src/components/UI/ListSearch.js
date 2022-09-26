import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import Categorization from 'components/Categorization'
import styles from './ListSearch.scss'

export class ListSearch extends React.Component {
  static propTypes = {
    sortKeys: PropTypes.object.isRequired,
    listData: PropTypes.array.isRequired,

    onSearch: PropTypes.func,
    onFilter: PropTypes.func,

    showSearch: PropTypes.bool,
    showFilters: PropTypes.bool,

    keyword: PropTypes.string,
    filters: PropTypes.object,
    hasCategorization: PropTypes.bool
  }

  static defaultProps = {
    showSearch: true,
    showFilters: false,
    hasCategorization: false
  }

  state = {
    keyword: this.props.keyword || '',
    filters: this.props.filters || {}
  }

  getUniqueValues = ({ listData, column }) =>
    listData.reduce((acc, e) => {
      const key = this.props.sortKeys[column]
      const value = e[key]

      if (!value && !(value === 0)) return acc
      return acc.add(value)
    }, new Set([]))

  handleSearch = ({ target: { value } }) => {
    this.setState({ keyword: value })
    this.props.onSearch(value)
  }

  handleFilter = ({ target: { value } }, filter) => {
    let filters = Object.assign({}, this.state.filters, { [filter]: value })
    this.setState({ filters })
    this.props.onFilter(filters)
  }

  handleFilterWithValue = (value, filter) => {
    let filters = Object.assign({}, this.state.filters, {
      [filter]: value || 'default'
    })
    if (filters[filter] !== this.state.filters[filter]) {
      if (filter === 'categories') {
        filters = Object.assign({}, filters, {
          applications: 'default',
          technologies: 'default'
        })
      } else if (filter === 'applications') {
        filters = Object.assign({}, filters, {
          technologies: 'default'
        })
      }
    }

    this.setState({ filters })
    this.props.onFilter(filters)
  }

  getKeyIsDisabled = searchKey => {
    const { filters } = this.state
    const { filtersOptions } = this.props
    const prevKeys = {
      applications: 'categories',
      technologies: 'applications'
    }
    const prevKey = prevKeys[searchKey]

    if (prevKey) {
      let value = filters[prevKey]
      if (!value || value === 'default') return true
      return false
    } else {
      let isOptionDisabled =
        filtersOptions &&
        filtersOptions[searchKey] &&
        filtersOptions[searchKey].isDisabled
      if (isOptionDisabled) return true
    }
    return false
  }

  render() {
    const { listData, hasCategorization } = this.props

    return (
      <div className={styles.ListExtras}>
        {this.props.showSearch && (
          <div className={styles.ListSearch}>
            <input
              placeholder='Search for keywords'
              type='search'
              onChange={this.handleSearch}
              value={this.state.keyword}
            />
            <i className='material-icons'>search</i>
          </div>
        )}
        {this.props.showFilters &&
          Object.keys(this.state.filters).map((filterKey, index) => {
            if (
              filterKey === 'categories' ||
              filterKey === 'applications' ||
              filterKey === 'technologies'
            )
              return null
            const filterValue = this.state.filters[filterKey]
            let values, title, filtersOptions
            let sortFunction = undefined
            const isDisabled = this.getKeyIsDisabled(filterKey)

            if (
              this.props.filtersOptions &&
              this.props.filtersOptions[filterKey]
            ) {
              filtersOptions = this.props.filtersOptions[filterKey]
              sortFunction = filtersOptions.sort
                ? filtersOptions.sort
                : undefined
              title = filtersOptions.title || filterKey
            } else {
              title = filterKey
            }
            if (listData[filterKey] && listData.length !== 0) {
              values = Array.from(listData[filterKey]).sort(sortFunction)
            } else {
              values = Array.from(
                this.getUniqueValues({ listData: listData, column: filterKey })
              ).sort(sortFunction)
            }

            return (
              <div
                key={index}
                className={classNames(
                  styles.selectContainer,
                  styles.ListFilter,
                  this.state.hideProjectFilters ? styles.hide : ''
                )}
              >
                <select
                  onChange={e => this.handleFilter(e, filterKey)}
                  value={filterValue}
                  disabled={isDisabled}
                  className={classNames({
                    [styles.disabled]: isDisabled
                  })}
                >
                  <option
                    disabled
                    value='default'
                    defaultValue={filterValue === 'default'}
                  >
                    {title.charAt(0).toUpperCase() + title.slice(1)}
                  </option>
                  <option value='all'>All {title}</option>
                  {values.map((value, index) => {
                    let valueText

                    if (filtersOptions) {
                      valueText = filtersOptions.template
                        ? filtersOptions.template(value)
                        : value
                      value = filtersOptions.getValue
                        ? filtersOptions.getValue(value)
                        : value
                    } else {
                      valueText = value
                    }
                    return (
                      <option
                        key={index}
                        defaultValue={filterValue === value}
                        value={value}
                      >
                        {valueText}
                      </option>
                    )
                  })}
                </select>
              </div>
            )
          })}
        {!!hasCategorization && (
          <Categorization
            category={this.props.filters.categories}
            application={this.props.filters.applications}
            technology={this.props.filters.technologies}
            handleCategory={value => {
              this.handleFilterWithValue(value, 'categories')
            }}
            handleApplication={value => {
              this.handleFilterWithValue(value, 'applications')
            }}
            handleTechnology={value => {
              this.handleFilterWithValue(value, 'technologies')
            }}
            target='equipment'
          />
        )}
      </div>
    )
  }
}

export default ListSearch
