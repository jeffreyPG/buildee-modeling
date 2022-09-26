import React from 'react'
import PropTypes from 'prop-types'
import { Query } from 'react-apollo'

import config from './config'
import { FEATURE } from '../graphql/queries/feature'

const Feature = ({ name = '', children }) => {
  return (
    <Query query={FEATURE} variables={{ feature: { name } }}>
      {({ loading, error, data }) => {
        let renderProps = {
          loading,
          error,
          enabled: false
        }

        if (!data && !config[name]) {
          return children({ ...renderProps })
        }

        const hasFeature =
          (data.feature && data.feature.enabled === true) ||
          config[name] === true

        return children({ ...renderProps, enabled: hasFeature })
      }}
    </Query>
  )
}
Feature.propTypes = {
  children: PropTypes.func.isRequired,
  name: PropTypes.string
}

export default Feature
