import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import classNames from 'classnames'
import { find, findIndex } from 'lodash'
import CollapseSection from 'components/UI/CollapseSection'
import { ProjectFiltering } from './'
import { formatProjectFields } from 'utils/Utils'
import {
  bodyTemplate,
  templateUpdateError
} from 'routes/Template/modules/template'
import styles from './Projects.scss'
import targetStyles from '../../TemplateComponent/BodyComponents/TemplateTarget.scss'

export class ProjectSummaryTable extends Component {
  static propTypes = {
    bodyTemplate: PropTypes.func.isRequired,
    templateUpdateError: PropTypes.func.isRequired,
    body: PropTypes.array.isRequired
  }

  saveRadioFields = (e, type) => {
    let body = JSON.parse(JSON.stringify(this.props.body))
    let card = body[this.props.index]
    card.projectConfig[type] = e.target.value
    this.props.bodyTemplate(body)
    this.props.templateUpdateError()
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

  saveHeading = (selectedField, value = '') => {
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
    this.props.bodyTemplate(body)
    this.props.templateUpdateError()
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

  selectTotalRowFormat = (array, type) => {
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
          Select Total Row Include Option
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

  renderText = (projectConfig, customLabels = []) => {
    let fields =
      (projectConfig && projectConfig.data && projectConfig.data.fields) || []
    let textList = fields.map(item => {
      const customLabel =
        customLabels.length > 0 ? find(customLabels, { field: item }) : null
      if (customLabel) return customLabel.value
      let label = item.includes('.') ? item.split('.')[1] : item
      return formatProjectFields(label)
    })
    return textList.join(', ')
  }

  render() {
    const { index, body } = this.props

    const projectConfig = body[index].projectConfig
    const projectLayoutFields = [
      { name: 'Individual Measure', value: 'individual' },
      { name: 'Group by Measure', value: 'groupProject' },
      { name: 'Group by Measure and Location', value: 'groupProjectLocation' }
    ]

    const dataFields = [
      { name: 'Name', value: 'name' },
      { name: 'Description', value: 'description' },
      { name: 'Implementation Strategy', value: 'implementation_strategy' },
      { name: 'Incentive', value: 'incentive' },
      { name: 'Utility Company', value: 'utility_company' },
      { name: 'Rebate Code', value: 'rebate_code' },
      { name: 'Existing Requirements', value: 'existing_requirements' },
      { name: 'Design Requirements', value: 'design_requirements' },
      { name: 'Measure Cost', value: 'project_cost' },
      { name: 'Annual Cost Savings', value: 'annual_savings' },
      { name: 'Energy Savings', value: 'energy_savings' },
      { name: 'Electric Savings', value: 'electric_savings' },
      { name: 'Natural Gas Savings', value: 'gas_savings' },
      { name: 'Water Savings', value: 'water_savings' },
      { name: 'ROI', value: 'roi' },
      { name: 'Simple Payback', value: 'simple_payback' },
      { name: 'NPV', value: 'npv' },
      { name: 'SIR', value: 'sir' },
      { name: 'GHG Savings', value: 'ghg' },
      { name: 'GHG Cost', value: 'ghg-cost' },
      { name: 'Demand Savings', value: 'demand' },
      { name: 'Effective Useful Life', value: 'eul' },
      { name: 'Design Fields', value: 'project.design_fields' },
      { name: 'Total Cost', value: 'total_cost' },
      { name: 'First Year Cost', value: 'first_year_cost' },
      { name: 'Net Measure Cost after Incentive', value: 'net_project_cost' },
      { name: 'Total Hard Costs', value: 'total_hard_cost' },
      { name: 'Total Soft Costs', value: 'total_soft_cost' },
      { name: 'Total Financing/Funding', value: 'total_financing_funding' },
      { name: 'Materials Unit Cost', value: 'material_unit_cost' },
      { name: 'Materials Quantity', value: 'material_quantity' },
      { name: 'Total Materials Cost', value: 'material_cost' },
      { name: 'Labor Rate', value: 'labor_rate' },
      { name: 'Hours', value: 'hours' },
      { name: 'Total Labor Cost', value: 'total_labor_cost' },
      {
        name: 'Site-Specific Installation Factors',
        value: 'installation_factors'
      },
      {
        name: 'Utility Service Upgrades',
        value: 'utility_service_upgrades'
      },
      {
        name: 'Temporary Services',
        value: 'temporary_services'
      },
      {
        name: 'Environment Unit Cost',
        value: 'environment_unit_cost'
      },
      {
        name: 'Envrionment Quantity',
        value: 'environment_quantity'
      },
      {
        name: 'Total Environment Unit Cost',
        value: 'total_environment_unit_cost'
      },
      { name: 'Contingency', value: 'contingency' },
      { name: 'Profit', value: 'profit' },
      { name: 'Taxes', value: 'taxes' },
      { name: 'Other Hard Costs', value: 'other_hard_cost' },
      { name: 'Pre-Design', value: 'pre_design' },
      { name: 'Design Fees', value: 'design_fees' },
      { name: 'Permits & Inspections', value: 'permits' },
      {
        name: 'Construction Management',
        value: 'construction_management'
      },
      { name: 'Material Handling', value: 'material_handling' },
      { name: 'Test and Balancing', value: 'test_and_balancing' },
      { name: 'Commissioning', value: 'commissioning' },
      { name: 'Program Fees', value: 'program_fees' },
      { name: 'Overhead', value: 'overhead' },
      { name: 'Other Soft Costs', value: 'other_soft_cost' },
      { name: 'Cost Share', value: 'finance_cost_share' },
      {
        name: 'Cost Share Rate',
        value: 'finance_cost_share_rate'
      },
      { name: 'Financing', value: 'finance_finance' },
      { name: 'Financing Rate', value: 'finance_finance_rate' },
      { name: 'Cost Share', value: 'fund_cost_share' },
      { name: 'Cost Share Rate', value: 'fund_cost_share_rate' },
      { name: 'Financing', value: 'fund_finance' },
      { name: 'Financing Rate', value: 'fund_finance_rate' }
    ]

    const orderFields = [
      { name: 'A-Z (Low to high)', value: 'ascending' },
      { name: 'Z-A (High to low)', value: 'descending' }
    ]

    const totalRowFields = [
      { name: 'Include', value: 'include' },
      { name: 'Do not include', value: 'notInclude' }
    ]

    // get orderBy array from only selected data fields
    const orderByFields = dataFields.filter(object => {
      if (projectConfig && projectConfig.data && projectConfig.data.fields) {
        return projectConfig.data.fields.some(item => {
          return object.value === item
        })
      }
    })

    const card = body[index]
    const customLabels =
      (card &&
        card.projectConfig &&
        card.projectConfig.data &&
        card.projectConfig.data.customLabels) ||
      []
    const selectedFields =
      (card &&
        card.projectConfig &&
        card.projectConfig.data &&
        card.projectConfig.data.fields) ||
      []

    return (
      <div>
        <h3>Measure Grouping</h3>
        <div className={styles.selectContainer}>
          <select
            value={(projectConfig && projectConfig.projectGrouping) || ''}
            onChange={e => this.saveRadioFields(e, 'projectGrouping')}
          >
            <option value="" defaultValue disabled>
              Select Type
            </option>
            {projectLayoutFields.map(({ name, value }) => (
              <option key={value} value={value}>
                {name}
              </option>
            ))}
          </select>
        </div>

        <ProjectFiltering index={this.props.index} />
        <div>{this.tableLayout()}</div>

        <div className={styles.fieldSelector}>
          <div className={styles.fieldSelectorTitle}>Fields</div>
          <div className={styles.fieldSelectorDescription}>
            Select the fields for your table in the order they should appear.
          </div>
        </div>

        <div className={styles.fieldContainer}>
          <div className={styles.fieldContainerItem}>
            <div className={styles.fieldContainerTitle}>
              Order: {this.renderText(projectConfig, customLabels)}
            </div>
          </div>
          <div
            className={styles.fieldContainerClear}
            onClick={() => this.clearDataFields()}
          >
            Clear Fields
          </div>
        </div>

        <CollapseSection
          customLabels={customLabels}
          addField={this.saveCheckboxFields}
          saveHeading={this.saveHeading}
          fields={selectedFields}
        />

        <h3>Order By</h3>
        <div className={styles.selectContainer}>
          {this.selectFieldsFormat(orderByFields, 'orderBy')}
        </div>

        <h3>Order</h3>
        <div className={styles.selectContainer}>
          {this.selectFieldsFormat(orderFields, 'order')}
        </div>

        <h3>Total Row</h3>
        <div className={styles.selectContainer}>
          {this.selectTotalRowFormat(totalRowFields, 'totalRow')}
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

const withConnect = connect(
  mapStateToProps,
  mapDispatchToProps
)

export default withConnect(ProjectSummaryTable)
