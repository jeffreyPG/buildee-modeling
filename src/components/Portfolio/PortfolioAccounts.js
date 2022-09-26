import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router'
import styles from './PortfolioAccounts.scss'
import classNames from 'classnames'
import { Loader } from 'utils/Loader'

import { AddAccount } from './'

export class PortfolioAccounts extends React.Component {
  static propTypes = {
    addingAccount: PropTypes.bool.isRequired,
    handleConnectNewAccount: PropTypes.func.isRequired,
    connectedAccounts: PropTypes.array.isRequired,
    push: PropTypes.func.isRequired,
    portfolioAddAccount: PropTypes.func.isRequired,
    deleteConnection: PropTypes.func.isRequired
  }

  state = {}

  render() {
    return (
      <div className={styles.portfolioAccounts}>
        <div className={styles.portfolioAccountsHeading}>
          <button
            className={classNames(styles.button, styles.buttonPrimary)}
            onClick={() => {
              this.props.handleConnectNewAccount()
              if (!this.props.addingAccount)
                this.props.push('/portfolio/connect')
              else this.props.push('/portfolio')
            }}
          >
            <i className="material-icons">add</i>
            <span>Connect New Account</span>
          </button>
        </div>

        {!this.props.addingAccount && (
          <div className={styles.portfolioAccountsDetail}>
            {(!this.props.connectedAccounts ||
              this.props.connectedAccounts.length === 0) && (
              <div className={styles.empty}>
                <div className={styles.emptyBody}>
                  <div className={styles.emptyBodyTitle}>
                    Connect an ENERGY STAR Portfolio Manager Account
                  </div>
                  <div className={styles.emptyBodyDescription}>
                    Kick start your efforts with a data import or export data to
                    drive certification.
                  </div>
                </div>
              </div>
            )}

            {this.props.connectedAccounts &&
              this.props.connectedAccounts.length > 0 && (
                <div className={styles.panelContent}>
                  <h3>Connected Accounts</h3>
                  {this.props.connectedAccounts.map((account, index) => {
                    return (
                      <div
                        key={index}
                        className={classNames(
                          styles.table,
                          styles.portfolioAccountsTable
                        )}
                      >
                        <div
                          className={classNames(
                            styles.portfolioAccountsDetail,
                            styles.portfolioAccountsSingle,
                            styles.tableHeader
                          )}
                        >
                          <p
                            className={classNames(
                              styles.tableRowItem,
                              styles.portfolioAccountsName
                            )}
                          >
                            <span>{account.username}</span>
                            {account.email}
                          </p>

                          <div
                            className={classNames(
                              styles.tableRowItem,
                              styles.portfolioAccountsColLast
                            )}
                            onClick={() => this.props.deleteConnection(index)}
                          >
                            <i className="material-icons">delete_forever</i>
                            Remove Connection
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
          </div>
        )}

        {this.props.addingAccount && (
          <AddAccount
            cancelForm={this.props.handleConnectNewAccount}
            push={this.props.push}
            portfolioAddAccount={this.props.portfolioAddAccount}
          />
        )}
      </div>
    )
  }
}

export default PortfolioAccounts
