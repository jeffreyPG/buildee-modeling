import gql from 'graphql-tag'

export const GET_CONSTRUCTIONS = gql`
  query Constructions($search: SearchInput) {
    constructions(search: $search) {
      _id
      application
      name
      fields {
        rValue {
          value
        }
        uvalue {
          value
        }
      }
      createdAt
      updatedAt
      archived
    }
  }
`

export const GET_BUILDING_CONSTRUCTIONS = gql`
  query Building($id: ID!) {
    building(id: $id) {
      _id
      constructions {
        _id
        construction {
          _id
          application
          name
          fields {
            rValue {
              value
            }
            uvalue {
              value
            }
          }
        }
        comments
        images
        createdByUserId {
          name
        }
        createdAt
        updatedAt
      }
    }
  }
`

export const ADD_BUILDING_CONSTRUCTION = gql`
  mutation addBuildingConstruction($input: addBuildingConstructionInput!) {
    addBuildingConstruction(input: $input) {
      _id
      constructions {
        _id
        construction {
          _id
        }
        comments
        images
      }
    }
  }
`

export const REMOVE_BUILDING_CONSTRUCTION = gql`
  mutation removeBuildingConstruction(
    $input: removeBuildingConstructionInput!
  ) {
    removeBuildingConstruction(input: $input) {
      _id
      constructions {
        _id
        construction {
          _id
        }
        comments
        images
      }
    }
  }
`

export const UPDATE_BUILDING_CONSTRUCTION = gql`
  mutation updateBuildingConstruction(
    $input: updateBuildingConstructionInput!
  ) {
    updateBuildingConstruction(input: $input) {
      _id
      constructions {
        _id
        construction {
          _id
        }
        comments
        images
      }
    }
  }
`
