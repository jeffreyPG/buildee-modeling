import React, { Component } from 'react'
import { connect } from 'react-redux'
import { push } from 'react-router-redux'
import PropTypes from 'prop-types'
import { DragDropContext } from 'react-dnd'
import HTML5Backend from 'react-dnd-html5-backend'
import Panel from './Panel'
import { ReportStyles } from './'
import classNames from 'classnames'
import styles from './TemplateComponent.scss'
import templateStyles from '../Template.scss'
import { ItemTypes } from './Widgets'
import { Header, Footer } from '../TemplateComponent/Options/'
import Waypoint from 'react-waypoint'
import { Loader } from 'utils/Loader'
import { formatCamelCaseNotation } from 'utils/Utils'
import Feature from 'utils/Feature/Feature'
import {
  deleteTemplate,
  saveTemplate,
  nameTemplate,
  addStyledReport,
  addAttachments,
  updateTemplate,
  templateUpdated,
  configTemplate
} from 'routes/Template/modules/template'
import tabStyles from '../../../containers/Modal/GenerateReportsModal.scss'

import stylesTab from './Editor.scss'
import { ADD_BUILDING_CONSTRUCTION } from 'utils/graphql/queries/construction'
import { Attachments } from './'

export class Editor extends Component {
  static propTypes = {
    deleteTemplate: PropTypes.func,
    nameTemplate: PropTypes.func.isRequired,
    addStyledReport: PropTypes.func.isRequired,
    addAttachments: PropTypes.func.isRequired,
    saveTemplate: PropTypes.func,
    templateId: PropTypes.string,
    updateTemplate: PropTypes.func,
    templateUpdated: PropTypes.func,
    proUser: PropTypes.bool.isRequired,
    views: PropTypes.array,
    orgId: PropTypes.string
  }

  state = {
    showExtras1: false,
    showExtras2: false,
    showBuildingExtras: false,
    upload: '',
    error: '',
    tabs: [{ name: 'Layout' }, { name: 'Style' }, { name: 'Attachments' }],
    selectedView: 'Layout',
    selectedOrgId: '',
    pageElements: [
      {
        id: 1,
        text: 'Title',
        optionsDisplay: 'title',
        icon: 'title',
        type: [ItemTypes.BODY]
      },
      {
        id: 2,
        text: 'Text',
        optionsDisplay: 'text',
        icon: 'text_fields',
        type: [ItemTypes.BODY]
      },
      // {
      //   id: 3,
      //   text: 'Text List',
      //   optionsDisplay: 'text-list',
      //   icon: 'format_list_bulleted',
      //   type: [ItemTypes.BODY]
      // },
      // {
      //   id: 4,
      //   text: 'Data',
      //   optionsDisplay: 'body',
      //   icon: 'format_align_left',
      //   type: [ItemTypes.BODY]
      // },
      // {
      //   id: 5,
      //   text: 'Data List',
      //   optionsDisplay: 'body',
      //   icon: 'format_list_bulleted',
      //   type: [ItemTypes.BODY]
      // },
      {
        id: 6,
        text: 'Table',
        optionsDisplay: 'body',
        icon: 'table_chart',
        type: [ItemTypes.BODY]
      },
      {
        id: 10,
        text: 'Equipment',
        optionsDisplay: 'body',
        icon: 'table_chart',
        type: [ItemTypes.BODY]
      },
      {
        id: 7,
        text: 'Measures',
        optionsDisplay: 'measures',
        icon: 'table_chart',
        type: [ItemTypes.BODY]
      },
      {
        id: 7,
        text: 'Chart',
        optionsDisplay: 'body',
        icon: 'table_chart',
        type: [ItemTypes.BODY],
        featureFlag: 'charts'
      },
      {
        id: 8,
        text: 'Image',
        optionsDisplay: 'image',
        icon: 'photo',
        type: [ItemTypes.BODY]
      },
      {
        id: 9,
        text: 'Aerial Image',
        optionsDisplay: 'address',
        icon: 'place',
        type: [ItemTypes.BODY]
      },
      {
        id: 11,
        text: 'Divider',
        optionsDisplay: 'divider',
        icon: 'remove',
        type: [ItemTypes.BODY]
      }
    ],
    pageLayout: [],
    layoutAccepts: [ItemTypes.WIDGET],
    elementAccepts: [],
    waypointStick: '',
    bodyBgColor: '',
    templateError: false,
    deleteToggleOpen: false,
    scrollLabel: false,
    disableSubmit: false
  }

  componentDidMount = () => {
    window.addEventListener('resize', this.handlePanelEditorTopLeave)
    // if sidebar has scroll to it
    if (window.innerHeight - 90 === this.refs.sidebarScroll.clientHeight + 40) {
      this.setState({ scrollLabel: true })
    }
    if (this.props.orgId) {
      this.setState({ selectedOrgId: this.props.orgId })
    }
  }

  componentWillUnmount = () => {
    window.removeEventListener('resize', this.handlePanelEditorTopLeave)
  }

  handleSaveTemplate = () => {
    // to avoid creating multiple submissions
    if (!this.state.disableSubmit) {
      this.setState({ disableSubmit: true })
      this.props
        .saveTemplate(this.state.selectedOrgId)
        .then(() => {
          this.setState({ disableSubmit: false })
        })
        .catch(() => {
          this.setState({ disableSubmit: false })
        })
    }
    this.props.templateUpdated(false)
  }

  handleUpdateTemplate = () => {
    this.props.updateTemplate(this.props.templateId)
    this.props.templateUpdated(false)
  }

  handleDeleteToggle = toggle => {
    if (toggle) {
      this.setState({ deleteToggleOpen: !this.state.deleteToggleOpen })
    } else {
      this.setState({ deleteToggleOpen: false })
    }
  }

  handleDeleteTemplate = () => {
    this.props.templateUpdated(false)
    this.props.deleteTemplate(this.props.templateId)
  }

  addStyledReport = styledReport => {
    this.props.addStyledReport(styledReport)
  }

  addAttachments = attachment => {
    this.props.addAttachments(attachment)
  }

  handleClickSaveConfig = (e, item) => {
    let config = { ...this.props.config }
    if (item) {
      config[item] = e.target.value
    } else if (e.target.value === 'pageNumbers' && !e.target.checked) {
      config.numberPosition = ''
      config.pageNumbers = false
    } else {
      config[e.target.value] = e.target.checked
    }
    this.props.configTemplate(config)
  }

  handleTypeNameTemplate = e => {
    this.props.nameTemplate(e.target.value)
  }

  handlePanelEditorTopLeave = () => {
    if (
      document.documentElement.clientWidth > 799 &&
      this.panels.getBoundingClientRect().top < 0
    ) {
      this.setState({ waypointStick: 'active' })
      if (window.innerHeight - 90 === this.sidebarScroll.clientHeight + 40) {
        this.setState({ scrollLabel: true })
      }
    } else {
      this.setState({ waypointStick: '' })
    }
  }
  handlePanelEditorTopEnter = () => {
    this.setState({ waypointStick: '' })
    if (window.innerHeight - 90 !== this.refs.sidebarScroll.clientHeight + 20) {
    }
  }

  setBgColor = color => {
    this.setState({ bodyBgColor: color })
  }

  handleTabChange = (index, name) => {
    if (name !== this.state.selectedView) {
      let tempState = name
      this.setState({ selectedView: tempState })
    }
  }

  handleOrganizationChange = e => {
    this.setState({ selectedOrgId: e.target.value })
  }

  render() {
    const {
      config,
      name,
      attachments,
      organizationList,
      manageAllOrgSelected,
      orgId
    } = this.props
    const {
      pageElements,
      layoutAccepts,
      elementAccepts,
      selectedOrgId
    } = this.state
    const windowHeight = {
      maxHeight: window.innerHeight - 90
    }
    const scrollHeight = {
      maxHeight: window.innerHeight - 130
    }

    const footerPageNumbersPosition = [
      { name: 'Left', val: 'left' },
      { name: 'Center', val: 'center' },
      { name: 'Right', val: 'right' }
    ]

    const headerPageNumbersPosition = [{ name: 'Right', val: 'headerRight' }]

    return (
      <div>
        <div className={styles.editorHeader}>
          <div className={templateStyles.container}>
            <div
              className={templateStyles.templateBack}
              onClick={() => {
                this.props.push(
                  '/organization/' +
                    this.props.organizationView._id +
                    '/template'
                )
              }}
            >
              <i className="material-icons">arrow_back</i>
              Back to template list
            </div>
            <div className={styles.nameContainer}>
              <div className={styles.nameContainerTitle}>
                {this.props.templateId
                  ? name
                    ? name
                    : 'Add Document Template'
                  : 'Add Document Template'}
              </div>
              <div className={styles.buttonContainer}>
                {this.props.templateId && (
                  <div className={styles['editor__edit']}>
                    <button
                      className={classNames(styles.button, styles.buttonDelete)}
                      onClick={() => {
                        this.handleDeleteToggle(true)
                      }}
                    >
                      Delete
                    </button>
                    {this.props.templateError && (
                      <button
                        className={classNames(
                          styles.button,
                          styles.buttonPrimary,
                          styles.buttonDisable
                        )}
                      >
                        Update
                      </button>
                    )}
                    {!this.props.templateError && (
                      <button
                        onClick={() => {
                          this.handleUpdateTemplate()
                        }}
                        className={classNames(
                          styles.button,
                          styles.buttonPrimary
                        )}
                      >
                        Update
                      </button>
                    )}
                  </div>
                )}
                {!this.props.templateId && (
                  <div className={styles['editor__edit']}>
                    {this.props.templateError && (
                      <button
                        className={classNames(
                          styles.button,
                          styles.buttonPrimary,
                          styles.buttonDisable
                        )}
                      >
                        Save
                      </button>
                    )}
                    {this.state.disableSubmit && (
                      <button
                        className={classNames(
                          styles.button,
                          styles.buttonPrimary,
                          styles.buttonDisable
                        )}
                      >
                        <Loader size="button" color="white" />
                      </button>
                    )}
                    {!this.props.templateError && !this.state.disableSubmit && (
                      <button
                        onClick={() => {
                          this.handleSaveTemplate()
                        }}
                        className={classNames(
                          styles.button,
                          styles.buttonPrimary
                        )}
                      >
                        Save
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className={templateStyles.container}>
          <div className={styles['editor']}>
            <div className={styles['editor__header']}>
              <div className={styles['editor__name']}>
                <div className={styles.editorLabel}>Name</div>
                <input
                  type="text"
                  value={this.props.name || ''}
                  placeholder="Template Name"
                  maxLength="100"
                  data-test="template-name"
                  onChange={e => {
                    this.handleTypeNameTemplate(e)
                  }}
                />
              </div>
              {manageAllOrgSelected && (
                <div className={stylesTab.orgSelectContainer}>
                  <div className={styles.editorLabel}>Organization</div>
                  <div className={styles.selectContainer}>
                    <select
                      value={selectedOrgId}
                      onChange={this.handleOrganizationChange}
                      disabled={orgId}
                    >
                      <option defaultValue value="" disabled>
                        Select Organization
                      </option>
                      {organizationList.map((org, index) => (
                        <option key={`${org.name}_${index}`} value={org._id}>
                          {org.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
              {this.props.templateError && (
                <p className={styles['editor__error']}>
                  Please fix errors below before saving this template.
                </p>
              )}
              {this.state.deleteToggleOpen && (
                <div className={styles['editor__delete']}>
                  <span>Are you sure you want to delete this template?</span>
                  <button
                    className={classNames(styles.button, styles.buttonDelete)}
                    onClick={() => this.handleDeleteTemplate()}
                  >
                    Yes, delete this template.
                  </button>
                  <button
                    className={classNames(
                      styles.button,
                      styles.buttonSecondary
                    )}
                    onClick={() => this.handleDeleteToggle(false)}
                  >
                    Nope, nevermind!
                  </button>
                </div>
              )}
            </div>

            <div>
              {this.state.tabs.map((tab, index) => {
                return (
                  <div
                    key={index}
                    name={`${tab.name}Tab`}
                    onClick={() => {
                      this.handleTabChange(index, tab.name)
                    }}
                    className={classNames(
                      tabStyles.tab,
                      tab.name === this.state.selectedView
                        ? tabStyles.tabActive
                        : ''
                    )}
                  >
                    {tab.name}
                  </div>
                )
              })}
            </div>

            {this.state.selectedView === 'Layout' && (
              <div className={styles['editor__panels']} ref="panels">
                <div className={styles['editor-builder']}>
                  <div
                    className={classNames(
                      this.state.waypointStick === 'active'
                        ? styles['active']
                        : ''
                    )}
                    style={windowHeight}
                    ref="sidebarScroll"
                  >
                    <div
                      className={styles['editor-builder__scroll']}
                      style={scrollHeight}
                    >
                      <h3>Blocks</h3>
                      <div className={styles['editor-builder__layout']}>
                        <Panel
                          id={1}
                          list={pageElements}
                          accepts={elementAccepts}
                          setBgColor={this.setBgColor}
                          proUser={this.props.proUser}
                          views={this.props.views}
                        />
                      </div>
                      <h3>Configuration</h3>
                      <div className={styles['editor-builder__config']}>
                        {config &&
                          Object.keys(config).map((option, i) => {
                            if (
                              option !== 'numberPosition' &&
                              option !== 'tableOfContentsDepth'
                            ) {
                              return (
                                <label
                                  key={i}
                                  className={classNames(
                                    config[option] ? styles['checked'] : ''
                                  )}
                                >
                                  <input
                                    type="checkbox"
                                    value={option}
                                    onChange={e => {
                                      this.handleClickSaveConfig(e)
                                    }}
                                  />
                                  <span>{formatCamelCaseNotation(option)}</span>
                                </label>
                              )
                            }
                          })}
                        {config && config.tableOfContents && (
                          <div
                            className={
                              styles['editor-builder__config--toc-depth']
                            }
                          >
                            <p>Table of Contents depth:</p>
                            <input
                              value={config.tableOfContentsDepth || 3}
                              name="Table of Contents Depth"
                              type="number"
                              autoComplete="off"
                              step="1"
                              className={styles.depthInput}
                              min={1}
                              max={6}
                              placeholder={3}
                              onChange={e => {
                                this.handleClickSaveConfig(
                                  e,
                                  'tableOfContentsDepth'
                                )
                              }}
                            />
                          </div>
                        )}
                      </div>
                      <Waypoint
                        bottomOffset={'-20px'}
                        onEnter={() => this.setState({ scrollLabel: false })}
                        onLeave={() => this.setState({ scrollLabel: true })}
                      />
                    </div>
                    {this.state.scrollLabel && (
                      <span className={styles['editor-builder__scroll-label']}>
                        <i className="material-icons">expand_more</i>
                        scroll for more
                      </span>
                    )}
                  </div>
                </div>

                <div
                  className={classNames(
                    styles['editor-body'],
                    this.props.bodyLength > 0 ||
                      this.state.bodyBgColor === 'white'
                      ? styles['white']
                      : ''
                  )}
                >
                  <Header />
                  <Panel
                    id={2}
                    accepts={layoutAccepts}
                    setBgColor={this.setBgColor}
                    proUser={this.props.proUser}
                    views={this.props.views}
                  />
                  <Footer />
                </div>
              </div>
            )}

            {this.state.selectedView === 'Style' && <ReportStyles />}

            {this.state.selectedView === 'Attachments' && <Attachments />}
          </div>
        </div>
      </div>
    )
  }
}

const mapDispatchToProps = {
  deleteTemplate,
  nameTemplate,
  addStyledReport,
  addAttachments,
  push,
  updateTemplate,
  saveTemplate,
  templateUpdated,
  configTemplate
}

const mapStateToProps = state => ({
  name: state.template.templateViewName || '',
  attachments: state.template.templateViewAttachments || [],
  config: state.template.templateViewConfig || {},
  templateError: state.template.templateViewError,
  bodyLength: state.template.templateViewBody
    ? state.template.templateViewBody.length
    : 0,
  organizationView: state.organization.organizationView || {},
  organizationList: state.organization.organizationList || [],
  manageAllOrgSelected: state.organization.manageAllOrgSelected || false,
  proUser: Boolean(
    state.login.user &&
      state.login.user.firebaseRefs.orgId &&
      state.login.user.firebaseRefs.userId
  ),
  views: state.template.views || []
})

const withConnect = connect(mapStateToProps, mapDispatchToProps)

export default DragDropContext(HTML5Backend)(withConnect(Editor))
