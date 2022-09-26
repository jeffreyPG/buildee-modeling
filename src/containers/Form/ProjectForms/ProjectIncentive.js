import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import styles from './ProjectIncentive.scss'
import { getValueForXcelMeasure } from 'utils/Project'
export class ProjectIncentive extends React.Component {
  state = {
    isChanged: false
  }

  static propTypes = {
    incentive: PropTypes.object.isRequired,
    formValues: PropTypes.object.isRequired,
    handleChange: PropTypes.func.isRequired,
    runAnalysis: PropTypes.bool.isRequired,
    currentView: PropTypes.string
  }

  showUnitWithRebate = () => {
    const { name, formValues } = this.props
    if (name === 'xcelWaterOrAirCooledChillers' && this.props.showUnit) {
      const data = getValueForXcelMeasure(name, {
        rebate: formValues['xcelWaterOrAirCooledChillersRebateType']
      })
      if (data.incentive.length) {
        const label = [
          `$${data.incentive[0].value} per Ton`,
          `$${data.incentive[1].value} per FLV - ${data.incentive[1].flv_vfd_baseline} kW/ton below base`,
          `$${data.incentive[2].value} per IPLV - ${data.incentive[2].IPlv_vfd_baseline} kW/ton below base`
        ]
        return (
          <div className={styles.projectsIncentiveUnit}>
            {label.map((item, index) => (
              <p key={index}>{item}</p>
            ))}
          </div>
        )
      }
    } else if (
      this.props.showUnit &&
      this.props.unit &&
      this.props.incentiveValue
    ) {
      return (
        <p>
          ${this.props.incentiveValue} per {this.props.unit}
        </p>
      )
    }
    return null
  }

  render() {
    const { incentive } = this.props
    let inputValue = ''
    const showUnit = incentive.incentive_type !== 'default'
    inputValue = this.props.formValues['input'] || ''
    if (showUnit && !this.state.isChanged) {
      inputValue =
        +this.props.formValues['input'] / this.props.incentive['unit_rate'] ||
        ''
    }

    return (
      <div className={styles.projectsIncentive}>
        {incentive.incentive_type !== 'default' && (
          <p>
            ${incentive.unit_rate} per {incentive.input_label}
          </p>
        )}
        {incentive.incentive_description && (
          <p>{incentive.incentive_description}</p>
        )}
        {this.showUnitWithRebate()}
        {!this.props.runAnalysis && (
          <div className={styles.projectsIncentiveSingle}>
            {incentive.incentive_type !== 'default' && (
              <label htmlFor="input">{incentive.input_units}*</label>
            )}
            {incentive.incentive_type === 'default' && (
              <label htmlFor="input">Total incentive</label>
            )}
            <input
              required
              value={inputValue || ''}
              name="input"
              placeholder=" "
              step={showUnit ? 1 : '.01'}
              type="number"
              onChange={e => {
                this.props.handleChange(e)
                this.setState({ isChanged: true })
              }}
              disabled={incentive.disable_user_input === true ? 'disabled' : ''}
              onWheel={e => e.target.blur()}
            />

            <div className={styles.projectsIncentiveDetails}>
              {incentive.input_description && (
                <small>Description: {incentive.input_description}</small>
              )}
            </div>
          </div>
        )}
        {this.props.runAnalysis && (
          <p>Your incentive will be automatically calculated.</p>
        )}
      </div>
    )
  }
}

export default ProjectIncentive
