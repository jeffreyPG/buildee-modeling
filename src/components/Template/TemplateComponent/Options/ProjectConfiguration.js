import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import classNames from 'classnames'
import { find, findIndex } from 'lodash'

import {
  bodyTemplate,
  templateUpdateError
} from 'routes/Template/modules/template'
import CollapseSection from 'components/UI/CollapseSection'
import { formatProjectFields } from 'utils/Utils'

import styles from './Projects.scss'
import targetStyles from '../../../Template/TemplateComponent/BodyComponents/TemplateTarget.scss'

const DESCRIPTION_FIELD_REGEX = new RegExp(
  /^[A-Za-z0-9\ \!\@\.\&\(\)\_\-\:\;\*\?\%\+\=/\$\\r\n\,\']*$/
)

export class ProjectConfiguration extends Component {
  static propTypes = {
    bodyTemplate: PropTypes.func.isRequired,
    templateUpdateError: PropTypes.func.isRequired,
    body: PropTypes.array.isRequired,
    index: PropTypes.number.isRequired,
    filteringFields: PropTypes.object.isRequired
  }

  state = {
    selectedField: null,
    customHeading: '',
    selectedType: '',
    node: null
  }
  componentDidMount() {
    let body = JSON.parse(JSON.stringify(this.props.body))
    let widget = body[this.props.index]
    if (!widget.tableLayout) {
      widget.tableLayout = 'horizontal'
    }
    this.props.bodyTemplate(body)
    this.props.templateUpdateError()
  }
  changeProjectStyle = e => {
    let body = JSON.parse(JSON.stringify(this.props.body))
    let projectConfig = body[this.props.index].projectConfig

    if (projectConfig.styles && projectConfig.styles.length === 0)
      projectConfig.styles = []

    projectConfig.content = []
    projectConfig.styles[e.target.name] = e.target.value

    this.props.bodyTemplate(body)
    this.props.templateUpdateError()
  }
  changeFilterContentOptionOrder = e => {
    let body = JSON.parse(JSON.stringify(this.props.body))
    let card = body[this.props.index].projectConfig
    let targetValue = parseInt(e.target.value)
    let targetName = e.target.name
    let replaceOrderElement, currentElement

    if (card.styles.layout === 'twoColumn') {
      let findKey

      if (targetName === 'photoCaption') {
        findKey = 'images'
      } else if (targetName === 'images') {
        findKey = 'photoCaption'
      } else if (targetName === 'projectDesignTable') {
        findKey = 'businessCaseTable'
      } else if (targetName === 'businessCaseTable') {
        findKey = 'projectDesignTable'
      }
      // get order # before changing it
      replaceOrderElement = card.content.find(option => option.key === findKey)
    } else {
      // get order # before changing it
      replaceOrderElement = card.content.find(
        option => option.order === targetValue
      )
    }
    // find the option that has the same order number, and change it to the old order number
    currentElement = card.content.find(option => option.key === targetName)
    replaceOrderElement.order = currentElement.order
    currentElement.order = targetValue

    this.props.bodyTemplate(body)
    this.props.templateUpdateError()
  }
  changeFilterOptionOrder = (e, name) => {
    let body = JSON.parse(JSON.stringify(this.props.body))
    let projectConfig = body[this.props.index].projectConfig
    let option = projectConfig
    let targetValue = parseInt(e.target.value)
    // get order # before changing it
    let oldOrder = option.order
    // find the option that has the same order number, and change it to the old order number
    let secondOption = projectConfig.find(
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

  changeFilterOptionDescription = (e, name) => {
    const validated = DESCRIPTION_FIELD_REGEX.test(event.target.value)
    if (validated) {
      let body = JSON.parse(JSON.stringify(this.props.body))
      let projectConfig = body[this.props.index].projectConfig
      let option = projectConfig.find(option => option.name === name)
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
    let card = body[this.props.index].projectConfig
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

  handleSubContent(e, itemKey, subContentKey) {
    let body = JSON.parse(JSON.stringify(this.props.body))
    let card = body[this.props.index].projectConfig

    card.content = card.content.map(item => {
      if (item.key === itemKey) {
        item[subContentKey] = e.target.checked
      }
      return item
    })
    this.props.bodyTemplate(body)
    this.props.templateUpdateError()
  }

  saveCheckboxFields = (e, selectedType) => {
    let body = JSON.parse(JSON.stringify(this.props.body))
    let card = body[this.props.index].projectConfig
    let value = e.target.value

    if (e.target.checked) {
      card.content.map((each, index) => {
        if (selectedType === 'businessCaseTable' && each.key == selectedType) {
          let fields = each.fields || []
          let filteredFields = fields.filter(item => item !== value)
          card.content[index].fields = [...filteredFields, value]
        }
        if (selectedType === 'projectDesignTable') {
          let fields = each.fields || []
          let filteredFields = fields.filter(item => item !== value)
          card.content[index].fields = [...filteredFields, value]
        }
      })
    } else {
      card.content.map((each, index) => {
        if (selectedType === 'businessCaseTable' && each.key == selectedType) {
          let fields = each.fields || []
          let filteredFields = fields.filter(item => item !== value)
          card.content[index].fields = [...filteredFields]
        }
        if (selectedType === 'projectDesignTable' && each.key == selectedType) {
          let fields = each.fields || []
          let filteredFields = fields.filter(item => item !== value)
          card.content[index].fields = [...filteredFields]
        }
      })
    }

    this.props.bodyTemplate(body)
    this.props.templateUpdateError()
  }

  saveHeading = (selectedField, value = '', selectedType) => {
    let body = JSON.parse(JSON.stringify(this.props.body))
    let card = body[this.props.index]
    let option =
      card.projectConfig &&
      card.projectConfig.content &&
      card.projectConfig.content.find(option => option.key === selectedType)
    let customLabels = (option && option.customLabels) || []
    if (!customLabels) customLabels = []

    const index = findIndex(customLabels, { field: selectedField.value })
    if (index > -1) customLabels.splice(index, 1)
    if (value) {
      customLabels.push({
        field: selectedField.value,
        value
      })
    }
    option.customLabels = customLabels
    this.props.templateUpdateError()
    this.props.bodyTemplate(body)
  }

  handleUpdateHeading = event => {
    const { selectedField } = this.state
    event.preventDefault()
    if (selectedField) {
      this.setState({
        customHeading: event.target.value
      })
    }
  }

  clearDataFields = (event, type) => {
    event.stopPropagation()
    event.preventDefault()
    let body = JSON.parse(JSON.stringify(this.props.body))
    let card = body[this.props.index].projectConfig
    card.content.map((item, index) => {
      if (item.key === type) {
        let obj = { key: item.key, order: item.order }
        card.content[index] = obj
      }
    })

    this.props.bodyTemplate(body)
    this.props.templateUpdateError()
  }

  listNestedTableCheckbox = searchKey => {
    let card = this.props.body[this.props.index].projectConfig
    let searchArray = ''
    if (
      searchKey === 'businessCaseTable' ||
      searchKey === 'projectDesignTable'
    ) {
      if (card.content.filter(item => item.key === searchKey).length === 0)
        return null
      searchArray = card.content.map(function(elementArr) {
        let commaSeparatedValues =
          elementArr.key === searchKey &&
          elementArr.fields &&
          elementArr.fields.map(function(element, index) {
            const customLabels = elementArr.customLabels || []
            let name = ''
            if (customLabels.length > 0) {
              const customLabel = find(customLabels, {
                field: element
              })
              if (customLabel) name = customLabel.value
            }
            if (!name) {
              name = formatProjectFields(element)
            }
            return name
          })
        return commaSeparatedValues ? commaSeparatedValues.join(', ') : ''
      })
    }
    return (
      <div className={styles.fullDetailContainer}>
        <div className={styles.fieldSelector}>
          <div className={styles.fieldSelectorTitle}>Fields</div>
          <div className={styles.fieldSelectorDescription}>
            Select the fields for your table in the order they should appear.
          </div>
        </div>

        <div className={styles.fieldContainer}>
          <div className={styles.fieldContainerItem}>
            <div className={styles.fieldContainerTitle}>
              Order: {searchArray ? searchArray : ''}
            </div>
          </div>
          <div
            className={styles.fieldContainerClear}
            onClick={event => this.clearDataFields(event, searchKey)}
          >
            Clear Fields
          </div>
        </div>
      </div>
    )
  }

  loadContentList = () => {
    const contentList = [
      { label: 'Photo Caption', value: 'photoCaption' },
      {
        label: 'Images',
        value: 'images',
        subContent: {
          label: 'Add a Timestamp',
          value: 'timestamp'
        }
      },
      { label: 'Description', value: 'description' },
      { label: 'Measure Design Table', value: 'projectDesignTable' },
      { label: 'Cost Benefit Analysis', value: 'businessCaseTable' }
    ]
    let card = this.props.body[this.props.index].projectConfig
    let contentChecked = false
    let itemChecked

    return contentList.map((each, i) => {
      let subContentChecked = false
      if (card && card.content) {
        itemChecked = card.content.filter(item => {
          const isFound = item.key === each.value && item.order !== undefined
          if (isFound && each.subContent) {
            subContentChecked = item[each.subContent.value]
          }
          return isFound
        })
        contentChecked = itemChecked.length > 0
      }
      return (
        <div
          key={i}
          className={
            card.styles &&
            card.styles.layout &&
            card.styles.layout == 'twoColumn'
              ? styles.twoColumn
              : ''
          }
        >
          <div key={i}>
            <label key={i} className={styles.contentLabel}>
              <input
                checked={contentChecked}
                value={each.value}
                name={'Content'}
                onChange={e => this.handleContentOrder(e)}
                type="checkbox"
              />
              <div>
                <span></span>
              </div>
              <div className={styles.projectSelectContainer}>
                <div
                  className={classNames(
                    styles.orderNumber,
                    styles.selectContainer
                  )}
                >
                  <select
                    disabled={!contentChecked}
                    value={contentChecked ? itemChecked[0].order : '-'}
                    name={each.value}
                    onChange={e => this.changeFilterContentOptionOrder(e)}
                  >
                    {!contentChecked && <option>-</option>}
                    {contentChecked &&
                      card.content.map((option, index) => {
                        return (card.styles.layout === 'twoColumn' &&
                          ((each.value === 'photoCaption' &&
                            (option.key === 'images' ||
                              option.key === 'photoCaption')) ||
                            (each.value === 'images' &&
                              (option.key === 'photoCaption' ||
                                option.key === 'images')) ||
                            (each.value === 'projectDesignTable' &&
                              (option.key === 'businessCaseTable' ||
                                option.key === 'projectDesignTable')) ||
                            (each.value === 'businessCaseTable' &&
                              (option.key === 'projectDesignTable' ||
                                option.key === 'businessCaseTable')))) ||
                          card.styles.layout !== 'twoColumn' ? (
                          <option
                            key={index}
                            name={each.value}
                            value={option.order}
                          >
                            {option.order}
                          </option>
                        ) : (
                          ''
                        )
                      })}
                  </select>
                </div>
              </div>
              <span>{each.label}</span>
            </label>
            {contentChecked && each.subContent && (
              <label
                key={`subOption_${i}`}
                className={classNames(styles.contentLabel, styles.subContent)}
              >
                <input
                  checked={subContentChecked}
                  value={each.subContent.value}
                  name={'Sub Content'}
                  onChange={e =>
                    this.handleSubContent(e, each.value, each.subContent.value)
                  }
                  type="checkbox"
                />
                <div>
                  <span></span>
                </div>
                <span className={styles.subOptionLabel}>
                  {each.subContent.label}
                </span>
              </label>
            )}
            {(each.value === 'businessCaseTable' ||
              each.value === 'projectDesignTable') &&
              card &&
              card.content && (
                <div className={styles.nestedCheckboxContainer}>
                  {this.listNestedTableCheckbox(each.value)}
                </div>
              )}
            {each.value === 'businessCaseTable' &&
              this.loadBusinessCaseSection(each)}
            {each.value === 'projectDesignTable' &&
              this.loadProjectDesignSection(each)}
          </div>
        </div>
      )
    })
  }

  saveLayout(e) {
    let body = JSON.parse(JSON.stringify(this.props.body))
    let widget = body[this.props.index]

    if (!widget.tableLayout) {
      widget.tableLayout = e.target.value
    } else {
      widget.tableLayout = e.target.value
    }
    this.props.bodyTemplate(body)
    this.props.templateUpdateError()
  }

  tableLayout() {
    const layoutList = [
      { label: 'Horizontal', value: 'horizontal' },
      { label: 'Vertical', value: 'vertical' }
    ]
    let widget = this.props.body[this.props.index]
    let templateLayout = widget.tableLayout || 'horizontal'

    return (
      <label
        className={classNames(
          targetStyles['target__select'],
          targetStyles['target__table-type']
        )}
      >
        <span>Select table layout:</span>
        <div className={targetStyles.radioContainer}>
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

  loadBusinessCaseSection = each => {
    let card = this.props.body[this.props.index].projectConfig
    return (
      card &&
      card.content &&
      each.value === 'businessCaseTable' &&
      card.content.map((item, bsIndex) => {
        if (item.key === 'businessCaseTable') {
          let customLabels = item.customLabels || []
          let selectedFields = item.fields || []
          return (
            <div
              className={classNames(
                styles.checkboxContainer,
                styles.projectCheckboxContainer,
                styles.businessContainer
              )}
              key={bsIndex}
            >
              <CollapseSection
                customLabels={customLabels}
                addField={e => this.saveCheckboxFields(e, 'businessCaseTable')}
                saveHeading={(selectedField, value) =>
                  this.saveHeading(selectedField, value, 'businessCaseTable')
                }
                fields={selectedFields}
              />
            </div>
          )
        }
      })
    )
  }

  loadProjectDesignSection = each => {
    let card = this.props.body[this.props.index].projectConfig
    return (
      card &&
      card.content &&
      each.value === 'projectDesignTable' &&
      card.content.map((item, bsIndex) => {
        if (item.key === 'projectDesignTable') {
          let customLabels = item.customLabels || []
          let selectedFields = item.fields || []
          return (
            <div
              className={classNames(
                styles.checkboxContainer,
                styles.projectCheckboxContainer,
                styles.businessContainer
              )}
              key={bsIndex}
            >
              <CollapseSection
                customLabels={customLabels}
                addField={e => this.saveCheckboxFields(e, 'projectDesignTable')}
                saveHeading={(selectedField, value) =>
                  this.saveHeading(selectedField, value, 'projectDesignTable')
                }
                fields={selectedFields}
              />
            </div>
          )
        }
      })
    )
  }

  getProjectStyleSection = projectStyle => {
    const { index, body } = this.props
    const projectConfig = body[index].projectConfig

    return projectStyle.map(projectStyleElement => {
      return (
        <div className={styles.projectstyle} key={projectStyleElement.value}>
          <h2>{projectStyleElement.label}</h2>
          <div className={classNames(styles.selectContainer)}>
            <select
              value={
                (projectConfig.styles &&
                  projectConfig.styles[projectStyleElement.value]) ||
                projectStyleElement.defaultValue
              }
              name={projectStyleElement.value}
              onChange={e => this.changeProjectStyle(e)}
            >
              {projectStyleElement.values.map(({ label, value }) => {
                return (
                  <option key={value + label} value={value}>
                    {label}
                  </option>
                )
              })}
            </select>
          </div>
        </div>
      )
    })
  }

  render() {
    const { index, body } = this.props
    const projectConfig = body[index].projectConfig

    const projectStyle = [
      {
        label: 'Category Heading Style',
        defaultValue: 'h1',
        value: 'chs',
        values: [
          { label: 'Heading 1', value: 'h1' },
          { label: 'Heading 2', value: 'h2' },
          { label: 'Heading 3', value: 'h3' },
          { label: 'Heading 4', value: 'h4' },
          { label: 'Heading 5', value: 'h5' },
          { label: 'Heading 6', value: 'h6' }
        ]
      },
      {
        label: 'Measure Heading Style',
        defaultValue: 'h2',
        value: 'phs',
        values: [
          { label: 'Heading 1', value: 'h1' },
          { label: 'Heading 2', value: 'h2' },
          { label: 'Heading 3', value: 'h3' },
          { label: 'Heading 4', value: 'h4' },
          { label: 'Heading 5', value: 'h5' },
          { label: 'Heading 6', value: 'h6' }
        ]
      },
      {
        label: 'Layout',
        defaultValue: 'oneColumn',
        value: 'layout',
        values: [
          { label: 'Single Column', value: 'oneColumn' },
          { label: 'Two Column', value: 'twoColumn' }
        ]
      }
    ]
    return (
      <div>
        {projectConfig && projectConfig.format === 'fullDetails' && (
          <div className={styles.orderDescription}>
            <div>{this.tableLayout()}</div>
            {this.getProjectStyleSection(projectStyle)}
            <div className={styles.content}>
              <h2>Contents</h2>
              <div className={styles.contentDiv}>{this.loadContentList()}</div>
            </div>
          </div>
        )}
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

export default withConnect(ProjectConfiguration)
