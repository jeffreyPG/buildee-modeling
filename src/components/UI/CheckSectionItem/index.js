import React, { Component } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'

import styles from './CheckSectionItem.scss'

class CheckSectionItem extends Component {
  static propTypes = {
    isChecked: PropTypes.bool,
    toggleField: PropTypes.func,
    saveHeading: PropTypes.func,
    customLabel: PropTypes.string
  }

  static defaultProps = {
    isChecked: false
  }

  state = {
    customHeading: this.props.customLabel,
    node: null,
    isSelected: false
  }

  handleOutsideClick = event => {
    const { item } = this.props
    event.preventDefault()
    if (this.state.node !== null && this.state.node.contains(event.target)) {
      return
    }
    this.saveHeading(item, this.state.customHeading)
  }

  selectHeading = (event, heading) => {
    const { isChecked } = this.props
    if (!isChecked) return
    event.preventDefault()
    event.stopPropagation()
    this.setState({
      customHeading: heading,
      isSelected: true
    })
    document.addEventListener('click', this.handleOutsideClick, false)
  }

  saveHeading = (event, value = '') => {
    const { isChecked, saveHeading } = this.props
    if (!isChecked) return
    if (event.preventDefault) {
      event.preventDefault()
      event.stopPropagation()
    }
    saveHeading(event, value)
    this.setState({
      isSelected: false,
      node: null
    })
    document.removeEventListener('click', this.handleOutsideClick, false)
  }

  handleUpdateHeading = event => {
    const { isChecked } = this.props
    event.preventDefault()
    if (isChecked) {
      this.setState({
        customHeading: event.target.value
      })
    }
  }

  render() {
    const { isChecked, item, toggleField } = this.props
    const { isSelected, customHeading } = this.state

    return (
      <label className={classNames(styles.checkboxContainer)}>
        <input
          defaultChecked={isChecked}
          value={item.value}
          className={classNames(isChecked ? styles.checked : '')}
          onChange={e => toggleField(e)}
          type="checkbox"
        />
        <span className={styles.customLabelSpan}>
          {!isSelected ? (
            <div className={styles.fieldNameContainer}>
              {customHeading}
              {isChecked && (
                <i
                  className="material-icons"
                  onClick={e => this.selectHeading(e, customHeading)}
                >
                  edit
                </i>
              )}
            </div>
          ) : (
            <div
              className={styles.fieldNameContainer}
              ref={node => {
                if (!this.state.node) this.setState({ node: node })
              }}
            >
              <input
                className={styles.input}
                type="text"
                value={customHeading}
                onChange={e => {
                  this.handleUpdateHeading(e)
                }}
              />
              <i
                className="material-icons"
                onClick={e => this.saveHeading(e, customHeading)}
              >
                close
              </i>
            </div>
          )}
        </span>
      </label>
    )
  }
}

export default CheckSectionItem
