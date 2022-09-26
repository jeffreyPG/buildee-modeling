import React, { Component } from 'react'
import classNames from 'classnames'

import styles from './CustomProjectFinancialModal.scss'

class CustomProjectFinancialModal extends Component {
  onClose = () => {
    this.props.onClose()
  }

  onSave = () => {
    this.props.onSave()
  }

  state = {
    showFinancialFields: false,
    projectCostDisabled: false,
    sectionShows: []
  }

  componentDidUpdate = prevProps => {
    if (this.props.formValues !== prevProps.formValues) {
      this.calculateProjectCost()
    }
  }

  handleShowFinancialFields = () => {
    let tempBool = true
    let sectionShows = []
    if (this.state.showFinancialFields) {
      tempBool = false
    }
    if (tempBool === true) {
      const { extraFinancialFields } = this.props
      sectionShows = extraFinancialFields.map(section => section.label)
    }
    this.setState({ showFinancialFields: tempBool, sectionShows })
  }

  handleToggleSection = section => {
    let label = section.label
    let { sectionShows } = this.state
    if (sectionShows.indexOf(label) > -1) {
      sectionShows = sectionShows.filter(item => item !== label)
    } else {
      sectionShows.push(label)
    }
    this.setState({
      sectionShows
    })
  }

  // if any of the extra financial fields are filled out, add together and place in cost field, disable
  calculateProjectCost = () => {
    const { extraFinancialFields, formValues } = this.props
    var extraFieldsArray = Object.keys(extraFinancialFields).map(
      k => extraFinancialFields[k].label
    )
    let extrasFilledOut = extraFieldsArray.some(field => {
      return (
        formValues.hasOwnProperty(field) &&
        formValues[field] !== '' &&
        formValues[field] !== undefined
      )
    })
    this.setState({ projectCostDisabled: extrasFilledOut })
  }

  renderField = (field, index) => {
    let unit = field.unit || ''
    const { lockFields = [] } = this.props
    const isLocked = lockFields.includes(field.label)
    if (!unit)
      return (
        <div key={index} className={styles.projectsFinancialInputNoIcon}>
          <label htmlFor={field.label}>{field.name}</label>
          <span>
            <input
              value={
                this.props.formValues[field.label] !== undefined
                  ? this.props.formValues[field.label]
                  : ''
              }
              name={field.label}
              type='number'
              autoComplete='off'
              step='.01'
              placeholder=' '
              onChange={this.props.handleChange}
              onWheel={e => e.target.blur()}
              disabled={isLocked}
            />
          </span>
        </div>
      )
    if (unit === '$') {
      return (
        <div key={index} className={styles.projectsFinancialInput}>
          <label htmlFor={field.label}>{field.name}</label>
          <span>
            <i className='material-icons'>attach_money</i>
            <input
              value={
                this.props.formValues[field.label] !== undefined
                  ? this.props.formValues[field.label]
                  : ''
              }
              name={field.label}
              type='number'
              autoComplete='off'
              step='.01'
              placeholder=' '
              onChange={this.props.handleChange}
              onWheel={e => e.target.blur()}
              disabled={isLocked}
            />
          </span>
        </div>
      )
    }
    return (
      <div
        key={index}
        className={classNames(
          unit.length > 2
            ? styles.projectsFinancialInputLargeIcon
            : styles.projectsFinancialInput
        )}
      >
        <label htmlFor={field.label}>{field.name}</label>
        <span>
          <i>{unit}</i>
          <input
            value={
              this.props.formValues[field.label] !== undefined
                ? this.props.formValues[field.label]
                : ''
            }
            name={field.label}
            type='number'
            autoComplete='off'
            step='.01'
            placeholder=' '
            onChange={this.props.handleChange}
            onWheel={e => e.target.blur()}
            disabled={isLocked}
          />
        </span>
      </div>
    )
  }

  renderFinancialFields = () => {
    const { sectionShows } = this.state
    const { extraFinancialFields } = this.props
    return (
      <div className={styles.projectsFinancialExtrafields}>
        {extraFinancialFields.map(section => {
          let fields = section.subFields || []
          if (fields.length === 0) return null
          let normalFields = fields.filter(
            field =>
              field.label !== 'total_hard_cost' &&
              field.label !== 'total_soft_cost'
          )
          let totalFields = fields.filter(
            field =>
              field.label === 'total_hard_cost' ||
              field.label === 'total_soft_cost'
          )
          let layout = section.layout || 3
          let isOpen = sectionShows.indexOf(section.label) > -1
          return (
            <div key={section.label}>
              <p
                onClick={() => {
                  this.handleToggleSection(section)
                }}
                className={styles.projectsFinancialToggle}
              >
                {section.label}
                {isOpen ? (
                  <i className='material-icons'>expand_less</i>
                ) : (
                  <i className='material-icons'>expand_more</i>
                )}
              </p>
              {isOpen && (
                <div>
                  <div
                    className={classNames(
                      layout === 3
                        ? styles['container-column-3']
                        : styles['container-column-2']
                    )}
                  >
                    {normalFields.map((field, index) =>
                      this.renderField(field, index)
                    )}
                  </div>
                  {totalFields && totalFields.length > 0 && (
                    <div
                      className={classNames(
                        layout === 3
                          ? styles['container-column-3']
                          : styles['container-column-2']
                      )}
                      style={{ marginTop: '40px', marginBottom: '40px' }}
                    >
                      {totalFields.map((field, index) =>
                        this.renderField(field, index)
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    )
  }

  renderBody() {
    const { showFinancialFields, projectCostDisabled } = this.state
    return (
      <div className={styles.projectsFinancial}>
        <div className={styles.projectsFinancialInput}>
          <label htmlFor='project_cost'>Total Measure Cost</label>
          <span>
            <i className='material-icons'>attach_money</i>
            <input
              disabled={projectCostDisabled}
              required
              value={
                this.props.formValues['project_cost'] !== undefined
                  ? this.props.formValues['project_cost']
                  : ''
              }
              name='project_cost'
              type='number'
              autoComplete='off'
              step='.01'
              placeholder=' '
              onChange={e => {
                this.props.handleChange(e)
              }}
              onWheel={e => e.target.blur()}
            />
          </span>
        </div>

        <div className={styles.projectsFinancialInput}>
          <label htmlFor='project_total_financing_funding'>
            Total Financing/Funding
          </label>
          <span>
            <i className='material-icons'>attach_money</i>
            <input
              disabled={projectCostDisabled}
              required
              value={
                this.props.formValues['project_total_financing_funding'] !==
                undefined
                  ? this.props.formValues['project_total_financing_funding']
                  : ''
              }
              name='project_total_financing_funding'
              type='number'
              autoComplete='off'
              step='.01'
              placeholder=' '
              onChange={this.props.handleChange}
              onWheel={e => e.target.blur()}
            />
          </span>
        </div>

        <p
          onClick={this.handleShowFinancialFields}
          className={styles.projectsFinancialToggle}
        >
          {showFinancialFields ? (
            <i className='material-icons'>expand_less</i>
          ) : (
            <i className='material-icons'>expand_more</i>
          )}
          {showFinancialFields ? 'Hide' : 'Show'} additional financial fields
        </p>
        {showFinancialFields && this.renderFinancialFields()}
        <div className={styles.projectsFinancialInput}>
          <label htmlFor='maintenance_savings'>Maintenance Savings</label>
          <span>
            <i className='material-icons'>attach_money</i>
            <input
              required
              value={
                this.props.formValues['maintenance_savings'] !== undefined
                  ? this.props.formValues['maintenance_savings']
                  : ''
              }
              name='maintenance_savings'
              type='number'
              autoComplete='off'
              step='.01'
              placeholder=' '
              onChange={this.props.handleChange}
              onWheel={e => e.target.blur()}
            />
          </span>
        </div>
      </div>
    )
  }

  render() {
    return (
      <div className={styles.modal}>
        <div className={styles.modalInner}>
          <div className={styles.modalHeading}>
            <div>
              <h2>Financial Fields</h2>
            </div>
            <div className={styles.modalClose} onClick={this.onClose}>
              <i className='material-icons'>close</i>
            </div>
          </div>
          <div className={styles.modalBody}>{this.renderBody()}</div>
          <div className={styles.modalFooter}>
            <div className={styles.modalFooterRight}>
              <button
                type='button'
                className={classNames(styles.button, styles.buttonSecondary)}
                onClick={this.onClose}
              >
                Cancel
              </button>
              <button
                type='button'
                className={classNames(styles.button, styles.buttonPrimary)}
                onClick={this.onSave}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }
}
export default CustomProjectFinancialModal
