import React from 'react'
import classNames from 'classnames'
import AllOrganizationManagement from './AllOrganizationManage'
import AllOrganizationUserManage from './AllOrganizationUserManage'

import styles from './index.scss'

const OrganizationAllManage = props => {
  const activeTab = props.params?.tab || 'all'
  const organizationId = props.params.organizationId || 'all'

  const renderContent = () => {
    if (activeTab === 'users')
      return <AllOrganizationUserManage organizationId={organizationId} />
    return <AllOrganizationManagement organizationId={organizationId} />
  }
  return <div className={classNames(styles.container)}>{renderContent()}</div>
}

export default OrganizationAllManage
