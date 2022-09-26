import React, { Component } from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import styles from './TemplateOptions.scss'
import {
  bodyTemplate,
  templateUpdateError
} from 'routes/Template/modules/template'
import TextQuillEditor from '../../../UI/TextEditor/TextQuillEditor'

export class Text extends Component {
  static propTypes = {
    closeAllOptions: PropTypes.bool.isRequired,
    index: PropTypes.number.isRequired,
    removeWidget: PropTypes.func.isRequired,
    setCloseAllOptions: PropTypes.func.isRequired,
    body: PropTypes.array,
    widget: PropTypes.object.isRequired
  }

  state = {
    optionsVisible: false,
    deleteToggleOpen: false,
    placeholder: 'Enter custom text here',
    editorHtml:
      (this.props.body &&
        this.props.body[this.props.index] &&
        this.props.body[this.props.index].content) ||
      ''
  }

  componentWillUnmount = () => {
    this.props.setCloseAllOptions(true)
  }

  handleHTMLFocus = () => {
    const inputRef =
      this.refs &&
      this.refs.editor &&
      this.refs.editor.refs &&
      this.refs.editor.refs.input
    if (inputRef) {
      inputRef.focus()
    }
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

  handleDateUpdate = metaData => {
    let body = JSON.parse(JSON.stringify(this.props.body))
    body[this.props.index].metaData = metaData
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
            this.handleHTMLFocus()
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

  handleChange = html => {
    this.setState({ editorHtml: html })
    let { body } = this.props
    body[this.props.index].content = html
    let dynamicValues = html.split('<span class="qlDynamicTag').slice(1)
    dynamicValues = dynamicValues.filter(
      item =>
        item.includes(`data-value="utility.`) &&
        !item.includes('utility.summary.cbecs')
    )

    // Check Date Range On Export
    if (dynamicValues.length) {
      body[this.props.index].metaData = {
        ...(body[this.props.index].metaData || {}),
        yearOption: 'SetOnExport'
      }
    } else {
      body[this.props.index].metaData = {
        ...(body[this.props.index].metaData || {}),
        yearOption: 'SetYearRange'
      }
    }

    this.props.bodyTemplate(body)
    this.props.templateUpdateError()
  }

  getTextIndex = () => {
    const { index, body } = this.props
    const textWidgets = body.filter((item, pos) => {
      const type = (item && item.type) || ''
      return type === 'text' && pos < index
    })
    return textWidgets.length
  }

  render() {
    const { widget, body } = this.props
    const { editorHtml } = this.state
    let index = this.getTextIndex()
    let isCorrect = this.props.index === widget.id
    let metaData =
      (body && body[this.props.index] && body[this.props.index].metaData) || {}

    return (
      <div className={styles['editor-body']}>
        <div className={styles['editor-body__info']}>
          <i className="material-icons">text_fields</i>
          <span>{widget.text}</span>
          {!editorHtml && (
            <div className={styles['editor-body__warning']}>
              <i className="material-icons warning">warning</i>
              No text added
            </div>
          )}
        </div>

        {this.renderControlOptions()}

        <div className={classNames(styles['editor-body__options'])}>
          <TextQuillEditor
            ref="editor"
            handleChange={this.handleChange}
            html={editorHtml}
            placeholder="Enter custom text here"
            index={index}
            metaData={metaData}
            handleDateUpdate={this.handleDateUpdate}
            isCorrect={isCorrect}
            isDragging={this.props.isDragging}
          />
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

export default withConnect(Text)
