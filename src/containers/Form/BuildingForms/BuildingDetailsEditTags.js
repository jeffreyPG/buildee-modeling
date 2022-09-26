import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import styles from './BuildingDetailsEdit.scss'
import Autosuggest from 'react-autosuggest'

const TAG_REGEX = new RegExp('^[A-Za-z0-9 _]*[A-Za-z0-9][A-Za-z0-9 _]*$')

function escapeRegexCharacters(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function getSuggestions(value, tags) {
  const escapedValue = escapeRegexCharacters(value.trim())
  if (escapedValue === '') {
    return []
  }
  const regex = new RegExp('^' + escapedValue, 'i')
  return tags.filter(tag => regex.test(tag))
}

function getSuggestionValue(suggestion) {
  return suggestion
}

function renderSuggestion(suggestion) {
  return <span>{suggestion}</span>
}

class IdentifierAutoSelect extends React.Component {
  state = {
    value: '',
    tags: this.props.suggestions,
    suggestions: [],
    tagIsValid: false
  }

  onChange = (_, { newValue, method }) => {
    if (method === 'click' || method === 'enter') {
      if (newValue !== '' && this.state.tagIsValid) {
        this.onAddTag(newValue)
      }
    } else {
      const validated = TAG_REGEX.test(newValue)
      if (validated) {
        this.setState({
          value: newValue,
          tagIsValid: true
        })
      } else {
        this.setState({
          value: newValue,
          tagIsValid: false
        })
      }
    }
  }

  onKeyDown = e => {
    if (e.keyCode === 13 && this.state.tagIsValid) {
      e.preventDefault()
      this.onAddTag(e.target.value)
    }
  }

  onAddTag = tagValue => {
    this.props.handleAddTag(tagValue)
    this.setState({
      value: '',
      tagIsValid: false
    })
  }

  onAddTagButton = () => {
    if (this.state.value !== '' && this.state.tagIsValid) {
      this.props.handleAddTag(this.state.value)
      this.setState({
        value: '',
        tagIsValid: false
      })
    }
  }

  onSuggestionsFetchRequested = ({ value }) => {
    this.setState({
      suggestions: getSuggestions(value, this.state.tags)
    })
  }

  onSuggestionsClearRequested = () => {
    this.setState({
      suggestions: []
    })
  }

  render() {
    const { id, suggestions } = this.props
    const { value } = this.state
    const inputProps = {
      value,
      onChange: this.onChange,
      onKeyDown: this.onKeyDown,
      maxLength: 70
    }

    return (
      <div>
        <Autosuggest
          id={id}
          suggestions={suggestions}
          onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
          onSuggestionsClearRequested={this.onSuggestionsClearRequested}
          getSuggestionValue={getSuggestionValue}
          renderSuggestion={renderSuggestion}
          inputProps={inputProps}
        />
        {this.state.tagIsValid && (
          <button
            type="button"
            className={classNames(styles.button, styles.buttonPrimary)}
            onClick={this.onAddTagButton}
          >
            Add Tag
          </button>
        )}
        {!this.state.tagIsValid && (
          <button
            type="button"
            className={classNames(
              styles.button,
              styles.buttonPrimary,
              styles.buttonDisable
            )}
            disabled
          >
            Add Tag
          </button>
        )}
      </div>
    )
  }
}

export class BuildingInfoEditFormTags extends React.Component {
  static propTypes = {
    formValues: PropTypes.object.isRequired,
    getBuildingIdentifiers: PropTypes.func.isRequired,
    handleAddTag: PropTypes.func.isRequired,
    handleDeleteTag: PropTypes.func.isRequired
  }

  state = {
    loadingTags: false,
    tagSuggestions: []
  }

  componentDidMount = () => {
    const { formValues } = this.props

    this.setState({ loadingIdentifiers: true })
    this.props
      .getBuildingIdentifiers()
      .then(buildings => {
        let tagSuggestions = []

        buildings.map(building => {
          if (building.tags && building.tags.length > 0) {
            building.tags.map(tag => {
              tagSuggestions.push(tag)
            })
          }
        })

        // don't show tags that are already in formValues
        let uniqueTagSuggestions = [...new Set(tagSuggestions)]
        if (
          uniqueTagSuggestions.length > 0 &&
          this.props.formValues.tags &&
          this.props.formValues.tags.length > 0
        ) {
          this.props.formValues.tags.forEach(formValueTag => {
            let array = uniqueTagSuggestions
            let i
            for (i = array.length - 1; i >= 0; i -= 1) {
              if (array[i] === formValueTag) {
                array.splice(i, 1)
              }
            }
          })
        }

        this.setState({
          loadingIdentifiers: false,
          tagSuggestions: uniqueTagSuggestions
        })
      })
      .catch(() => {
        this.setState({ loadingIdentifiers: false })
      })
  }

  render() {
    return (
      <div className={styles.detail}>
        <label>Tags</label>
        <div className={styles.autosuggestTags}>
          {this.props.formValues.tags && this.props.formValues.tags.length > 0 && (
            <div className={styles.tags}>
              {this.props.formValues.tags.map((tag, index) => {
                return (
                  <div
                    className={classNames(styles.tag, styles.tagEditing)}
                    key={index}
                  >
                    <small>
                      {tag}
                      <span onClick={() => this.props.handleDeleteTag(index)}>
                        <i className="material-icons">close</i>
                      </span>
                    </small>
                  </div>
                )
              })}
            </div>
          )}
          <IdentifierAutoSelect
            id="tags"
            label="Tags"
            handleAddTag={this.props.handleAddTag}
            suggestions={this.state.tagSuggestions}
          />
        </div>
      </div>
    )
  }
}

export default BuildingInfoEditFormTags
