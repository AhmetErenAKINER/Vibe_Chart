/**
 * Vibe_Chart - End-to-End Tests
 * 
 * Test Coverage:
 * 1. Homepage loads with all sections
 * 2. Dataset upload (CSV)
 * 3. Chart generation (Bar Chart)
 * 4. Incompatible chart detection
 * 5. Image analysis with compatibility check
 */

describe('Vibe_Chart - Dataset-Driven Chart Generation', () => {

    // Run before each test
    beforeEach(() => {
        // Visit the homepage
        cy.visit('/');

        // Wait for page to fully load
        cy.get('.header h1').should('be.visible');
    });

    /**
     * TEST 1: Homepage Loads Correctly
     * Verify that all three main sections are present
     */
    describe('Homepage', () => {
        it('should display all three main sections', () => {
            // Check header
            cy.get('.header h1').should('contain', 'Vibe_Chart');
            cy.get('.subtitle').should('contain', 'Dataset-Driven Chart Generation');

            // Section 1: Upload Dataset
            cy.get('.section-card').eq(0)
                .should('be.visible')
                .within(() => {
                    cy.get('.section-header h2').should('contain', '1. Upload Dataset');
                    cy.get('#datasetUpload').should('exist');
                    cy.get('#uploadDatasetBtn').should('exist');
                });

            // Section 2: Generate Chart
            cy.get('.section-card').eq(1)
                .should('be.visible')
                .within(() => {
                    cy.get('.section-header h2').should('contain', '2. Generate Chart from Dataset');
                });

            // Section 3: Analyze Image
            cy.get('.section-card').eq(2)
                .should('be.visible')
                .within(() => {
                    cy.get('.section-header h2').should('contain', '3. Analyze Existing Chart Image');
                    cy.get('#imageUpload').should('exist');
                    cy.get('#analyzeImageBtn').should('exist');
                });
        });

        it('should have disabled buttons initially', () => {
            // Upload button should be disabled until file is selected
            cy.get('#uploadDatasetBtn').should('be.disabled');

            // Analyze button should be disabled until image is selected
            cy.get('#analyzeImageBtn').should('be.disabled');
        });
    });

    /**
     * TEST 2: Upload Dataset (CSV)
     * Upload test CSV file and verify column metadata display
     */
    describe('Dataset Upload', () => {
        it('should upload CSV file and display column metadata', () => {
            // Load fixture file
            cy.fixture('test_data.csv', 'binary').then((fileContent) => {
                // Convert to Blob
                const blob = Cypress.Blob.binaryStringToBlob(fileContent, 'text/csv');
                const file = new File([blob], 'test_data.csv', { type: 'text/csv' });

                // Create DataTransfer object
                const dataTransfer = new DataTransfer();
                dataTransfer.items.add(file);

                // Attach file to input
                cy.get('#datasetUpload').then(input => {
                    input[0].files = dataTransfer.files;
                    input[0].dispatchEvent(new Event('change', { bubbles: true }));
                });
            });

            // Verify file name is displayed
            cy.get('#datasetFileName').should('contain', 'test_data.csv');

            // Upload button should now be enabled
            cy.get('#uploadDatasetBtn').should('not.be.disabled');

            // Click upload button
            cy.get('#uploadDatasetBtn').click();

            // Wait for upload to complete
            cy.get('#columnsDisplay', { timeout: 10000 }).should('be.visible');

            // Verify dataset info is displayed
            cy.get('#datasetInfo').should('be.visible')
                .and('contain', 'test_data.csv')
                .and('contain', 'Rows:')
                .and('contain', 'Columns:');

            // Verify column table is displayed
            cy.get('#columnsTable').should('be.visible');

            // Check that columns are listed
            cy.get('#columnsTableBody tr').should('have.length.at.least', 3);

            // Verify column types are shown
            cy.get('.type-badge').should('exist');

            // Check for specific columns from test_data.csv
            cy.get('#columnsTableBody').should('contain', 'Category');
            cy.get('#columnsTableBody').should('contain', 'Value1');
            cy.get('#columnsTableBody').should('contain', 'Value2');

            // Verify chart generation form is now visible
            cy.get('#chartGenerationForm').should('be.visible');
            cy.get('#chartTypeSelect').should('be.visible');
        });

        it('should show error for invalid file type', () => {
            // Try to upload a non-CSV file (using the PNG fixture)
            cy.fixture('test_chart.png', 'binary').then((fileContent) => {
                const blob = Cypress.Blob.binaryStringToBlob(fileContent, 'image/png');
                const file = new File([blob], 'invalid.png', { type: 'image/png' });

                const dataTransfer = new DataTransfer();
                dataTransfer.items.add(file);

                cy.get('#datasetUpload').then(input => {
                    input[0].files = dataTransfer.files;
                    input[0].dispatchEvent(new Event('change', { bubbles: true }));
                });
            });

            // Should show error status message
            cy.get('.status-message', { timeout: 5000 })
                .should('be.visible')
                .and('have.class', 'error');
        });
    });

    /**
     * TEST 3: Generate Bar Chart
     * Upload dataset, select bar chart, and generate visualization
     */
    describe('Chart Generation - Bar Chart', () => {
        beforeEach(() => {
            // Upload dataset first
            cy.fixture('test_data.csv', 'binary').then((fileContent) => {
                const blob = Cypress.Blob.binaryStringToBlob(fileContent, 'text/csv');
                const file = new File([blob], 'test_data.csv', { type: 'text/csv' });
                const dataTransfer = new DataTransfer();
                dataTransfer.items.add(file);

                cy.get('#datasetUpload').then(input => {
                    input[0].files = dataTransfer.files;
                    input[0].dispatchEvent(new Event('change', { bubbles: true }));
                });
            });

            cy.get('#uploadDatasetBtn').click();
            cy.get('#chartGenerationForm', { timeout: 10000 }).should('be.visible');
        });

        it('should generate a bar chart successfully', () => {
            // Select Bar Chart from dropdown
            cy.get('#chartTypeSelect').select('bar');

            // Verify requirements text is shown
            cy.get('#chartRequirements').should('contain', 'categorical');

            // Select categorical column for X (Category)
            cy.get('#xColumnSelect').select('Category');

            // Select numeric column for Y (Value1)
            cy.get('#yColumnSelect').select('Value1');

            // Generate button should be enabled
            cy.get('#generateChartBtn').should('not.be.disabled');

            // Click generate chart
            cy.get('#generateChartBtn').click();

            // Wait for chart to be generated
            cy.get('#chartPreview', { timeout: 15000 }).should('be.visible');

            // Verify chart image is displayed
            cy.get('#chartImage').should('be.visible')
                .and('have.attr', 'src')
                .and('include', 'data:image/png;base64');

            // Verify success message
            cy.get('.status-message').should('contain', 'successfully');
        });

        it('should update column dropdowns when chart type changes', () => {
            // Select Line Chart
            cy.get('#chartTypeSelect').select('line');
            cy.get('#chartRequirements').should('be.visible');

            // Change to Histogram
            cy.get('#chartTypeSelect').select('histogram');
            cy.get('#chartRequirements').should('contain', 'numeric');

            // Change to Stacked Bar
            cy.get('#chartTypeSelect').select('stacked_bar');

            // Group column should be visible for stacked bar
            cy.get('#groupColumnGroup').should('be.visible');
        });
    });

    /**
     * TEST 4: Incompatible Chart Detection
     * Try to generate scatter plot with categorical columns
     */
    describe('Chart Compatibility Checking', () => {
        beforeEach(() => {
            // Upload dataset
            cy.fixture('test_data.csv', 'binary').then((fileContent) => {
                const blob = Cypress.Blob.binaryStringToBlob(fileContent, 'text/csv');
                const file = new File([blob], 'test_data.csv', { type: 'text/csv' });
                const dataTransfer = new DataTransfer();
                dataTransfer.items.add(file);

                cy.get('#datasetUpload').then(input => {
                    input[0].files = dataTransfer.files;
                    input[0].dispatchEvent(new Event('change', { bubbles: true }));
                });
            });

            cy.get('#uploadDatasetBtn').click();
            cy.get('#chartGenerationForm', { timeout: 10000 }).should('be.visible');
        });

        it('should show error for incompatible column selection', () => {
            // Select Scatter Plot (requires 2 numeric columns)
            cy.get('#chartTypeSelect').select('scatter');

            // Try to select categorical columns (this should fail)
            cy.get('#xColumnSelect').select('Category');
            cy.get('#yColumnSelect').select('Group');

            // Try to generate
            cy.get('#generateChartBtn').click();

            // Should show error message
            cy.get('.status-message', { timeout: 10000 })
                .should('be.visible')
                .and('have.class', 'error')
                .and('contain', 'Error');
        });

        it('should generate scatter plot with numeric columns', () => {
            // Select Scatter Plot
            cy.get('#chartTypeSelect').select('scatter');

            // Select two numeric columns
            cy.get('#xColumnSelect').select('Value1');
            cy.get('#yColumnSelect').select('Value2');

            // Generate chart
            cy.get('#generateChartBtn').click();

            // Should succeed
            cy.get('#chartPreview', { timeout: 15000 }).should('be.visible');
            cy.get('#chartImage').should('be.visible');
        });
    });

    /**
     * TEST 5: Analyze Existing Chart Image
     * Upload chart image and verify analysis results
     */
    describe('Image Analysis', () => {
        it('should analyze chart image and show results', () => {
            // Load and upload chart image
            cy.fixture('test_chart.png', 'binary').then((fileContent) => {
                const blob = Cypress.Blob.binaryStringToBlob(fileContent, 'image/png');
                const file = new File([blob], 'test_chart.png', { type: 'image/png' });
                const dataTransfer = new DataTransfer();
                dataTransfer.items.add(file);

                cy.get('#imageUpload').then(input => {
                    input[0].files = dataTransfer.files;
                    input[0].dispatchEvent(new Event('change', { bubbles: true }));
                });
            });

            // Verify file name is displayed
            cy.get('#imageFileName').should('contain', 'test_chart.png');

            // Image preview should be visible
            cy.get('#imagePreview').should('have.class', 'active');

            // Analyze button should be enabled
            cy.get('#analyzeImageBtn').should('not.be.disabled');

            // Click analyze
            cy.get('#analyzeImageBtn').click();

            // Wait for analysis results
            cy.get('#analysisResults', { timeout: 10000 }).should('be.visible');

            // Verify detected chart type is shown
            cy.get('#detectedChartType').should('be.visible')
                .and('not.be.empty');

            // Verify confidence score is shown
            cy.get('#confidenceScore').should('be.visible')
                .and('contain', 'Confidence');

            // Verify R code is generated
            cy.get('#exampleRCode').should('be.visible')
                .and('not.be.empty');

            // Copy button should be visible
            cy.get('#copyCodeBtn').should('be.visible');
        });

        it('should show compatibility check when dataset is loaded', () => {
            // First upload dataset
            cy.fixture('test_data.csv', 'binary').then((fileContent) => {
                const blob = Cypress.Blob.binaryStringToBlob(fileContent, 'text/csv');
                const file = new File([blob], 'test_data.csv', { type: 'text/csv' });
                const dataTransfer = new DataTransfer();
                dataTransfer.items.add(file);

                cy.get('#datasetUpload').then(input => {
                    input[0].files = dataTransfer.files;
                    input[0].dispatchEvent(new Event('change', { bubbles: true }));
                });
            });

            cy.get('#uploadDatasetBtn').click();
            cy.get('#chartGenerationForm', { timeout: 10000 }).should('be.visible');

            // Now upload and analyze chart image
            cy.fixture('test_chart.png', 'binary').then((fileContent) => {
                const blob = Cypress.Blob.binaryStringToBlob(fileContent, 'image/png');
                const file = new File([blob], 'test_chart.png', { type: 'image/png' });
                const dataTransfer = new DataTransfer();
                dataTransfer.items.add(file);

                cy.get('#imageUpload').then(input => {
                    input[0].files = dataTransfer.files;
                    input[0].dispatchEvent(new Event('change', { bubbles: true }));
                });
            });

            cy.get('#analyzeImageBtn').click();

            // Wait for analysis
            cy.get('#analysisResults', { timeout: 10000 }).should('be.visible');

            // Compatibility results should be shown
            cy.get('#compatibilityResults').should('be.visible');

            // Compatibility message should exist
            cy.get('#compatibilityMessage').should('be.visible')
                .and('have.class', 'compatibility-message');

            // Check if compatible or incompatible
            cy.get('#compatibilityMessage').then(($msg) => {
                if ($msg.hasClass('compatible')) {
                    // If compatible, generate button should be visible
                    cy.get('#generateFromDetectedBtn').should('be.visible');
                } else {
                    // If incompatible, should show reason
                    cy.get('#compatibilityMessage').should('contain', 'NOT compatible');
                }
            });
        });

        it('should auto-fill columns when clicking "Generate This Chart"', () => {
            // Upload dataset
            cy.fixture('test_data.csv', 'binary').then((fileContent) => {
                const blob = Cypress.Blob.binaryStringToBlob(fileContent, 'text/csv');
                const file = new File([blob], 'test_data.csv', { type: 'text/csv' });
                const dataTransfer = new DataTransfer();
                dataTransfer.items.add(file);

                cy.get('#datasetUpload').then(input => {
                    input[0].files = dataTransfer.files;
                    input[0].dispatchEvent(new Event('change', { bubbles: true }));
                });
            });

            cy.get('#uploadDatasetBtn').click();
            cy.get('#chartGenerationForm', { timeout: 10000 }).should('be.visible');

            // Analyze image
            cy.fixture('test_chart.png', 'binary').then((fileContent) => {
                const blob = Cypress.Blob.binaryStringToBlob(fileContent, 'image/png');
                const file = new File([blob], 'test_chart.png', { type: 'image/png' });
                const dataTransfer = new DataTransfer();
                dataTransfer.items.add(file);

                cy.get('#imageUpload').then(input => {
                    input[0].files = dataTransfer.files;
                    input[0].dispatchEvent(new Event('change', { bubbles: true }));
                });
            });

            cy.get('#analyzeImageBtn').click();
            cy.get('#compatibilityResults', { timeout: 10000 }).should('be.visible');

            // If compatible, click "Generate This Chart"
            cy.get('#compatibilityMessage').then(($msg) => {
                if ($msg.hasClass('compatible')) {
                    cy.get('#generateFromDetectedBtn').click();

                    // Should scroll to chart generation section
                    // Chart type should be auto-selected
                    cy.get('#chartTypeSelect').should('not.have.value', '');

                    // At least one column should be selected
                    cy.get('#xColumnSelect, #yColumnSelect').should(($selects) => {
                        const hasValue = $selects.toArray().some(select => select.value !== '');
                        expect(hasValue).to.be.true;
                    });
                }
            });
        });
    });

    /**
     * TEST 6: Multiple Chart Types
     * Test generation of different chart types
     */
    describe('Multiple Chart Types', () => {
        beforeEach(() => {
            // Upload dataset
            cy.fixture('test_data.csv', 'binary').then((fileContent) => {
                const blob = Cypress.Blob.binaryStringToBlob(fileContent, 'text/csv');
                const file = new File([blob], 'test_data.csv', { type: 'text/csv' });
                const dataTransfer = new DataTransfer();
                dataTransfer.items.add(file);

                cy.get('#datasetUpload').then(input => {
                    input[0].files = dataTransfer.files;
                    input[0].dispatchEvent(new Event('change', { bubbles: true }));
                });
            });

            cy.get('#uploadDatasetBtn').click();
            cy.get('#chartGenerationForm', { timeout: 10000 }).should('be.visible');
        });

        it('should generate histogram', () => {
            cy.get('#chartTypeSelect').select('histogram');
            cy.get('#xColumnSelect').select('Value1');
            cy.get('#generateChartBtn').click();
            cy.get('#chartPreview', { timeout: 15000 }).should('be.visible');
        });

        it('should generate pie chart', () => {
            cy.get('#chartTypeSelect').select('pie');
            cy.get('#xColumnSelect').select('Category');
            cy.get('#yColumnSelect').select('Value1');
            cy.get('#generateChartBtn').click();
            cy.get('#chartPreview', { timeout: 15000 }).should('be.visible');
        });

        it('should generate line chart', () => {
            cy.get('#chartTypeSelect').select('line');
            cy.get('#xColumnSelect').select('Category');
            cy.get('#yColumnSelect').select('Value1');
            cy.get('#generateChartBtn').click();
            cy.get('#chartPreview', { timeout: 15000 }).should('be.visible');
        });
    });

    /**
     * TEST 7: API Health Check
     * Verify backend is running
     */
    describe('Backend API', () => {
        it('should have healthy backend API', () => {
            cy.request('http://localhost:5000/api/health').then((response) => {
                expect(response.status).to.eq(200);
                expect(response.body).to.have.property('status', 'healthy');
                expect(response.body).to.have.property('service', 'vibe-chart-api');
            });
        });
    });
});
