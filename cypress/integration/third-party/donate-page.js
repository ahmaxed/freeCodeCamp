describe('Donate page', () => {
  it('Donation ', () => {
    cy.exec('npm run seed');
    cy.login();
    cy.visit('/donate');
    cy.wait(10000);
    cy.get('.donation-elements').within(() => {
      cy.fillElementsInput('cardNumber', '4242424242424242');
      cy.fillElementsInput('cardExpiry', '1025');
    });
    cy.get('.confirm-donation-btn').click();
    cy.contains('We are processing your donation.').should('be.visible');
    cy.wait(10000);
    cy.contains('Thank you for being a supporter.').should('be.visible');
  });
});
