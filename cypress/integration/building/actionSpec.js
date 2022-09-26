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

  describe('Actions', function() {
    beforeEach(function() {
      // Enable waiting for building data to load
      cy.server()
      cy.route({ method: 'GET', url: '/api/organization/*/building/*' }).as(
        'getBuilding'
      )
      cy.contains(this.buildingName).click()
      cy.wait('@getBuilding')

      cy.contains(this.buildingName).click()

      cy.contains('Actions').click()
    })

    it('can create edit copy and delete', function() {
      const jobTitle = faker.name.jobTitle()
      const firstName = faker.name.firstName()
      cy.contains('New').click()

      // Create
      cy.get('[data-test="action-type"]').select('Benchmarking')

      cy.get('[data-test="action-description"]').type(
        'This is a description of the benchmarking action',
        { force: true }
      )
      cy.get('[data-test="action-comment"]').type(
        'This is a comment about the benchmarking action',
        { force: true }
      )

      cy.contains('Add New Contact').click({ force: true })

      cy.get('[data-test="action-contact-title"]').type(jobTitle, {
        force: true
      })
      cy.get('[data-test="action-contact-first-name"]').type(firstName, {
        force: true
      })
      cy.get('[data-test="action-contact-last-name"]').type(
        faker.name.lastName(),
        { force: true }
      )
      cy.get('[data-test="action-contact-phoneNumber"]').type(
        faker.phone.phoneNumber(),
        { force: true }
      )
      cy.get('[data-test="action-contact-emailAddress"]').type(
        faker.internet.email(),
        { force: true }
      )
      cy.get('[data-test="action-submit-button"]')
        .contains('Add Action')
        .click()

      // Edit
      cy.get('[data-test="extras-button"]').click()
      cy.contains('Edit').click()

      cy.contains(jobTitle).should('have.length', 1)
      cy.contains(`Edit ${jobTitle}`)
        .should('have.length', 1)
        .click({ force: true })
      cy.get('[data-test="action-contact-first-name"]')
        .clear({ force: true })
        .type(`Updated ${firstName}`, {
          force: true
        })

      cy.get('[data-test="action-description"]')
        .should(
          'have.value',
          'This is a description of the benchmarking action'
        )
        .type(
          '{selectall}This is an updated description about the benchmarking action',
          {
            force: true
          }
        )
      cy.get('[data-test="action-comment"]')
        .should('have.value', 'This is a comment about the benchmarking action')
        .clear({ force: true })
        .type('This is an updated comment about the benchmarking action', {
          force: true
        })
      cy.get('[data-test="action-submit-button"]')
        .contains('Update Action')
        .click()

      cy.get('[data-test="extras-button"]').click()
      cy.contains('Edit').click()
      cy.contains(`Edit ${jobTitle}`)
        .should('have.length', 1)
        .click({ force: true })
      cy.get('[data-test="action-contact-first-name"]').should(
        'have.value',
        `Updated ${firstName}`
      )

      cy.get('[data-test="action-description"]').should(
        'have.value',
        'This is an updated description about the benchmarking action'
      )
      cy.get('[data-test="action-comment"]').should(
        'have.value',
        'This is an updated comment about the benchmarking action'
      )
      cy.contains('Cancel').click()

      // Delete
      cy.get('[data-test="sortable-list-row"]').should('have.length', 1)
      cy.get('[data-test="extras-button"]')
        .first()
        .click()
      cy.contains('Delete').click()
      cy.get('[data-test="delete-confirmation"]').click({ force: true })
      cy.get('[data-test="sortable-list-row"]').should('have.length', 0)
    })
  })
})
