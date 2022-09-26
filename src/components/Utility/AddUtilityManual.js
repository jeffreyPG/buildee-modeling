import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import styles from './AddUtility.scss'

export class AddUtilityManual extends React.Component {
  static propTypes = {
    type: PropTypes.string.isRequired,
    consumptionOrDelivery: PropTypes.string.isRequired,
    manualUtilities: PropTypes.array.isRequired,
    handleChangeManualUtilities: PropTypes.func.isRequired
  }

  componentWillUnmount = () => {
    // clear manual utilities on unmount
    this.props.handleChangeManualUtilities([])
  }

  handleAddMonth = () => {
    let tempManualUtilities = [...this.props.manualUtilities]
    tempManualUtilities.push({})
    this.props.handleChangeManualUtilities(tempManualUtilities)
  }

  handleEditMonthFields = (e, field, index) => {
    let tempManualUtilities = [...this.props.manualUtilities]
    if (field === 'estimation') {
      tempManualUtilities[index].estimation = e.target.checked
    } else {
      tempManualUtilities[index][field] = e.target.value
    }
    this.props.handleChangeManualUtilities(tempManualUtilities)
  }

  handleDeleteMonth = index => {
    let tempManualUtilities = [...this.props.manualUtilities]
    tempManualUtilities.splice(index, 1)
    this.props.handleChangeManualUtilities(tempManualUtilities)
  }

  formatUtilityZeroValue = utility => {
    let newObj = {}
    for (let key in utility) {
      newObj[key] = utility[key]
      if (
        (newObj[key] === '' || newObj[key] === 0) &&
        !['startDate', 'endDateMeterMonth', 'deliveryDate'].includes(key)
      ) {
        newObj[key] = '0'
      }
    }
    return newObj
  }

  render() {
    return (
      <div className={styles.manualUtility}>
        {this.props.manualUtilities &&
          this.props.manualUtilities.length > 0 &&
          this.props.manualUtilities.map((originUtil, index) => {
            const util = this.formatUtilityZeroValue(originUtil)
            console.log('util', util)
            return (
              <div key={index} className={styles.manualUtilityMonth}>
                <div className={styles.manualUtilityMonthData}>
                  {this.props.consumptionOrDelivery === 'consumption' && (
                    <div className={styles.manualUtilityMonthInput}>
                      <label>
                        <small>Start Date</small>
                      </label>
                      <input
                        type='date'
                        name='startDateMeterMonth'
                        value={util.startDate || ''}
                        onChange={e =>
                          this.handleEditMonthFields(e, 'startDate', index)
                        }
                      />
                    </div>
                  )}
                  {this.props.consumptionOrDelivery === 'consumption' && (
                    <div className={styles.manualUtilityMonthInput}>
                      <label>
                        <small>End Date</small>
                      </label>
                      <input
                        type='date'
                        name='endDateMeterMonth'
                        value={util.endDate || ''}
                        onChange={e =>
                          this.handleEditMonthFields(e, 'endDate', index)
                        }
                      />
                    </div>
                  )}
                  {this.props.consumptionOrDelivery === 'consumption' && (
                    <div className={styles.manualUtilityMonthInput}>
                      <label>
                        <small>Total Usage</small>
                      </label>
                      <input
                        type='number'
                        name='totalUsageMeterMonth'
                        value={util.totalUsage || ''}
                        onChange={e =>
                          this.handleEditMonthFields(e, 'totalUsage', index)
                        }
                      />
                    </div>
                  )}
                  {this.props.consumptionOrDelivery === 'delivery' && (
                    <div className={styles.manualUtilityMonthInput}>
                      <label>
                        <small>Delivery Date</small>
                      </label>
                      <input
                        type='date'
                        name='deliveryDateMeterMonth'
                        value={util.deliveryDate || ''}
                        onChange={e =>
                          this.handleEditMonthFields(e, 'deliveryDate', index)
                        }
                      />
                    </div>
                  )}
                  {this.props.consumptionOrDelivery === 'delivery' && (
                    <div className={styles.manualUtilityMonthInput}>
                      <label>
                        <small>Delivery Quantity</small>
                      </label>
                      <input
                        type='number'
                        name='deliveryQuantityMeterMonth'
                        value={util.quantity || ''}
                        onChange={e =>
                          this.handleEditMonthFields(e, 'quantity', index)
                        }
                      />
                    </div>
                  )}
                  <div className={styles.manualUtilityMonthInput}>
                    <label>
                      <small>Total Usage Cost</small>
                    </label>
                    <input
                      type='number'
                      name='totalCostMeterMonth'
                      value={util.totalCost || ''}
                      onChange={e =>
                        this.handleEditMonthFields(e, 'totalCost', index)
                      }
                    />
                  </div>
                  {this.props.type === 'electric' && (
                    <div className={styles.manualUtilityMonthInput}>
                      <label>
                        <small>Demand</small>
                      </label>
                      <input
                        type='number'
                        name='demandMeterMonth'
                        value={util.demand || ''}
                        onChange={e =>
                          this.handleEditMonthFields(e, 'demand', index)
                        }
                      />
                    </div>
                  )}
                  {this.props.type === 'electric' && (
                    <div className={styles.manualUtilityMonthInput}>
                      <label>
                        <small>Demand Cost</small>
                      </label>
                      <input
                        type='number'
                        name='demandCostMeterMonth'
                        value={util.demandCost || ''}
                        onChange={e =>
                          this.handleEditMonthFields(e, 'demandCost', index)
                        }
                      />
                    </div>
                  )}
                  <div
                    className={classNames(
                      styles.manualUtilityMonthInput,
                      styles.checkboxContainer
                    )}
                  >
                    <label>
                      <small>Estimation</small>
                      <input
                        type='checkbox'
                        name='estimationMeterMonth'
                        defaultChecked={util.estimation}
                        className={util.estimation ? styles.checked : ''}
                        onChange={e =>
                          this.handleEditMonthFields(e, 'estimation', index)
                        }
                      />
                      <span />
                    </label>
                  </div>
                </div>
                <div
                  className={styles.manualUtilityMonthDelete}
                  onClick={() => this.handleDeleteMonth(index)}
                >
                  <i className='material-icons'>close</i>
                </div>
              </div>
            )
          })}
        <div
          name='addMonthDataMeters'
          className={styles.manualUtilityAdd}
          onClick={() => this.handleAddMonth()}
        >
          <label>
            <small>Add billing data month-by-month</small>
          </label>
          <p>+ Add Month</p>
        </div>
      </div>
    )
  }
}

export default AddUtilityManual
