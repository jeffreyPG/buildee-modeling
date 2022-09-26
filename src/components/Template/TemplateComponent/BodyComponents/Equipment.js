import React, { Component } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { Formik, FieldArray } from 'formik'
import { Query } from 'react-apollo'

import styles from './TemplateTarget.scss'
import { EquipmentCategorization } from '../../../Equipment/EquipmentCategorization'
import {
  EQUIPMENT_CATEGORIZATION,
  EQUIPMENT_SCHEMA
} from '../../../../utils/graphql/queries/equipmentschema'

export class Equipment extends Component {
  static propTypes = {
    index: PropTypes.number.isRequired,
    templateView: PropTypes.object.isRequired,
    handleUpdateTemplateState: PropTypes.func.isRequired,
    typeTemplate: PropTypes.string,
    id: PropTypes.string,
    action: PropTypes.string
  }

  state = {
    optionsVisible: false,
    deleteToggleOpen: false,
    mainField: '',
    eqIndex: ''
  }

  componentDidMount() {
    let modifiedTemplate = { ...this.props.templateView }
    let widget =
      (modifiedTemplate &&
        modifiedTemplate.body &&
        modifiedTemplate.body[this.props.index]) ||
      {}
    if (!widget.tableLayout) {
      widget.tableLayout = 'horizontal'
    }
    this.props.handleUpdateTemplateState(modifiedTemplate)
  }

  handleFieldChanged = ({ event, field, values, arrayHelpers }) => {
    let modifiedTemplate = { ...this.props.templateView }
    let widget = modifiedTemplate.body[this.props.index]
    // current implementation concatenates application values with field names SS 10/9/2019
    const widgetValue = `${values.application}.${field.field}`
    if (event.target.checked) {
      arrayHelpers.push(field.field)
      widget.fields.push(widgetValue)
      widget.equipmentConfig.fields = values.fields.concat(event.target.value)
    } else {
      const idx = values.fields.indexOf(field.field)
      arrayHelpers.remove(idx)
      widget.fields = widget.fields.filter(
        widgetField => widgetField !== widgetValue
      )
      widget.equipmentConfig.fields = values.fields.filter(
        field => field !== event.target.value
      )
    }
    this.props.handleUpdateTemplateState(modifiedTemplate)
  }
  handleConfigChanged = ({ event, config, values, arrayHelpers }) => {
    let modifiedTemplate = { ...this.props.templateView }
    let widget = modifiedTemplate.body[this.props.index]
    // current implementation concatenates application values with field names SS 10/9/2019
    const widgetValue = `${values.application || values.category}.${
      config.field
    }`
    if (event.target.checked) {
      arrayHelpers.push(config.field)
      widget.configs.push(widgetValue)
      widget.equipmentConfig.configs = values.configs.concat(event.target.value)
    } else {
      const idx = values.configs.indexOf(config.field)
      arrayHelpers.remove(idx)
      widget.configs = widget.configs.filter(
        widgetConfig => widgetConfig !== widgetValue
      )
      widget.equipmentConfig.configs = values.configs.filter(
        config => config !== event.target.value
      )
    }
    this.props.handleUpdateTemplateState(modifiedTemplate)
  }

  handleCategorizationChanged = ({
    value,
    values,
    setFieldValue,
    selected,
    targetName
  }) => {
    const { templateView, index, typeTemplate } = this.props
    let modifiedTemplate = { ...templateView }

    let card =
      typeTemplate === 'building'
        ? modifiedTemplate.sheets[index]
        : modifiedTemplate.body[index]
    let payload = {
      application: values.application,
      category: values.category,
      technology: values.technology
    }

    payload = Object.assign({}, payload, value)

    if (typeTemplate === 'building') {
      card.metaData = payload
    } else {
      const displayName = selected
        ? { targetName: selected.displayName }
        : { targetName: null }
      const preview = card.equipmentConfig
        ? Object.assign({}, card.equipmentConfig.preview, displayName)
        : displayName
      const displayDataTemp = card.equipmentConfig.displayData || 'hide'
      card.applicationType = application
      card.fields = []
      card.configs = []
      card.equipmentConfig = {
        // current implementation concatenates application values with field names
        // so we create an unconcatenated field array in the equipmentConfig SS 10/9/2019
        fields: [],
        configs: [],
        format: 'tableimages',
        category: payload.category,
        application: payload.application,
        technology: payload.technology,
        displayData: displayDataTemp,
        preview: preview || {}
      }
    }

    setFieldValue(event.target.name, event.target.value)
    setFieldValue('fields', [])
    setFieldValue('configs', [])

    this.props.handleUpdateTemplateState(modifiedTemplate)
  }

  handleFormatChanged = ({ event, format, values, setFieldValue }) => {
    let modifiedTemplate = { ...this.props.templateView }
    let nextFormat
    if (!event.target.checked) {
      nextFormat = values.format.replace(format, '')
    } else if (values.format.length > 0) {
      nextFormat = 'tableimages'
    } else {
      nextFormat = format
    }
    setFieldValue('format', nextFormat)

    let card = modifiedTemplate.body[this.props.index]
    if (card.equipmentConfig) {
      card.equipmentConfig.format = nextFormat
    } else {
      card.equipmentConfig = {
        format: nextFormat
      }
    }
    card.fields = []
    card.configs = []
    this.props.handleUpdateTemplateState(modifiedTemplate)
  }

  handleDisplayChanged = ({ displayStyle, setFieldValue }) => {
    let modifiedTemplate = { ...this.props.templateView }
    let card = modifiedTemplate.body[this.props.index]
    if (card.equipmentConfig) {
      card.equipmentConfig.displayData = displayStyle
    } else {
      card.equipmentConfig = {
        displayData: displayStyle
      }
    }
    setFieldValue('display', displayStyle)
    this.props.handleUpdateTemplateState(modifiedTemplate)
  }
  saveLayout(e) {
    let modifiedTemplate = { ...this.props.templateView }
    let widget = modifiedTemplate.body[this.props.index]

    if (!widget.tableLayout) {
      widget.tableLayout = e.target.value
    } else {
      widget.tableLayout = e.target.value
    }
    this.props.handleUpdateTemplateState(modifiedTemplate)
  }
  tableLayout() {
    const layoutList = [
      { label: 'Horizontal', value: 'horizontal' },
      { label: 'Vertical', value: 'vertical' }
    ]
    let modifiedTemplate = { ...this.props.templateView }
    let widget = modifiedTemplate.body[this.props.index]
    let templateLayout = widget.tableLayout || 'horizontal'

    return (
      <label
        className={classNames(
          styles['target__select'],
          styles['target__table-type']
        )}
      >
        <span>Select table layout:</span>
        <div className={styles.radioContainer}>
          {layoutList.map((item, i) => {
            return (
              <label key={i}>
                <input
                  type="radio"
                  name="layout"
                  value={item.value}
                  defaultChecked={templateLayout === item.value}
                  onChange={e => this.saveLayout(e)}
                />
                <span>{item.label}</span>
              </label>
            )
          })}
        </div>
      </label>
    )
  }
  render() {
    const { index, templateView, typeTemplate, id } = this.props
    const card =
      typeTemplate === 'building'
        ? templateView.sheets[index]
        : templateView.body[index]
    const displayStyles = [
      { name: 'Hide when no data available', value: 'hide' },
      { name: 'Show when no data available', value: 'show' }
    ]
    const listStyles = [
      { name: 'Images', value: 'images' },
      { name: 'Table', value: 'table' }
    ]

    if (card.equipmentConfig == undefined) {
      card.applicationType = []
      card.fields = []
      card.equipmentConfig = {
        // current implementation concatenates application values with field names
        // so we create an unconcatenated field array in the equipmentConfig SS 10/9/2019
        category: '',
        configs: [],
        fields: [],
        technology: '',
        application: '',
        type: []
      }
    }

    const cat =
      typeTemplate === 'building'
        ? card.metaData.category || ''
        : card.equipmentConfig.category || ''
    const app =
      typeTemplate === 'building'
        ? card.metaData.application || ''
        : card.equipmentConfig.application || ''
    const tech =
      typeTemplate === 'building'
        ? card.metaData.technology || ''
        : card.equipmentConfig.technology || ''

    return (
      <Formik
        initialValues={{
          category: cat,
          application: app,
          technology: tech,
          fields: (card.equipmentConfig && card.equipmentConfig.fields) || [],
          configs: (card.equipmentConfig && card.equipmentConfig.configs) || [],
          format: (card.equipmentConfig && card.equipmentConfig.format) || '',
          display:
            (card.equipmentConfig && card.equipmentConfig.displayData) ||
            displayStyles[0].value
        }}
        enableReinitialize
      >
        {({ values, setFieldValue }) => (
          <div>
            {typeTemplate === 'building' ? (
              <div>
                <Query
                  query={EQUIPMENT_CATEGORIZATION}
                  variables={{
                    categorization: {
                      category: '',
                      application: '',
                      technology: ''
                    }
                  }}
                >
                  {({ loading, error, data }) => {
                    const categorization = data && data.equipmentCategorization
                    const categories =
                      (categorization &&
                        categorization.categories.filter(function(value) {
                          return value !== ''
                        })) ||
                      []
                    const applications =
                      (categorization &&
                        categorization.applications.filter(function(value) {
                          return value !== ''
                        })) ||
                      []
                    const technologies =
                      (categorization &&
                        categorization.technologies.filter(function(value) {
                          return value !== ''
                        })) ||
                      []
                    return (
                      <EquipmentCategorization
                        categories={categories}
                        applications={applications}
                        technologies={technologies}
                        values={values}
                        onChange={({ value, selected, targetName }) =>
                          this.handleCategorizationChanged({
                            value,
                            values,
                            setFieldValue,
                            selected,
                            targetName
                          })
                        }
                      />
                    )
                  }}
                </Query>
              </div>
            ) : (
              <div>
                <Query
                  query={EQUIPMENT_CATEGORIZATION}
                  variables={{
                    categorization: {
                      category: values.category,
                      application: values.application,
                      technology: values.technology
                    }
                  }}
                >
                  {({ loading, error, data }) => {
                    const categorization = data && data.equipmentCategorization
                    const categories =
                      (categorization &&
                        categorization.categories.filter(function(value) {
                          return value !== ''
                        })) ||
                      []
                    const applications =
                      (categorization &&
                        categorization.applications.filter(function(value) {
                          return value !== ''
                        })) ||
                      []
                    const technologies =
                      (categorization &&
                        categorization.technologies.filter(function(value) {
                          return value !== ''
                        })) ||
                      []
                    return (
                      <EquipmentCategorization
                        categories={categories}
                        applications={applications}
                        technologies={technologies}
                        values={values}
                        onChange={({ value, selected, targetName }) =>
                          this.handleCategorizationChanged({
                            value,
                            values,
                            setFieldValue,
                            selected,
                            targetName
                          })
                        }
                      />
                    )
                  }}
                </Query>
                <label className={styles['target__select']}>
                  Choose your data
                </label>
                <div>
                  {listStyles.map(listStyle => {
                    const checkboxChecked = values.format.includes(
                      listStyle.value
                    )

                    return (
                      <label
                        key={`list-style-${listStyle.value}`}
                        className={classNames(
                          styles['target__input'],
                          styles['target__input--checkboxes']
                        )}
                      >
                        <input
                          checked={checkboxChecked}
                          value={listStyle.value}
                          onChange={event =>
                            this.handleFormatChanged({
                              event,
                              format: listStyle.value,
                              values,
                              setFieldValue
                            })
                          }
                          className={classNames(
                            checkboxChecked ? styles['checked'] : ''
                          )}
                          type="checkbox"
                        />
                        <span>{listStyle.name}</span>
                      </label>
                    )
                  })}
                </div>
                <br />
                <label className={styles['target__select']}>Display</label>
                <div>
                  {displayStyles.map(displayStyle => {
                    const selected = values.display === displayStyle.value
                    return (
                      <label
                        key={`display-style-${displayStyle.value}`}
                        className={classNames(
                          styles['target__input'],
                          styles['target__input--checkboxes']
                        )}
                      >
                        <input
                          checked={selected}
                          value={displayStyle.value}
                          name="display"
                          onChange={event =>
                            this.handleDisplayChanged({
                              event,
                              setFieldValue,
                              displayStyle: displayStyle.value
                            })
                          }
                          className={classNames(selected ? styles.checked : '')}
                          type="radio"
                        />
                        <span>{displayStyle.name}</span>
                      </label>
                    )
                  })}
                </div>
                <Query
                  query={EQUIPMENT_SCHEMA}
                  variables={{
                    schema: {
                      application: values.application,
                      category: values.category,
                      technology: values.technology
                    }
                  }}
                >
                  {({ loading, error, data }) => {
                    if (loading) return null
                    const { equipmentSchema } = data
                    if (equipmentSchema === null) return null
                    return (
                      <div>
                        <div>{this.tableLayout()}</div>
                        <span></span>
                        <span>
                          <h4>Choose your Table Headings</h4>
                          Select the headings for your template. The Order they
                          are selected will reflect the order in the sheet.
                        </span>
                        <div className={styles['target__sub-fields']}>
                          <FieldArray
                            name="fields"
                            render={arrayHelpers => (
                              <div>
                                {equipmentSchema.fields &&
                                  equipmentSchema.fields.map((field, i) => {
                                    if (field.display) {
                                      return (
                                        <label
                                          key={`field-${field.field}-checkbox`}
                                          className={classNames(
                                            styles['target__input'],
                                            styles['target__input--checkboxes']
                                          )}
                                        >
                                          <input
                                            name="fields"
                                            type="checkbox"
                                            checked={values.fields.includes(
                                              field.field
                                            )}
                                            value={field.field}
                                            onChange={event =>
                                              this.handleFieldChanged({
                                                field,
                                                event,
                                                values,
                                                arrayHelpers
                                              })
                                            }
                                            className={classNames(
                                              values.fields.includes(
                                                field.field
                                              )
                                                ? styles['checked']
                                                : ''
                                            )}
                                          />
                                          <span>{field.fieldDisplayName}</span>
                                        </label>
                                      )
                                    }
                                  })}
                              </div>
                            )}
                          />
                        </div>
                        <span>
                          <h4>Choose your Configurations</h4>
                          Select the configurations for your template. The Order
                          they are selected will reflect the order in the sheet.
                        </span>
                        <div className={styles['target__sub-fields']}>
                          <FieldArray
                            name="fields"
                            render={arrayHelpers => (
                              <div>
                                {equipmentSchema.configs &&
                                  equipmentSchema.configs.map((config, i) => {
                                    if (config.display) {
                                      return (
                                        <label
                                          key={`field-${config.field}-checkbox`}
                                          className={classNames(
                                            styles['target__input'],
                                            styles['target__input--checkboxes']
                                          )}
                                        >
                                          <input
                                            name="fields"
                                            type="checkbox"
                                            checked={values.configs.includes(
                                              config.field
                                            )}
                                            value={config.field}
                                            onChange={event =>
                                              this.handleConfigChanged({
                                                config,
                                                event,
                                                values,
                                                arrayHelpers
                                              })
                                            }
                                            className={classNames(
                                              values.configs.includes(
                                                config.field
                                              )
                                                ? styles['checked']
                                                : ''
                                            )}
                                          />
                                          <span>{config.fieldDisplayName}</span>
                                        </label>
                                      )
                                    }
                                  })}
                              </div>
                            )}
                          />
                        </div>
                      </div>
                    )
                  }}
                </Query>
              </div>
            )}
          </div>
        )}
      </Formik>
    )
  }
}
export default Equipment
