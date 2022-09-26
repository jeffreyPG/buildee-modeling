import gql from 'graphql-tag'

export const FEATURE = gql`
  query Feature($feature: GetFeatureInput) {
    feature(feature: $feature) {
      _id
      name
      enabled
    }
  }
`
