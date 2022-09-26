import React, { Component } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { DragDropContext } from 'react-dnd'
import HTML5Backend from 'react-dnd-html5-backend'
import styles from './ColumnModal.scss'
import checkboxStyles from '../MultiSelect.scss'
import filterStyles from '../Filter.scss'
import ColumnPanel from './ColumnPanel'

class ColumnModal extends Component {
  static propTypes = {
    user: PropTypes.object.isRequired,
    column: PropTypes.object.isRequired,
    handleColumnChange: PropTypes.func.isRequired,
    handleToggleColumn: PropTypes.func.isRequired,
    isNew: PropTypes.bool.isRequired,
    ColumnOptions: PropTypes.array.isRequired
  }

  state = {
    saveSet: false,
    selectedMenu: null
  }
  UNSAFE_componentWillMount = () => {
    document.addEventListener('mousedown', this.handleClick, false)
  }

  componentWillUnmount = () => {
    document.removeEventListener('mousedown', this.handleClick, false)
    this.props.handleToggleColumn(false)
  }

  componentDidMount() {
    this.setState({ column: this.props.column })
  }

  handleClick = e => {
    if (this.node && this.node.contains(e.target)) {
      // the click is inside, continue to menu links
      return
    }
    // otherwise, toggle (close) the dropdowns
    this.props.handleToggleColumn(false)
  }

  handleToggle = () => {
    this.props.handleToggleColumn()
  }

  handleSort = items => {
    let { ColumnOptions } = this.props
    let newColumnList = items
    newColumnList.sort((a, b) => {
      let valueA = a.order
      let valueB = b.order
      if (valueA === valueB) return 0
      else if (valueA === undefined) return 1
      else if (valueB === undefined) return -1
      else return valueA < valueB ? -1 : 1
    })
    if (ColumnOptions[0].value == 'Organization') {
      newColumnList = newColumnList.filter(
        item => item.value != 'updated' && item.value != 'created'
      )
      let flagUpdated = items.filter(item => item.value === 'updated').length
      let flagCreated = items.filter(item => item.value === 'created').length
      if (flagUpdated)
        newColumnList.push({
          name: 'updated',
          label: 'Updated',
          value: 'updated'
        })
      if (flagCreated)
        newColumnList.push({
          name: 'created',
          label: 'Created',
          value: 'created'
        })
    }
    return newColumnList
  }
  handleApply = () => {
    let { column, saveSet } = this.state
    // let newColumnList = this.handleSort(column.column)
    let newColumnList = column.column
    if (!saveSet && this.props.column.name === 'Default')
      column.name = 'Default'
    if (column.name === '') {
      if (!saveSet) column.name = 'Default'
      else column.name = 'My Column Set'
    }
    this.props.handleColumnChange(
      {
        ...column,
        column: newColumnList
      },
      saveSet
    )
    this.props.handleToggleColumn()
  }

  handleSaveSelect = () => {
    this.setState(preveState => ({
      saveSet: !preveState.saveSet
    }))
  }

  handleExpandMenu = item => {
    const { selectedMenu } = this.state
    this.setState({
      selectedMenu:
        selectedMenu && selectedMenu.value === item.value ? null : item
    })
  }

  handleChangeName = e => {
    const { column } = this.state
    let name = e.target.value
    this.setState({
      column: {
        ...column,
        name
      }
    })
  }

  handleAddColumn = item => {
    let { column } = this.state
    let { ColumnOptions } = this.props
    let columnList = column.column
    const index = column.column.findIndex(
      filter =>
        filter && filter.value != undefined && filter.value === item.value
    )
    if (index !== -1) {
      columnList = [
        ...column.column.slice(0, index),
        ...column.column.slice(index + 1)
      ]
    } else {
      if (item.order === undefined) {
        columnList = [...column.column, item]
      } else {
        let index = 0
        for (index; index < column.column.length; index++) {
          if (column.column[index].order === undefined) break
          if (column.column[index].order > item.order) {
            break
          }
        }
        if (index == 0) {
          columnList = [item, ...column.column]
        } else {
          columnList = [
            ...column.column.slice(0, index),
            item,
            ...column.column.slice(index)
          ]
        }
      }
    }
    let newColumnList = columnList
    newColumnList.sort((a, b) => {
      let valueA = a.order
      let valueB = b.order
      if (valueA === valueB) return 0
      else if (valueA === undefined) return 1
      else if (valueB === undefined) return -1
      else return valueA < valueB ? -1 : 1
    })
    if (ColumnOptions[0].value == 'Organization') {
      newColumnList = newColumnList.filter(
        item => item.value != 'updated' && item.value != 'created'
      )
      let flagUpdated = columnList.filter(item => item.value === 'updated')
        .length
      let flagCreated = columnList.filter(item => item.value === 'created')
        .length
      if (flagUpdated)
        newColumnList.push({
          name: 'updated',
          label: 'Updated',
          value: 'updated'
        })
      if (flagCreated)
        newColumnList.push({
          name: 'created',
          label: 'Created',
          value: 'created'
        })
    }
    this.setState({
      column: {
        ...column,
        column: newColumnList
      }
    })
  }

  renderHeadColumn = column => {
    if (!column || !column.column || !column.column.length) return null
    let filterColumn = [...column.column]
    const { user } = this.props
    if (!user.products || user.products.buildeeNYC !== 'access') {
      filterColumn = filterColumn.filter(
        item => !item.value.includes('nycfields')
      )
    }
    if (!filterColumn.length) return null
    return (
      <div className={styles.columnRowHeader}>
        <div className={styles.centerIcon}>
          <i className="material-icons">lock</i>
        </div>
        <label>Name</label>
      </div>
    )
  }
  handleRemoveColumn = item => {
    const { column } = this.state
    const index = column.column.findIndex(
      filter =>
        filter && filter.value != undefined && filter.value === item.value
    )
    if (index !== -1) {
      this.setState({
        column: {
          ...column,
          column: [
            ...column.column.slice(0, index),
            ...column.column.slice(index + 1)
          ]
        }
      })
    }
  }
  handleUpdateColumn = items => {
    const { column } = this.state
    this.setState({
      column: {
        ...column,
        column: items
      }
    })
  }
  render() {
    const { saveSet, selectedMenu, column } = this.state
    const { user, isNew, ColumnOptions } = this.props
    let showCheckBox = !isNew ? true : saveSet
    return (
      <div
        className={styles.columnModalContainer}
        ref={node => (this.node = node)}
      >
        <div className={styles.columnModalContainerHeader}>
          <p>Modify columns</p>
          <i
            className={classNames('material-icons', styles.deleteIcon)}
            onClick={this.handleToggle}
          >
            close
          </i>
        </div>
        <div className={styles.columnModalContainerBody}>
          <div className={styles.columnRow}>
            <div className={styles.title}>Select columns</div>
            <div
              className={classNames(
                filterStyles.filterContainerBody,
                styles.ColumnOptionContainer
              )}
            >
              {ColumnOptions.map((item, index) => {
                let subFields = item.subFields || []
                subFields.sort((A, B) => {
                  if (A.label < B.label) return -1
                  if (A.label > B.label) return 1
                  return 0
                })
                return (
                  <div key={`columnOption-${index}`}>
                    <div
                      className={filterStyles.filterMenu}
                      onClick={() => this.handleExpandMenu(item)}
                    >
                      {item.name}
                      {selectedMenu && selectedMenu.value === item.value ? (
                        <i className="material-icons">expand_less</i>
                      ) : (
                        <i className="material-icons">expand_more</i>
                      )}
                    </div>
                    {selectedMenu &&
                    selectedMenu.value === item.value &&
                    subFields.length ? (
                      <div className={filterStyles.filterMenuSub}>
                        {subFields.map((field, index) => {
                          let checked = column.column.findIndex(
                            filter =>
                              filter &&
                              filter.value != undefined &&
                              filter.value === field.value
                          )
                          checked = checked !== -1 ? true : false
                          if (
                            !user.products ||
                            (user.products.buildeeNYC !== 'access' &&
                              field.value.includes('nycfields')) ||
                            field.label === 'Name'
                          )
                            return null
                          return (
                            <label
                              key={`field.value-${index}`}
                              className={classNames(
                                checkboxStyles['__input'],
                                checkboxStyles['__input--checkboxes']
                              )}
                            >
                              <input
                                type="checkbox"
                                defaultChecked={true}
                                onClick={e => this.handleAddColumn(field)}
                                value={checked}
                                className={classNames(
                                  checked ? checkboxStyles.checked : ''
                                )}
                              />
                              <span>{field.label}</span>
                            </label>
                          )
                        })}
                      </div>
                    ) : null}
                  </div>
                )
              })}
            </div>
          </div>
          <div className={styles.columnRow}>
            <div className={styles.title}>Your columns</div>
            {this.renderHeadColumn(column)}
            <div className={styles.columnRowBody}>
              <ColumnPanel
                list={column && column.column ? column.column : []}
                accepts={[]}
                user={user}
                handleRemoveColumn={this.handleRemoveColumn}
                handleUpdateColumn={this.handleUpdateColumn}
              />
            </div>
          </div>
        </div>
        <div className={styles.columnModalContainerFooter}>
          <div className={styles.saveColumn}>
            <label
              key="saveSet"
              className={classNames(
                checkboxStyles['__input'],
                checkboxStyles['__input--checkboxes'],
                styles.__input
              )}
            >
              <input
                type="checkbox"
                defaultChecked={true}
                value={showCheckBox}
                className={showCheckBox ? checkboxStyles.checked : ''}
                onChange={this.handleSaveSelect}
                disabled={!isNew}
              />
              <span className={!isNew ? styles.disabledCursor : ''}>
                &nbsp;
              </span>
            </label>
            <div className={styles.nameInput}>
              <span>Save your column set</span>
              <input
                className={classNames(
                  styles.inlineInput,
                  !isNew ? styles.disabledCursor : ''
                )}
                value={column && column.name}
                onChange={e => this.handleChangeName(e)}
                disabled={!isNew}
              />
            </div>
          </div>
          <button
            className={classNames(styles.button, styles.buttonSecondary)}
            onClick={this.handleToggle}
          >
            Cancel
          </button>
          <button
            className={classNames(styles.button, styles.buttonPrimary)}
            onClick={this.handleApply}
          >
            Apply
          </button>
        </div>
      </div>
    )
  }
}

export default DragDropContext(HTML5Backend)(ColumnModal)
