import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { findDOMNode } from 'react-dom'
import { DragSource, DropTarget } from 'react-dnd'
import ItemTypes from './ItemTypes'
import styles from './TemplateWidget.scss'
import classNames from 'classnames'
import { createDragPreview } from './CreateDragPreview'
import {
  templateUpdateError,
  bodyTemplate
} from 'routes/Template/modules/template'

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
      listId: props.listId,
      widget: props.widget
    }
  },

  endDrag(props, monitor) {
    const sourceObj = monitor.getItem()
    const dropResult = monitor.getDropResult()

    if (monitor.didDrop()) {
      props.setBgColor('white')
    }

    // if drop result exists and
    // and the list is not the first
    if (
      dropResult &&
      sourceObj.widget.type.includes(dropResult.listId) &&
      dropResult.listId !== 1
    ) {
      // if the drag is coming from the first list and going to body
      if (props.listId === 1) {
        // add it to the array, since it always displays at the bottom
        let type = ''
        if (props.widget.text === 'Data') {
          type = 'div'
        } else if (props.widget.text === 'Data List') {
          type = 'ordered-list'
        } else if (props.widget.text === 'Text List') {
          type = 'ordered-list-text'
        } else if (props.widget.text === 'Aerial Image') {
          type = 'address'
        } else {
          type = props.widget.text
        }
        let body = JSON.parse(JSON.stringify(props.body))
        if (type.toLowerCase() === 'measures') {
          body.push({
            type: type.toLowerCase(),
            target: 'measure',
            ele: 'table'
          })
        } else if (type.toLowerCase() === 'equipment') {
          body.push({
            type: type.toLowerCase(),
            target: 'equipment',
            ele: 'table'
          })
        } else if (type.toLowerCase() === 'ordered-list-text') {
          body.push({ type: type.toLowerCase(), ele: 'ol' })
        } else if (type.toLowerCase() === 'chart') {
          body.push({
            type: type.toLowerCase(),
            target: 'chart',
            ele: 'img'
          })
        } else if (type.toLowerCase() === 'unordered-list-text') {
          body.push({ type: type.toLowerCase(), ele: 'ul' })
        } else if (type.toLowerCase() === 'image') {
          body.push({ type: type.toLowerCase(), ele: 'img' })
        } else if (type.toLowerCase() === 'divider') {
          body.push({
            type: type.toLowerCase(),
            target: 'divider',
            ele: 'line'
          })
        } else {
          body.push({ type: type.toLowerCase() })
        }
        props.bodyTemplate(body)
      }
    }
  }
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

    if (props.listId === sourceListId && sourceListId !== 1) {
      props.moveWidget(dragIndex, hoverIndex)
      monitor.getItem().index = hoverIndex
    }
  }
}

var dragPreviewStyle = {
  backgroundColor: '#858C92',
  borderColor: 'black',
  color: 'white',
  fontSize: 15,
  paddingTop: 15,
  paddingRight: 20,
  paddingBottom: 15,
  paddingLeft: 20
}

class TemplateWidget extends Component {
  static propTypes = {
    templateUpdateError: PropTypes.func.isRequired,
    index: PropTypes.number.isRequired,
    key: PropTypes.number,
    listId: PropTypes.number.isRequired,
    setBgColor: PropTypes.func.isRequired,
    body: PropTypes.array,
    widget: PropTypes.object.isRequired
  }

  componentDidMount() {
    const { connectDragPreview, widget } = this.props
    connectDragPreview(createDragPreview(widget.text, dragPreviewStyle))
  }

  dynamicIconClass = () => {
    return this.props.widget.icon
  }

  render() {
    const {
      connectDragSource,
      connectDropTarget,
      index,
      isDragging,
      widget
    } = this.props

    return connectDragSource(
      connectDropTarget(
        <div
          className={classNames(
            styles['template-widget'],
            isDragging ? styles['disabled'] : ''
          )}
          data-test={`draggable-${widget.text.toLowerCase()}-element`}
        >
          <i className="material-icons">{this.dynamicIconClass()}</i>
          <p>{widget.text}</p>
          <i className="material-icons">gamepad</i>
        </div>
      )
    )
  }
}
const mapDispatchToProps = {
  bodyTemplate,
  templateUpdateError
}

const mapStateToProps = state => ({
  body: state.template.templateViewBody || []
})

const withConnect = connect(mapStateToProps, mapDispatchToProps)

export default withConnect(
  DragSource(
    ItemTypes.WIDGET,
    widgetSource,
    collectDragSource
  )(
    DropTarget(
      ItemTypes.WIDGET,
      widgetTarget,
      collectDropTarget
    )(TemplateWidget)
  )
)
