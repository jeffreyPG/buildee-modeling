import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import styles from './ToggleButtonGroup.scss'

export class ToggleButtonGroup extends React.Component {
  static propTypes = {
    onToggle: PropTypes.func.isRequired,
    options: PropTypes.array.isRequired,
    defaultOption: PropTypes.string
  }
  onOptionToggled = value => () => {
    this.props.onToggle(value)
  }
  render() {
    const { options, selectedOption = '' } = this.props
    return (
      <div className={styles.toggleGroupContainer}>
        {options.map(({ value, icon }, index) => [
          <button
            key={`toggleIcon_${index}`}
            onClick={this.onOptionToggled(value)}
            className={classNames(
              styles.toggleButton,
              selectedOption === value && styles.toggleButtonSelected
            )}
          >
            <i className="material-icons">{icon}</i>
          </button>,
          options.length != index + 1 && <div className={styles.divider} />
        ])}
      </div>
    )
  }
}

export default ToggleButtonGroup
