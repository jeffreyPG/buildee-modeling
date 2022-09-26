import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import classNames from 'classnames'
import styles from './Projects.scss'
import { formatCamelCaseNotation } from 'utils/Utils'

import {
  bodyTemplate,
  templateUpdateError
} from 'routes/Template/modules/template'
const DESCRIPTION_FIELD_REGEX = new RegExp(
  /^[A-Za-z0-9\ \!\@\.\&\(\)\_\-\:\;\*\?\%\+\=/\$\\r\n\,\']*$/
)

export class ProjectOrdering extends Component {
  static propTypes = {
    bodyTemplate: PropTypes.func.isRequired,
    templateUpdateError: PropTypes.func.isRequired,
    body: PropTypes.array.isRequired,
    index: PropTypes.number.isRequired,
    filteringFields: PropTypes.object.isRequired
  }
  changeFilterOptionOrder = (e, name, filter) => {
    let body = JSON.parse(JSON.stringify(this.props.body))
    let projectConfig = body[this.props.index].projectConfig
    let option = projectConfig.filter[filter].find(
      option => option.name === name
    )
    let targetValue = parseInt(e.target.value)
    // get order # before changing it
    let oldOrder = option.order
    // find the option that has the same order number, and change it to the old order number
    let secondOption = projectConfig.filter[filter].find(
      option => option.order === targetValue
    )
    if (secondOption) {
      secondOption.order = option.order
    }
    // change the first option to the new value
    if (option) {
      option.order = targetValue
    }

    this.props.bodyTemplate(body)
    this.props.templateUpdateError()
  }

  changeFilterOptionDescription = (e, name, filter) => {
    const validated = DESCRIPTION_FIELD_REGEX.test(event.target.value)
    if (validated) {
      let body = JSON.parse(JSON.stringify(this.props.body))
      let projectConfig = body[this.props.index].projectConfig
      let option = projectConfig.filter[filter].find(
        option => option.name === name
      )
      if (option) {
        option.description = e.target.value
      }

      this.props.bodyTemplate(body)
      this.props.templateUpdateError()
    }
  }

  compareOrder = (a, b) => {
    // make sure you're getting a num
    const orderA = parseInt(a.order)
    const orderB = parseInt(b.order)
    let comparison = orderA > orderB ? 1 : -1
    return comparison
  }
  handleContentOrder(e, category) {
    let body = JSON.parse(JSON.stringify(this.props.body))
    let card = body[this.props.index].projectConfig.filter.category.find(
      item => item.name === category
    )
    let maxOrder = 0
    let findKey
    let eventTargetValue = e.target.value
    if (card.styles.layout === 'twoColumn') {
      if (eventTargetValue === 'description') {
        maxOrder = 0
      } else if (eventTargetValue === 'photoCaption') {
        findKey = 'images'
      } else if (eventTargetValue === 'images') {
        findKey = 'photoCaption'
      } else if (eventTargetValue === 'projectDesignTable') {
        findKey = 'businessCaseTable'
      } else if (eventTargetValue === 'businessCaseTable') {
        findKey = 'projectDesignTable'
      }
      maxOrder = card.content && card.content.find(a => a.key === findKey)
    } else {
      if (card && card.content.length > 0) {
        maxOrder =
          card.content &&
          card.content.reduce((a, b) => {
            return { key: a.key, order: Math.max(a.order, b.order) }
          })
      }
    }
    if (e.target.checked) {
      card.content.push({
        key: `${eventTargetValue}`,
        order: (maxOrder && maxOrder.order ? maxOrder.order + 1 : 1) || 1
      })
    } else {
      card.content.map((item, ind) => {
        if (item.key === eventTargetValue) {
          let deletedOrder = item.order
          delete card.content[ind]
          card.content = card.content.filter(
            item =>
              (item.order =
                item.order > deletedOrder &&
                (findKey ? findKey === item.key : true)
                  ? item.order - 1
                  : item.order)
          )
        }
      })
    }

    this.props.bodyTemplate(body)
    this.props.templateUpdateError()
  }

  saveCheckboxFields = (e, category) => {
    let body = JSON.parse(JSON.stringify(this.props.body))
    let card = body[this.props.index].projectConfig.filter.category.find(
      item => item.name === category
    )
    let value = e.target.value
    if (e.target.checked) {
      card.content.map((each, index) => {
        if (each.key.indexOf('business') > -1 && value.startsWith('business')) {
          if (!card.content[index].fields) {
            card.content[index].fields = []
          }
          card.content[index].fields.push(value.split('.')[1])
        }
        if (each.key.indexOf('project') > -1 && value.startsWith('project')) {
          if (!card.content[index].fields) {
            card.content[index].fields = []
          }
          card.content[index].fields.push(value.split('.')[1])
        }
      })
    } else {
      card.content.map((each, index) => {
        if (
          each.key.indexOf('business') > -1 &&
          e.target.value.startsWith('business')
        ) {
          card.content[index].fields = card.content[index].fields.filter(
            item => item !== e.target.value.split('.')[1]
          )
        }
        if (
          each.key.indexOf('project') > -1 &&
          e.target.value.startsWith('project')
        ) {
          card.content[index].fields = card.content[index].fields.filter(
            item => item !== e.target.value.split('.')[1]
          )
        }
      })
    }

    this.props.bodyTemplate(body)
    this.props.templateUpdateError()
  }
  checkboxFieldsFormat = (array, type) => {
    let card = this.props.body[this.props.index].projectConfig
    //.find(item => item.name === category)
    let checkboxChecked = false
    return array.map((item, i) => {
      if (card && card.content) {
        let checkArr = card.content.filter(each => each.key === type)
        if (checkArr && checkArr[0].fields) {
          let fieldsArr = checkArr[0].fields
          if (fieldsArr.includes(item.value.split('.')[1])) {
            checkboxChecked = true
          } else {
            checkboxChecked = false
          }
        }
      }
      return (
        <label key={i}>
          <input
            checked={checkboxChecked}
            value={item.value}
            name={'fields' + type}
            onChange={e => this.saveCheckboxFields(e, category)}
            type="checkbox"
            className={classNames(checkboxChecked ? styles.checked : '')}
          />
          <span>{item.name}</span>
        </label>
      )
    })
  }
  clearDataFields(event, type) {
    event.stopPropagation()
    event.preventDefault()
    let body = JSON.parse(JSON.stringify(this.props.body))
    let card = body[this.props.index].projectConfig //.filter.category.find(item => item.name === category)
    card.content.map((item, index) => {
      if (item.key === type) {
        let obj = { key: item.key, order: item.order }
        card.content[index] = obj
      }
    })

    this.props.bodyTemplate(body)
    this.props.templateUpdateError()
  }
  listNestedTableCheckbox = (array, searchKey) => {
    let card = this.props.body[this.props.index].projectConfig //.category.find(item => item.name === category)
    let contentCheckbox = card.content.map(function(element, index) {
      return (
        element.key === searchKey &&
        element.fields &&
        element.fields.map(
          field =>
            (element.fields.indexOf(field) === 0 ? '' : ', ') +
            array.find(item => field === item.value.split('.')[1]).name
        )
      )
    })
    return contentCheckbox
  }
  render() {
    const { index, body, filteringFields } = this.props
    const projectConfig = body[index].projectConfig

    return (
      <div>
        <h3>Category Order and Descriptions</h3>
        <div className={styles.order}>
          {projectConfig &&
            projectConfig.filter &&
            Object.keys(projectConfig.filter).map((filter, index) => {
              if (
                filter === 'category' &&
                projectConfig.filter[filter].length > 0
              ) {
                return (
                  <div key={index}>
                    <div
                      className={classNames(
                        styles.orderDetails,
                        styles.orderHeadings
                      )}
                    >
                      <div
                        className={classNames(
                          styles.orderNumber,
                          styles.categoryHeaderOrder
                        )}
                      >
                        Order
                      </div>
                      <div
                        className={classNames(
                          styles.orderDescription,
                          styles.contentHeader
                        )}
                      >
                        {formatCamelCaseNotation(filter)}
                      </div>
                    </div>
                    {projectConfig.filter[filter]
                      .sort(this.compareOrder)
                      .map((option, index) => {
                        let filterField =
                          filteringFields[filter].data &&
                          filteringFields[filter].data.find(
                            item => item === option.name
                          )
                        if (filterField === undefined) filterField = option.name
                        return (
                          <div key={index} className={styles.orderDetails}>
                            <div
                              className={classNames(
                                styles.orderNumber,
                                styles.selectContainer,
                                styles.categoryOrder
                              )}
                            >
                              <select
                                value={option.order}
                                onChange={e =>
                                  this.changeFilterOptionOrder(
                                    e,
                                    option.name,
                                    filter
                                  )
                                }
                              >
                                {projectConfig.filter[filter].map(
                                  (option, index) => {
                                    return (
                                      <option key={index} value={option.order}>
                                        {option.order}
                                      </option>
                                    )
                                  }
                                )}
                              </select>
                            </div>
                            <div className={styles.orderlabelContent}>
                              <p>{filterField}</p>
                            </div>
                            {projectConfig &&
                              projectConfig.projectGrouping !== 'individual' &&
                              filter === 'category' && (
                                <div>
                                  Description:
                                  <br />
                                  <textarea
                                    value={option.description}
                                    onChange={e =>
                                      this.changeFilterOptionDescription(
                                        e,
                                        option.name,
                                        filter
                                      )
                                    }
                                  />
                                </div>
                              )}
                          </div>
                        )
                      })}
                  </div>
                )
              }
            })}
        </div>
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

const withConnect = connect(mapStateToProps, mapDispatchToProps)

export default withConnect(ProjectOrdering)
