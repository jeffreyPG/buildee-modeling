import faker from 'faker'

describe('Building', function() {
  beforeEach(function() {
    cy.wrap(faker.address.streetAddress()).as('buildingName')
  })

  beforeEach(function() {
    cy.addBuilding({ name: this.buildingName }).then(function(response) {
      const { body } = response
      const { building } = body
      cy.wrap(building._id).as('buildingId')
    })
  })

  beforeEach(function() {
    // Login
    cy.visit('/')
    cy.contains('Login').click()
    cy.get('#username').type(Cypress.env('test_user'))
    cy.get('#password').type(Cypress.env('test_password'))
    cy.get('button').click()
  })

  afterEach(function() {
    cy.deleteBuilding({ buildingId: this.buildingId })
  })

  describe('Constructions', function() {
    beforeEach(function() {
      // Enable waiting for building data to load
      cy.server()
      cy.route({ method: 'GET', url: '/api/organization/*/building/*' }).as(
        'getBuilding'
      )
      cy.contains(this.buildingName).click()
      cy.wait('@getBuilding')

      cy.contains(this.buildingName).click()

      cy.contains('Assets').click()
      cy.contains('Construction').click()
    })

    it('can create edit copy and delete', function() {
      cy.contains('New').click()

      // Create
      cy.get('[data-test="construction-application"]')
        .should('have.value', null)
        .select('WALL')
      cy.get('[data-test="construction-name"]')
        .should('have.value', null)
        .select('Insulated Exterior Mass Wall')

      cy.get('[data-test="construction-comments"]').type(
        'This is a typical schedule for a thermostat',
        { force: true }
      )
      cy.get('[data-test="construction-submit-button"]')
        .contains('Add Construction')
        .click()

      // Edit
      cy.get('[data-test="extras-button"]').click()
      cy.contains('Edit').click()
      cy.get('[data-test="construction-comments"]').type(
        '{selectall}This is a typical updated schedule for a thermostat',
        {
          force: true
        }
      )
      cy.get('[data-test="construction-submit-button"]')
        .contains('Update Construction')
        .click()

      cy.get('[data-test="extras-button"]').click()
      cy.contains('Edit').click()
      cy.get('[data-test="construction-comments"]').should(
        'have.value',
        'This is a typical updated schedule for a thermostat'
      )
      cy.contains('Cancel').click()

      // Copy
      cy.get('[data-test="extras-button"]').click()
      cy.contains('Copy').click()
      cy.get('[data-test="construction-application"]').should(
        'have.value',
        'WALL'
      )
      cy.get('[data-test="construction-name"]').should('not.have.value', null)
      cy.get('[data-test="construction-submit-button"]')
        .contains('Copy Construction')
        .click()
      cy.get('[data-test="sortable-list-row"]').should('have.length', 2)

      // Delete
      cy.get('[data-test="extras-button"]')
        .first()
        .click()
      cy.contains('Delete').click()
      cy.get('[data-test="delete-confirmation"]').click({ force: true })
      cy.get('[data-test="sortable-list-row"]').should('have.length', 1)
    })
  })
})
