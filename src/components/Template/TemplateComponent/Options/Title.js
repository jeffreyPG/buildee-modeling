import React, { Component } from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import styles from './TemplateOptions.scss'
import {
  bodyTemplate,
  templateUpdateError
} from 'routes/Template/modules/template'

export class Title extends Component {
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
    inputValue:
      (this.props.body &&
        this.props.body[this.props.index] &&
        this.props.body[this.props.index].content) ||
      ''
  }

  constructor(props) {
    super(props)
    this.handleUpdateTemplate = this.handleUpdateTemplate.bind(this)
    this.debounceHandleChange = _.debounce(this.handleUpdateTemplate, 1000)
  }

  componentWillUnmount = () => {
    this.props.setCloseAllOptions(true)
  }

  UNSAFE_componentWillReceiveProps = nextProps => {
    if (
      this.props.body[this.props.index] &&
      nextProps.body[nextProps.index] &&
      this.props.body[this.props.index].content !==
        nextProps.body[nextProps.index].content
    ) {
      this.setState({ inputValue: nextProps.body[nextProps.index].content })
      if (this.refs && this.refs['input']) {
        this.refs['input'].value = nextProps.body[nextProps.index].content
      }
    }
  }

  handleClick = () => {
    if (this.node !== null) {
      this.props.setCloseAllOptions(false)
      if (!this.state.optionsVisible) {
        document.addEventListener('mousedown', this.handleOutsideClick, false)
      } else {
        document.removeEventListener(
          'mousedown',
          this.handleOutsideClick,
          false
        )
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

  handleInputFocus = () => {
    this.refs.input.focus()
  }

  handleRemoveToggle = toggle => {
    if (toggle) {
      this.setState({ deleteToggleOpen: !this.state.deleteToggleOpen })
    } else {
      this.setState({ deleteToggleOpen: false })
    }
  }

  handleClickRemoveWidget = () => {
    this.setState({ deleteToggleOpen: false })
    let body = JSON.parse(JSON.stringify(this.props.body))
    body.splice(this.props.index, 1)
    this.props.bodyTemplate(body)
    this.props.removeWidget(this.props.index)
    this.props.templateUpdateError()
  }

  handleTextInput = event => {
    let { body } = this.props
    body[this.props.index].content = event.target.value
    body[this.props.index].headingEle =
      body[this.props.index].headingEle || 'h1'
    body[this.props.index].ele = body[this.props.index].ele || 'h1'
    this.setState({ inputValue: event.target.value })
    this.debounceHandleChange(body)
  }

  handleUpdateTemplate = body => {
    this.props.bodyTemplate(body)
    this.props.templateUpdateError()
  }

  saveTitleStyle = e => {
    let body = JSON.parse(JSON.stringify(this.props.body))
    body[this.props.index].headingEle = e.target.value
    body[this.props.index].ele = e.target.value
    this.props.bodyTemplate(body)
    this.props.templateUpdateError()
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
          data-test="template-title-edit-option"
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
    const { closeAllOptions, index, body, widget } = this.props

    const titleStyles = [
      { name: 'Heading 1', value: 'h1' },
      { name: 'Heading 2', value: 'h2' },
      { name: 'Heading 3', value: 'h3' },
      { name: 'Heading 4', value: 'h4' },
      { name: 'Heading 5', value: 'h5' },
      { name: 'Heading 6', value: 'h6' }
    ]

    const { inputValue } = this.state
    return (
      <div className={styles['editor-body']}>
        <div className={styles['editor-body__info']}>
          <i className="material-icons">title</i>
          <span>{widget.text}</span>
          {!inputValue && (
            <div className={styles['editor-body__warning']}>
              <i className="material-icons warning">warning</i>
              No text added
            </div>
          )}
        </div>

        {this.renderControlOptions()}

        <div
          className={classNames(styles['editor-body__options'])}
          ref={node => {
            this.node = node
          }}
        >
          {body && body[index] && !body[index].ele && (
            <div
              className={classNames(
                styles['editor-body__preview'],
                styles['title-preview']
              )}
            >
              <i>Please click the pencil icon to select a style</i>
            </div>
          )}
          <textarea
            ref="input"
            defaultValue={
              body && body[index] && body[index].content
                ? body[index].content
                : ''
            }
            type="text"
            name="custom-text"
            data-test="template-title-text"
            placeholder="Enter custom text here"
            onChange={this.handleTextInput}
          />

          {!closeAllOptions && this.state.optionsVisible && (
            <div>
              <div className={styles['editor-body__list-style']}>
                <p>Choose a style:</p>
                {titleStyles.map(field => {
                  const id = 'title-style-' + field.value
                  const bodyElement = body && body[index]
                  // h1 values are checked by default
                  let checked =
                    field.value === 'h1' &&
                    !(
                      (bodyElement && bodyElement.headingEle) ||
                      bodyElement.ele
                    )
                  if (bodyElement) {
                    checked = bodyElement.headingEle
                      ? bodyElement.headingEle === field.value
                      : bodyElement.ele === field.value
                  }

                  return (
                    <label key={`title-style-${field.value}`} htmlFor={id}>
                      <input
                        type="radio"
                        id={id}
                        name="title-style"
                        data-test={`template-title-style-${field.value}`}
                        value={field.value}
                        defaultChecked={checked}
                        onChange={e => this.saveTitleStyle(e)}
                      />
                      <span>{field.name}</span>
                    </label>
                  )
                })}
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

export default withConnect(Title)
