import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router'
import styles from './Dashboard.scss'
import classNames from 'classnames'

export class Dashboard extends React.Component {
  static propTypes = {
    user: PropTypes.object.isRequired,
    organizationList: PropTypes.array.isRequired,
    getOrganizations: PropTypes.func.isRequired
  }

  UNSAFE_componentWillMount = () => {
    // this.props.push(
    //   '/organization/' + this.props.organizationList[1]._id + '/building'
    // )
  }

  componentDidMount = () => {
    this.props.getOrganizations()
  }

  handleClickOpenOrganization = (id, page) => {
    this.props.push('/organization/' + id + '/' + page)
  }

  render() {
    const { user, organizationList } = this.props

    return (
      <div className={styles['dashboard']}>
        <div className={styles.container}>
          {organizationList && organizationList.length > 0 && (
            <div className={styles['dashboard__orgs']}>
              {organizationList.map(organization => {
                return (
                  <div
                    key={organization._id}
                    className={styles['dashboard__org']}
                  >
                    <div className={styles['dashboard__org--heading']}>
                      {!organization.organizationImage && (
                        <div
                          className={classNames(
                            styles['dashboard__org--image'],
                            styles['dashboard__org--icon']
                          )}
                        >
                          <i className="material-icons">grain</i>
                        </div>
                      )}
                      {organization.organizationImage && (
                        <div
                          className={classNames(
                            styles['dashboard__org--image'],
                            styles['dashboard__org--photo']
                          )}
                        >
                          <img src={organization.organizationImage} />
                        </div>
                      )}
                      <div className={styles['dashboard__org--title']}>
                        <p>{organization.name}</p>
                      </div>
                    </div>

                    <div className={styles['dashboard__org--ctas']}>
                      <div
                        className={styles['dashboard__org--cta']}
                        onClick={() =>
                          this.handleClickOpenOrganization(
                            organization._id,
                            'building'
                          )
                        }
                      >
                        <i className="material-icons">domain</i>
                        <small>Buildings</small>
                      </div>
                      <div
                        className={styles['dashboard__org--cta']}
                        onClick={() =>
                          this.handleClickOpenOrganization(
                            organization._id,
                            'template'
                          )
                        }
                      >
                        <i className="material-icons">insert_drive_file</i>
                        <small>Reports</small>
                      </div>
                      <div
                        className={styles['dashboard__org--cta']}
                        onClick={() =>
                          this.handleClickOpenOrganization(
                            organization._id,
                            'manage'
                          )
                        }
                      >
                        <i className="material-icons">settings</i>
                        <small>Manage</small>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    )
  }
}

export default Dashboard
