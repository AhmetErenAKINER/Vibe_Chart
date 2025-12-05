// ***********************************************************
// This file is processed and loaded automatically before your test files.
//
// You can change the location of this file or turn off automatically serving
// support files with the 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands';

// Alternatively you can use CommonJS syntax:
// require('./commands')

// Hide fetch/XHR logs to reduce noise in test output
const app = window.top;
if (!app.document.head.querySelector('[data-hide-command-log-request]')) {
    const style = app.document.createElement('style');
    style.innerHTML =
        '.command-name-request, .command-name-xhr { display: none }';
    style.setAttribute('data-hide-command-log-request', '');
    app.document.head.appendChild(style);
}

// Configure Cypress behavior
Cypress.on('uncaught:exception', (err, runnable) => {
    // Returning false here prevents Cypress from failing the test
    // on uncaught exceptions (useful for third-party scripts)
    // You can customize this based on your needs

    // Don't fail tests on these specific errors
    if (err.message.includes('ResizeObserver')) {
        return false;
    }

    // Let other errors fail the test
    return true;
});
