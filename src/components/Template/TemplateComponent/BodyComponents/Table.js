import React, { Component } from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import moment from 'moment'
import { find, findIndex } from 'lodash'
import styles from './TemplateTarget.scss'
import { YearFormat } from '../Options/YearFormat'
import {
  OverviewFields,
  EndUseFields,
  UtilityFields,
  OperationFields,
  ConstructionFields,
  LocationFields,
  ContactFields,
  yearRange
} from '../../../../utils/ReportOptions'
import { findLastIndex } from '../../../../utils/Utils'
import CustomRange from '../../../../utils/customRange'
import {
  bodyTemplate,
  templateUpdateError
} from 'routes/Template/modules/template'

export class Table extends Component {
  static propTypes = {
    index: PropTypes.number.isRequired,
    bodyTemplate: PropTypes.func.isRequired,
    templateUpdateError: PropTypes.func.isRequired,
    target: PropTypes.string.isRequired,
    body: PropTypes.array
  }

  state = {
    mainField: '',
    selectedYearRange: '12',
    customStartMonth: '',
    customStartYear: '',
    customEndMonth: '',
    customEndYear: '',
    monthList: [],
    yearList: [],
    multiYear: '',
    selectedField: null,
    customHeading: '',
    node: null,
    yearOption: 'SetOnExport'
  }

  UNSAFE_componentWillMount() {
    let num = 0
    this.setState({
      monthList: moment.months().map(function(currentValue, index) {
        return { label: currentValue, value: currentValue }
      }),
      yearList: Array.apply(null, { length: 11 }).map((e, i) => ({
        label: moment()
          .subtract(num, 'years')
          .format('YYYY'),
        value: moment()
          .subtract(num++, 'years')
          .format('YYYY')
      }))
    })
  }

  componentDidMount() {
    let {
      customStartMonth,
      customStartYear,
      customEndMonth,
      customEndYear,
      monthList,
      yearList,
      yearOption
    } = this.state
    customStartMonth = monthList[0].value
    customEndMonth = monthList[monthList.length - 1].value
    customStartYear = yearList[2].value
    customEndYear = yearList[0].value

    let body = JSON.parse(JSON.stringify(this.props.body))
    let widget = body[this.props.index]
    let metaData = widget.metaData ? widget.metaData : {}
    let fields = body[this.props.index].fields
    let mField =
      fields.length > 0 ? fields[0].substring(0, fields[0].indexOf('.')) : ''
    if (!widget.tableLayout) {
      widget.tableLayout = 'horizontal'
    }
    if (!widget.metaData) {
      widget.metaData = {}
    }
    let range = '12'
    if (mField !== '' || metaData.yearRange) {
      range = metaData.yearRange ? metaData.yearRange : '12'
      customStartMonth = metaData.selectedStartMonth
        ? metaData.selectedStartMonth
        : customStartMonth
      customStartYear = metaData.selectedStartYear
        ? metaData.selectedStartYear
        : customStartYear
      customEndMonth = metaData.selectedEndMonth
        ? metaData.selectedEndMonth
        : customEndMonth
      customEndYear = metaData.selectedEndYear
        ? metaData.selectedEndYear
        : customEndYear
    }
    yearOption = (metaData && metaData.yearOption) || 'SetOnExport'
    this.setState({
      mainField: mField,
      yearOption: yearOption,
      selectedYearRange: range,
      customStartMonth,
      customStartYear,
      customEndMonth,
      customEndYear
    })

    this.props.bodyTemplate(body)
    this.props.templateUpdateError()
  }

  componentDidUpdate = prevProps => {
    if (prevProps.target != this.props.target) {
      let body = JSON.parse(JSON.stringify(this.props.body))
      let widget = body[this.props.index]
      widget.metaData = {
        yearOption: 'SetOnExport'
      }

      this.props.bodyTemplate(body)
      this.props.templateUpdateError()
      let options = []
      switch (this.props.target) {
        case 'overview':
          options = OverviewFields
          break
        case 'endusebreakdown':
          options = EndUseFields
          break
        case 'utility':
          options = UtilityFields
          break
        case 'operation':
          options = OperationFields
          break
        case 'construction':
          options = ConstructionFields
          break
        case 'location':
          options = LocationFields
          break
        case 'contact':
          options = ContactFields
          break
      }
      this.setState({
        mainField: '',
        selectedYearRange: '12',
        yearOption: 'SetOnExport'
      })
      this.handleClickSetMainField({
        target: {
          value: options?.[0]?.value || ''
        }
      })
    }
  }

  handleClickSetMainField = event => {
    let {
      customStartMonth,
      customStartYear,
      customEndMonth,
      customEndYear,
      monthList,
      yearList
    } = this.state
    let body = JSON.parse(JSON.stringify(this.props.body))
    let widget = body[this.props.index]
    let yearRange = '12'
    let yearOption =
      (widget.metaData && widget.metaData.yearOption) || 'SetOnExport'
    customStartMonth = monthList[0].value
    customEndMonth = monthList[monthList.length - 1].value
    customStartYear = yearList[1].value
    customEndYear = yearList[0].value
    customEndMonth =
      new Date('1' + customEndMonth + customEndYear) > new Date()
        ? monthList[new Date().getMonth()].value
        : customEndMonth
    if (this.state.mainField !== event.target.value) {
      if (widget.projectConfig) {
        widget.projectConfig = {}
      }
      if (!widget.projectConfig && widget.target === 'construction') {
        widget.projectConfig = {
          data: { format: ['images', 'table'], displayData: 'hide' }
        }
      }
      if (widget.metaData && yearOption !== 'SetOnExport') {
        if (!widget.metaData.yearRange) {
          widget.metaData = {
            yearRange: '12',
            yearOption: yearOption,
            selectedStartMonth: customStartMonth,
            selectedStartYear: customStartYear,
            selectedEndMonth: customEndMonth,
            selectedEndYear: customEndYear
          }
        } else {
          yearRange = widget.metaData.yearRange
        }
      }

      if (!widget.metaData && !widget.metaData.yearOption) {
        widget.metaData = {
          yearOption: 'SetOnExport'
        }
      }

      widget.fields = []
      widget.customLabels = []

      this.setState({
        mainField: event.target.value,
        selectedYearRange: yearRange,
        yearOption: yearOption
      })

      this.props.bodyTemplate(body)
      this.props.templateUpdateError()
    }
  }
  handleFormatChanged = event => {
    let body = JSON.parse(JSON.stringify(this.props.body))
    let widget = body[this.props.index]
    if (!widget.projectConfig?.data?.['format']) {
      widget.projectConfig.data = {
        format: []
      }
    }
    if (!event.target.checked) {
      if (
        widget.projectConfig.data['format'].indexOf(event.target.value) > -1
      ) {
        widget.projectConfig.data['format'].splice(
          widget.projectConfig.data['format'].indexOf(event.target.value),
          1
        )
      }
    } else {
      widget.projectConfig.data['format'].push(event.target.value)
    }

    this.props.bodyTemplate(body)
    this.props.templateUpdateError()
  }

  handleSubFormatChanged = event => {
    let body = JSON.parse(JSON.stringify(this.props.body))
    let widget = body[this.props.index]
    if (!event.target.checked) {
      if (
        widget.projectConfig.data['subFormat'].indexOf(event.target.value) > -1
      ) {
        widget.projectConfig.data['subFormat'].splice(
          widget.projectConfig.data['subFormat'].indexOf(event.target.value),
          1
        )
      }
    } else {
      if (!widget.projectConfig.data['subFormat']) {
        widget.projectConfig.data['subFormat'] = []
      }
      widget.projectConfig.data['subFormat'].push(event.target.value)
    }

    this.props.bodyTemplate(body)
    this.props.templateUpdateError()
  }

  handleDisplayImages = event => {
    let body = JSON.parse(JSON.stringify(this.props.body))
    let widget = body[this.props.index]
    widget.projectConfig.data['displayData'] = event.target.value

    this.props.bodyTemplate(body)
    this.props.templateUpdateError()
  }
  handleClickSetSubField = event => {
    if (this.state.mainField !== event.target.value) {
      this.setState({ mainField: event.target.value })
      let body = JSON.parse(JSON.stringify(this.props.body))
      body[this.props.index].fields.push(event.target.value)

      this.props.bodyTemplate(body)
      this.props.templateUpdateError()
    }
  }

  handleClickYearOption = event => {
    const { index } = this.props
    let body = JSON.parse(JSON.stringify(this.props.body))
    let widget = body[index]
    const value = event.target.value
    if (!widget.metaData) widget.metaData = {}
    if (value === 'SetOnExport') {
      widget.metaData = {
        yearOption: value
      }
    } else {
      widget.metaData = {
        yearOption: value,
        yearRange: '12'
      }
    }
    this.setState({ selectedYearRange: '12', yearOption: value })
    this.props.bodyTemplate(body)
    this.props.templateUpdateError()
  }

  handleClickSaveCheckboxTable = event => {
    let body = JSON.parse(JSON.stringify(this.props.body))
    let widget = body[this.props.index]
    if (widget.projectConfig && !(widget.target === 'construction')) {
      widget.projectConfig = {}
    }
    if (!widget.tableType) {
      widget.tableType = 'usetype'
    }
    if (event.target.checked) {
      const mField = event.target.value.substring(
        0,
        event.target.value.indexOf('.')
      )
      const lastIndex = findLastIndex(widget.fields, mField)

      if (lastIndex !== -1) {
        widget.fields.splice(lastIndex + 1, 0, event.target.value)
      } else {
        widget.fields.push(event.target.value)
      }
    } else {
      widget.fields = widget.fields.filter(function(a) {
        return a !== event.target.value
      })
    }

    this.props.bodyTemplate(body)
    this.props.templateUpdateError()
  }

  handleOutsideClick = event => {
    if (this.state.node !== null && this.state.node.contains(event.target)) {
      return
    }
    this.saveHeading(event, this.state.customHeading)
  }

  selectHeading = (event, field, heading) => {
    event.preventDefault()
    this.setState({
      customHeading: heading,
      selectedField: field
    })
    document.addEventListener('click', this.handleOutsideClick, false)
  }

  saveHeading = (event, value = '') => {
    let { selectedField } = this.state
    event.preventDefault()
    if (selectedField) {
      let body = JSON.parse(JSON.stringify(this.props.body))
      let customLabels = body[this.props.index].customLabels
      if (!customLabels) customLabels = []
      const index = findIndex(customLabels, { field: selectedField.value })
      if (index > -1) customLabels.splice(index, 1)
      if (value) {
        customLabels.push({
          field: selectedField.value,
          value: value
        })
      }
      body[this.props.index].customLabels = customLabels
      if (this.state.node)
        document.removeEventListener('click', this.handleOutsideClick, false)
      this.props.bodyTemplate(body)
      this.props.templateUpdateError()
      this.setState({
        selectedField: null,
        customHeading: '',
        node: null
      })
    }
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

  removeelement = (array, elem) => {
    var index = array.indexOf(elem)
    while (index > -1) {
      array.splice(index, 1)
      index = array.indexOf(elem)
    }
  }

  handleClickSetTableType = event => {
    let body = JSON.parse(JSON.stringify(this.props.body))
    let widget = body[this.props.index]
    widget.tableType = event.target.value
    if (widget.projectConfig) {
      widget.projectConfig = {}
    }
    let fields = body[this.props.index].fields
    body[this.props.index].fields = []

    this.props.bodyTemplate(body)
    this.props.templateUpdateError()

    if (fields && fields.length > 0)
      this.setState({
        mainField: fields[fields.length - 1].substring(
          0,
          fields[fields.length - 1].indexOf('.')
        )
      })
  }

  handleYearRange = event => {
    let {
      customStartMonth,
      customStartYear,
      customEndMonth,
      customEndYear,
      monthList,
      yearList
    } = this.state
    const { index } = this.props
    const id = event.target.id
    let body = JSON.parse(JSON.stringify(this.props.body))
    let widget = body[index]
    if (id === 'Range') {
      customStartMonth = monthList[0].value
      customEndMonth = monthList[monthList.length - 1].value
      customStartYear = yearList[2].value
      customEndYear = yearList[0].value
      customEndMonth =
        new Date('1' + customEndMonth + customEndYear) > new Date()
          ? monthList[new Date().getMonth()].value
          : customEndMonth
      widget.metaData = {
        yearOption: 'SetYearRange',
        yearRange: event.target.value,
        selectedStartMonth: customStartMonth,
        selectedStartYear: customStartYear,
        selectedEndMonth: customEndMonth,
        selectedEndYear: customEndYear
      }
    } else {
      if (id === 'selectedStartMonth') customStartMonth = event.target.value
      else if (id === 'selectedStartYear') customStartYear = event.target.value
      else if (id === 'selectedEndMonth') customEndMonth = event.target.value
      else if (id === 'selectedEndYear') customEndYear = event.target.value
      widget.metaData = {
        yearOption: 'SetYearRange',
        yearRange: 'Custom',
        selectedStartMonth: customStartMonth,
        selectedStartYear: customStartYear,
        selectedEndMonth: customEndMonth,
        selectedEndYear: customEndYear
      }
    }

    this.setState({
      selectedYearRange: id === 'Range' ? event.target.value : 'Custom',
      customStartMonth,
      customStartYear,
      customEndMonth,
      customEndYear
    })

    this.props.bodyTemplate(body)
    this.props.templateUpdateError()
  }

  renderMetersOptionsFields = () => {
    const { index, body } = this.props
    const { mainField } = this.state
    const tableType = body[index].tableType
    const options = [
      { name: 'Totals', value: 'totals' },
      { name: 'Monthly Totals', value: 'monthlyTotals' }
    ]
    if (!mainField && mainField == '') return null
    return (
      <label
        className={classNames(
          styles['target__select'],
          styles['target__table-type']
        )}
      >
        <span>Report totals or monthly totals:</span>
        <div className={styles.radioContainer}>
          {options.map((option, index) => {
            return (
              <label key={index}>
                <input
                  type="radio"
                  name="open247"
                  value={option.value}
                  checked={tableType === option.value}
                  onChange={e => this.handleClickSetTableType(e)}
                />
                <span>{option.name}</span>
              </label>
            )
          })}
        </div>
      </label>
    )
  }

  renderFloorOptionsFields = () => {
    const { index, body } = this.props
    const tableType = body[index].tableType
    const options = [
      { name: 'Use Type', value: 'usetype' },
      { name: 'Floor', value: 'floors' }
    ]
    let type = ''
    type = tableType || 'usetype'
    return (
      <label
        className={classNames(
          styles['target__select'],
          styles['target__table-type']
        )}
      >
        <span>Summary By UseType or Floor:</span>
        <div className={styles.radioContainer}>
          {options.map((option, index) => {
            return (
              <label key={index}>
                <input
                  type="radio"
                  name="open247"
                  value={option.value}
                  checked={type === option.value}
                  onChange={e => this.handleClickSetTableType(e)}
                />
                <span>{option.name}</span>
              </label>
            )
          })}
        </div>
      </label>
    )
  }

  renderMainFields = array => {
    const { index, body } = this.props
    const fields = body[index].fields
    let mainField = ''
    mainField = this.state.mainField
    return (
      <div>
        <label className={styles['target__select']}>
          <span>Choose your table:</span>
          <div className={styles.selectContainer}>
            <select
              value={mainField}
              onChange={e => this.handleClickSetMainField(e)}
            >
              <option disabled value="select">
                Select Table
              </option>
              {array.map((field, i) => {
                return (
                  <option key={i} value={field.value}>
                    {field.name}
                  </option>
                )
              })}
            </select>
          </div>
        </label>
        <div>{this.tableLayout()}</div>
      </div>
    )
  }
  renderOperationFields = array => {
    const { index, body } = this.props
    const fields = body[index].fields
    // find the main field
    let subField = ''
    if (fields && typeof fields[0] === 'string') {
      subField = fields[0] // fields[0].substring(0, fields[0].indexOf('.'))
    } else {
      subField = 'select'
    }
    return (
      <label className={styles['target__select']}>
        <span>
          Select a Schedule Type (All schedules of this type will be export):
        </span>
        <div className={styles.selectContainer}>
          <select
            value={subField}
            onChange={e => this.handleClickSetSubField(e)}
          >
            <option disabled value="select">
              Select Schedule
            </option>
            {array.map((field, i) => {
              return (
                <option key={i} value={field.value}>
                  {field.name}
                </option>
              )
            })}
          </select>
        </div>
      </label>
    )
  }
  renderConstructionFields = array => {
    const { index, body } = this.props
    const fields = body[index].fields
    // find the main field
    let mainField = ''
    if (this.state.mainField) {
      mainField = this.state.mainField
    } else if (fields && typeof fields[0] === 'string') {
      mainField = fields[0].substring(0, fields[0].indexOf('.'))
    } else {
      mainField = 'select'
    }
    return (
      <label className={styles['target__select']}>
        <span>Select a Construction Application</span>
        <div className={styles.selectContainer}>
          <select
            value={mainField}
            onChange={e => this.handleClickSetMainField(e)}
          >
            <option disabled value="select">
              Select
            </option>
            {array.map((field, i) => {
              return (
                <option key={i} value={field.value}>
                  {field.name}
                </option>
              )
            })}
          </select>
        </div>
      </label>
    )
  }
  groupBy = (list, keyGetter) => {
    const map = new Map()
    list.forEach(item => {
      const key = keyGetter(item)
      const collection = map.get(key)
      if (!collection) {
        map.set(key, [item])
      } else {
        collection.push(item)
      }
    })
    return map
  }
  renderDisplayFields() {
    const { index, body } = this.props
    const displayStyles = [
      { name: 'Hide when no data available', value: 'hide' },
      { name: 'Show when no data available', value: 'show' }
    ]
    const listStyles = [
      {
        name: 'Images',
        value: 'images',
        subOptions: [
          {
            name: 'Add a Timestamp',
            value: 'timestamp'
          }
        ]
      },
      { name: 'Table', value: 'table' }
    ]
    return (
      <div>
        <span>
          <h4>Choose your display:</h4>
        </span>
        <div>
          {listStyles.map((listStyle, i) => {
            const formatCheck =
              body[index] &&
              body[index].projectConfig &&
              body[index].projectConfig.data &&
              body[index].projectConfig.data['format'] &&
              body[index].projectConfig.data['format'].indexOf(
                listStyle.value
              ) > -1
            return (
              <label
                key={i}
                className={classNames(
                  styles['target__input'],
                  styles['target__input--checkboxes']
                )}
              >
                <input
                  defaultChecked={formatCheck}
                  value={listStyle.value}
                  onChange={e => this.handleFormatChanged(e)}
                  className={classNames(formatCheck ? styles['checked'] : '')}
                  type="checkbox"
                />
                <span>{listStyle.name}</span>
                {formatCheck &&
                  listStyle.subOptions?.map(subOption => {
                    const subFormatChecked =
                      body[index] &&
                      body[index].projectConfig &&
                      body[index].projectConfig.data &&
                      body[index].projectConfig.data['subFormat'] &&
                      body[index].projectConfig.data['subFormat'].indexOf(
                        subOption.value
                      ) > -1
                    return (
                      <p>
                        <label
                          key={`list-style-${subOption.value}`}
                          className={classNames(
                            styles['target__input'],
                            styles['target__input--sub-checkboxes']
                          )}
                        >
                          <input
                            checked={subFormatChecked}
                            value={subOption.value}
                            onChange={event =>
                              this.handleSubFormatChanged(event)
                            }
                            className={classNames(
                              subFormatChecked ? styles['checked'] : ''
                            )}
                            type="checkbox"
                          />
                          <span>{subOption.name}</span>
                        </label>
                      </p>
                    )
                  })}
              </label>
            )
          })}
        </div>
        <br />
        <div>
          {displayStyles.map((displayStyle, i) => {
            const displayCheck =
              body[index] &&
              body[index].projectConfig &&
              body[index].projectConfig.data &&
              body[index].projectConfig.data['displayData'] ===
                displayStyle.value
            return (
              <label
                key={i}
                className={classNames(
                  styles['target__input'],
                  styles['target__input--checkboxes']
                )}
              >
                <input
                  defaultChecked={displayCheck}
                  value={displayStyle.value}
                  onChange={e => this.handleDisplayImages(e)}
                  className={classNames(displayCheck ? styles['checked'] : '')}
                  type="checkbox"
                />
                <span>{displayStyle.name}</span>
              </label>
            )
          })}
        </div>
      </div>
    )
  }
  renderCheckBoxSubFields = array => {
    const { index, body } = this.props
    const fields = body[index].fields
    const uniqueSections = [...new Set(array.map(field => field.section))]
    const grouped = this.groupBy(array, field => field.section)
    const customLabels = body[index].customLabels
    const { selectedField, customHeading } = this.state
    return uniqueSections.map((section, i) => {
      return (
        <div key={i} className={styles['target__inputs']}>
          {section !== 'General' && <h3>{section}</h3>}
          {grouped.get(section).map((field, i) => {
            let checkboxChecked = false
            let disabled = false
            if (fields.length > 0 && fields.indexOf(field.value) >= 0) {
              checkboxChecked = true
            }
            let mField = this.state.mainField
            let name = field.name
            if (customLabels) {
              const customLabel = find(customLabels, { field: field.value })
              if (customLabel) name = customLabel.value
            }
            if (selectedField && selectedField.value === field.value) {
              name = customHeading
            }
            if (!mField) {
              mField = this.state['mainField']
            }
            if (!mField) {
              if (fields && fields.length && fields[fields.length - 1]) {
                mField = fields[fields.length - 1]
                  .substring(0, fields[fields.length - 1].indexOf('.'))
                  .trim()
              }
            }
            if (
              body[index].tableType === 'monthlyTotals' &&
              (field.name === 'Total Usage Percent' ||
                field.name === 'Total Usage Cost Percent')
            ) {
              return
            }
            if (
              mField === 'summary' &&
              body[index].tableType === 'floors' &&
              (field.name === 'Use Type' ||
                field.name === 'Gross Use Type Area' ||
                field.name === '% of Use Type Area' ||
                field.name === '% of Common Area' ||
                field.name === '% of Tenant Area' ||
                field.name === '% of Conditioned Area' ||
                field.name === '% of Unconditioned Area')
            ) {
              return
            } //!body[index].tableType ||
            if (
              mField === 'summary' &&
              (!body[index].tableType || body[index].tableType === 'usetype') &&
              (field.name === 'Floor' ||
                field.name === 'Gross Floor Area' ||
                field.name === '% of Floor Area')
            ) {
              return
            }
            return (
              <label
                key={i}
                className={classNames(
                  styles['target__input'],
                  styles['target__input--checkboxes']
                )}
              >
                <input
                  defaultChecked={checkboxChecked}
                  value={field.value}
                  onChange={e => this.handleClickSaveCheckboxTable(e)}
                  className={classNames(
                    checkboxChecked ? styles['checked'] : ''
                  )}
                  type="checkbox"
                />
                <span>
                  {(!selectedField || selectedField.value !== field.value) && (
                    <div className={styles.fieldNameContainer}>
                      {name}
                      {checkboxChecked && (
                        <i
                          className="material-icons"
                          onClick={e => this.selectHeading(e, field, name)}
                        >
                          edit
                        </i>
                      )}
                    </div>
                  )}
                  {selectedField && selectedField.value === field.value && (
                    <div className={styles.fieldNameContainer}>
                      <input
                        className={styles.customHeadingInput}
                        type="text"
                        value={name}
                        onChange={e => {
                          this.handleUpdateHeading(e)
                        }}
                        ref={node => {
                          if (!this.state.node) this.setState({ node: node })
                        }}
                      />
                      <i
                        className="material-icons"
                        onClick={e => this.saveHeading(e)}
                      >
                        close
                      </i>
                    </div>
                  )}
                </span>
              </label>
            )
          })}
        </div>
      )
    })
  }

  saveSelectFields = (e, type) => {
    let body = JSON.parse(JSON.stringify(this.props.body))
    if (body) {
      let card = body[this.props.index]
      if (!card.projectConfig) {
        card.projectConfig = {}
      }
      if (card && !card.projectConfig.data) {
        card.projectConfig.data = {}
      } else {
        {
          console.log(
            '----saveSelectFields  card.projectConfig.data else' +
              e.target.value
          )
        }
      }
      // if it doesn't already exist
      if (!card.projectConfig.data[type]) {
        card.projectConfig.data[type] = ''
      }
      card.projectConfig.data[type] = e.target.value
      this.props.bodyTemplate(body)
      this.props.templateUpdateError()
    }
  }
  saveYearFormat = e => {
    let body = JSON.parse(JSON.stringify(this.props.body))
    let card = body[this.props.index]
    if (e.target.value !== '') {
      card.organize = e.target.value
    }
    this.props.bodyTemplate(body)
    this.props.templateUpdateError()
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
    const { mainField } = this.state
    let body = JSON.parse(JSON.stringify(this.props.body))
    let widget = body[this.props.index]
    let templateLayout = widget.tableLayout || 'horizontal'

    if (!mainField && mainField == '') return null
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
  selectFieldsFormat = (array, type) => {
    const { index, body } = this.props
    const card = body[index]
    // find the subFields field
    let selectValue = 'select'
    if (
      card &&
      card.projectConfig &&
      card.projectConfig.data &&
      card.projectConfig.data[type]
    ) {
      selectValue = card.projectConfig.data[type]
    }
    return (
      <select
        value={selectValue}
        onChange={e => this.saveSelectFields(e, type)}
      >
        <option disabled value="select">
          Select Order
        </option>
        {array.map((item, i) => {
          return (
            <option key={i} value={item.value}>
              {item.name}{' '}
            </option>
          )
        })}
      </select>
    )
  }

  renderYearOption = () => {
    const { yearOption } = this.state
    const array = [
      {
        name: 'Set on Export',
        value: 'SetOnExport'
      },
      {
        name: 'Set Year Range',
        value: 'SetYearRange'
      }
    ]
    return array.map((field, i) => {
      const ids = 'year-option-' + field.value + this.props.index
      return (
        <label key={i} htmlFor={ids}>
          <input
            type="radio"
            id={ids}
            name={`year-option-${this.props.index}`}
            value={field.value}
            checked={yearOption === field.value}
            onChange={e => this.handleClickYearOption(e)}
          />
          <span>{field.name}</span>
        </label>
      )
    })
  }

  renderYearRange = () => {
    const {
      mainField,
      selectedYearRange,
      customStartYear,
      customStartMonth,
      customEndYear,
      customEndMonth,
      yearList,
      monthList
    } = this.state
    const startMonth = customStartMonth || monthList[0].value
    let endMonth = customEndMonth || monthList[monthList.length - 1].value
    const startYear = customStartYear || yearList[2].value
    const endYear = customEndYear || yearList[0].value
    endMonth =
      new Date('1' + endMonth + endYear) > new Date()
        ? monthList[new Date().getMonth()].value
        : endMonth
    const startDate = new Date(
      '1 ' +
        startMonth +
        (startYear && startYear !== undefined ? startYear : '1')
    )
    const endDate = new Date(
      '1 ' + endMonth + (endYear && endYear !== undefined ? endYear : '1')
    )

    if (!mainField && mainField == '') return null
    return (
      <div>
        <div className={styles.yearRange}>
          <label className={styles['target__select']}>
            <span>Year Range:</span>
            <div className={styles.selectContainer}>
              <select
                onChange={e => this.handleYearRange(e)}
                value={selectedYearRange}
                name="Range"
                id="Range"
              >
                {yearRange.map((item, i) => {
                  return (
                    <option key={item.key} value={item.value}>
                      {item.label}
                    </option>
                  )
                })}
              </select>
            </div>
          </label>
        </div>
        {selectedYearRange == 'Custom' && (
          <div>
            <CustomRange
              handleChange={this.handleYearRange}
              startMonth={startMonth}
              startYear={startYear}
              endMonth={endMonth}
              endYear={endYear}
              startDate={startDate}
              endDate={endDate}
              monthList={monthList}
              yearList={yearList}
              page={'Table'}
            />
          </div>
        )}
      </div>
    )
  }

  renderTargetOptions = () => {
    const { index, body } = this.props
    const { fields, organize, target } = body[index]
    const { yearOption } = this.state
    let mainField = ''
    mainField = this.state.mainField
    let strType = ''
    let orderByFields = []
    let list = []
    const orderFields = [
      { name: 'A-Z (Low to high)', value: 'ascending' },
      { name: 'Z-A (High to low)', value: 'descending' }
    ]

    switch (target) {
      case 'overview':
        const overviewFields = OverviewFields
        return (
          <div className={styles['target__options']}>
            {this.renderMainFields(overviewFields)}
            {mainField && (
              <div className={styles.yearOption}>
                <p>Year options:</p>
                {this.renderYearOption()}
              </div>
            )}

            {yearOption === 'SetYearRange' && (
              <div>{this.renderYearRange()}</div>
            )}
            <br />
            {mainField && (
              <YearFormat value={organize} onChange={this.saveYearFormat} />
            )}
            {overviewFields.map((field, i) => {
              if (mainField === field.value) {
                return (
                  <div key={i} className={styles['target__sub-fields']}>
                    <span>Choose your columns for {field.name}</span>
                    <div>{this.renderCheckBoxSubFields(field.subFields)}</div>
                  </div>
                )
              }
            })}
          </div>
        )
      case 'endusebreakdown':
        const enduseFields = EndUseFields
        return (
          <div className={styles['target__options']}>
            {this.renderMainFields(enduseFields)}
            {mainField && (
              <div className={styles.yearOption}>
                <p>Year options:</p>
                {this.renderYearOption()}
              </div>
            )}
            {yearOption === 'SetYearRange' && (
              <div>{this.renderYearRange()}</div>
            )}
            <br />
            {mainField && (
              <YearFormat value={organize} onChange={this.saveYearFormat} />
            )}
            {enduseFields.map((field, i) => {
              if (mainField === field.value) {
                return (
                  <div key={i} className={styles['target__sub-fields']}>
                    <span>Choose your columns for {field.name}</span>
                    <div>{this.renderCheckBoxSubFields(field.subFields)}</div>
                  </div>
                )
              }
            })}
          </div>
        )
      case 'utility':
        const utilityFields = UtilityFields
        return (
          <div className={styles['target__options']}>
            {this.renderMainFields(utilityFields)}
            {target === 'utility' && (
              <div>{this.renderMetersOptionsFields()}</div>
            )}
            <br />
            {mainField && (
              <div className={styles.yearOption}>
                <p>Year options:</p>
                {this.renderYearOption()}
              </div>
            )}
            {yearOption === 'SetYearRange' && (
              <div>{this.renderYearRange()}</div>
            )}
            <br />
            {mainField && (
              <YearFormat value={organize} onChange={this.saveYearFormat} />
            )}
            {utilityFields.map((field, i) => {
              if (mainField === field.value) {
                return (
                  <div key={i} className={styles['target__sub-fields']}>
                    <span>Choose your fields for {field.name}</span>
                    <div>{this.renderCheckBoxSubFields(field.subFields)}</div>
                  </div>
                )
              }
            })}
          </div>
        )
      case 'operation':
        const operationFields = OperationFields
        return (
          <div className={styles['target__options']}>
            {this.renderOperationFields(operationFields)}
          </div>
        )
      case 'construction':
        const constructionFields = ConstructionFields
        strType = ''
        if (fields && fields[0]) {
          strType = fields[0].substring(0, fields[0].indexOf('.')).trim()
        }
        list = []
        constructionFields.map(ele => {
          if (ele.value === strType) {
            ele.subFields.map(subField => {
              list.push(subField)
            })
          }
        })
        // get orderBy array from only selected data fields
        orderByFields = list.filter(object => {
          if (fields) {
            return fields.some(item => {
              return object.value === item
            })
          }
        })

        return (
          <div>
            <div className={styles['target__options']}>
              {this.renderConstructionFields(constructionFields)}
              {constructionFields.map((field, i) => {
                if (mainField === field.value) {
                  return (
                    <div key={i} className={styles['target__sub-fields']}>
                      <div>{this.renderDisplayFields()}</div>
                      <span>
                        <h4>Choose your Table Headings</h4>
                      </span>
                      <span>
                        Select the headings for your template. The Order they
                        are selected will reflect the order in the sheet.{' '}
                      </span>
                      <div>{this.renderCheckBoxSubFields(field.subFields)}</div>
                    </div>
                  )
                }
              })}

              <p>Order By</p>
              <div className={styles.selectContainer}>
                {this.selectFieldsFormat(orderByFields, 'orderBy')}
              </div>
              <p>Order</p>
              <div className={styles.selectContainer}>
                {this.selectFieldsFormat(orderFields, 'order')}
              </div>
            </div>
          </div>
        )
      case 'location':
        const locationFields = LocationFields
        list = []
        strType = ''
        if (fields && fields[0]) {
          strType = fields[0].substring(0, fields[0].indexOf('.')).trim()
        }
        locationFields.map(ele => {
          if (ele.value === strType) {
            ele.subFields.map(subField => {
              list.push(subField)
            })
          }
        })
        // get orderBy array from only selected data fields
        orderByFields = list.filter(object => {
          if (fields) {
            return fields.some(item => {
              return object.value === item
            })
          }
        })
        return (
          <div className={styles['target__options']}>
            {this.renderMainFields(locationFields)}
            {mainField.includes('summary') && (
              <div>{this.renderFloorOptionsFields()}</div>
            )}
            {locationFields.map((field, i) => {
              if (mainField === field.value) {
                return (
                  <div key={i} className={styles['target__sub-fields']}>
                    <span>
                      <h4>Choose your Table Headings</h4>
                    </span>
                    <span>
                      Select the headings for your template. The Order they are
                      selected will reflect the order in the sheet.
                    </span>
                    <div>{this.renderCheckBoxSubFields(field.subFields)}</div>
                  </div>
                )
              }
            })}
            <p>Order By</p>
            <div className={styles.selectContainer}>
              {this.selectFieldsFormat(orderByFields, 'orderBy')}
            </div>
            <p>Order</p>
            <div className={styles.selectContainer}>
              {this.selectFieldsFormat(orderFields, 'order')}
            </div>
          </div>
        )
      case 'contact':
        const contactFields = ContactFields

        // get orderBy array from only selected data fields
        orderByFields = contactFields.filter(object => {
          if (fields) {
            return fields.some(item => {
              return object.value === item
            })
          }
        })
        return (
          <div className={styles['target__options']}>
            <span>Choose Fields :</span>
            <div>{this.renderCheckBoxSubFields(contactFields)}</div>
            <p>Order By</p>
            <div className={styles.selectContainer}>
              {this.selectFieldsFormat(orderByFields, 'orderBy')}
            </div>
            <p>Order</p>
            <div className={styles.selectContainer}>
              {this.selectFieldsFormat(orderFields, 'order')}
            </div>
          </div>
        )
    }
  }

  render() {
    return <div>{this.renderTargetOptions()}</div>
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

export default withConnect(Table)
