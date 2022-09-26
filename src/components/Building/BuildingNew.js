import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import _ from 'lodash'
import styles from './BuildingNew.scss'
import { NewBuildingForm } from 'containers/Form/BuildingForms'
import UserFeature from '../../utils/Feature/UserFeature'

export class BuildingNew extends React.Component {
  static propTypes = {
    user: PropTypes.object,
    building: PropTypes.object.isRequired,
    organizationView: PropTypes.object.isRequired,
    push: PropTypes.func.isRequired,
    create: PropTypes.func.isRequired,
    clearInfo: PropTypes.func.isRequired,
    organizationList: PropTypes.array.isRequired,
    manageAllOrgSelected: PropTypes.bool.isRequired
  }

  state = {
    disableSubmit: false
  }

  onSubmit = values => {
    const { building, organizationView = {} } = this.props
    const { options = {} } = organizationView
    const { newCreateBuildingFields = [], hasUtility = false } = options
    const newFields = newCreateBuildingFields

    let utilityTypes = [
      { id: 'electric', name: 'Electricity' },
      { id: 'fuel-oil-2', name: 'Fuel Oil 2' },
      { id: 'steam', name: 'Steam' },
      { id: 'natural-gas', name: 'Natural Gas' },
      { id: 'fuel-oil-4', name: 'Fuel Oil 4' },
      { id: 'diesel', name: 'Diesel' },
      { id: 'water', name: 'Water' },
      { id: 'fuel-oil-5-6', name: 'Fuel Oil 5 & 6' },
      { id: 'other', name: 'Other' }
    ]

    if (!this.state.disableSubmit) {
      let utilities = values.utilityTypes || []
      utilities = utilities.map(utility => {
        let item = _.find(utilityTypes, { name: utility })
        return item.id
      })
      let contact = {
        firstName: values.firstName || '',
        lastName: values.lastName || '',
        company: values.company || '',
        title: values.title || '',
        role: values.role || '',
        phoneNumber: values.phoneNumber || '',
        emailAddress: values.emailAddress || '',
        qualification: '',
        certificateNumber: '',
        expirationDate: '',
        yearsOfExperience: ''
      }
      let contacts = [contact]
      contacts = contacts.filter(contact => {
        return contact.firstName
      })
      let payload = {
        buildingName: values.buildingName || '',
        siteName: values.siteName || '',
        contacts,
        clientName: values.company || '',
        location: {
          country: values.country,
          zipCode: values.postalCode || 12345,
          address: values.address,
          city: values.city,
          state: values.state || ''
        },
        floorCount: values.floorCount || 0,
        belowGradeFloorCount: values.belowGradeFloorCount || 0,
        squareFeet: values.squareFeet || 0,
        clientIndustry: values.clientIndustry,
        buildYear: values.buildYear || new Date().getFullYear(),
        open247: values.open247 || 'no',
        buildingUse: values.buildingUse || 'other-other',
        firebaseRefs:
          building.buildingView && building.buildingView.auditData
            ? building.buildingView.auditData
            : {},
        buildingUseTypes: [
          {
            use: values.buildingUse || 'other-other',
            squareFeet: values.squareFeet || 0
          }
        ],
        utilityTypes: utilities
      }
      payload['newFields'] = newFields
      let fieldValues = {}
      for (let field of newFields) {
        fieldValues[field.title] = values[field.title] || ''
      }
      payload['newFieldValues'] = fieldValues

      if (!!hasUtility) {
        let electricityRate = values['Electricity - Blended Rate']
        let eletrcityEstimatedMonthlyCost =
          values['Electricity - Estimated Monthly Cost']
        let naturalGasBlendedRate = values['Natural Gas - Blended Rate']
        let naturalGasEstimatedMonthlyCost =
          values['Natural Gas - Estimated Monthly Cost']
        let utilityTypes = values.utilityTypes || []
        let rates = { fieldsEdited: [] }
        let utilityMonthlyCost = {}
        if (utilityTypes.includes('Electricity')) {
          rates.electric = Number(electricityRate) || 0
          utilityMonthlyCost.electric =
            Number(eletrcityEstimatedMonthlyCost) || 0
          rates.fieldsEdited.push('electric')
        }
        if (utilityTypes.includes('Natural Gas')) {
          rates.gas = Number(naturalGasBlendedRate) || 0
          utilityMonthlyCost.gas = Number(naturalGasEstimatedMonthlyCost) || 0
          rates.fieldsEdited.push('gas')
        }
        payload['rates'] = rates
        payload['projectRates'] = rates
        payload['utilityMonthlyCost'] = utilityMonthlyCost
      }

      this.setState({ disableSubmit: true })
      this.props
        .create(payload, values.orgId)
        .then(() => {
          this.setState({ disableSubmit: false })
        })
        .catch(err => {})
    }
  }

  processBack = () => {
    this.props.clearInfo()
    this.props.push('/organization')
  }

  render() {
    const {
      building,
      organizationView,
      manageAllOrgSelected,
      organizationList
    } = this.props
    return (
      <div className={styles.buildingNew}>
        <div className={styles.containerSmall}>
          <div className={styles.buildingNewTitle}>
            <h1>Tell us about your building</h1>
          </div>
          <UserFeature name='buildingOverview'>
            {({ enabled }) => {
              return (
                <NewBuildingForm
                  onSubmit={this.onSubmit}
                  building={building}
                  disableSubmit={this.state.disableSubmit}
                  overviewEnabled={enabled}
                  organizationView={organizationView}
                  organizationList={organizationList}
                  manageAllOrgSelected={manageAllOrgSelected}
                />
              )
            }}
          </UserFeature>
        </div>
      </div>
    )
  }
}

export default BuildingNew
