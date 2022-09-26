import React from 'react'
import { Query } from 'react-apollo'
import classNames from 'classnames'
import { Loader } from 'utils/Loader'
import Categorization from 'components/Categorization'

import styles from './SearchContext.scss'
import SortableList from './SortableList'

const formatDisplayValue = (value, type) => {
  let upperCaseValue = value.charAt(0).toUpperCase() + value.slice(1)
  switch (value) {
    case 'type':
      return type === 'plural' ? `${upperCaseValue}s` : upperCaseValue
    case 'category':
      return type === 'plural' ? 'Categories' : upperCaseValue
    case 'app':
      return type === 'plural' ? 'Applications' : 'Application'
    case 'tech':
      return type === 'plural' ? 'Technologies' : 'Technology'
    case 'fuel':
    case 'analysis':
    case 'utility':
      return upperCaseValue
  }
}

const formatFilterValue = (value, filterValue) => {
  switch (value) {
    case 'type':
      return (
        DISPLAY_VALUES[filterValue] ||
        filterValue.charAt(0).toUpperCase() + filterValue.slice(1).toLowerCase()
      )
    case 'fuel':
      return (
        filterValue.charAt(0).toUpperCase() + filterValue.slice(1).toLowerCase()
      )
    case 'analysis':
      return this.handleFormatAnalysisFilter(filterValue)
    default:
      return filterValue
  }
}

class SearchContext extends React.Component {
  state = {
    filters: {},
    searchTerm: ''
  }

  handleFilterChange(event, key) {
    const value = event.target.value
    this.setState(state => ({
      filters: {
        ...state.filters,
        [key]: value === 'all' ? null : value
      }
    }))
    this.props.onCategoryChange(key, value === 'all' ? null : value)
  }

  handleFilterChangeWithValue(value, key) {
    let filters = Object.assign({}, this.props.categoryFilter, { [key]: value })
    if (filters[key] !== this.props.categoryFilter[key]) {
      if (key === 'category') {
        filters = Object.assign({}, filters, {
          application: '',
          technology: ''
        })
      } else if (key === 'application') {
        filters = Object.assign({}, filters, {
          technology: ''
        })
      }
    }

    this.setState({ filters })
    this.props.onFilter(filters)
  }

  handleSearchTermChange(event) {
    this.setState({ searchTerm: event.target.value })
  }

  getKeyIsDisabled = searchKey => {
    const { filters } = this.state
    const prevKeys = {
      application: 'category',
      technology: 'application'
    }
    const prevKey = prevKeys[searchKey]

    return prevKey ? !filters[prevKey] : false
  }

  render() {
    const {
      query,
      filters,
      getSearchVariables,
      columns,
      onItemClick,
      renderNoResults = () => null,
      renderNoSearch = () => null,
      initialData = [],
      searchPlaceholder = 'Search for keywords',
      onCreateCustom,
      hasCategorization = false
    } = this.props
    return (
      <div>
        <div className={styles.SearchContextExtras}>
          <div className={styles.SearchContextSearch}>
            <input
              placeholder={searchPlaceholder}
              type='search'
              onChange={e => this.handleSearchTermChange(e)}
              value={this.state.searchTerm}
            />
            <i className='material-icons'>search</i>
          </div>
          {filters.map(({ searchKey, label, values }) => {
            const isDisabled = this.getKeyIsDisabled(searchKey)
            if (
              searchKey === 'category' ||
              searchKey === 'application' ||
              searchKey === 'technology'
            )
              return null
            return (
              <div
                key={label}
                className={classNames(
                  styles.selectContainer,
                  styles.SearchContextFilter
                )}
              >
                <select
                  onChange={event => this.handleFilterChange(event, searchKey)}
                  disabled={isDisabled}
                  className={classNames({
                    [styles.disabled]: isDisabled
                  })}
                >
                  <option disabled value='default'>
                    {formatDisplayValue(label)}
                  </option>
                  <option value='all'>
                    All {formatDisplayValue(label, 'plural')}
                  </option>
                  {values.map(({ displayName, value }) => {
                    return (
                      <option key={[label, value].join('-')} value={value}>
                        {displayName || formatFilterValue(label, value)}
                      </option>
                    )
                  })}
                </select>
              </div>
            )
          })}
          {hasCategorization && (
            <Categorization
              category={this.props.categoryFilter.category}
              application={this.props.categoryFilter.application}
              technology={this.props.categoryFilter.technology}
              handleCategory={value => {
                this.handleFilterChangeWithValue(value, 'category')
              }}
              handleApplication={value => {
                this.handleFilterChangeWithValue(value, 'application')
              }}
              handleTechnology={value => {
                this.handleFilterChangeWithValue(value, 'technology')
              }}
              target='equipment'
            />
          )}
          <div className={styles.SearchContextCustom}>
            <button
              className={classNames(styles.button, styles.buttonPrimary)}
              onClick={onCreateCustom}
            >
              <i className='material-icons'>add</i> CUSTOM
            </button>
          </div>
        </div>

        <Query
          query={query}
          variables={getSearchVariables({
            filters: this.state.filters,
            searchTerm: this.state.searchTerm
          })}
        >
          {({ loading, error, data }) => {
            if (loading) {
              return (
                <div className={styles.SearchContextSpinner}>
                  <Loader />
                </div>
              )
            }
            const searchResults = data[Object.keys(data)[0]]
            const equipmentResults = searchResults?.equipments
            const categorizationResults = searchResults?.categorizations
            let checkInitialData =
              equipmentResults.length === 0 && this.state.searchTerm === ''
            let listData =
              equipmentResults.length === 0 && this.state.searchTerm === ''
                ? initialData
                : equipmentResults
            if (categorizationResults && categorizationResults.length > 0) {
              const categorizations = categorizationResults.map(item => ({
                name: '+ Create Custom',
                category: item.category?.value,
                application: item.application?.value,
                technology: item.technology?.value,
                isCategorizationResult: true
              }))
              listData = [...categorizations, ...listData]
            }
            return (
              <div>
                {!!checkInitialData && (
                  <div className={styles.SearchContextTitle}>
                    {this.props.title}
                  </div>
                )}
                <SortableList
                  listData={listData}
                  error={error}
                  columns={columns}
                  onItemClick={onItemClick}
                  renderEmpty={
                    this.state.searchTerm === ''
                      ? renderNoSearch
                      : renderNoResults
                  }
                />
              </div>
            )
          }}
        </Query>
      </div>
    )
  }
}

export default SearchContext
