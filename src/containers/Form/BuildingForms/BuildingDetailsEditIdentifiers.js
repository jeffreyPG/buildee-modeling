import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import styles from './BuildingDetailsEdit.scss'
import Autosuggest from 'react-autosuggest'
import industryTypes from 'static/building-industry-types'

function escapeRegexCharacters(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function getSuggestions(value, suggestions) {
  const escapedValue = escapeRegexCharacters(value.trim())
  if (escapedValue === '') {
    return []
  }
  const regex = new RegExp('^' + escapedValue, 'i')
  return suggestions.filter(suggestion => regex.test(suggestion))
}

function getSuggestionValue(suggestion) {
  return suggestion
}

function renderSuggestion(suggestion) {
  return <span>{suggestion}</span>
}

class IdentifierAutoSelect extends React.Component {
  state = {
    value: this.props.value,
    suggestions: this.props.suggestions
  }

  onChange = (_, { newValue }) => {
    const { id, onChange } = this.props

    this.setState({
      value: newValue
    })

    onChange(id, newValue)
  }

  onSuggestionsFetchRequested = ({ value }) => {
    this.setState({
      suggestions: getSuggestions(value, this.state.suggestions)
    })
  }

  onSuggestionsClearRequested = () => {
    this.setState({
      suggestions: []
    })
  }

  componentDidUpdate = prevProps => {
    if (prevProps.value !== this.props.value) {
      this.setState({ value: this.props.value })
    }
  }

  render() {
    const { id, placeholder, suggestions, label } = this.props
    const { value } = this.state
    const inputProps = {
      placeholder,
      value,
      onChange: this.onChange
    }

    return (
      <div className={styles.detail}>
        <label htmlFor={id}>{label}</label>
        <Autosuggest
          id={id}
          suggestions={suggestions}
          onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
          onSuggestionsClearRequested={this.onSuggestionsClearRequested}
          getSuggestionValue={getSuggestionValue}
          renderSuggestion={renderSuggestion}
          inputProps={inputProps}
        />
      </div>
    )
  }
}

export class BuildingInfoEditFormIdentifiers extends React.Component {
  static propTypes = {
    formValues: PropTypes.object.isRequired,
    handleInputClientNameChange: PropTypes.func.isRequired,
    handleInputSiteNameChange: PropTypes.func.isRequired,
    handleInputClientIndustryChange: PropTypes.func.isRequired,
    getBuildingIdentifiers: PropTypes.func.isRequired
  }

  state = {
    loadingIdentifiers: false,
    clientNameSuggestions: [],
    siteNameSuggestions: []
  }

  componentDidMount = () => {
    this.setState({ loadingIdentifiers: true })
    this.props
      .getBuildingIdentifiers()
      .then(buildings => {
        let clientNameSuggestions = []
        let siteNameSuggestions = []

        buildings.map(building => {
          if (building.clientName) {
            clientNameSuggestions.push(building.clientName)
          }
          if (building.siteName) {
            siteNameSuggestions.push(building.siteName)
          }
        })

        this.setState({
          loadingIdentifiers: false,
          clientNameSuggestions: [...new Set(clientNameSuggestions)],
          siteNameSuggestions: [...new Set(siteNameSuggestions)]
        })
      })
      .catch(() => {
        this.setState({ loadingIdentifiers: false })
      })
  }

  onChange = (id, newValue) => {
    if (id === 'clientName') {
      this.props.handleInputClientNameChange(newValue)
    } else if (id === 'siteName') {
      this.props.handleInputSiteNameChange(newValue)
    }
  }

  onClientIndustryChange = event => {
    const value = event.target.value
    this.props.handleInputClientIndustryChange(value)
  }

  render() {
    return (
      <div>
        <IdentifierAutoSelect
          id="clientName"
          label="Client Name"
          value={this.props.formValues.clientName}
          onChange={this.onChange}
          suggestions={this.state.clientNameSuggestions}
        />
        <div className={classNames(styles.detail, styles.detailMarginSmall)}>
          <label htmlFor="clientIndustry">Client Industry</label>
          <div className={styles.customFieldsInputs}>
            <div className={styles.customFieldsSingle}>
              <div className={styles.selectContainer}>
                <select
                  value={this.props.formValues.clientIndustry || ''}
                  name="clientIndustry"
                  className={classNames(
                    this.props.formValues.clientIndustry === ''
                      ? styles.selectPlaceholder
                      : ''
                  )}
                  onChange={this.onClientIndustryChange}
                  required
                >
                  <option value="" disabled>
                    Select an industry
                  </option>
                  {industryTypes.map(({ name, value }, index) => {
                    return (
                      <option key={index} value={value}>
                        {name}
                      </option>
                    )
                  })}
                </select>
              </div>
            </div>
          </div>
        </div>
        <IdentifierAutoSelect
          id="siteName"
          label="Site Name"
          value={this.props.formValues.siteName}
          onChange={this.onChange}
          suggestions={this.state.siteNameSuggestions}
        />
      </div>
    )
  }
}

export default BuildingInfoEditFormIdentifiers
