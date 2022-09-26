import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import Autosuggest from 'react-autosuggest'
import styles from './AssetAutoSuggest.scss'
import { Query } from 'react-apollo'
import { SEARCH_EQUIPMENT } from '../../utils/graphql/queries/equipment'

export class AssetAutoSuggest extends React.Component {
  constructor(props) {
    super(props)
    this.autosuggest = null
  }

  static propTypes = {
    application: PropTypes.string,
    buildingId: PropTypes.string,
    organization: PropTypes.string,
    disabled: PropTypes.bool,
    initialValue: PropTypes.string,
    name: PropTypes.string,
    onChange: PropTypes.func,
    onClear: PropTypes.func,
    onSelected: PropTypes.func,
    placeholder: PropTypes.string,
    technology: PropTypes.string,
    category: PropTypes.string,
    onNotFound: PropTypes.func,
    recentEquipment: PropTypes.array
  }

  static defaultProps = {
    recentEquipment: []
  }

  state = {
    suggestions: [],
    value: this.props.initialValue || '',
    selected: null
  }

  handleChanged = (event, { newValue }) => {
    this.setState({ value: newValue })
    this.props.onChange(newValue)
  }

  onSuggestionsFetchRequested = async ({ value, searchQuery }) => {
    const { data } = await searchQuery()
    const suggestions = this.getSuggestions(value, {
      recentBuildingEquipment: data.recentBuildingEquipment,
      equipment: data.searchEquipment
    })
    this.props.onNotFound(suggestions)
    this.setState({ suggestions })
  }

  onSuggestionsClearRequested = () => this.setState({ suggestions: [] })

  onSuggestionSelected = (event, { suggestion }) => {
    this.setState({ selected: suggestion })
    this.props.onSelected(suggestion)
    this.autosuggest.input.setAttribute('disabled', 'disabled')
  }

  handleClearSelection = () => {
    this.setState({ selected: null, value: '' })
    this.props.onClear()
    this.autosuggest.input.removeAttribute('disabled')
    this.autosuggest.input.focus()
  }

  getSuggestions = (value, { recentBuildingEquipment, equipment }) => {
    if (!value) {
      return this.props.recentEquipment
    }

    return equipment
  }

  getSuggestionValue = suggestion => {
    return suggestion.name
  }

  renderSuggestion = suggestion => {
    return suggestion.name
  }

  render() {
    const {
      application,
      buildingId,
      organization,
      category,
      disabled,
      name,
      placeholder,
      technology
    } = this.props
    const { suggestions, value } = this.state

    const inputProps = {
      disabled,
      name,
      onChange: this.handleChanged,
      placeholder,
      value,
      'data-test': 'equipment-search-input'
    }

    return (
      <Query
        query={SEARCH_EQUIPMENT}
        variables={{
          buildingId,
          equipment: { application, category, technology, organization },
          // we search for results with a manual client query to prevent re-renders of the input
          search: { value: '', size: 10 }
        }}
      >
        {({ loading, error, data, client }) => {
          if (loading || error) return null
          return (
            <div className={styles.container}>
              <Autosuggest
                ref={ref => (this.autosuggest = ref)}
                focusInputOnSuggestionClick={false}
                getSuggestionValue={this.getSuggestionValue}
                inputProps={inputProps}
                onSuggestionsFetchRequested={({ value }) =>
                  this.onSuggestionsFetchRequested({
                    searchQuery: () =>
                      client.query({
                        query: SEARCH_EQUIPMENT,
                        variables: {
                          buildingId,
                          equipment: {
                            application,
                            category,
                            technology,
                            organization
                          },
                          search: { value, size: 10 }
                        }
                      }),
                    value
                  })
                }
                onSuggestionsClearRequested={this.onSuggestionsClearRequested}
                onSuggestionSelected={this.onSuggestionSelected}
                renderSuggestion={this.renderSuggestion}
                renderInputComponent={inputProps => (
                  <div>
                    <input {...inputProps} />
                    {this.state.selected && (
                      <i
                        className={classNames(styles.icon, 'material-icons')}
                        onClick={this.handleClearSelection}
                      >
                        close
                      </i>
                    )}
                  </div>
                )}
                shouldRenderSuggestions={() => true}
                suggestions={suggestions}
                id="asset-autosuggest"
              />
            </div>
          )
        }}
      </Query>
    )
  }
}

export default AssetAutoSuggest
