import React, { Component } from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import moment from 'moment'

import styles from './TemplateTarget.scss'
import BulletFormattedList from '../Options/BulletFormattedList'
import CustomRange from '../../../../utils/customRange'
import {
  OverviewFields,
  EndUseFields,
  UtilityFields,
  yearRange
} from '../../../../utils/ReportOptions'
import { findLastIndex } from '../../../../utils/Utils'
import {
  bodyTemplate,
  templateUpdateError
} from 'routes/Template/modules/template'

export class DataList extends Component {
  static propTypes = {
    index: PropTypes.number.isRequired,
    bodyTemplate: PropTypes.func.isRequired,
    templateUpdateError: PropTypes.func.isRequired,
    body: PropTypes.array
  }

  state = {
    mainField: '',
    selectedYearRange: '',
    customStartMonth: '',
    customStartYear: '',
    customEndMonth: '',
    customEndYear: '',
    monthList: [],
    yearList: []
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
      yearList
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
    let range = '12'
    if (!widget.metaData) {
      widget.metaData = {}
    }
    if (mField !== '') {
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
    this.setState({
      mainField: mField,
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
        yearRange: '12'
      }
      this.props.bodyTemplate(body)
      this.props.templateUpdateError()
      this.setState({ mainField: '', selectedYearRange: '12' })
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
    customStartMonth = monthList[0].value
    customEndMonth = monthList[monthList.length - 1].value
    customStartYear = yearList[1].value
    customEndYear = yearList[0].value
    customEndMonth =
      new Date('1' + customEndMonth + customEndYear) > new Date()
        ? monthList[new Date().getMonth()].value
        : customEndMonth
    let body = JSON.parse(JSON.stringify(this.props.body))
    let widget = body[this.props.index]
    let yearRange = '12'
    if (this.state.mainField !== event.target.value) {
      if (widget.metaData) {
        if (!widget.metaData.yearRange) {
          widget.metaData = {
            yearRange: '12',
            selectedStartMonth: customStartMonth,
            selectedStartYear: customStartYear,
            selectedEndMonth: customEndMonth,
            selectedEndYear: customEndYear
          }
        } else {
          yearRange = widget.metaData.yearRange
        }
      }
      this.setState({
        mainField: event.target.value,
        selectedYearRange: yearRange
      })
      this.props.bodyTemplate(body)
      this.props.templateUpdateError()
    }
  }

  handleClickSaveList = event => {
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
        const yearIndex = widget.fields.findIndex(
          x => x.substring(0, x.indexOf('.')) === 'year'
        )
        if (yearIndex === -1) widget.fields.push(event.target.value)
        else widget.fields.splice(yearIndex, 0, event.target.value)
      }
    } else {
      widget.fields = widget.fields.filter(function(a) {
        return a !== event.target.value
      })
    }
    this.props.bodyTemplate(body)
    this.props.templateUpdateError()
  }

  handleClickSaveStyle = event => {
    let body = JSON.parse(JSON.stringify(this.props.body))
    body[this.props.index].type = event.target.value
    this.props.bodyTemplate(body)
    this.props.templateUpdateError()
  }

  handleClickSaveLabels = event => {
    let body = JSON.parse(JSON.stringify(this.props.body))
    body[this.props.index].dataLabels = event.target.value
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
  saveYearFormat = e => {
    let body = JSON.parse(JSON.stringify(this.props.body))
    let card = body[this.props.index]
    if (e.target.value !== '') {
      card.organize = e.target.value
    }
    this.props.bodyTemplate(body)
    this.props.templateUpdateError()
  }
  renderListStyles = array => {
    return array.map((field, i) => {
      const { index, body } = this.props
      const ids = 'list-style-' + field.value
      return (
        <label key={i} htmlFor={ids}>
          <input
            type="radio"
            id={ids}
            name="list-style"
            value={field.value}
            defaultChecked={body[index].type === field.value}
            onChange={e => this.handleClickSaveStyle(e)}
          />
          <span>{field.name}</span>
        </label>
      )
    })
  }

  renderMainFields = array => {
    const { index, body } = this.props
    const fields = body[index].fields
    // find the main field
    let mainField = ''
    mainField = this.state.mainField

    return (
      <label className={styles['target__select']}>
        <span>Choose your list:</span>
        <div className={styles.selectContainer}>
          <select
            value={mainField}
            onChange={e => this.handleClickSetMainField(e)}
          >
            <option disabled value="select">
              Select List
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

  renderSubFields = array => {
    const { index, body } = this.props
    const fields = body[index].fields
    return array.map((field, i) => {
      return (
        <label
          key={i}
          className={classNames(
            styles['target__input'],
            styles['target__input--checkboxes']
          )}
        >
          <input
            defaultChecked={
              fields.length > 0 && fields.indexOf(field.value) >= 0
            }
            value={field.value}
            onChange={e => this.handleClickSaveList(e)}
            className={classNames(
              fields.length > 0 && fields.indexOf(field.value) >= 0
                ? styles['checked']
                : ''
            )}
            type="checkbox"
          />
          <span>{field.name}</span>
        </label>
      )
    })
  }

  renderTargetOptions = () => {
    const { index, body } = this.props
    const { organize, target } = body[index]
    // find main field
    let mainField = ''
    mainField = this.state.mainField
    let fields
    switch (target) {
      case 'overview':
        fields = OverviewFields
        break
      case 'endusebreakdown':
        fields = EndUseFields
        break
      case 'utility':
        fields = UtilityFields
        break
      default:
        fields = []
    }
    return (
      <div className={styles['target__options']}>
        {this.renderMainFields(fields)}
        <br />
        <div>{this.renderYearRange()}</div>
        <br />
        {mainField && (
          <YearFormat value={organize} onChange={this.saveYearFormat} />
        )}
        {fields.map((field, i) => {
          if (mainField === field.value) {
            return (
              <div key={i} className={styles['target__sub-fields']}>
                <span>Choose your fields for {field.name}</span>
                <div>{this.renderSubFields(field.subFields)}</div>
              </div>
            )
          }
        })}
      </div>
    )
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

  render() {
    const listStyles = [
      { name: 'Bulleted List', value: 'unordered-list' },
      { name: 'Numbered List', value: 'ordered-list' }
    ]
    const labelStyles = [
      { name: 'Show labels', value: 'show' },
      { name: 'Hide Labels', value: 'hide' }
    ]
    return (
      <div>
        {this.renderTargetOptions()}
        <div className={styles['target__list-style']}>
          <p>Choose a style:</p>
          {this.renderListStyles(listStyles)}
          <p>Choose a style format:</p>
          <BulletFormattedList index={this.props.index} />
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

export default withConnect(DataList)
