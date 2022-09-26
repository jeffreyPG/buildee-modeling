import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import classNames from 'classnames'
import moment from 'moment'
import styles from './PersonalizeModal.scss'
import {
  OverviewFields,
  EndUseFields,
  UtilityFields,
  DataBuildingFields,
  DataUserFields,
  MeasureFields,
  ContactFields,
  ReportingFields
} from 'utils/PersonalizeOptions'
import { yearRange } from 'utils/ReportOptions'
import CustomYearRange from '../CustomYearRange'
import contactRoles from 'static/contact-roles.json'

import { getOrgProposalTemplates } from '../../../routes/ProposalTemplate/modules/proposalTemplate'
import { sortFunction } from 'utils/Portfolio'
import { isProdEnv } from 'utils/Utils'
import { assertNonNullType } from 'graphql'
import UserFeature from 'utils/Feature/UserFeature'

class PersonalizeModal extends Component {
  state = {
    step: 0,
    type: '',
    searchValue: '',
    field: null,
    personalizeValue: '',
    yearOption: 'SetOnExport',
    selectedYearRange: '12',
    customStartMonth: '',
    customStartYear: '',
    customEndMonth: '',
    customEndYear: '',
    monthList: [],
    yearList: [],
    role: 'Premises',
    proposalTemplateId: ''
  }

  static propTypes = {
    handleClosePersonalize: PropTypes.func.isRequired,
    squarePosition: PropTypes.string.isRequired,
    metaData: PropTypes.object
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
    document.addEventListener('click', this.handleOutsideClick, true)
    document.addEventListener('mousedown', this.handleOutsideClick, true)
  }

  componentDidMount() {
    this.props.getOrgProposalTemplates()
  }

  componentWillUnmount() {
    document.removeEventListener('click', this.handleOutsideClick, true)
    document.removeEventListener('mousedown', this.handleOutsideClick, true)
  }

  handleOutsideClick = event => {
    if (this.node !== null && this.node.contains(event.target)) {
      return
    }
    this.handleClose()
  }

  handleClose = () => {
    this.props.handleClosePersonalize()
  }

  handleRoleChange = event => {
    this.setState({
      role: event.target.value
    })
  }

  handleProposalChange = event => {
    this.setState({
      proposalTemplateId: event.target.value
    })
  }

  handleTypeChange = event => {
    this.setState({
      type: event.target.value,
      role: 'Premises',
      proposalTemplateId: ''
    })
  }

  handleSearchChange = event => {
    this.setState({ searchValue: event.target.value })
  }

  clearSearch = event => {
    event.stopPropagation()
    this.setState({ searchValue: '' })
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
      case 'endUseBreakDown':
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

  goToStep = (step, options) => {
    if (step === 0) {
      this.setState({
        field: null,
        type: '',
        step,
        searchValue: ''
      })
    } else {
      const { field } = options
      const { metaData } = this.props
      const { monthList, yearList } = this.state
      let role = this.state.role || 'Premises'
      const yearOption = (metaData && metaData.yearOption) || 'SetOnExport'
      const selectedYearRange = (metaData && metaData.yearRange) || '12'
      const customStartMonth =
        (metaData && metaData.selectedStartMonth) || monthList[0].value
      const customEndMonth =
        (metaData && metaData.selectedEndMonth) ||
        monthList[monthList.length - 1].value
      const customStartYear =
        (metaData && metaData.selectedStartYear) || yearList[2].value
      const customEndYear =
        (metaData && metaData.selectedEndYear) || yearList[0].value
      this.setState({
        field,
        step,
        personalizeValue: field.name,
        yearOption,
        selectedYearRange,
        customStartMonth,
        customEndMonth,
        customStartYear,
        customEndYear,
        role
      })
    }
  }

  handleValueChange = event => {
    this.setState({
      personalizeValue: event.target.value
    })
  }

  checkDateRangeOption = () => {
    const { type, field } = this.state
    let showFlag = false
    // if (type === 'utility') showFlag = true
    // else if (type === 'overview' && !field.name.startsWith('CBECs'))
    //   showFlag = true
    return showFlag
  }

  insertValue = event => {
    let { field, role, type, proposalTemplateId } = this.state
    let newField = {
      ...field
    }
    let flag = this.checkDateRangeOption()
    if (flag) {
      const {
        yearOption,
        selectedYearRange,
        customStartMonth,
        customEndMonth,
        customStartYear,
        customEndYear
      } = this.state
      let metaData = {}
      if (yearOption === 'SetOnExport') {
        metaData = {
          yearOption
        }
      } else {
        metaData = {
          yearOption,
          yearRange: selectedYearRange,
          selectedStartMonth: customStartMonth,
          selectedStartYear: customStartYear,
          selectedEndMonth: customEndMonth,
          selectedEndYear: customEndYear
        }
      }
      if (type === 'contact') {
        role = role || 'Premises'
        newField.role = role
      }
      this.props.handleClosePersonalize(
        newField,
        this.state.personalizeValue,
        metaData
      )
    } else {
      if (type === 'contact') {
        role = role || 'Premises'
        newField.role = role
      }
      let { metaData = {} } = this.props
      if (proposalTemplateId && !metaData.proposalTemplateId) {
        metaData['proposalTemplateId'] = proposalTemplateId
        this.props.handleClosePersonalize(
          newField,
          this.state.personalizeValue,
          metaData
        )
      } else {
        this.props.handleClosePersonalize(newField, this.state.personalizeValue)
      }
    }
  }

  handleClickYearOption = event => {
    this.setState({
      selectedYearRange: '12',
      yearOption: event.target.value
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
    const id = event.target.id
    if (id === 'Range') {
      customStartMonth = monthList[0].value
      customEndMonth = monthList[monthList.length - 1].value
      customStartYear = yearList[2].value
      customEndYear = yearList[0].value
      customEndMonth =
        new Date('1' + customEndMonth + customEndYear) > new Date()
          ? monthList[new Date().getMonth()].value
          : customEndMonth
    } else {
      if (id === 'selectedStartMonth') customStartMonth = event.target.value
      else if (id === 'selectedStartYear') customStartYear = event.target.value
      else if (id === 'selectedEndMonth') customEndMonth = event.target.value
      else if (id === 'selectedEndYear') customEndYear = event.target.value
    }

    this.setState({
      selectedYearRange: id === 'Range' ? event.target.value : 'Custom',
      customStartMonth,
      customStartYear,
      customEndMonth,
      customEndYear
    })
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
      const ids = 'data-point-year-option ' + field.value
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
            <CustomYearRange
              handleChange={this.handleYearRange}
              startMonth={startMonth}
              startYear={startYear}
              endMonth={endMonth}
              endYear={endYear}
              startDate={startDate}
              endDate={endDate}
              monthList={monthList}
              yearList={yearList}
            />
          </div>
        )}
      </div>
    )
  }

  renderStepOne = () => {
    const { type, searchValue, role, proposalTemplateId } = this.state
    const { proposalTemplateList } = this.props

    return (
      <div>
        <div className={styles.typeSelectContainer}>
          <span>Type</span>
          <div className={styles.selectContainer}>
            <select value={type} onChange={e => this.handleTypeChange(e)}>
              <option defaultValue value="" disabled>
                Select a type
              </option>
              <option value="overview">Overview</option>
              <option value="building">Property</option>
              <option value="user">User</option>
              <option value="contact">Contacts</option>
              <option value="utility">Utilities</option>
              <option value="measure">Measure</option>
              <UserFeature name="projectProposal">
                {({ enabled }) => {
                  if (!enabled) return null
                  return <option value="proposal">Proposals</option>
                }}
              </UserFeature>
              <option value="report">Report</option>
            </select>
          </div>
          {type === 'contact' && (
            <div className={styles.roleSelectContainer}>
              <span>Choose Contact Role</span>
              <div className={styles.selectContainer}>
                <select value={role} onChange={e => this.handleRoleChange(e)}>
                  <option defaultValue value="" disabled>
                    Select a role
                  </option>
                  {contactRoles.map((option, index) => {
                    return (
                      <option key={index} value={option}>
                        {option}
                      </option>
                    )
                  })}
                </select>
              </div>
            </div>
          )}
          {type === 'proposal' && (
            <div className={styles.roleSelectContainer}>
              <span>Choose Proposal Template</span>
              <div className={styles.selectContainer}>
                <select
                  value={proposalTemplateId}
                  onChange={e => this.handleProposalChange(e)}
                >
                  <option defaultValue value="" disabled>
                    Select
                  </option>
                  {proposalTemplateList.map(item => (
                    <option key={item._id} value={item._id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
          <div className={styles.searchFilter}>
            <input
              placeholder="Search a property"
              type="input"
              value={searchValue}
              onChange={this.handleSearchChange}
            />
            {searchValue ? (
              <i
                className={classNames('material-icons', styles.clearIcon)}
                onClick={event => this.clearSearch(event)}
              >
                clear
              </i>
            ) : (
              <i className="material-icons">search</i>
            )}
          </div>
        </div>
        {type !== '' && <div className={styles.splitter}></div>}
        {this.renderTargetOptions()}
      </div>
    )
  }

  renderStepTwo = () => {
    const { type, field, personalizeValue, yearOption, role } = this.state
    let showFlag = this.checkDateRangeOption()
    let label = ''
    switch (type) {
      case 'overview':
        label = 'Overview'
        break
      case 'building':
        label = 'Property'
        break
      case 'user':
        label = 'User'
        break
      case 'utility':
        label = 'Utilities'
        break
      case 'endUseBreakDown':
        label = 'End Use Breakdown'
        break
      case 'measure':
        label = 'Measure'
        break
      case 'contact': {
        label = 'Contact - ' + role
        break
      }
      case 'report':
        label = 'Report'
        break
      case 'proposal':
        label = 'Proposal'
        break
    }
    label = label + ': ' + field.name
    return (
      <div className={styles.stepTwo}>
        <div
          className={styles.stepTwoBack}
          onClick={() => {
            this.goToStep(0)
          }}
        >
          <i className="material-icons">arrow_back</i>Back
        </div>
        <div className={styles.stepTwoTitle}>
          {type && field && <span>{label}</span>}
        </div>
        <div className={styles.stepTwoBody}>
          {showFlag && (
            <div className={styles.yearOption}>
              <p>Year options:</p>
              {this.renderYearOption()}
            </div>
          )}
          {showFlag && yearOption === 'SetYearRange' && (
            <div>{this.renderYearRange()}</div>
          )}
          <div className={styles.stepTwoBodyInfo}>Default value</div>
          <input
            type="text"
            value={personalizeValue}
            onChange={this.handleValueChange}
          />
        </div>

        <div className={styles.stepTwoButtons}>
          <button
            className={classNames(
              styles.button,
              styles.buttonPrimary,
              !personalizeValue ? styles.buttonDisable : ''
            )}
            onClick={this.insertValue}
          >
            Insert
          </button>
          <button
            className={classNames(styles.button, styles.buttonSecondary)}
            onClick={this.handleClose}
          >
            Cancel
          </button>
        </div>
      </div>
    )
  }

  renderTargetOptions = () => {
    const { type, searchValue, proposalTemplateId } = this.state
    const { proposalTemplateList } = this.props
    let fields = []

    switch (type) {
      case 'overview': {
        fields = [
          ...this.findFields('Summary', 'overview'),
          ...this.findFields('Electricity', 'overview'),
          ...this.findFields('Natural Gas', 'overview'),
          ...this.findFields('Water', 'overview'),
          ...this.findFields('Steam', 'overview'),
          ...this.findFields('Fuel Oil 2', 'overview'),
          ...this.findFields('Fuel Oil 4', 'overview'),
          ...this.findFields('Fuel Oil 5 & 6', 'overview'),
          ...this.findFields('Diesel', 'overview'),
          ...this.findFields('Other Fuel', 'overview'),
          ...this.findFields('Rates', 'overview'),
          ...this.findFields('GHG Emissions', 'overview'),
          ...this.findFields('Portfolio Manager', 'overview'),
          ...this.findFields('Annual Cost Benchmark', 'overview'),
          ...this.findFields('Annual Usage Benchmark', 'overview'),
          ...this.findFields('Degree Days', 'overview')
        ]
        break
      }
      case 'building': {
        fields = DataBuildingFields
        break
      }
      case 'endUseBreakDown': {
        fields = [
          ...this.findFields('Estimated End Use Breakdown', 'endUseBreakDown'),
          ...this.findFields('Actual End Use Breakdown', 'endUseBreakDown')
        ]
        break
      }
      case 'user': {
        fields = DataUserFields
        break
      }
      case 'utility': {
        fields = [
          ...this.findFields('Electricity', 'utility'),
          ...this.findFields('Natural Gas', 'utility'),
          ...this.findFields('Water', 'utility'),
          ...this.findFields('Steam', 'utility'),
          ...this.findFields('Fuel Oil 2', 'utility'),
          ...this.findFields('Fuel Oil 4', 'utility'),
          ...this.findFields('Fuel Oil 5 & 6', 'utility'),
          ...this.findFields('Diesel', 'utility'),
          ...this.findFields('Others', 'utility')
        ]
        break
      }
      case 'measure': {
        fields = MeasureFields
        break
      }
      case 'contact': {
        fields = ContactFields
        break
      }
      case 'report': {
        fields = ReportingFields
        break
      }
      case 'proposal': {
        let selectedProposal = _.find(proposalTemplateList, {
          _id: proposalTemplateId
        })
        if (selectedProposal) {
          let allSections = (selectedProposal && selectedProposal.fields) || []
          for (let section of allSections) {
            let subFields = section.subFields || []
            subFields = subFields.map(field => {
              let fieldValue = field.title.replace(
                /[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi,
                ' '
              )
              fieldValue = fieldValue.split(' ').join('-')
              return {
                name: field.title,
                value: 'proposalFieldValues.' + fieldValue
              }
            })
            fields = [...fields, ...subFields]
          }
        } else fields = []
        fields = sortFunction(fields, 'name')
        break
      }
    }
    if (searchValue) {
      fields = fields.filter(field => {
        let search = searchValue.toLowerCase()
        let name = field.name ? field.name.toLowerCase() : ''
        return !!name.includes(search)
      })
    }

    if (fields.length) {
      return (
        <div className={styles.fieldContainer}>
          {fields.map(field => {
            let label = field.name
            let value = field.value.split('.')[0]
            if (value === 'annualCostBenchmark') {
              label = 'Annual Cost Benchmark ' + label
            } else if (value === 'annualUsageBenchmark') {
              label = 'Annual Usage Benchmark ' + label
            }
            return (
              <div
                key={field.value}
                className={styles.fieldContainerLabel}
                onClick={() => this.goToStep(1, { field })}
              >
                {label}
              </div>
            )
          })}
        </div>
      )
    } else if (
      (type !== '' && type !== 'proposal') ||
      (type === 'proposal' && proposalTemplateId !== '')
    ) {
      return (
        <div className={styles.noField}>
          <span>No matches found</span>
        </div>
      )
    }
  }

  render() {
    const { step } = this.state
    const { squarePosition } = this.props

    return (
      <div ref={node => (this.node = node)}>
        <div
          className={classNames(
            styles.personalizeContainer,
            styles[`square${squarePosition}`]
          )}
        >
          <div className={styles.personalizeContainerHeader}>Data Point</div>
          {step === 0 && this.renderStepOne()}
          {step === 1 && this.renderStepTwo()}
        </div>
      </div>
    )
  }
}

const mapStateToProps = state => ({
  proposalTemplateList:
    (state.proposalTemplate && state.proposalTemplate.templateList) || []
})

const mapDispatchToProps = {
  getOrgProposalTemplates
}

const withConnect = connect(mapStateToProps, mapDispatchToProps)

export default withConnect(PersonalizeModal)
