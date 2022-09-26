import faker from 'faker'

describe('Building', function() {
  beforeEach(function() {
    cy.wrap(faker.address.streetAddress()).as('buildingName')
  })

  beforeEach(function() {
    // Login
    cy.visit('/')
    cy.contains('Login').click()
    cy.get('#username').type(Cypress.env('test_user'))
    cy.get('#password').type(Cypress.env('test_password'))
    cy.get('button').click()
  })

  it('can be created', function() {
    cy.contains('New Building').click()
    cy.get('[name="buildingName"]').type(this.buildingName)
    cy.contains('Next').click()

    cy.get('[name="zipCode"]').type('80050')
    cy.contains('Next').click()

    cy.get('[name="buildingUse"]').select('Office')
    cy.contains('Next').click()

    cy.get('[name="squareFeet"]').type(5000)
    cy.get('[name="floorCount"]').type(6)
    cy.contains('Next').click()

    cy.get('[name="buildYear"]').type(1999)
    cy.contains('Next').click()

    cy.get('[name="open24/7"]').select('Yes')
    cy.contains('Submit').click()
    cy.contains(this.buildingName)
  })
})
