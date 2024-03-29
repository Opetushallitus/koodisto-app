import { BASE_PATH } from '../../src/context/constants';

describe('The landing page', () => {
    beforeEach(() => {
        cy.mockBaseIntercepts();
    });
    it('shows koodistos on landing page', () => {
        cy.visit(`${BASE_PATH}`);
        cy.contains('2.asteen pohjakoulutus 2021').should('be.visible');
    });
    it('shows paging component', () => {
        cy.wait(500); // eslint-disable-line cypress/no-unnecessary-waiting
        cy.contains('Sivu 1 / 9').should('be.visible');
    });
    it('Paging cannot go back while at first page', () => {
        cy.get('button[name=PREVIOUS_PAGE]').should('be.visible').should('be.disabled');
        cy.get('button[name=FIRST_PAGE]').should('be.visible').should('be.disabled');
    });
    it('Paging can get to next page', () => {
        cy.get('button[name=NEXT_PAGE]').should('be.visible').click();
        cy.contains('Sivu 2 / 9').should('be.visible');
    });
    it('Paging can get to last page', () => {
        cy.get('button[name=LAST_PAGE]').should('be.visible').click();
        cy.contains('Sivu 9 / 9').should('be.visible');
    });
    it('Paging cannot go forward while at last page', () => {
        cy.get('button[name=NEXT_PAGE]').should('be.visible').should('be.disabled');
        cy.get('button[name=LAST_PAGE]').should('be.visible').should('be.disabled');
    });
    it('Paging can get to previous page', () => {
        cy.get('button[name=PREVIOUS_PAGE]').should('be.visible').click();
        cy.contains('Sivu 8 / 9').should('be.visible');
    });
    it('Paging can get to first page', () => {
        cy.get('button[name=FIRST_PAGE]').should('be.visible').click();
        cy.contains('Sivu 1 / 9').should('be.visible');
    });
    it('Paging resets when filter changes', () => {
        cy.get('button[name=LAST_PAGE]').should('be.visible').click();
        cy.get('input').eq(1).type('maakunta');
        cy.contains('Sivu 1 / 1').should('be.visible');
    });
    it('Reset filter', () => {
        cy.get('#clear-filter').click();
        cy.contains('Sivu 1 / 9').should('be.visible');
    });
    it('Filters are saved and not cleared on navigation', () => {
        cy.get('[id="filter-container-ryhmaUri"]').click().find('input').type('Koski{enter}');
        cy.contains('Koodistot (86 / 406)').should('be.visible');
        cy.visit(`${BASE_PATH}`);
        cy.contains('Koodistot (86 / 406)').should('be.visible');
        cy.get('[id="filter-container-ryhmaUri"]').find('svg').eq(0).click();
        cy.contains('Koodistot (406 / 406)').should('be.visible');
        cy.visit(`${BASE_PATH}`);
        cy.contains('Koodistot (406 / 406)').should('be.visible');
    });
    it('Filter by koodistoUri', () => {
        cy.visit(`${BASE_PATH}`);
        cy.contains('Koodistot (406 / 406)').should('be.visible');
        cy.get('input').eq(1).type('2astee');
        cy.contains('Koodistot (1 / 406)').should('be.visible');
        cy.get('#clear-filter').click();
    });
    it('Sort by first column', () => {
        cy.visit(`${BASE_PATH}`);
        cy.contains('Haun koodistot').should('be.visible');
        cy.get('th').eq(0).click();
        cy.contains('Virta-JTP').should('be.visible');
        cy.get('th').eq(0).click();
        cy.contains('Alueet').should('be.visible');
        cy.get('th').eq(0).click();
        cy.contains('Haun koodistot').should('be.visible');
    });
});
