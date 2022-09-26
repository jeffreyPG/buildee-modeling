import React from 'react'
import uuid from 'uuid'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import styles from '../../Template/Template.scss'
import projectStyles from '../../Project/ProjectList.scss'
import editor from './ExcelEditor.scss'
import { parentNodeHasClass } from '../../../utils/Utils'
import Project from '../TemplateComponent/BodyComponents/Project'
import Equipment from '../TemplateComponent/BodyComponents/Equipment'
import DraggableList from './DraggableList'
import { Query } from 'react-apollo'
import { GET_SYSTEM_TYPES } from '../../../utils/graphql/queries/systems.js'
import { TabDelete } from '../../Template/TabDelete'
import { MaxSheetLimit } from '../../Template/MaxSheetLimit'
import { Loader } from '../../../utils/Loader'
import moment from 'moment'
import utilFuels from '../../../static/utils-fuels'
import CustomRange from '../../../utils/customRange.js'
import UserFeature from 'utils/Feature/UserFeature'

const initialState = {
  tabs: [
    {
      _id: uuid(),
      order: 1,
      name: 'Untitled',
      datasource: '',
      metaData: [],
      year: '',
      columnHeadings: []
    }
  ]
}

export class ExcelEditor extends React.Component {
  static propTypes = {
    deleteTemplate: PropTypes.func,
    nameTemplate: PropTypes.func.isRequired,
    saveSpreadsheetTemplate: PropTypes.func,
    templateId: PropTypes.string,
    templateView: PropTypes.object.isRequired,
    updateTemplate: PropTypes.func,
    handleTemplateUpdated: PropTypes.func,
    proUser: PropTypes.bool.isRequired,
    typeTemplate: PropTypes.string,
    editMode: PropTypes.bool
  }

  state = {
    editMode: true,
    editTabNameMode: false,
    dataSourceDropdown: false,
    windowWidth: '',
    tabs: initialState['tabs'],
    currentTab: initialState['tabs'][0],
    dataSourceList: [
      { name: 'Overview & Property', value: 'Overview & Property' },
      { name: 'Utilities', value: 'Utilities' },
      { name: 'Equipment', value: 'Equipment' },
      { name: 'Locations', value: 'Locations' },
      {
        name: 'Systems',
        value: 'Systems',
        featureFlag: 'buildingSystem'
      },
      {
        name: 'Construction',
        value: 'Construction',
        featureFlag: 'buildingConstruction'
      }
    ],
    dataUtility: [
      { name: 'Summary', value: 'summary' },
      { name: 'Monthly by Fuel Type', value: 'fuelType' }
    ],
    yearRange: [
      {
        label: 'Last 12 Months',
        value: '12'
      },
      {
        label: 'Last 36 Months',
        value: '36'
      },
      {
        label: 'Custom',
        value: 'Custom'
      }
    ],
    monthList: [],
    yearList: [],
    projectCol: '',
    projectLayout: 'Horizontal',
    datasource: '',
    templateView: {},
    sheetList: [],
    templateName: '',
    eqId: '',
    templateError: false,
    deleteToggleOpen: false,
    showDeleteTabModal: false,
    title: 'Add Sheet',
    maxLimit: false
  }

  /** @description  This function is called only when the data source is Equipment or the type of template is project to save
   * the category, application and technology and other metadata
   */
  handleUpdateTemplateState = updatedTemplate => {
    this.setState({ templateView: updatedTemplate })
    const { tabs, currentTab, eqId } = this.state
    const updatedTabs = tabs.map(tab => {
      if (tab._id === currentTab._id) {
        return {
          ...tab,
          metaData: {
            category: updatedTemplate.sheets[eqId].metaData.category,
            application: updatedTemplate.sheets[eqId].metaData.application,
            technology: updatedTemplate.sheets[eqId].metaData.technology,
            layout:
              this.props.typeTemplate === 'project'
                ? this.state.projectLayout
                : ''
          }
        }
      } else {
        return tab
      }
    })
    this.setState({
      tabs: updatedTabs,
      currentTab: {
        ...currentTab,
        metaData: {
          category: updatedTemplate.sheets[eqId].metaData.category,
          application: updatedTemplate.sheets[eqId].metaData.application,
          technology: updatedTemplate.sheets[eqId].metaData.technology,
          layout:
            this.props.typeTemplate === 'project'
              ? this.state.projectLayout
              : ''
        }
      }
    })
    this.props.handleTemplateUpdated(true)
  }
  //
  /** @description  Called when the user clicks on the delete button on top right to open up a toggle*/
  handleDeleteToggle = toggle => {
    if (toggle) {
      this.setState({ deleteToggleOpen: !this.state.deleteToggleOpen })
    } else {
      this.setState({ deleteToggleOpen: false })
    }
  }
  handleMaxLimit() {
    this.setState({ maxLimit: !this.state.maxLimit })
  }
  componentWillUnmount = () => {
    document.removeEventListener('mousedown', this.handleClick, false)
    window.removeEventListener('resize', this.handleUpdateDimensions)
  }

  UNSAFE_componentWillMount = () => {
    this.handleUpdateDimensions()
    document.addEventListener('mousedown', this.handleClick, false)
    window.addEventListener('resize', this.handleUpdateDimensions)
    let num = 0
    this.setState({
      monthList: moment.months().map(function(currenValue, index) {
        return { label: currenValue, value: currenValue }
      }),
      yearList: Array.apply(null, { length: 22 }).map((e, i) => ({
        label: moment()
          .subtract(num, 'years')
          .format('YYYY'),
        value: moment()
          .subtract(num++, 'years')
          .format('YYYY')
      }))
    })
    if (this.props.editMode) {
      let tabList = []
      let layout
      if (
        this.props.templateView.sheets.length > 0 &&
        this.props.templateView._id != undefined
      ) {
        let list = this.props.templateView.sheets

        if (this.props.templateView.type === 'project') {
          layout = list[0].metaData.layout
        }
        list.map(function(each) {
          tabList.push({
            _id: each._id,
            order: each.order,
            name: each.name,
            datasource: each.datasource,
            metaData: each.metaData,
            year: '',
            columnHeadings: each.columnHeadings
          })
        })
      }
      this.setState({
        tabs: tabList,
        currentTab: tabList[tabList.length - 1],
        templateView: this.props.templateView,
        templateName: this.props.templateView.name,
        eqId: this.props.templateView.sheets.length - 1,
        projectLayout: layout,
        title: tabList.length === 10 ? 'Sheet limit reached' : 'Add Sheet'
      })
    } else {
      this.setState({
        templateView: this.props.templateView,
        templateName: this.props.templateView.name,
        eqId: 0
      })
    }
  }
  componentDidMount() {
    if (this.props.typeTemplate === 'project') {
      this.state.templateView.sheets[0].datasource = 'Project'
      this.setState({
        projectLayout: this.props.templateView.sheets[0].metaData.layout,
        projectWithSubMeasureOption:
          this.props.templateView.sheets[0].metaData.subMeasureOption ||
          'Summary'
      })
    }
  }

  /** @description  called when view is changed from desktop -> mobile -> desktop... */
  handleUpdateDimensions = () => {
    this.setState({ windowWidth: window.innerWidth })
  }

  handleClick = e => {
    // the click is inside, continue to menu links
    if (parentNodeHasClass(e.target, 'sourceClick')) return
    // otherwise, toggle (close) the app dropdown
    this.closeDropdown()
  }

  /** @description  function is used to close the data source drop down*/
  closeDropdown = () => {
    this.setState({ dataSourceDropdown: false })
  }

  /** @description  function called to toggle the data source dropdown*/
  ToggleDropdown = () => {
    this.setState({ dataSourceDropdown: !this.state.dataSourceDropdown })
  }

  handleDoubleClick = () => {
    this.setState({
      editTabNameMode: true
    })
  }

  handleEditTabName = e => {
    const { currentTab, tabs } = this.state
    let tabName = e.target.value.trim()
    const updatedTabs = tabs.map(tab => {
      if (tab._id === currentTab._id) {
        return {
          ...tab,
          name: tabName
        }
      } else {
        return tab
      }
    })

    this.setState({
      tabs: updatedTabs,
      currentTab: {
        ...currentTab,
        name: tabName
      }
    })
  }

  handleOnBlur = () => {
    this.setState({
      editTabNameMode: false
    })
  }
  handleTemplateError = boolean => {
    this.setState({ templateError: boolean })
  }

  /**@description  called to open a modal window, for confirmation to delete a sheet/tab*/
  toggleDeleteTab = () => {
    const { tabs } = this.state
    if (tabs.length > 1) {
      this.setState({ showDeleteTabModal: !this.state.showDeleteTabModal })
    }
  }

  /** @description  perpetual call to this function from render, this holds all the added tabs and maintains the sequence with the
   * help of DraggableList/List for drag and drop functionality
   */
  createTabs = () => {
    const { tabs } = this.state
    const props = this.props

    if (tabs.length === 1) {
      tabs[0].order = tabs.length
    }
    return (
      <div className={styles.addTabs}>
        <DraggableList
          tabs={tabs}
          {...this.state}
          props={props}
          handleAddTab={this.handleAddTab}
          handleDataChange={this.handleDataChange}
          handleDoubleClick={this.handleDoubleClick}
          handleEditTabName={this.handleEditTabName}
          handleOnBlur={this.handleOnBlur}
          handleSelectTab={this.handleSelectTab}
        />
      </div>
    )
  }

  /** @description called when the user directly clicks on any of the tabs */
  handleSelectTab = tab => {
    if (tab.datasource === 'Equipment') {
      let list = this.state.templateView.sheets

      list.map((item, index) => {
        if (item._id === tab._id) {
          this.setState({
            currentTab: tab,
            editMode: true,
            editTabNameMode: false,
            eqId: index
          })
        }
      })
    } else {
      this.setState({
        currentTab: tab,
        editMode: true,
        editTabNameMode: false
      })
    }
  }

  /** @description  called when user clicks on the + button in the tab sequence/array
   * no. of tabs limited to 10 for now
   */
  handleAddTab = () => {
    if (this.state.tabs.length <= 9) {
      const { tabs, eqId, templateView } = this.state
      const newTabObject = {
        _id: uuid(),
        order: tabs.length == 0 ? 0 : tabs.length + 1,
        name: this.state.sheetName !== '' ? 'Untitled' : this.state.sheetName,
        datasource: '',
        metaData: [],
        year: '',
        columnHeadings: [{ name: '' }]
      }
      templateView.sheets = [...tabs, newTabObject]
      if (this.state.tabs.length === 9) {
        this.setState({
          title: 'Sheet limit reached',
          maxLimit: !this.state.maxLimit
        })
      }
      this.setState({
        tabs: [...tabs, newTabObject],
        currentTab: newTabObject,
        editMode: true,
        editTabNameMode: false,
        eqId: eqId + 1
      })
    }
  }

  /** @description  called to reset the tabs, helps in deleting a particular tab*/
  handleDeleteTab = tabToDelete => {
    const { tabs } = this.state

    if (tabs.length > 1) {
      const tabToDeleteIndex = tabs.findIndex(
        tab => tab._id === tabToDelete._id
      )

      const updatedTabs = tabs.filter((tab, index) => {
        return index !== tabToDeleteIndex
      })

      const previousTab =
        tabs[tabToDeleteIndex - 1] || tabs[tabToDeleteIndex + 1] || {}

      let eqIndex
      if (previousTab.datasource == 'Equipment')
        eqIndex = tabToDeleteIndex - 1 || tabToDeleteIndex + 1 || 0
      if (this.state.tabs.length !== 9) {
        this.setState({ title: 'Add Sheet' })
      }
      if (tabs.length > 1) {
        this.setState({
          eqId: eqIndex !== undefined ? eqIndex : this.state.eqId,
          tabs: updatedTabs,
          editMode: true,
          editTabNameMode: false,
          currentTab: previousTab,
          showDeleteTabModal: !this.state.showDeleteTabModal
        })
      } else {
        this.setState({
          eqId: eqIndex !== undefined ? eqIndex : this.state.eqId,
          tabs: updatedTabs,
          editMode: false,
          editTabNameMode: false,
          currentTab: '',
          showDeleteTabModal: !this.state.showDeleteTabModal
        })
      }
      this.state.templateView.sheets = updatedTabs
    }
  }

  /** @description called for template name change */
  handleTypeNameTemplate = e => {
    this.setState({ templateName: e.target.value })
    this.props.nameTemplate(e.target.value)
  }

  /** @description  called during project template builder, to set the layout */
  setLayout = layout => {
    this.setState({ projectLayout: layout })
  }
  setSubMeasureOption = option => {
    this.setState({ projectWithSubMeasureOption: option })
  }
  /**
   * @description function called when any of the following : name of sheet, data source, summary, fuel type, year , system type
   * is selected in the form
   */
  handleDataChange = e => {
    const {
      tabs,
      currentTab,
      dataUtility,
      yearRange,
      datasource,
      monthList,
      yearList
    } = this.state
    let eqIndex
    let id = e.target.id
    let value = e.target.value
    let isUtitlity = false

    if (id === 'Sheets' && value.trim() === '') {
      this.setState({
        currentTab: {
          ...currentTab,
          name: 'Untitled'
        }
      })
    }
    if (id === 'DataSource' && value === 'Utilities') {
      isUtitlity = true
    } else {
      if (id === 'DataSource') isUtitlity = false
      else
        isUtitlity =
          datasource === 'Utilities' ||
          value === 'Utilities' ||
          currentTab.datasource === 'Utilities'
    }

    const updatedTabs = tabs.map((tab, index) => {
      if (tab._id === currentTab._id) {
        if (value === 'Equipment') {
          eqIndex = index
        }
        return {
          ...tab,
          name: id === 'Sheets' ? value.trim() : currentTab.name,
          datasource:
            id === 'DataSource'
              ? value
              : tab._id === currentTab._id
              ? currentTab.datasource
              : tab.datasource,
          metaData:
            id === 'fuelType' &&
            isUtitlity &&
            currentTab.metaData.data === 'fuelType'
              ? {
                  fuelType: value,
                  data: currentTab.metaData.data || '',
                  year: currentTab.metaData.year || yearRange[0].value || '',
                  selectedStartMonth:
                    currentTab.metaData.selectedStartMonth ||
                    monthList[0].value,
                  selectedEndMonth:
                    currentTab.metaData.selectedEndMonth ||
                    monthList[monthList - 1].value,
                  selectedStartYear:
                    currentTab.metaData.selectedStartYear || yearList[0].value,
                  selectedEndYear:
                    currentTab.metaData.selectedEndYear || yearList[0].value
                }
              : id === 'summary'
              ? {
                  data: value,
                  fuelType:
                    value === 'fuelType'
                      ? utilFuels[0].value || currentTab.metaData.fuelType || ''
                      : '',
                  year: currentTab.metaData.year || yearRange[0].value || '',
                  selectedStartMonth:
                    currentTab.metaData.selectedStartMonth ||
                    monthList[0].value,
                  selectedEndMonth:
                    currentTab.metaData.selectedEndMonth ||
                    monthList[monthList.length - 1].value,
                  selectedStartYear:
                    currentTab.metaData.selectedStartYear || yearList[0].value,
                  selectedEndYear:
                    currentTab.metaData.selectedEndYear || yearList[0].value
                }
              : id === 'selectedStartMonth'
              ? {
                  selectedStartMonth: value,
                  year: currentTab.metaData.year || '',
                  fuelType: currentTab.metaData.fuelType || '',
                  data: currentTab.metaData.data || '',
                  selectedStartYear:
                    currentTab.metaData.selectedStartYear || yearList[0].value,
                  selectedEndYear:
                    currentTab.metaData.selectedEndYear || yearList[0].value,
                  selectedEndMonth:
                    currentTab.metaData.selectedEndMonth ||
                    monthList[monthList.length - 1].value
                }
              : id === 'selectedEndMonth'
              ? {
                  selectedEndMonth: value,
                  year: currentTab.metaData.year || '',
                  fuelType: currentTab.metaData.fuelType || '',
                  data: currentTab.metaData.data || '',
                  selectedStartYear:
                    currentTab.metaData.selectedStartYear || yearList[0].value,
                  selectedEndYear:
                    currentTab.metaData.selectedEndYear || yearList[0].value,
                  selectedStartMonth:
                    currentTab.metaData.selectedStartMonth || monthList[0].value
                }
              : id === 'selectedStartYear'
              ? {
                  selectedStartYear: value,
                  year: currentTab.metaData.year || '',
                  fuelType: currentTab.metaData.fuelType || '',
                  data: currentTab.metaData.data || '',
                  selectedStartMonth:
                    currentTab.metaData.selectedStartMonth ||
                    monthList[0].value,
                  selectedEndMonth:
                    currentTab.metaData.selectedEndMonth ||
                    monthList[monthList.length - 1].value,
                  selectedEndYear:
                    currentTab.metaData.selectedEndYear || yearList[0].value
                }
              : id === 'selectedEndYear'
              ? {
                  selectedEndYear: value,
                  year: currentTab.metaData.year || '',
                  fuelType: currentTab.metaData.fuelType || '',
                  data: currentTab.metaData.data || '',
                  selectedStartMonth:
                    currentTab.metaData.selectedStartMonth ||
                    monthList[0].value,
                  selectedEndMonth:
                    currentTab.metaData.selectedEndMonth ||
                    monthList[monthList.length - 1].value,
                  selectedStartYear:
                    currentTab.metaData.selectedStartYear || yearList[0].value
                }
              : id === 'year' && value === 'Custom'
              ? {
                  year: value,
                  fuelType: currentTab.metaData.fuelType || '',
                  data: currentTab.metaData.data || '',
                  selectedStartMonth:
                    currentTab.metaData.selectedStartMonth ||
                    monthList[0].value,
                  selectedEndMonth:
                    currentTab.metaData.selectedEndMonth ||
                    monthList[monthList.length - 1].value,
                  selectedStartYear:
                    currentTab.metaData.selectedStartYear || yearList[0].value,
                  selectedEndYear:
                    currentTab.metaData.selectedEndYear || yearList[0].value
                }
              : id === 'year' && value !== 'Custom'
              ? {
                  year: value,
                  fuelType: currentTab.metaData.fuelType || '',
                  data: currentTab.metaData.data || '',
                  selectedStartMonth: '',
                  selectedEndMonth: '',
                  selectedStartYear: '',
                  selectedEndYear: ''
                }
              : id === 'systemType'
              ? { systemType: value || currentTab.metaData.systemType }
              : {
                  systemType: currentTab.metaData.systemType || '',
                  category: currentTab.metaData.category || '',
                  application: currentTab.metaData.application || '',
                  technology: currentTab.metaData.technology || '',
                  layout: currentTab.metaData.layout || '',
                  data: isUtitlity
                    ? currentTab.metaData.data || dataUtility[0].value || ''
                    : '',
                  fuelType: isUtitlity
                    ? currentTab.metaData.fuelType || ''
                    : '',
                  year: isUtitlity
                    ? currentTab.metaData.year || yearRange[0].value || ''
                    : '',
                  selectedStartMonth: isUtitlity
                    ? currentTab.metaData.selectedStartMonth ||
                      monthList[0].value
                    : '',
                  selectedEndMonth: isUtitlity
                    ? currentTab.metaData.selectedEndMonth ||
                      monthList[monthList.length - 1].value
                    : '',
                  selectedStartYear: isUtitlity
                    ? currentTab.metaData.selectedStartYear || yearList[0].value
                    : '',
                  selectedEndYear: isUtitlity
                    ? currentTab.metaData.selectedEndYear || yearList[0].value
                    : ''
                }
        }
      } else {
        return tab
      }
    })
    this.setState({
      tabs: updatedTabs,
      eqId: eqIndex !== undefined ? eqIndex : this.state.eqId,
      datasource: id === 'DataSource' ? value : currentTab.datasource,
      currentTab: {
        ...currentTab,
        name: id === 'Sheets' ? value : currentTab.name,
        datasource: id === 'DataSource' ? value : currentTab.datasource,
        metaData:
          id === 'fuelType'
            ? {
                fuelType: value,
                data: currentTab.metaData.data || '',
                year: currentTab.metaData.year || '',
                selectedStartMonth:
                  currentTab.metaData.selectedStartMonth || monthList[0].value,
                selectedEndMonth:
                  currentTab.metaData.selectedEndMonth ||
                  monthList[monthList - 1].value,
                selectedStartYear:
                  currentTab.metaData.selectedStartYear || yearList[0].value,
                selectedEndYear:
                  currentTab.metaData.selectedEndYear || yearList[0].value
              }
            : id === 'selectedStartMonth' &&
              currentTab.metaData.year === 'Custom'
            ? {
                selectedStartMonth: value,
                fuelType: currentTab.metaData.fuelType || '',
                year: currentTab.metaData.year || '',
                data: currentTab.metaData.data || '',
                selectedStartYear:
                  currentTab.metaData.selectedStartYear || yearList[0].value,
                selectedEndYear:
                  currentTab.metaData.selectedEndYear || yearList[0].value,
                selectedEndMonth:
                  currentTab.metaData.selectedEndMonth ||
                  monthList[monthList.length - 1].value
              }
            : id === 'selectedEndMonth' && currentTab.metaData.year === 'Custom'
            ? {
                selectedEndMonth: value,
                fuelType: currentTab.metaData.fuelType || '',
                year: currentTab.metaData.year || '',
                data: currentTab.metaData.data || '',
                selectedStartYear:
                  currentTab.metaData.selectedStartYear || yearList[0].value,
                selectedEndYear:
                  currentTab.metaData.selectedEndYear || yearList[0].value,
                selectedStartMonth:
                  currentTab.metaData.selectedStartMonth || monthList[0].value
              }
            : id === 'selectedStartYear' &&
              currentTab.metaData.year === 'Custom'
            ? {
                selectedStartYear: value,
                fuelType: currentTab.metaData.fuelType || '',
                year: currentTab.metaData.year || '',
                data: currentTab.metaData.data || '',
                selectedStartMonth:
                  currentTab.metaData.selectedStartMonth || monthList[0].value,
                selectedEndMonth:
                  currentTab.metaData.selectedEndMonth ||
                  monthList[monthList.length - 1].value,
                selectedEndYear:
                  currentTab.metaData.selectedEndYear || yearList[0].value
              }
            : id === 'selectedEndYear' && currentTab.metaData.year === 'Custom'
            ? {
                selectedEndYear: value,
                fuelType: currentTab.metaData.fuelType || '',
                year: currentTab.metaData.year || '',
                selectedMonth: currentTab.metaData.selectedMonth || '',
                data: currentTab.metaData.data || '',
                selectedStartMonth:
                  currentTab.metaData.selectedStartMonth || monthList[0].value,
                selectedEndMonth:
                  currentTab.metaData.selectedEndMonth ||
                  monthList[monthList.length - 1].value,
                selectedStartYear:
                  currentTab.metaData.selectedStartYear || yearList[0].value
              }
            : id === 'summary'
            ? {
                data: value,
                fuelType:
                  value === 'fuelType'
                    ? currentTab.metaData.fuelType || utilFuels[0].value || ''
                    : '',
                year: currentTab.metaData.year || yearRange[0].value || '',
                selectedStartMonth:
                  currentTab.metaData.selectedStartMonth || monthList[0].value,
                selectedEndMonth:
                  currentTab.metaData.selectedEndMonth ||
                  monthList[monthList.length - 1].value,
                selectedStartYear:
                  currentTab.metaData.selectedStartYear || yearList[0].value,
                selectedEndYear:
                  currentTab.metaData.selectedEndYear || yearList[0].value
              }
            : id === 'year' && value === 'Custom'
            ? {
                year: value,
                fuelType: currentTab.metaData.fuelType || '',
                data: currentTab.metaData.data || '',
                selectedStartMonth:
                  currentTab.metaData.selectedStartMonth || monthList[0].value,
                selectedEndMonth:
                  currentTab.metaData.selectedEndMonth ||
                  monthList[monthList.length - 1].value,
                selectedStartYear:
                  currentTab.metaData.selectedStartYear || yearList[0].value,
                selectedEndYear:
                  currentTab.metaData.selectedEndYear || yearList[0].value
              }
            : id === 'year' && value !== 'Custom'
            ? {
                year: value,
                fuelType: currentTab.metaData.fuelType || '',
                data: currentTab.metaData.data || '',
                selectedStartMonth: '',
                selectedEndMonth: '',
                selectedStartYear: '',
                selectedEndYear: ''
              }
            : id === 'systemType'
            ? { systemType: value || currentTab.metaData.systemType }
            : {
                systemType: currentTab.metaData.systemType || '',
                data: isUtitlity
                  ? currentTab.metaData.data || dataUtility[0].value || ''
                  : '',
                fuelType: isUtitlity ? currentTab.metaData.fuelType || '' : '',
                year: isUtitlity
                  ? currentTab.metaData.year || yearRange[0].value || ''
                  : '',
                selectedStartMonth: isUtitlity
                  ? currentTab.metaData.selectedStartMonth || monthList[0].value
                  : '',
                selectedEndMonth: isUtitlity
                  ? currentTab.metaData.selectedEndMonth ||
                    monthList[monthList.length - 1].value
                  : '',
                selectedStartYear: isUtitlity
                  ? currentTab.metaData.selectedStartYear || yearList[0].value
                  : '',
                selectedEndYear: isUtitlity
                  ? currentTab.metaData.selectedEndYear || yearList[0].value
                  : '',
                category: currentTab.metaData.category || '',
                application: currentTab.metaData.application || '',
                technology: currentTab.metaData.technology || '',
                layout: currentTab.metaData.layout || ''
              }
      }
    })
    this.props.handleTemplateUpdated(true)
    this.state.templateView.sheets = updatedTabs
    if (e.target.id == 'DataSource') {
      this.ToggleDropdown()
    }
  }

  /**
   * @description API call for saving a template(not update), delete the ids before sending the template
   */
  handleSaveTemplate = () => {
    // to avoid creating multiple submissions
    if (!this.state.disableSubmit) {
      const { templateView, typeTemplate, projectLayout } = this.props
      const { tabs } = this.state

      this.setState({ disableSubmit: true })
      let tab = tabs.map(function(props) {
        let newProps = { ...props }
        newProps = {
          ...newProps,
          name: newProps.name.trim() === '' ? 'Untitled' : newProps.name.trim()
        }
        delete newProps._id
        return newProps
      })
      templateView.sheets = tab
      if (typeTemplate === 'project') {
        if (templateView.sheets[0].metaData.length === 0) {
          let layout = { layout: this.state.projectLayout || 'Horizontal' }
          templateView.sheets[0].metaData = layout
        } else {
          let layout = this.state.projectLayout || 'Horizontal'
          templateView.sheets[0].metaData.layout = layout
        }
        templateView.sheets[0].datasource = 'Project'
        templateView.type = 'project'
      }
      this.props
        .saveSpreadsheetTemplate(this.state.templateView)
        .then(() => {
          this.setState({ disableSubmit: false })
        })
        .catch(() => {
          this.setState({ disableSubmit: false })
        })
      this.setState({
        templateView: {
          ...templateView,
          sheets: tabs
        }
      })
    }
    this.props.handleTemplateUpdated(false)
  }

  /**
   * @description API call to delete a template
   */
  handleDeleteTemplate = () => {
    this.props.deleteTemplate(this.props.templateId)
  }

  /** @description  This function is used while editing the existing template and then saving it(API call) */
  handleUpdateTemplate = () => {
    let list = []
    let { templateView, tabs, projectLayout } = this.state
    let { typeTemplate, templateId } = this.props
    tabs.map(function(each) {
      list.push({
        order: each.order,
        name: each.name.trim() === '' ? 'Untitled' : each.name.trim(),
        datasource: each.datasource,
        columnHeadings: each.columnHeadings,
        metaData: each.metaData
      })
    })
    templateView.sheets = list
    templateView.name = this.state.templateName
    if (typeTemplate === 'project') {
      if (templateView.sheets[0].metaData.length === 0) {
        let layout = { layout: this.state.projectLayout || 'Horizontal' }
        templateView.sheets[0].metaData = layout
      } else {
        let layout = this.state.projectLayout || 'Horizontal'
        templateView.sheets[0].metaData.layout = layout
      }
      let subMeasureOption = this.state.projectWithSubMeasureOption || 'Summary'
      templateView.sheets[0].metaData.subMeasureOption = subMeasureOption
    }
    this.props.updateTemplate(templateId, templateView)
    this.setState({
      templateView: {
        ...templateView,
        sheets: tabs
      }
    })
    this.props.handleTemplateUpdated(false)
  }

  /**
   * @description The following are functional components that render a specific set of either buttons or data source metadata
   */

  renderDeleteUpdateButton = () => {
    const { templateView } = this.props
    return (
      <div className={editor['well_edit']}>
        <button
          className={classNames(styles.button, styles.buttonDelete)}
          onClick={() => {
            this.handleDeleteToggle(true)
          }}
        >
          Delete
        </button>
        {this.state.templateError && (
          <button
            className={classNames(
              styles.button,
              styles.buttonPrimary,
              styles.buttonDisable
            )}
            data-test="update-template"
          >
            Update
          </button>
        )}
        {!this.state.templateError && (
          <button
            onClick={() => {
              this.handleUpdateTemplate()
            }}
            className={classNames(styles.button, styles.buttonPrimary)}
          >
            Update
          </button>
        )}
      </div>
    )
  }
  renderDeleteUpdate = () => {
    const { templateView } = this.props
    return (
      <div className={classNames(editor.well, editor.transparentBackGround)}>
        <div className={styles.name}>
          Name
          <br />
          <br />
          <div className={editor['well_edit']}>
            <input
              type="text"
              value={templateView.name || ''}
              placeholder="Template Name"
              maxLength="100"
              data-test="template-name"
              onChange={e => {
                this.handleTypeNameTemplate(e)
              }}
            />
          </div>
        </div>
      </div>
    )
  }
  renderSaveButton = () => {
    return (
      <div className={editor['well_edit']}>
        <button
          className={classNames(styles.button, styles.buttonPrimary)}
          onClick={e => this.handleSaveTemplate()}
          data-test="save-template"
        >
          SAVE
        </button>
      </div>
    )
  }
  renderSave = () => {
    const { templateView } = this.props
    return (
      <div>
        Name
        <br />
        <br />
        <div className={editor['well_edit']}>
          <input
            type="text"
            value={templateView.name || ''}
            placeholder="Template Name"
            maxLength="100"
            data-test="template-name"
            onChange={e => {
              this.handleTypeNameTemplate(e)
            }}
            onBlur={this.handleOnBlur}
          />
        </div>
      </div>
    )
  }
  renderDeleteSection = () => {
    return (
      <div className={styles['editor__delete']}>
        <span>Are you sure you want to delete this template?</span>
        <div className={styles['delete-buttons']}>
          <button
            className={classNames(styles.button, styles.buttonDelete)}
            onClick={() => this.handleDeleteTemplate()}
          >
            Yes, delete this template.
          </button>
          <button
            className={classNames(styles.button, styles.buttonSecondary)}
            onClick={() => this.handleDeleteToggle(false)}
          >
            Nope, nevermind!
          </button>
        </div>
      </div>
    )
  }
  renderUtilities = () => {
    const { currentTab, yearRange, monthList, yearList } = this.state
    let startMonth = currentTab.metaData.selectedStartMonth
      ? currentTab.metaData.selectedStartMonth
      : monthList[0].value
    let endMonth = currentTab.metaData.selectedEndMonth
      ? currentTab.metaData.selectedEndMonth
      : monthList[monthList.length - 1].value
    let startYear = currentTab.metaData.selectedStartYear
      ? currentTab.metaData.selectedStartYear
      : yearList[0].value
    let endYear = currentTab.metaData.selectedEndYear
      ? currentTab.metaData.selectedEndYear
      : yearList[0].value
    let startDate = moment(`${startYear} ${startMonth}`, 'YYYY MMMM')
      .utc()
      .startOf('month')
    let endDate = moment(`${endYear} ${endMonth}`, 'YYYY MMMM')
      .utc()
      .endOf('month')
    let checkEndDate = moment(`${endYear} ${endMonth}`, 'YYYY MMMM')
      .utc()
      .startOf('month')
    let now = moment()
      .utc()
      .endOf('month')
    endMonth =
      checkEndDate.diff(now) > 0 ? monthList[now.month()].value : endMonth
    return (
      <div>
        <div className={classNames(styles.tabContent, styles.tabArrow)}>
          <label>Data</label>
          <select
            name={'Summary'}
            type={'summary'}
            id="summary"
            value={currentTab.metaData.data}
            onChange={this.handleDataChange}
            className={styles.dropdownContainer}
          >
            {this.state.dataUtility.map(({ name, value }) => (
              <option value={value} key={`options-${name}-${value}`}>
                {name}
              </option>
            ))}
          </select>
        </div>
        <div className={editor.fuelDropdown}>
          {this.state.currentTab.datasource === 'Utilities' &&
            this.state.currentTab.metaData.data === 'fuelType' && (
              <div className={editor.fuelDropdownDiv}>
                <label>Fuel Type</label>
                <div className={projectStyles.selectContainer}>
                  <select
                    name={'fuelType'}
                    type={'fuelType'}
                    id="fuelType"
                    value={currentTab.metaData.fuelType}
                    onChange={this.handleDataChange}
                  >
                    {utilFuels.map(({ label, value }) => (
                      <option value={value} key={`options-${label}-${value}`}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          <div className={editor.fuelDropdownDiv}>
            <label>Year Range</label>
            <div className={projectStyles.selectContainer}>
              <select
                name={'year'}
                type={'year'}
                id="year"
                value={currentTab.metaData.year}
                onChange={this.handleDataChange}
              >
                {yearRange.map(({ label, value }) => (
                  <option value={value} key={`options-${label}-${value}`}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
        {currentTab.metaData.year == 'Custom' && (
          <div>
            <CustomRange
              handleChange={this.handleDataChange}
              startMonth={startMonth}
              startYear={startYear}
              endMonth={endMonth}
              endYear={endYear}
              startDate={startDate}
              endDate={endDate}
              monthList={monthList}
              yearList={yearList}
              page={'Excel'}
            />
          </div>
        )}
      </div>
    )
  }
  renderSystemMetaData = () => {
    const { currentTab } = this.state
    return (
      <Query query={GET_SYSTEM_TYPES}>
        {({ data }) => {
          const systemList = (data && data.systemTypes) || []
          return (
            <div className={classNames(styles.tabContent, styles.tabArrow)}>
              <label>System Type</label>
              {systemList.length == 0 && systemList == undefined && (
                <Loader size="button" color="white" />
              )}
              {systemList.length > 0 && systemList != undefined && (
                <div>
                  <select
                    name={'systemType'}
                    type={'systemType'}
                    id="systemType"
                    className={styles.dropdownContainer}
                    value={currentTab.metaData.systemType}
                    onChange={this.handleDataChange}
                  >
                    <option defaultValue value="">
                      Select system type
                    </option>
                    {systemList.map(({ name, _id }) => (
                      <option value={name} key={`options-${name}-${_id}`}>
                        {name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )
        }}
      </Query>
    )
  }
  renderProject = () => {
    const { projectLayout, projectWithSubMeasureOption } = this.state
    const { templateId, templateView } = this.props
    return (
      <div className={classNames(styles.boxed, styles.boxWithFullWidth)}>
        <h3>Sheet Layout for each Measure:</h3>
        <Project
          index={0}
          templateView={templateView}
          templateId={templateId}
          typeTemplate={'project'}
          handleUpdateTemplateState={this.handleUpdateTemplateState}
        />
        <div className={styles.layout}>
          <label className={styles.labelWithoutPadding}>Layout:</label>
          <label>Horizontal</label>
          <input
            type="radio"
            value={'Horizontal'}
            onChange={() => this.setLayout('Horizontal')}
            checked={
              projectLayout === undefined || projectLayout === 'Horizontal'
            }
          />
          <label>Vertical</label>
          <input
            type="radio"
            value="Vertical"
            onChange={() => this.setLayout('Vertical')}
            checked={projectLayout === 'Vertical'}
          />
        </div>

        <div className={styles.layout}>
          <label className={styles.labelWithoutPadding}>Measure Detail:</label>
          <label>Summary</label>
          <input
            type="radio"
            value={'Summary'}
            onChange={() => this.setSubMeasureOption('Summary')}
            checked={
              projectWithSubMeasureOption === undefined ||
              projectWithSubMeasureOption === 'Summary'
            }
          />
          <label>Equipment Line-by-Line</label>
          <input
            type="radio"
            value="SubMeasure"
            onChange={() => this.setSubMeasureOption('Equipment Line-by-Line')}
            checked={projectWithSubMeasureOption === 'Equipment Line-by-Line'}
          />
        </div>
      </div>
    )
  }

  render() {
    const {
      currentTab,
      editMode,
      eqId,
      showDeleteTabModal,
      tabs,
      maxLimit
    } = this.state
    const { typeTemplate, templateId } = this.props
    let eqIndex
    tabs.map((tab, index) => {
      if (tab._id === currentTab._id && currentTab.datasource === 'Equipment') {
        eqIndex = index
      }
    })
    return (
      <div>
        <div className={styles.spreadSheetContainer}>
          <div className={styles.container}>
            <div
              className={styles.templateBack}
              onClick={() => {
                this.props.push('/spreadsheet/templatelist')
              }}
            >
              <i className="material-icons">arrow_back</i>
              Back to template list
            </div>
            <div className={styles.templateHeading}>
              <h2>
                {(templateId && this.state.templateName) ||
                  (typeTemplate === 'building'
                    ? 'Add Building Report Template'
                    : 'Add Measure Report Template')}
              </h2>
              {templateId !== undefined
                ? this.renderDeleteUpdateButton()
                : this.renderSaveButton()}
            </div>
          </div>
        </div>
        <div className={editor.container}>
          {maxLimit && (
            <MaxSheetLimit
              message="You have reached the maximum number of sheets."
              onConfirm={this.handleMaxLimit.bind(this)}
            />
          )}
          {templateId && this.renderDeleteUpdate()}
          {typeTemplate === 'building' && (
            <div
              className={classNames(editor.well, editor.transparentBackGround)}
            >
              {templateId === undefined && this.renderSave()}
              {this.state.deleteToggleOpen && this.renderDeleteSection()}
              <div className={editor.description}>
                <div>Sheets</div>
                <div className={editor.descriptionText}>
                  Add sheets to your workbook, select a data source, and drag
                  and drop to order.
                </div>
              </div>
              <div>
                {this.createTabs()}
                {editMode ? (
                  <div
                    className={classNames(
                      styles.boxed,
                      styles.boxWithFullWidth
                    )}
                  >
                    {this.state.tabs.length > 1 && (
                      <a
                        title="Delete Tab"
                        onClick={() => {
                          this.toggleDeleteTab()
                        }}
                        data-test="delete-tab"
                      >
                        <i className="material-icons">close</i>
                      </a>
                    )}
                    {showDeleteTabModal && (
                      <TabDelete
                        message="Are you sure you want to delete this sheet?"
                        onCancel={this.toggleDeleteTab.bind(this)}
                        onConfirm={this.handleDeleteTab.bind(this)}
                        currentTab={currentTab}
                      />
                    )}
                    <div className={styles.tabContent}>
                      <label value="Sheets">Sheet Name</label>
                      <input
                        type="text"
                        name="Sheets"
                        id="Sheets"
                        maxLength="30"
                        minLength="0"
                        data-test="sheet-name"
                        value={currentTab.name}
                        onChange={e => {
                          this.handleDataChange(e)
                        }}
                      />
                    </div>
                    <div
                      className={classNames(styles.tabContent, styles.tabArrow)}
                    >
                      <label value="Source">Data Source</label>
                      <select
                        className={styles.dropdownContainer}
                        name={'Source'}
                        id="DataSource"
                        data-test="data-source"
                        value={this.state.currentTab.datasource}
                        onChange={this.handleDataChange}
                      >
                        <option defaultValue value="">
                          Select a datasource
                        </option>
                        {this.state.dataSourceList.map(
                          ({ name, value, featureFlag = null }) => {
                            if (featureFlag) {
                              return (
                                <UserFeature
                                  name={featureFlag}
                                  key={`options-${name}-${value}`}
                                >
                                  {({ enabled }) => {
                                    if (!enabled) return null
                                    return (
                                      <option
                                        value={name}
                                        key={`options-${name}-${value}`}
                                      >
                                        {name}
                                      </option>
                                    )
                                  }}
                                </UserFeature>
                              )
                            }
                            return (
                              <option
                                value={name}
                                key={`options-${name}-${value}`}
                              >
                                {name}
                              </option>
                            )
                          }
                        )}
                      </select>
                    </div>
                    {currentTab.datasource === 'Equipment' &&
                      typeTemplate === 'building' && (
                        <Equipment
                          index={
                            eqIndex !== undefined ? eqIndex : this.state.eqId
                          }
                          typeTemplate={typeTemplate}
                          action={templateId ? 'update' : 'create'}
                          id={this.state.currentTab._id}
                          templateView={this.state.templateView}
                          handleUpdateTemplateState={
                            this.handleUpdateTemplateState
                          }
                        />
                      )}
                    {currentTab.datasource === 'Systems' &&
                      this.renderSystemMetaData()}

                    {this.state.currentTab.datasource === 'Utilities' &&
                      this.renderUtilities()}
                  </div>
                ) : (
                  <div>
                    <p>{currentTab.content}</p>
                    {currentTab._id ? (
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between'
                        }}
                      />
                    ) : (
                      ''
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
          {typeTemplate === 'project' && (
            <div>
              <div
                className={classNames(
                  editor.well,
                  editor.transparentBackGround
                )}
              >
                {templateId === undefined && this.renderSave()}
                {this.state.deleteToggleOpen && this.renderDeleteSection()}
                <div className={editor.description}>
                  <div>Measures to Include</div>
                  <div className={editor.descriptionText}>
                    Measure Report templates export all measures into individual
                    worksheets by default. You can filter the measures to be
                    included and set layout of the headings.
                  </div>
                </div>
                {this.renderProject()}
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }
}
export default ExcelEditor
