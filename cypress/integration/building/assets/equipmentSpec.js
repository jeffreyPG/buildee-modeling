import faker from 'faker'

import publicEquipmentFixture from '../../../fixtures/equipment.json'

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

  afterEach(function() {
    cy.deleteBuilding({ buildingId: this.buildingId })
  })

  beforeEach(function() {
    // Enable waiting for building data to load
    cy.server()
    cy.route({ method: 'GET', url: '/api/user/*/organizations' }).as(
      'getOrganizations'
    )
    cy.route({ method: 'GET', url: '/api/organization/*/building' }).as(
      'getBuildings'
    )
    // Login
    cy.visit('/')
    cy.contains('Login').click()
    cy.get('#username').type(Cypress.env('test_user'))
    cy.get('#password').type(Cypress.env('test_password'))
    cy.get('button').click()
    cy.wait(['@getOrganizations', '@getBuildings'])
  })

  context('Equipment', function() {
    beforeEach(function() {
      // Enable waiting for building data to load
      cy.server()
      cy.route({
        method: 'GET',
        url: '/api/organization/*/building/*'
      }).as('getBuilding')

      // Visit Building Details
      cy.contains(this.buildingName).click()
      cy.wait('@getBuilding')
      cy.contains('Assets').click()
    })

    const offset = 4
    const randomIndex = Math.floor(
      Math.random() * Math.floor(publicEquipmentFixture.length - offset)
    )

    publicEquipmentFixture
      .slice(randomIndex, randomIndex + offset)
      .forEach(function(publicEquipment) {
        describe(`${publicEquipment.application} ${publicEquipment.category} Equipment`, function() {
          it('can create add edit copy and delete', function() {
            const name = `${faker.random.uuid()}`

            // Visit Equipment Tab
            cy.contains('Equipment').click()
            cy.contains('New').click()

            // Create
            cy.get('[name="name"]').type(name, { force: true })
            cy.get('[data-test="building-equipment-add-button"]').should(
              'be.disabled'
            )
            cy.contains('Create custom equipment').click({ force: true })
            cy.get('[name="category"]')
              .select(publicEquipment.category, {
                force: true
              })
              .should('have.value', publicEquipment.category)
            if (
              publicEquipment.application &&
              publicEquipment.application.length > 0
            ) {
              cy.get('[name="application"]')
                .select(publicEquipment.application, {
                  force: true
                })
                .should('have.value', publicEquipment.application)
            }
            if (
              publicEquipment.technology &&
              publicEquipment.technology.length > 0
            ) {
              cy.get('[name="technology"]')
                .select(publicEquipment.technology, {
                  force: true
                })
                .should('have.value', publicEquipment.technology)
            }
            cy.get(
              `[data-test="equipment-field-${publicEquipment.params.field}"]`
            )
              .type(publicEquipment.params.fieldInitialValue, {
                force: true
              })
              .should('have.value', publicEquipment.params.fieldInitialValue)
            cy.get('[data-test="equipment-field-fuel"]')
              .select(publicEquipment.fuel, {
                force: true
              })
              .should('have.value', publicEquipment.fuel)
            cy.get(
              `[data-test="equipment-config-${publicEquipment.params.config}"]`
            )
              .type(publicEquipment.params.configInitialValue, {
                force: true
              })
              .should('have.value', publicEquipment.params.configInitialValue)

            cy.get('[name="comments"]').type(
              'information about this equipment',
              {
                force: true
              }
            )

            cy.get('[data-test="building-equipment-add-button"]').click()
            cy.get('[data-test="building-equipment-list"]').contains(name)
            cy.get('[data-test="building-equipment-list"]').contains('1')
            cy.get('[data-test="building-equipment-list"]').contains(name)

            // Edit
            cy.get('[data-test="extras-button"]').click()
            cy.contains('Edit').click()

            cy.contains('Show Equipment Details').click({ force: true })
            cy.get(
              `[data-test="equipment-field-${publicEquipment.params.field}"]`
            ).should('have.value', publicEquipment.params.fieldInitialValue)
            cy.get(
              `[data-test="equipment-config-${publicEquipment.params.config}"]`
            ).should('have.value', publicEquipment.params.configInitialValue)
            cy.get(
              `[data-test="equipment-config-${publicEquipment.params.config}"]`
            ).type(`{selectall}${publicEquipment.params.configUpdateValue}`, {
              force: true
            })
            cy.get('[name="quantity"]').type('{selectall}3', { force: true })
            cy.get('[name="comments"]').type(
              '{selectall}information that has been updated',
              {
                force: true
              }
            )

            cy.get('[data-test="building-equipment-add-button"]').click()
            cy.get('[data-test="building-equipment-list"]').contains(name)
            cy.get('[data-test="building-equipment-list"]').contains('3')

            // Assert Changes
            cy.get('[data-test="extras-button"]').click()
            cy.contains('Edit').click()

            cy.get(
              `[data-test="equipment-config-${publicEquipment.params.config}"]`
            ).should('have.value', publicEquipment.params.configUpdateValue)
            cy.get('[name="quantity"]').should('have.value', '3')
            cy.get('[name="comments"]').should(
              'have.value',
              'information that has been updated'
            )
            cy.contains('Cancel').click()

            // Copy
            cy.get(
              '[data-test="building-equipment-list"] [data-test="sortable-list-row"]'
            ).should('have.length', 1)
            cy.get('[data-test="extras-button"]').click()
            cy.contains('Copy').click()
            cy.contains('Copy').should('not.be.visible')
            cy.get(
              '[data-test="building-equipment-list"] [data-test="sortable-list-row"]'
            ).should('have.length', 2)

            cy.get(
              '[data-test="building-equipment-list"] [data-test="sortable-list-row"]'
            )
              .last()
              .within(function() {
                cy.get('[data-test="extras-button"]').click()
                cy.contains('Edit').click({ force: true })
                cy.contains('Edit').should('not.be.visible')
              })
            cy.get('[name="quantity"]').should('have.value', '1')
            cy.contains('Cancel').click()

            // Delete
            cy.get(
              '[data-test="building-equipment-list"] [data-test="sortable-list-row"]'
            )
              .last()
              .within(function() {
                cy.get('[data-test="extras-button"]').click()
                cy.contains('Delete').click()
                cy.contains('Delete').should('not.be.visible')
              })
            cy.get('[data-test="delete-confirmation"]').click({ force: true })
            cy.get(
              '[data-test="building-equipment-list"] [data-test="sortable-list-row"]'
            ).should('have.length', 1)
          })

          it('can search add edit copy and delete', function() {
            // Visit Equipment Tab
            cy.contains('Equipment').click()
            cy.contains('New').click()

            // Search
            cy.get('[data-test="filter-button"]').click()
            cy.get('[name="category"]')
              .select(publicEquipment.category, {
                force: true
              })
              .should('have.value', publicEquipment.category)
            if (
              publicEquipment.application &&
              publicEquipment.application.length > 0
            ) {
              cy.get('[name="application"]')
                .select(publicEquipment.application, {
                  force: true
                })
                .should('have.value', publicEquipment.application)
            }
            if (
              publicEquipment.technology &&
              publicEquipment.technology.length > 0
            ) {
              cy.get('[name="technology"]')
                .select(publicEquipment.technology, {
                  force: true
                })
                .should('have.value', publicEquipment.technology)
            }
            cy.get('[data-test="equipment-search-input"]').type(
              publicEquipment.params.search,
              {
                force: true
              }
            )
            cy.contains(publicEquipment.name).click({ force: true })

            // Add
            cy.get('[name="name"]').should('be.disabled')
            cy.contains('Show Equipment Details').click({ force: true })
            cy.get(
              `[data-test="equipment-field-${publicEquipment.params.field}"]`
            ).should('be.disabled')
            cy.get('[data-test="equipment-field-fuel"]').should(
              'have.value',
              publicEquipment.fuel
            )
            cy.get(
              `[data-test="equipment-config-${publicEquipment.params.config}"]`
            ).type(publicEquipment.params.configInitialValue, {
              force: true
            })
            cy.get('[name="comments"]').type(
              'information about this equipment',
              {
                force: true
              }
            )
            cy.get('[data-test="building-equipment-add-button"]').click()
            cy.get('[data-test="building-equipment-list"]').contains(
              publicEquipment.name
            )

            // Edit
            cy.get('[data-test="extras-button"]').click()
            cy.contains('Edit').click()

            cy.get(
              `[data-test="equipment-config-${publicEquipment.params.config}"]`
            ).should('have.value', publicEquipment.params.configInitialValue)
            cy.get(
              `[data-test="equipment-config-${publicEquipment.params.config}"]`
            ).type(`{selectall}${publicEquipment.params.configUpdateValue}`, {
              force: true
            })
            cy.get('[name="quantity"]').type('{selectall}3', { force: true })
            cy.get('[name="comments"]').type(
              '{selectall}information that has been updated',
              {
                force: true
              }
            )

            cy.get('[data-test="building-equipment-add-button"]').click()
            cy.get('[data-test="building-equipment-list"]').contains(
              publicEquipment.name
            )
            cy.get('[data-test="building-equipment-list"]').contains('3')

            // Assert Changes
            cy.get('[data-test="extras-button"]').click()
            cy.contains('Edit').click()

            cy.get(
              `[data-test="equipment-config-${publicEquipment.params.config}"]`
            ).should('have.value', publicEquipment.params.configUpdateValue)
            cy.get('[name="quantity"]').should('have.value', '3')
            cy.get('[name="comments"]').should(
              'have.value',
              'information that has been updated'
            )
            cy.contains('Cancel').click()

            // Copy
            cy.get(
              '[data-test="building-equipment-list"] [data-test="sortable-list-row"]'
            ).should('have.length', 1)
            cy.get('[data-test="extras-button"]').click()
            cy.contains('Copy').click()
            cy.contains('Copy').should('not.be.visible')
            cy.get(
              '[data-test="building-equipment-list"] [data-test="sortable-list-row"]'
            ).should('have.length', 2)

            // Delete
            cy.get(
              '[data-test="building-equipment-list"] [data-test="sortable-list-row"]'
            )
              .last()
              .within(function() {
                cy.get('[data-test="extras-button"]').click()
                cy.contains('Delete').click()
                cy.contains('Delete').should('not.be.visible')
              })
            cy.get('[data-test="delete-confirmation"]').click({ force: true })
            cy.get(
              '[data-test="building-equipment-list"] [data-test="sortable-list-row"]'
            ).should('have.length', 1)
          })
        })
      })

    it('finds fields for unselected schemas', function() {
      const BRAND = 'BRADFORD WHITE'
      const MODEL = 'CF-70-*'

      // Visit Equipment Tab
      cy.contains('Equipment').click()
      cy.contains('New').click()

      cy.get('[data-test="equipment-search-input"]').type(`${BRAND} ${MODEL}`, {
        force: true
      })
      cy.contains(`${BRAND} ${MODEL}`).click({ force: true })
      cy.contains('Show Equipment Details').click({ force: true })
      cy.get('[name="fields.brand.value"]').should('have.value', BRAND)
    })

    it('finds recently added equipment', function() {
      const CATEGORY = 'Lighting'

      const name = `${faker.random.uuid()}`

      // Visit Equipment Tab
      cy.contains('Equipment').click()
      cy.contains('New').click()

      // Create
      cy.get('[name="name"]').type(name)
      cy.contains('Create custom equipment').click({ force: true })
      cy.get('[name="category"]').select(CATEGORY)

      cy.get('[data-test="building-equipment-add-button"]').click()
      cy.get('[data-test="building-equipment-list"]').contains(name)

      // Assert
      cy.contains('New').click()
      cy.get('[data-test="equipment-form"]').within(function() {
        cy.get('[data-test="equipment-search-input"]').focus()
        cy.contains(name).click()
      })
    })

    it('uploads images', function() {
      const CATEGORY = 'Lighting'

      const name = `${faker.random.uuid()}`

      // Visit Equipment Tab
      cy.contains('Equipment').click()
      cy.contains('New').click()

      // Create
      cy.get('[name="name"]').type(name)
      cy.contains('Create custom equipment').click({ force: true })
      cy.get('[name="category"]').select(CATEGORY)

      cy.get('[data-test="image-preview"]').should('have.length', 0)

      cy.fixture('images/buildingphoto.jpeg').then(fileContent => {
        cy.get('[data-test="file-input"]').upload({
          fileContent,
          fileName: 'buildingphoto.jpeg',
          mimeType: 'image/jpeg'
        })
      })
      cy.get('[data-test="image-preview"]').should('have.length', 1)
    })
  })

  describe('Locations', function() {
    beforeEach(function() {
      cy.fixture('light').as('publicEquipment')
    })

    beforeEach(function() {
      // Enable waiting for building data to load
      cy.server()
      cy.route({ method: 'GET', url: '/api/organization/*/building/*' }).as(
        'getBuilding'
      )
      cy.contains(this.buildingName).click()
      cy.wait('@getBuilding')

      // Visit Locations Tab
      cy.contains('Assets').click()
      cy.contains('Location').click()
      cy.contains('New').click()

      const locationName = `Test ${faker.name.jobArea()} ${faker.random.number()}`
      cy.wrap(locationName).as('locationName')
      cy.wrap(`Office ${locationName}`).as('expectedLocationName')

      // Create Location
      cy.get('[name="usetype"]').select('Office', { force: true })
      cy.get('[name="name"]').type(locationName, { force: true })
      cy.get('[name="conditioning"]').select('Heating & Cooling', {
        force: true
      })
      cy.get('[name="user"]').select('Owner', { force: true })
      cy.get('button[type=submit]').click()
      cy.contains(locationName)
    })

    it('can be added and removed', function() {
      // Add Equipment
      cy.contains('Equipment').click()
      cy.contains('New').click()

      cy.get('[data-test="filter-button"]').click()
      cy.get('[name="category"]').select(this.publicEquipment.category, {
        force: true
      })
      cy.get('[name="name"]').type(this.publicEquipment.name.split(' ')[0], {
        force: true
      })
      cy.contains(this.publicEquipment.name).click({ force: true })

      cy.get('[name="location"]').type(this.locationName.split(' ')[0], {
        force: true
      })
      cy.get('[data-test="location-suggestion"]')
        .contains(this.expectedLocationName)
        .click({ force: true })
      cy.get('button')
        .contains('Add')
        .should('not.be.disabled')
        .click({ force: true })

      cy.get('[data-test="building-equipment-add-button"]').click()
      cy.get('[data-test="building-equipment-list"]').contains(
        this.publicEquipment.name
      )
      cy.get('[data-test="building-equipment-list"]').contains(
        this.expectedLocationName
      )

      // Remove
      cy.get('[data-test="extras-button"]').click({ force: true })
      cy.contains('Edit').click({ force: true })

      cy.get('[data-test="equipment-form"]')
        .contains(this.expectedLocationName)
        .contains('close')
        .click({ force: true })

      cy.get('[data-test="building-equipment-add-button"]').click()
      cy.get('[data-test="building-equipment-list"]').contains(
        this.publicEquipment.name
      )
      cy.get('[data-test="building-equipment-list"]').should(
        'not.contain',
        this.expectedLocationName
      )
    })
  })

  describe.skip('Project', function() {
    beforeEach(function() {
      cy.fixture('equipment').then(function(equipment) {
        const randomIndex = Math.floor(
          Math.random() * Math.floor(equipment.length)
        )
        cy.wrap(equipment[randomIndex]).as('publicEquipment')
      })
      cy.wrap({
        name: 'Step Dimming of Lighting'
      }).as('publicProject')
    })

    beforeEach(function() {
      // Enable waiting for building data to load
      cy.server()
      cy.route({ method: 'GET', url: '/api/organization/*/building/*' }).as(
        'getBuilding'
      )
      // Visit Building Details
      cy.contains(this.buildingName).click()
      cy.wait('@getBuilding')

      // Add Public Equipment
      cy.contains('Assets').click()
      cy.contains('Equipment').click()
      cy.contains('New').click()
      cy.get('[data-test="filter-button"]').click()
      cy.get('[name="category"]').select(this.publicEquipment.category, {
        force: true
      })
      cy.get('[data-test="equipment-search-input"]').type(
        this.publicEquipment.params.search,
        {
          force: true
        }
      )
      cy.contains(this.publicEquipment.name).click({ force: true })
    })

    it('from public library can be added and viewed', function() {
      cy.route({ method: 'GET', url: '/api/project?buildingId=*' }).as(
        'getBuildingProjects'
      )

      cy.get('[data-test="equipment-form"]')
        .contains('Projects')
        .click()
      cy.get('[data-test="building-equipment-add-project"]').click()

      // Find public project
      cy.get('[data-test="projects-modal"]').within(function() {
        cy.wait('@getBuildingProjects')
        cy.contains('Public Library').click({ force: true })
        cy.get('input[placeholder="Search for keywords"]').type(
          this.publicProject.name,
          { force: true, timeout: 10000 }
        )
        cy.contains(this.publicProject.name).click()
        cy.contains('Next').click()
        cy.contains('Add Project').click()
      })

      // Add Equipment
      cy.get('[data-test="equipment-form"]').within(function() {
        cy.contains(this.publicProject.name)
        cy.get('[data-test="building-equipment-add-button"]').click()
      })

      // View
      cy.get('[data-test="extras-button"]').click()
      cy.contains('Edit').click()
      cy.get('[data-test="equipment-modal"]').within(function() {
        cy.contains(this.publicProject.name)
        cy.contains('Cancel').click()
      })
    })

    it('from private library can be added and viewed', function() {
      cy.route({ method: 'GET', url: '/api/project?buildingId=*' }).as(
        'getBuildingProjects'
      )

      cy.get('[data-test="equipment-modal"]')
        .contains('Projects')
        .click()
      cy.get('[data-test="building-equipment-add-project"]').click()

      // Add private project
      cy.get('[data-test="projects-modal"]').within(function() {
        cy.wait('@getBuildingProjects')
        cy.contains('Public Library').click({ force: true })
        cy.wrap($modal).should('not.contain', 'No Public Projects Found')
        cy.get('input[placeholder="Search for keywords"]').type(
          this.publicProject.name,
          { force: true, timeout: 10000 }
        )
        cy.get('[data-test="public-project-extras-button"]').click()
        cy.contains('Copy').click()
        cy.contains('Copy Project').click()
        cy.contains('My Library')
          .invoke('attr', 'class')
          .should('contain', 'tabActive')
        cy.contains(this.publicProject.name).click({ force: true })
        cy.contains('Next').click()
        cy.contains('Add Project').click()
      })

      // Add Equipment
      cy.get('[data-test="equipment-modal"]').within(function() {
        cy.contains(this.publicProject.name)
        cy.get('[data-test="building-equipment-add-button"]').click()
      })

      // View
      cy.get('[data-test="extras-button"]').click()
      cy.contains('Edit').click()
      cy.get('[data-test="equipment-modal"]').within(function() {
        cy.contains(this.publicProject.name)
        cy.contains('Cancel').click()
      })
    })
  })
})
