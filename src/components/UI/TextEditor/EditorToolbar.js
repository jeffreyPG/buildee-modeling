import React, { Component } from 'react'
import classNames from 'classnames'
import ReactQuill from 'react-quill'
import { DynamicTag } from './DynamicTag/DynamicTag'
import PropTypes from 'prop-types'
import styles from './TextQuillEditor.scss'
import { ContactTag } from './ContactTag/ContactTag'
import { ImageTag } from './ImageTag/ImageTag'

ReactQuill.Quill.register({
  'formats/dynamicTag': DynamicTag,
  'formats/contactTag': ContactTag,
  'formats/imageTag': ImageTag
})

const CustomUndo = () => (
  <svg viewBox="0 0 18 18">
    <polygon className="ql-fill ql-stroke" points="6 10 4 12 2 10 6 10" />
    <path
      className="ql-stroke"
      d="M8.09,13.91A4.6,4.6,0,0,0,9,14,5,5,0,1,0,4,9"
    />
  </svg>
)

// Redo button icon component for Quill editor
const CustomRedo = () => (
  <svg viewBox="0 0 18 18">
    <polygon className="ql-fill ql-stroke" points="12 10 14 12 16 10 12 10" />
    <path
      className="ql-stroke"
      d="M9.91,13.91A4.6,4.6,0,0,1,9,14a5,5,0,1,1,5-5"
    />
  </svg>
)

export const formats = [
  'header',
  'font',
  'bold',
  'italic',
  'underline',
  'align',
  'strike',
  'script',
  'background',
  'list',
  'bullet',
  'indent',
  'link',
  'image',
  'color',
  'code-block',
  'dynamicTag',
  'contactTag',
  'imageTag'
]

class EditorToolbar extends Component {
  static propTypes = {
    containerID: PropTypes.string.isRequired
  }

  render() {
    const { containerID, isImageDisabled } = this.props
    return (
      <div id={containerID}>
        {/* <span className="ql-formats">
          <select className="ql-header" defaultValue="">
            <option value="1">H1</option>
            <option value="2">H2</option>
            <option value="3">H3</option>
            <option value="4">H4</option>
            <option value="5">H5</option>
            <option value="6">H6</option>
            <option value="">Normal</option>
          </select>
        </span> */}
        <span className="ql-formats">
          <button className="ql-bold" />
          <button className="ql-italic" />
          <button className="ql-underline" />
          <button className="ql-strike" />
        </span>
        <span className="ql-formats">
          <button className="ql-list" value="ordered" />
          <button className="ql-list" value="bullet" />
          <button className="ql-indent" value="-1" />
          <button className="ql-indent" value="+1" />
        </span>
        <span className="ql-formats">
          <button className="ql-script" value="super" />
          <button className="ql-script" value="sub" />
        </span>
        <span className="ql-formats">
          <select className="ql-align" />
          <select className="ql-color" />
          <select className="ql-background" />
        </span>
        <span className="ql-formats">
          <button className="ql-link" />
          {!isImageDisabled && <button className="ql-image" />}
        </span>
        <span className="ql-formats">
          <button className="ql-clean" />
          <button className="ql-undo">
            <CustomUndo />
          </button>
          <button className="ql-redo">
            <CustomRedo />
          </button>
          {!this.props.hidePersonalize && (
            <button
              className={classNames(styles.personalizeButton, 'ql-personalize')}
            >
              Data Point
            </button>
          )}
        </span>
      </div>
    )
  }
}

export default EditorToolbar
