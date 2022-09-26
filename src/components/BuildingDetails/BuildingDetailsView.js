import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { BuildingDetailsEdit } from 'containers/Form/BuildingForms'
import buildingTypes from 'static/building-types'
import styles from './BuildingDetailsView.scss'
import { formatNumbersWithCommas, formatCamelCaseNotation } from 'utils/Utils'
import industryTypes from 'static/building-industry-types'

const getIndustryName = value => {
  const industry = industryTypes.find(item => item.value === value)
  return industry && industry.name
}

export class BuildingDetailsView extends React.Component {
  static propTypes = {
    buildingInfo: PropTypes.object.isRequired,
    onBuildingDetailsSubmit: PropTypes.func.isRequired,
    cancelEditForm: PropTypes.func.isRequired,
    handleStartEdit: PropTypes.func.isRequired,
    editingForm: PropTypes.bool.isRequired,
    changeFirebaseAudit: PropTypes.func.isRequired,
    user: PropTypes.object.isRequired,
    uploadProjectImage: PropTypes.func.isRequired,
    getBuildingIdentifiers: PropTypes.func.isRequired,
    getUserById: PropTypes.func.isRequired
  }

  state = {
    initialValues: {},
    buildingAuthor: ''
  }

  componentDidMount = () => {
    if (this.props.buildingInfo.createdByUserId) {
      this.handleGetBuildingAuthor(this.props.buildingInfo.createdByUserId)
    }
  }

  componentDidUpdate = prevProps => {
    if (
      prevProps.buildingInfo.createdByUserId !==
      this.props.buildingInfo.createdByUserId
    ) {
      this.handleGetBuildingAuthor(this.props.buildingInfo.createdByUserId)
    }
  }

  handleGetBuildingAuthor = userId => {
    this.props
      .getUserById(userId)
      .then(user => {
        this.setState({ buildingAuthor: user.username })
      })
      .catch(() => {})
  }

  findBuildingUseName = buildingUse => {
    if (buildingUse) {
      let typeObject = buildingTypes.find(type => type.value === buildingUse)
      return typeObject ? typeObject.name : 'Undefined'
    } else {
      return 'Undefined'
    }
  }

  renderStaticGoogleMap = (address, city, state, zipCode, country) => {
    const GOOGLE_MAPS_URI = 'https://maps.googleapis.com/maps/api/staticmap'
    const GOOGLE_MAPS_API_KEY = 'AIzaSyBwwnkl41oPPHk_hwbCFEZnRwReZi1BASA'
    let mapAddress =
      address + ', ' + city + ', ' + state + ', ' + country + ', ' + zipCode

    let center = mapAddress || 'US'
    let zoom = mapAddress ? '16' : '1' // If there is a specific address, then zoom in
    let size = '450x325'
    let maptype = 'hybrid'
    let markers = mapAddress || 'US'

    let imgSrc =
      'center=' +
      center +
      '&' +
      'zoom=' +
      zoom +
      '&' +
      'size=' +
      size +
      '&' +
      'maptype=' +
      maptype +
      '&' +
      'markers=' +
      markers +
      '&' +
      'key=' +
      GOOGLE_MAPS_API_KEY
    let fullSrc = GOOGLE_MAPS_URI + '?' + imgSrc

    return (
      <div>
        <img src={fullSrc} />
        {(address === '' || city === '' || state === '' || zipCode === '') && (
          <p className={styles.imageWarning}>
            Please enter full address for an accurate map.
          </p>
        )}
      </div>
    )
  }

  render() {
    const { buildingInfo, user } = this.props

    return (
      <div className={classNames(styles.panel, styles.buildingDetail)}>
        <div className={styles.panelHeader}>
          <h3>Property</h3>
          {!this.props.editingForm && (
            <div
              className={styles.panelEdit}
              onClick={this.props.handleStartEdit}
            >
              <i
                onClick={this.props.handleStartEdit}
                className='material-icons'
              >
                edit
              </i>
            </div>
          )}
        </div>

        {!this.props.editingForm && buildingInfo && (
          <div className={styles.panelContent}>
            <div className={styles.info}>
              <div className={styles.detail}>
                <label>
                  Address<sup>*</sup>
                </label>
                <div>
                  {buildingInfo.location && buildingInfo.location.address && (
                    <span>{buildingInfo.location.address}</span>
                  )}
                  {buildingInfo.location && !buildingInfo.location.address && (
                    <i className='material-icons warning'>warning</i>
                  )}
                  <p>
                    {buildingInfo.location && buildingInfo.location.country && (
                      <span>{buildingInfo.location.country}</span>
                    )}
                    {buildingInfo.location && buildingInfo.location.city && (
                      <span>, {buildingInfo.location.city}</span>
                    )}
                    {buildingInfo.location && buildingInfo.location.state && (
                      <span>, {buildingInfo.location.state}</span>
                    )}
                    {buildingInfo.location && buildingInfo.location.zipCode && (
                      <span> {buildingInfo.location.zipCode}</span>
                    )}
                  </p>
                </div>
              </div>

              {buildingInfo.customFields &&
                buildingInfo.customFields.length > 0 &&
                buildingInfo.customFields.map((field, index) => {
                  return (
                    <div className={styles.detail} key={index}>
                      <label>{field.key}</label>
                      <p>{field.value}</p>
                    </div>
                  )
                })}

              <div className={styles.detail}>
                <label>
                  Above Grade Floors<sup>*</sup>
                </label>
                <p>
                  {buildingInfo.floorCount || (
                    <i className='material-icons warning'>warning</i>
                  )}
                </p>
              </div>

              <div className={styles.detail}>
                <label>
                  Below Grade Floors<sup>*</sup>
                </label>
                <p>
                  {buildingInfo.belowGradeFloorCount ||
                    (buildingInfo.belowGradeFloorCount === 0 && '0') || (
                      <i className='material-icons warning'>warning</i>
                    )}
                </p>
              </div>

              <div className={styles.detail}>
                <label>
                  Year Built<sup>*</sup>
                </label>
                <p>
                  {buildingInfo.buildYear || (
                    <i className='material-icons warning'>warning</i>
                  )}
                </p>
              </div>

              <div className={styles.detail}>
                <label>
                  Open 24/7?<sup>*</sup>
                </label>
                <p>
                  {buildingInfo.open247 ? (
                    formatCamelCaseNotation(buildingInfo.open247)
                  ) : (
                    <i className='material-icons warning'>warning</i>
                  )}
                </p>
              </div>

              <div className={styles.detail}>
                <label>
                  Gross Floor Area<sup>*</sup>
                </label>
                <p>
                  {formatNumbersWithCommas(buildingInfo.squareFeet) +
                    `ft${'\u00B2'}` || (
                    <i className='material-icons warning'>warning</i>
                  )}
                </p>
              </div>
              <div className={styles.detail}>
                <label>
                  Primary Use<sup>*</sup>
                </label>
                <p>
                  {this.findBuildingUseName(buildingInfo.buildingUse) || (
                    <i className='material-icons warning'>warning</i>
                  )}
                </p>
              </div>

              <div className={styles.detail}>
                <label>
                  Use List<sup>*</sup>
                </label>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th />
                      <th>Use</th>
                      <th>Sq.Ft.</th>
                    </tr>
                  </thead>
                  <tbody>
                    {buildingInfo.buildingUseTypes &&
                      buildingInfo.buildingUseTypes.length > 0 &&
                      buildingInfo.buildingUseTypes.map(field => {
                        return (
                          <tr key={`$use-type-${field.use}`}>
                            <td />
                            <td>
                              {this.findBuildingUseName(field.use) || (
                                <i className='material-icons warning'>
                                  warning
                                </i>
                              )}
                            </td>
                            <td>{field.squareFeet}</td>
                          </tr>
                        )
                      })}
                  </tbody>
                </table>
              </div>

              <div className={styles.detail}>
                <label>Client Name</label>
                <p>{buildingInfo.clientName || '-'}</p>
              </div>
              <div className={styles.detail}>
                <label>Client Industry</label>
                <p>{getIndustryName(buildingInfo.clientIndustry) || '-'}</p>
              </div>

              <div className={styles.detail}>
                <label>Site Name</label>
                <p>{buildingInfo.siteName || '-'}</p>
              </div>

              {user.products &&
                user.products.buildeeNYC === 'access' &&
                buildingInfo.nycFields && (
                  <div className={styles.detail}>
                    <label>Borough</label>
                    <p>{buildingInfo.nycFields.borough || '-'}</p>
                  </div>
                )}
              {user.products &&
                user.products.buildeeNYC === 'access' &&
                buildingInfo.nycFields && (
                  <div className={styles.detail}>
                    <label>Block</label>
                    <p>{buildingInfo.nycFields.block || '-'}</p>
                  </div>
                )}
              {user.products &&
                user.products.buildeeNYC === 'access' &&
                buildingInfo.nycFields && (
                  <div className={styles.detail}>
                    <label>Tax Lot</label>
                    <p>{buildingInfo.nycFields.taxLot || '-'}</p>
                  </div>
                )}
              {user.products &&
                user.products.buildeeNYC === 'access' &&
                buildingInfo.nycFields && (
                  <div className={styles.detail}>
                    <label>Borough/Block/Lot (BBL)</label>
                    <p>{`${buildingInfo.nycFields.borough ||
                      'XX'}-${buildingInfo.nycFields.block ||
                      'XXXX'}-${buildingInfo.nycFields.taxLot || 'XXX'}`}</p>
                  </div>
                )}
              {user.products &&
                user.products.buildeeNYC === 'access' &&
                buildingInfo.nycFields && (
                  <div className={styles.detail}>
                    <label>BIN</label>
                    <p>{buildingInfo.nycFields.bin || '-'}</p>
                  </div>
                )}

              {user.products &&
                user.products.buildeeNYC === 'access' &&
                buildingInfo.nycFields && (
                  <div className={styles.detail}>
                    <label>Historic Building?</label>
                    <p>
                      {buildingInfo.nycFields.historicBuilding || (
                        <i className='material-icons warning'>warning</i>
                      )}
                    </p>
                  </div>
                )}

              {user.products &&
                user.products.buildeeNYC === 'access' &&
                buildingInfo.nycFields && (
                  <div className={styles.detail}>
                    <label>Percent Owned</label>
                    <p>{buildingInfo.nycFields.percentOwned || '-'}</p>
                  </div>
                )}

              {user.products &&
                user.products.buildeeNYC === 'access' &&
                buildingInfo.nycFields && (
                  <div className={styles.detail}>
                    <label>Percent Leased</label>
                    <p>{buildingInfo.nycFields.percentLeased || '-'}</p>
                  </div>
                )}

              {user.products &&
                user.products.buildeeNYC === 'access' &&
                buildingInfo.nycFields && (
                  <div className={styles.detail}>
                    <label>Multi Tenant?</label>
                    <p>
                      {buildingInfo.nycFields.multiTenant || (
                        <i className='material-icons warning'>warning</i>
                      )}
                    </p>
                  </div>
                )}

              {user.products &&
                user.products.buildeeNYC === 'access' &&
                buildingInfo.nycFields && (
                  <div className={styles.detail}>
                    <label>
                      Shared Energy Systems or Meters for Multiple Buildings on
                      Single Lot?
                    </label>
                    <p>
                      {buildingInfo.nycFields
                        .sharedEnergySystemsOrMetersForMultipleBuildingsOnSingleLot || (
                        <i className='material-icons warning'>warning</i>
                      )}
                    </p>
                  </div>
                )}

              {user.products &&
                user.products.buildeeNYC === 'access' &&
                buildingInfo.nycFields && (
                  <div className={styles.detail}>
                    <label>
                      Shared Energy Systems or Meters for Multiple Buildings on
                      Multiple Lots?
                    </label>
                    <p>
                      {buildingInfo.nycFields
                        .sharedEnergySystemsOrMetersForMultipleBuildingsOnMultipleLots || (
                        <i className='material-icons warning'>warning</i>
                      )}
                    </p>
                  </div>
                )}

              <div className={styles.detail}>
                <label>Contacts</label>
                {buildingInfo.contacts &&
                  buildingInfo.contacts.length <= 0 &&
                  '-'}
                {buildingInfo.contacts && buildingInfo.contacts.length > 0 && (
                  <div className={styles.contacts}>
                    {buildingInfo.contacts.map((contact, index) => {
                      return (
                        <div key={index}>
                          <p>
                            {contact.firstName} {contact.lastName}
                            {contact.title ? `, ${contact.title}` : ''}
                            {contact.company ? `, ${contact.company}` : ''}
                          </p>
                          <p>
                            {contact.phoneNumber ? (
                              <span>{contact.phoneNumber}</span>
                            ) : (
                              ''
                            )}
                            {contact.emailAddress ? (
                              <span>{contact.emailAddress}</span>
                            ) : (
                              ''
                            )}
                            {contact.role ? <span>{contact.role}</span> : ''}
                          </p>
                          <p>
                            {contact.qualification ? (
                              <span>{contact.qualification}</span>
                            ) : (
                              ''
                            )}
                            {contact.certificateNumber ? (
                              <span>{contact.certificateNumber}</span>
                            ) : (
                              ''
                            )}
                            {contact.expirationDate ? (
                              <span>{contact.expirationDate}</span>
                            ) : (
                              ''
                            )}
                            {contact.yearsOfExperience ? (
                              <span>{contact.yearsOfExperience} yrs</span>
                            ) : (
                              ''
                            )}
                          </p>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {buildingInfo.tags && buildingInfo.tags.length > 0 && (
                <div className={styles.detail}>
                  <label>Tags</label>
                  <div className={styles.tags}>
                    {buildingInfo.tags.map((tag, index) => {
                      return (
                        <div key={index} className={styles.tag}>
                          <small>{tag}</small>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {this.state.buildingAuthor !== '' && (
                <div className={styles.detail}>
                  <label>Author</label>
                  <p>{this.state.buildingAuthor}</p>
                </div>
              )}

              {/* new building fields */}
              {/* {buildingInfo.newFields.length &&
                buildingInfo.newFields.map(field => {
                  return (
                    <div key={field.title} className={styles.detail}>
                      <label>{field.label || field.title}</label> &nbsp;
                      <p>
                        {(buildingInfo.newFieldValues &&
                          buildingInfo.newFieldValues[field.title]) ||
                          ''}
                      </p>
                    </div>
                  )
                })} */}
            </div>

            {buildingInfo.location && (
              <div className={styles.image}>
                {this.renderStaticGoogleMap(
                  buildingInfo.location.address,
                  buildingInfo.location.city,
                  buildingInfo.location.state,
                  buildingInfo.location.zipCode,
                  buildingInfo.location.country || 'US'
                )}
              </div>
            )}
          </div>
        )}

        {this.props.editingForm && (
          <div className={styles['building-header__edit']}>
            <BuildingDetailsEdit
              onBuildingDetailsSubmit={this.props.onBuildingDetailsSubmit}
              cancelEditForm={this.props.cancelEditForm}
              uploadProjectImage={this.props.uploadProjectImage}
              buildingInfo={this.props.buildingInfo}
              changeFirebaseAudit={this.props.changeFirebaseAudit}
              user={this.props.user}
              getBuildingIdentifiers={this.props.getBuildingIdentifiers}
            />
          </div>
        )}
      </div>
    )
  }
}

export default BuildingDetailsView
