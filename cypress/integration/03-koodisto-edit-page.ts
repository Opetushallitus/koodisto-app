import { BASE_PATH, API_INTERNAL_PATH } from '../../src/context/constants';

describe('The Koodisto Edit page', () => {
    beforeEach(() => {
        cy.mockBaseIntercepts();
    });
    it('shows testi koodisto on koodisto view page', () => {
        cy.intercept(`${API_INTERNAL_PATH}/koodisto/kunta/2`, { fixture: 'kuntaKoodisto.json' });
        cy.intercept(`${API_INTERNAL_PATH}/koodi/koodisto/kunta/2`, { fixture: 'kuntaKoodistoKoodit.json' });
        cy.visit(`${BASE_PATH}/koodisto/view/kunta/2`);
        cy.contains('kunta').should('be.visible');
    });
    it('shows edit button and can click 1', () => {
        cy.intercept(`${API_INTERNAL_PATH}/koodisto/kunta/2`, { fixture: 'kuntaKoodisto.json' });
        cy.get('button[name="KOODISTOSIVU_MUOKKAA_KOODISTOA_BUTTON"]').should('be.visible').click();
        cy.contains('Muokkaa koodistoa').should('be.visible');
    });
    it('shows edit button and can click', () => {
        cy.intercept('PUT', `${API_INTERNAL_PATH}/koodisto`, (req) => {
            expect(req.body.metadataList).to.eqls([
                { kieli: 'FI', nimi: 'kunta muokattu', kuvaus: 'kunta' },
                { kieli: 'SV', nimi: 'kommun', kuvaus: 'kommun' },
                { kieli: 'EN', nimi: 'municipality', kuvaus: 'municipality' },
            ]);
            req.reply({ fixture: 'kuntaKoodisto.json' });
        });
        cy.get('input[name="metadata[0][nimi]"]')
            .should('be.visible')
            .should('have.value', 'kunta')
            .clear()
            .type('kunta muokattu');
        cy.intercept(`${API_INTERNAL_PATH}/koodisto/kunta/2`, { fixture: 'kuntaKoodisto.json' });
        cy.intercept(`${API_INTERNAL_PATH}/koodi/koodisto/kunta/2`, { fixture: 'kuntaKoodistoKoodit.json' });
        cy.get('button[name="KOODISTO_TALLENNA"]').should('be.visible').click();
        cy.contains('Tallennettiin koodisto uri:lla kunta').should('be.visible');
    });
    it('shows edit button and can click 2', () => {
        cy.intercept(`${API_INTERNAL_PATH}/koodisto/kunta/2`, { fixture: 'kuntaKoodisto.json' });
        cy.intercept(`${API_INTERNAL_PATH}/koodi/koodisto/kunta/2`, { fixture: 'kuntaKoodistoKoodit.json' });
        cy.get('button[name="KOODISTOSIVU_MUOKKAA_KOODISTOA_BUTTON"]').should('be.visible').click();
        cy.contains('Muokkaa koodistoa').should('be.visible');
        cy.intercept('PUT', `${API_INTERNAL_PATH}/koodisto`, (req) => {
            expect(req.body.organisaatioOid).to.eq('1.2.246.562.10.2013112012294919827487');
            expect(req.body.codesGroupUri).to.eq('varda');
            req.reply({ fixture: 'kuntaKoodisto.json' });
        });
        cy.get('div[id="organisaatioOid"]')
            .should('be.visible')
            .find('input[type=text]')
            .should('be.visible')
            .type('csc', { force: true });
        cy.contains('CSC-Tieteen').should('be.visible').click();

        cy.get('div[id="koodistoRyhmaUri"]')
            .should('be.visible')
            .find('input[type=text]')
            .should('be.visible')
            .type('Va', { force: true });
        cy.contains('Varda').should('be.visible').click();
        cy.get('button[name="KOODISTO_TALLENNA"]').should('be.visible').click();
        cy.contains('Tallennettiin koodisto uri:lla kunta').should('be.visible');
    });
    it('can version koodisto', () => {
        cy.intercept(`${API_INTERNAL_PATH}/koodisto/kunta/2`, { fixture: 'kuntaKoodisto.json' });
        cy.intercept(`${API_INTERNAL_PATH}/koodi/koodisto/kunta/2`, { fixture: 'kuntaKoodistoKoodit.json' });

        cy.get('button[name=KOODISTOSIVU_MUOKKAA_KOODISTOA_BUTTON]').should('be.visible').click();
        // dialog can be opened and closed
        cy.get('button[name=KOODISTO_VERSIOI]').should('be.visible').click();
        cy.get('#close-dialog').should('be.visible').click().should('not.exist');
        // back to view
        cy.get('button[name=KOODISTO_PERUUTA]').should('be.visible').click();
    });
    it('can delete koodisto', () => {
        cy.intercept(`${API_INTERNAL_PATH}/koodisto/kunta/2`, { fixture: 'kuntaKoodisto.json' });
        cy.intercept(`${API_INTERNAL_PATH}/koodi/koodisto/kunta/2`, { fixture: 'kuntaKoodistoKoodit.json' });

        cy.get('button[name=KOODISTOSIVU_MUOKKAA_KOODISTOA_BUTTON]').should('be.visible').click();
        // dialog can be opened and closed
        cy.get('button[name=KOODISTO_POISTA]').should('be.visible').click();
        cy.get('#close-dialog').should('be.visible').click().should('not.exist');
        // checkbox needs to be checked for button to activate
        cy.get('button[name=KOODISTO_POISTA]').should('be.visible').click();
        cy.get('button[name=CONFIRMATION_ACTION]').should('be.visible').should('be.disabled');
        cy.get('input[name=CONFIRMATION_CHECK]').should('be.visible').click();
        cy.intercept('DELETE', `${API_INTERNAL_PATH}/koodisto/kunta/2`, { statusCode: 400 });
        cy.get('button[name=CONFIRMATION_ACTION]').should('be.visible').should('not.be.disabled').click();
        cy.contains('server.error.400').should('be.visible');
        // successful delete
        cy.get('button[name=KOODISTO_POISTA]').should('be.visible').click();
        cy.get('button[name=CONFIRMATION_ACTION]').should('be.visible').should('be.disabled');
        cy.get('input[name=CONFIRMATION_CHECK]').should('be.visible').click();
        cy.intercept('DELETE', `${API_INTERNAL_PATH}/koodisto/kunta/2`, { statusCode: 204 });
        cy.intercept(`${API_INTERNAL_PATH}/koodisto`, { fixture: 'codes.json' });
        cy.get('button[name=CONFIRMATION_ACTION]').should('be.visible').should('not.be.disabled').click();
    });
});
