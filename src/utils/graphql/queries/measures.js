import gql from 'graphql-tag'

export const GET_MEASURE = gql`
  query measure($measure: FetchMeasureInput!) {
    measure(measure: $measure) {
      measures {
        _id
        name
        category
        project_category
        project_application
        project_technology
        applicable_building_types
        displayName
        description
        fuel
        source
        fields {
          type
          label
          name
          description
          existing
          replacement
          options {
            label
            value
          }
          firebase_input
        }
        incentive {
          input_units
          input_map
          unit_rate
          incentive_type
          design_requirements
          existing_requirements
          rebate_code
          utility_company
          state
          input_description
          input_label
        }
        eaAttachedTo
        created
      }
    }
  }
`

export const GET_ACTIONS = gql`
  query actions($action: SearchActionInput!) {
    actions(action: $action) {
      _id
      name
      description
      type
      date
      fields {
        name
        type
        default
        value
      }
      contacts {
        name
        phone
        email
        title
      }
      projects {
        _id
        displayName
        measureId
      }
      comments
      buildingId
      createdByUserId
      updated
    }
  }
`
