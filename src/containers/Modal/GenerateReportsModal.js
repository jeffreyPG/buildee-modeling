import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import moment from 'moment'
import { connect } from 'react-redux'
import { throttle } from 'lodash'
import { sendReportTemplateEmail } from '../../routes/Template/modules/template'
import {
  downloadItem,
  downloadIntegrationApiItem,
  generateDownloadUrl,
  isProdEnv
} from '../../utils/Utils'
import { Loader } from '../../utils/Loader'
import WarningImage from '../../images/templateTOCwarning.png'
import styles from './GenerateReportsModal.scss'
import TemplateStyles from '../../components/Template/TemplateComponent/BodyComponents/TemplateTarget.scss'
import CustomYearRange from '../../components/UI/CustomYearRange'
import UserFeature from '../../utils/Feature/UserFeature'
import { getReport } from '../../routes/Building/modules/report'
import { getOrgTemplate } from '../../routes/Template/modules/template'
import { getProposals } from '../../routes/Building/modules/building'
import { yearRange } from '../../utils/ReportOptions'
import { setCookie, checkCookie } from 'utils/Utils'
import EmailModal from '../../components/UI/EmailModal'
import TimezoneSelect from 'react-timezone-select'

const REPORT_EXPORT_TYPE = {
  DOWNLOAD: 'download',
  EMAIL: 'email'
}

const REPORT_EXPORT_FORMAT = {
  WORD: 'word',
  PDF: 'pdf',
  EXCEL: 'xlsx'
}

const CustomEmailMessage = (reportUrl, messageRef) => ({
  field,
  form,
  ...props
}) => {
  return (
    <div
      ref={messageRef}
      {...field}
      {...props}
      contentEditable="true"
      suppressContentEditableWarning={true}
      className={styles.customMessage}
    >
      <a href={reportUrl} target="_blank">
        Download report
      </a>
    </div>
  )
}

export class GenerateReportsModal extends React.Component {
  static propTypes = {
    building: PropTypes.object.isRequired,
    user: PropTypes.object.isRequired,
    datePicker: PropTypes.object.isRequired,
    getOrganizationTemplates: PropTypes.func.isRequired,
    getReport: PropTypes.func.isRequired,
    getOrganizationSpreadsheetTemplates: PropTypes.func.isRequired,
    openReportsModal: PropTypes.func.isRequired,
    getAllOrganizationTemplates: PropTypes.func.isRequired,
    manageAllOrgSelected: PropTypes.bool.isRequired
  }
  customMessageRef = null
  state = {
    templateList: [],
    spreadsheetList: [],
    loadingTemplates: true,
    showFormatOptions: false,
    formatOptionTemplateId: null,
    formatOptionType: null,
    didMount: false,
    actionRetro: '',
    actionAudit: '',
    reportWarningTOCId: '',
    tabs: [
      { name: 'Document' },
      { name: 'Spreadsheet', featureFlag: 'reportSpreadsheets' },
      { name: 'NYC' },
      { name: 'Media', featureFlag: 'buildingAssets' }
    ],
    selectedView: { name: 'Document' },
    selectedTemplate: '',
    selectedTemplateFormat: null,
    // Year Range variables
    showYearModal: false,
    showTimeRangeModal: false,
    selectedYearRange: '12',
    customStartMonth: '',
    customStartYear: '',
    customEndMonth: '',
    customEndYear: '',
    monthList: [],
    yearList: [],
    yearSelectionNeeded: false,
    timerId: null,
    downloadingTemplateId: null,
    downloadingTemplateExportOption: null,
    //Email Report
    showEmailModal: false,
    emailReportUrl: null,
    proposalId: '',
    proposalSelectionNeeded: false,
    proposalTemplateId: '',
    selectedTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone
  }

  UNSAFE_componentWillMount = () => {
    let num = 0
    this.setState({
      monthList: moment.months().map(function(currentValue, index) {
        return { label: currentValue, value: currentValue }
      }),
      yearList: Array.apply(null, { length: 11 }).map((e, i) => ({
        label: moment()
          .subtract(num, 'years')
          .format('YYYY'),
        value: moment()
          .subtract(num++, 'years')
          .format('YYYY')
      }))
    })
  }

  componentDidMount = () => {
    setTimeout(() => {
      this.setState({ didMount: true })
    }, 0)
    this.props.getOrganizationSpreadsheetTemplates().then(spreadsheets => {
      let tempSp = []
      spreadsheets.map((spreadsheet, index) => {
        tempSp.push({
          id: spreadsheet._id,
          name: spreadsheet.name
        })
      })
      this.setState({
        spreadsheetList: tempSp.sort(this.compare),
        loadingTemplates: false
      })
    })
    let fetchTemplatesFn
    if (this.props.manageAllOrgSelected) {
      fetchTemplatesFn = this.props.getAllOrganizationTemplates
    } else {
      fetchTemplatesFn = this.props.getOrganizationTemplates
    }
    fetchTemplatesFn()
      .then(templates => {
        let tempObj = []
        templates.map((template, index) => {
          tempObj.push({
            id: template._id,
            name: template.name,
            tableOfContents: template.tableOfContents
          })
        })
        this.setState({
          templateList: tempObj.sort(this.compare),
          loadingTemplates: false
        })
      })
      .catch(() => {
        this.setState({
          loadingTemplates: false
        })
      })
    this.props.getProposals(this.props.building._id)
  }

  componentWillUnmount = () => {
    const { timerId } = this.state
    if (timerId) {
      clearInterval(timerId)
      this.setState({
        timerId: null,
        downloadingTemplateId: null,
        downloadingTemplateExportOption: null
      })
    }
  }

  checkDownloading = () => {
    let checked = checkCookie('downloading')
    if (checked) {
      const { timerId } = this.state
      if (timerId) {
        clearInterval(timerId)
        this.setState({
          timerId: null,
          downloadingTemplateId: null,
          downloadingTemplateExportOption: null
        })
      }
    }
  }

  setupTimer = () => {
    if (this.state.timerId) {
      clearInterval(this.state.timerId)
    }
    let throttled = throttle(this.checkDownloading, 200)
    let timerId = setInterval(throttled, 200)
    this.setState({ timerId })
  }

  compare = (a, b) => {
    if (a.name.toLowerCase() < b.name.toLowerCase()) return -1
    if (a.name.toLowerCase() > b.name.toLowerCase()) return 1
    return 0
  }

  onSelectAction = (event, type) => {
    if (type === 'Retro') {
      this.setState({ actionRetro: event.target.value })
    } else if (type === 'Audit') {
      this.setState({ actionAudit: event.target.value })
    }
  }

  handleGenerateReportWarning = (templateId, format = null) => {
    this.setState({
      reportWarningTOCId: templateId,
      reportWarningTOCFormat: format
    })
  }

  handleTabChange = (index, name) => {
    if (name !== this.state.selectedView.name) {
      let tempState = Object.assign({}, this.state.tabs[index])
      this.setState({ selectedView: tempState })
    }
  }

  checkTemplate = template => {
    const { proposalEnabled = false } = this.props
    const { body = [] } = template
    this.setState({
      proposalSelectionNeeded: false,
      proposalTemplateId: ''
    })
    let checked = body.map(widget => {
      if (proposalEnabled) {
        if (widget.type == 'chart') {
          let options = widget.options || []
          if (options.length) {
            let flag = options.some(option => {
              const metaData = option.metaData
              return (
                (metaData && metaData.yearOption === 'SetOnExport') || false
              )
            })
            return flag
          }
        }
        if (widget.type === 'measures') {
          let projectConfig = widget.projectConfig || {}
          if (projectConfig.type === 'proposal') {
            this.setState({
              proposalSelectionNeeded: true
            })
            return true
          }
          const metaData = widget.metaData
          return (metaData && metaData.yearOption === 'SetOnExport') || false
        } else if (widget.type === 'text') {
          const metaData = widget.metaData
          if (metaData && metaData.proposalTemplateId) {
            this.setState({
              proposalTemplateId: metaData.proposalTemplateId,
              proposalSelectionNeeded: true
            })
            return true
          }
          return (metaData && metaData.yearOption === 'SetOnExport') || false
        } else {
          const metaData = widget.metaData
          return (metaData && metaData.yearOption === 'SetOnExport') || false
        }
      } else {
        if (widget.type == 'chart') {
          let options = widget.options || []
          if (options.length) {
            let flag = options.some(option => {
              const metaData = option.metaData
              return (
                (metaData && metaData.yearOption === 'SetOnExport') || false
              )
            })
            return flag
          }
        } else {
          const metaData = widget.metaData
          return (metaData && metaData.yearOption === 'SetOnExport') || false
        }
      }
    })
    return checked.some(item => !!item)
  }

  checkTimezoneSelection = template => {
    const { body = [] } = template
    return body.some(widget => {
      if (widget.type === 'equipment') {
        return widget.equipmentConfig.subFormat?.timestamp
      }
      if (widget.type === 'measures') {
        return widget.projectConfig?.content?.some(item => item.timestamp)
      }
      if (widget.type === 'table' && widget.target === 'construction') {
        return widget.projectConfig?.data?.subFormat?.some(
          item => item === 'timestamp'
        )
      }
    })
  }

  handleCheckNeedExtraData = async (template, name, format, exportOption) => {
    const { getOrgTemplate } = this.props
    const { downloadingTemplateId } = this.state
    this.setState({
      formatOptionTemplateId: null,
      formatOptionType: null,
      showFormatOptions: false
    })
    if (downloadingTemplateId === null) {
      setCookie('downloading', 'finished')
    }
    let checked = checkCookie('downloading')
    if (!checked || downloadingTemplateId) return
    setCookie('downloading', 'started')
    if (name === 'Document') {
      let currentTemplate = null
      try {
        currentTemplate = await getOrgTemplate(template.id)
      } catch (err) {
        currentTemplate = null
      }
      setCookie('downloading', 'started')
      const timeZoneSelectionNeeded = this.checkTimezoneSelection(
        currentTemplate
      )
      const yearSelectionNeeded = this.checkTemplate(currentTemplate)
      if (yearSelectionNeeded || timeZoneSelectionNeeded) {
        let { building } = this.props
        let proposals = (building && building.proposals) || []
        if (this.state.proposalTemplateId) {
          proposals = proposals.filter(
            proposal => proposal.template === this.state.proposalTemplateId
          )
        }
        let proposalId = ''
        if (proposals.length) {
          proposalId = proposals[0]._id
        }
        this.setState({
          proposalId,
          showYearModal: yearSelectionNeeded,
          showTimeRangeModal: timeZoneSelectionNeeded,
          selectedYearRange: '12',
          selectedTemplate: template,
          selectedTemplateFormat: format,
          selectedTemplateExportOption: exportOption
        })
      } else {
        if (
          !template.tableOfContents ||
          exportOption === REPORT_EXPORT_TYPE.EMAIL ||
          format === REPORT_EXPORT_FORMAT.PDF
        )
          this.handleGenerateReport(template.id, name, format, exportOption)
        else {
          this.handleGenerateReportWarning(template.id, format, exportOption)
        }
      }
      this.setState({ yearSelectionNeeded: yearSelectionNeeded })
    } else {
      this.setState({ yearSelectionNeeded: false })
      this.handleGenerateReport(template.id, name, format, exportOption)
    }
  }

  openEmailModal = url => {
    const downloadUrl = generateDownloadUrl(url)
    this.setState({ showEmailModal: true, emailReportUrl: downloadUrl })
  }

  closeEmailModal = () => {
    this.setState({
      showEmailModal: false,
      emailReportUrl: null,
      downloadingTemplateId: null,
      downloadingTemplateExportOption: null
    })
  }

  onEmailSubmit = async values => {
    const message = this.customMessageRef ? this.customMessageRef.innerHTML : ''
    await this.props
      .sendReportTemplateEmail(values.subject, message, values.to, values.cc)
      .then(res => {
        this.setState({
          showEmailModal: false,
          emailReportUrl: null,
          downloadingTemplateId: null,
          downloadingTemplateExportOption: null
        })
      })
      .catch(err => {})
  }

  handleGenerateReport = async (
    templateId,
    name,
    format = REPORT_EXPORT_FORMAT.WORD,
    exportOption = REPORT_EXPORT_TYPE.DOWNLOAD
  ) => {
    const { user, building, datePicker, getReport } = this.props
    // remove extra pop up that gives warning about table of contents
    this.setState({
      reportWarningTOCId: '',
      reportWarningTOCFormat: null,
      downloadingTemplateId: templateId,
      downloadingTemplateExportOption: exportOption
    })
    let startDate, endDate
    if (this.state.yearSelectionNeeded) {
      let options = this.handleGetStartAndEndDate()
      startDate = options.customStartDate
      endDate = options.customEndDate
    }
    try {
      await getReport({
        templateId,
        startDate,
        endDate,
        proposalId: this.state.proposalId
      })
    } catch (err) {
      console.error(err)
    }
    let url = ''
    if (name === 'Document') {
      url =
        '/report/user/' +
        user._id +
        '/building/' +
        building._id +
        '/template/' +
        templateId +
        '?startDate=' +
        datePicker.startDate +
        '&endDate=' +
        datePicker.endDate +
        '&format=' +
        format
      if (this.state.yearSelectionNeeded) {
        url += '&customStartDate=' + startDate + '&customEndDate=' + endDate
      }
      if (this.state.proposalSelectionNeeded && this.state.proposalId) {
        url += '&proposalId=' + this.state.proposalId
        this.setState({
          proposalId: '',
          proposalSelectionNeeded: false
        })
      }
      if (this.state.selectedTimezone) {
        url += '&timeZone=' + this.state.selectedTimezone
      }
    } else {
      url = `/building/${building._id}/spreadsheet/report/${templateId}?year=${datePicker.startDate}`
    }
    if (exportOption === REPORT_EXPORT_TYPE.DOWNLOAD) {
      downloadItem(url)
    } else {
      this.openEmailModal(url)
    }
    setCookie('downloading', 'started')
    this.setupTimer()
  }

  handleGenerateNYCExcelReport = () => {
    const { user, building } = this.props
    const { actionRetro, downloadingTemplateId } = this.state
    if (downloadingTemplateId === null) {
      setCookie('downloading', 'finished')
    }
    let checked = checkCookie('downloading')
    if (!checked || downloadingTemplateId) return
    downloadItem(
      '/report/user/' +
        user._id +
        '/building/' +
        building._id +
        '/nycExcel?action=' +
        actionRetro
    )
    this.setState({ downloadingTemplateId: 'nyc' })
    setCookie('downloading', 'started')
    this.setupTimer()
  }

  handleGenerateBSXMLReport = () => {
    const { user, building } = this.props
    const { actionAudit, downloadingTemplateId } = this.state
    if (downloadingTemplateId === null) {
      setCookie('downloading', 'finished')
    }
    let checked = checkCookie('downloading')
    if (!checked || downloadingTemplateId) return
    downloadIntegrationApiItem(
      '/buildingsync?actionId=' +
        actionAudit +
        '&cache=false' +
        '&buildingId=' +
        building._id +
        '&userId=' +
        user._id
    )
    this.setState({ downloadingTemplateId: 'bsxml' })
    setCookie('downloading', 'started')
    this.setupTimer()
  }

  handleGenerateBuildingBSXMLReport = () => {
    const { building } = this.props
    const env = isProdEnv(process.env.DOMAIN_ENV) ? 'prod' : 'qa'
    const { downloadingTemplateId } = this.state
    if (downloadingTemplateId === null) {
      setCookie('downloading', 'finished')
    }
    let checked = checkCookie('downloading')
    if (!checked || downloadingTemplateId) return
    let buildingId = building && building._id
    if (!buildingId) return
    downloadIntegrationApiItem(
      '/buildingsync?buildingId=' + buildingId + '&cache=false' + '&env=' + env
    )
    // this.setState({ downloadingTemplateId: 'buildingbsxml' })
    this.setupTimer()
  }

  handleAssetsDownload = () => {
    const { building } = this.props
    const { downloadingTemplateId } = this.state
    if (downloadingTemplateId === null) {
      setCookie('downloading', 'finished')
    }
    let checked = checkCookie('downloading')
    if (!checked || downloadingTemplateId) return
    downloadItem(`/building/${building._id}/download/assets`)
    this.setState({ downloadingTemplateId: 'media' })
    setCookie('downloading', 'started')
    this.setupTimer()
  }

  handleYearRange = event => {
    const id = event.target.id
    if (id === 'Range') {
      this.setState({
        selectedYearRange: event.target.value
      })
    } else {
      if (id === 'selectedStartMonth') {
        this.setState({
          customStartMonth: event.target.value
        })
      } else if (id === 'selectedStartYear') {
        this.setState({
          customStartYear: event.target.value
        })
      } else if (id === 'selectedEndMonth') {
        this.setState({
          customEndMonth: event.target.value
        })
      } else if (id === 'selectedEndYear') {
        this.setState({
          customEndYear: event.target.value
        })
      }
    }
  }

  handleGetStartAndEndDate = () => {
    const {
      selectedYearRange,
      customStartMonth,
      customStartYear,
      customEndMonth,
      customEndYear,
      monthList,
      yearList
    } = this.state
    let customStartDate = '',
      customEndDate = ''
    const startMonth = customStartMonth || monthList[0].value
    let endMonth = customEndMonth || monthList[monthList.length - 1].value
    const startYear = customStartYear || yearList[2].value
    const endYear = customEndYear || yearList[0].value
    if (new Date('1' + endMonth + endYear) > new Date()) {
      endMonth = moment()
        .utc()
        .subtract(1, 'months')
        .month()
    }
    if (selectedYearRange === 'Custom') {
      customStartDate =
        startYear +
        '/' +
        moment()
          .utc()
          .month(startMonth)
          .format('MM')
      customEndDate =
        endYear +
        '/' +
        moment()
          .utc()
          .month(endMonth)
          .format('MM')
    } else {
      customEndDate = moment()
        .utc()
        .subtract(1, 'months')
        .endOf('month')
        .format('YYYY/MM')
      customStartDate = moment()
        .utc()
        .subtract(selectedYearRange, 'months')
        .startOf('month')
        .format('YYYY/MM')
    }
    return { customStartDate, customEndDate }
  }

  handleSetYear = () => {
    setCookie('downloading', 'started')
    const {
      selectedTemplate,
      selectedTemplateExportOption,
      selectedTemplateFormat
    } = this.state
    if (
      selectedTemplate.tableOfContents &&
      selectedTemplateExportOption != REPORT_EXPORT_TYPE.EMAIL &&
      selectedTemplateFormat != REPORT_EXPORT_FORMAT.PDF
    ) {
      this.handleGenerateReportWarning(
        selectedTemplate.id,
        selectedTemplateFormat
      )
    } else {
      this.handleGenerateReport(
        selectedTemplate.id,
        'Document',
        selectedTemplateFormat,
        selectedTemplateExportOption
      )
    }

    this.setState({
      showYearModal: false,
      showTimeRangeModal: false,
      selectedTemplate: '',
      selectedTemplateFormat: null,
      selectedTemplateExportOption: null
    })
  }

  handleCloseYearModal = () => {
    // clear browser cookie
    setCookie('downloading', 'finished')
    this.setState({
      proposalId: '',
      showYearModal: false,
      selectedTemplate: '',
      selectedTemplateFormat: null
    })
  }

  toggleFormatOptions = (templateId, type) => {
    this.setState(prevState => {
      return {
        showFormatOptions:
          prevState.formatOptionTemplateId === templateId
            ? !prevState.showFormatOptions
            : true,
        formatOptionTemplateId: templateId,
        formatOptionType: type
      }
    })
  }

  handleChooseProposalTemplate = event => {
    this.setState({
      proposalId: event.target.value
    })
  }

  handleOpenProposal = () => {
    const { building } = this.props
    let domain = process.env.DOMAIN_ENV
    let url = ''
    if (isProdEnv(domain)) {
      url = `https://${domain}`
    } else if (domain === 'localhost') {
      url = `http://${domain}:3000`
    } else {
      url = `http://${domain}`
    }
    let newWindow = window.open(
      `${url}/building/${building._id}/project/proposal`
    )
  }

  setSelectedTimezone = timeZone => {
    this.setState({ selectedTimezone: timeZone.value })
  }

  renderExportButton = (template, selectedView, exportOption) => {
    const {
      showFormatOptions,
      formatOptionTemplateId,
      formatOptionType,
      downloadingTemplateId,
      downloadingTemplateExportOption
    } = this.state
    return (
      <div
        className={classNames(
          styles.extras,
          showFormatOptions &&
            formatOptionTemplateId === template.id &&
            formatOptionType == exportOption
            ? styles.extrasShow
            : styles.extrasHide
        )}
      >
        <button
          className={classNames(styles.button, styles.buttonPrimary)}
          onClick={() => this.toggleFormatOptions(template.id, exportOption)}
        >
          {downloadingTemplateId === template.id &&
          downloadingTemplateExportOption === exportOption ? (
            <Loader size="button" color="white" />
          ) : exportOption === REPORT_EXPORT_TYPE.DOWNLOAD ? (
            'Download'
          ) : (
            'Email'
          )}
        </button>
        <div
          className={classNames(
            styles.extrasDropdown,
            styles.extrasDropdownRight
          )}
        >
          <div
            className={styles.extrasLink}
            onClick={() =>
              this.handleCheckNeedExtraData(
                template,
                selectedView.name,
                REPORT_EXPORT_FORMAT.WORD,
                exportOption
              )
            }
          >
            <i className="material-icons">cloud_download</i>
            Microsoft Word (.docx)
          </div>
          <div
            className={styles.extrasLink}
            onClick={() =>
              this.handleCheckNeedExtraData(
                template,
                selectedView.name,
                REPORT_EXPORT_FORMAT.PDF,
                exportOption
              )
            }
          >
            <i className="material-icons">cloud_download</i>
            PDF Document (.pdf)
          </div>
        </div>
      </div>
    )
  }

  render() {
    const {
      tabs,
      selectedView,
      showYearModal,
      showTimeRangeModal,
      selectedTimezone,
      selectedYearRange,
      customStartYear,
      customStartMonth,
      customEndYear,
      customEndMonth,
      monthList,
      yearList,
      showEmailModal,
      emailReportUrl,
      proposalSelectionNeeded,
      proposalId
    } = this.state
    const { user, building } = this.props
    let proposals = (building && building.proposals) || []
    if (this.state.proposalTemplateId) {
      proposals = proposals.filter(
        proposal => proposal.template === this.state.proposalTemplateId
      )
    }
    const startMonth = customStartMonth || monthList[0].value
    let endMonth = customEndMonth || monthList[monthList.length - 1].value
    const startYear = customStartYear || yearList[2].value
    const endYear = customEndYear || yearList[0].value
    let checkEndDate = moment(`${endYear} ${endMonth}`, 'YYYY MMMM')
      .utc()
      .startOf('month')
    let now = moment()
      .utc()
      .endOf('month')
    endMonth =
      checkEndDate.diff(now) > 0 ? monthList[now.month()].value : endMonth
    let momentStartDate = moment(`${startYear} ${startMonth}`, 'YYYY MMMM')
      .utc()
      .startOf('month')
    let momentEndDate = moment(`${endYear} ${endMonth}`, 'YYYY MMMM')
      .utc()
      .endOf('month')
    let dateInvalid = momentEndDate.diff(momentStartDate, 'years') <= 2
    return (
      <div
        className={classNames(
          styles.modal,
          styles.templatesModal,
          styles['fade-in'],
          this.state.didMount ? styles.visible : ''
        )}
      >
        <div className={classNames(styles.modalOuter, styles.modalOuterSmall)}>
          <div className={styles.modalInner}>
            <div className={styles.templates}>
              <div className={styles.templatesHeading}>
                <h2>Reports</h2>
                <div
                  className={styles.modalClose}
                  onClick={() => this.props.openReportsModal(false)}
                >
                  <i className="material-icons">close</i>
                </div>
              </div>

              <div className={styles.tabs}>
                {tabs.map((tab, index) => {
                  if (tab.name === 'NYC') {
                    if (user.products.buildeeNYC !== 'access') return null
                    return (
                      <div
                        key={index}
                        name={`${tab.name}Tab`}
                        onClick={() => {
                          this.handleTabChange(index, tab.name)
                        }}
                        className={classNames(
                          styles.tab,
                          tab.name === selectedView.name ? styles.tabActive : ''
                        )}
                      >
                        {tab.name}
                      </div>
                    )
                  }
                  if (tab.featureFlag) {
                    return (
                      <UserFeature name={tab.featureFlag} key={index}>
                        {({ enabled }) => {
                          if (!enabled) return null
                          return (
                            <div
                              key={index}
                              name={`${tab.name}Tab`}
                              onClick={() => {
                                this.handleTabChange(index, tab.name)
                              }}
                              className={classNames(
                                styles.tab,
                                tab.name === selectedView.name
                                  ? styles.tabActive
                                  : ''
                              )}
                            >
                              {tab.name}
                            </div>
                          )
                        }}
                      </UserFeature>
                    )
                  }
                  return (
                    <div
                      key={index}
                      name={`${tab.name}Tab`}
                      onClick={() => {
                        this.handleTabChange(index, tab.name)
                      }}
                      className={classNames(
                        styles.tab,
                        tab.name === selectedView.name ? styles.tabActive : ''
                      )}
                    >
                      {tab.name}
                    </div>
                  )
                })}
              </div>

              {selectedView.name === 'Document' && (
                <div className={styles.reportsTabContent}>
                  {this.state.loadingTemplates && <Loader />}

                  {this.state.templateList.length === 0 &&
                    !this.state.loadingTemplates && (
                      <p>
                        Sorry, no templates to display. Please add a template
                        using the Report Builder in the top navigation bar.
                      </p>
                    )}

                  {this.state.templateList.length > 0 &&
                    !this.state.loadingTemplates && (
                      <div className={styles.templatesList}>
                        {this.state.templateList.map((template, index) => {
                          return (
                            <div
                              key={index}
                              className={styles.templatesListSingle}
                            >
                              <div className={styles.templatesListName}>
                                {template.name}
                              </div>
                              <div className={styles.templatesListLinks}>
                                {this.renderExportButton(
                                  template,
                                  selectedView,
                                  REPORT_EXPORT_TYPE.DOWNLOAD
                                )}
                                {this.renderExportButton(
                                  template,
                                  selectedView,
                                  REPORT_EXPORT_TYPE.EMAIL
                                )}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                </div>
              )}
              {selectedView.name === 'Media' && (
                <div className={styles.templatesList}>
                  <div className={styles.templatesListSingle}>
                    <div className={styles.templatesListName}>
                      Assets Media (Equipment, Systems, Constructions)
                    </div>
                    <div className={styles.templatesListLinks}>
                      <button
                        className={classNames(
                          styles.button,
                          styles.buttonPrimary
                        )}
                        onClick={this.handleAssetsDownload}
                      >
                        {this.state.downloadingTemplateId === 'media' ? (
                          <Loader size="button" color="white" />
                        ) : (
                          'Download'
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}
              {selectedView.name === 'Spreadsheet' && (
                <div className={styles.reportsTabContent}>
                  {this.state.loadingTemplates && <Loader />}

                  {this.state.spreadsheetList.length === 0 &&
                    !this.state.loadingTemplates && (
                      <p>
                        Sorry, no templates to display. Please add a template
                        using the Report Builder in the top navigation bar.
                      </p>
                    )}

                  {this.state.spreadsheetList.length > 0 &&
                    !this.state.loadingTemplates && (
                      <div className={styles.templatesList}>
                        {this.state.spreadsheetList.map(
                          (spreadsheet, index) => {
                            return (
                              <div
                                key={index}
                                className={styles.templatesListSingle}
                              >
                                <div className={styles.templatesListName}>
                                  {spreadsheet.name}
                                </div>
                                <div className={styles.templatesListLinks}>
                                  {spreadsheet.tableOfContents && (
                                    <button
                                      className={classNames(
                                        styles.button,
                                        styles.buttonPrimary
                                      )}
                                      onClick={() => {
                                        let checked = checkCookie('downloading')
                                        if (checked) {
                                          this.handleGenerateReportWarning(
                                            spreadsheet.id
                                          )
                                        }
                                      }}
                                    >
                                      {this.state.downloadingTemplateId ===
                                        spreadsheet.id &&
                                      this.state
                                        .downloadingTemplateExportOption !=
                                        REPORT_EXPORT_TYPE.EMAIL ? (
                                        <Loader size="button" color="white" />
                                      ) : (
                                        'Download'
                                      )}
                                    </button>
                                  )}
                                  {!spreadsheet.tableOfContents && (
                                    <button
                                      className={classNames(
                                        styles.button,
                                        styles.buttonPrimary
                                      )}
                                      onClick={() => {
                                        let checked = checkCookie('downloading')
                                        if (checked) {
                                          this.handleGenerateReport(
                                            spreadsheet.id,
                                            selectedView.name
                                          )
                                        }
                                      }}
                                    >
                                      {this.state.downloadingTemplateId ===
                                        spreadsheet.id &&
                                      this.state
                                        .downloadingTemplateExportOption !=
                                        REPORT_EXPORT_TYPE.EMAIL ? (
                                        <Loader size="button" color="white" />
                                      ) : (
                                        'Download'
                                      )}
                                    </button>
                                  )}
                                  <button
                                    className={classNames(
                                      styles.button,
                                      styles.buttonPrimary
                                    )}
                                    onClick={() => {
                                      this.handleGenerateReport(
                                        spreadsheet.id,
                                        selectedView.name,
                                        REPORT_EXPORT_TYPE.EXCEL,
                                        REPORT_EXPORT_TYPE.EMAIL
                                      )
                                    }}
                                  >
                                    {this.state.downloadingTemplateId ===
                                      spreadsheet.id &&
                                    this.state
                                      .downloadingTemplateExportOption ===
                                      REPORT_EXPORT_TYPE.EMAIL ? (
                                      <Loader size="button" color="white" />
                                    ) : (
                                      'Email'
                                    )}
                                  </button>
                                </div>
                              </div>
                            )
                          }
                        )}
                      </div>
                    )}
                </div>
              )}

              {selectedView.name === 'NYC' && (
                <div>
                  <div className={styles.nycReportsTabConent}>
                    <div className={styles.nycBuildingSync}>
                      <h3>Export a building to a bsxml file</h3>
                      <h5>
                        With buildee you can export a building to a bsxml file
                        to import into the Building Energy Asset Score. buildee
                        provides the required fields found in the NYC Energy
                        Efficiency Report - Audit Template.
                      </h5>
                      <div className={styles.nycBuildingSyncDownload}>
                        <button
                          className={classNames(
                            styles.button,
                            styles.buttonPrimary
                          )}
                          onClick={() => {
                            this.handleGenerateBuildingBSXMLReport()
                          }}
                        >
                          {this.state.downloadingTemplateId ===
                          'buildingbsxml' ? (
                            <Loader size="button" color="white" />
                          ) : (
                            'Download'
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* <Query
                    query={GET_ACTIONS}
                    variables={{
                      action: { buildingId: building._id, type: 'LL87_RCX' }
                    }}
                    notifyOnNetworkStatusChange
                  >
                    {({
                      loading,
                      error,
                      data: { actions = [] },
                      networkStatus
                    }) => {
                      if (loading || error || networkStatus === 4) return null

                      return (
                        <div
                          className={classNames(
                            actions.length ? styles.reportsTabContent : ''
                          )}
                        >
                          {loading && <Loader />}

                          {actions.length === 0 && !loading && (
                            <p>Sorry, no RCx Reports to display.</p>
                          )}

                          {actions.length > 0 && (
                            <div>
                              <div className={styles.templatesListSingle}>
                                <div className={styles.templatesListName}>
                                  NYC LL87 RCx Report
                                </div>
                                <div
                                  className={classNames(
                                    styles.selectContainer,
                                    styles.reportSelect
                                  )}
                                >
                                  <select
                                    value={this.state.actionRetro}
                                    onChange={e =>
                                      this.onSelectAction(e, 'Retro')
                                    }
                                  >
                                    {actions.reduce(
                                      (acc, action) =>
                                        acc.concat(
                                          <option
                                            key={`action-report-${action._id}`}
                                            value={action._id}
                                          >
                                            {moment(
                                              new Date(parseInt(action.date))
                                            ).format('MM/DD/YYYY')}
                                          </option>
                                        ),
                                      [
                                        <option
                                          key={`action-report-default`}
                                          value=""
                                          disabled={true}
                                        >
                                          Select One
                                        </option>
                                      ]
                                    )}
                                  </select>
                                </div>
                                <div className={styles.templatesListLinks}>
                                  <button
                                    className={classNames(
                                      styles.button,
                                      styles.buttonPrimary,
                                      {
                                        [styles.buttonDisable]: !this.state
                                          .actionRetro
                                      }
                                    )}
                                    onClick={() => {
                                      this.handleGenerateNYCExcelReport()
                                    }}
                                  >
                                    {this.state.downloadingTemplateId ===
                                    'nyc' ? (
                                      <Loader size="button" color="white" />
                                    ) : (
                                      'Download'
                                    )}
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    }}
                  </Query>
                  <Query
                    query={GET_ACTIONS}
                    variables={{
                      action: {
                        buildingId: building._id,
                        type: 'LL87_ENERGY_AUDIT'
                      }
                    }}
                    notifyOnNetworkStatusChange
                  >
                    {({
                      loading,
                      error,
                      data: { actions = [] },
                      networkStatus
                    }) => {
                      if (loading || error || networkStatus === 4) return null

                      return (
                        <div className={styles.reportsTabContent}>
                          {loading && <Loader />}

                          {actions.length === 0 && !loading && (
                            <p>
                              Sorry, no LL87 Energy Audit Reports to display.
                            </p>
                          )}

                          {actions.length > 0 && (
                            <div>
                              <div className={styles.templatesListSingle}>
                                <div className={styles.templatesListName}>
                                  NYC LL87 Energy Audit Report
                                </div>
                                <div
                                  className={classNames(
                                    styles.selectContainer,
                                    styles.reportSelect
                                  )}
                                >
                                  <select
                                    value={this.state.actionAudit}
                                    onChange={e =>
                                      this.onSelectAction(e, 'Audit')
                                    }
                                  >
                                    {actions.reduce(
                                      (acc, action) =>
                                        acc.concat(
                                          <option
                                            key={`action-report-${action._id}`}
                                            value={action._id}
                                          >
                                            {moment(
                                              new Date(parseInt(action.date))
                                            ).format('MM/DD/YYYY')}
                                          </option>
                                        ),
                                      [
                                        <option
                                          key={`action-report-default`}
                                          value=""
                                          disabled={true}
                                        >
                                          Select One
                                        </option>
                                      ]
                                    )}
                                  </select>
                                </div>
                                <div className={styles.templatesListLinks}>
                                  <button
                                    className={classNames(
                                      styles.button,
                                      styles.buttonPrimary,
                                      {
                                        [styles.buttonDisable]: !this.state
                                          .actionAudit
                                      }
                                    )}
                                    onClick={() => {
                                      this.handleGenerateBSXMLReport()
                                    }}
                                  >
                                    {this.state.downloadingTemplateId ===
                                    'bsxml' ? (
                                      <Loader size="button" color="white" />
                                    ) : (
                                      'Download'
                                    )}
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    }}
                  </Query>
                 */}
                </div>
              )}
            </div>
          </div>
        </div>

        {this.state.reportWarningTOCId !== '' && (
          <div className={styles.templatesTOCWarning}>
            <div className={styles.templatesTOCWarningInner}>
              <p>
                This template includes a table of contents that will update your
                document when opened in Microsoft Word. When prompted, select
                “Yes” for this to appear.
              </p>
              <img src={WarningImage} />
              <button
                className={classNames(styles.button, styles.buttonPrimary)}
                onClick={() => {
                  this.handleGenerateReport(
                    this.state.reportWarningTOCId,
                    selectedView.name,
                    this.state.reportWarningTOCFormat
                  )
                }}
              >
                Got it! Export my report
              </button>
            </div>
          </div>
        )}
        {(showYearModal || showTimeRangeModal) && (
          <div className={styles.templatesYearModal}>
            <div className={styles.templatesYearModalInner}>
              <div className={styles.templatesHeading}>
                <h2>Download Report</h2>
                <div
                  className={styles.modalClose}
                  onClick={this.handleCloseYearModal}
                >
                  <i className="material-icons">close</i>
                </div>
              </div>
              {proposalSelectionNeeded && proposals.length > 0 && (
                <div className={styles.proposalContainer}>
                  <div className={styles.proposalContainerLabel}>
                    Select a Proposal
                  </div>
                  <div className={classNames(styles.proposalRadioContainer)}>
                    {proposals.map(item => {
                      let checked = item._id === proposalId
                      return (
                        <div className={styles.proposalSelector}>
                          <div className={styles.radioContainer}>
                            <label
                              key={item._id}
                              className={styles.proposalRadioContainerLabel}
                            >
                              <input
                                type="radio"
                                name={item.name}
                                value={item._id}
                                onChange={e =>
                                  this.handleChooseProposalTemplate(e)
                                }
                                checked={checked}
                              />
                              <span></span>
                            </label>
                          </div>
                          <span
                            onClick={this.handleOpenProposal}
                            className={styles.proposalSelectorLabel}
                          >
                            {item.name}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
              {showYearModal && (
                <>
                  <div className={styles.proposalContainer}>
                    <span>Set the Time Period</span>
                  </div>
                  <div className={styles.yearRange}>
                    <label className={TemplateStyles['target__select']}>
                      <div className={TemplateStyles.selectContainer}>
                        <select
                          onChange={e => this.handleYearRange(e)}
                          value={selectedYearRange}
                          name="Range"
                          id="Range"
                        >
                          {yearRange.map((item, i) => {
                            return (
                              <option key={item.key} value={item.value}>
                                {item.label}
                              </option>
                            )
                          })}
                        </select>
                      </div>
                    </label>
                  </div>
                </>
              )}
              {selectedYearRange == 'Custom' && (
                <CustomYearRange
                  handleChange={this.handleYearRange}
                  startMonth={startMonth}
                  startYear={startYear}
                  endMonth={endMonth}
                  endYear={endYear}
                  startDate={momentStartDate}
                  endDate={momentEndDate}
                  monthList={monthList}
                  yearList={yearList}
                />
              )}
              {showTimeRangeModal && (
                <>
                  <div className={styles.proposalContainer}>
                    <span>Set the Timezone for Image Timestamps</span>
                  </div>
                  <div className={styles.yearRange}>
                    <TimezoneSelect
                      value={selectedTimezone}
                      onChange={this.setSelectedTimezone}
                    />
                  </div>
                </>
              )}
              <div className={styles.templatesYearModalInnerButtons}>
                <button
                  className={classNames(styles.button, styles.buttonPrimary, {
                    [styles.buttonDisable]: !dateInvalid
                  })}
                  onClick={this.handleSetYear}
                >
                  OK
                </button>
                <button
                  className={classNames(styles.button, styles.buttonSecondary)}
                  onClick={this.handleCloseYearModal}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
        {showEmailModal && (
          <EmailModal
            title="Email File"
            onClose={this.closeEmailModal}
            onSubmit={this.onEmailSubmit}
            messageComponent={CustomEmailMessage(
              emailReportUrl,
              ref => (this.customMessageRef = ref)
            )}
          />
        )}
      </div>
    )
  }
}

const mapStateToProps = state => ({
  isLoading: state.report.isLoading || false
})

const mapDispatchToProps = {
  getReport,
  getOrgTemplate,
  sendReportTemplateEmail,
  getProposals
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(GenerateReportsModal)
