import classNames from 'classnames'
import PropTypes from 'prop-types'
import React, { Component } from 'react'

import styles from './ToggleTab.scss'

class ToggleTab extends Component {
  static propTypes = {
    onToggle: PropTypes.func.isRequired,
    options: PropTypes.array.isRequired,
    defaultOption: PropTypes.string
  }

  onOptionToggled = value => () => {
    if (value != defaultOption || !defaultOption) this.props.onToggle(value)
  }

  render() {
    const { options, defaultOption = '' } = this.props
    return (
      <div className={styles.ToggleTab}>
        {options.map(({ value, icon = null, name = null }, index) => {
          return (
            <div
              key={`Toggle-Item-${index}`}
              className={classNames(
                styles.ToggleTabItem,
                value === defaultOption ? styles.ToggleTabItemActive : ''
              )}
              onClick={() => this.props.onToggle(value)}
            >
              {!!name && name}
              {!!icon && <i className="material-icons">{icon}</i>}
            </div>
          )
        })}
      </div>
    )
  }
}
export default ToggleTab
