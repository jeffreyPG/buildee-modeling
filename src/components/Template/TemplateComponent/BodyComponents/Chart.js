import React, { Component } from 'react'
import moment from 'moment'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import styles from '../../../Template/Template.scss'
import chartStyles from './Chart.scss'
import targetStyles from './TemplateTarget.scss'
import config from '../../../../../project.config'
import CustomRange from '../../../../utils/customRange'
import { sortChart, formatChartReportName, groupByChart } from 'utils/Utils'

const formatOptionsLabel = {
  pie: 'Pie Chart',
  donut: 'Donut Chart'
}

export class Chart extends Component {
  static propTypes = {
    index: PropTypes.number.isRequired,
    body: PropTypes.array.isRequired,
    handleUpdateTemplateState: PropTypes.func.isRequired,
    getChartReports: PropTypes.func,
    views: PropTypes.array,
    layoutOption: PropTypes.string,
    layoutIndex: PropTypes.number
  }
  constructor(props) {
    super(props)
    this.handleChange = this.handleChange.bind(this)
    this.handleYearRange = this.handleYearRange.bind(this)
  }
  state = {
    fields: {},
    typeOfChart: '',
    checked: '',
    reportList: [],
    token: '',
    imgsource: '',
    viewId: '',
    utilType: '',
    editMode: false,
    selected: '',
    selectedYearRange: '',
    proto: !config.secure ? 'http://' : 'https://',
    apiHost: config.apiHost,
    formatOption: '',
    range: '',
    monthList: [],
    selectedYearList: [],
    customStartMonth: '',
    customStartYear: '',
    customEndMonth: '',
    customEndYear: '',
    attributeList: [
      { label: 'Utilities', value: 'utility' },
      { label: 'Year', value: 'year' }
    ],
    startDate: '',
    endDate: '',
    selectedChart: '',
    yearRange: [
      { label: 'Last 12 months', value: '12' },
      { label: 'Last 24 months', value: '24' },
      { label: 'Last 36 months', value: '36' } //custom year range removed from option as of now
    ],
    yearEdit: '',
    yearOption: 'SetOnExport',
    colorOption: '',
    colorList: [
      {
        name: 'type1',
        value: 'type1'
      },
      {
        name: 'type2',
        value: 'type2'
      }
    ]
  }
  /** @description : This function is called on selection of any of the charts, here by default last 12 months
   * option is selected. Here the template is modified every time a new chart is selected. The preview of static image is set here.
   */
  handleChange(e) {
    let proto = this.state.proto
    let apiHost = this.state.apiHost

    let body = JSON.parse(JSON.stringify(this.props.body))
    let widget = body[this.props.index]
    let option = widget.options && widget.options[this.props.layoutIndex]

    option.fields = []
    if (e.target.value != '') {
      let viewId = ''
      let src = ''
      let url = ''
      let buildId = ''
      let param = ''

      let reportObj = this.state.reportList.find(item =>
        item.reportName.includes(e.target.value)
      )

      viewId = reportObj.urls[0].viewId
      buildId = reportObj.previewBuildingId
      url = reportObj.urls[0].value
      const formatOption =
        (reportObj.formatOptions &&
          reportObj.formatOptions.length > 1 &&
          reportObj.formatOptions[0]) ||
        ''
      param = url.split('?')[1] || ''

      option.fields.push(`chart.reportName.${e.target.value}`)
      option.metaData = {
        yearOption: 'SetOnExport'
      }

      if (e.target.value === 'Custom Color Checker') {
        option.metaData.colorOption = this.state.colorOption
      }

      option.fields.push(`chart.Url.${url}`)
      if (param !== '') {
        option.fields.push(`chart.param.${param}`)
        param = `?${param}`
      } else {
        option.fields.push(`chart.param.${param}`)
      }
      if (formatOption && formatOption != '') {
        option.fields.push(`chart.param.vf_format_type=${formatOption}`)
      }
      if (buildId !== '' && viewId !== '') {
        if (e.target.value === 'Custom Color Checker') {
          if (param) param = `${param}&vf_color=${this.state.colorOption}`
          else param = `?vf_color=${this.state.colorOption}`
        }
        if (formatOption && formatOption != '') {
          param = `${param}&vf_format_type=${formatOption}`
        }
        src = `${proto}${apiHost}/building/${buildId}/chart/${viewId}/preview${param}`
      }
      this.setState({
        checked: e.target.value,
        imgsource: src,
        editMode: true,
        selectedYearList: reportObj.urls.length > 0 ? reportObj.urls : [],
        selectedYearRange: reportObj.urls[0].key || '',
        selected: e.target.value,
        yearEdit: reportObj.urls[0].key,
        yearOption: 'SetOnExport',
        formatOption,
        colorOption: this.state.colorList[0].value
      })
      this.props.handleUpdateTemplateState(body)
    } else {
      if (option.fields.length > 0) {
        option.fields = []
      }
      this.setState({
        checked: e.target.value,
        imgsource: '',
        editMode: false,
        selectedYearList: [],
        selectedYearRange: '',
        selected: e.target.value,
        yearEdit: '',
        yearOption: 'SetOnExport',
        colorOption: this.state.colorList[0].value
      })
      this.props.handleUpdateTemplateState(body)
    }
  }
  /** @description This hook helps in maintaining the year and month range every time the user changes the custom range  */
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

  /** @description : This function is for selection of year range. Handles 3 situations 12 months, 36 months and custom.
   * This function is sent to custom range component as props.
   */
  handleYearRange(event) {
    let {
      proto,
      apiHost,
      customStartMonth,
      customStartYear,
      customEndMonth,
      customEndYear,
      monthList,
      yearList,
      formatOption
    } = this.state
    const { index } = this.props
    let body = JSON.parse(JSON.stringify(this.props.body))
    const id = event.target.id
    let chartName = this.state.selected
    let eventValue = id === 'Range' ? event.target.value : 'Custom'
    let viewId = ''
    let src = ''
    let url = ''
    let buildId = ''
    let widget = body[index]
    let option =
      (widget.options && widget.options[this.props.layoutIndex]) || {}
    let param = ''
    const paramIndex = option.fields.findIndex(
      x => x.split('.')[1] === 'param' && x.indexOf('vf_format_type') === -1
    )
    const urlIndex = option.fields.findIndex(x => x.split('.')[1] === 'Url')

    if (id === 'Range') {
      if (eventValue !== '') {
        option.fields = option.fields.filter(a => {
          return !a.split('.')[1].includes('Url')
        })
        option.fields = option.fields.filter(a => {
          return !a.split('.')[1].includes('year')
        })
        option.fields = option.fields.filter(a => {
          return !a.split('.')[1].includes('param')
        })
        customStartMonth = monthList[0].value
        customEndMonth = monthList[monthList.length - 1].value
        customStartYear = yearList[2].value
        customEndYear = yearList[0].value
        customEndMonth =
          new Date('1' + customEndMonth + customEndYear) > new Date()
            ? monthList[new Date().getMonth()].value
            : customEndMonth
        option.metaData = {
          yearOption: 'SetYearRange',
          yearRange: event.target.value,
          selectedStartMonth: customStartMonth,
          selectedStartYear: customStartYear,
          selectedEndMonth: customEndMonth,
          selectedEndYear: customEndYear
        }
      }
    } else {
      if (id === 'selectedStartMonth') customStartMonth = event.target.value
      else if (id === 'selectedStartYear') customStartYear = event.target.value
      else if (id === 'selectedEndMonth') customEndMonth = event.target.value
      else if (id === 'selectedEndYear') customEndYear = event.target.value
      option.metaData = {
        yearOption: 'SetYearRange',
        yearRange: 'Custom',
        selectedStartMonth: customStartMonth,
        selectedStartYear: customStartYear,
        selectedEndMonth: customEndMonth,
        selectedEndYear: customEndYear
      }
    }

    if (chartName === 'Custom Color Checker') {
      option.metaData.colorOption = this.state.colorOption
    }

    let arr = this.state.reportList.find(item => item.reportName === chartName)
    buildId = arr.previewBuildingId
    let urlsArr = arr.urls
    let urlObj = urlsArr.filter(item => item.key == eventValue)
    if (urlObj && urlObj[0] && urlObj[0].value) {
      viewId = urlObj[0].viewId
      url = urlObj[0].value
      param = url.split('?')[1] || ''
      if (urlIndex === -1) {
        option.fields.push(`charts.Url.${url}`)
      } else {
        option.fields[urlIndex] = `charts.Url.${url}`
      }
    }
    if (param !== '') {
      if (paramIndex === -1) option.fields.push(`chart.param.${param}`)
      else option.fields[paramIndex] = `chart.param.${param}`
      param = `?${param}`
    } else {
      if (paramIndex === -1) option.fields.push(`chart.param.${param}`)
      else option.fields[paramIndex] = `chart.param.${param}`
    }
    if (buildId !== '' && viewId !== '') {
      if (chartName === 'Custom Color Checker') {
        if (param) param = `${param}&vf_color=${this.state.colorOption}`
        else param = `?vf_color=${this.state.colorOption}`
      }
      src = `${proto}${apiHost}/building/${buildId}/chart/${viewId}/preview${param}`
    }

    if (formatOption && formatOption != '') {
      if (!option.fields.some(elem => elem.indexOf('vf_format_type') != -1)) {
        option.fields.push(`chart.param.vf_format_type=${formatOption}`)
      }
    }

    this.setState({
      selectedYearRange: eventValue,
      imgsource: src,
      yearEdit: `${eventValue}`,
      customStartMonth,
      customStartYear,
      customEndMonth,
      customEndYear
    })
    this.props.handleUpdateTemplateState(body)
  }
  /** @description : On load function , where we get all the predefined charts and are set in state. Some changes are
   * needed to remove inconsequential code.
   */
  getList() {
    let {
      customStartMonth,
      customStartYear,
      customEndMonth,
      customEndYear,
      monthList,
      yearList,
      proto,
      apiHost,
      yearOption,
      colorOption
    } = this.state
    const { layoutIndex } = this.props
    customStartMonth = monthList[0].value
    customEndMonth = monthList[monthList.length - 1].value
    customStartYear = yearList[2].value
    customEndYear = yearList[0].value
    customEndMonth =
      new Date('1' + customEndMonth + customEndYear) > new Date()
        ? monthList[new Date().getMonth()].value
        : customEndMonth
    this.props.getChartReports().then(() => {
      let check = ''
      let src = ''
      let param = ''
      let year = customStartYear
      let id = ''
      let buildId = ''
      let yList = []
      let { views } = this.props
      let body = JSON.parse(JSON.stringify(this.props.body))

      views = views.map(item => {
        if (
          item.reportName === 'Natural Gas End Use Breakdown Actual' ||
          item.reportName === 'Electric End Use Breakdown Actual' ||
          item.reportName === 'Energy End Use Breakdown - All Fuels Actual' ||
          item.reportName === 'GHG Impact' ||
          item.reportName === 'EUI Impact' ||
          item.reportName === 'Energy Saving by End Use'
        ) {
          const monthURL = item.urls[1]
          let urls = []
          let options = [12, 24, 36]
          for (let i = 0; i < options.length; i++) {
            urls.push({
              ...monthURL,
              key: `Last ${options[i]} months`
            })
          }
          item.urls = [...urls, item.urls[0]]
        }
        return item
      })

      const fields =
        (body[this.props.index] &&
          body[this.props.index].options &&
          body[this.props.index].options[this.props.layoutIndex].fields) ||
        []
      let formatOption = ''
      fields.map(function(each) {
        if (each.indexOf('Name') > -1) {
          check = each.split('.')[2]
        } else if (each.indexOf('param') > -1) {
          param = each.split('.')[2]
          if (param.indexOf('vf_format_type') != -1) {
            formatOption = each.split('vf_format_type=')[1]
          }
        }
      })
      let metaData =
        (body[this.props.index] &&
          body[this.props.index].options &&
          body[this.props.index].options[this.props.layoutIndex].metaData) ||
        {}
      if (metaData && metaData.yearRange) {
        year = metaData.yearRange || 'Last 12 months'
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
      if (!metaData || !metaData.yearOption)
        metaData = {
          yearOption: yearOption
        }
      if (metaData && metaData.colorOption) colorOption = metaData.colorOption

      let arr = this.props.views.filter(item => item.reportName === check)
      if (arr.length > 0) {
        buildId = arr[0].previewBuildingId
        yList = arr[0].urls
        let yearObj = arr[0].urls.filter(item => item.key === year)
        if (yearOption === 'SetOnExport') yearObj = arr[0].urls
        id = (yearObj[0] && yearObj[0].viewId) || ''
        if (param !== '') {
          param = `?${param}`
        } else {
          param = ''
        }
        if (id !== '' && buildId !== '') {
          if (check === 'Custom Color Checker') {
            if (param) param = `${param}&vf_color=${colorOption}`
            else param = `?vf_color=${colorOption}`
          }
          src = `${proto}${apiHost}/building/${buildId}/chart/${id}/preview${param}`
        }
      }

      views = sortChart(views)
      this.setState({
        reportList: views,
        imgsource: src,
        checked: check,
        yearEdit: year,
        selected: check,
        selectedYearRange: year,
        selectedYearList: yList,
        customStartMonth,
        customStartYear,
        customEndMonth,
        customEndYear,
        yearOption,
        colorOption,
        formatOption
      })
    })
  }

  componentDidMount() {
    this.getList()
  }

  renderYearOption = () => {
    const { yearOption } = this.state
    const { layoutIndex } = this.props
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
      const ids = 'year-option-' + field.value + layoutIndex
      return (
        <label key={i} htmlFor={ids}>
          <input
            type="radio"
            id={ids}
            name={`year-option-${layoutIndex}`}
            value={field.value}
            checked={yearOption === field.value}
            onChange={this.handleClickYearOption}
          />
          <span>{field.name}</span>
        </label>
      )
    })
  }

  handleClickFormatOption = event => {
    const { imgsource } = this.state
    const { index, layoutIndex } = this.props
    let body = JSON.parse(JSON.stringify(this.props.body))
    let widget = body[index]
    const value = event.target.value
    let option = (widget && widget.options && widget.options[layoutIndex]) || {}
    const paramIndex = option.fields.findIndex(
      x => x.split('.')[1] === 'param' && x.indexOf('vf_format_type') > -1
    )
    if (paramIndex != -1) {
      option.fields[paramIndex] = `chart.param.vf_format_type=${value}`
    }
    this.setState({
      formatOption: value,
      imgsource
    })
    this.props.handleUpdateTemplateState(body)
  }

  renderFormatOption = () => {
    const { formatOption, checked } = this.state
    const { layoutIndex } = this.props
    let reportObj = this.state.reportList.find(item =>
      item.reportName.includes(checked)
    )
    return reportObj.formatOptions.map((field, i) => {
      const ids = 'format-option-' + field + layoutIndex
      return (
        <label key={i} htmlFor={ids}>
          <input
            type="radio"
            id={ids}
            name={`format-option-${layoutIndex}`}
            value={field}
            checked={formatOption === field}
            onChange={this.handleClickFormatOption}
          />
          <span>{formatOptionsLabel[field]}</span>
        </label>
      )
    })
  }

  handleClickYearOption = event => {
    const { index, layoutIndex } = this.props
    const { formatOption } = this.state
    let body = JSON.parse(JSON.stringify(this.props.body))
    let widget = body[index]
    const value = event.target.value
    let option = (widget && widget.options && widget.options[layoutIndex]) || {}
    if (!option.metaData) option.metaData = {}
    if (value === 'SetOnExport') {
      option.metaData = {
        yearOption: value
      }
    } else {
      option.metaData = {
        yearOption: value,
        yearRange: 'Last 12 months'
      }
    }

    if (chartName === 'Custom Color Checker') {
      option.metaData.colorOption = this.state.colorOption
    }

    let { proto, apiHost } = this.state
    let chartName = this.state.selected
    let eventValue = 'Last 12 months'
    let viewId = ''
    let src = ''
    let url = ''
    let buildId = ''
    let param = ''
    const paramIndex = option.fields.findIndex(x => x.split('.')[1] === 'param')
    const urlIndex = option.fields.findIndex(x => x.split('.')[1] === 'Url')
    let arr = this.state.reportList.find(item => item.reportName === chartName)
    buildId = arr.previewBuildingId
    let urlsArr = arr.urls
    let urlObj = urlsArr.filter(item => item.key == eventValue)
    if (urlObj && urlObj[0] && urlObj[0].value) {
      viewId = urlObj[0].viewId
      url = urlObj[0].value
      param = url.split('?')[1] || ''
      if (urlIndex === -1) {
        option.fields.push(`charts.Url.${url}`)
      } else {
        option.fields[urlIndex] = `charts.Url.${url}`
      }
    }
    if (param !== '') {
      if (paramIndex === -1) option.fields.push(`chart.param.${param}`)
      else option.fields[paramIndex] = `chart.param.${param}`
      param = `?${param}`
    } else {
      if (paramIndex === -1) option.fields.push(`chart.param.${param}`)
      else option.fields[paramIndex] = `chart.param.${param}`
    }

    if (buildId !== '' && viewId !== '') {
      if (chartName === 'Custom Color Checker') {
        if (param) param = `${param}&vf_color=${this.state.colorOption}`
        else param = `?vf_color=${this.state.colorOption}`
      }
      if (formatOption && formatOption != '') {
        param = `${param}&vf_format_type=${formatOption}`
      }
      src = `${proto}${apiHost}/building/${buildId}/chart/${viewId}/preview${param}`
    }

    this.setState({
      selectedYearRange: 'Last 12 months',
      yearOption: value,
      imgsource: src
    })
    this.props.handleUpdateTemplateState(body)
  }

  handleClickColorOption = event => {
    const { index, layoutIndex } = this.props
    let { selected: chartName, proto, apiHost } = this.state
    let body = JSON.parse(JSON.stringify(this.props.body))
    let widget = body[index]
    let option = (widget && widget.options && widget.options[layoutIndex]) || {}

    const value = event.target.value
    if (!option.metaData) option.metaData = {}
    option.metaData.colorOption = value
    let src = ''
    let viewId = ''
    let url = ''
    let param = ''
    const paramIndex = option.fields.findIndex(x => x.split('.')[1] === 'param')
    const urlIndex = option.fields.findIndex(x => x.split('.')[1] === 'Url')
    let arr = this.state.reportList.find(item => item.reportName === chartName)
    let buildId = arr.previewBuildingId || ''
    let urlsArr = arr.urls
    let urlObj = urlsArr.filter(
      item => item.key == this.state.selectedYearRange
    )
    if (urlObj && urlObj[0] && urlObj[0].value) {
      viewId = urlObj[0].viewId
      url = urlObj[0].value
      param = url.split('?')[1] || ''
      if (urlIndex === -1) {
        option.fields.push(`charts.Url.${url}`)
      } else {
        option.fields[urlIndex] = `charts.Url.${url}`
      }
    }
    if (param !== '') {
      if (paramIndex === -1) option.fields.push(`chart.param.${param}`)
      else option.fields[paramIndex] = `chart.param.${param}`
      param = `?${param}`
    } else {
      if (paramIndex === -1) option.fields.push(`chart.param.${param}`)
      else option.fields[paramIndex] = `chart.param.${param}`
    }
    if (buildId !== '' && viewId !== '') {
      if (chartName === 'Custom Color Checker') {
        if (param) param = `${param}&vf_color=${value}`
        else param = `?vf_color=${value}`
      }
      src = `${proto}${apiHost}/building/${buildId}/chart/${viewId}/preview${param}`
    }

    this.setState({
      colorOption: value,
      imgsource: src
    })

    this.props.handleUpdateTemplateState(body)
  }

  render() {
    let {
      imgsource,
      yearList,
      selected,
      customStartYear,
      customStartMonth,
      customEndYear,
      customEndMonth,
      selectedYearList,
      selectedYearRange,
      monthList,
      yearOption,
      colorOption,
      colorList,
      formatOption
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
    const chartGroupBy = groupByChart(
      this.state.reportList,
      this.props.layoutOption === 'Two Columns'
    )
    return (
      <div className={chartStyles.reportList}>
        {this.state.reportList != undefined && this.state.reportList != '' && (
          <div>
            <div
              className={classNames(
                styles.tabContent,
                styles.tabArrow,
                this.props.layoutOption !== 'One Column'
                  ? styles.tabTwoColumnArrow
                  : ''
              )}
            >
              <label value="Source">Chart:</label>
              <select
                className={
                  this.props.layoutOption === 'One Column'
                    ? styles.dropdownContainer
                    : styles.twoColumnDropdownContainer
                }
                name={'Source'}
                onChange={this.handleChange}
                value={this.state.checked}
              >
                <option defaultValue value="">
                  Select a Chart
                </option>
                {Object.keys(chartGroupBy).map(key => (
                  <optgroup label={key} key={key}>
                    {chartGroupBy[key] &&
                      chartGroupBy[key].map((item, index) => (
                        <option
                          value={item.reportName}
                          key={`options-${item.reportName}-${index}`}
                          name={item.reportName}
                          id={item.reportName}
                        >
                          {formatChartReportName(item.reportName)}
                        </option>
                      ))}
                  </optgroup>
                ))}
              </select>
            </div>
            {selected !== 'New Report' && formatOption !== '' && (
              <div className={targetStyles.yearOption}>
                <p>Format:</p>
                {this.renderFormatOption()}
              </div>
            )}
            {selected !== 'New Report' && selected !== '' && (
              <div className={targetStyles.yearOption}>
                <p>Year options:</p>
                {this.renderYearOption()}
              </div>
            )}
            {selected !== 'New Report' && selected !== '' && (
              <div>
                {yearOption === 'SetYearRange' && (
                  <div>
                    <div className={chartStyles.yearRange}>
                      <label htmlFor="Range">Year Range</label>
                      <div className={chartStyles.tabArrow}>
                        <select
                          className={chartStyles.dropdownContainer}
                          onChange={e => {
                            this.handleYearRange(e)
                          }}
                          value={selectedYearRange}
                          name="Range"
                          id="Range"
                        >
                          {selectedYearList.map((each, i) => {
                            return (
                              <option value={each.key} key={each.key}>
                                {each.key}
                              </option>
                            )
                          })}
                        </select>
                      </div>
                    </div>
                    {selectedYearRange === 'Custom' && (
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
                          page={'Chart'}
                          showDirectionRow={
                            this.props.layoutOption === 'Two Columns'
                          }
                        />
                      </div>
                    )}
                  </div>
                )}
                {selected === 'Custom Color Checker' && (
                  <div className={chartStyles.yearRange}>
                    <label htmlFor="color">Color Options:</label>
                    <div className={chartStyles.tabArrow}>
                      <select
                        className={chartStyles.dropdownContainer}
                        onChange={e => {
                          this.handleClickColorOption(e)
                        }}
                        value={colorOption}
                      >
                        {colorList.map((each, i) => {
                          return (
                            <option value={each.value} key={each.value}>
                              {each.name}
                            </option>
                          )
                        })}
                      </select>
                    </div>
                  </div>
                )}
                <p>Preview:</p>
                <small>
                  *This is a chart generated from a particular building, the
                  chart generated after exporting this template will differ in
                  values, but will be similar in presentation.
                </small>
                {this.props.layoutOption === 'One Column' ? (
                  <img height="500" width="784" src={imgsource}></img>
                ) : (
                  <img height="220" width="376" src={imgsource}></img>
                )}
              </div>
            )}
          </div>
        )}
        {(this.state.reportList == undefined ||
          this.state.reportList == []) && <div>Couldn't Load Reports!!</div>}
        {selected == 'New Report' && (
          <div className={chartStyles.overlay} id="overlay">
            <a
              onClick={() => {
                this.off()
              }}
            >
              <i className="material-icons">close</i>
            </a>
            <iframe
              height="90%"
              width="100%"
              id="iframe-holder"
              src="https://tableau.buildee.com/t/buildee/authoringNewWorkbook/1dvqgqgoi$8jas-fw-7p-td-91er85/buildingsutilities#1"
            ></iframe>
          </div>
        )}
      </div>
    )
  }
}

export default Chart
