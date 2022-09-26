import gql from 'graphql-tag'

export const EQUIPMENT_SCHEMA = gql`
  query EquipmentSchema($schema: EquipmentSchemaInput!) {
    equipmentSchema(schema: $schema) {
      type
      configs {
        field
        fieldDisplayName
        display
        type
        units
        values
        rank
      }
      fields {
        field
        fieldDisplayName
        display
        type
        units
        values
        rank
        capacityField
      }
      maintenances {
        field
        fieldDisplayName
        display
        type
        units
        values
        rank
        editable
        calculation
      }
    }
  }
`

export const EQUIPMENT_CATEGORIZATION = gql`
  query EquipmentCategorization(
    $categorization: EquipmentCategorizationInput!
  ) {
    equipmentCategorization(categorization: $categorization) {
      categories {
        displayName
        value
      }
      applications {
        displayName
        value
      }
      technologies {
        displayName
        value
      }
    }
  }
`
