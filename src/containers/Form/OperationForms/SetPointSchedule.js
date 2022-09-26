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

export class SetPointSchedule extends React.Component {
  static propTypes = {
    periods: PropTypes.array.isRequired,
    type: PropTypes.string.isRequired,
    daySchedule: PropTypes.object.isRequired,
    onRemoveTimeBlock: PropTypes.func.isRequired,
    setFieldValue: PropTypes.func.isRequired,
    index: PropTypes.number.isRequired,
    day: PropTypes.string.isRequired
  }

  render() {
    const {
      periods,
      index,
      day,
      type,
      daySchedule: { hour, value },
      onRemoveTimeBlock,
      setFieldValue
    } = this.props
    const placeholder = type === 'setpoint' ? 'Setpoint (℉)' : '% Occupied'

    return (
      <div className={styles.dayScheduleWrapper}>
        <div className={styles.daySchedule}>
          <div className={styles.dayScheduleLabel}>{getTime(hour, index)}</div>
          <div className={styles.dayScheduleBody}>
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
            <Field
              label="Period"
              component="select"
              name={`${day}[${index}].period`}
            >
              <option defaultValue value="" disabled>
                Select a period
              </option>
              {periods.map(({ name, value }) => (
                <option key={`schedule-period-${value}`} value={value}>
                  {name}
                </option>
              ))}
            </Field>
            <i
              className={classNames(
                styles.formIconButton,
                styles.buttonPrimary,
                'material-icons'
              )}
              onClick={() =>
                setFieldValue(
                  `${day}[${index}].value`,
                  parseInt(value || 0) - 1 < 0 ? 0 : parseInt(value || 0) - 1
                )
              }
            >
              remove
            </i>
            <Field
              label={placeholder}
              component="input"
              type="number"
              name={`${day}[${index}].value`}
              placeholder={placeholder}
            />
            <i
              className={classNames(
                styles.formIconButton,
                styles.buttonPrimary,
                'material-icons'
              )}
              onClick={() =>
                setFieldValue(
                  `${day}[${index}].value`,
                  parseInt(value || 0) + 1 >= 100
                    ? 100
                    : parseInt(value || 0) + 1
                )
              }
            >
              add
            </i>
          </div>
        </div>
      </div>
    )
  }
}

export default SetPointSchedule
