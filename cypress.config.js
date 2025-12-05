const { defineConfig } = require('cypress');

module.exports = defineConfig({
    e2e: {
        // Base URL for the frontend
        baseUrl: 'http://localhost:5500',

        // Video recording settings
        video: true,
        videoCompression: 32,
        videosFolder: 'cypress/videos',

        // Screenshot settings
        screenshotsFolder: 'cypress/screenshots',
        screenshotOnRunFailure: true,

        // Viewport settings
        viewportWidth: 1280,
        viewportHeight: 720,

        // Test file pattern
        specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',

        // Support file
        supportFile: 'cypress/support/e2e.js',

        // Timeouts
        defaultCommandTimeout: 10000,
        pageLoadTimeout: 30000,
        requestTimeout: 10000,
        responseTimeout: 10000,

        // Retry settings
        retries: {
            runMode: 2,
            openMode: 0
        },

        setupNodeEvents(on, config) {
            // implement node event listeners here
            on('task', {
                log(message) {
                    console.log(message);
                    return null;
                }
            });
        },

        // Environment variables
        env: {
            apiUrl: 'http://localhost:5000/api'
        }
    }
});
