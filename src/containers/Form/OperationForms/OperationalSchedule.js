import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import styles from './OperationSchedule.scss'
import { Field } from '../FormFields'

const getTime = hour => {
  if (hour === 0) {
    return `12:00AM`
  } else if (hour <= 12) {
    return `${hour}:00${hour < 12 ? 'AM' : 'PM'}`
  } else {
    return `${hour - 12}:00${hour < 12 ? 'AM' : 'PM'}`
  }
}

export class OperationSchedule extends React.Component {
  static propTypes = {
    periods: PropTypes.array.isRequired,
    type: PropTypes.string.isRequired,
    daySchedule: PropTypes.object.isRequired,
    onRemoveTimeBlock: PropTypes.func.isRequired,
    handleWeeklyHoursChange: PropTypes.func.isRequired,
    setFieldValue: PropTypes.func.isRequired,
    index: PropTypes.number.isRequired,
    day: PropTypes.string.isRequired
  }

  render() {
    const {
      index,
      day,
      daySchedule: { hour, value },
      onRemoveTimeBlock,
      setFieldValue,
      handleWeeklyHoursChange,
      values
    } = this.props

    const placeholder = '% Use'

    return (
      <div className={styles.dayScheduleWrapper}>
        <div className={styles.operationalDaySchedule}>
          <div className={styles.dayScheduleLabel}>{getTime(hour, index)}</div>
          <div className={styles.operationalDayScheduleBody}>
            <i
              className={classNames(
                'material-icons',
                styles.formIconButton,
                styles.dayScheduleDelete
              )}
              onClick={onRemoveTimeBlock}
              data-test="schedule-remove-time-block"
            >
              close
            </i>
            <i
              className={classNames(
                styles.formIconButton,
                styles.buttonPrimary,
                'material-icons'
              )}
              onClick={() => {
                const hour =
                  parseInt(value || 0) - 1 < 0 ? 0 : parseInt(value || 0) - 1
                const newDays = values[day].map((item, i) =>
                  i === index ? { ...item, value: hour } : item
                )
                handleWeeklyHoursChange(
                  { ...values, [day]: newDays },
                  null,
                  day
                )
                setFieldValue(`${day}[${index}].value`, hour)
              }}
            >
              remove
            </i>
            <div className={styles.operationalDayScheduleField}>
              <Field
                label={placeholder}
                component="input"
                type="number"
                max="100"
                min="0"
                name={`${day}[${index}].value`}
                placeholder={0}
                onChange={e => {
                  const newDays = values[day].map((item, i) =>
                    i === index ? { ...item, value: +e.target.value } : item
                  )
                  handleWeeklyHoursChange(
                    { ...values, [day]: newDays },
                    null,
                    day
                  )
                  setFieldValue(`${day}[${index}].value`, +e.target.value)
                }}
              />
            </div>
            <i
              className={classNames(
                styles.formIconButton,
                styles.buttonPrimary,
                'material-icons'
              )}
              onClick={() => {
                const hour =
                  parseInt(value || 0) + 1 >= 100
                    ? 100
                    : parseInt(value || 0) + 1
                const newDays = values[day].map((item, i) =>
                  i === index ? { ...item, value: hour } : item
                )
                handleWeeklyHoursChange(
                  { ...values, [day]: newDays },
                  null,
                  day
                )
                setFieldValue(`${day}[${index}].value`, hour)
              }}
            >
              add
            </i>
          </div>
        </div>
      </div>
    )
  }
}

export default OperationSchedule
