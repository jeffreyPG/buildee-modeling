import gql from 'graphql-tag'

export const GET_ACTION_TEMPLATES = gql`
  query actionTemplates($actionTemplate: SearchActionTemplateInput) {
    actionTemplates(actionTemplate: $actionTemplate) {
      _id
      name
      description
      type
      date
      contacts {
        firstName
        lastName
        phoneNumber
        emailAddress
        title
        certificateNumber
        company
        expirationDate
        qualification
        role
        yearsOfExperience
        address
        certificationState
      }
      fields {
        name
        type
        default
        value
        values
      }
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
      updated
    }
  }
`

const projectFragment = `
    _id
    name
    displayName
    originalDisplayName
    source
    eaDisplayName
    eaSavedToLibrary
    eaAttachedTo
    location
    description
    fuel
    created
    project_category
    project_application
    project_technology
    applicable_building_types
    category
    fields{
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
    initialValues{
      commissioning
      construction_management
      description
      design_fees
      displayName
      input
      installation_factors
      labor_cost
      location
      maintenance_savings
      material_cost
      name
      new_location
      permits
      profit
      project_cost
      selectedImages
      taxes
      temporary_services
      test_and_balancing
      utility_service_upgrades
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
    imageUrls
    organizationFirebaseId
    isComplete
    createdByUserId
    updated
`

const contactFragment = `
  firstName
  lastName
  phoneNumber
  emailAddress
  title
  certificateNumber
  company
  expirationDate
  qualification
  role
  yearsOfExperience
  address
  city
  state
  zip
  certificationState
`

export const GET_ACTIONS = gql`
  query actions($action: SearchActionInput!){
    actions(action: $action) {
      _id
      name
      description
      templateId
      type
      date
      fields {
        name
        type
        default
        value
        values
      }
      contacts{
        ${contactFragment}
      }
      projects {
        measureId
        status
        ${projectFragment}
      }
      comments
      buildingId
      createdByUserId
      updated
    }
  }
`

export const ADD_ACTION = gql`
  mutation createAction($action: CreateActionInput!){
    createAction(action: $action) {
      _id
      name
      description
      templateId
      type
      date
      fields {
        name
        type
        default
        value
        values
      }
      contacts{
        ${contactFragment}
      }
      projects {
        measureId
        status
        ${projectFragment}
      }
      comments
      buildingId
      createdByUserId
      updated
    }
  }
`

export const DELETE_ACTION = gql`
  mutation deleteAction($action: DeleteActionInput!){
    deleteAction(action: $action) {
      _id
      name
      description
      templateId
      type
      date
      fields {
        name
        type
        default
        value
        values
      }
      contacts{
        ${contactFragment}
      }
      projects {
        measureId
        status
        ${projectFragment}
      }
      comments
      buildingId
      createdByUserId
      updated
    }
  }
`

export const UPDATE_ACTION = gql`
  mutation updateAction($action: UpdateActionInput!){
    updateAction(action: $action) {
      _id
      name
      description
      templateId
      type
      date
      fields {
        name
        type
        default
        value
        values
      }
      contacts{
        ${contactFragment}
      }
      projects {
        measureId
        status
        ${projectFragment}
      }
      comments
      buildingId
      createdByUserId
      updated
    }
  }
`

export const updateAfterDeleteAction = (
  cache,
  { data: { deleteAction: action } },
  variables
) => {
  let { actions } = cache.readQuery({ query: GET_ACTIONS, variables })
  let filteredActions = actions.filter(({ _id }) => _id !== action._id)
  cache.writeQuery({
    query: GET_ACTIONS,
    variables,
    data: { actions: filteredActions }
  })
}

export const updateAfterUpdateAction = (
  cache,
  { data: { updateAction: action } },
  variables
) => {
  let { actions } = cache.readQuery({ query: GET_ACTIONS, variables })
  cache.writeQuery({
    query: GET_ACTIONS,
    variables,
    data: {
      actions: actions.map(old_action =>
        old_action._id === action._id ? action : old_action
      )
    }
  })
}

export const updateAfterCreateAction = (
  cache,
  { data: { createAction: action } },
  variables
) => {
  let { actions } = cache.readQuery({ query: GET_ACTIONS, variables })
  cache.writeQuery({
    query: GET_ACTIONS,
    variables,
    data: { actions: actions.concat(action) }
  })
}
