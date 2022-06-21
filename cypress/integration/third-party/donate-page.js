describe('Donate page', () => {
  before(() => {
    cy.clearCookies();
    cy.exec('npm run seed');
    cy.login();
  });

  it('Donation ', () => {
    cy.visit('/donate');
    cy.wait(5000);
    cy.get('.donation-elements').within(() => {
      cy.fillElementsInput('cardNumber', '4242424242424242');
      cy.fillElementsInput('cardExpiry', '1025');
    });
    cy.get('.confirm-donation-btn').click();
    cy.contains('We are processing your donation.').should('be.visible');
    cy.wait(5000);
    cy.contains('Thank you for being a supporter.').should('be.visible');
  });
});
