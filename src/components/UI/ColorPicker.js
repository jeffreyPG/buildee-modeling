import React, { Component } from 'react'
import { SketchPicker } from 'react-color'
import styles from './ColorPicker.scss'
import classNames from 'classnames'
import PropTypes from 'prop-types'
import { PortalWithState } from 'react-portal'

class ColorPicker extends Component {
  state = {
    top: 0,
    left: 0
  }

  static propTypes = {
    color: PropTypes.string.isRequired,
    handleChangeColor: PropTypes.func.isRequired
  }

  handleChange = color => {
    this.props.handleChangeColor(color.hex)
  }

  handleClick() {
    if (this.node) {
      const element = this.node.getClientRects()[0]
      const top = element.top + window.scrollY + element.height
      const left = element.left + window.scrollX

      this.setState({ top, left })
    }
  }

  render() {
    let { color } = this.props
    const { top, left } = this.state
    color = color ? color.substring(1) : ''
    return (
      <PortalWithState closeOnOutsideClick closeOnEsc>
        {args => {
          return (
            <div className={classNames(styles['colorPicker'])}>
              <input
                readOnly
                value={color}
                onClick={e => {
                  args.openPortal(e)
                  this.handleClick()
                }}
                ref={node => {
                  this.node = node
                }}
              ></input>
              {args.portal(
                <div
                  id="portal"
                  style={{ zIndex: '20', position: 'absolute', top, left }}
                >
                  <SketchPicker color={color} onChange={this.handleChange} />
                </div>
              )}
            </div>
          )
        }}
      </PortalWithState>
    )
  }
}

export default ColorPicker
