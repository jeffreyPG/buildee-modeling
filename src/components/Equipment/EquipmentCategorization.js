import React from 'react'
import PropTypes from 'prop-types'

import styles from './EquipmentCategorization.scss'
import Categorization from 'components/Categorization'

export class EquipmentCategorization extends React.Component {
  static propTypes = {
    categories: PropTypes.array.isRequired,
    applications: PropTypes.array.isRequired,
    technologies: PropTypes.array.isRequired,
    onChange: PropTypes.func.isRequired
  }

  handleChanged = (value, key, target) => {
    const selected = this.props[target].find(t => t.value === value)
    let payload = {
      category: this.props.values.category,
      application: this.props.values.application,
      technology: this.props.values.technology
    }
    payload = Object.assign({}, payload, {
      [key]: value
    })
    if (payload[key] !== this.props.values[key]) {
      if (key == 'category') {
        payload = Object.assign({}, payload, {
          application: '',
          technology: ''
        })
      } else if (key === 'application') {
        payload = Object.assign({}, payload, {
          technology: ''
        })
      }
    }
    this.props.onChange({ value: payload, selected, targetName: key })
  }

  render() {
    let { values } = this.props
    values = values ?? {}
    return (
      <div className={styles.wrapperContainer}>
        <Categorization
          category={values['category']}
          application={values['application']}
          technology={values['technology']}
          handleCategory={value => {
            this.handleChanged(value, 'category', 'categories')
          }}
          handleApplication={value => {
            this.handleChanged(value, 'application', 'applications')
          }}
          handleTechnology={value => {
            this.handleChanged(value, 'technology', 'technologies')
          }}
          target='equipment'
        />
      </div>
    )
  }
}
