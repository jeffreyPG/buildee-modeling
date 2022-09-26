import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { Field as FormikField } from 'formik'

import styles from './Field.module.scss'

export class Field extends React.Component {
  static propTypes = {
    children: PropTypes.oneOfType([
      PropTypes.arrayOf(PropTypes.node),
      PropTypes.node
    ]),
    component: PropTypes.string,
    disabled: PropTypes.bool,
    label: PropTypes.string,
    adornment: PropTypes.node
  }

  renderChildField = field => {
    const { label, adornment, component, children, ...props } = this.props
    switch (component) {
      case 'select': {
        return (
          <div className={styles.field}>
            <select
              id={field.name}
              className={classNames(styles.input, {
                [styles.disabled]: this.props.disabled
              })}
              {...field}
              {...props}
            >
              {children}
            </select>
            <div className={styles.selectIcons}>
              <i className={classNames('material-icons', styles.selectArrow)}>
                arrow_drop_down
              </i>
              {adornment && (
                <div className={styles.selectAdornment}>{adornment}</div>
              )}
            </div>
          </div>
        )
      }
      case 'textarea': {
        return (
          <textarea
            id={field.name}
            className={classNames(styles.customTextArea, {
              [styles.disabled]: this.props.disabled
            })}
            rows="2"
            {...field}
            {...props}
          />
        )
      }
      default: {
        return (
          <div className={styles.field}>
            <input
              id={field.name}
              className={classNames(styles.input, {
                [styles.disabled]: this.props.disabled
              })}
              {...field}
              {...props}
            />
            {adornment && <div className={styles.adornment}>{adornment}</div>}
          </div>
        )
      }
    }
  }

  render() {
    const { label, adornment, component, children, ...props } = this.props
    const isSelect = component === 'select'

    return (
      <div className={styles.container}>
        <label htmlFor={props.name}>
          <span className={styles.label}>{label}</span>
          <FormikField {...props}>
            {({ field }) => this.renderChildField(field)}
          </FormikField>
        </label>
      </div>
    )
  }
}

export default Field
