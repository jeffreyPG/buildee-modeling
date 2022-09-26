import React from 'react'
import PropTypes from 'prop-types'
import styles from './PortfolioImport.scss'
import classNames from 'classnames'
import { Loader } from 'utils/Loader'

export class PortfolioImport extends React.Component {
  static propTypes = {
    toggleActive: PropTypes.bool.isRequired,
    connectedAccounts: PropTypes.array.isRequired,
    toggleIndex: PropTypes.number,
    propertiesList: PropTypes.array.isRequired,
    estimatedTime: PropTypes.number.isRequired,
    loading: PropTypes.bool.isRequired,
    loadingIndexes: PropTypes.array.isRequired,
    toggleBuildings: PropTypes.func.isRequired,
    pmImport: PropTypes.func.isRequired,
    pmImportUpdate: PropTypes.func.isRequired,
    goToBuilding: PropTypes.func.isRequired,
    buildingList: PropTypes.array.isRequired,
    linkToBuildeeBuilding: PropTypes.func.isRequired,
    returnBuildingDetails: PropTypes.array.isRequired
  }

  state = {
    showConfirmation: false,
    confirmationType: 'import',
    property: false,
    currentAccount: {},
    checkbox: false,
    filteredBuildingList: [],
    updatedPropertiesList: [],
    buildingLink: ''
  }

  componentDidMount = () => {
    // get all buildee buildings with pm references
    if (this.props.buildingList && this.props.buildingList.length > 0) {
      let filteredArray = this.props.buildingList.filter(
        building => building.info.energystarIds.length > 0
      )
      if (filteredArray.length > 0) {
        this.setState({ filteredBuildingList: filteredArray })
      }
    }
    if (this.props.propertiesList) {
      this.determineSyncStatus(this.props.propertiesList)
    }
  }

  componentDidUpdate = prevProps => {
    if (prevProps.buildingList !== this.props.buildingList) {
      if (this.props.buildingList && this.props.buildingList.length > 0) {
        let filteredArray = this.props.buildingList.filter(
          building => building.info.energystarIds.length > 0
        )

        if (filteredArray.length > 0) {
          this.setState({ filteredBuildingList: filteredArray })
          this.determineSyncStatus(this.props.propertiesList, filteredArray)
        }
      }
    }

    if (
      prevProps.propertiesList !== this.props.propertiesList ||
      prevProps.returnBuildingDetails !== this.props.returnBuildingDetails
    ) {
      this.determineSyncStatus(this.props.propertiesList)
    }
  }

  determineSyncStatus = (properties, buildingList) => {
    let filteredBuildingList = []

    if (buildingList) {
      filteredBuildingList = buildingList
    } else {
      filteredBuildingList = this.state.filteredBuildingList
    }

    if (properties.length > 0) {
      // if buildee has buildings with pm reference
      if (filteredBuildingList && filteredBuildingList.length > 0) {
        // check if any of those references are in this array
        properties.forEach(property => {
          const propertyIdNumber = Number(property.id)
          let obj = filteredBuildingList.find(function(obj) {
            return obj.info.energystarIds.find(function(obj) {
              return obj.buildingId === propertyIdNumber
            })
          })

          if (obj) {
            property.sync = true
            property.buildingId = obj._id
          } else {
            property.sync = false
          }

          if (
            this.props.returnBuildingDetails &&
            this.props.returnBuildingDetails.length > 0
          ) {
            let matchObj = this.props.returnBuildingDetails.find(function(obj) {
              return Number(obj.id) === propertyIdNumber
            })

            if (matchObj) {
              property.message = matchObj.message
            }
          }
        })

        this.setState({ updatedPropertiesList: properties })
      } else {
        this.setState({ updatedPropertiesList: properties })
      }
    } else {
      this.setState({ updatedPropertiesList: [] })
    }
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
    if (this.state.confirmationType === 'import') {
      this.props.pmImport(
        this.state.currentAccount.accountId,
        this.state.property,
        this.state.currentAccount.username
      )
    }

    if (this.state.confirmationType === 'update') {
      this.props.pmImportUpdate(
        this.state.currentAccount.accountId,
        this.state.property,
        this.state.currentAccount.username
      )
    }

    if (this.state.confirmationType === 'link') {
      this.props.linkToBuildeeBuilding(
        this.state.currentAccount.accountId,
        this.state.property.id,
        this.state.buildingLink
      )
    }

    this.setState({ showConfirmation: false, checkbox: false })
  }

  handleCheckbox = () =>
    this.setState(prevState => ({ checkbox: !prevState.checkbox }))
  selectBuildingLink = e => this.setState({ buildingLink: e.target.value })
  cancelConfirmation = () =>
    this.setState({
      showConfirmation: false,
      property: false,
      currentAccount: {},
      checkbox: false
    })

  render() {
    return (
      <div className={styles.portfolioImport}>
        {this.state.showConfirmation && (
          <div className={styles.portfolioImportDetail}>
            {this.state.confirmationType !== 'link' && (
              <div>
                <div className={styles.portfolioImportConfirmation}>
                  <h3>
                    <span>{this.state.confirmationType}</span>
                    {this.state.property
                      ? ' ' + this.state.property.hint + ' from '
                      : ' All '}
                    {this.state.currentAccount.username}
                    {!this.state.property ? ' buildings?' : '?'}
                  </h3>

                  {!this.state.property && (
                    <p>
                      This action will {this.state.confirmationType}
                      {this.state.confirmationType === 'update'
                        ? ' all buildings previously imported to reflect data in the Portfolio Manager account. Meters and data added independently will not be updated nor deleted.'
                        : ' all shared buildings from the ' +
                          this.state.currentAccount.username +
                          ' account that were not previously added.'}
                    </p>
                  )}
                  {this.state.property && (
                    <p>
                      This action will {this.state.confirmationType}{' '}
                      {this.state.property.hint} from the{' '}
                      {this.state.currentAccount.username} account including
                      property details, building use, and meters.{' '}
                      {this.state.confirmationType === 'update'
                        ? 'Meters and data added independently will not be updated nor deleted.'
                        : ''}
                    </p>
                  )}

                  <div
                    className={styles.portfolioImportConfirmationAction}
                    onClick={this.handleCheckbox}
                  >
                    <input type="checkbox" checked={this.state.checkbox} />

                    {!this.state.property && (
                      <p>
                        Yes, I want to {this.state.confirmationType} all
                        buildings
                        {this.state.confirmationType === 'update'
                          ? ' shared with me from ' +
                            this.state.currentAccount.username +
                            '.'
                          : ' to reflect the Portfolio Manager account.'}
                      </p>
                    )}

                    {this.state.property && (
                      <p>
                        Yes, I want to {this.state.confirmationType}{' '}
                        {this.state.property.hint} from{' '}
                        {this.state.currentAccount.username}
                      </p>
                    )}
                  </div>
                </div>

                <div className={styles.panelActions}>
                  <button
                    onClick={this.cancelConfirmation}
                    className={classNames(
                      styles.button,
                      styles.buttonSecondary
                    )}
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
            {this.state.confirmationType === 'link' && (
              <div>
                <div className={styles.portfolioImportConfirmation}>
                  <h3>Link {this.state.property.hint} to a buildee building</h3>
                  <div className={styles.selectContainer}>
                    <select
                      value={this.state.buildingLink}
                      onChange={e => this.selectBuildingLink(e)}
                    >
                      <option value="" defaultValue disabled>
                        Select buildee Building
                      </option>
                      {this.props.buildingList.map((building, index) => (
                        <option key={index} value={building._id}>
                          {building.info.buildingName}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className={styles.panelActions}>
                  <button
                    onClick={this.cancelConfirmation}
                    className={classNames(
                      styles.button,
                      styles.buttonSecondary
                    )}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={this.confirm}
                    disabled={!this.state.buildingLink}
                    className={classNames(
                      styles.button,
                      styles.buttonPrimary,
                      !this.state.buildingLink ? styles.buttonDisable : ''
                    )}
                  >
                    {this.state.confirmationType}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
        {!this.state.showConfirmation && (
          <div className={styles.portfolioImportDetail}>
            {(!this.props.connectedAccounts ||
              this.props.connectedAccounts.length === 0) && (
              <div className={styles.panelContent}>
                <p>You do not have any currently connected accounts</p>
              </div>
            )}

            {this.props.connectedAccounts &&
              this.props.connectedAccounts.length > 0 && (
                <div className={styles.panelContent}>
                  <h3>Your Portfolio Manager Buildings</h3>
                  {this.props.connectedAccounts.map((account, index) => {
                    return (
                      <div
                        key={index}
                        className={classNames(
                          styles.table,
                          styles.portfolioImportTable
                        )}
                      >
                        <div
                          onClick={e => {
                            e.stopPropagation()
                            this.props.toggleBuildings(index)
                          }}
                          className={classNames(
                            styles.portfolioImportDetail,
                            styles.portfolioImportSingle,
                            styles.tableHeader
                          )}
                        >
                          <p
                            className={classNames(
                              styles.tableRowItem,
                              styles.portfolioImportName
                            )}
                          >
                            <span>{account.username}</span>
                            {account.email}
                          </p>

                          {(!this.props.toggleActive ||
                            this.props.toggleIndex !== index) && (
                            <div
                              className={classNames(
                                styles.tableRowItem,
                                styles.portfolioImportColLast
                              )}
                              onClick={e => {
                                e.stopPropagation()
                                this.props.toggleBuildings(index)
                              }}
                            >
                              <i className="material-icons">arrow_drop_down</i>
                              Show Buildings
                            </div>
                          )}

                          {this.props.toggleActive &&
                            this.props.toggleIndex === index && (
                              <div
                                className={classNames(
                                  styles.tableRowItem,
                                  styles.portfolioImportColLast
                                )}
                                onClick={e => {
                                  e.stopPropagation()
                                  this.props.toggleBuildings(index)
                                }}
                              >
                                <i className="material-icons">arrow_drop_up</i>
                                Hide Buildings
                              </div>
                            )}
                        </div>

                        {this.props.toggleActive &&
                          this.props.toggleIndex === index &&
                          this.state.updatedPropertiesList.length === 0 &&
                          !this.props.loading && (
                            <div className={styles.tableRow}>
                              <p>
                                No properties from this Portfolio Manager
                                account have been shared.
                              </p>
                            </div>
                          )}

                        {this.props.toggleActive &&
                          this.props.toggleIndex === index &&
                          this.state.updatedPropertiesList.length === 0 &&
                          this.props.loading && (
                            <div className={styles.tableRow}>
                              <Loader size="button" />
                              <span
                                className={styles.portfolioImportLoadingText}
                              >
                                Loading
                              </span>
                            </div>
                          )}

                        {this.props.toggleActive &&
                          this.props.toggleIndex === index &&
                          this.state.updatedPropertiesList.length > 0 && (
                            <div>
                              {this.props.estimatedTime === 0 && (
                                <div className={styles.portfolioImportAll}>
                                  {this.state.updatedPropertiesList.filter(
                                    property => !property.sync
                                  ).length > 0 && (
                                    <p
                                      onClick={() =>
                                        this.handleClickAction(
                                          this.props.connectedAccounts[index],
                                          'import',
                                          null
                                        )
                                      }
                                    >
                                      Import All
                                    </p>
                                  )}
                                  <p
                                    onClick={() =>
                                      this.handleClickAction(
                                        this.props.connectedAccounts[index],
                                        'update',
                                        null
                                      )
                                    }
                                  >
                                    Update All
                                  </p>
                                </div>
                              )}

                              {this.props.estimatedTime !== 0 && (
                                <div className={styles.portfolioImportAll}>
                                  <p>
                                    Estimated wait: {this.props.estimatedTime}{' '}
                                    seconds
                                  </p>
                                </div>
                              )}

                              {this.state.updatedPropertiesList.map(
                                (property, secondIndex) => {
                                  return (
                                    <div
                                      key={secondIndex}
                                      className={styles.tableRow}
                                    >
                                      {property.sync && (
                                        <p
                                          onClick={() =>
                                            this.props.goToBuilding(
                                              property.buildingId
                                            )
                                          }
                                          className={classNames(
                                            styles.tableRowItem,
                                            styles.portfolioImportPointer
                                          )}
                                        >
                                          {property.hint} | {property.id}
                                        </p>
                                      )}
                                      {!property.sync && (
                                        <span>
                                          <p className={styles.tableRowItem}>
                                            {property.hint}
                                          </p>
                                        </span>
                                      )}
                                      {!(
                                        this.props.loading &&
                                        !this.state.property
                                      ) && (
                                        <div
                                          className={classNames(
                                            styles.tableRowItem,
                                            styles.portfolioImportColLast,
                                            styles.portfolioImportPointer
                                          )}
                                        >
                                          {!property.sync &&
                                            !this.props.loadingIndexes.includes(
                                              secondIndex
                                            ) && (
                                              <span>
                                                <i
                                                  onClick={() =>
                                                    this.handleClickAction(
                                                      this.props
                                                        .connectedAccounts[
                                                        index
                                                      ],
                                                      'import',
                                                      property
                                                    )
                                                  }
                                                  className="material-icons"
                                                >
                                                  add_circle
                                                </i>
                                                <i
                                                  onClick={() =>
                                                    this.handleClickAction(
                                                      this.props
                                                        .connectedAccounts[
                                                        index
                                                      ],
                                                      'link',
                                                      property
                                                    )
                                                  }
                                                  className="material-icons"
                                                >
                                                  link
                                                </i>
                                              </span>
                                            )}
                                          {property.sync &&
                                            !this.props.loadingIndexes.includes(
                                              secondIndex
                                            ) && (
                                              <i
                                                onClick={() =>
                                                  this.handleClickAction(
                                                    this.props
                                                      .connectedAccounts[index],
                                                    'update',
                                                    property
                                                  )
                                                }
                                                className="material-icons"
                                              >
                                                sync
                                              </i>
                                            )}
                                          {this.props.loadingIndexes.includes(
                                            secondIndex
                                          ) &&
                                            this.props.loading && (
                                              <Loader size="button" />
                                            )}
                                        </div>
                                      )}
                                      {!this.props.loading &&
                                        property.message &&
                                        property.message.length > 0 && (
                                          <div
                                            className={classNames(
                                              styles.tableRowItem,
                                              styles.portfolioImportMessage
                                            )}
                                          >
                                            {property.message.map(
                                              (message, index) => {
                                                const isText =
                                                  typeof message === 'string'
                                                const text = isText
                                                  ? message
                                                  : message.text
                                                const messageType = isText
                                                  ? 'success'
                                                  : message.type
                                                const link = isText
                                                  ? null
                                                  : message.link
                                                return (
                                                  <p
                                                    key={index}
                                                    className={
                                                      styles[
                                                        `message_${messageType}`
                                                      ]
                                                    }
                                                  >
                                                    {text}
                                                    <br />
                                                    {link && (
                                                      <a
                                                        href={link}
                                                        target="_blank"
                                                      >
                                                        More Details
                                                      </a>
                                                    )}
                                                  </p>
                                                )
                                              }
                                            )}
                                          </div>
                                        )}
                                    </div>
                                  )
                                }
                              )}
                            </div>
                          )}
                      </div>
                    )
                  })}
                </div>
              )}
          </div>
        )}
      </div>
    )
  }
}

export default PortfolioImport
