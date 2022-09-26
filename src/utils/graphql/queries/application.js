import gql from 'graphql-tag'

export const GET_APPLICATIONS = gql`
  query applications {
    applications {
      value
      displayName
    }
  }
`
