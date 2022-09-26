import gql from 'graphql-tag'
import { buildingEquipmentFragment } from './equipment'

export const GET_LOCATIONS = gql`
  query Building($id: ID!) {
    building(id: $id) {
      locations {
        _id
        location {
          _id
          name
          usetype
          spaceType
        }
      }
    }
  }
`

export const GET_BUILDING_LOCATIONS = gql`
  query Building($id: ID!) {
    building(id: $id) {
      _id
      locations {
        _id
        location {
          _id
          usetype
          spaceType
          name
          floor
          conditioning
          user
          area
          length
          width
          height
          createdAt
          updatedAt
          createdByUserId {
            name
          }
        }
        equipment {
          ... on ${buildingEquipmentFragment}
        }
      }
    }
  }
`

export const CREATE_LOCATION = gql`
  mutation createLocation($input: CreateLocationInput!) {
    createLocation(input: $input) {
      _id
    }
  }
`

export const ADD_BUILDING_LOCATION = gql`
  mutation addBuildingLocation($input: addBuildingLocationInput!) {
    addBuildingLocation(input: $input) {
      _id
      name
      usetype
      spaceType
    }
  }
`

export const UPDATE_BUILDING_LOCATION = gql`
  mutation updateBuildingLocation($input: updateBuildingLocationInput!) {
    updateBuildingLocation(input: $input) {
      _id
      name
      usetype
      spaceType
    }
  }
`

export const ADD_BUILDING_LOCATION_EQUIPMENT = gql`
  mutation addBuildingLocationEquipment(
    $input: addBuildingLocationEquipmentInput!
  ) {
    addBuildingLocationEquipment(input: $input) {
      _id
      location {
        _id
        name
      }
      equipment {
        _id
      }
    }
  }
`

export const REMOVE_BUILDING_LOCATION_EQUIPMENT = gql`
  mutation removeBuildingLocationEquipment(
    $input: removeBuildingLocationEquipmentInput!
  ) {
    removeBuildingLocationEquipment(input: $input) {
      _id
      location {
        _id
        name
      }
      equipment {
        _id
      }
    }
  }
`

export const REMOVE_BUILDING_LOCATION = gql`
  mutation removeBuildingLocation($input: removeBuildingLocationInput!) {
    removeBuildingLocation(input: $input) {
      _id
    }
  }
`

export const ADD_BUILDING_LOCATIONS = gql`
  mutation AddBuildingLocations($input: AddBuildingLocationsInput!) {
    addBuildingLocations(input: $input) {
      _id
    }
  }
`

export const COPY_BUILDING_LOCATIONS = gql`
  mutation CopyBuildingLocations($input: CopyBuildingLocationsInput!) {
    copyBuildingLocations(input: $input) {
      _id
    }
  }
`
