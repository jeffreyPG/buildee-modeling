import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { range, find } from 'lodash'
import styles from './OperationForm.scss'
import { Formik, Form, FieldArray } from 'formik'
import { Mutation, Query } from 'react-apollo'
import MaskedInput from 'react-text-mask'
import { Field, FormSection } from '../FormFields'
import SetPointSchedule from './SetPointSchedule'
import OperationalSchedule from './OperationalSchedule'
import { Loader } from 'utils/Loader'
import { Footer } from '../../../components/UI/Footer'
import Feature from '../../../utils/Feature/Feature'
import features from '../../../utils/Feature/config'
import {
  GET_SCHEDULES,
  GET_BUILDING_OPERATIONS,
  ADD_BUILDING_OPERATION,
  UPDATE_BUILDING_OPERATION
} from '../../../utils/graphql/queries/operation.js'
import { GET_BUILDING_EQUIPMENT_LIST } from '../../../utils/graphql/queries/equipment'
import ListSearch from 'components/UI/ListSearch'
import SortableList from 'components/UI/SortableList'
import { getUseTypeDisplayName } from '../EquipmentForms/selectors'
import { multiSelectChecker } from 'utils/Portfolio'
import { EQUIPMENT_CATEGORIZATION } from 'utils/graphql/queries/equipmentschema'

const days = [
  { displayValue: 'Sun', value: 'sunday' },
  { displayValue: 'M', value: 'monday' },
  { displayValue: 'T', value: 'tuesday' },
  { displayValue: 'W', value: 'wednesday' },
  { displayValue: 'Th', value: 'thursday' },
  { displayValue: 'F', value: 'friday' },
  { displayValue: 'Sa', value: 'saturday' }
]

const operationalPeriodOptions = [
  { name: 'Unoccupied', value: 'unoccupied' },
  { name: 'Occupied', value: 'occupied' }
]

const setpointPeriodOptions = [
  ...operationalPeriodOptions,
  { name: 'Warm up', value: 'warmup' },
  { name: 'Cool Down', value: 'cooldown' }
]

const EQUIPMENT_KEYS = {
  applications: 'application',
  categories: 'category',
  technologies: 'technology',
  name: 'name'
}

const BUILDING_EQUIPMENT_KEYS = {
  floor: 'floor',
  media: 'mediaCount',
  projects: 'projectCount',
  quantity: 'quantity',
  space: 'space'
}

const getTime = (hour, index) => {
  if (hour === 0) {
    return `12:00AM`
  } else if (hour <= 12) {
    return `${hour}:00${hour < 12 ? 'AM' : 'PM'}`
  } else {
    return `${hour - 12}:00${hour < 12 ? 'AM' : 'PM'}`
  }
}

const compareDates = (date1, date2) => {
  let dt1 = new Date(date1)
  let dt2 = new Date(date2)
  return Math.floor(
    (Date.UTC(dt2.getFullYear(), dt2.getMonth(), dt2.getDate()) -
      Date.UTC(dt1.getFullYear(), dt1.getMonth(), dt1.getDate())) /
      (1000 * 60 * 60 * 24)
  )
}

const parseDate = datestring => {
  const year = new Date().getFullYear()
  const [month, day] = datestring.split('/')
  return new Date(`${year}-${month}-${day}`)
}

const validateDate = input => {
  const dateformat = /^(0[1-9]|1[0-2])\/(0[1-9]|1[0-9]|2[0-9]|30|31)$/
  // Match the date format through regular expression
  if (input.match(dateformat)) {
    const year = new Date().getFullYear()
    const [month, day] = input.split('/')
    const date = new Date(`${year}-${month}-${day}`)
    return Boolean(+date) && date.getUTCDate() === parseInt(day)
  }

  return false
}

const calculate = (sum, x, y, value) => {
  return +(sum + ((x - y) * value) / 100).toFixed(2)
}

const calculateAnnualHours = (values, weeklyHours, holidays) => {
  let sum = 0
  let time
  if (weeklyHours.touched) time = +weeklyHours.value
  else time = calculateWeeklyHour(values) || 0
  let hours = 0,
    array = values.holiday
  if (array.length == 0) hours = 24
  else if (array.length == 1)
    hours = calculate(hours, 24, array[0].hour, array[0].value)
  else {
    for (let i = 1; i < array.length; i++) {
      hours = calculate(
        hours,
        array[i].hour,
        array[i - 1].hour,
        array[i - 1].value
      )
      if (i == array.length - 1)
        hours = calculate(hours, 24, array[i].hour, array[i].value)
    }
  }
  sum = +(sum + (time * (365 - holidays)) / 7 + hours * holidays).toFixed(2)
  if (weeklyHours.value === '' && time == 0 && !array.length) sum = 0
  return sum < 8760 ? sum : 8760
}

const calculateWeeklyHour = values => {
  let weeklyHours = 0,
    flag = false
  for (let j = 0; j < days.length; j++) {
    let key = days[j].value
    let array = values[key]

    if (array.length == 1) {
      flag = true
      weeklyHours = calculate(weeklyHours, 24, array[0].hour, array[0].value)
    }
    for (let i = 1; i < array.length; i++) {
      flag = true
      weeklyHours = calculate(
        weeklyHours,
        array[i].hour,
        array[i - 1].hour,
        array[i - 1].value
      )
      if (i == array.length - 1) {
        weeklyHours = calculate(weeklyHours, 24, array[i].hour, array[i].value)
      }
    }
  }
  return flag ? weeklyHours : null
}

export class OperationForm extends React.Component {
  static propTypes = {
    user: PropTypes.object.isRequired,
    building: PropTypes.object.isRequired,
    operation: PropTypes.object,
    onClose: PropTypes.func.isRequired,
    onSelect: PropTypes.func.isRequired,
    mode: PropTypes.oneOf(['viewOperation', 'addOperation', 'editOperation'])
      .isRequired,
    setSectionRef: PropTypes.func
  }

  static defaultProps = {
    mode: 'viewOperation'
  }

  state = {
    selectedItems: [],
    currentSchedule: null,
    currentOperation: this.props.operation,
    selectedDay: 'sunday',
    typeOptions: [
      { name: 'Setpoint', value: 'setpoint' },
      { name: 'Operational', value: 'operational' }
    ],
    isCustom: false,
    periodOptions: setpointPeriodOptions,
    name: '',
    weeklyHours: {
      value: '',
      touched: null
    },
    holidays: 13,
    annualHours: {
      value: '',
      touched: null
    },
    filters: {
      category: 'default',
      useType: 'default',
      spaceType: 'default'
    },
    keyword: '',
    sort: {
      key: 'updated',
      direction: 'DESC'
    },
    sortKeys: {
      category: 'category',
      useType: 'useType',
      spaceType: 'spaceType'
    },
    columns: {
      name: {
        header: 'Name',
        sortKey: 'name',
        getValue: e => e || '-'
      },
      category: {
        header: 'Category',
        sortKey: 'category',
        getValue: e => e || '-'
      },
      application: {
        header: 'Application',
        sortKey: 'application',
        getValue: e => e || '-'
      },
      useType: {
        header: 'Building Use Type',
        sortKey: 'useType',
        getValue: l => (l && getUseTypeDisplayName(l)) || '-'
      },
      spaceType: {
        header: 'Space Type',
        sortKey: 'spaceType',
        getValue: l => (l && getUseTypeDisplayName(l)) || '-'
      },
      locationName: {
        header: 'Location Name',
        sortKey: 'locationName',
        getValue: l => l || '-'
      }
    }
  }

  componentDidMount = () => {
    const { operation } = this.props
    if (operation && operation.schedule && operation.schedule.scheduleType) {
      this.updateScheduleType(operation, operation.scheduleName, true)
    }
    if (operation) {
      let items = operation.equipmentIds || []
      this.setState({ selectedItems: items })
    }
  }

  validateOperation = (values, errors = {}, operations = []) => {
    if (!values.scheduleType) {
      errors.scheduleType = 'Invalid Schedule Type'
    }

    if (!values.schedule._id) {
      errors.schedule = 'Invalid Schedule'
    }

    if (features.buildingOperationsDates === true) {
      if (!values.startDate) {
        errors.startDate = 'Start date is required'
      } else if (!validateDate(values.startDate)) {
        errors.startDate = 'Invalid Start Date Format'
      }

      if (!values.endDate) {
        errors.endDate = 'End date is required'
      } else if (!validateDate(values.endDate)) {
        errors.endDate = 'Invalid End Date Format'
      } else if (
        compareDates(parseDate(values.startDate), parseDate(values.endDate)) < 0
      ) {
        errors.endDate = 'End date is before start date'
      }
    }
    if (!this.state.isCustom) {
      days.forEach(day => {
        if (!values[day.value] || values[day.value].length === 0) {
          errors[day.value] = `Please provide values for ${day.value}`
        } else {
          if (!values[day.value].every(time => time.value || time.value >= 0)) {
            errors[day.value] =
              values.schedule.scheduleType != 'operational'
                ? `Please select an occupancy for every ${day.value} time slot`
                : `Please select an use for every ${day.value} time slot`
          }
          if (
            values.schedule.scheduleType != 'operational' &&
            !values[day.value].every(time => time.period)
          ) {
            errors[
              day.value
            ] = `Please select a period for every ${day.value} time slot`
          }
        }
      })
    }

    return errors
  }

  validateForm = (values, schedules, operations) => {
    let errors = {}

    switch (this.props.mode) {
      case 'viewOperation':
        return errors
      case 'addOperation':
      case 'editOperation':
        return this.validateOperation(values, errors, operations)
    }
  }

  validateInitial = values => {
    let errors = {}
    switch (this.props.mode) {
      case 'viewOperation':
        break
      case 'addOperation':
      case 'editOperation':
        errors = this.validateOperation(values, errors)
        break
    }

    return Object.keys(errors).length === 0
  }

  onSubmit = (executeMutation, values) => {
    const { name, weeklyHours, holidays, annualHours } = this.state

    switch (this.props.mode) {
      case 'viewOperation':
        return true
      case 'addOperation':
        return executeMutation({
          variables: {
            input: {
              building: this.props.building._id,
              schedule: values.schedule._id,
              scheduleName: name,
              sunday: values.sunday.map(({ hour, value, period }) => ({
                hour,
                value,
                period
              })),
              monday: values.monday.map(({ hour, value, period }) => ({
                hour,
                value,
                period
              })),
              tuesday: values.tuesday.map(({ hour, value, period }) => ({
                hour,
                value,
                period
              })),
              wednesday: values.wednesday.map(({ hour, value, period }) => ({
                hour,
                value,
                period
              })),
              thursday: values.thursday.map(({ hour, value, period }) => ({
                hour,
                value,
                period
              })),
              friday: values.friday.map(({ hour, value, period }) => ({
                hour,
                value,
                period
              })),
              saturday: values.saturday.map(({ hour, value, period }) => ({
                hour,
                value,
                period
              })),
              holiday: values.holiday.map(({ hour, value, period }) => ({
                hour,
                value,
                period
              })),
              startDate: values.startDate,
              endDate: values.endDate,
              comments: values.comments,
              holidays: +holidays,
              weeklyHours: weeklyHours.value === '' ? -1 : +weeklyHours.value,
              annualHours: annualHours.value === '' ? -1 : +annualHours.value,
              equipmentIds: this.state.selectedItems || []
            }
          }
        }).then(this.props.onClose)
      case 'editOperation':
        return executeMutation({
          variables: {
            input: {
              building: this.props.building._id,
              _id: this.props.operation._id,
              schedule: values.schedule._id,
              scheduleName: name,
              sunday: values.sunday.map(({ hour, value, period }) => ({
                hour,
                value,
                period
              })),
              monday: values.monday.map(({ hour, value, period }) => ({
                hour,
                value,
                period
              })),
              tuesday: values.tuesday.map(({ hour, value, period }) => ({
                hour,
                value,
                period
              })),
              wednesday: values.wednesday.map(({ hour, value, period }) => ({
                hour,
                value,
                period
              })),
              thursday: values.thursday.map(({ hour, value, period }) => ({
                hour,
                value,
                period
              })),
              friday: values.friday.map(({ hour, value, period }) => ({
                hour,
                value,
                period
              })),
              saturday: values.saturday.map(({ hour, value, period }) => ({
                hour,
                value,
                period
              })),
              holiday: values.holiday.map(({ hour, value, period }) => ({
                hour,
                value,
                period
              })),
              startDate: values.startDate,
              endDate: values.endDate,
              comments: values.comments,
              holidays: +holidays,
              weeklyHours: weeklyHours.value === '' ? -1 : +weeklyHours.value,
              annualHours: annualHours.value === '' ? -1 : +annualHours.value,
              equipmentIds: this.state.selectedItems || []
            }
          }
        }).then(this.props.onClose)
    }
  }

  handleWeeklyHoursChange = (values, e = null, day = null) => {
    let { holidays, weeklyHours, annualHours } = this.state
    let hours = ''

    if (day === 'holiday') {
      let calAnnualHours = calculateAnnualHours(values, weeklyHours, holidays)
      this.setState({
        annualHours: {
          value: calAnnualHours,
          touched: calAnnualHours ? false : null
        }
      })
    } else {
      if (e) {
        hours = e.target.value != '' ? +e.target.value : ''
        const calWeeklyHours = calculateWeeklyHour(values)
        const calAnnualHours = calculateAnnualHours(
          values,
          { value: hours, touched: e.target.value != '' ? true : null },
          holidays
        )
        this.setState({
          weeklyHours: {
            value:
              hours === ''
                ? calWeeklyHours
                  ? calWeeklyHours
                  : hours
                : hours <= 168
                ? hours
                : 168,
            touched: hours === '' ? (calWeeklyHours ? false : null) : true
          },
          annualHours: {
            value:
              hours === '' && annualHours.value && annualHours.touched
                ? annualHours.value
                : calAnnualHours
                ? calAnnualHours
                : '',
            touched:
              hours === '' && annualHours.value && annualHours.touched
                ? annualHours.touched
                : calAnnualHours
                ? false
                : null
          }
        })
      } else {
        const calWeeklyHours = calculateWeeklyHour(values)
        const calAnnualHours = calculateAnnualHours(
          values,
          { value: hours, touched: false },
          holidays
        )

        this.setState({
          weeklyHours: {
            value: calWeeklyHours ? calWeeklyHours : '',
            touched: calWeeklyHours ? false : null
          },
          annualHours: {
            value: calAnnualHours ? calAnnualHours : '',
            touched: calAnnualHours ? false : null
          }
        })
      }
    }
  }

  handleHolidaysChange = (values, e) => {
    const { annualHours } = this.state
    const holiday = +e.target.value
    const calAnnualHours = calculateAnnualHours(
      values,
      this.state.weeklyHours,
      holiday
    )
    this.setState({
      holidays: e.target.value <= 365 ? e.target.value : 365,
      annualHours: {
        value: calAnnualHours ? calAnnualHours : annualHours.value,
        touched: calAnnualHours ? false : annualHours.touched
      }
    })
  }

  handleAnnualHoursChange = (values, e) => {
    const { weeklyHours, holidays } = this.state
    const calAnnualHours = calculateAnnualHours(values, weeklyHours, holidays)
    if (e.target.value === '') {
      this.setState({
        annualHours: {
          value: calAnnualHours ? calAnnualHours : '',
          touched: calAnnualHours ? false : null
        }
      })
    } else {
      this.setState({
        annualHours: {
          value: e.target.value <= 8760 ? e.target.value : 8760,
          touched: e.target.value != '' ? true : null
        }
      })
    }
  }
  changeSelectedDay = selectedDay => {
    this.setState({ selectedDay })
  }

  updateScheduleType = (operation, name, isFirstLoad = false) => {
    let isCustom = name === 'Custom schedule'
    if (operation.schedule && operation.schedule._id !== '') {
      isCustom = operation.schedule.name === 'Custom schedule'
    }
    let updatedName = name
    if (!isFirstLoad && isCustom) {
      updatedName = operation.scheduleType
      updatedName = updatedName.charAt(0).toUpperCase() + updatedName.slice(1)
      updatedName = `${updatedName} Schedule`
    }
    this.setState(preveState => ({
      periodOptions: operation.schedule.scheduleType
        ? setpointPeriodOptions
        : operationalPeriodOptions,
      weeklyHours:
        operation.weeklyHours != undefined
          ? {
              value: operation.weeklyHours != -1 ? operation.weeklyHours : '',
              touched: operation.weeklyHours != -1 ? true : null
            }
          : preveState.weeklyHours,
      holidays:
        operation.holidays != undefined
          ? operation.holidays
          : preveState.holidays,
      annualHours:
        operation.annualHours != undefined
          ? {
              value: operation.annualHours != -1 ? operation.annualHours : '',
              touched: operation.annualHours != -1 ? true : null
            }
          : preveState.annualHours,
      name: updatedName,
      isCustom
    }))
  }

  handleUpdateSelectedSchedule = (
    scheduleType,
    schedules,
    setValues,
    values
  ) => {
    let selectedSchedules = schedules.filter(
      item => item.scheduleType === scheduleType
    )
    if (selectedSchedules && selectedSchedules.length > 0) {
      let schedule = selectedSchedules[0]

      let updatedValues = {
        ...values,
        schedule,
        scheduleType: scheduleType,
        sunday: schedule.sunday,
        monday: schedule.monday,
        tuesday: schedule.tuesday,
        wednesday: schedule.wednesday,
        thursday: schedule.thursday,
        friday: schedule.friday,
        saturday: schedule.saturday,
        holiday: schedule.holiday,
        startDate: schedule.startDate,
        endDate: schedule.endDate
      }
      setValues(updatedValues)
      this.updateScheduleType(updatedValues, schedule.name)
      this.props.onSelect()
    }
  }

  handleSelectScheduleType = ({
    event,
    schedules,
    setFieldValue,
    setValues,
    values
  }) => {
    setFieldValue('scheduleType', event.target.value)
    let selectedSchedules = schedules.filter(
      item => item.scheduleType === event.target.value
    )
    if (selectedSchedules && selectedSchedules.length > 0) {
      this.handleUpdateSelectedSchedule(
        event.target.value,
        schedules,
        setValues,
        values
      )
    } else {
      setValues({
        ...values,
        scheduleType: event.target.value
      })
    }
  }

  handleScheduleSelected = ({ event, schedules, values, setValues }) => {
    const schedule = schedules.find(
      schedule => schedule._id === event.target.value
    )
    let updatedValues = {
      ...values,
      schedule,
      sunday: schedule.sunday,
      monday: schedule.monday,
      tuesday: schedule.tuesday,
      wednesday: schedule.wednesday,
      thursday: schedule.thursday,
      friday: schedule.friday,
      saturday: schedule.saturday,
      holiday: schedule.holiday,
      startDate: schedule.startDate,
      endDate: schedule.endDate
    }
    setValues(updatedValues)
    this.updateScheduleType(updatedValues, schedule.name)
    this.props.onSelect()
  }

  handleNameChanged = e => {
    this.setState({ name: e.target.value })
  }

  handleSearch = keyword => {
    this.setState({ keyword })
  }

  handleFilter = filters => {
    this.setState({ filters })
  }

  filterData = buildingEquipment => {
    let filtered = Array.from(buildingEquipment)
    if (this.state.keyword) {
      const regex = new RegExp(this.state.keyword, 'i')
      filtered = buildingEquipment.filter(
        be => regex.test(be.name) || regex.test(be.locationName)
      )
    }
    Object.keys(this.state.filters).forEach(filter => {
      let filterValue = this.state.filters[filter]
      if (filterValue !== 'default' && filterValue !== 'all') {
        filtered = filtered.filter(be => {
          let value = (be && be[filter]) || ''
          return value === filterValue
        })
      }
    })

    return filtered
  }

  hasFilters = () => {
    let flag = false
    if (this.state.keyword) flag = true
    Object.keys(this.state.filters).forEach(filter => {
      let filterValue = this.state.filters[filter]
      if (filterValue !== 'default' && filterValue !== 'all') {
        flag = true
      }
    })

    return flag
  }

  handleCheckItem = (id, buildingEquipment = []) => {
    let allIds = buildingEquipment.map(item => item._id)
    const { selectedItems } = this.state
    if (id === 'all') {
      const filteredBuildingEquipment = this.filterData(buildingEquipment)
      allIds = filteredBuildingEquipment.map(item => item._id)
      let checkedAll =
        multiSelectChecker(selectedItems, allIds) &&
        multiSelectChecker(allIds, selectedItems)

      if (this.hasFilters()) {
        checkedAll = multiSelectChecker(selectedItems, allIds)
      }
      if (checkedAll) {
        const newIds = selectedItems.filter(item => !allIds.includes(item))
        this.setState({ selectedItems: newIds })
      } else {
        this.setState({
          selectedItems: [...new Set([...allIds, ...selectedItems])]
        })
      }
    } else {
      let ids = []
      if (!selectedItems.includes(id)) {
        ids = [...selectedItems, id]
      } else {
        ids = selectedItems.filter(item => item !== id)
      }
      ids = [...new Set(ids)]
      ids = ids.filter(item => allIds.includes(item))
      this.setState({ selectedItems: ids })
    }
  }

  renderBuildingEquipments() {
    const { building } = this.props
    const { filters, keyword } = this.state
    const buildingId = building._id
    return (
      <Query
        query={EQUIPMENT_CATEGORIZATION}
        variables={{
          categorization: {
            application: null,
            category: null,
            technology: null
          }
        }}
        fetchPolicy="cache-and-network"
      >
        {({ data }) => {
          const categorization = (data && data.equipmentCategorization) || []
          return (
            <Query
              skip={!buildingId}
              query={GET_BUILDING_EQUIPMENT_LIST}
              variables={{ buildingId }}
              fetchPolicy="cache-and-network"
            >
              {({ loading, error, data }) => {
                let { buildingEquipment = [] } = data
                buildingEquipment = buildingEquipment.map(be => {
                  let categoryItem =
                    (be &&
                      be.libraryEquipment &&
                      be.libraryEquipment.category) ||
                    ''
                  let applicationItem =
                    (be &&
                      be.libraryEquipment &&
                      be.libraryEquipment.application) ||
                    ''
                  let { categories = [], applications = [] } = categorization
                  let selectedCategory = find(categories, {
                    value: categoryItem
                  })
                  let selectedApplication = find(applications, {
                    value: applicationItem
                  })

                  return {
                    _id: be._id,
                    name:
                      (be && be.libraryEquipment && be.libraryEquipment.name) ||
                      '',
                    category:
                      (selectedCategory && selectedCategory.displayName) || '',
                    application:
                      (selectedApplication &&
                        selectedApplication.displayName) ||
                      '',
                    useType: (be && be.location && be.location.usetype) || '',
                    spaceType:
                      (be && be.location && be.location.spaceType) || '',
                    locationName: (be && be.location && be.location.name) || ''
                  }
                })
                return (
                  <div>
                    <div className={styles.equipmentDescription}>
                      <p>Equipment</p>
                      <span>
                        Assign schedules to equipment. Filter by equipment
                        category, building use type or space type.
                      </span>
                    </div>
                    <div>
                      <ListSearch
                        listData={buildingEquipment || []}
                        sortKeys={this.state.sortKeys}
                        filters={this.state.filters}
                        filtersOptions={{
                          category: {
                            template: value => {
                              return value
                            },
                            getValue: value => {
                              return value
                            },
                            title: 'Category'
                          },
                          useType: {
                            template: value => {
                              return getUseTypeDisplayName(value)
                            },
                            getValue: value => {
                              return value
                            },
                            title: 'Building Use Type'
                          },
                          spaceType: {
                            template: value => {
                              return getUseTypeDisplayName(value)
                            },
                            getValue: value => {
                              return value
                            },
                            title: 'Space Type'
                          }
                        }}
                        showFilters={true}
                        onSearch={this.handleSearch}
                        onFilter={this.handleFilter}
                        lookupDisplayName={[]}
                      />
                      <SortableList
                        listData={this.filterData(buildingEquipment)}
                        loading={loading}
                        error={error}
                        columns={this.state.columns}
                        onItemClick={this.handleEditEquipment}
                        showTotals={false}
                        isCheckable={true}
                        handleSelectItem={id => {
                          this.handleCheckItem(id, buildingEquipment)
                        }}
                        selectedItems={this.state.selectedItems}
                        hasFilter={this.hasFilters()}
                        // scrollable={true}
                      />
                    </div>
                  </div>
                )
              }}
            </Query>
          )
        }}
      </Query>
    )
  }

  render() {
    const {
      typeOptions,
      periodOptions,
      currentSchedule,
      currentOperation,
      selectedDay,
      name,
      weeklyHours,
      holidays,
      annualHours
    } = this.state

    if (currentOperation || currentSchedule) {
      // this.onTabEnabled(['Schedule', 'Comments'])
    }

    const initialValues = {
      scheduleType:
        (currentOperation &&
          currentOperation.schedule &&
          currentOperation.schedule.scheduleType) ||
        '',
      schedule: (currentOperation && currentOperation.schedule) || { _id: '' },
      sunday: (currentOperation && currentOperation.sunday) || [],
      monday: (currentOperation && currentOperation.monday) || [],
      tuesday: (currentOperation && currentOperation.tuesday) || [],
      wednesday: (currentOperation && currentOperation.wednesday) || [],
      thursday: (currentOperation && currentOperation.thursday) || [],
      friday: (currentOperation && currentOperation.friday) || [],
      saturday: (currentOperation && currentOperation.saturday) || [],
      holiday: (currentOperation && currentOperation.holiday) || [],
      startDate: (currentOperation && currentOperation.startDate) || '',
      endDate: (currentOperation && currentOperation.endDate) || '',
      comments: (currentOperation && currentOperation.comments) || ''
    }

    let mutation, submitText, showSubmit, locked

    switch (this.props.mode) {
      case 'viewOperation':
        mutation = UPDATE_BUILDING_OPERATION
        submitText = ''
        showSubmit = false
        locked = true
        break
      case 'addOperation':
        mutation = ADD_BUILDING_OPERATION
        submitText = 'Add Schedule'
        showSubmit = true
        locked = false
        break
      case 'editOperation':
        mutation = UPDATE_BUILDING_OPERATION
        submitText = 'Update Schedule'
        showSubmit = true
        locked = true
        break
    }

    return (
      <Mutation
        mutation={mutation}
        refetchQueries={result => [
          {
            query: GET_BUILDING_OPERATIONS,
            variables: { id: this.props.building._id }
          }
        ]}
      >
        {(executeMutation, { data, loading }) => (
          <div className={styles.formWrapper}>
            <Query
              query={GET_BUILDING_OPERATIONS}
              variables={{ id: this.props.building._id }}
            >
              {({ data: { building: { operations = [] } = {} } }) => (
                <Query query={GET_SCHEDULES}>
                  {({ data: { schedules = [] } }) => {
                    return (
                      <Formik
                        ref={this.formik}
                        initialValues={initialValues}
                        isInitialValid={() =>
                          this.validateInitial(initialValues)
                        }
                        validate={values =>
                          this.validateForm(values, schedules, operations)
                        }
                      >
                        {({
                          values,
                          errors,
                          isSubmitting,
                          isValid,
                          setSubmitting,
                          setFieldValue,
                          setValues
                        }) => {
                          if (
                            values.scheduleType &&
                            values.schedule._id === ''
                          ) {
                            this.handleUpdateSelectedSchedule(
                              values.scheduleType,
                              schedules,
                              setValues,
                              values
                            )
                          }

                          return (
                            <Form className={styles.form} id={this.props.name}>
                              <FormSection
                                title="Details"
                                description="Search for Schedules and add details"
                                setSectionRef={this.props.setSectionRef}
                              >
                                <div className={styles.formInputRow}>
                                  <Field
                                    label="Type"
                                    component="select"
                                    name="scheduleType"
                                    data-test="schedule-type"
                                    disabled={name != '' || locked}
                                    placeholder="Select"
                                    onChange={event =>
                                      this.handleSelectScheduleType({
                                        event,
                                        schedules,
                                        setFieldValue,
                                        setValues,
                                        values
                                      })
                                    }
                                  >
                                    <option defaultValue value="" disabled>
                                      Select a type
                                    </option>
                                    {typeOptions.map(({ name, value }) => (
                                      <option
                                        key={`type-option-${value}`}
                                        value={value}
                                      >
                                        {name}
                                      </option>
                                    ))}
                                  </Field>
                                </div>

                                <div className={styles.formInputRow}>
                                  <Field
                                    id="name"
                                    name="name"
                                    component="input"
                                    label="Name"
                                    type="text"
                                    value={name}
                                    placeholder="Name"
                                    onChange={e => this.handleNameChanged(e)}
                                    disabled={!values.schedule._id}
                                  />
                                  {/* {values.schedule._id ? (
                                  <Field
                                    id="name"
                                    name="name"
                                    component="input"
                                    label="Name"
                                    type="text"
                                    value={name}
                                    placeholder="Name"
                                    onChange={e => this.handleNameChanged(e)}
                                  />
                                ) : (
                                  <Field
                                    label="Name"
                                    name="schedule._id"
                                    data-test="schedule-name"
                                    component="select"
                                    disabled={
                                      !values.scheduleType.length || locked
                                    }
                                    placeholder="Select a schedule"
                                    onChange={event =>
                                      this.handleScheduleSelected({
                                        event,
                                        schedules,
                                        values,
                                        setValues
                                      })
                                    }
                                  >
                                    <option defaultValue disabled value={''}>
                                      Select a schedule template
                                    </option>
                                    {schedules
                                      .filter(
                                        schedule =>
                                          values.scheduleType ===
                                          schedule.scheduleType
                                      )
                                      .map(schedule => (
                                        <option
                                          value={schedule._id}
                                          key={schedule._id}
                                        >
                                          {schedule.name}
                                        </option>
                                      ))}
                                  </Field>
                                )} */}
                                </div>
                              </FormSection>
                              {values.schedule._id &&
                              values.schedule.scheduleType == 'operational' ? (
                                <FormSection
                                  title="Total Annual Hours"
                                  description="Enter total annual hours or calculate them by defining a schedule below."
                                  setSectionRef={this.props.setSectionRef}
                                >
                                  <div className={styles.hourInput}>
                                    <Field
                                      id="weeklyHours"
                                      name="weeklyHours"
                                      component="input"
                                      label="Total Weekly Hours"
                                      type="text"
                                      className={
                                        weeklyHours.touched === false
                                          ? styles.hourInputCalculated
                                          : ''
                                      }
                                      value={weeklyHours.value}
                                      placeholder=""
                                      onChange={e =>
                                        this.handleWeeklyHoursChange(values, e)
                                      }
                                    />
                                    <Field
                                      id="holidays"
                                      name="holidays"
                                      component="input"
                                      label="Total Holiday Days"
                                      type="number"
                                      value={holidays}
                                      placeholder=""
                                      onChange={e =>
                                        this.handleHolidaysChange(values, e)
                                      }
                                    />
                                    <Field
                                      id="annualHours"
                                      name="annualHours"
                                      component="input"
                                      label="Total Annual Hours"
                                      type="text"
                                      value={annualHours.value}
                                      className={
                                        annualHours.touched === false
                                          ? styles.hourInputCalculated
                                          : ''
                                      }
                                      placeholder=""
                                      onChange={e =>
                                        this.handleAnnualHoursChange(values, e)
                                      }
                                    />
                                  </div>
                                </FormSection>
                              ) : null}
                              {values.schedule._id && (
                                <FormSection
                                  title="Schedule"
                                  description="Configure the schedule to reflect your building"
                                  setSectionRef={this.props.setSectionRef}
                                >
                                  <Feature name="buildingOperationsDates">
                                    {({ enabled }) => {
                                      if (!enabled) return null
                                      return (
                                        <div>
                                          <div className={styles.formInputRow}>
                                            <Field
                                              label="Start Date"
                                              name="startDate"
                                              render={({ field }) => (
                                                <MaskedInput
                                                  {...field}
                                                  placeholder="MM/DD"
                                                  placeholderChar={'\u2000'}
                                                  mask={[
                                                    /\d/,
                                                    /\d/,
                                                    '/',
                                                    /\d/,
                                                    /\d/
                                                  ]}
                                                  data-test="schedule-start-date"
                                                />
                                              )}
                                            />
                                            <div
                                              className={styles.formInputText}
                                            >
                                              to
                                            </div>
                                            <Field
                                              label="End Date"
                                              name="endDate"
                                              render={({ field }) => (
                                                <MaskedInput
                                                  {...field}
                                                  placeholder="MM/DD"
                                                  placeholderChar={'\u2000'}
                                                  mask={[
                                                    /\d/,
                                                    /\d/,
                                                    '/',
                                                    /\d/,
                                                    /\d/
                                                  ]}
                                                  data-test="schedule-end-date"
                                                />
                                              )}
                                            />
                                          </div>
                                          {errors.startDate && (
                                            <div
                                              className={styles.formInputRow}
                                            >
                                              <div
                                                className={
                                                  styles.formInputErrorDiv
                                                }
                                              >
                                                <p
                                                  className={
                                                    styles.formInputErrorText
                                                  }
                                                >
                                                  {errors.startDate}
                                                </p>
                                              </div>
                                            </div>
                                          )}
                                          {errors.endDate && (
                                            <div
                                              className={styles.formInputRow}
                                            >
                                              <div
                                                className={
                                                  styles.formInputErrorDiv
                                                }
                                              >
                                                <p
                                                  className={
                                                    styles.formInputErrorText
                                                  }
                                                >
                                                  {errors.endDate}
                                                </p>
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                      )
                                    }}
                                  </Feature>
                                  <div className={styles.formInputRow}>
                                    <div className={styles.dayNavigator}>
                                      {days.map(({ value, displayValue }) => (
                                        <div
                                          key={`day-${value}`}
                                          className={classNames(
                                            styles.button,
                                            selectedDay === value
                                              ? styles.buttonPrimary
                                              : styles.buttonSecondary,
                                            styles.dayNavigatorButton
                                          )}
                                          onClick={() =>
                                            this.changeSelectedDay(value)
                                          }
                                        >
                                          {displayValue}
                                        </div>
                                      ))}
                                      <div
                                        className={classNames(
                                          styles.button,
                                          selectedDay === 'holiday'
                                            ? styles.buttonPrimary
                                            : styles.buttonSecondary,
                                          styles.dayNavigatorButton
                                        )}
                                        onClick={() =>
                                          this.changeSelectedDay('holiday')
                                        }
                                        style={{
                                          width: '10%',
                                          textTransform: 'unset'
                                        }}
                                      >
                                        <span
                                          className={styles.holidayButtonWeb}
                                        >
                                          Holidays
                                        </span>
                                        <span
                                          className={styles.holidayButtonMob}
                                        >
                                          H
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                  <FieldArray name={selectedDay}>
                                    {arrayHelpers => {
                                      let disableAddTime =
                                        values[selectedDay].length === 24
                                      // !isValid &&
                                      // values[selectedDay] &&
                                      // values[selectedDay].length > 0
                                      return (
                                        <div>
                                          {values[selectedDay].map(
                                            (daySchedule, index) => (
                                              <div
                                                className={styles.formInputRow}
                                                key={`${selectedDay}-${index}`}
                                              >
                                                {values.schedule
                                                  .scheduleType ===
                                                'operational' ? (
                                                  <OperationalSchedule
                                                    periods={periodOptions}
                                                    daySchedule={daySchedule}
                                                    day={selectedDay}
                                                    type={values.scheduleType}
                                                    index={index}
                                                    setFieldValue={
                                                      setFieldValue
                                                    }
                                                    handleWeeklyHoursChange={
                                                      this
                                                        .handleWeeklyHoursChange
                                                    }
                                                    values={values}
                                                    onRemoveTimeBlock={() => {
                                                      arrayHelpers.remove(index)
                                                      this.handleWeeklyHoursChange(
                                                        {
                                                          ...values,
                                                          [selectedDay]: [
                                                            ...values[
                                                              selectedDay
                                                            ].slice(0, index),
                                                            ...values[
                                                              selectedDay
                                                            ].slice(index + 1)
                                                          ]
                                                        },
                                                        null,
                                                        selectedDay
                                                      )
                                                    }}
                                                  />
                                                ) : (
                                                  <SetPointSchedule
                                                    periods={periodOptions}
                                                    daySchedule={daySchedule}
                                                    day={selectedDay}
                                                    type={values.scheduleType}
                                                    index={index}
                                                    setFieldValue={
                                                      setFieldValue
                                                    }
                                                    onRemoveTimeBlock={() =>
                                                      arrayHelpers.remove(index)
                                                    }
                                                  />
                                                )}
                                              </div>
                                            )
                                          )}
                                          <div
                                            className={styles.formInputRow}
                                            style={{ justifyContent: 'center' }}
                                          >
                                            <div
                                              className={classNames(
                                                styles.formInput,
                                                styles.buttonDropdown,
                                                {
                                                  [styles.buttonDisable]: disableAddTime
                                                }
                                              )}
                                              style={{ width: 'auto' }}
                                            >
                                              <Field
                                                component="select"
                                                className={classNames({
                                                  [styles.buttonDisable]: disableAddTime
                                                })}
                                                value={''}
                                                disabled={disableAddTime}
                                                name="hour"
                                                data-test="schedule-select-time"
                                                onChange={e => {
                                                  let insertIndex = values[
                                                    selectedDay
                                                  ].findIndex(slot => {
                                                    return (
                                                      slot.hour > e.target.value
                                                    )
                                                  })

                                                  if (insertIndex === -1) {
                                                    insertIndex =
                                                      values[selectedDay].length
                                                  }

                                                  const inserted = Object.assign(
                                                    {
                                                      period:
                                                        values.schedule
                                                          .scheduleType ===
                                                        'operational'
                                                          ? 'unoccupied'
                                                          : ''
                                                    },
                                                    values[selectedDay][
                                                      insertIndex - 1
                                                    ],
                                                    {
                                                      hour: parseInt(
                                                        e.target.value
                                                      )
                                                    }
                                                  )
                                                  if (!inserted.value)
                                                    inserted.value = 0

                                                  setFieldValue(selectedDay, [
                                                    ...values[
                                                      selectedDay
                                                    ].slice(0, insertIndex),
                                                    inserted,
                                                    ...values[
                                                      selectedDay
                                                    ].slice(insertIndex)
                                                  ])
                                                  this.handleWeeklyHoursChange(
                                                    {
                                                      ...values,
                                                      [selectedDay]: [
                                                        ...values[
                                                          selectedDay
                                                        ].slice(0, insertIndex),
                                                        inserted,
                                                        ...values[
                                                          selectedDay
                                                        ].slice(insertIndex)
                                                      ]
                                                    },
                                                    null,
                                                    selectedDay
                                                  )
                                                }}
                                              >
                                                <option defaultValue>
                                                  Add Time Period
                                                </option>
                                                {range(24)
                                                  .filter(
                                                    hour =>
                                                      values[selectedDay] &&
                                                      !values[selectedDay].find(
                                                        day => hour === day.hour
                                                      )
                                                  )
                                                  .map(hour => (
                                                    <option
                                                      value={hour}
                                                      key={`time-${hour}`}
                                                    >
                                                      {getTime(hour)}
                                                    </option>
                                                  ))}
                                              </Field>
                                            </div>
                                          </div>
                                        </div>
                                      )
                                    }}
                                  </FieldArray>
                                  {days.map(
                                    ({ value }) =>
                                      errors[value] && (
                                        <div
                                          key={`error-${value}`}
                                          className={styles.formInputRow}
                                        >
                                          <div
                                            className={styles.formInputErrorDiv}
                                          >
                                            <p
                                              className={
                                                styles.formInputErrorText
                                              }
                                            >
                                              {errors[value]}
                                            </p>
                                          </div>
                                        </div>
                                      )
                                  )}
                                </FormSection>
                              )}
                              {values.schedule._id && (
                                <FormSection
                                  title="Comments"
                                  description="Add comments related to the project"
                                  setSectionRef={this.props.setSectionRef}
                                >
                                  <Field
                                    label="Comments"
                                    component="textarea"
                                    name="comments"
                                    data-test="schedule-comments"
                                    placeholder="Add comments about this project"
                                  />
                                </FormSection>
                              )}

                              {values.schedule._id &&
                                values.scheduleType === 'operational' &&
                                this.renderBuildingEquipments()}

                              <Footer>
                                <button
                                  type="button"
                                  className={classNames(
                                    styles.button,
                                    styles.buttonSecondary
                                  )}
                                  onClick={this.props.onClose}
                                >
                                  Cancel
                                </button>
                                {showSubmit && (
                                  <button
                                    className={classNames(
                                      styles.button,
                                      styles.buttonPrimary,
                                      { [styles.buttonDisable]: !isValid }
                                    )}
                                    disabled={!isValid}
                                    data-test="schedule-submit-button"
                                    type="submit"
                                    onClick={event => {
                                      event.preventDefault()
                                      setSubmitting(true)
                                      this.onSubmit(
                                        executeMutation,
                                        values
                                      ).then(() => {
                                        setSubmitting(false)
                                      })
                                      event.stopPropagation()
                                    }}
                                  >
                                    {loading || isSubmitting ? (
                                      <Loader size="button" color="white" />
                                    ) : (
                                      submitText
                                    )}
                                  </button>
                                )}
                              </Footer>
                            </Form>
                          )
                        }}
                      </Formik>
                    )
                  }}
                </Query>
              )}
            </Query>
          </div>
        )}
      </Mutation>
    )
  }
}

export default OperationForm
