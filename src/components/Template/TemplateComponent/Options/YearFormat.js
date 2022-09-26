import React from 'react'
import styles from './YearFormat.scss'

const labels = [
  { label: 'Calendar Year (Jan - Dec)', value: 'CY' },
  { label: 'Fiscal Year (July - June)', value: 'FY' },
  { label: 'Month & Year (Jan 2020)', value: 'MonthYear' }
]

export const YearFormat = props => {
  const { value, onChange } = props
  return (
    <div>
      <label className={styles['target__select']}>
        <span>Organize Annual Data By:</span>
        <div className={styles.selectContainer}>
          <select value={value} onChange={onChange}>
            <option defaultChecked={value === ''} value="">
              Select Annual Data By
            </option>
            {labels.map((field, i) => {
              return (
                <option
                  key={i}
                  defaultChecked={value === field.value}
                  value={field.value}
                >
                  {field.label}
                </option>
              )
            })}
          </select>
        </div>
      </label>
    </div>
  )
}
