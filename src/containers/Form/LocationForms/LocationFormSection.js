import React from 'react'
import PropTypes from 'prop-types'
import { Query } from 'react-apollo'
import AutoSuggest from '../../../components/UI/AutoSuggest'
import TagList from '../../../components/UI/TagList'
import { FormSection } from '../FormFields'

import { GET_BUILDING_LOCATIONS } from '../../../utils/graphql/queries/location'

const LocationFormSection = ({
  buildingId,
  locations,
  onAdd,
  onUpdate,
  notForm = false
}) => (
  <Query
    query={GET_BUILDING_LOCATIONS}
    variables={{
      id: buildingId
    }}
    skip={!buildingId}
  >
    {({ loading, error, data }) => {
      if (loading || error || !buildingId) return null
      const buildingLocations =
        (data.building &&
          data.building.locations.map(
            buildingLocation => buildingLocation.location
          )) ||
        []

      if (notForm) {
        return (
          <div>
            <TagList
              values={buildingLocations.filter(location =>
                locations.includes((location && location._id) || '')
              )}
              getDisplayValue={location => location.name}
              onDelete={deletedLocation => {
                const nextLocations = locations.filter(
                  location => deletedLocation._id !== location
                )
                onUpdate(nextLocations)
              }}
            />
            <AutoSuggest
              name="location"
              dontDisable
              values={buildingLocations.filter(
                location =>
                  !locations.includes((location && location._id) || '')
              )}
              getSuggestionValue={location => location.name}
              onAdd={onAdd}
              renderSuggestion={s => (
                <span data-test="location-suggestion">{s.name}</span>
              )}
            />
          </div>
        )
      }

      return (
        <FormSection
          title="Locations"
          description="Add locations this project applies to such as exterior, offices or a room number."
        >
          <TagList
            values={buildingLocations.filter(location =>
              locations.includes((location && location._id) || '')
            )}
            getDisplayValue={location => location.name}
            onDelete={deletedLocation => {
              const nextLocations = locations.filter(
                location => deletedLocation._id !== location
              )
              onUpdate(nextLocations)
            }}
          />
          <AutoSuggest
            name="location"
            dontDisable
            values={buildingLocations.filter(
              location => !locations.includes((location && location._id) || '')
            )}
            getSuggestionValue={location => location.name}
            onAdd={onAdd}
            renderSuggestion={s => (
              <span data-test="location-suggestion">{s.name}</span>
            )}
          />
        </FormSection>
      )
    }}
  </Query>
)

LocationFormSection.propTypes = {
  buildingId: PropTypes.string.isRequired,
  locations: PropTypes.arrayOf(PropTypes.string).isRequired,
  onAdd: PropTypes.func.isRequired,
  onUpdate: PropTypes.func.isRequired
}

export { LocationFormSection }
