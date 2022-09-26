import React, { Component } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import styles from './ColumnList.scss'
import ColumnModal from './ColumnModal'

class ColumnList extends Component {
  static propTypes = {
    user: PropTypes.object.isRequired,
    columnList: PropTypes.arrayOf(PropTypes.object).isRequired,
    handleColumnChange: PropTypes.func.isRequired,
    handleToggleColumn: PropTypes.func.isRequired,
    defaultColumn: PropTypes.array.isRequired,
    ColumnOptions: PropTypes.array.isRequired
  }

  state = {
    selectedItem: null
  }
  UNSAFE_componentWillMount = () => {
    document.addEventListener('mousedown', this.handleClick, false)
  }

  componentWillUnmount = () => {
    document.removeEventListener('mousedown', this.handleClick, false)
    this.props.handleToggleColumn(false)
  }

  handleColumnChange = (item, flag) => {
    const { selectedItem } = this.state
    const { columnList } = this.props
    if (selectedItem === 'New') {
      if (flag) this.props.handleColumnChange([...columnList, item])
      else {
        this.props.handleColumnChange([item, ...columnList.slice(1)], 0)
      }
    } else if (selectedItem !== 'New') {
      this.props.handleColumnChange(
        [
          ...columnList.slice(0, selectedItem),
          item,
          ...columnList.slice(selectedItem + 1)
        ],
        selectedItem
      )
    }
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

  handleClose = () => {}

  handleOpenColumn = (event, index) => {
    event.stopPropagation()
    document.removeEventListener('mousedown', this.handleClick, false)
    this.setState({ selectedItem: index })
  }

  handleRemoveColumn = (event, index) => {
    event.stopPropagation()
    const { columnList } = this.props
    this.props.handleColumnChange([
      ...columnList.slice(0, index),
      ...columnList.slice(index + 1)
    ])
  }

  render() {
    const { selectedItem } = this.state
    const {
      columnList,
      user,
      currrentIndex,
      defaultColumn,
      ColumnOptions
    } = this.props
    if (selectedItem !== null)
      return (
        <ColumnModal
          ref={node => (this.node = node)}
          column={
            selectedItem === 'New'
              ? { name: 'Default', column: defaultColumn }
              : columnList[selectedItem]
          }
          isNew={selectedItem === 'New'}
          user={user}
          handleToggleColumn={this.props.handleToggleColumn}
          handleColumnChange={this.handleColumnChange}
          ColumnOptions={ColumnOptions}
        />
      )
    return (
      <div
        className={styles.columnListConainter}
        ref={node => (this.node = node)}
      >
        <div
          className={styles.columnListConainterHeader}
          onClick={e => this.handleOpenColumn(e, 'New')}
        >
          <a href="javascript:;">Modify columns</a>
          <i
            className={classNames('material-icons', styles.iconCursor)}
            onClick={this.handleToggle}
          >
            close
          </i>
        </div>
        <div className={styles.columnListConainterBody}>
          <span>SAVED COLUMN SETS</span>
          {columnList &&
            columnList.map((column, index) => (
              <div
                key={`Column-${column.name}-${index}`}
                onClick={e => this.props.handleCurrentColumnChange(index)}
                className={classNames(
                  styles.columnListConainterBodyColumn,
                  currrentIndex == index ? styles.active : ''
                )}
              >
                <p>{column.name}</p>
                {index != 0 && (
                  <div className={styles.columnListConainterIcons}>
                    <i
                      className={classNames(
                        'material-icons',
                        styles.iconCursor,
                        styles.columnEdit
                      )}
                      onClick={e => this.handleOpenColumn(e, index)}
                    >
                      edit
                    </i>
                    <i
                      className={classNames(
                        'material-icons',
                        styles.iconCursor,
                        styles.columnDelete
                      )}
                      onClick={e => this.handleRemoveColumn(e, index)}
                    >
                      delete
                    </i>
                  </div>
                )}
              </div>
            ))}
        </div>
      </div>
    )
  }
}

export default ColumnList
