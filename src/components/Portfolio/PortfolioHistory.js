import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router'
import styles from './PortfolioHistory.scss'
import classNames from 'classnames'

import { AddAccount } from './'

export class PortfolioHistory extends React.Component {
  static propTypes = {
    organizationView: PropTypes.object.isRequired
  }

  state = {
    toggledType: '',
    toggledIndex: 0
  }

  toggleLogs = function(i, type) {
    if (this.state.toggledType === type && this.state.toggledIndex === i) {
      this.setState({ toggledType: '' })
    } else {
      this.setState({ toggledType: type, toggledIndex: i })
    }
  }

  render() {
    return (
      <div className={styles.portfolioHistory}>
        <div className={styles.portfolioHistoryDetail}>
          <div className={styles.panelContent}>
            <h3>Your Portfolio Manager History</h3>

            <div
              className={classNames(styles.table, styles.portfolioHistoryTable)}
            >
              <div
                className={classNames(
                  styles.portfolioHistoryDetail,
                  styles.tableHeader
                )}
              >
                <p
                  className={classNames(
                    styles.tableRowItem,
                    styles.portfolioHistoryName
                  )}
                >
                  <span>Recent Imports</span>
                </p>
              </div>

              {this.props.organizationView.portfolioSyncHistory.import.map(
                (instance, i) => {
                  var d = new Date(instance.date)
                  var timestamp =
                    [d.getMonth() + 1, d.getDate(), d.getFullYear()].join('/') +
                    ' ' +
                    [d.getHours(), d.getMinutes()].join(':')

                  return (
                    <div key={i}>
                      <div
                        className={classNames(
                          styles.tableRow,
                          styles.portfolioHistoryLog
                        )}
                        onClick={e => {
                          e.stopPropagation()
                          this.toggleLogs(i, 'import')
                        }}
                      >
                        <div
                          className={classNames(
                            styles.tableRowItem,
                            styles.portfolioHistoryName
                          )}
                        >
                          <p>
                            {timestamp} <span>by: {instance.user.name}</span>
                          </p>
                        </div>

                        <div
                          className={classNames(
                            styles.tableRowItem,
                            styles.portfolioHistoryColLast
                          )}
                        >
                          {this.state.toggledType === 'import' &&
                            this.state.toggledIndex === i && (
                              <p>
                                <i className="material-icons">arrow_drop_up</i>
                                Hide Logs
                              </p>
                            )}
                          {(this.state.toggledType !== 'import' ||
                            this.state.toggledIndex !== i) && (
                            <p>
                              <i className="material-icons">arrow_drop_down</i>
                              Show Logs
                            </p>
                          )}
                        </div>
                      </div>
                      {this.state.toggledType === 'import' &&
                        this.state.toggledIndex === i && (
                          <div className={styles.portfolioHistoryItem}>
                            {instance.log.map((log, index) => {
                              return (
                                <div key={index} className={styles.tableRow}>
                                  <div
                                    className={classNames(
                                      styles.tableRowItem,
                                      styles.portfolioHistoryName
                                    )}
                                  >
                                    <p>
                                      Imported {log.buildingName} from{' '}
                                      {log.username}
                                    </p>
                                    {log.message.map((mess, otherI) => {
                                      return (
                                        <p
                                          key={otherI}
                                          className={
                                            styles.portfolioHistoryMessage
                                          }
                                        >
                                          {mess}
                                        </p>
                                      )
                                    })}
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        )}
                    </div>
                  )
                }
              )}
            </div>

            <div
              className={classNames(styles.table, styles.portfolioHistoryTable)}
            >
              <div
                className={classNames(
                  styles.portfolioHistoryDetail,
                  styles.tableHeader
                )}
              >
                <p
                  className={classNames(
                    styles.tableRowItem,
                    styles.portfolioHistoryName
                  )}
                >
                  <span>Recent Exports</span>
                </p>
              </div>

              {this.props.organizationView.portfolioSyncHistory.export.map(
                (instance, i) => {
                  var d = new Date(instance.date)
                  var timestamp =
                    [d.getMonth() + 1, d.getDate(), d.getFullYear()].join('/') +
                    ' ' +
                    [d.getHours(), d.getMinutes()].join(':')

                  return (
                    <div key={i}>
                      <div
                        className={classNames(
                          styles.tableRow,
                          styles.portfolioHistoryLog
                        )}
                        onClick={e => {
                          e.stopPropagation()
                          this.toggleLogs(i, 'export')
                        }}
                      >
                        <div
                          className={classNames(
                            styles.tableRowItem,
                            styles.portfolioHistoryName
                          )}
                        >
                          <p>
                            {timestamp} <span>by: {instance.user.name}</span>
                          </p>
                        </div>

                        <div
                          className={classNames(
                            styles.tableRowItem,
                            styles.portfolioHistoryColLast
                          )}
                        >
                          {this.state.toggledType === 'export' &&
                            this.state.toggledIndex === i && (
                              <p>
                                <i className="material-icons">arrow_drop_up</i>
                                Hide Logs
                              </p>
                            )}
                          {(this.state.toggledType !== 'export' ||
                            this.state.toggledIndex !== i) && (
                            <p>
                              <i className="material-icons">arrow_drop_down</i>
                              Show Logs
                            </p>
                          )}
                        </div>
                      </div>
                      {this.state.toggledType === 'export' &&
                        this.state.toggledIndex === i && (
                          <div className={styles.portfolioHistoryItem}>
                            {instance.log.map((log, index) => {
                              return (
                                <div key={index} className={styles.tableRow}>
                                  <div
                                    className={classNames(
                                      styles.tableRowItem,
                                      styles.portfolioHistoryName
                                    )}
                                  >
                                    <p>
                                      Exported {log.buildingName} to{' '}
                                      {log.username}
                                    </p>
                                    {log.message.map((mess, otherI) => {
                                      return (
                                        <p
                                          key={otherI}
                                          className={
                                            styles.portfolioHistoryMessage
                                          }
                                        >
                                          {mess}
                                        </p>
                                      )
                                    })}
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        )}
                    </div>
                  )
                }
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default PortfolioHistory
