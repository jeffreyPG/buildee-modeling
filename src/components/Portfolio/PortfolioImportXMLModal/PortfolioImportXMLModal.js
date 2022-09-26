import React, { useState, useRef, useEffect, useCallback } from 'react'
import classNames from 'classnames'
import { connect } from 'react-redux'
import Dropzone from 'react-dropzone'
import { Loader } from 'utils/Loader'
import { getOrganizationXMLBuildings } from 'routes/Organization/modules/organization'
import { importBuildingSync } from 'routes/Portfolio/modules/portfolio'
import { parentNodeHasClass, handleStringSort } from 'utils/Utils'
import styles from './PortfolioImportXMLModal.scss'

const PortfolioImportXMLModal = props => {
  const [attachedFiles, setAttachedFiles] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSynced, setIsSynced] = useState(false)
  const [option, setOption] = useState({
    organizationId: '',
    buildingId: 'new',
    characteristics: false,
    equipmentSystemsConstructions: false,
    utilities: false,
    measures: false
  })
  const [selectedBuilding, setSelectedBuilding] = useState(null)
  const [showBuildingList, setShowBuildingList] = useState(false)
  const [searchValue, setSearchValue] = useState('')
  const ref = useRef()
  const buildingRef = useRef()
  const checkboxOptions = [
    {
      label: 'Facility Characterstics & Users',
      path: 'characteristics'
    },
    {
      label: 'Equipment, Systems & Construction',
      path: 'equipmentSystemsConstructions'
    },
    {
      label: 'Utility Data',
      path: 'utilities'
    },
    {
      label: 'Energy Savings Opportunities',
      path: 'measures'
    }
  ]

  const handleClickOutside = useCallback(
    event => {
      console.log('event.target', event.target)
      if (parentNodeHasClass(event.target, 'resetBuilding')) return
      if (ref.current && !ref.current.contains(event.target)) {
        props.onClose()
      } else {
        if (
          buildingRef.current &&
          ref.current &&
          !buildingRef.current.contains(event.target)
        ) {
          setShowBuildingList(false)
        }
      }
    },
    [props, ref]
  )

  useEffect(() => {
    document.addEventListener('click', handleClickOutside, false)
    return () => {
      document.removeEventListener('click', handleClickOutside, false)
    }
  }, [handleClickOutside])

  useEffect(() => {
    if (option['buildingId'] === 'existing') {
      setSearchValue('')
    } else {
      setSelectedBuilding(null)
    }
  }, [option['buildingId']])

  useEffect(() => {
    if (!props.manageAllOrgSelected) {
      setOption(prevOption => ({
        ...prevOption,
        organizationId: props.organizationView._id
      }))
    }
  }, [props.organizationView, props.manageAllOrgSelected])

  useEffect(() => {
    props.getOrganizationXMLBuildings(option.organizationId)
  }, [option.organizationId])

  const onDrop = (files, rejectedFiles) => {
    // Do something with files
    if (files.length) {
      setAttachedFiles(files)
    }
  }

  const handleUpload = () => {
    setIsSubmitting(true)
    setIsSynced(false)
    const body = {
      ...option
    }
    if (body['buildingId'] !== 'existing') {
      delete body['buildingId']
    } else {
      if (!selectedBuilding) {
        delete body['buildingId']
      } else body['buildingId'] = selectedBuilding._id
    }

    if (attachedFiles && attachedFiles.length > 0) {
      let reader = new FileReader()
      let file = attachedFiles[0]
      reader.readAsDataURL(file)
      reader.onload = event => {
        var dataURL = event.target.result
        props
          .importBuildingSync(dataURL, body)
          .then(({ erros, warnings }) => {
            setIsSubmitting(false)
            setIsSynced(true)
          })
          .catch(err => {
            console.log(err)
            setIsSubmitting(false)
          })
      }
    } else {
      setIsSubmitting(false)
      setIsSynced(false)
    }
  }

  const handleFilterList = event => {
    setSearchValue(event.target.value)
    setShowBuildingList(true)
  }

  const renderExistingBuildingSelector = () => {
    const filteredBuildingList = props.buildingList.filter(
      building =>
        !building.archived &&
        (!searchValue ||
          building.info.buildingName
            .toLowerCase()
            .includes(searchValue.toLowerCase()))
    )
    const renderList = () => {
      if (filteredBuildingList.length == 0)
        return (
          <div className={styles.buildingListNotFound}>
            Sorry, we didn't find any buildings matching your search. Try
            another term.
          </div>
        )
      return (
        <div className={styles.buildingList}>
          {filteredBuildingList.map(building => (
            <div
              key={building._id}
              className={styles.buildingListItem}
              onClick={event => {
                setSelectedBuilding(building)
                setShowBuildingList(false)
                event.preventDefault()
                event.stopPropagation()
              }}
            >
              {building.info.buildingName}
            </div>
          ))}
        </div>
      )
    }

    return (
      <div ref={buildingRef}>
        {!selectedBuilding && (
          <div className={styles.searchInput}>
            <input
              type='search'
              value={searchValue}
              placeholder='Search for building name'
              onChange={handleFilterList}
              onFocus={() => {
                setShowBuildingList(true)
              }}
            />
            <i className='material-icons'>search</i>
          </div>
        )}
        {showBuildingList && renderList()}
        {selectedBuilding && (
          <div className={styles.buildingListSelectedItem}>
            <span>{selectedBuilding.info.buildingName}</span>
            <i
              className='material-icons resetBuilding'
              onClick={() => {
                setSelectedBuilding(null)
              }}
            >
              close
            </i>
          </div>
        )}
      </div>
    )
  }

  const renderBuildingOption = () => {
    return (
      <div className={styles.optionContainer}>
        <div className={styles.option}>
          <label className={styles.label}>Select where to import data</label>
          <div className={styles.selectContainer}>
            <select
              value={option['buildingId']}
              onChange={e =>
                setOption(prevOption => ({
                  ...prevOption,
                  buildingId: e.target.value
                }))
              }
            >
              <option defaultValue value='' disabled>
                Select
              </option>
              <option value='new'>Create a new building</option>
              <option value='existing'>Import into an existing building</option>
            </select>
          </div>

          {option['buildingId'] === 'existing' &&
            renderExistingBuildingSelector()}

          <label className={styles.label}>Select where to import data</label>
          {checkboxOptions.map(item => {
            const checked = option[item.path] || false
            return (
              <div className={styles.checkboxContainer} key={item.path}>
                <label>
                  <input
                    value={checked}
                    onChange={e => {
                      setOption(prevOption => ({
                        ...prevOption,
                        [item.path]: e.target.checked
                      }))
                    }}
                    className={classNames(checked ? styles['checked'] : '')}
                    type='checkbox'
                  />
                  <span>{item.label}</span>
                </label>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  const renderOrganizationOption = () => {
    return (
      <div
        className={classNames(
          styles.optionContainer,
          styles.organizationContainer
        )}
      >
        <div className={styles.option}>
          <label className={styles.label}>Select Organization</label>
          <div className={styles.selectContainer}>
            <select
              value={option['organizationId']}
              onChange={e =>
                setOption(prevOption => ({
                  ...prevOption,
                  organizationId: e.target.value
                }))
              }
            >
              <option defaultValue value='' disabled>
                Select
              </option>
              {props.organizationList
                .sort((orgA, orgB) => handleStringSort(orgA, orgB, 'name'))
                .map(organization => (
                  <option key={organization._id} value={organization._id}>
                    {organization.name}
                  </option>
                ))}
            </select>
          </div>
        </div>
      </div>
    )
  }

  if (isSynced) {
    return (
      <div className={styles.modal}>
        <div className={styles.modalInner} ref={ref}>
          <div className={styles.modalHeading}>
            <div>
              <h2>Import a building with a bsxml file</h2>
              <h5>
                With buildee you can import a building using a bsxml file output
                from the Building Energy Asset Score. buildee accepts required
                fields found in the NYC Energy Efficiency Report - Audit
                Template.
              </h5>
            </div>
            <div className={styles.modalClose} onClick={props.onClose}>
              <i className='material-icons'>close</i>
            </div>
          </div>
          <div className={styles.modalBody}>Building Synced successfully</div>
          <div className={styles.modalFooter}>
            <button
              className={classNames(styles.button, styles.buttonSecondary)}
              onClick={props.onClose}
            >
              CLOSE
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.modal}>
      <div className={styles.modalInner} ref={ref}>
        <div className={styles.modalHeading}>
          <div>
            <h2>Import a building with a bsxml file</h2>
            <h5>
              With buildee you can import a building using a bsxml file output
              from the Building Energy Asset Score. buildee accepts required
              fields found in the NYC Energy Efficiency Report - Audit Template.
            </h5>
          </div>
          <div className={styles.modalClose} onClick={props.onClose}>
            <i className='material-icons'>close</i>
          </div>
        </div>
        <div className={styles.modalBody}>
          <div className={styles.uploadContainer}>
            {(!attachedFiles || !attachedFiles.length) && (
              <div className={styles.upload}>
                <Dropzone
                  name='uploadCSV'
                  onDrop={onDrop}
                  accept='.xml, application/xml, text/xml'
                >
                  {({ getRootProps, getInputProps, isDragActive }) => {
                    return (
                      <div className={styles.dropzone} {...getRootProps()}>
                        <input {...getInputProps()} />
                        <p>
                          Drag and drop, or <span>browse files</span>
                        </p>
                      </div>
                    )
                  }}
                </Dropzone>
              </div>
            )}
            {attachedFiles && attachedFiles.length > 0 && (
              <div className={styles.csvUtilityFiletitle}>
                {attachedFiles[0].name} ({attachedFiles[0].type})
              </div>
            )}
          </div>
          {props.manageAllOrgSelected && (
            <div>{renderOrganizationOption()}</div>
          )}
          {option.organizationId && <div>{renderBuildingOption()}</div>}
        </div>
        <div className={styles.modalFooter}>
          <button
            className={classNames(styles.button, styles.buttonSecondary, {
              [styles.buttonDisable]: isSubmitting
            })}
            onClick={props.onClose}
          >
            Cancel
          </button>
          <button
            className={classNames(styles.button, styles.buttonPrimary, {
              [styles.buttonDisable]:
                attachedFiles.length === 0 ||
                (option['buildingId'] === 'existing' &&
                  selectedBuilding === null)
            })}
            onClick={handleUpload}
            disabled={
              attachedFiles.length === 0 ||
              (option['buildingId'] === 'existing' && selectedBuilding === null)
            }
          >
            {isSubmitting ? <Loader size='button' color='white' /> : 'Ok'}
          </button>
        </div>
      </div>
    </div>
  )
}

const mapDispatchToProps = {
  importBuildingSync,
  getOrganizationXMLBuildings
}

const mapStateToProps = state => {
  const manageAllOrgSelected = state.organization.manageAllOrgSelected || false
  return {
    buildingList: manageAllOrgSelected
      ? (state.building && state.building.xmlBuildingList) || []
      : (state.building && state.building.buildingList) || [],
    organizationView:
      (state.organization && state.organization.organizationView) || {},
    organizationList:
      (state.organization && state.organization.organizationList) || [],
    manageAllOrgSelected
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(PortfolioImportXMLModal)
