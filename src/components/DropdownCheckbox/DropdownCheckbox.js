import React, { useState, useEffect, useRef, useCallback } from 'react'
import classNames from 'classnames'
import { truncateText } from 'utils/Utils'
import ToolTip from 'components/ToolTip'

import styles from './DropdownCheckbox.scss'

const DropdownCheckbox = ({
  options = [],
  selectedValues = [],
  handleSelect,
  hasSecondDropdown = false,
  secondOptions = [],
  handleSelectSecond = null,
  selectedSecondValues = {},
  title = '',
  truncatTextLength = 20,
  isCentered = false
}) => {
  const ref = useRef()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const renderTitle = () => {
    const selectedLabels = options
      .filter(({ value }) => selectedValues.includes(value))
      .map(({ label }) => label)
    return (selectedLabels.length > 0 && selectedLabels.join(', ')) || title
  }

  const handleOpenDropdown = () => {
    setDropdownOpen(true)
  }

  const handleSelectAll = checked => {
    if (checked) {
      handleSelect(options.map(item => item.value))
    } else {
      handleSelect([])
    }
    hasSecondDropdown && handleSelectSecond && handleSelectSecond({})
  }

  const handleOptionCheck = (value, checked) => {
    let newValues = [...new Set(selectedValues || [])]
    if (checked) newValues = [...newValues, value]
    else newValues = [...newValues].filter(item => item !== value)
    handleSelect(newValues)
  }

  const isAllChecked =
    options.length === selectedValues.length &&
    options.every(({ value }) => selectedValues.includes(value))

  const handleClickOutside = useCallback(
    event => {
      if (ref.current && !ref.current.contains(event.target)) {
        setDropdownOpen(false)
      }
    },
    [ref]
  )

  useEffect(() => {
    document.addEventListener('click', handleClickOutside, false)
    return () => {
      document.removeEventListener('click', handleClickOutside, false)
    }
  }, [handleClickOutside])

  const handleChangeSecondDropdown = (e, value) => {
    const newValues = Object.assign({}, selectedSecondValues, {
      [value]: e.target.value
    })
    handleSelectSecond && handleSelectSecond(newValues)
  }

  return (
    <div
      className={classNames(styles.dropdown)}
      onClick={handleOpenDropdown}
      ref={ref}
    >
      <ToolTip content={<span>{renderTitle()}</span>} direction="right">
        <span>{truncateText(renderTitle(), truncatTextLength)}</span>
      </ToolTip>
      <div
        className={classNames(styles.selectIcons, {
          [styles['selectIcons-opened']]: dropdownOpen
        })}
      >
        <i className={classNames('material-icons', styles.selectArrow)}>
          arrow_drop_down
        </i>
      </div>
      {dropdownOpen && (
        <div className={styles.dropdownOptionList}>
          <div
            className={classNames(styles.checkboxContainer, {
              [styles.centerCheckbox]: !isCentered
            })}
          >
            <label>
              <input
                checked={isAllChecked}
                onChange={() => handleSelectAll(!isAllChecked)}
                value={'all'}
                className={classNames(isAllChecked ? styles['checked'] : '')}
                type="checkbox"
              />
              <span className={styles.checkboxSelectAll}>
                {isAllChecked ? 'Deselect All' : 'Select All'}
              </span>
            </label>
          </div>
          {options &&
            options.map(({ value, label }) => {
              const isChecked = selectedValues.includes(value)
              const secondValue =
                (hasSecondDropdown &&
                  selectedSecondValues &&
                  selectedSecondValues[value]) ||
                null
              return (
                <div className={styles.itemContainer}>
                  <div className={styles.itemContainerCheckbox}>
                    <div
                      className={classNames(styles.checkboxContainer, {
                        [styles.centerCheckbox]: !isCentered
                      })}
                      key={value}
                    >
                      <label>
                        <input
                          checked={isChecked}
                          onClick={e =>
                            handleOptionCheck(value, e.target.checked)
                          }
                          className={classNames(
                            isChecked ? styles['checked'] : ''
                          )}
                          type="checkbox"
                          value={value}
                        />
                        <span></span>
                      </label>
                    </div>
                    <div
                      onClick={() => {
                        handleOptionCheck(value, !isChecked)
                      }}
                    >
                      {label}
                    </div>
                  </div>
                  {isChecked && hasSecondDropdown && (
                    <div className={styles.selectContainer}>
                      <select
                        value={secondValue}
                        onChange={e => handleChangeSecondDropdown(e, value)}
                      >
                        <option defaultValue value="">
                          Select User Role
                        </option>
                        {secondOptions.map(({ value, label }) => (
                          <option key={value} value={value}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              )
            })}
        </div>
      )}
    </div>
  )
}

export default DropdownCheckbox
