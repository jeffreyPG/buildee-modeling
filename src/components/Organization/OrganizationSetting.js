import React from 'react'
import PropTypes from 'prop-types'
import styles from './OrganizationSetting.scss'
import classNames from 'classnames'
import CommoditySetting from './CommoditySetting'
import { getDefaultCommoditySettings } from '../../static/utility-units'

class OrganizationSetting extends React.Component {
  static propTypes = {
    organizationView: PropTypes.object.isRequired,
    getOrganization: PropTypes.func.isRequired,
    updateOrganization: PropTypes.func.isRequired
  }

  state = {
    methodology: '',
    yearsCovered: ['2017', '2018', '2019', '2020', '2021', '2022'],
    defaultTimePeriod: '',
    commoditySettings:
      this.props.organizationView.commoditySettings ||
      getDefaultCommoditySettings()
  }

  componentDidMount = () => {
    this.props.getOrganization(this.props.params.organizationId)
  }

  handleUnitChanged = commodity => event => {
    const { commoditySettings } = this.state
    const newUnit = event.target.value
    this.setState({
      commoditySettings: {
        ...commoditySettings,
        [commodity]: {
          ...commoditySettings[commodity],
          unit: newUnit
        }
      }
    })
  }

  handleEmissionFactorChanged = (commodity, type) => event => {
    const { commoditySettings } = this.state
    const newValue = event.target.value
    this.setState({
      commoditySettings: {
        ...commoditySettings,
        [commodity]: {
          ...commoditySettings[commodity],
          [type]: newValue
        }
      }
    })
  }

  onSaveCommoditySettings = () => {
    const { updateOrganization, organizationView } = this.props
    const { commoditySettings } = this.state
    const payload = {
      ...organizationView,
      commoditySettings
    }
    updateOrganization(organizationView._id, payload)
  }

  render() {
    const { commoditySettings } = this.state
    const { organizationView } = this.props
    return (
      <div className={styles.container}>
        <h2>Settings</h2>
        <CommoditySetting
          commoditySettings={commoditySettings}
          organizationView={organizationView}
          handleUnitChanged={this.handleUnitChanged}
          onSaveCommoditySettings={this.onSaveCommoditySettings}
          handleEmissionFactorChanged={this.handleEmissionFactorChanged}
        />
      </div>
    )
  }
}

export default OrganizationSetting
