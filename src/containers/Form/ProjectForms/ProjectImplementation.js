import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import styles from './ProjectFields.scss'

export class ProjectImplementation extends React.Component {
  static propTypes = {
    fields: PropTypes.array.isRequired,
    formValues: PropTypes.object.isRequired,
    handleChange: PropTypes.func.isRequired
  }

  state = {
    fieldsSeparated: false,
    existingFields: [],
    replacementFields: []
  }

  renderField = field => {
    if (field.type === 'number') {
      return (
        <div className={styles.projectsFieldsInput}>
          <label htmlFor={field.name}>{field.label}*</label>
          <input
            required
            value={this.props.formValues[field.name] || ''}
            name={field.name}
            type="number"
            step=".01"
            placeholder=" "
            onChange={e => this.props.handleChange(e)}
            onWheel={e => e.target.blur()}
          />
          <small>{field.description}</small>
        </div>
      )
    } else if (field.type === 'boolean' || field.type === 'bool') {
      return (
        <div className={styles.projectsFieldsInput}>
          <label>{field.label}*</label>
          <div className={styles.radioContainer}>
            <label>
              <input
                type="radio"
                name={field.name}
                value={true}
                checked={this.props.formValues[field.name] === true}
                onChange={e => this.props.handleChange(e, 'boolean')}
              />
              <span>Yes</span>
            </label>
            <label>
              <input
                type="radio"
                name={field.name}
                value={false}
                checked={this.props.formValues[field.name] === false}
                onChange={e => this.props.handleChange(e, 'boolean')}
              />
              <span>No</span>
            </label>
          </div>
          <small>{field.description}</small>
        </div>
      )
    } else if (field.type === 'select') {
      return (
        <div className={styles.projectsFieldsInput}>
          <label>{field.label}*</label>
          <div className={styles.selectContainer}>
            <select
              name={field.name}
              value={this.props.formValues[field.name] || field.default}
              onChange={e => this.props.handleChange(e)}
            >
              {field.options &&
                field.options.map((option, index) => {
                  return (
                    <option key={index} value={option.value}>
                      {option.label}
                    </option>
                  )
                })}
            </select>
          </div>
          <small>{field.description}</small>
        </div>
      )
    } else {
      return (
        <div className={styles.projectsFieldsInput}>
          <label htmlFor={field.name}>{field.label}*</label>
          <input
            required
            value={this.props.formValues[field.name] || ''}
            name={field.name}
            placeholder=" "
            onChange={e => this.props.handleChange(e)}
          />
          <small>{field.description}</small>
        </div>
      )
    }
  }

  render() {
    const { fields } = this.props

    return (
      <div
        className={classNames(styles.projectsFields, styles.labelNoTopMargin)}
      >
        {fields &&
          fields.map((field, index) => {
            return (
              <div key={index} className={styles.projectsFieldsSingle}>
                {this.renderField(field)}
              </div>
            )
          })}
      </div>
    )
  }
}

export default ProjectImplementation
