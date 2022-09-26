import React, { Component } from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'
// import CheckSectionItem from '../CheckSectionItem'
import styles from './CollapseSection.scss'
import CheckSectionItem from '../CheckSectionItem'

class CollapseSection extends Component {
  static propTypes = {
    customLabels: PropTypes.array,
    isSelected: PropTypes.bool,
    addField: PropTypes.func,
    saveHeading: PropTypes.func
  }

  state = {
    openSections: [],
    sections: [
      {
        name: 'Details',
        sectionName: 'details',
        sections: [
          { name: 'Name', value: 'name' },
          { name: 'Description', value: 'description' },
          { name: 'Design Requirements', value: 'design_requirements' },
          { name: 'Existing Requirements', value: 'existing_requirements' },
          { name: 'Implementation Strategy', value: 'implementation_strategy' },
          { name: 'Rebate Code', value: 'rebate_code' },
          { name: 'Utility Company', value: 'utility_company' },
          { name: 'Effective Useful Life', value: 'eul' }
        ]
      },
      {
        name: 'Design',
        sectionName: 'design',
        sections: [
          { name: 'Name', value: 'project.name' },
          { name: 'Incentive', value: 'project.incentive' },
          { name: 'Utility Company', value: 'project.utility_company' },
          { name: 'Rebate Code', value: 'project.rebate_code' },
          {
            name: 'Existing Requirements',
            value: 'project.existing_requirements'
          },
          { name: 'Design Requirements', value: 'project.design_requirements' },
          { name: 'Design Fields', value: 'design_fields' },
          { name: 'Measure Cost', value: 'project.project_cost' },
          { name: 'Annual Cost Savings', value: 'project.annual_savings' },
          { name: 'Energy Savings', value: 'project.energy_savings' },
          { name: 'Electric Savings', value: 'project.electric_savings' },
          { name: 'Natural Gas Savings', value: 'project.gas_savings' },
          { name: 'Water Savings', value: 'project.water_savings' },
          { name: 'ROI', value: 'project.roi' },
          { name: 'Simple Payback', value: 'project.simple_payback' },
          { name: 'NPV', value: 'project.npv' },
          { name: 'SIR', value: 'project.sir' },
          { name: 'GHG Savings', value: 'project.ghg' },
          { name: 'GHG Cost', value: 'project.ghg-cost' },
          { name: 'Demand Savings', value: 'project.demand_savings' },
          { name: 'Effective Useful Life', value: 'project.eul' }
        ]
      },
      {
        name: 'Incentive',
        sectionName: 'incentive',
        sections: [{ name: 'Incentive', value: 'incentive' }]
      },
      {
        name: 'Financial Modeling',
        sectionName: 'financial',
        sections: [
          {
            name: 'Summary',
            sectionName: 'financial.summary',
            sections: [
              { name: 'Total Cost', value: 'total_cost' },
              { name: 'First Year Cost', value: 'first_year_cost' },
              {
                name: 'Net Measure Cost after Incentive',
                value: 'net_project_cost'
              },
              { name: 'Total Hard Costs', value: 'total_hard_cost' },
              { name: 'Total Soft Costs', value: 'total_soft_cost' },
              {
                name: 'Total Financing/Funding',
                value: 'total_financing_funding'
              }
            ]
          },
          {
            name: 'Hard Costs',
            sectionName: 'financial.hardCost',
            sections: [
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
              { name: 'Other Hard Costs', value: 'other_hard_cost' }
            ]
          },
          {
            name: 'Soft Costs',
            sectionName: 'financial.softCost',
            sections: [
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
              { name: 'Other Soft Costs', value: 'other_soft_cost' }
            ]
          },
          {
            name: 'Financing',
            sectionName: 'financial.financing',
            sections: [
              { name: 'Cost Share', value: 'finance_cost_share' },
              {
                name: 'Cost Share Rate',
                value: 'finance_cost_share_rate'
              },
              { name: 'Financing', value: 'finance_finance' },
              { name: 'Financing Rate', value: 'finance_finance_rate' }
            ]
          },
          {
            name: 'Funding',
            sectionName: 'financial.funding',
            sections: [
              { name: 'Cost Share', value: 'fund_cost_share' },
              { name: 'Cost Share Rate', value: 'fund_cost_share_rate' },
              { name: 'Financing', value: 'fund_finance' },
              { name: 'Financing Rate', value: 'fund_finance_rate' }
            ]
          }
        ]
      },
      {
        name: 'Analysis Results',
        sectionName: 'analysis',
        sections: [
          { name: 'Annual Cost Savings', value: 'annual_savings' },
          { name: 'Demand Savings', value: 'demand' },
          { name: 'Electric Savings', value: 'electric_savings' },
          { name: 'Energy Savings', value: 'energy_savings' },
          { name: 'GHG Cost', value: 'ghg-cost' },
          { name: 'GHG Savings', value: 'ghg' },
          { name: 'Natural Gas Savings', value: 'gas_savings' },
          { name: 'NPV', value: 'npv' },
          { name: 'ROI', value: 'roi' },
          { name: 'Simple Payback', value: 'simple_payback' },
          { name: 'SIR', value: 'sir' },
          { name: 'Water Savings', value: 'water_savings' }
        ]
      }
    ]
  }

  toggleSection = sectionName => {
    const { openSections } = this.state
    let isSelected = openSections.includes(sectionName)
    let otherSections = [...openSections].filter(name => name !== sectionName)
    this.setState({
      openSections: isSelected ? otherSections : [...otherSections, sectionName]
    })
  }

  renderFields = (options = []) => {
    const { customLabels, addField, saveHeading, fields } = this.props
    if (options.length === 0) return null
    return (
      <div className={styles.checkboxContainer}>
        {options.map((option, index) => {
          let label = option.name
          if (customLabels && customLabels.length > 0) {
            const customLabel = _.find(customLabels, { field: option.value })
            if (customLabel) label = customLabel.value
          }
          let isChecked = fields.includes(option.value)
          return (
            <CheckSectionItem
              item={option}
              toggleField={addField}
              saveHeading={saveHeading}
              customLabel={label}
              key={`${option.name} ${index}`}
              isChecked={isChecked}
            />
          )
        })}
      </div>
    )
  }

  renderSection = (options = []) => {
    const { openSections } = this.state
    let sectionWithSubSections = options.filter(option => {
      let items = option.sections || []
      return items.length !== 0
    })
    let sectionFields = options.filter(option => {
      let items = option.sections || []
      return items.length === 0
    })
    if (options.length === 0) return null
    return (
      <div>
        {sectionWithSubSections.map((option, index) => {
          let sections = option.sections || []
          let isOpen = openSections.includes(option.sectionName)
          return (
            <div
              key={`${option.name} ${option.sectionName}`}
              className={styles.section}
            >
              <div className={styles.sectionHeader}>
                <div>{option.name}</div>
                <div
                  className={styles.sectionArrow}
                  onClick={() => this.toggleSection(option.sectionName)}
                >
                  {isOpen ? (
                    <i className="material-icons">arrow_drop_up</i>
                  ) : (
                    <i className="material-icons">arrow_drop_down</i>
                  )}
                </div>
              </div>
              {isOpen && this.renderSections(sections)}
            </div>
          )
        })}
        {this.renderFields(sectionFields)}
      </div>
    )
  }

  renderSections = (options = []) => {
    let sectionWithSubSections = options.filter(option => {
      let items = option.sections || []
      return items.length !== 0
    })
    let sectionFields = options.filter(option => {
      let items = option.sections || []
      return items.length === 0
    })
    if (options.length === 0) return null
    return (
      <div>
        {this.renderSection(sectionWithSubSections)}
        {this.renderFields(sectionFields)}
      </div>
    )
  }

  render() {
    const { sections } = this.state

    return (
      <div className={styles.sectionContainer}>
        {this.renderSections(sections)}
      </div>
    )
  }
}
export default CollapseSection
