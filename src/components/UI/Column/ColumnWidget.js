import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { findDOMNode } from 'react-dom'
import { DragSource, DropTarget } from 'react-dnd'
import classNames from 'classnames'
import styles from './ColumnModal.scss'

function collectDropTarget(connect) {
  return {
    connectDropTarget: connect.dropTarget()
  }
}

function collectDragSource(connect, monitor) {
  return {
    connectDragSource: connect.dragSource(),
    connectDragPreview: connect.dragPreview(),
    isDragging: monitor.isDragging()
  }
}

const widgetSource = {
  beginDrag(props) {
    return {
      index: props.index,
      widget: props.widget
    }
  },
  endDrag(props, monitor, component) {}
}

const widgetTarget = {
  hover(props, monitor, component) {
    const dragIndex = monitor.getItem().index
    const hoverIndex = props.index
    const sourceListId = monitor.getItem().listId

    if (dragIndex === hoverIndex) {
      return
    }

    const hoverBoundingRect = findDOMNode(component).getBoundingClientRect()
    const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2
    const clientOffset = monitor.getClientOffset()
    const hoverClientY = clientOffset.y - hoverBoundingRect.top

    if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
      return
    }

    if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
      return
    }

    props.moveWidget(dragIndex, hoverIndex)
    monitor.getItem().index = hoverIndex
  }
}
class ColumnWidget extends Component {
  render() {
    const { item, user, connectDragSource, connectDropTarget } = this.props
    if (
      !user.products ||
      (user.products.buildeeNYC !== 'access' &&
        item.value.includes('nycfields'))
    )
      return null
    return connectDragSource(
      connectDropTarget(
        <div
          className={classNames(
            styles.columnRowBodyItem,
            item.label === 'Name' ? styles.columnRowBodyName : ''
          )}
        >
          <div className={styles.centerIcon}>
            <i className={classNames('material-icons', styles.moveCursor)}>
              drag_handle
            </i>
          </div>
          <label>{item.label}</label>
          {item.label !== 'Name' && (
            <div className={styles.centerIcon}>
              <i
                className={classNames('material-icons', styles.removeIcon)}
                onClick={e => this.props.handleRemoveColumn(item)}
              >
                close
              </i>
            </div>
          )}
        </div>
      )
    )
  }
}
export default DragSource(
  'ColumnWidget',
  widgetSource,
  collectDragSource
)(DropTarget('ColumnWidget', widgetTarget, collectDropTarget)(ColumnWidget))
