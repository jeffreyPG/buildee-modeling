import React, { Component } from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import classNames from 'classnames'

import { ProjectFiltering } from './'
import {
  bodyTemplate,
  templateUpdateError
} from 'routes/Template/modules/template'

import styles from './Projects.scss'

export class ProjectFullDetails extends Component {
  static propTypes = {
    bodyTemplate: PropTypes.func.isRequired,
    templateUpdateError: PropTypes.func.isRequired,
    body: PropTypes.array.isRequired
  }

  saveRadioFields = (e, type) => {
    let body = JSON.parse(JSON.stringify(this.props.body))
    let card = body[this.props.index]

    if (
      card.projectConfig.filter &&
      card.projectConfig.format === 'fullDetails' &&
      card.projectConfig.filter.category
    ) {
      card.projectConfig.filter.category.map(function(option) {
        option.content = []
        option.styles = []
      })
    } else if (
      card.projectConfig.filter &&
      card.projectConfig.format === 'fullDetails' &&
      card.projectConfig.filter.category
    ) {
      card.projectConfig.filter.category.map(function(option, index) {
        if (option.style === undefined)
          option.styles = {
            chs: 'h1',
            phs: 'h2',
            layout: 'oneColumn'
          }
        option.content = []
      })
    }
    card.projectConfig[type] = e.target.value

    this.props.bodyTemplate(body)
    this.props.templateUpdateError()
  }

  radioFieldsFormat = (array, type) => {
    const { index, body } = this.props
    const card = body[index]

    return array.map((item, i) => {
      let checkboxChecked = false
      if (
        type === 'projectGrouping' &&
        card &&
        card.projectConfig &&
        card.projectConfig.projectGrouping === item.value
      ) {
        checkboxChecked = true
      }
      if (
        type === 'style' &&
        card &&
        card.projectConfig &&
        card.projectConfig.style === item.value
      ) {
        checkboxChecked = true
      }
      return (
        <label key={i}>
          <input
            defaultChecked={checkboxChecked}
            value={item.value}
            name={'Projects ' + type}
            onChange={e => this.saveRadioFields(e, type)}
            className={classNames(checkboxChecked ? styles.checked : '')}
            type="radio"
          />
          <span>{item.name}</span>
        </label>
      )
    })
  }

  render() {
    const { index, body } = this.props
    const projectConfig = body[index].projectConfig || {}
    const projectLayoutFields = [
      { name: 'Individual Measure', value: 'individual' },
      { name: 'Group by Measure', value: 'groupProject' },
      { name: 'Group by Measure and Location', value: 'groupProjectLocation' }
    ]

    return (
      <div>
        <h3>Measure Grouping</h3>
        <div className={styles.selectContainer}>
          <select
            value={(projectConfig && projectConfig.projectGrouping) || ''}
            onChange={e => this.saveRadioFields(e, 'projectGrouping')}
          >
            <option value="" defaultValue disabled>
              Select Type
            </option>
            {projectLayoutFields.map(({ name, value }) => (
              <option key={value} value={value}>
                {name}
              </option>
            ))}
          </select>
        </div>
        <ProjectFiltering index={this.props.index} />
      </div>
    )
  }
}
const mapDispatchToProps = {
  bodyTemplate,
  templateUpdateError
}

const mapStateToProps = state => ({
  body: state.template.templateViewBody || []
})

const withConnect = connect(
  mapStateToProps,
  mapDispatchToProps
)

export default withConnect(ProjectFullDetails)
