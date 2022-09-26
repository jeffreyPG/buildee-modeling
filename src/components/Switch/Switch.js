import React from 'react'
import styles from './Switch.scss'
import classNames from 'classnames'

const Switch = ({ isSet, onSwitchToggled, label }) => {
  return (
    <div className={styles.switchContainer}>
      <span>{label}</span>
      <label
        className={classNames(styles.switch, isSet ? styles.switchEnable : '')}
      >
        <input
          type="checkbox"
          className={styles.switchInput}
          checked={isSet}
          onChange={onSwitchToggled}
        />
        <div className={styles.switchSubContainer}></div>
      </label>
    </div>
  )
}

export default Switch
