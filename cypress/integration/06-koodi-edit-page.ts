import { BASE_PATH, API_INTERNAL_PATH } from '../../src/context/constants';

describe('Koodi edit page', () => {
    beforeEach(() => {
        cy.mockBaseIntercepts();
    });
    it('renders view page', () => {
        cy.intercept(`${API_INTERNAL_PATH}/koodi/kunta_020/2`, { fixture: 'koodiPage.json' });
        cy.intercept(`${API_INTERNAL_PATH}/koodisto/kunta`, { fixture: 'koodiPageKoodisto.json' });
        cy.visit(`${BASE_PATH}/koodi/view/kunta_020/2`);
        cy.contains('Akaa').should('be.visible');
    });
    it('shows edit button and can open edit page', () => {
        cy.intercept(`${API_INTERNAL_PATH}/koodi/kunta_020/2`, { fixture: 'koodiPage.json' });
        cy.get('button[name=KOODISIVU_MUOKKAA_KOODIA_BUTTON]').should('be.visible').click();
        cy.contains('Muokkaa koodia').should('be.visible');
        cy.contains('kunta_020').should('be.visible');
    });
    it('can modify koodi', () => {
        cy.intercept('PUT', `${API_INTERNAL_PATH}/koodi`, (req) => {
            expect(req.body.metadata).to.eqls([
                { kieli: 'FI', nimi: 'Akaa muokattu', lyhytNimi: 'lyhyt nimi', kuvaus: '' },
                { kieli: 'SV', nimi: 'Akaa', kuvaus: '' },
                { kieli: 'EN', nimi: 'Akaa', kuvaus: '' },
            ]);
            req.reply({ fixture: 'koodiPage.json' });
        });
        cy.get('input[name="metadata[0][nimi]"]')
            .should('be.visible')
            .should('have.value', 'Akaa loytyy')
            .clear()
            .type('Akaa muokattu');
        cy.get('input[name="metadata[0][lyhytNimi]"]')
            .should('be.visible')
            .should('have.value', '')
            .clear()
            .type('lyhyt nimi');
        cy.intercept(`${API_INTERNAL_PATH}/koodi/kunta_020/2`, { fixture: 'koodiPage.json' });
        cy.intercept(`${API_INTERNAL_PATH}/koodisto/kunta`, { fixture: 'koodiPageKoodisto.json' });
        cy.get('button[name="KOODI_TALLENNA"]').should('be.visible').click();
        cy.contains('Tallennettiin koodi uri:lla kunta_020').should('be.visible');
    });
    it('can version koodi', () => {
        cy.intercept(`${API_INTERNAL_PATH}/koodi/kunta_020/2`, { fixture: 'koodiPage.json' });
        cy.intercept(`${API_INTERNAL_PATH}/koodisto/kunta`, { fixture: 'koodiPageKoodisto.json' });

        cy.get('button[name=KOODISIVU_MUOKKAA_KOODIA_BUTTON]').should('be.visible').click();
        // dialog can be opened and closed
        cy.get('button[name=KOODI_VERSIOI]').should('be.visible').click();
        cy.get('#close-dialog').should('be.visible').click().should('not.exist');
        // back to view
        cy.get('button[name=KOODI_PERUUTA]').should('be.visible').click();
    });
    it('can delete koodi', () => {
        cy.intercept(`${API_INTERNAL_PATH}/koodi/kunta_020/2`, { fixture: 'koodiPage.json' });
        cy.intercept(`${API_INTERNAL_PATH}/koodisto/kunta`, { fixture: 'koodiPageKoodisto.json' });

        cy.get('button[name=KOODISIVU_MUOKKAA_KOODIA_BUTTON]').should('be.visible').click();
        // dialog can be opened and closed
        cy.get('button[name=KOODI_POISTA]').should('be.visible').click();
        cy.get('#close-dialog').should('be.visible').click().should('not.exist');
        // checkbox needs to be checked for button to activate
        cy.get('button[name=KOODI_POISTA]').should('be.visible').click();
        cy.get('button[name=CONFIRMATION_ACTION]').should('be.visible').should('be.disabled');
        cy.get('input[name=CONFIRMATION_CHECK]').should('be.visible').click();
        cy.intercept('DELETE', `${API_INTERNAL_PATH}/koodi/kunta_020/2`, { statusCode: 400 });
        cy.get('button[name=CONFIRMATION_ACTION]').should('be.visible').should('not.be.disabled').click();
        cy.contains('server.error.400').should('be.visible');
        // successful delete
        cy.get('button[name=KOODI_POISTA]').should('be.visible').click();
        cy.get('button[name=CONFIRMATION_ACTION]').should('be.visible').should('be.disabled');
        cy.get('input[name=CONFIRMATION_CHECK]').should('be.visible').click();
        cy.intercept('DELETE', `${API_INTERNAL_PATH}/koodi/kunta_020/2`, { statusCode: 204 });
        cy.intercept(`${API_INTERNAL_PATH}/koodisto`, { fixture: 'codes.json' });
        cy.intercept(`${API_INTERNAL_PATH}/koodisto/kunta/2`, { fixture: 'kuntaKoodisto.json' });
        cy.intercept(`${API_INTERNAL_PATH}/koodi/koodisto/kunta/2`, { fixture: 'kuntaKoodistoKoodit.json' });
        cy.get('button[name=CONFIRMATION_ACTION]').should('be.visible').should('not.be.disabled').click();
    });
});
