// ***********************************************
// Custom Cypress commands for Vibe_Chart testing
// ***********************************************

/**
 * Custom command to upload a file
 * Usage: cy.uploadFile('#fileInput', 'test_data.csv', 'text/csv')
 */
Cypress.Commands.add('uploadFile', (selector, fileName, fileType) => {
    cy.fixture(fileName, 'binary').then((fileContent) => {
        const blob = Cypress.Blob.binaryStringToBlob(fileContent, fileType);
        const file = new File([blob], fileName, { type: fileType });
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);

        cy.get(selector).then(input => {
            input[0].files = dataTransfer.files;
            input[0].dispatchEvent(new Event('change', { bubbles: true }));
        });
    });
});

/**
 * Custom command to wait for API response
 * Usage: cy.waitForApi('POST', '/api/upload-data')
 */
Cypress.Commands.add('waitForApi', (method, url) => {
    cy.intercept(method, url).as('apiRequest');
    cy.wait('@apiRequest');
});

/**
 * Custom command to check if element has text
 * Usage: cy.get('#element').shouldContainText('expected text')
 */
Cypress.Commands.add('shouldContainText', { prevSubject: true }, (subject, text) => {
    cy.wrap(subject).should('contain', text);
});

/**
 * Custom command to upload dataset and wait for completion
 * Usage: cy.uploadDataset('test_data.csv')
 */
Cypress.Commands.add('uploadDataset', (fileName = 'test_data.csv') => {
    cy.uploadFile('#datasetUpload', fileName, 'text/csv');
    cy.get('#uploadDatasetBtn').click();
    cy.get('#chartGenerationForm', { timeout: 10000 }).should('be.visible');
});

/**
 * Custom command to generate a chart
 * Usage: cy.generateChart('bar', 'Category', 'Value1')
 */
Cypress.Commands.add('generateChart', (chartType, xColumn, yColumn, groupColumn = null) => {
    cy.get('#chartTypeSelect').select(chartType);

    if (xColumn) {
        cy.get('#xColumnSelect').select(xColumn);
    }

    if (yColumn) {
        cy.get('#yColumnSelect').select(yColumn);
    }

    if (groupColumn) {
        cy.get('#groupColumnSelect').select(groupColumn);
    }

    cy.get('#generateChartBtn').click();
    cy.get('#chartPreview', { timeout: 15000 }).should('be.visible');
});
