import gql from 'graphql-tag'

export const GET_SCHEDULES = gql`
  {
    schedules {
      _id
      name
      scheduleType
      monday {
        hour
        value
        period
      }
      tuesday {
        hour
        value
        period
      }
      wednesday {
        hour
        value
        period
      }
      thursday {
        hour
        value
        period
      }
      friday {
        hour
        value
        period
      }
      saturday {
        hour
        value
        period
      }
      sunday {
        hour
        value
        period
      }
      holiday {
        hour
        value
        period
      }
      applicableHolidays
      startDate
      endDate
    }
  }
`

export const GET_BUILDING_OPERATIONS = gql`
  query Building($id: ID!) {
    building(id: $id) {
      _id
      operations {
        _id
        comments
        scheduleName
        schedule {
          _id
          scheduleType
          name
        }
        monday {
          hour
          value
          period
        }
        tuesday {
          hour
          value
          period
        }
        wednesday {
          hour
          value
          period
        }
        thursday {
          hour
          value
          period
        }
        friday {
          hour
          value
          period
        }
        saturday {
          hour
          value
          period
        }
        sunday {
          hour
          value
          period
        }
        holiday {
          hour
          value
          period
        }
        applicableHolidays
        startDate
        endDate
        weeklyHours
        holidays
        annualHours
        equipmentIds
        createdAt
        updatedAt
        createdByUserId {
          name
        }
      }
    }
  }
`

export const ADD_BUILDING_OPERATION = gql`
  mutation addBuildingOperation($input: addBuildingOperationInput!) {
    addBuildingOperation(input: $input) {
      _id
      operations {
        _id
        comments
        scheduleName
        schedule {
          _id
          scheduleType
          name
        }
        monday {
          hour
          value
          period
        }
        tuesday {
          hour
          value
          period
        }
        wednesday {
          hour
          value
          period
        }
        thursday {
          hour
          value
          period
        }
        friday {
          hour
          value
          period
        }
        saturday {
          hour
          value
          period
        }
        sunday {
          hour
          value
          period
        }
        holiday {
          hour
          value
          period
        }
        applicableHolidays
        startDate
        endDate
        weeklyHours
        holidays
        annualHours
        equipmentIds
      }
    }
  }
`

export const REMOVE_BUILDING_OPERATION = gql`
  mutation removeBuildingOperation($input: removeBuildingOperationInput!) {
    removeBuildingOperation(input: $input) {
      _id
      operations {
        _id
        comments
        schedule {
          _id
          name
          scheduleType
        }
        monday {
          hour
          value
          period
        }
        tuesday {
          hour
          value
          period
        }
        wednesday {
          hour
          value
          period
        }
        thursday {
          hour
          value
          period
        }
        friday {
          hour
          value
          period
        }
        saturday {
          hour
          value
          period
        }
        sunday {
          hour
          value
          period
        }
        holiday {
          hour
          value
          period
        }
        applicableHolidays
        startDate
        endDate
      }
    }
  }
`

export const UPDATE_BUILDING_OPERATION = gql`
  mutation updateBuildingOperation($input: updateBuildingOperationInput!) {
    updateBuildingOperation(input: $input) {
      _id
      operations {
        _id
        comments
        scheduleName
        schedule {
          _id
          scheduleType
          name
        }
        monday {
          hour
          value
          period
        }
        tuesday {
          hour
          value
          period
        }
        wednesday {
          hour
          value
          period
        }
        thursday {
          hour
          value
          period
        }
        friday {
          hour
          value
          period
        }
        saturday {
          hour
          value
          period
        }
        sunday {
          hour
          value
          period
        }
        holiday {
          hour
          value
          period
        }
        applicableHolidays
        startDate
        endDate
        weeklyHours
        holidays
        annualHours
        equipmentIds
      }
    }
  }
`
