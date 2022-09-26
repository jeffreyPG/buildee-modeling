import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router'
import styles from './OrganizationNew.scss'
import classNames from 'classnames'
import { Loader } from 'utils/Loader'

export class OrganizationNew extends React.Component {
  static propTypes = {
    user: PropTypes.object.isRequired,
    organizationList: PropTypes.array.isRequired,
    push: PropTypes.func.isRequired,
    createOrganization: PropTypes.func.isRequired
  }

  state = {
    orgValues: {
      name: ''
    },
    error: '',
    loading: false
  }

  handleInputChange = event => {
    let tempOrgState = { ...this.state.orgValues }
    tempOrgState[event.target.name] = event.target.value
    this.setState({ orgValues: tempOrgState })
  }

  handleSubmitForm = e => {
    e.preventDefault()
    this.setState({ loading: true })
    this.props
      .createOrganization(this.state.orgValues)
      .then(() => {
        this.setState({ loading: false })
      })
      .catch(err => {
        this.setState({
          error: 'Issues creating organization. Please try again.',
          loading: false
        })
      })
  }

  render() {
    const { user, organizationList } = this.props

    return (
      <div className={styles.createOrg}>
        <div className={styles.container}>
          <h1>Create new Organization</h1>
          <form onSubmit={this.handleSubmitForm.bind(this)}>
            <label htmlFor="name">Organization Name</label>
            <input
              value={this.state.orgValues.name}
              name="name"
              type="text"
              onChange={this.handleInputChange.bind(this)}
            />
            {!this.state.loading && (
              <button
                type="submit"
                className={classNames(styles.button, styles.buttonPrimary)}
              >
                Create Organization
              </button>
            )}
            {this.state.loading && (
              <button
                className={classNames(
                  styles.button,
                  styles.buttonPrimary,
                  styles.buttonDisable
                )}
              >
                <Loader size="button" color="white" />
              </button>
            )}
          </form>
          {this.state.error !== '' && <p>{this.state.error}</p>}
        </div>
      </div>
    )
  }
}

export default OrganizationNew
