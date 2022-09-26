import base64 from 'base-64'
import 'cypress-file-upload'
import { default as encrypt } from 'crypto-js/hmac-sha1'

function createDigest(secret, method, path, nonce, timestamp) {
  const digest = [method, path, timestamp, nonce].join('+')
  return String(encrypt(digest, secret))
}

Cypress.Commands.add(
  'login',
  (
    email = Cypress.env('test_user'),
    password = Cypress.env('test_password')
  ) => {
    const authHeader = base64.encode(email + ':' + password)
    return cy
      .request({
        url: `${Cypress.env('api_url')}/api/auth/token`,
        method: 'GET',
        body: { hmac: false },
        headers: {
          Authorization: `basic ${authHeader}`
        }
      })
      .then(response => {
        cy.log('user service login')
        expect(response.status).to.eq(200)

        const body = response.body
        const session = body.session
        const secret = session.secret
        const user = body.user

        return cy.wrap({ user, secret })
      })
  }
)

Cypress.Commands.add('auth', ({ method, path }) => {
  return cy.login().then(({ user, secret }) => {
    const nonce = String(Math.floor(Math.random() * 1000000000))
    const timestamp = Math.floor(Date.now() / 1000)
    const digest = createDigest(secret, method, path, nonce, timestamp)
    const token = 'hmac ' + user._id + ':' + nonce + ':' + digest
    return cy.wrap({
      headers: {
        Authorization: token,
        x_date: timestamp
      }
    })
  })
})

Cypress.Commands.add('getUserOrganization', () => {
  return cy.login().then(({ user }) => {
    const testId = Cypress.env('test_organization')
    const id = user.orgIds.find(orgId => testId === orgId)
    return cy.wrap(id)
  })
})

Cypress.Commands.add('addBuilding', ({ name }) => {
  cy.getUserOrganization().then(organizationId => {
    const path = `/organization/${organizationId}/building`
    const method = 'POST'
    const body = {
      buildingName: name,
      buildYear: '1950',
      squareFeet: 5000,
      floorCount: 1,
      'location.address': '3000 Lawrence Street',
      'location.city': 'Denver',
      'location.zipCode': '80205',
      'location.state': 'CO',
      buildingUse: 'adult-education',
      open247: 'no'
    }
    return cy
      .auth({ method, path })
      .then(({ headers }) => {
        return cy.request({
          url: `${Cypress.env('api_url')}/api${path}`,
          method,
          body,
          headers
        })
      })
      .then(response => {
        expect(response.status).to.eq(200)
        return response
      })
  })
})

Cypress.Commands.add('deleteBuilding', ({ buildingId }) => {
  cy.getUserOrganization().then(organizationId => {
    const path = `/organization/${organizationId}/building/${buildingId}`
    const method = 'DELETE'
    return cy
      .auth({ method, path })
      .then(({ headers }) => {
        return cy.request({
          url: `${Cypress.env('api_url')}/api${path}`,
          method,
          headers
        })
      })
      .then(response => {
        expect(response.status).to.eq(200)
      })
  })
})

Cypress.Commands.add('deleteReport', ({ templateId }) => {
  cy.getUserOrganization().then(organizationId => {
    const path = `/organization/${organizationId}/template/${templateId}`
    const method = 'DELETE'
    return cy
      .auth({ method, path })
      .then(({ headers }) => {
        return cy.request({
          url: `${Cypress.env('api_url')}/api${path}`,
          method,
          headers
        })
      })
      .then(response => {
        expect(response.status).to.eq(200)
      })
  })
})
