import React, { Component } from 'react'
import { connect } from 'react-redux'
import update from 'immutability-helper';
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { TemplateWidget, Widget, ItemTypes } from './Widgets'
import { DropTarget } from 'react-dnd'
import UserFeature from '../../../utils/Feature/UserFeature'
import styles from './Panel.scss'

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

class Panel extends Component {
  static propTypes = {
    accepts: PropTypes.array.isRequired,
    id: PropTypes.number.isRequired,
    list: PropTypes.array,
    setBgColor: PropTypes.func.isRequired,
    proUser: PropTypes.bool.isRequired,
    views: PropTypes.array,
    body: PropTypes.array
  }

  state = {
    widgets: [],
    closeAllOptions: false
  }

  generateBodyWidgets = body => {
    let bodyWidgets = []
    body.map((widget, index) => {
      // match with page elements above
      let text = ''
      let optionsDisplay = ''
      let icon = ''
      switch (widget.type) {
        case 'title':
          text = 'Title'
          optionsDisplay = 'title'
          icon = 'title'
          break
        // case 'div':
        //   text = 'Data'
        //   optionsDisplay = 'body'
        //   icon = 'format_align_left'
        //   break
        case 'text':
          text = 'Text'
          optionsDisplay = 'text'
          icon = 'text_fields'
          break
        case 'table':
          text = 'Table'
          optionsDisplay = 'body'
          icon = 'table_chart'
          break
        case 'equipment':
          text = 'Equipment'
          optionsDisplay = 'body'
          icon = 'table_chart'
          break
        case 'chart':
          text = 'Chart'
          optionsDisplay = 'body'
          icon = 'table_chart'
          break
        case 'measures':
          text = 'Measures'
          optionsDisplay = 'measures'
          icon = 'table_chart'
          break
        case 'image':
          text = 'Image'
          optionsDisplay = 'image'
          icon = 'photo'
          break
        // case 'ordered-list':
        // case 'unordered-list':
        //   text = 'Data List'
        //   optionsDisplay = 'body'
        //   icon = 'format_list_bulleted'
        //   break
        // case 'ordered-list-text':
        // case 'unordered-list-text':
        //   text = 'Text List'
        //   optionsDisplay = 'text-list'
        //   icon = 'format_list_bulleted'
        //   break
        case 'address':
          text = 'Aerial Image'
          optionsDisplay = 'address'
          icon = 'place'
          break
        case 'divider':
          text = 'Divider'
          optionsDisplay = 'divider'
          icon = 'remove'
          break
      }

      bodyWidgets.push({
        id: index,
        text: text,
        optionsDisplay: optionsDisplay,
        icon: icon,
        type: [ItemTypes.BODY]
      })
    })
    return bodyWidgets
  }

  componentDidMount = () => {
    if (this.props.body && !this.props.list) {
      const bodyWidgets = this.generateBodyWidgets(this.props.body)
      this.setState({ widgets: bodyWidgets })
    } else if (this.props.list) {
      this.setState({ widgets: this.props.list })
    }
  }
  componentDidUpdate = prevProps => {
    if (prevProps !== this.props && this.props.body && !this.props.list) {
      const bodyWidgets = this.generateBodyWidgets(this.props.body)
      this.setState({ widgets: bodyWidgets })
    }
    if (prevProps !== this.props && this.props.list) {
      this.setState({ widgets: this.props.list })
    }
  }

  pushWidget = widget => {
    this.setState(
      update(this.state, {
        widgets: {
          $push: [widget]
        }
      })
    )
  }

  removeWidget = index => {
    this.setState(
      update(this.state, {
        widgets: {
          $splice: [[index, 1]]
        }
      })
    )
    if (this.state.widgets.length <= 1) {
      this.props.setBgColor('')
    }
  }

  moveWidget = (dragIndex, hoverIndex) => {
    const { widgets } = this.state
    const dragWidget = widgets[dragIndex]

    this.setState(
      update(this.state, {
        widgets: {
          $splice: [
            [dragIndex, 1],
            [hoverIndex, 0, dragWidget]
          ]
        }
      })
    )
  }

  renderOverlay = color => {
    return (
      <div
        style={{
          position: 'absolute',
          top: '10px',
          left: 0,
          bottom: '10px',
          height: 'calc(100% - 20px)',
          width: '100%',
          zIndex: 1,
          opacity: 0.25,
          backgroundColor: color
        }}
      />
    )
  }

  closeOptions = boolean => {
    this.setState({ closeAllOptions: boolean })
  }

  render() {
    const { canDrop, connectDropTarget, isOver, setBgColor } = this.props
    const { widgets } = this.state
    let emptyCheck = widgets.length === 0
    return connectDropTarget(
      <div
        data-test={
          canDrop ? 'droppable-template-panel' : 'draggable-template-panel'
        }
        className={classNames(emptyCheck ? styles.empty : '')}
      >
        {isOver && !canDrop && this.renderOverlay('#dc3545')}
        {!isOver && canDrop && this.renderOverlay('#ffc107')}
        {isOver && canDrop && this.renderOverlay('#28a745')}
        {!!emptyCheck && (
          <div className={styles.emptyBody}>
            <div className={styles.emptyBodyTitle}>Add body content</div>
            <div className={styles.emptyBodyDescription}>
              Drag and drop blocks from the tool bar here.
            </div>
          </div>
        )}
        {widgets.map((widget, i) => {
          if (this.props.id !== 1) {
            return (
              <Widget
                closeAllOptions={this.state.closeAllOptions}
                index={i}
                key={i}
                listId={this.props.id}
                moveWidget={this.moveWidget}
                removeWidget={this.removeWidget}
                setCloseAllOptions={this.closeOptions}
                widget={widget}
              />
            )
          }
          if (widget.featureFlag) {
            return (
              <UserFeature name={widget.featureFlag} key={i}>
                {({ enabled }) => {
                  if (!enabled) return null
                  return (
                    <TemplateWidget
                      index={i}
                      key={i}
                      listId={this.props.id}
                      setBgColor={setBgColor}
                      widget={widget}
                    />
                  )
                }}
              </UserFeature>
            )
          }
          return (
            <TemplateWidget
              index={i}
              key={i}
              listId={this.props.id}
              setBgColor={setBgColor}
              widget={widget}
            />
          )
        })}
      </div>
    )
  }
}

const mapDispatchToProps = {}

const mapStateToProps = state => ({
  body: state.template.templateViewBody || [],
  organizationView: state.organization.organizationView || {},
  proUser: Boolean(
    state.login.user &&
      state.login.user.firebaseRefs.orgId &&
      state.login.user.firebaseRefs.userId
  ),
  views: state.template.views || []
})

const withConnect = connect(mapStateToProps, mapDispatchToProps)

export default withConnect(
  DropTarget(props => props.accepts, widgetTarget, collectDropTarget)(Panel)
)
