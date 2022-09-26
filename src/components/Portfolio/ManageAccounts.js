import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router'
import styles from './ManageAccounts.scss'
import classNames from 'classnames'

export class ManageAccounts extends React.Component {
  static propTypes = {
    accounts: PropTypes.array.isRequired
  }

  state = {}

  render() {
    console.log('accounts: ', this.props.accounts)

    return (
      <div>
        <h1>accounts</h1>
      </div>
    )
  }
}

export default ManageAccounts
