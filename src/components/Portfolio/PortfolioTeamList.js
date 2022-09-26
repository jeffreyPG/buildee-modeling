import React, { Component } from 'react'
import gql from 'graphql-tag'
import { client as apolloClient } from 'utils/ApolloClient'

import PortfolioTeam from './PortfolioTeam'

class PortfolioTeamList extends Component {
  state = {
    selectedView: '',
    options: []
  }

  componentDidMount() {
    apolloClient
      .query({
        query: gql`
          {
            enabledFeatures {
              name
            }
          }
        `
      })
      .then(({ data }) => {
        this.getToggleOptions(data.enabledFeatures)
      })
  }

  getToggleOptions = enabledFeatures => {
    let options = []
    let isProposalEnabled =
      enabledFeatures &&
      enabledFeatures.some(feature => feature.name === 'projectProposal')
    let isProjectEnabled =
      enabledFeatures &&
      enabledFeatures.some(feature => feature.name === 'projectProject')
    let isMeasureEnabled =
      enabledFeatures &&
      enabledFeatures.some(feature => feature.name === 'buildingProjects')
    if (isMeasureEnabled) {
      options.push({
        name: 'Measures',
        value: 'Measure'
      })
    }
    if (isProposalEnabled) {
      options.push({
        name: 'Proposals',
        value: 'Proposal'
      })
    }
    if (isProjectEnabled) {
      options.push({
        name: 'Projects',
        value: 'Project'
      })
    }
    if (options.length) {
      this.setState({ options: options, selectedView: options[0].value })
    } else {
      this.setState({ options: [], selectedView: null })
    }
  }

  handleUpdateView = value => {
    this.setState({
      selectedView: value
    })
  }

  render() {
    const { options, selectedView } = this.state
    return (
      <div>
        <PortfolioTeam
          routeOrganizationId={this.props.routeOrganizationId}
          hardReload={this.props.hardReload}
          timeRange={this.props.timeRange}
          options={options}
          selectedView={selectedView}
          handleUpdateView={this.handleUpdateView}
          handleTimeRangeChange={this.props.handleTimeRangeChange}
        />
      </div>
    )
  }
}
export default PortfolioTeamList
