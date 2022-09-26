import React from 'react'
import { ApolloProvider } from 'react-apollo'
import { Router } from 'react-router'
import { Provider } from 'react-redux'
import PropTypes from 'prop-types'
import { Auth0Provider } from '@auth0/auth0-react'
import 'autotrack/lib/plugins/url-change-tracker'
import { login } from '../routes/Login/modules/login'
import { client } from '../utils/ApolloClient'
import projectConfig from '../../project.config'
import Auth0ApiClient from './Auth0ApiClient'

class App extends React.Component {
  static propTypes = {
    store: PropTypes.object.isRequired,
    routes: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired
  }

  componentDidMount() {
    if (projectConfig.gaTrackingId !== null) {
      console.log('initializing analytics', ga)
      console.log(projectConfig.gaTrackingId)
      ga('create', projectConfig.gaTrackingId, 'auto')
      ga('require', 'urlChangeTracker')
      ga('send', 'pageview')
    }
  }

  onRedirectCallback = (redirectOptions = {}) => {
    const { returnTo } = redirectOptions
    this.props.store.dispatch(login(returnTo))
  }

  render() {
    return (
      <Auth0Provider
        domain={projectConfig.auth0.domain}
        clientId={projectConfig.auth0.clientId}
        redirectUri={window.location.origin}
        audience={projectConfig.auth0.audience}
        scope={projectConfig.auth0.scope}
        onRedirectCallback={this.onRedirectCallback}
      >
        <Auth0ApiClient />
        <ApolloProvider client={client}>
          <Provider store={this.props.store}>
            <div style={{ height: '100%' }}>
              <Router
                history={this.props.history}
                children={this.props.routes}
              />
            </div>
          </Provider>
        </ApolloProvider>
      </Auth0Provider>
    )
  }
}

export default App
