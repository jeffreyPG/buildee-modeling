import React from 'react'
import styles from '../../../components/Building/BuildingNew.scss'

const renderSelect = ({
  input,
  label,
  id,
  children,
  className,
  required,
  meta: { touched, error }
}) => (
  <div className={className}>
    <label htmlFor={id}>{label}</label>
    <div className={styles.selectContainer}>
      <select {...input} id={id} required={required}>
        {children}
      </select>
    </div>
    {touched && error && <span>{error}</span>}
  </div>
)

export default renderSelect
