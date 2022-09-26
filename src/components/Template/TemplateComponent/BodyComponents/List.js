import React from 'react'
import { DragSource, DropTarget } from 'react-dnd'
import { pipe } from 'ramda'
import styles from '../../../Template/TemplateComponent/ExcelEditor.scss'

const headingSource = {
  beginDrag(props, state) {
    return {
      ...props,
      ...state,
      name: props.tabs.name,
      tabs: props.tabs,
      alltabs: props.alltabs,
      statetabe: state.alltabs,
      handleAddTab: props.handleAddTab,
      handleDataChange: props.handleDataChange,
      handleDoubleClick: props.handleDoubleClick,
      handleEditTabName: props.handleEditTabName,
      handleBlur: props.handleOnBlur,
      handleSelectTab: props.handleSelectTab
    }
  }
}

const headingTarget = {
  drop(props, monitor, component) {
    let draggedCol = monitor.getItem()
    let targetCol = props.tabs
    // trigger drag action
    props.drag(props, draggedCol, targetCol)
    props.handleSelectTab(targetCol)
    props.handleSelectTab(draggedCol.tabs)
  }
}

function collect(connect, monitor) {
  return {
    connectDragSource: connect.dragSource(),
    isDragging: monitor.isDragging()
  }
}

function collectDrop(connect, monitor) {
  return {
    connectDropTarget: connect.dropTarget(),
    isOver: monitor.isOver(),
    canDrop: monitor.canDrop()
  }
}

const List = ({
  tabs,
  connectDropTarget,
  connectDragSource,
  editTabNameMode,
  currentTab,
  alltabs,
  index,
  currenListItemId,
  props
}) =>
  connectDropTarget(
    connectDragSource(
      <li className={styles[`step-${alltabs.length}`]}>
        {editTabNameMode &&
        props.currentTab !== undefined &&
        tabs &&
        currentTab.id === currenListItemId ? (
          <input
            value={props.currentTab.name}
            onBlur={props.handleOnBlur}
            onChange={props.handleEditTabName}
          />
        ) : (
          <div>
            <button
              title={tabs.name}
              className={
                props.currentTab._id === currenListItemId
                  ? styles['tab_active']
                  : styles['tab']
              }
              onClick={() => props.handleSelectTab(tabs)}
              onDoubleClick={() => props.handleDoubleClick(tabs)}
              data-test="select-tab"
            >
              {tabs.name || (<span>Untitled</span>)}
            </button>
            {index === alltabs.length - 1 && (
              <a className={props.title.indexOf('limit') != -1 ? styles.limit : ''} title={props.title} onClick={props.handleAddTab} data-test="add-tab">
                <i className="material-icons">add_circle</i>
              </a>
            )}
          </div>
        )}
      </li>
    )
  )

export default pipe(
  DragSource('list', headingSource, collect),
  DropTarget('list', headingTarget, collectDrop)
)(List)
