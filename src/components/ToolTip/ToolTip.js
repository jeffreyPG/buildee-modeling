import React, { Component } from 'react'
import classNames from 'classnames'

import styles from './ToolTip.scss'

/**
 * props.content: ToolTip Content
 * props.direction: ToolTip direction
 */

class ToolTip extends Component {
  state = {
    active: false
  }

  static defaultProps = {
    direction: 'top'
  }

  showTip = () => {
    this.setState({
      active: true
    })
  }

  hideTip = () => {
    this.setState({
      active: false
    })
  }

  render() {
    const { active } = this.state
    return (
      <div
        className={styles.toolTipWrapper}
        onMouseEnter={this.showTip}
        onMouseLeave={this.hideTip}
      >
        {this.props.children}
        {active && (
          <div
            className={classNames(
              styles.toolTipTip,
              styles[`toolTip${this.props.direction}`]
            )}
          >
            {this.props.content}
          </div>
        )}
      </div>
    )
  }
}
export default ToolTip
