describe('Basic Navigation Tests', () => {
  it('Visits the home page', () => {
    cy.visit('/')
    cy.url().should('include', '/')
  })

  it('Can access login page', () => {
    cy.visit('/login')
    cy.url().should('include', '/login')
  })

  it('Can access register page', () => {
    cy.visit('/register')
    cy.url().should('include', '/register')
  })
})
