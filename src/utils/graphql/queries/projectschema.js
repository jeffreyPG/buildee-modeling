import gql from 'graphql-tag'

export const PROJECT_SCHEMA = gql`
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
      }
      fields {
        field
        fieldDisplayName
        display
        type
        units
        values
      }
    }
  }
`
export const PROJECT_CATEGORIZATION = gql`
  query ProjectCategorization($categorization: ProjectCategorizationInput!) {
    projectCategorization(categorization: $categorization) {
      categories
      applications
      technologies
    }
  }
`
