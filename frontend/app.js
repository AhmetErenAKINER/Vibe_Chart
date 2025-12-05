/**
 * Vibe_Chart - Dataset-Driven Chart Generation
 * Frontend JavaScript
 */

// Configuration
const API_BASE_URL = 'http://localhost:5000/api';

// Application State
const appState = {
    datasetLoaded: false,
    datasetFile: null,
    columns: [],
    chartTypes: [],
    currentChartType: null,
    detectedChartType: null,
    suggestedColumns: null,
    imageFile: null
};

// DOM Elements
const elements = {
    // Dataset Upload
    datasetUpload: document.getElementById('datasetUpload'),
    datasetFileName: document.getElementById('datasetFileName'),
    uploadDatasetBtn: document.getElementById('uploadDatasetBtn'),
    columnsDisplay: document.getElementById('columnsDisplay'),
    datasetInfo: document.getElementById('datasetInfo'),
    columnsTableBody: document.getElementById('columnsTableBody'),

    // Chart Generation
    chartGenerationArea: document.getElementById('chartGenerationArea'),
    chartGenerationForm: document.getElementById('chartGenerationForm'),
    chartTypeSelect: document.getElementById('chartTypeSelect'),
    chartRequirements: document.getElementById('chartRequirements'),
    xColumnSelect: document.getElementById('xColumnSelect'),
    yColumnSelect: document.getElementById('yColumnSelect'),
    groupColumnSelect: document.getElementById('groupColumnSelect'),
    groupColumnGroup: document.getElementById('groupColumnGroup'),
    generateChartBtn: document.getElementById('generateChartBtn'),
    chartPreview: document.getElementById('chartPreview'),
    chartImage: document.getElementById('chartImage'),

    // Image Analysis
    imageUpload: document.getElementById('imageUpload'),
    imageFileName: document.getElementById('imageFileName'),
    imagePreview: document.getElementById('imagePreview'),
    analyzeImageBtn: document.getElementById('analyzeImageBtn'),
    analysisResults: document.getElementById('analysisResults'),
    detectedChartType: document.getElementById('detectedChartType'),
    confidenceScore: document.getElementById('confidenceScore'),
    exampleRCode: document.getElementById('exampleRCode'),
    copyCodeBtn: document.getElementById('copyCodeBtn'),
    compatibilityResults: document.getElementById('compatibilityResults'),
    compatibilityMessage: document.getElementById('compatibilityMessage'),
    generateFromDetectedBtn: document.getElementById('generateFromDetectedBtn'),

    // Status
    statusMessage: document.getElementById('statusMessage')
};

// Initialize
function init() {
    console.log('Initializing Vibe_Chart...');
    initializeEventListeners();
    loadChartTypes();
    console.log('App ready!');
}

// Event Listeners
function initializeEventListeners() {
    // Dataset upload
    elements.datasetUpload.addEventListener('change', handleDatasetFileSelect);
    elements.uploadDatasetBtn.addEventListener('click', uploadDataset);

    // Chart generation
    elements.chartTypeSelect.addEventListener('change', handleChartTypeChange);
    elements.xColumnSelect.addEventListener('change', validateChartGeneration);
    elements.yColumnSelect.addEventListener('change', validateChartGeneration);
    elements.groupColumnSelect.addEventListener('change', validateChartGeneration);
    elements.generateChartBtn.addEventListener('click', generateChart);

    // Image analysis
    elements.imageUpload.addEventListener('change', handleImageFileSelect);
    elements.analyzeImageBtn.addEventListener('click', analyzeImage);
    elements.copyCodeBtn.addEventListener('click', copyRCode);
    elements.generateFromDetectedBtn.addEventListener('click', generateFromDetected);
}

// ============================================================================
// SECTION 1: DATASET UPLOAD & COLUMN EXPLORATION
// ============================================================================

function handleDatasetFileSelect(event) {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    const validExtensions = ['csv', 'xlsx', 'xls'];
    const fileExt = file.name.split('.').pop().toLowerCase();

    if (!validExtensions.includes(fileExt)) {
        showStatus('Please upload a CSV or Excel file', 'error');
        return;
    }

    appState.datasetFile = file;
    elements.datasetFileName.textContent = file.name;
    elements.uploadDatasetBtn.disabled = false;

    showStatus('Dataset file selected', 'info');
}

async function uploadDataset() {
    if (!appState.datasetFile) {
        showStatus('Please select a dataset file first', 'error');
        return;
    }

    // Show loading
    elements.uploadDatasetBtn.disabled = true;
    elements.uploadDatasetBtn.classList.add('loading');
    elements.uploadDatasetBtn.textContent = '⏳ Uploading...';

    try {
        const formData = new FormData();
        formData.append('file', appState.datasetFile);

        const response = await fetch(`${API_BASE_URL}/upload-data`, {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to upload dataset');
        }

        // Update state
        appState.datasetLoaded = true;
        appState.columns = data.columns;

        // Display columns
        displayColumns(data);

        // Enable chart generation
        enableChartGeneration();

        showStatus(`Dataset uploaded: ${data.rows} rows, ${data.columns.length} columns`, 'success');

    } catch (error) {
        console.error('Error uploading dataset:', error);
        showStatus(`Error: ${error.message}`, 'error');
    } finally {
        elements.uploadDatasetBtn.disabled = false;
        elements.uploadDatasetBtn.classList.remove('loading');
        elements.uploadDatasetBtn.textContent = '📤 Upload Dataset';
    }
}

function displayColumns(data) {
    // Show dataset info
    elements.datasetInfo.innerHTML = `
        <strong>Dataset:</strong> ${appState.datasetFile.name} | 
        <strong>Rows:</strong> ${data.rows} | 
        <strong>Columns:</strong> ${data.columns.length}
    `;

    // Populate table
    elements.columnsTableBody.innerHTML = '';
    data.columns.forEach(col => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong>${col.name}</strong></td>
            <td><span class="type-badge ${col.type}">${col.type}</span></td>
            <td>${col.sample_values.join(', ')}</td>
        `;
        elements.columnsTableBody.appendChild(row);
    });

    elements.columnsDisplay.style.display = 'block';
}

// ============================================================================
// SECTION 2: CHART GENERATION FROM DATASET
// ============================================================================

async function loadChartTypes() {
    try {
        const response = await fetch(`${API_BASE_URL}/chart-types`);
        const data = await response.json();

        if (data.success) {
            appState.chartTypes = data.chart_types;
            populateChartTypeDropdown();
        }
    } catch (error) {
        console.error('Error loading chart types:', error);
    }
}

function populateChartTypeDropdown() {
    elements.chartTypeSelect.innerHTML = '<option value="">-- Select Chart Type --</option>';
    appState.chartTypes.forEach(type => {
        const option = document.createElement('option');
        option.value = type.id;
        option.textContent = type.label;
        option.dataset.requirements = type.requirements;
        elements.chartTypeSelect.appendChild(option);
    });
}

function enableChartGeneration() {
    elements.chartGenerationArea.style.display = 'none';
    elements.chartGenerationForm.style.display = 'block';
    updateColumnDropdowns();
}

function handleChartTypeChange(event) {
    const chartType = event.target.value;
    appState.currentChartType = chartType;

    if (!chartType) {
        elements.chartRequirements.textContent = '';
        elements.groupColumnGroup.style.display = 'none';
        return;
    }

    // Show requirements
    const selectedOption = event.target.selectedOptions[0];
    elements.chartRequirements.textContent = `Requirements: ${selectedOption.dataset.requirements}`;

    // Show/hide group column based on chart type
    const needsGroup = ['boxplot', 'violin', 'heatmap', 'stacked_bar'].includes(chartType);
    elements.groupColumnGroup.style.display = needsGroup ? 'block' : 'none';

    validateChartGeneration();
}

function updateColumnDropdowns() {
    // Populate all column dropdowns
    const numericCols = appState.columns.filter(c => c.type === 'numeric');
    const categoricalCols = appState.columns.filter(c => c.type === 'categorical');
    const allCols = appState.columns;

    // X Column (usually categorical or any)
    elements.xColumnSelect.innerHTML = '<option value="">-- Select Column --</option>';
    allCols.forEach(col => {
        const option = document.createElement('option');
        option.value = col.name;
        option.textContent = `${col.name} (${col.type})`;
        elements.xColumnSelect.appendChild(option);
    });

    // Y Column (usually numeric)
    elements.yColumnSelect.innerHTML = '<option value="">-- Select Column --</option>';
    allCols.forEach(col => {
        const option = document.createElement('option');
        option.value = col.name;
        option.textContent = `${col.name} (${col.type})`;
        elements.yColumnSelect.appendChild(option);
    });

    // Group Column
    elements.groupColumnSelect.innerHTML = '<option value="">-- Select Column --</option>';
    allCols.forEach(col => {
        const option = document.createElement('option');
        option.value = col.name;
        option.textContent = `${col.name} (${col.type})`;
        elements.groupColumnSelect.appendChild(option);
    });
}

function validateChartGeneration() {
    const hasChartType = !!appState.currentChartType;
    const hasX = !!elements.xColumnSelect.value;
    const hasY = !!elements.yColumnSelect.value;

    // Different chart types have different requirements
    let isValid = false;

    if (appState.currentChartType === 'histogram') {
        isValid = hasChartType && hasX;
    } else if (['boxplot', 'violin'].includes(appState.currentChartType)) {
        isValid = hasChartType && hasY;
    } else {
        isValid = hasChartType && hasX && hasY;
    }

    elements.generateChartBtn.disabled = !isValid;
}

async function generateChart() {
    const chartType = appState.currentChartType;
    const xColumn = elements.xColumnSelect.value;
    const yColumn = elements.yColumnSelect.value;
    const groupColumn = elements.groupColumnSelect.value || null;

    if (!chartType) {
        showStatus('Please select a chart type', 'error');
        return;
    }

    // Show loading
    elements.generateChartBtn.disabled = true;
    elements.generateChartBtn.classList.add('loading');
    elements.generateChartBtn.textContent = '⏳ Generating...';

    try {
        const response = await fetch(`${API_BASE_URL}/generate-chart`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                dataset_id: 'current',
                chart_type: chartType,
                x_column: xColumn,
                y_column: yColumn,
                group_column: groupColumn
            })
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(data.message || data.error || 'Failed to generate chart');
        }

        // Display chart
        elements.chartImage.src = data.image_base64;
        elements.chartPreview.style.display = 'block';

        // Scroll to preview
        elements.chartPreview.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

        showStatus('Chart generated successfully!', 'success');

    } catch (error) {
        console.error('Error generating chart:', error);
        showStatus(`Error: ${error.message}`, 'error');
    } finally {
        elements.generateChartBtn.disabled = false;
        elements.generateChartBtn.classList.remove('loading');
        elements.generateChartBtn.textContent = '📈 Generate Chart';
    }
}

// ============================================================================
// SECTION 3: IMAGE ANALYSIS & COMPATIBILITY CHECK
// ============================================================================

function handleImageFileSelect(event) {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
        showStatus('Please upload a PNG or JPG image', 'error');
        return;
    }

    appState.imageFile = file;
    elements.imageFileName.textContent = file.name;

    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => {
        elements.imagePreview.innerHTML = `<img src="${e.target.result}" alt="Chart preview">`;
        elements.imagePreview.classList.add('active');
    };
    reader.readAsDataURL(file);

    elements.analyzeImageBtn.disabled = false;
    showStatus('Image selected', 'info');
}

async function analyzeImage() {
    if (!appState.imageFile) {
        showStatus('Please select an image first', 'error');
        return;
    }

    // Show loading
    elements.analyzeImageBtn.disabled = true;
    elements.analyzeImageBtn.classList.add('loading');
    elements.analyzeImageBtn.textContent = '⏳ Analyzing...';

    try {
        const formData = new FormData();
        formData.append('image', appState.imageFile);

        const response = await fetch(`${API_BASE_URL}/analyze-image`, {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to analyze image');
        }

        // Store detected chart type
        appState.detectedChartType = data.chart_type;

        // Display results
        elements.detectedChartType.textContent = data.chart_type.replace(/_/g, ' ');
        elements.confidenceScore.textContent = `Confidence: ${data.confidence}% (Placeholder Mode)`;
        elements.exampleRCode.value = data.example_r_code;
        elements.analysisResults.style.display = 'block';

        // If dataset is loaded, check compatibility
        if (appState.datasetLoaded) {
            await checkCompatibility(data.chart_type);
        } else {
            elements.compatibilityResults.style.display = 'none';
        }

        showStatus('Image analyzed successfully!', 'success');

    } catch (error) {
        console.error('Error analyzing image:', error);
        showStatus(`Error: ${error.message}`, 'error');
    } finally {
        elements.analyzeImageBtn.disabled = false;
        elements.analyzeImageBtn.classList.remove('loading');
        elements.analyzeImageBtn.textContent = '🔍 Analyze Image';
    }
}

async function checkCompatibility(chartType) {
    try {
        const response = await fetch(`${API_BASE_URL}/check-compatibility`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                dataset_id: 'current',
                chart_type: chartType
            })
        });

        const data = await response.json();

        if (data.success) {
            elements.compatibilityResults.style.display = 'block';

            if (data.compatible) {
                elements.compatibilityMessage.className = 'compatibility-message compatible';
                elements.compatibilityMessage.textContent = `✓ ${data.reason}`;
                elements.generateFromDetectedBtn.style.display = 'block';
                appState.suggestedColumns = data.suggested_columns;
            } else {
                elements.compatibilityMessage.className = 'compatibility-message incompatible';
                elements.compatibilityMessage.textContent = `✗ ${data.reason}`;
                elements.generateFromDetectedBtn.style.display = 'none';
            }
        }
    } catch (error) {
        console.error('Error checking compatibility:', error);
    }
}

async function generateFromDetected() {
    if (!appState.suggestedColumns) {
        showStatus('No suggested columns available', 'error');
        return;
    }

    // Set the suggested columns
    elements.chartTypeSelect.value = appState.detectedChartType;
    handleChartTypeChange({ target: elements.chartTypeSelect });

    if (appState.suggestedColumns.x_column) {
        elements.xColumnSelect.value = appState.suggestedColumns.x_column;
    }
    if (appState.suggestedColumns.y_column) {
        elements.yColumnSelect.value = appState.suggestedColumns.y_column;
    }
    if (appState.suggestedColumns.group_column) {
        elements.groupColumnSelect.value = appState.suggestedColumns.group_column;
    }

    validateChartGeneration();

    // Scroll to chart generation section
    elements.chartGenerationForm.scrollIntoView({ behavior: 'smooth', block: 'start' });

    showStatus('Columns auto-filled! Click "Generate Chart" to create.', 'info');
}

async function copyRCode() {
    const code = elements.exampleRCode.value;
    if (!code) return;

    try {
        await navigator.clipboard.writeText(code);
        showStatus('R code copied to clipboard!', 'success');

        const originalText = elements.copyCodeBtn.textContent;
        elements.copyCodeBtn.textContent = '✓ Copied!';
        setTimeout(() => {
            elements.copyCodeBtn.textContent = originalText;
        }, 2000);
    } catch (error) {
        console.error('Error copying to clipboard:', error);
        showStatus('Failed to copy code', 'error');
    }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function showStatus(message, type = 'info') {
    elements.statusMessage.textContent = message;
    elements.statusMessage.className = `status-message ${type} show`;

    setTimeout(() => {
        elements.statusMessage.classList.remove('show');
    }, 4000);
}

// Initialize app
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
