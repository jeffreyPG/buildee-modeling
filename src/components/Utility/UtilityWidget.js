import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import styles from './UtilityWidget.scss'
import { formatNumbersWithCommas } from 'utils/Utils'
import { getCsvTimeframes, getCsvTimeframesOfDelivery } from './UtilityHelpers'

import { AddUtility, EditUtility, UtilityChart } from './'
import DeleteConfirmationModal from '../../containers/Modal/DeleteConfirmationModal'
import { UTILITY_TYPES } from 'static/utility-units'

export class UtilityWidget extends React.Component {
  static propTypes = {
    type: PropTypes.string.isRequired,
    utilityName: PropTypes.string.isRequired,
    consumptionOrDelivery: PropTypes.string.isRequired,
    utility: PropTypes.array.isRequired,
    originalUtility: PropTypes.array.isRequired,
    buildingId: PropTypes.string.isRequired,
    createUtilities: PropTypes.func.isRequired,
    deleteUtility: PropTypes.func.isRequired,
    editUtility: PropTypes.func.isRequired,
    allUtilities: PropTypes.object.isRequired,
    getWeather: PropTypes.func.isRequired,
    handleGetUtilities: PropTypes.func.isRequired,
    timeRange: PropTypes.object.isRequired,
    chartMonthlyUtilities: PropTypes.array.isRequired
  }

  state = {
    showAddData: false,
    showTable: false,
    isEditing: false,
    currentUtility: {},
    totalsDisplay: {
      usage: 0,
      usageCost: 0,
      demand: 0,
      demandCost: 0,
      deliveryQuantity: 0,
      deliveryCost: 0
    },
    windowWidth: '',
    expandUtilityInfo: '',
    deleteConfirmationOpen: false
  }

  componentDidMount = () => {
    if (this.props.utility && this.props.utility.length > 0) {
      this.handleUpdateDisplayNumbers(this.props.utility)
    }
    window.addEventListener('resize', this.handleUpdateDimensions)
  }

  UNSAFE_componentWillReceiveProps = nextProps => {
    if (
      (nextProps.utility != this.props.utility &&
        nextProps.utility.length > 0) ||
      this.props.monthlyUtilities !== nextProps.monthlyUtilities
    ) {
      this.handleUpdateDisplayNumbers(this.props.utility)
    }
  }
  componentWillUnmount = () => {
    this.setState({ showExtras: '', expandUtilityInfo: '' })
    window.removeEventListener('resize', this.handleUpdateDimensions)
  }

  componentDidUpdate = prevProps => {
    if (
      prevProps.utility !== this.props.utility &&
      this.props.utility.length > 0
    ) {
      this.handleUpdateDisplayNumbers(this.props.utility)
    }
  }

  handleUpdateDimensions = () => {
    this.setState({ windowWidth: window.innerWidth })
  }

  handleMobileUtilityInfo = utilityId => {
    if (this.state.windowWidth <= 699) {
      // toggle off
      if (utilityId === this.state.expandUtilityInfo) {
        this.setState({ expandUtilityInfo: '' })
        return
      }
      this.setState({ expandUtilityInfo: utilityId })
    }
  }

  convertToKBTU = (usage, type) => {
    if (type === UTILITY_TYPES.ELECTRICITY) {
      // 1 kWh = 3.41214 kBtu
      return usage * 3.41214
    } else if (type === UTILITY_TYPES.NATURAL_GAS) {
      // 1 therm = 100kBtu
      return usage * 100
    } else if (type === UTILITY_TYPES.FUEL_OIL_2) {
      // 1 gallon Fuel Oil #2 = 139.6 kBtu
      return usage * 139.6
    } else if (type === UTILITY_TYPES.FUEL_OIL_4) {
      // 1 gallon Fuel Oil #4 = 145.1 kBtu
      return usage * 145.1
    } else if (type === UTILITY_TYPES.FUEL_OIL_56) {
      // 1 gallon Fuel Oil #5 = 148.8 kBtu
      return usage * 148.8
    } else if (type === UTILITY_TYPES.DIESEL) {
      // 1 gallon Diesel = 139 kBtu
      return usage * 139
    } else if (type === UTILITY_TYPES.STEAM) {
      return usage
    } else {
      // utilType of other, 1btu = 0.001 ktbu
      return usage * 0.001
    }
  }

  handleUpdateDisplayNumbers = utility => {
    const { allUtilities, type, consumptionOrDelivery } = this.props

    if (utility.length <= 0) {
      return
    }

    let totalUtilityCosts = 0
    let newUsage = 0
    let convertedUtilityTotal = 0
    let newUsageCost = 0
    let newDemand = 0
    let newDemandCost = 0
    let newDeliveryQuantity = 0
    let newDeliveryCost = 0

    utility.forEach(util => {
      if (consumptionOrDelivery === 'consumption') {
        util.meterData.forEach(dataPoint => {
          newUsage += dataPoint.totalUsage
          newUsageCost += dataPoint.totalCost
          // collect electric data for demand, both demand and demand cost
          if (util.utilType === 'electric') {
            newDemand += dataPoint.demand
            newDemandCost += dataPoint.demandCost
          }
        })
      } else if (consumptionOrDelivery === 'delivery') {
        util.deliveryData.forEach(dataPoint => {
          newDeliveryQuantity += dataPoint.quantity
          newDeliveryCost += dataPoint.totalCost
        })
      }
    })

    Object.keys(allUtilities).forEach(utilType => {
      allUtilities[utilType].forEach(utility => {
        utility.meterData.forEach(dataPoint => {
          // for cost percent
          totalUtilityCosts += dataPoint.totalCost
          // for usage percent without water
          if (utility.utilType !== 'water') {
            // convert all to a common energy unit
            convertedUtilityTotal += this.convertToKBTU(
              dataPoint.totalUsage,
              utility.utilType
            )
          }
        })
        utility.deliveryData.forEach(dataPoint => {
          totalUtilityCosts += dataPoint.totalCost
          convertedUtilityTotal += this.convertToKBTU(
            dataPoint.quantity,
            utility.utilType
          )
        })
      })
    })

    totalUtilityCosts = 0
    newUsage = 0
    convertedUtilityTotal = 0
    newUsageCost = 0
    newDemand = 0
    newDemandCost = 0

    for (let monthlyUtility of this.props.monthlyUtilities) {
      let data = {}
      switch (type) {
        case UTILITY_TYPES.ELECTRICITY:
          data = monthlyUtility['electric']
          break
        case UTILITY_TYPES.NATURAL_GAS:
          data = monthlyUtility['naturalgas']
          break
        case UTILITY_TYPES.STEAM:
          data = monthlyUtility['steam']
          break
        case UTILITY_TYPES.FUEL_OIL_2:
          data = monthlyUtility['fueloil2']
          break
        case UTILITY_TYPES.FUEL_OIL_4:
          data = monthlyUtility['fueloil4']
          break
        case UTILITY_TYPES.FUEL_OIL_56:
          data = monthlyUtility['fueloil56']
          break
        case UTILITY_TYPES.DIESEL:
          data = monthlyUtility['diesel']
          break
        case UTILITY_TYPES.OTHER:
          data = monthlyUtility['other']
          break
        default:
          data = monthlyUtility[type] || {}
      }
      newUsage += data?.totalUsage || 0
      newUsageCost += Math.round((data?.totalCost || 0) * 100) / 100
      newDemand += data?.demand || 0
      newDemandCost += data?.demandCost || 0
      totalUtilityCosts += data?.totalCost || 0
      convertedUtilityTotal += data?.kbtu || 0
    }

    if (consumptionOrDelivery === 'consumption') {
      this.setState({
        totalsDisplay: {
          usage: formatNumbersWithCommas(newUsage.toFixed(2)),
          usagePercent: Math.round(
            (this.convertToKBTU(newUsage, type) / convertedUtilityTotal) * 100
          ),
          usageCost: formatNumbersWithCommas(newUsageCost.toFixed(2)),
          usageCostPercent: Math.round(
            (newUsageCost / totalUtilityCosts) * 100
          ),
          demand: formatNumbersWithCommas(newDemand.toFixed(2)),
          demandCost: formatNumbersWithCommas(newDemandCost.toFixed(2))
        }
      })
    } else if (consumptionOrDelivery === 'delivery') {
      this.setState({
        totalsDisplay: {
          deliveryQuantityPercent: Math.round(
            (this.convertToKBTU(newDeliveryQuantity, type) /
              convertedUtilityTotal) *
              100
          ),
          deliveryCostPercent: Math.round(
            (newDeliveryCost / totalUtilityCosts) * 100
          ),
          deliveryQuantity: formatNumbersWithCommas(
            newDeliveryQuantity.toFixed(2)
          ),
          deliveryCost: formatNumbersWithCommas(newDeliveryCost.toFixed(2))
        }
      })
    }
  }

  handleToggleAddUtility = () => {
    this.setState(prevState => ({
      showAddData: !prevState.showAddData
    }))
  }

  handleToggleTable = () => {
    this.setState(prevState => ({
      showTable: !prevState.showTable
    }))
  }

  handleUtilityClose = () => {
    this.setState({
      isEditing: false,
      currentUtility: {}
    })
    this.props.handleGetUtilities()
  }

  handleEditUtility = utility => {
    this.setState({
      isEditing: true,
      currentUtility: utility
    })
  }

  handleOpenDeleteConfirmationModal = utility => {
    this.setState({
      deleteConfirmationOpen: true,
      currentUtility: utility
    })
  }

  handleCloseDeleteConfirmationModal = () => {
    this.setState({
      deleteConfirmationOpen: false,
      currentUtility: {}
    })
  }

  handleDeleteUtility = utilId => {
    this.props.deleteUtility(this.props.buildingId, utilId)
    this.handleCloseDeleteConfirmationModal()
  }

  render() {
    return (
      <div
        name={`${this.props.utilityName}Meter`}
        className={classNames(styles.utilityWidget, styles.panel)}
      >
        <div className={styles.panelHeader}>
          <h3>{this.props.utilityName}</h3>
        </div>

        {this.props.utility && this.props.utility.length > 0 && (
          <UtilityChart
            totalsDisplay={this.state.totalsDisplay}
            utilities={this.props.utility}
            getWeather={this.props.getWeather}
            utilityName={this.props.type}
            consumptionOrDelivery={this.props.consumptionOrDelivery}
            monthlyUtilities={this.props.monthlyUtilities}
            timeRange={this.props.timeRange}
            originalUtility={this.props.originalUtility}
            chartMonthlyUtilities={this.props.chartMonthlyUtilities}
            commoditySettings={this.props.commoditySettings}
          />
        )}

        {this.props.utility && this.props.utility.length > 0 && (
          <div
            className={styles.utilityWidgetChartToggle}
            name='toggleShowHideMeterData'
            onClick={this.handleToggleTable}
          >
            <small>
              {this.state.showTable ? 'Hide' : 'Show'} Table Data
              {this.state.showTable ? (
                <i className='material-icons'>expand_less</i>
              ) : (
                <i className='material-icons'>expand_more</i>
              )}
            </small>
          </div>
        )}

        {this.props.utility && this.props.utility.length === 0 && (
          <button
            className={classNames(
              styles.button,
              styles.buttonPrimary,
              styles.utilityWidgetButton
            )}
            onClick={this.handleToggleAddUtility}
          >
            + Add Billing Data
          </button>
        )}

        {this.state.showTable && (
          <div className={styles.utilityWidgetData}>
            <div className={styles.table}>
              <div className={styles.tableHeader}>
                <div
                  className={classNames(
                    styles.tableRowItem,
                    styles.tableRowItem_2
                  )}
                >
                  Utility Name
                </div>
                <div className={styles.tableRowItem}>Meter Name</div>
                <div className={styles.tableRowItem}>Start Date</div>
                <div className={styles.tableRowItem}>End Date</div>
                <div className={styles.tableRowItem}>Source</div>
                <div
                  className={classNames(
                    styles.tableRowItem,
                    styles.tableRowItem_2
                  )}
                >
                  Author
                </div>
                <div className={styles.tableRowItem}>Created</div>
                <div
                  className={classNames(
                    styles.tableRowItem,
                    styles.utilityWidgetDelete
                  )}
                />
              </div>
              {this.props.originalUtility.map((data, index) => {
                if (data.meterData && data.meterData.length > 0) {
                  return (
                    <div
                      key={index}
                      className={classNames(
                        styles.tableRow,
                        this.state.currentUtility._id === data._id
                          ? styles['active']
                          : ''
                      )}
                    >
                      <div
                        className={classNames(
                          styles.tableRowItem,
                          styles.tableRowItem_2,
                          styles.utilityWidgetContent
                        )}
                      >
                        <div onClick={() => this.handleEditUtility(data)}>
                          {data.name}
                        </div>
                        <div
                          className={classNames(
                            styles.tableMobileOpenInfo,
                            styles.tableMobileShow
                          )}
                          onClick={() => this.handleMobileUtilityInfo(data._id)}
                        >
                          <i className='material-icons'>expand_more</i>
                        </div>
                      </div>
                      <div
                        className={classNames(
                          styles.tableRowItem,
                          styles.tableMobileRowItem,
                          styles.tableMobileBoxTop,
                          this.state.expandUtilityInfo === data._id
                            ? styles.tableMobileRowItemActive
                            : ''
                        )}
                      >
                        <label className={styles.tableMobileShow}>
                          Meter Name
                        </label>
                        {data.meterNumber}
                      </div>
                      <div
                        className={classNames(
                          styles.tableRowItem,
                          styles.tableMobileRowItem,
                          styles.tableMobileBoxMiddle,
                          this.state.expandUtilityInfo === data._id
                            ? styles.tableMobileRowItemActive
                            : ''
                        )}
                      >
                        <label className={styles.tableMobileShow}>
                          Last Updated
                        </label>
                        {getCsvTimeframes(data.meterData).startDate}
                      </div>
                      <div
                        className={classNames(
                          styles.tableRowItem,
                          styles.tableMobileRowItem,
                          styles.tableMobileBoxMiddle,
                          this.state.expandUtilityInfo === data._id
                            ? styles.tableMobileRowItemActive
                            : ''
                        )}
                      >
                        <label className={styles.tableMobileShow}>
                          End Date
                        </label>
                        {getCsvTimeframes(data.meterData).endDate}
                      </div>
                      <div
                        className={classNames(
                          styles.tableRowItem,
                          styles.tableMobileRowItem,
                          styles.tableMobileBoxMiddle,
                          this.state.expandUtilityInfo === data._id
                            ? styles.tableMobileRowItemActive
                            : ''
                        )}
                      >
                        <label className={styles.tableMobileShow}>Source</label>
                        {data.source}
                      </div>
                      <div
                        className={classNames(
                          styles.tableRowItem,
                          styles.tableRowItem_2,
                          styles.tableMobileRowItem,
                          styles.tableMobileBoxMiddle,
                          this.state.expandUtilityInfo === data._id
                            ? styles.tableMobileRowItemActive
                            : ''
                        )}
                      >
                        <label className={styles.tableMobileShow}>Author</label>
                        {data.createdByUserId?.name || '-'}
                      </div>
                      <div
                        className={classNames(
                          styles.tableRowItem,
                          styles.tableMobileRowItem,
                          styles.tableMobileBoxMiddle,
                          this.state.expandUtilityInfo === data._id
                            ? styles.tableMobileRowItemActive
                            : ''
                        )}
                      >
                        <label className={styles.tableMobileShow}>
                          Created
                        </label>
                        {new Date(data.created).toLocaleDateString('en-US', {
                          timeZone: 'UTC'
                        })}
                      </div>
                      <div
                        className={classNames(
                          styles.tableRowItem,
                          styles.tableMobileRowItem,
                          styles.tableMobileBoxBottom,
                          this.state.expandUtilityInfo === data._id
                            ? styles.tableMobileRowItemActive
                            : '',
                          styles.utilityWidgetDelete
                        )}
                        name='deleteMeter'
                        onClick={() =>
                          this.handleOpenDeleteConfirmationModal(data)
                        }
                      >
                        <label className={styles.tableMobileShow}>Delete</label>
                        <i className='material-icons'>delete</i>
                      </div>
                    </div>
                  )
                }
              })}
              {this.props.originalUtility.map((data, index) => {
                if (data.deliveryData && data.deliveryData.length > 0) {
                  return (
                    <div
                      key={index}
                      className={classNames(
                        styles.tableRow,
                        this.state.currentUtility._id === data._id
                          ? styles['active']
                          : ''
                      )}
                    >
                      <div
                        className={classNames(
                          styles.tableRowItem,
                          styles.tableRowItem_2,
                          styles.utilityWidgetContent
                        )}
                      >
                        <div onClick={() => this.handleEditUtility(data)}>
                          {data.name}
                        </div>
                        <div
                          className={classNames(
                            styles.tableMobileOpenInfo,
                            styles.tableMobileShow
                          )}
                          onClick={() => this.handleMobileUtilityInfo(data._id)}
                        >
                          <i className='material-icons'>expand_more</i>
                        </div>
                      </div>
                      <div
                        className={classNames(
                          styles.tableRowItem,
                          styles.tableMobileRowItem,
                          styles.tableMobileBoxTop,
                          this.state.expandUtilityInfo === data._id
                            ? styles.tableMobileRowItemActive
                            : ''
                        )}
                      >
                        <label className={styles.tableMobileShow}>
                          Meter Name
                        </label>
                        {data.meterNumber}
                      </div>
                      <div
                        className={classNames(
                          styles.tableRowItem,
                          styles.tableMobileRowItem,
                          styles.tableMobileBoxMiddle,
                          this.state.expandUtilityInfo === data._id
                            ? styles.tableMobileRowItemActive
                            : ''
                        )}
                      >
                        <label className={styles.tableMobileShow}>
                          Last Updated
                        </label>
                        {
                          getCsvTimeframesOfDelivery(data.deliveryData)
                            .startDate
                        }
                      </div>
                      <div
                        className={classNames(
                          styles.tableRowItem,
                          styles.tableMobileRowItem,
                          styles.tableMobileBoxMiddle,
                          this.state.expandUtilityInfo === data._id
                            ? styles.tableMobileRowItemActive
                            : ''
                        )}
                      >
                        <label className={styles.tableMobileShow}>
                          End Date
                        </label>
                        {getCsvTimeframesOfDelivery(data.deliveryData).endDate}
                      </div>
                      <div
                        className={classNames(
                          styles.tableRowItem,
                          styles.tableMobileRowItem,
                          styles.tableMobileBoxMiddle,
                          this.state.expandUtilityInfo === data._id
                            ? styles.tableMobileRowItemActive
                            : ''
                        )}
                      >
                        <label className={styles.tableMobileShow}>Source</label>
                        {data.source}
                      </div>
                      <div
                        className={classNames(
                          styles.tableRowItem,
                          styles.tableMobileRowItem,
                          styles.tableMobileBoxMiddle,
                          this.state.expandUtilityInfo === data._id
                            ? styles.tableMobileRowItemActive
                            : ''
                        )}
                      >
                        <label className={styles.tableMobileShow}>
                          Created
                        </label>
                        {new Date(data.created).toLocaleDateString('en-US', {
                          timeZone: 'UTC'
                        })}
                      </div>
                      <div
                        className={classNames(
                          styles.tableRowItem,
                          styles.tableMobileRowItem,
                          styles.tableMobileBoxBottom,
                          this.state.expandUtilityInfo === data._id
                            ? styles.tableMobileRowItemActive
                            : '',
                          styles.utilityWidgetDelete
                        )}
                        name='deleteMeter'
                        onClick={() =>
                          this.handleOpenDeleteConfirmationModal(data)
                        }
                      >
                        <label className={styles.tableMobileShow}>Delete</label>
                        <i className='material-icons'>delete</i>
                      </div>
                    </div>
                  )
                }
              })}
            </div>

            {!this.state.showAddData &&
              !this.state.isEditing &&
              this.props.utility &&
              this.props.utility.length > 0 && (
                <button
                  className={classNames(
                    styles.button,
                    styles.buttonPrimary,
                    styles.utilityWidgetButton
                  )}
                  onClick={this.handleToggleAddUtility}
                >
                  + Add Billing Data
                </button>
              )}

            {this.state.isEditing &&
              Object.keys(this.state.currentUtility).length !== 0 && (
                <EditUtility
                  type={this.props.type}
                  consumptionOrDelivery={this.props.consumptionOrDelivery}
                  buildingId={this.props.buildingId}
                  handleUtilityClose={this.handleUtilityClose}
                  utility={this.state.currentUtility}
                  editUtility={this.props.editUtility}
                />
              )}
          </div>
        )}

        {this.state.showAddData && !this.state.isEditing && (
          <AddUtility
            type={this.props.type}
            consumptionOrDelivery={this.props.consumptionOrDelivery}
            buildingId={this.props.buildingId}
            handleToggleAddUtility={this.handleToggleAddUtility}
            createUtilities={this.props.createUtilities}
            isUnusedUtility={
              !this.props.utility || this.props.utility.length === 0
            }
            commoditySettings={this.props.commoditySettings}
          />
        )}

        {this.state.deleteConfirmationOpen && (
          <DeleteConfirmationModal
            title={this.state.currentUtility.name}
            confirmationFunction={() =>
              this.handleDeleteUtility(this.state.currentUtility._id)
            }
            onClose={this.handleCloseDeleteConfirmationModal}
          />
        )}
      </div>
    )
  }
}

export default UtilityWidget
