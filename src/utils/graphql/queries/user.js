import gql from 'graphql-tag'

export const ENABLED_FEATURES = gql`
  query EnabledFeatures {
    enabledFeatures {
      name
    }
  }
`
