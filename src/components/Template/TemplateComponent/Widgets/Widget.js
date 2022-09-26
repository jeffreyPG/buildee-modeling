import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { findDOMNode } from 'react-dom'
import { DragSource, DropTarget } from 'react-dnd'
import ItemTypes from './ItemTypes'
import {
  Body,
  Title,
  Text,
  TextList,
  Projects,
  Address,
  Image,
  Divider
} from '../Options/'
import styles from './TemplateWidget.scss'
import { createDragPreview } from './CreateDragPreview'
import { bodyTemplate } from 'routes/Template/modules/template'

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
    props.setCloseAllOptions(true)
    return {
      index: props.index,
      listId: props.listId,
      widget: props.widget
    }
  },

  endDrag(props, monitor, component) {
    const sourceObj = monitor.getItem()
    const dropResult = monitor.getDropResult()

    // if drop result exists and
    // and the list is not the first
    if (dropResult && dropResult.listId !== 1) {
      const dropId = monitor.getDropResult().listId
      // if the drag is coming from the first list and going to body
      if (props.listId === 1) {
        // add it to the array, since it always displays at the bottom
        let body = JSON.parse(JSON.stringify(props.body))
        if (props.widget.text === 'measures') {
          body.push({
            type: props.widget.text,
            target: 'measure',
            ele: 'table'
          })
        } else if (props.widget.text === 'equipment') {
          body.push({
            type: props.widget.text,
            target: 'equipment',
            ele: 'table'
          })
        } else {
          body.push({ type: props.widget.text })
        }
        props.bodyTemplate(body)
        // if the drag is coming from the second list(meaning, it's being moved around)
      } else {
        // update array order
        let body = JSON.parse(JSON.stringify(props.body))
        Array.prototype.move = function(from, to) {
          this.splice(to, 0, this.splice(from, 1)[0])
        }
        body.move(props.index, monitor.getItem().index)
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

    if (props.listId === sourceListId) {
      props.moveWidget(dragIndex, hoverIndex)
      monitor.getItem().index = hoverIndex
    }
  }
}

var dragPreviewStyle = {
  backgroundColor: '#f7f8f8',
  borderColor: 'black',
  color: 'black',
  fontSize: 15,
  paddingTop: 15,
  paddingRight: 20,
  paddingBottom: 15,
  paddingLeft: 20
}

class Widget extends Component {
  static propTypes = {
    closeAllOptions: PropTypes.bool.isRequired,
    index: PropTypes.number.isRequired,
    key: PropTypes.number,
    listId: PropTypes.number.isRequired,
    moveWidget: PropTypes.func.isRequired,
    removeWidget: PropTypes.func.isRequired,
    setCloseAllOptions: PropTypes.func.isRequired,
    widget: PropTypes.object.isRequired,
    getChartReports: PropTypes.func,
    views: PropTypes.array
  }

  componentDidMount() {
    const { connectDragPreview, widget } = this.props
    this.dragPreview = createDragPreview(widget.text, dragPreviewStyle)
    connectDragPreview(this.dragPreview)
  }

  componentDidUpdate(prevProps) {
    const { widget } = this.props
    this.dragPreview = createDragPreview(
      widget.text,
      dragPreviewStyle,
      this.dragPreview
    )
  }

  renderOptions() {
    const {
      closeAllOptions,
      index,
      listId,
      removeWidget,
      setCloseAllOptions,
      widget,
      isDragging
    } = this.props

    switch (this.props.widget.optionsDisplay) {
      case 'address':
        return (
          <Address
            closeAllOptions={closeAllOptions}
            index={index}
            removeWidget={removeWidget}
            setCloseAllOptions={setCloseAllOptions}
            widget={widget}
          />
        )
      case 'body':
        return (
          <Body
            closeAllOptions={closeAllOptions}
            index={index}
            removeWidget={removeWidget}
            setCloseAllOptions={setCloseAllOptions}
            widget={widget}
            getChartReports={this.props.getChartReports}
            views={this.props.views}
          />
        )
      case 'image':
        return (
          <Image
            closeAllOptions={closeAllOptions}
            index={index}
            removeWidget={removeWidget}
            setCloseAllOptions={setCloseAllOptions}
            widget={widget}
          />
        )
      case 'measures':
        return (
          <Projects
            closeAllOptions={closeAllOptions}
            index={index}
            removeWidget={removeWidget}
            setCloseAllOptions={setCloseAllOptions}
            widget={widget}
          />
        )
      case 'text':
        return (
          <Text
            closeAllOptions={closeAllOptions}
            index={index}
            removeWidget={removeWidget}
            setCloseAllOptions={setCloseAllOptions}
            widget={widget}
            isDragging={isDragging}
          />
        )
      case 'text-list':
        return (
          <TextList
            closeAllOptions={closeAllOptions}
            index={index}
            removeWidget={removeWidget}
            setCloseAllOptions={setCloseAllOptions}
            widget={widget}
          />
        )
      case 'title':
        return (
          <Title
            closeAllOptions={closeAllOptions}
            index={index}
            removeWidget={removeWidget}
            setCloseAllOptions={setCloseAllOptions}
            widget={widget}
          />
        )
      case 'divider':
        return (
          <Divider
            closeAllOptions={closeAllOptions}
            index={index}
            removeWidget={removeWidget}
            setCloseAllOptions={setCloseAllOptions}
            widget={widget}
          />
        )
    }
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
      connectDropTarget(<div>{this.renderOptions()}</div>)
    )
  }
}

const mapDispatchToProps = {
  bodyTemplate
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
  )(DropTarget(ItemTypes.WIDGET, widgetTarget, collectDropTarget)(Widget))
)
