import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router'
import styles from './PortfolioExport.scss'
import classNames from 'classnames'
import { Loader } from 'utils/Loader'

export class PortfolioExport extends React.Component {
  static propTypes = {
    buildingList: PropTypes.array.isRequired,
    connectedAccounts: PropTypes.array.isRequired,
    goToBuilding: PropTypes.func.isRequired,
    estimatedTime: PropTypes.number.isRequired,
    pmExport: PropTypes.func.isRequired,
    pmExportUpdate: PropTypes.func.isRequired,
    loading: PropTypes.bool.isRequired,
    returnBuildingDetails: PropTypes.array.isRequired
  }

  state = {
    accountSelectionIndex: '',
    ableToExport: false,
    buildings: [],
    showConfirmation: false,
    confirmationType: 'export',
    property: false,
    currentAccount: {},
    checkbox: false
  }

  componentDidMount = () => {
    this.setState({ buildings: this.props.buildingList })
  }

  componentDidUpdate = prevProps => {
    if (prevProps.buildingList !== this.props.buildingList) {
      let tempBuildingList = [...this.props.buildingList]
      if (
        this.props.returnBuildingDetails &&
        this.props.returnBuildingDetails.length > 0
      ) {
        this.props.returnBuildingDetails.map(detail => {
          let matchBuildingIndex = tempBuildingList.findIndex(function(obj) {
            return obj._id === detail.id
          })
          if (matchBuildingIndex >= 0) {
            tempBuildingList[matchBuildingIndex].message = detail.message
          }
        })
      }

      this.setState({ buildings: tempBuildingList })
    }
  }

  handleChangeExportAccount = e => {
    this.setState({
      currentAccount: this.props.connectedAccounts[e.target.value],
      accountSelectionIndex: e.target.value,
      ableToExport: true
    })
  }

  handleCheckbox = () => {
    this.setState(prevState => ({
      checkbox: !prevState.checkbox
    }))
  }

  cancelConfirmation = () => {
    this.setState({
      showConfirmation: false,
      property: false,
      currentAccount: {},
      checkbox: false,
      ableToExport: false
    })
  }

  handleClickAction = (account, type, property) => {
    property = property !== null ? property : false
    this.setState({
      showConfirmation: true,
      confirmationType: type,
      property: property,
      currentAccount: account,
      checkbox: false
    })
  }

  confirm = () => {
    if (this.state.confirmationType === 'export') {
      this.props.pmExport(
        this.state.currentAccount,
        this.state.property,
        this.state.currentAccount.username
      )
    }

    if (this.state.confirmationType === 'update') {
      this.props.pmExportUpdate(
        this.state.currentAccount.accountId,
        this.state.property,
        this.state.currentAccount.username
      )
    }

    this.setState({ showConfirmation: false, checkbox: false })
  }

  buildingCanSync = building => {
    let self = this
    let obj = false

    if (
      building &&
      building.info &&
      building.info.energystarIds &&
      building.info.energystarIds.length > 0
    ) {
      obj = building.info.energystarIds.find(function(obj) {
        return obj.accountId === self.state.currentAccount.accountId
      })
    }

    return obj ? true : false
  }

  render() {
    return (
      <div className={styles.portfolioExport}>
        {this.state.showConfirmation && (
          <div className={styles.portfolioExportDetail}>
            <div className={styles.portfolioExportConfirmation}>
              <h3>
                <span>{this.state.confirmationType}</span>
                {this.state.property
                  ? ' ' + this.state.property.info.buildingName + ' to '
                  : ' All '}
                {this.state.currentAccount.username}
                {!this.state.property ? ' buildings?' : '?'}
              </h3>

              {!this.state.property && (
                <p>
                  This action will {this.state.confirmationType}
                  {this.state.confirmationType === 'update'
                    ? ' all buildings previously imported to reflect data in the Portfolio Manager account. Meters and data added independently will not be updated nor deleted.'
                    : ' all shared buildings to the ' +
                      this.state.currentAccount.username +
                      ' account that were not previously added.'}
                </p>
              )}
              {this.state.property && (
                <p>
                  This action will {this.state.confirmationType}{' '}
                  {this.state.property.info.buildingName} to the{' '}
                  {this.state.currentAccount.username} account including
                  property details, building use, and meters.{' '}
                  {this.state.confirmationType === 'update'
                    ? 'Meters and data added independently will not be updated nor deleted.'
                    : ''}
                </p>
              )}

              <div
                className={styles.portfolioExportConfirmationAction}
                onClick={this.handleCheckbox}
              >
                <input type="checkbox" checked={this.state.checkbox} />

                {!this.state.property && (
                  <p>
                    Yes, I want to {this.state.confirmationType} all buildings
                    {this.state.confirmationType === 'update'
                      ? ' shared with me to ' +
                        this.state.currentAccount.username +
                        '.'
                      : ' to reflect the Portfolio Manager account.'}
                  </p>
                )}

                {this.state.property && (
                  <p>
                    Yes, I want to {this.state.confirmationType}{' '}
                    {this.state.property.info.buildingName} to{' '}
                    {this.state.currentAccount.username}
                  </p>
                )}
              </div>
            </div>

            <div className={styles.panelActions}>
              <button
                onClick={this.cancelConfirmation}
                className={classNames(styles.button, styles.buttonSecondary)}
              >
                Cancel
              </button>
              <button
                onClick={this.confirm}
                disabled={!this.state.checkbox}
                className={classNames(
                  styles.button,
                  styles.buttonPrimary,
                  !this.state.checkbox ? styles.buttonDisable : ''
                )}
              >
                {this.state.confirmationType}
              </button>
            </div>
          </div>
        )}
        {!this.state.showConfirmation && (
          <div className={styles.portfolioExportDetail}>
            {(!this.props.connectedAccounts ||
              this.props.connectedAccounts.length === 0) && (
              <div className={styles.panelContent}>
                <p>You do not have any currently connected accounts</p>
              </div>
            )}

            <div className={classNames(styles.portfolioExportAll)}>
              <div>
                <p className={styles.portfolioExportSelectText}>
                  Select the Energy Star Portfolio Manager account to export to:
                </p>
                <div className={styles.selectContainer}>
                  <select
                    value={this.state.accountSelectionIndex}
                    onChange={e => this.handleChangeExportAccount(e)}
                  >
                    <option value="" defaultValue disabled>
                      Select Portfolio Manager Account
                    </option>
                    {this.props.connectedAccounts.map((account, index) => (
                      <option key={index} value={index}>
                        {account.username}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {this.state.accountSelectionIndex !== '' && (
              <div
                className={classNames(styles.portfolioExportBuildeeBuildings)}
              >
                <div className={classNames(styles.portfolioExportHeading)}>
                  <h3>Your buildee Buildings</h3>
                  <div className={classNames(styles.portfolioExportStatus)}>
                    {this.state.ableToExport && !this.props.loading && (
                      <div
                        className={classNames(styles.portfolioExportAllOptions)}
                      >
                        <p
                          onClick={() =>
                            this.handleClickAction(
                              this.props.connectedAccounts[
                                this.state.accountSelectionIndex
                              ],
                              'export',
                              null
                            )
                          }
                        >
                          Export All
                        </p>
                        <p
                          onClick={() =>
                            this.handleClickAction(
                              this.props.connectedAccounts[
                                this.state.accountSelectionIndex
                              ],
                              'update',
                              null
                            )
                          }
                        >
                          Update All
                        </p>
                      </div>
                    )}

                    {this.props.estimatedTime !== 0 && this.props.loading && (
                      <div className={classNames(styles.portfolioExportLoader)}>
                        <Loader size="button" />
                        <p>
                          Estimated wait: {this.props.estimatedTime} seconds
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div
                  className={classNames(
                    styles.table,
                    styles.portfolioExportTable
                  )}
                >
                  {this.state.buildings.map((building, index) => {
                    return (
                      <div key={index} className={styles.tableRow}>
                        <p
                          onClick={() => this.props.goToBuilding(building._id)}
                          className={classNames(
                            styles.tableRowItem,
                            styles.portfolioExportPointer
                          )}
                        >
                          {building.info.buildingName}
                        </p>
                        {!this.props.loading && (
                          <div
                            className={classNames(
                              styles.tableRowItem,
                              styles.portfolioExportColLast,
                              styles.portfolioExportPointer
                            )}
                          >
                            {this.state.ableToExport &&
                              !this.buildingCanSync(building) && (
                                <i
                                  onClick={() =>
                                    this.handleClickAction(
                                      this.props.connectedAccounts[
                                        this.state.accountSelectionIndex
                                      ],
                                      'export',
                                      building
                                    )
                                  }
                                  className="material-icons"
                                >
                                  add_circle
                                </i>
                              )}
                            {this.state.ableToExport &&
                              this.buildingCanSync(building) && (
                                <i
                                  onClick={() =>
                                    this.handleClickAction(
                                      this.props.connectedAccounts[
                                        this.state.accountSelectionIndex
                                      ],
                                      'update',
                                      building
                                    )
                                  }
                                  className="material-icons"
                                >
                                  sync
                                </i>
                              )}
                          </div>
                        )}

                        {!this.props.loading && building.message && (
                          <div
                            className={classNames(
                              styles.tableRowItem,
                              styles.portfolioExportMessage
                            )}
                          >
                            {building.message.map((message, index) => (
                              <p key={index}>{message}</p>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    )
  }
}

export default PortfolioExport
