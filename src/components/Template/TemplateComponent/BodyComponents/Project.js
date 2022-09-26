import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Formik } from 'formik'
import { Query } from 'react-apollo'

import { ProjectCategorization } from '../../../Project/ProjectCategorization'
import { PROJECT_CATEGORIZATION } from '../../../../utils/graphql/queries/projectschema'

export class Project extends Component {
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
      typeTemplate == 'building' || typeTemplate == 'project'
        ? modifiedTemplate.sheets[index]
        : modifiedTemplate.body[index]

    let payload = {
      application: values.application,
      category: values.category,
      technology: values.technology
    }

    payload = Object.assign({}, payload, value)

    if (typeTemplate == 'building' || typeTemplate == 'project') {
      card.metaData = payload
    } else {
      card.applicationType = application
      card.fields = []
      card.equipmentConfig = {
        // current implementation concatenates application values with field names
        // so we create an unconcatenated field array in the equipmentConfig SS 10/9/2019
        fields: [],
        format: 'tableimages',
        category,
        application,
        technology,
        preview
      }
    }
    const displayName = selected
      ? { targetName: selected.displayName }
      : { targetName: null }
    const preview = card.equipmentConfig
      ? Object.assign({}, card.equipmentConfig.preview, displayName)
      : displayName
    setFieldValue('application', payload.application)
    setFieldValue('category', payload.category)
    setFieldValue('technology', payload.technology)
    setFieldValue('fields', [])

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

  render() {
    const { index, templateView, typeTemplate, id } = this.props
    const card =
      typeTemplate == 'building' || typeTemplate == 'project'
        ? templateView.sheets[index]
        : templateView.body[index]
    const displayStyles = [
      { name: 'Hide when no data available', value: 'hide' },
      { name: 'Show when no data available', value: 'show' }
    ]
    return (
      <Formik
        initialValues={{
          category:
            (card.e && card.equipmentConfig.category) ||
            card.metaData.category ||
            '',
          application:
            (card.equipmentConfig && card.equipmentConfig.application) ||
            card.metaData.application ||
            '',
          technology:
            (card.equipmentConfig && card.equipmentConfig.technology) ||
            card.metaData.technology ||
            '',
          fields: (card.equipmentConfig && card.equipmentConfig.fields) || [],
          format: (card.equipmentConfig && card.equipmentConfig.format) || '',
          display:
            (card.equipmentConfig && card.equipmentConfig.displayData) ||
            displayStyles[0].value
        }}
        enableReinitialize
      >
        {({ values, setFieldValue }) => (
          <div>
            {typeTemplate === 'building' || typeTemplate === 'project' ? (
              <Query
                query={PROJECT_CATEGORIZATION}
                variables={{
                  categorization: {
                    project_category: '',
                    project_application: '',
                    project_technology: ''
                  }
                }}
              >
                {({ loading, error, data }) => {
                  const categorization = data && data.projectCategorization
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
                    <ProjectCategorization
                      categories={categories}
                      applications={applications}
                      technologies={technologies}
                      values={values}
                      onChange={({ value, targetName, selected }) =>
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
            ) : (
              ''
            )}
          </div>
        )}
      </Formik>
    )
  }
}
export default Project
