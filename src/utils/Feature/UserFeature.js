import React from 'react'
import PropTypes from 'prop-types'
import { Query } from 'react-apollo'

import { ENABLED_FEATURES } from '../graphql/queries/user'

const UserFeature = ({ name = '', children }) => {
  return (
    <Query query={ENABLED_FEATURES} fetchPolicy="cache-and-network">
      {({ loading, error, data }) => {
        let renderProps = {
          loading,
          error,
          enabled: false
        }

        if (!data) {
          return children({ ...renderProps })
        }

        const hasFeature =
          data.enabledFeatures &&
          data.enabledFeatures.some(feature => feature.name === name)

        return children({ ...renderProps, enabled: hasFeature })
      }}
    </Query>
  )
}

UserFeature.propTypes = {
  children: PropTypes.func.isRequired,
  name: PropTypes.string
}

export default UserFeature
