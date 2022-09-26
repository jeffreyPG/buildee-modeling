import React from 'react'

const renderTextarea = ({
  id,
  label,
  input,
  placeholder,
  description,
  className,
  meta: { touched, error }
}) => (
  <div className={className}>
    <label htmlFor={id}>
      {label}
      <small>{description}</small>
    </label>
    <div className="textarea-container">
      <textarea {...input} name={id} placeholder={placeholder} />
    </div>
  </div>
)

export default renderTextarea
