# Cypress Test Files

This directory contains all Cypress end-to-end test files for Vibe_Chart.

## Directory Structure

```
cypress/
├── e2e/                    # Test files
│   └── vibe_chart.cy.js   # Main E2E tests
├── fixtures/               # Test data
│   ├── test_data.csv      # Sample dataset
│   └── test_chart.png     # Sample chart image
├── support/                # Support files
│   ├── e2e.js            # Global configuration
│   └── commands.js        # Custom commands
└── videos/                 # Test recordings (generated)
```

## Running Tests

### Prerequisites

1. **Start Backend:**
   ```bash
   cd backend
   python app.py
   ```
   Backend should run on `http://localhost:5000`

2. **Start Frontend:**
   ```bash
   cd frontend
   python -m http.server 5500
   ```
   Frontend should run on `http://localhost:5500`

### Run Tests

**Headless mode (with video recording):**
```bash
npx cypress run --spec "cypress/e2e/vibe_chart.cy.js"
```

**Interactive mode:**
```bash
npx cypress open
```

## Test Coverage

### 1. Homepage Tests
- Verify all three sections are visible
- Check initial button states

### 2. Dataset Upload Tests
- Upload CSV file
- Display column metadata
- Validate file types

### 3. Chart Generation Tests
- Generate bar chart
- Generate histogram
- Generate pie chart
- Generate line chart
- Test dynamic column selection

### 4. Compatibility Tests
- Detect incompatible column selections
- Show error messages
- Validate compatible combinations

### 5. Image Analysis Tests
- Upload chart image
- Display analysis results
- Show R code
- Compatibility check with dataset
- Auto-fill columns

### 6. API Tests
- Health check endpoint

## Test Data

**test_data.csv:**
- 4 rows of data
- Columns: Category (categorical), Value1 (numeric), Value2 (numeric), Group (categorical)
- Compatible with all 10 chart types

**test_chart.png:**
- Minimal valid PNG image
- Used for image analysis testing

## Custom Commands

Custom Cypress commands are defined in `support/commands.js`:

- `cy.uploadFile(selector, fileName, fileType)` - Upload a file
- `cy.uploadDataset(fileName)` - Upload and process dataset
- `cy.generateChart(type, x, y, group)` - Generate a chart
- `cy.waitForApi(method, url)` - Wait for API response

## Video Output

Test videos are saved to `cypress/videos/` after each test run.

## Configuration

See `cypress.config.js` in the project root for configuration options.
