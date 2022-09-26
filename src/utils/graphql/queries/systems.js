import gql from 'graphql-tag'

const systemFragment = `
  System {
    _id
    name
    building
    template {
      _id
      name
    }
    projects
    sections {
      name
      category
      application
      technology
      info {
        name
        label
      }
      buildingEquipment {
        _id
      }
    }
    images
    comments
    createdByUserId {
      name
    }
    createdAt
    updatedAt
  }
`

export const GET_SYSTEM_TYPES = gql`
  {
    systemTypes {
      _id
      name
      order
      sections {
        name
        order
        category
        application
        technology
        info {
          name
          label
        }
        equipment
      }
      images
    }
  }
`

export const GET_SYSTEMS = gql`
  query systems($system: SearchSystemInput!) {
    systems(system: $system) {
      ... on ${systemFragment}
    }
  }
`

export const ADD_SYSTEM = gql`
  mutation createSystem($system: CreateSystemInput!) {
    createSystem(system: $system) {
      ... on ${systemFragment}
    }
  }
`

export const DELETE_SYSTEM = gql`
  mutation deleteSystem($system: DeleteSystemInput!) {
    deleteSystem(system: $system) {
      ... on ${systemFragment}
    }
  }
`

export const UPDATE_SYSTEM = gql`
  mutation updateSystem($system: UpdateSystemInput!) {
    updateSystem(system: $system) {
      ... on ${systemFragment}
    }
  }
`

export const updateAfterDeleteSystem = (
  cache,
  { data: { deleteSystem: system } },
  variables
) => {
  let { systems } = cache.readQuery({ query: GET_SYSTEMS, variables })
  let filteredSystems = systems.filter(({ _id }) => _id !== system._id)
  cache.writeQuery({
    query: GET_SYSTEMS,
    variables,
    data: { systems: filteredSystems }
  })
}

export const updateAfterUpdateSystem = (
  cache,
  { data: { updateSystem: system } },
  variables
) => {
  let { systems } = cache.readQuery({ query: GET_SYSTEMS, variables })
  cache.writeQuery({
    query: GET_SYSTEMS,
    variables,
    data: {
      systems: systems.map(old_system =>
        old_system._id === system._id ? system : old_system
      )
    }
  })
}

export const updateAfterCreateSystem = (
  cache,
  { data: { createSystem: system } },
  variables
) => {
  let { systems } = cache.readQuery({ query: GET_SYSTEMS, variables })
  cache.writeQuery({
    query: GET_SYSTEMS,
    variables,
    data: { systems: systems.concat(system) }
  })
}
