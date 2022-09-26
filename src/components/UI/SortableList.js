import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import Loader from './Loader'
import styles from './SortableList.scss'
import { parentNodeHasClass } from '../../utils/Utils'
import { multiSelectChecker } from 'utils/Portfolio'

export class SortableList extends React.Component {
  static propTypes = {
    listData: PropTypes.array.isRequired,
    columns: PropTypes.object.isRequired,
    loading: PropTypes.bool,
    error: PropTypes.object,
    rowActions: PropTypes.array,
    showTotals: PropTypes.bool,
    isCheckable: PropTypes.bool,
    scrollable: PropTypes.bool
  }

  static defaultProps = {
    showTotals: true,
    isCheckable: false,
    selectedItems: []
  }

  state = {
    sort: {
      key: 'updated',
      direction: 'DESC'
    },
    rowActionOpen: null,
    top: 0,
    left: 0
  }

  getSortedData = ({ data, sortDirection, sortKey }) => {
    const column = this.props.columns[sortKey]
    const getValue = (column && column.getValue) || (v => v)
    const key = (column && column.sortKey) || undefined

    if (sortDirection === 'ASC') {
      return data.sort((a, b) => {
        const valueA = column && column.flag ? getValue(a) : getValue(a[key])
        const valueB = column && column.flag ? getValue(b) : getValue(b[key])
        if (valueA < valueB) {
          return -1
        }

        if (valueA > valueB) {
          return 1
        }

        // values must be equal
        return 0
      })
    }

    return data.sort((a, b) => {
      const valueA = column && column.flag ? getValue(a) : getValue(a[key])
      const valueB = column && column.flag ? getValue(b) : getValue(b[key])
      if (valueA < valueB) {
        return 1
      }

      if (valueA > valueB) {
        return -1
      }

      // values must be equal
      return 0
    })
  }

  sortColumnHeading = (key, direction) => {
    let sort = { ...this.state.sort }
    if (!direction) {
      direction = this.state.sort.direction
    }

    if (key === sort.key) {
      sort.direction = direction === 'ASC' ? 'DESC' : 'ASC'
    } else {
      sort.key = key
      sort.direction = 'ASC'
    }

    this.setState({ sort })
  }

  getTotals = name => {
    const { getTotal } = this.props.columns[name]
    if (typeof getTotal === 'function') {
      return getTotal(this.props.listData)
    }
    return getTotal
  }

  getValue = (name, dataPoint) => {
    const { columns } = this.props
    let getValue = columns[name].getValue || (v => v)
    let sortKey = columns[name].sortKey
    return getValue(dataPoint[sortKey])
  }

  renderValue = (name, dataPoint) => {
    const { columns } = this.props
    let render = columns[name].render || columns[name].getValue || (v => v)
    let sortKey = columns[name].sortKey
    if (columns[name] && columns[name].flag) {
      return render(dataPoint, dataPoint)
    }
    return render(dataPoint[sortKey], dataPoint)
  }

  handleScroll = () => {
    if (this.state.rowActionOpen) {
      let index = this.state.rowActionOpen.split('-')[1]
      const extraButtons = document.querySelectorAll(
        '[data-test="extras-button"]'
      )
      const extraButton = extraButtons?.[index]
      if (extraButton) {
        const rect = extraButton.getBoundingClientRect()
        console.log('rect', rect)
        if (rect) {
          this.setState({
            top: rect.bottom,
            left: rect.left - 350 + rect.width
          })
        }
      }
    }
  }

  handleToggleActions = id => {
    const prevRowAction = this.state.rowActionOpen
    if (!prevRowAction) {
      document.addEventListener('scroll', this.handleScroll, false)
    } else {
      document.removeEventListener('scroll', this.handleScroll, false)
    }
    this.setState(
      {
        rowActionOpen: this.state.rowActionOpen ? null : id,
        top: 0,
        left: 0
      },
      () => {
        this.handleScroll()
      }
    )
  }
  UNSAFE_componentWillMount() {
    document.addEventListener('mousedown', this.handleClick, false)
  }
  componentWillUnmount = () => {
    document.removeEventListener('mousedown', this.handleClick, false)
  }
  handleClick = e => {
    // the click is inside, continue to menu links
    if (parentNodeHasClass(e.target, 'extrasClick')) return
    // otherwise, toggle (close) the app dropdown
    this.handleToggleActions(null)
  }

  handleItemClick = id => () => {
    const { onItemClick } = this.props

    if (onItemClick) {
      onItemClick(id)
    }
  }

  render() {
    const {
      loading,
      error,
      listData,
      columns,
      rowActions,
      renderEmpty = () => null,
      onItemClick,
      selectedItems,
      handleSelectItem,
      isCheckable,
      disabledSelectedItems = [],
      scrollable = false,
      noDataText = ''
    } = this.props
    const columnNames = Object.keys(columns)
    if (loading === true)
      return (
        <div className={styles.List}>
          <Loader />
        </div>
      )

    if (error) {
      return (
        <div className={styles.List}>
          <div>{error}</div>
        </div>
      )
    }

    const results = this.getSortedData({
      data: listData,
      sortDirection: this.state.sort.direction,
      sortKey: this.state.sort.key
    })

    let ids =
      results
        .map(item => item._id)
        .filter(id => !disabledSelectedItems.includes(id)) || []
    let checkedAll =
      multiSelectChecker(ids, selectedItems) &&
      multiSelectChecker(selectedItems, ids)

    let realSelectedItems = [...selectedItems]

    if (this.props.hasFilter) {
      checkedAll = multiSelectChecker(selectedItems, ids)
      realSelectedItems = realSelectedItems.filter(id => ids.includes(id))
    }

    if (realSelectedItems.length === 0) checkedAll = false

    if (scrollable) {
      return (
        <div className={styles.scrollTableContainer}>
          <table>
            <thead>
              <tr
                className={classNames(
                  this.state.sort.direction === 'ASC' ? styles.sortASC : ''
                )}
              >
                {columnNames.map((name, index) => {
                  let columnHeader = columns[name].header || name
                  let columnStyle = { textTransform: 'capitalize' }
                  if (!isNaN(columns[name].size))
                    Object.assign(columnStyle, { flex: columns[name].size })
                  const needToShowCheckbox = isCheckable && index === 0
                  if (needToShowCheckbox) {
                    return (
                      <th
                        key={index}
                        style={columnStyle}
                        onClick={() => this.sortColumnHeading(name)}
                        className={styles.firstColumnWithCheckbox}
                      >
                        <div>
                          {isCheckable && (
                            <div className={styles.checkboxWrapper}>
                              <div className={styles.checkboxContainer}>
                                <label
                                  className={classNames(
                                    styles['__input'],
                                    styles['__input--checkboxes']
                                  )}
                                >
                                  <input
                                    defaultChecked={checkedAll}
                                    value={true}
                                    onClick={e => handleSelectItem('all')}
                                    className={classNames(
                                      checkedAll ? styles['checked'] : ''
                                    )}
                                    type='checkbox'
                                    name='data'
                                  />
                                  <span></span>
                                </label>
                              </div>
                            </div>
                          )}
                          <div className={styles.center}>
                            {`${columnHeader}`}
                            {this.state.sort.key === name ? (
                              <i className='material-icons'>arrow_downward</i>
                            ) : (
                              ''
                            )}
                          </div>
                        </div>
                      </th>
                    )
                  }
                  return (
                    <th
                      key={index}
                      style={columnStyle}
                      onClick={() => this.sortColumnHeading(name)}
                    >
                      {`${columnHeader}`}
                      {this.state.sort.key === name ? (
                        <i className='material-icons'>arrow_downward</i>
                      ) : (
                        ''
                      )}
                    </th>
                  )
                })}
                {rowActions && (
                  <th className={styles.rowItemActionSelected}></th>
                )}
              </tr>
            </thead>
            <tbody>
              {results.length === 0 ? (
                <tr>
                  <td className={styles.emptyList}>{noDataText}</td>
                  <td colSpan={columnNames.length - 1}></td>
                  <td></td>
                </tr>
              ) : (
                results.map((dataPoint, index) => {
                  const key = `${dataPoint._id}-${index}`
                  let isChecked = !!selectedItems.includes(dataPoint._id)
                  let isDisabled = disabledSelectedItems.includes(dataPoint._id)

                  return (
                    <tr
                      key={key}
                      className={classNames(
                        onItemClick && styles.tableClickableRow
                      )}
                      data-test='sortable-list-row'
                      onClick={this.handleItemClick(dataPoint)}
                    >
                      {columnNames.map((name, columnIndex) => {
                        let columnStyle = !isNaN(columns[name].size)
                          ? { flex: columns[name].size }
                          : {}
                        let needToShowCheckbox =
                          columnIndex === 0 && isCheckable

                        if (needToShowCheckbox) {
                          return (
                            <td
                              key={`${dataPoint._id}-${index}-${name}`}
                              style={columnStyle}
                              className={styles.firstColumnWithCheckbox}
                            >
                              <div>
                                {isCheckable && (
                                  <div>
                                    <div className={styles.checkboxContainer}>
                                      <label
                                        className={classNames(
                                          styles['__input'],
                                          styles['__input--checkboxes']
                                        )}
                                      >
                                        <input
                                          defaultChecked={isChecked}
                                          disabled={isDisabled}
                                          value={true}
                                          onClick={e =>
                                            handleSelectItem(dataPoint._id)
                                          }
                                          className={classNames(
                                            isChecked ? styles['checked'] : ''
                                          )}
                                          type='checkbox'
                                          name='data'
                                        />
                                        <span
                                          className={classNames(
                                            isDisabled ? styles['disabled'] : ''
                                          )}
                                        ></span>
                                      </label>
                                    </div>
                                  </div>
                                )}
                                <div>
                                  <span
                                    className={classNames(
                                      styles.displayMobileView,
                                      styles.textCapitalize,
                                      styles.listSpacingMobile
                                    )}
                                  >
                                    {name}
                                  </span>
                                  {this.renderValue(name, dataPoint)}
                                </div>
                              </div>
                            </td>
                          )
                        }

                        return (
                          <td
                            key={`${dataPoint._id}-${index}-${name}`}
                            style={columnStyle}
                          >
                            <span
                              className={classNames(
                                styles.displayMobileView,
                                styles.textCapitalize,
                                styles.listSpacingMobile
                              )}
                            >
                              {name}
                            </span>

                            {this.renderValue(name, dataPoint)}
                          </td>
                        )
                      })}
                      {rowActions && (
                        <td
                          className={classNames(styles.rowItemAction, {
                            [styles.rowItemActionSelected]:
                              this.state.rowActionOpen === key
                          })}
                        >
                          <div
                            data-test='extras-button'
                            onClick={event => {
                              event.stopPropagation()
                              this.handleToggleActions(key)
                            }}
                            className={classNames(
                              styles.extras,
                              styles.mobWidth20,
                              'extrasClick',
                              this.state.rowActionOpen === key
                                ? styles.extrasShow
                                : styles.extrasHide
                            )}
                          >
                            <span
                              className={classNames(
                                styles.extrasButton,
                                styles.listSpaceAView
                              )}
                            />

                            <div
                              className={classNames(
                                styles.extrasDropdown,
                                styles.extrasDropdownRight,
                                this.state.rowActionOpen === key &&
                                  this.props.scrollable
                                  ? styles.scrollableExtra
                                  : ''
                              )}
                              style={
                                this.state.rowActionOpen === key &&
                                this.props.scrollable
                                  ? {
                                      top: this.state.top,
                                      left: this.state.left,
                                      position: 'fixed'
                                    }
                                  : {}
                              }
                            >
                              {rowActions.map(action => (
                                <div
                                  key={action.text}
                                  className={styles.extrasLink}
                                  onClick={() =>
                                    action.handler(dataPoint, index)
                                  }
                                >
                                  <i className='material-icons'>
                                    {action.icon}
                                  </i>
                                  {action.text}
                                </div>
                              ))}
                            </div>
                          </div>
                        </td>
                      )}
                    </tr>
                  )
                })
              )}
              {this.props.showTotals && (
                <tr
                  className={classNames(
                    onItemClick && styles.tableClickableRow
                  )}
                  data-test='sortable-list-total-row'
                >
                  {columnNames.map(name => {
                    let columnStyle = !isNaN(columns[name].size)
                      ? { flex: columns[name].size }
                      : {}
                    return (
                      <td key={`total-td-${name}`} style={columnStyle}>
                        <span
                          className={classNames(
                            styles.displayMobileView,
                            styles.textCapitalize,
                            styles.listSpacingMobile
                          )}
                        >
                          {name}
                        </span>
                        {this.getTotals(name)}
                      </td>
                    )
                  })}
                  {rowActions && (
                    <td className={classNames(styles.rowItemAction)}></td>
                  )}
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )
    }

    return (
      <div className={styles.List}>
        <div className={styles.table}>
          <div
            className={classNames(
              styles.tableHeader,
              this.state.sort.direction === 'ASC'
                ? styles.tableHeaderSortASC
                : styles.tableHeaderSortDESC
            )}
          >
            {isCheckable && (
              <div className={styles.checkboxWrapper}>
                <div className={styles.checkboxContainer}>
                  <label
                    className={classNames(
                      styles['__input'],
                      styles['__input--checkboxes']
                    )}
                  >
                    <input
                      defaultChecked={checkedAll}
                      value={true}
                      onClick={e => handleSelectItem('all')}
                      className={classNames(
                        checkedAll ? styles['checked'] : ''
                      )}
                      type='checkbox'
                      name='data'
                    />
                    <span></span>
                  </label>
                </div>
              </div>
            )}
            {columnNames.map((name, index) => {
              let columnHeader = columns[name].header || name
              let columnStyle = { textTransform: 'capitalize' }
              if (!isNaN(columns[name].size))
                Object.assign(columnStyle, { flex: columns[name].size })
              return (
                <div
                  key={index}
                  className={styles.tableRowItem}
                  style={columnStyle}
                  onClick={() => this.sortColumnHeading(name)}
                >
                  {`${columnHeader}`}
                  {this.state.sort.key === name ? (
                    <i className='material-icons'>arrow_downward</i>
                  ) : (
                    ''
                  )}
                </div>
              )
            })}
            {rowActions && <div className={styles.tableRowItemAction}> </div>}
          </div>
          {results.length === 0 ? (
            <div className={styles.tableEmptyRow}>{renderEmpty()}</div>
          ) : (
            results.map((dataPoint, index) => {
              const key = `${dataPoint._id}-${index}`
              let isChecked = !!selectedItems.includes(dataPoint._id)
              let isDisabled = disabledSelectedItems.includes(dataPoint._id)

              return (
                <div
                  key={key}
                  className={classNames(
                    styles.tableRow,
                    onItemClick && styles.tableClickableRow
                  )}
                  data-test='sortable-list-row'
                  onClick={this.handleItemClick(dataPoint)}
                >
                  {isCheckable && (
                    <div>
                      <div className={styles.checkboxContainer}>
                        <label
                          className={classNames(
                            styles['__input'],
                            styles['__input--checkboxes']
                          )}
                        >
                          <input
                            defaultChecked={isChecked}
                            disabled={isDisabled}
                            value={true}
                            onClick={e => handleSelectItem(dataPoint._id)}
                            className={classNames(
                              isChecked ? styles['checked'] : ''
                            )}
                            type='checkbox'
                            name='data'
                          />
                          <span
                            className={classNames(
                              isDisabled ? styles['disabled'] : ''
                            )}
                          ></span>
                        </label>
                      </div>
                    </div>
                  )}
                  {columnNames.map(name => {
                    let columnStyle = !isNaN(columns[name].size)
                      ? { flex: columns[name].size }
                      : {}

                    return (
                      <div
                        key={`${dataPoint._id}-${index}-${name}`}
                        className={styles.tableRowItem}
                        style={columnStyle}
                      >
                        <span
                          className={classNames(
                            styles.displayMobileView,
                            styles.textCapitalize,
                            styles.listSpacingMobile
                          )}
                        >
                          {name}
                        </span>

                        {this.renderValue(name, dataPoint)}
                      </div>
                    )
                  })}
                  {rowActions && (
                    <div className={classNames(styles.tableRowItemAction)}>
                      <div
                        data-test='extras-button'
                        onClick={event => {
                          event.stopPropagation()
                          this.handleToggleActions(key)
                        }}
                        className={classNames(
                          styles.extras,
                          styles.mobWidth20,
                          'extrasClick',
                          this.state.rowActionOpen === key
                            ? styles.extrasShow
                            : styles.extrasHide
                        )}
                      >
                        <span
                          className={classNames(
                            styles.extrasButton,
                            styles.listSpaceAView
                          )}
                        />

                        <div
                          className={classNames(
                            styles.extrasDropdown,
                            styles.extrasDropdownRight
                          )}
                        >
                          {rowActions.map(action => (
                            <div
                              key={action.text}
                              className={styles.extrasLink}
                              onClick={() => action.handler(dataPoint, index)}
                            >
                              <i className='material-icons'>{action.icon}</i>
                              {action.text}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )
            })
          )}
          {this.props.showTotals && (
            <div className={styles.tableRow}>
              {columnNames.map((name, index) => (
                <div key={`${index}-${name}`} className={styles.tableRowItem}>
                  <span
                    className={classNames(
                      styles.displayMobileView,
                      styles.textCapitalize,
                      styles.listSpacingMobile
                    )}
                  >
                    {name}
                  </span>
                  {this.getTotals(name)}
                </div>
              ))}
              {rowActions && <div className={styles.tableRowItemAction}> </div>}
            </div>
          )}
        </div>
      </div>
    )
  }
}

export default SortableList
