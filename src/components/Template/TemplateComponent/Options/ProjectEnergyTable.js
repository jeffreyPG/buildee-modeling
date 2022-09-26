import React, { Component } from 'react'
import moment from 'moment'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import classNames from 'classnames'
import styles from './Projects.scss'
import tableStyles from '../BodyComponents/TemplateTarget.scss'
import { yearRange } from '../../../../utils/ReportOptions'
import CustomRange from '../../../../utils/customRange'
import targetStyles from '../../TemplateComponent/BodyComponents/TemplateTarget.scss'
import { formatUnderscoreNotation } from 'utils/Utils'
import {
  bodyTemplate,
  templateUpdateError
} from 'routes/Template/modules/template'
import { find, findIndex } from 'lodash'

export class ProjectEnergyTable extends Component {
  static propTypes = {
    bodyTemplate: PropTypes.func.isRequired,
    templateUpdateError: PropTypes.func.isRequired,
    body: PropTypes.array.isRequired
  }
  state = {
    mainField: '',
    selectedField: null,
    customHeading: '',
    node: null,
    yearOption: 'SetOnExport'
  }
  saveRadioFields = (e, type) => {
    let body = JSON.parse(JSON.stringify(this.props.body))
    let card = body[this.props.index]
    card.projectConfig[type] = e.target.value
    this.props.bodyTemplate(body)
    this.props.templateUpdateError()
  }
  saveCheckboxFields = e => {
    let body = JSON.parse(JSON.stringify(this.props.body))
    let card = body[this.props.index]
    // if it doesn't already exist
    if (!card.projectConfig.data) {
      card.projectConfig.data = {}
    }
    if (!card.projectConfig.data.fields) {
      card.projectConfig.data.fields = []
    }
    if (e.target.checked) {
      card.projectConfig.data.fields.push(e.target.value)
    } else {
      card.projectConfig.data.fields = card.projectConfig.data.fields.filter(
        item => item !== e.target.value
      )
      // if the unchecked box was the field they were ordering by
      if (e.target.value === card.projectConfig.data.orderBy) {
        card.projectConfig.data.orderBy = ''
      }
    }
    this.props.bodyTemplate(body)
    this.props.templateUpdateError()
  }

  saveSelectFields = (e, type) => {
    let body = JSON.parse(JSON.stringify(this.props.body))
    let card = body[this.props.index]
    // if it doesn't already exist
    if (!card.projectConfig.data[type]) {
      card.projectConfig.data[type] = ''
    }
    card.projectConfig.data[type] = e.target.value
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
      let card = body[this.props.index]
      let customLabels =
        card &&
        card.projectConfig &&
        card.projectConfig.data &&
        card.projectConfig.data.customLabels
      if (!customLabels) customLabels = []
      const index = findIndex(customLabels, { field: selectedField.value })
      if (index > -1) customLabels.splice(index, 1)
      if (value) {
        customLabels.push({
          field: selectedField.value,
          value
        })
      }
      card.projectConfig.data.customLabels = customLabels
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

  clearDataFields = () => {
    let body = JSON.parse(JSON.stringify(this.props.body))
    let card = body[this.props.index]
    card.projectConfig.data.fields = []
    card.projectConfig.data.customLabels = []
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

  checkboxFieldsFormat = (array, type) => {
    const { index, body } = this.props
    const card = body[index]
    const customLabels =
      (card &&
        card.projectConfig &&
        card.projectConfig.data &&
        card.projectConfig.data.customLabels) ||
      []
    const { selectedField, customHeading } = this.state
    return array.map((item, i) => {
      let checkboxChecked = false
      if (
        type === 'data' &&
        card &&
        card.projectConfig &&
        card.projectConfig.data &&
        card.projectConfig.data.fields &&
        card.projectConfig.data.fields.includes(item.value)
      ) {
        checkboxChecked = true
      }
      let name = item.name
      if (customLabels && customLabels.length > 0) {
        const customLabel = find(customLabels, { field: item.value })
        if (customLabel) name = customLabel.value
      }
      if (selectedField && selectedField.value === item.value) {
        name = customHeading
      }
      return (
        <label key={i}>
          <input
            defaultChecked={checkboxChecked}
            value={item.value}
            name={'Projects ' + type}
            onChange={e => this.saveCheckboxFields(e, type)}
            className={classNames(checkboxChecked ? styles.checked : '')}
            type="checkbox"
          />
          <span className={styles.customLabelSpan}>
            {(!selectedField || selectedField.value !== item.value) && (
              <div className={tableStyles.fieldNameContainer}>
                {name}
                {checkboxChecked && (
                  <i
                    className="material-icons"
                    onClick={e => this.selectHeading(e, item, name)}
                  >
                    edit
                  </i>
                )}
              </div>
            )}
            {selectedField && selectedField.value === item.value && (
              <div className={tableStyles.fieldNameContainer}>
                <input
                  className={tableStyles.customHeadingInput}
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
        <span>Arrange</span>
        <div className={targetStyles.radioContainer}>
          {layoutList.map((item, i) => {
            return (
              <label key={i}>
                <input
                  type="radio"
                  name="layout"
                  value={item.value}
                  checked={templateLayout === item.value}
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
    const { monthList, yearList } = this.state
    let customStartMonth = monthList[0].value
    let customEndMonth = monthList[monthList.length - 1].value
    let customStartYear = yearList[yearList.length - 1].value
    let customEndYear = yearList[0].value

    let body = JSON.parse(JSON.stringify(this.props.body))
    let widget = body[this.props.index]
    let range = '12'
    let yearOption =
      (widget.metaData && widget.metaData.yearOption) || 'SetOnExport'
    range = (widget.metaData && widget.metaData.yearRange) || '12'
    if (!widget.tableLayout) {
      widget.tableLayout = 'horizontal'
    }
    if (
      !widget.metaData ||
      (Object.keys(widget.metaData).length === 0 &&
        widget.metaData.constructor === Object)
    ) {
      widget.metaData = {
        yearOption: yearOption
      }
    }
    if (widget.metaData.yearRange === 'Custom') {
      if (range === 'Custom') {
        const timePeriod = widget.metaData
        range = timePeriod.yearRange
        customStartMonth = timePeriod.customStartMonth
        customStartYear = timePeriod.customStartYear
        customEndMonth = timePeriod.customEndMonth
        customEndYear = timePeriod.customEndYear
      }
    } else {
      const timePeriod = widget.metaData
      range = timePeriod.yearRange
      customStartMonth = ''
      customStartYear = ''
      customEndMonth = ''
      customEndYear = ''
    }
    this.setState({
      yearOption,
      selectedYearRange: range,
      customStartMonth,
      customStartYear,
      customEndMonth,
      customEndYear
    })
    this.props.bodyTemplate(body)
    this.props.templateUpdateError()
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
    let body = JSON.parse(JSON.stringify(this.props.body))
    const id = event.target.id
    let period = ''
    let widget = body[index]
    if (id === 'Range') {
      if (event.target.value === 'Custom') {
        customStartMonth = monthList[0].value
        customEndMonth = monthList[monthList.length - 1].value
        customStartYear = yearList[yearList.length - 1].value
        customEndYear = yearList[0].value
        period = {
          yearOption: 'SetYearRange',
          yearRange: 'Custom',
          customStartMonth: customStartMonth,
          customStartYear: customStartYear,
          customEndMonth: customEndMonth,
          customEndYear: customEndYear
        }
      } else
        period = {
          yearOption: 'SetYearRange',
          yearRange: event.target.value,
          customStartMonth: '',
          customStartYear: '',
          customEndMonth: '',
          customEndYear: ''
        }
    } else {
      if (id === 'selectedStartMonth') customStartMonth = event.target.value
      else if (id === 'selectedStartYear') customStartYear = event.target.value
      else if (id === 'selectedEndMonth') customEndMonth = event.target.value
      else if (id === 'selectedEndYear') customEndYear = event.target.value
      period = {
        yearRange: 'Custom',
        yearOption: 'SetYearRange',
        customStartMonth: customStartMonth,
        customStartYear: customStartYear,
        customEndMonth: customEndMonth,
        customEndYear: customEndYear
      }
    }
    widget.metaData = period

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
      const ids = 'year-option-' + field.value
      return (
        <label key={i} htmlFor={ids}>
          <input
            type="radio"
            id={ids}
            name="year-option"
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
      selectedYearRange,
      customStartYear,
      customStartMonth,
      customEndYear,
      customEndMonth,
      yearList,
      monthList
    } = this.state
    const startMonth = customStartMonth || monthList[0].value
    const endMonth = customEndMonth || monthList[monthList.length - 1].value
    const startYear = customStartYear || yearList[yearList.length - 1].value
    const endYear = customEndYear || yearList[0].value
    const startDate = new Date(
      '1 ' +
        startMonth +
        (startYear && startYear !== undefined ? startYear : '1')
    )
    const endDate = new Date(
      '1 ' + endMonth + (endYear && endYear !== undefined ? endYear : '1')
    )

    return (
      <div>
        <div className={targetStyles.yearRange}>
          <label className={targetStyles['target__select']}>
            <span>Year Range:</span>
            <div className={targetStyles.selectContainer}>
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
          <div className={styles.customRangeImpacts}>
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
              page={'Data'}
            />
          </div>
        )}
      </div>
    )
  }

  render() {
    const { index, body } = this.props
    const { yearOption } = this.state
    const projectConfig = body[index].projectConfig

    const dataFields = [
      { name: 'Electricity Usage', value: 'electric_use' },
      { name: 'Natural Gas Usage', value: 'natural_usage' },
      { name: 'Total Energy Usage (kBtu)', value: 'total_energy' },
      { name: 'EUI', value: 'energy.eui' },
      { name: 'GHG Emissions', value: 'energy.ghg_emission' },
      { name: 'GHG Intensity', value: 'energy.ghg' }
    ]

    const orderFields = [
      { name: 'A-Z (Low to high)', value: 'ascending' },
      { name: 'Z-A (High to low)', value: 'descending' }
    ]

    // get orderBy array from only selected data fields
    const orderByFields = dataFields.filter(object => {
      if (projectConfig && projectConfig.data && projectConfig.data.fields) {
        return projectConfig.data.fields.some(item => {
          return object.value === item
        })
      }
    })

    return (
      <div>
        <br />
        <div className={tableStyles.yearOption}>
          <p>Year options:</p>
          {this.renderYearOption()}
        </div>
        {yearOption === 'SetYearRange' && this.renderYearRange()}
        <h3>Choose your data</h3>
        <div className={styles.data}>
          {projectConfig &&
            projectConfig.data &&
            projectConfig.data.fields &&
            projectConfig.data.fields.map((item, index) => {
              let arrayLength = projectConfig.data.fields.length
              let customLabels =
                (projectConfig.data && projectConfig.data.customLabels) || []
              const customLabel =
                customLabels.length > 0
                  ? find(customLabels, { field: item })
                  : null
              if (customLabel) {
                return (
                  <p key={index}>
                    {arrayLength === index + 1 && customLabel.value}
                    {arrayLength !== index + 1 && customLabel.value + ', '}
                  </p>
                )
              }
              return (
                <p key={index}>
                  {arrayLength === index + 1 && formatUnderscoreNotation(item)}
                  {arrayLength !== index + 1 &&
                    formatUnderscoreNotation(item) + ', '}
                </p>
              )
            })}
        </div>
        <div className={styles.checkboxContainer}>
          {this.checkboxFieldsFormat(dataFields, 'data')}
          <div
            className={styles.dataClear}
            onClick={() => this.clearDataFields()}
          >
            Clear Fields
          </div>
        </div>
        <div>{this.tableLayout()}</div>
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

export default withConnect(ProjectEnergyTable)
