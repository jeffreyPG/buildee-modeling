import { ApolloClient } from 'apollo-client'
import {
  InMemoryCache,
  IntrospectionFragmentMatcher
} from 'apollo-cache-inmemory'
import { HttpLink } from 'apollo-link-http'
import { onError } from 'apollo-link-error'
import { ApolloLink } from 'apollo-link'
import { setContext } from 'apollo-link-context'

import introspectionQueryResultData from './graphql/fragmentTypes.json'
import { createDigest } from './Utils'
import ApiClient from './ApiClient'

const fragmentMatcher = new IntrospectionFragmentMatcher({
  introspectionQueryResultData
})

const SERVER_HOST = process.env.GQL_HOST || 'http://localhost/api'
const SERVER_PATH = 'graphql'
const SERVER_URL = `${SERVER_HOST}/${SERVER_PATH}`

const authLink = setContext(async (_, { headers }) => {
  // get the authentication token from local storage if it exists
  const token = await ApiClient.getAccessTokenSilently()

  // return the headers to the context so httpLink can read them
  return {
    headers: {
      ...headers,
      Authorization: token ? `Bearer ${token}` : ''
    }
  }
})

const client = new ApolloClient({
  link: ApolloLink.from([
    onError(({ graphQLErrors, networkError }) => {
      if (graphQLErrors) {
        graphQLErrors.map(({ message, locations, path }) =>
          console.log(
            `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
          )
        )
      }
      if (networkError) console.log(`[Network error]: ${networkError}`)
    }),
    authLink,
    new HttpLink({
      uri: SERVER_URL,
      credentials: 'same-origin'
    })
  ]),
  cache: new InMemoryCache({ fragmentMatcher })
})

export { client }
