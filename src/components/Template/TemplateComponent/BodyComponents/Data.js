import React, { Component } from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import moment from 'moment'
import styles from './TemplateTarget.scss'
import {
  OverviewFields,
  EndUseFields,
  UtilityFields,
  DataBuildingFields,
  DataUserFields,
  yearRange
} from '../../../../utils/ReportOptions'
import { findLastIndex } from '../../../../utils/Utils'
import CustomRange from '../../../../utils/customRange'
import {
  bodyTemplate,
  templateUpdateError
} from 'routes/Template/modules/template'
import { find, findIndex } from 'lodash'

export class Data extends Component {
  static propTypes = {
    index: PropTypes.number.isRequired,
    bodyTemplate: PropTypes.func.isRequired,
    templateUpdateError: PropTypes.func.isRequired,
    target: PropTypes.string.isRequired,
    body: PropTypes.array
  }

  state = {
    selectedYearRange: '12',
    customStartMonth: '',
    customStartYear: '',
    customEndMonth: '',
    customEndYear: '',
    monthList: [],
    yearList: [],
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
    const { monthList, yearList } = this.state
    let customStartMonth = monthList[0].value
    let customEndMonth = monthList[monthList.length - 1].value
    let customStartYear = yearList[2].value
    let customEndYear = yearList[0].value
    let yearOption
    let body = JSON.parse(JSON.stringify(this.props.body))
    let metaData = body[this.props.index].metaData
      ? body[this.props.index].metaData
      : {}
    let range = metaData.yearRange ? metaData.yearRange : '12'
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
    yearOption = (metaData && metaData.yearOption) || 'SetOnExport'
    this.setState({
      selectedYearRange: range,
      customStartMonth,
      customStartYear,
      customEndMonth,
      customEndYear,
      yearOption
    })
    this.props.bodyTemplate(body)
    this.props.templateUpdateError()
  }

  componentDidUpdate = prevProps => {
    if (
      prevProps.target != this.props.target &&
      (this.props.target == 'utility' ||
        this.props.target == 'overview' ||
        this.props.target == 'endusebreakdown')
    ) {
      const { index } = this.props
      let body = JSON.parse(JSON.stringify(this.props.body))
      let widget = body[index]
      widget.metaData = {
        yearOption: 'SetOnExport'
      }
      this.setState({ selectedYearRange: '12', yearOption: 'SetOnExport' })
      this.props.bodyTemplate(body)
      this.props.templateUpdateError()
    }
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
              page={'Data'}
            />
          </div>
        )}
      </div>
    )
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

  handleClickSaveText = event => {
    let body = JSON.parse(JSON.stringify(this.props.body))
    let widget = body[this.props.index]
    if (event.target.checked) {
      const mField = event.target.value.substring(
        0,
        event.target.value.indexOf('.')
      )
      const lastIndex = findLastIndex(widget.fields, mField)

      if (lastIndex != -1) {
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

  handleClickSaveLabels = event => {
    let body = JSON.parse(JSON.stringify(this.props.body))
    body[this.props.index].dataLabels = event.target.value
    this.props.bodyTemplate(body)
    this.props.templateUpdateError()
  }
  saveYearFormat = e => {
    let { body } = this.props
    let card = body[this.props.index]
    if (e.target.value !== '') {
      card.organize = e.target.value
    }
    this.props.handleUpdateTemplateState(body)
  }
  renderLabelStyles = array => {
    return array.map((field, i) => {
      const { index, body } = this.props
      const ids = 'label-style-' + field.value
      return (
        <label key={i} htmlFor={ids}>
          <input
            type="radio"
            id={ids}
            name="label-style"
            value={field.value}
            defaultChecked={body[index].dataLabels === field.value}
            onChange={e => this.handleClickSaveLabels(e)}
          />
          <span>{field.name}</span>
        </label>
      )
    })
  }

  renderFields = array => {
    const { index, body } = this.props
    const fields = body[index].fields
    const customLabels = body[index].customLabels
    const { selectedField, customHeading } = this.state
    return array.map((field, i) => {
      let checkboxChecked = false
      if (fields.length > 0 && fields.indexOf(field.value) >= 0) {
        checkboxChecked = true
      }
      let name = field.name
      if (customLabels) {
        const customLabel = find(customLabels, { field: field.value })
        if (customLabel) name = customLabel.value
      }
      if (selectedField && selectedField.value === field.value) {
        name = customHeading
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
            onChange={e => this.handleClickSaveText(e)}
            className={classNames(checkboxChecked ? styles['checked'] : '')}
            type="checkbox"
            name="data"
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
    })
  }
  findFields = (option, dataSource) => {
    let fields
    let list
    switch (dataSource) {
      case 'overview':
        fields = OverviewFields
        break
      case 'utility':
        fields = UtilityFields
        break
      case 'endusebreakdown':
        fields = EndUseFields
        break
    }
    fields.map((each, i) => {
      if (each.name === option) {
        list = each.subFields
      }
    })
    return list
  }
  renderTargetOptions = () => {
    const { index, body } = this.props
    const { target, organize } = body[index]
    const { yearOption } = this.state

    switch (target) {
      case 'overview':
        const summaryFields = this.findFields('Summary', 'overview')
        const electricity = this.findFields('Electricity', 'overview')
        const naturalGas = this.findFields('Natural Gas', 'overview')
        const water = this.findFields('Water', 'overview')
        const steam = this.findFields('Steam', 'overview')
        const f2 = this.findFields('Fuel Oil 2', 'overview')
        const f4 = this.findFields('Fuel Oil 4', 'overview')
        const f56 = this.findFields('Fuel Oil 5 & 6', 'overview')
        const diesel = this.findFields('Diesel', 'overview')
        const otherFuel = this.findFields('Other Fuel', 'overview')
        const ratesFields = this.findFields('Rates', 'overview')
        const ghg = this.findFields('GHG Emissions', 'overview')
        const portfolio = this.findFields('Portfolio Manager', 'overview')
        const annualCostBenchmark = this.findFields(
          'Annual Cost Benchmark',
          'overview'
        )
        const annualUsageBenchmark = this.findFields(
          'Annual Usage Benchmark',
          'overview'
        )
        const degreeDays = this.findFields('Degree Days', 'overview')

        return (
          <div className={styles['target__options']}>
            <div className={styles.yearOption}>
              <p>Year options:</p>
              {this.renderYearOption()}
            </div>
            {yearOption === 'SetYearRange' && this.renderYearRange()}
            {/* <YearFormat value={organize} onChange={this.saveYearFormat} /> */}
            <p>Choose the information to be displayed about the overview:</p>
            <h3>Summary</h3>
            {this.renderFields(summaryFields)}
            <h3>Electricity</h3>
            {this.renderFields(electricity)}
            <h3>Natural Gas</h3>
            {this.renderFields(naturalGas)}
            <h3>Water</h3>
            {this.renderFields(water)}
            <h3>Steam</h3>
            {this.renderFields(steam)}
            <h3>Fuel Oil 2 </h3>
            {this.renderFields(f2)}
            <h3>Fuel Oil 4</h3>
            {this.renderFields(f4)}
            <h3>Fuel Oil 5 & 6</h3>
            {this.renderFields(f56)}
            <h3>Diesel</h3>
            {this.renderFields(diesel)}
            <h3>Other Fuel</h3>
            {this.renderFields(otherFuel)}
            <h3>Rates</h3>
            {this.renderFields(ratesFields)}
            <h3>GHG Emissions</h3>
            {this.renderFields(ghg)}
            <h3>Portfolio Manager</h3>
            {this.renderFields(portfolio)}
            <h3>Annual Cost Benchmark</h3>
            {this.renderFields(annualCostBenchmark)}
            <h3>Annual Usage Benchmark</h3>
            {this.renderFields(annualUsageBenchmark)}
            <h3>Degree Days</h3>
            {this.renderFields(degreeDays)}
          </div>
        )
      case 'endusebreakdown':
        const EEUB = this.findFields(
          'Estimated End Use Breakdown',
          'endusebreakdown'
        )
        const AEUB = this.findFields(
          'Actual End Use Breakdown',
          'endusebreakdown'
        )
        return (
          <div className={styles['target__options']}>
            <div className={styles.yearOption}>
              <p>Year options:</p>
              {this.renderYearOption()}
            </div>
            {yearOption === 'SetYearRange' && this.renderYearRange()}
            {/* <YearFormat value={organize} onChange={this.saveYearFormat} /> */}
            <p>
              Choose the information to be displayed about the end use
              breakdown:
            </p>
            <h3>Estimated End Use Breakdown</h3>
            {this.renderFields(EEUB)}
            <h3>Actual End Use Breakdown</h3>
            {this.renderFields(AEUB)}
          </div>
        )
      case 'building':
        const buildingFields = DataBuildingFields
        return (
          <div className={styles['target__options']}>
            <p>Choose the information to be displayed about the building:</p>
            {this.renderFields(buildingFields)}
          </div>
        )
      case 'user':
        const userFields = DataUserFields
        return (
          <div className={styles['target__options']}>
            <p>Choose the information to be displayed about the user:</p>
            {this.renderFields(userFields)}
          </div>
        )
      case 'utility':
        const electricityUtils = this.findFields('Electricity', 'utility')
        const naturalGasUtils = this.findFields('Natural Gas', 'utility')
        const waterUtils = this.findFields('Water', 'utility')
        const steamUtils = this.findFields('Steam', 'utility')
        const f2Utils = this.findFields('Fuel Oil 2', 'utility')
        const f4Utils = this.findFields('Fuel Oil 4', 'utility')
        const f56Utils = this.findFields('Fuel Oil 5 & 6', 'utility')
        const dieselUtils = this.findFields('Diesel', 'utility')
        const otherFuelUtils = this.findFields('Others', 'utility')
        return (
          <div className={styles['target__options']}>
            <div className={styles.yearOption}>
              <p>Year options:</p>
              {this.renderYearOption()}
            </div>
            {yearOption === 'SetYearRange' && this.renderYearRange()}
            {/* <YearFormat value={organize} onChange={this.saveYearFormat} /> */}
            <p>Choose the information to be displayed about your utilities:</p>
            <h3>Electricity</h3>
            {this.renderFields(electricityUtils)}
            <h3>Natural Gas</h3>
            {this.renderFields(naturalGasUtils)}
            <h3>Water</h3>
            {this.renderFields(waterUtils)}
            <h3>Steam</h3>
            {this.renderFields(steamUtils)}
            <h3>Fuel Oil 2</h3>
            {this.renderFields(f2Utils)}
            <h3>Fuel Oil 4</h3>
            {this.renderFields(f4Utils)}
            <h3>Fuel Oil 5 & 6</h3>
            {this.renderFields(f56Utils)}
            <h3>Diesel</h3>
            {this.renderFields(dieselUtils)}
            <h3>Other Fuels</h3>
            {this.renderFields(otherFuelUtils)}
          </div>
        )
    }
  }

  render() {
    const labelStyles = [
      { name: 'Show labels', value: 'show' },
      { name: 'Hide Labels', value: 'hide' }
    ]
    return (
      <div>
        {this.renderTargetOptions()}
        <div className={styles['target__list-style']}>
          <p>Label options:</p>
          {this.renderLabelStyles(labelStyles)}
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

export default withConnect(Data)
