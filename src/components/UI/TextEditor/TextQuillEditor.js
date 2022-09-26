import React, { Component } from 'react'
import PropTypes from 'prop-types'
import ReactQuill from 'react-quill'
import styles from './TextQuillEditor.scss'
import EditorToolbar, { formats } from './EditorToolbar'
import PersonalizeModal from './PersonalizeModal'
import { debounce } from 'lodash'
import { Portal } from 'react-portal'
import ImagePickerModal from './ImagePickerModal'

class TextQuillEditor extends Component {
  static propTypes = {
    html: PropTypes.string.isRequired,
    handleChange: PropTypes.func.isRequired,
    placeholder: PropTypes.string.isRequired,
    index: PropTypes.number.isRequired,
    disabled: PropTypes.bool,
    isImageDisabled: PropTypes.bool
  }

  static defaultProps = {
    isImageDisabled: false
  }

  state = {
    editorHtml: this.props.html,
    personalizeIndex: -1,
    personalizeImageIndex: -1,
    squarePosition: 'Center',
    cursorPosition: null,
    quill: null,
    modules: {}
  }

  constructor(props) {
    super(props)
    this.debounceHandleChange = debounce(props.handleChange, 1000)
  }

  UNSAFE_componentWillMount() {
    let modules = this.getModules()
    this.setState({
      modules
    })
  }

  componentDidMount() {
    let quill = this.refs.input.getEditor()
    this.setState(
      {
        quill
      },
      () => {
        let modules = this.getModules()
        this.setState({
          modules
        })
      }
    )
  }

  undoChange = () => {
    const { quill } = this.state
    quill.history.undo()
  }

  redoChange = () => {
    const { quill } = this.state
    quill.history.redo()
  }

  personalizeClick = () => {
    const { quill } = this.state
    const cursorPosition = quill.getSelection().index
    const rect = quill.getBounds(cursorPosition)
    this.handleOpenPersonalize(cursorPosition, rect)
  }

  getModules = () => {
    let id = `toolbar${this.props.index}`
    let modules = {
      toolbar: {
        container: `#${id}`,
        handlers: {
          undo: this.undoChange,
          redo: this.redoChange,
          personalize: this.personalizeClick,
          image: this.handleImageClick
        }
      },
      history: {
        delay: 500,
        maxStack: 100,
        userOnly: true
      }
    }
    return modules
  }

  handleOpenPersonalize = (index, cursorRect) => {
    const editor = document.getElementsByClassName('ql-container')[
      this.props.index
    ]
    const editorRect = editor.getClientRects()[0]
    const top = cursorRect.bottom + cursorRect.height - 8
    let left = cursorRect.left - 200
    let squarePosition = 'Center'
    if (left > editorRect.width - 400) {
      left = left - 188
      squarePosition = 'Right'
    } else if (left < 0) {
      squarePosition = 'Left'
      left += 188
    }
    this.setState({
      personalizeIndex: index,
      cursorPosition: {
        top: top + editorRect.top + window.scrollY,
        left: left + editorRect.left + window.scrollX
      },
      squarePosition: squarePosition
    })
  }

  handleOpenImageOption = (index, cursorRect) => {
    const editor = document.getElementsByClassName('ql-container')[
      this.props.index
    ]
    const editorRect = editor.getClientRects()[0]
    const top = cursorRect.bottom + cursorRect.height - 8
    let left = cursorRect.left - 200
    let squarePosition = 'Center'
    if (left > editorRect.width - 400) {
      left = left - 188
      squarePosition = 'Right'
    } else if (left < 0) {
      squarePosition = 'Left'
      left += 188
    }
    this.setState({
      personalizeImageIndex: index,
      cursorPosition: {
        top: top + editorRect.top + window.scrollY,
        left: left + editorRect.left + window.scrollX
      },
      squarePosition: squarePosition
    })
  }

  handleImageClick = () => {
    const { quill } = this.state
    const cursorPosition = quill.getSelection().index
    const rect = quill.getBounds(cursorPosition)
    this.handleOpenImageOption(cursorPosition, rect)
  }

  handleClosePersonalize = (field, value, metaData) => {
    if (field) {
      let { personalizeIndex, quill } = this.state
      if (field.role) {
        quill.editor.insertEmbed(personalizeIndex, 'contactTag', {
          label: `${field.role}: ${field.name}`,
          value: field.value,
          role: field.role,
          defaultValue: value
        })
      } else {
        quill.editor.insertEmbed(personalizeIndex, 'dynamicTag', {
          label: field.name,
          value: field.value,
          defaultValue: value
        })
      }
      quill.insertText(personalizeIndex + 1, ' ')
      quill.setSelection(personalizeIndex + 2)
      this.setState({
        cursorPosition: null,
        personalizeIndex: -1
      })
      if (metaData) {
        const { handleDateUpdate } = this.props
        handleDateUpdate && handleDateUpdate(metaData)
      }
    } else {
      this.setState({
        cursorPosition: null,
        personalizeIndex: -1
      })
    }
  }

  handleCloseImageModal = (result, option) => {
    if (result) {
      let { personalizeImageIndex, quill } = this.state
      quill.editor.insertEmbed(personalizeImageIndex, 'imageTag', {
        ...result,
        option
      })
      quill.insertText(personalizeImageIndex + 1, ' ')
      quill.setSelection(personalizeImageIndex + 2)
      this.setState({
        cursorPosition: null,
        personalizeImageIndex: -1
      })
    } else {
      this.setState({
        cursorPosition: null,
        personalizeImageIndex: -1
      })
    }
  }

  UNSAFE_componentWillReceiveProps = nextProps => {
    if (
      nextProps.html !== this.props.html &&
      this.state.editorHtml !== nextProps.html
    ) {
      this.setState({ editorHtml: nextProps.html })
    }
  }

  handleChange = (delta, oldDelta, source) => {
    const { isCorrect, isDragging } = this.props
    if (isDragging) return
    if (isCorrect === true || isCorrect === undefined) {
      this.setState({ editorHtml: delta })
      this.debounceHandleChange(delta)
      if (!delta.includes('{{proposalFieldValues.')) {
        const { handleDateUpdate, metaData } = this.props
        let updatedMetaData = Object.assign({}, metaData)
        delete updatedMetaData['proposalTemplateId']
        handleDateUpdate && handleDateUpdate(updatedMetaData)
      }
    }
  }

  render() {
    const {
      editorHtml,
      personalizeIndex,
      personalizeImageIndex,
      cursorPosition,
      squarePosition,
      modules
    } = this.state
    const { placeholder, index } = this.props
    const containerID = `toolbar${index}`
    let top = 0,
      left = 0
    if (
      cursorPosition &&
      (personalizeIndex !== -1 || personalizeImageIndex !== -1)
    ) {
      top = cursorPosition.top
      left = cursorPosition.left
    }

    let filteredFormats = [...formats]
    if (this.props.isImageDisabled) {
      filteredFormats = filteredFormats.filter(
        item => item !== 'image' && item !== 'imageTag'
      )
    }

    return (
      <div className={styles.quilContainer}>
        <div className="text-editor">
          <EditorToolbar
            containerID={containerID}
            hidePersonalize={this.props.hidePersonalize}
            isImageDisabled={this.props.isImageDisabled}
          />
          <ReactQuill
            ref="input"
            index={index}
            className={styles.quill}
            theme="snow"
            onChange={(delta, oldDelta, source) =>
              this.handleChange(delta, oldDelta, source)
            }
            value={editorHtml}
            modules={modules}
            formats={filteredFormats}
            placeholder={placeholder}
            readOnly={this.props.disabled}
          />
        </div>
        {personalizeIndex !== -1 && (
          <Portal>
            <div style={{ zIndex: '100', position: 'absolute', top, left }}>
              <PersonalizeModal
                squarePosition={squarePosition}
                handleClosePersonalize={this.handleClosePersonalize}
                metaData={this.props.metaData}
              />
            </div>
          </Portal>
        )}
        {personalizeImageIndex !== -1 && (
          <Portal>
            <div style={{ zIndex: '100', position: 'absolute', top, left }}>
              <ImagePickerModal
                squarePosition={squarePosition}
                handleCloseModal={this.handleCloseImageModal}
                metaData={this.props.metaData}
              />
            </div>
          </Portal>
        )}
      </div>
    )
  }
}

export default TextQuillEditor
