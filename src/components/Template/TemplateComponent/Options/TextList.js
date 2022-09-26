import React, { Component } from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import styles from './TemplateOptions.scss'
import BulletFormattedList from './BulletFormattedList'
import {
  bodyTemplate,
  templateUpdateError
} from 'routes/Template/modules/template'

export class TextList extends Component {
  static propTypes = {
    closeAllOptions: PropTypes.bool.isRequired,
    templateUpdateError: PropTypes.func.isRequired,
    index: PropTypes.number.isRequired,
    removeWidget: PropTypes.func.isRequired,
    setCloseAllOptions: PropTypes.func.isRequired,
    widget: PropTypes.object.isRequired,
    body: PropTypes.array
  }

  state = {
    optionsVisible: false,
    deleteToggleOpen: false,
    fields:
      (this.props.body &&
        this.props.body[this.props.index] &&
        this.props.body[this.props.index].fields) ||
      []
  }

  componentWillUnmount = () => {
    this.props.setCloseAllOptions(true)
  }

  handleClickRemoveWidget = () => {
    this.setState({ deleteToggleOpen: false })
    let body = JSON.parse(JSON.stringify(this.props.body))
    body.splice(this.props.index, 1)
    this.props.bodyTemplate(body)
    this.props.removeWidget(this.props.index)
    this.props.templateUpdateError()
  }

  handleClick = () => {
    if (this.node !== null) {
      this.props.setCloseAllOptions(false)
      if (!this.state.optionsVisible) {
        document.addEventListener('click', this.handleOutsideClick, false)
      } else {
        document.removeEventListener('click', this.handleOutsideClick, false)
      }
      this.setState(prevState => ({
        optionsVisible: !prevState.optionsVisible
      }))
    }
  }

  handleOutsideClick = e => {
    if (this.node !== null && this.node.contains(e.target)) {
      return
    }
    this.handleClick()
  }

  handleRemoveToggle = toggle => {
    if (toggle) {
      this.setState({ deleteToggleOpen: !this.state.deleteToggleOpen })
    } else {
      this.setState({ deleteToggleOpen: false })
    }
  }

  handleAddListItem = () => {
    let { body } = this.props
    let { fields } = this.state
    if (!body[this.props.index].fields) {
      body[this.props.index].fields = []
      fields = []
    }
    body[this.props.index].fields.push('')
    fields.push('')
    this.setState({ fields })
    this.props.bodyTemplate(body)
    this.props.templateUpdateError()
  }

  handleRemoveListItem = index => {
    let { body } = this.props
    body[this.props.index].fields.splice(index, 1)
    this.props.bodyTemplate(body)
    this.props.templateUpdateError()
  }

  handleChangeListItem = (event, index) => {
    let { body } = this.props
    let { fields } = this.state
    body[this.props.index].fields[index] = event.target.value
    this.setState({
      fields: [
        ...fields.slice(0, index),
        event.target.value,
        ...fields.slice(index + 1)
      ]
    })
    this.props.bodyTemplate(body)
    this.props.templateUpdateError()
  }

  handleClickSaveStyle = event => {
    let { body } = this.props
    body[this.props.index].type = event.target.value
    this.props.bodyTemplate(body)
    this.props.templateUpdateError()
  }

  renderListStyles = array => {
    const { body } = this.props
    return array.map((field, i) => {
      const { index } = this.props
      const ids = 'list-style-' + field.value
      const checked = Boolean(
        body && body[index] && body[index].type === field.value
      )
      return (
        <label key={i} htmlFor={ids}>
          <input
            type="radio"
            id={ids}
            name="list-style"
            value={field.value}
            defaultChecked={checked}
            onChange={e => this.handleClickSaveStyle(e)}
          />
          <span>{field.name}</span>
        </label>
      )
    })
  }

  renderControlOptions = () => {
    return (
      <div
        className={classNames(
          styles['content-options'],
          (!this.props.closeAllOptions && this.state.optionsVisible) ||
            this.state.deleteToggleOpen
            ? styles['optionsOpen']
            : ''
        )}
      >
        <i className={classNames('material-icons', styles['move'])}>gamepad</i>
        <i
          onClick={() => {
            this.handleClick()
          }}
          className="material-icons"
        >
          edit
        </i>
        <i
          onClick={() => {
            this.handleRemoveToggle(true)
          }}
          className="material-icons"
        >
          delete
        </i>
        {this.state.deleteToggleOpen && (
          <div className={styles['content-options__delete']}>
            <p>Delete this widget?</p>
            <div className={styles['content-options__delete-confirm']}>
              <div
                className={classNames(styles['content-options__btn-delete'])}
                onClick={() => this.handleClickRemoveWidget()}
              >
                Yes
              </div>
              <div
                className={classNames(styles['content-options__btn-cancel'])}
                onClick={() => this.handleRemoveToggle(false)}
              >
                No
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  render() {
    const { closeAllOptions, index, widget, body } = this.props
    const { fields } = this.state
    const listStyles = [
      { name: 'Bulleted List', value: 'unordered-list-text' },
      { name: 'Numbered List', value: 'ordered-list-text' }
    ]

    return (
      <div className={styles['editor-body']}>
        <div className={styles['editor-body__info']}>
          <i className="material-icons">format_list_bulleted</i>
          <span>{widget.text}</span>
          {!fields.length && (
            <div className={styles['editor-body__warning']}>
              <i className="material-icons warning">warning</i>
              No text added
            </div>
          )}
        </div>

        {this.renderControlOptions()}

        <div
          className={classNames(
            styles['editor-body__options'],
            styles['editor-body__text-list']
          )}
          ref={node => {
            this.node = node
          }}
        >
          <ol>
            {this.state.fields.map((itemText, i) => {
              return (
                <li
                  key={i}
                  className={classNames(
                    body[index].type === 'ordered-list-text'
                      ? styles['ordered']
                      : styles['unordered']
                  )}
                >
                  <textarea
                    ref="input"
                    type="text"
                    name="custom-text"
                    placeholder="Enter custom text here"
                    value={itemText}
                    onChange={e => {
                      this.handleChangeListItem(e, i)
                    }}
                  />
                  <span>
                    <i
                      onClick={() => {
                        this.handleRemoveListItem(i)
                      }}
                      className="material-icons"
                    >
                      delete
                    </i>
                  </span>
                </li>
              )
            })}
          </ol>
          {fields && (
            <div className={classNames(styles['editor-body__preview'])}>
              <i>
                Please click the pencil icon to select {widget.text} options
              </i>
            </div>
          )}

          {!closeAllOptions && this.state.optionsVisible && (
            <div className={styles['editor-body__inner']}>
              <button
                onClick={() => {
                  this.handleAddListItem()
                }}
                className={classNames(
                  styles['editor-body__add-item'],
                  styles.button,
                  styles.buttonPrimary
                )}
              >
                Add list item
              </button>

              <div className={styles['editor-body__list-style']}>
                <p>Choose a style:</p>
                {this.renderListStyles(listStyles)}
              </div>

              <div className={styles['editor-body__list-style']}>
                <p>Choose a style format:</p>
                <BulletFormattedList
                  handleUpdateTemplateState={
                    this.props.handleUpdateTemplateState
                  }
                  index={this.props.index}
                />
              </div>
            </div>
          )}
        </div>
      </div>
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

export default withConnect(TextList)
