import React, { Component } from 'react'
import update from 'immutability-helper';
import { DropTarget } from 'react-dnd'
import ColumnWidget from './ColumnWidget'

const widgetTarget = {
  drop(props, monitor, component) {
    const { id } = props
    const sourceObj = monitor.getItem()

    if (sourceObj.widget.type.includes(id) && id !== sourceObj.listId) {
      component.pushWidget(sourceObj.widget)
    }
    return {
      listId: id
    }
  },

  canDrop(props, monitor) {
    if (monitor.getItem().widget.type.includes(props.id)) {
      return true
    }
  }
}

function collectDropTarget(connect, monitor) {
  return {
    connectDropTarget: connect.dropTarget(),
    isOver: monitor.isOver(),
    canDrop: monitor.canDrop()
  }
}

class ColumnPanel extends Component {
  state = {
    widgets: this.props.list
  }

  componentDidUpdate = prevProps => {
    if (prevProps !== this.props && this.props.list) {
      this.setState({ widgets: this.props.list })
    }
  }

  moveWidget = (dragIndex, hoverIndex) => {
    const { widgets } = this.state
    const dragWidget = widgets[dragIndex]

    this.setState(
      update(this.state, {
        widgets: {
          $splice: [[dragIndex, 1], [hoverIndex, 0, dragWidget]]
        }
      })
    )
    this.props.handleUpdateColumn(this.state.widgets)
  }

  render() {
    const { widgets } = this.state
    const { user, connectDropTarget, canDrop, isOver, list } = this.props
    return connectDropTarget(
      <div
        data-test={
          canDrop ? 'droppable-template-panel' : 'draggable-template-panel'
        }
      >
        {widgets &&
          widgets.map((item, index) => (
            <ColumnWidget
              user={user}
              item={item}
              list={list}
              index={index}
              key={item.value}
              moveWidget={this.moveWidget}
              handleRemoveColumn={this.props.handleRemoveColumn}
              handleUpdateColumn={this.props.handleUpdateColumn}
            />
          ))}
      </div>
    )
  }
}
export default DropTarget(
  props => props.accepts,
  widgetTarget,
  collectDropTarget
)(ColumnPanel)
