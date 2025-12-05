/**
 * AI-Assisted Chart Reconstruction - Frontend JavaScript
 * Handles file uploads, API calls, and UI updates
 */

// Configuration
const API_BASE_URL = 'http://localhost:5000/api';

// State management
const state = {
    imageFile: null,
    csvFile: null,
    chartType: null,
    rCode: null
};

// DOM Elements
const elements = {
    imageUpload: document.getElementById('imageUpload'),
    csvUpload: document.getElementById('csvUpload'),
    imageFileName: document.getElementById('imageFileName'),
    csvFileName: document.getElementById('csvFileName'),
    imagePreview: document.getElementById('imagePreview'),
    csvInfo: document.getElementById('csvInfo'),
    analyzeBtn: document.getElementById('analyzeBtn'),
    plotBtn: document.getElementById('plotBtn'),
    plotOptions: document.getElementById('plotOptions'),
    analysisResults: document.getElementById('analysisResults'),
    chartType: document.getElementById('chartType'),
    rCode: document.getElementById('rCode'),
    copyCodeBtn: document.getElementById('copyCodeBtn'),
    plotResponse: document.getElementById('plotResponse'),
    plotResponseContent: document.getElementById('plotResponseContent'),
    statusMessage: document.getElementById('statusMessage')
};

// Event Listeners
function initializeEventListeners() {
    // Image upload
    elements.imageUpload.addEventListener('change', handleImageUpload);

    // CSV upload
    elements.csvUpload.addEventListener('change', handleCSVUpload);

    // Analyze button
    elements.analyzeBtn.addEventListener('click', analyzeImage);

    // Plot button
    elements.plotBtn.addEventListener('click', requestPlot);

    // Copy code button
    elements.copyCodeBtn.addEventListener('click', copyRCode);
}

/**
 * Handle image file upload
 */
function handleImageUpload(event) {
    const file = event.target.files[0];

    if (!file) return;

    // Validate file type
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
        showStatus('Please upload a PNG or JPG image', 'error');
        return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
        showStatus('Image file is too large (max 10MB)', 'error');
        return;
    }

    state.imageFile = file;
    elements.imageFileName.textContent = file.name;

    // Show image preview
    const reader = new FileReader();
    reader.onload = (e) => {
        elements.imagePreview.innerHTML = `<img src="${e.target.result}" alt="Chart preview">`;
        elements.imagePreview.classList.add('active');
    };
    reader.readAsDataURL(file);

    // Enable analyze button if image is uploaded
    updateButtonStates();

    showStatus('Image uploaded successfully', 'success');
}

/**
 * Handle CSV file upload
 */
function handleCSVUpload(event) {
    const file = event.target.files[0];

    if (!file) return;

    // Validate file type
    if (!file.name.endsWith('.csv')) {
        showStatus('Please upload a CSV file', 'error');
        return;
    }

    state.csvFile = file;
    elements.csvFileName.textContent = file.name;

    // Show CSV info
    elements.csvInfo.innerHTML = `
        <strong>File:</strong> ${file.name}<br>
        <strong>Size:</strong> ${(file.size / 1024).toFixed(2)} KB
    `;
    elements.csvInfo.classList.add('active');

    // TODO: Parse CSV and show preview
    // You can use libraries like PapaParse for CSV parsing
    // Example:
    // Papa.parse(file, {
    //     complete: function(results) {
    //         console.log('CSV data:', results.data);
    //         // Show data preview in UI
    //     }
    // });

    showStatus('CSV uploaded successfully', 'success');
}

/**
 * Analyze uploaded image using Flask API
 */
async function analyzeImage() {
    if (!state.imageFile) {
        showStatus('Please upload an image first', 'error');
        return;
    }

    // Disable button and show loading state
    elements.analyzeBtn.disabled = true;
    elements.analyzeBtn.classList.add('loading');
    elements.analyzeBtn.textContent = '🔄 Analyzing...';

    try {
        // Create FormData for file upload
        const formData = new FormData();
        formData.append('image', state.imageFile);

        // Call Flask API
        const response = await fetch(`${API_BASE_URL}/analyze-image`, {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to analyze image');
        }

        // Update state
        state.chartType = data.chart_type;
        state.rCode = data.example_r_code;

        // Display results
        displayAnalysisResults(data);

        // Enable plot button
        updateButtonStates();

        showStatus('Image analyzed successfully!', 'success');

    } catch (error) {
        console.error('Error analyzing image:', error);
        showStatus(`Error: ${error.message}`, 'error');
    } finally {
        // Reset button state
        elements.analyzeBtn.disabled = false;
        elements.analyzeBtn.classList.remove('loading');
        elements.analyzeBtn.textContent = '🔍 Analyze Image';
    }
}

/**
 * Display analysis results in the UI
 */
function displayAnalysisResults(data) {
    // Show the analysis results section
    elements.analysisResults.style.display = 'block';

    // Display chart type
    elements.chartType.textContent = data.chart_type.replace(/_/g, ' ');

    // Display R code
    elements.rCode.textContent = data.example_r_code;

    // Scroll to results
    elements.analysisResults.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

/**
 * Request plot from R Plumber API via Flask
 */
async function requestPlot() {
    if (!state.chartType) {
        showStatus('Please analyze an image first', 'error');
        return;
    }

    // Disable button and show loading state
    elements.plotBtn.disabled = true;
    elements.plotBtn.classList.add('loading');
    elements.plotBtn.textContent = '🔄 Requesting...';

    try {
        // Prepare request payload
        const payload = {
            chart_type: state.chartType,
            options: elements.plotOptions.value || '',
            data_summary: {
                // TODO: Add actual data summary from parsed CSV
                // For now, send placeholder data
                csv_filename: state.csvFile ? state.csvFile.name : null,
                csv_size: state.csvFile ? state.csvFile.size : null
            }
        };

        // Call Flask API which forwards to R Plumber
        const response = await fetch(`${API_BASE_URL}/plot`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to request plot');
        }

        // Display R API response
        displayPlotResponse(data);

        showStatus('Plot request sent successfully!', 'success');

    } catch (error) {
        console.error('Error requesting plot:', error);
        showStatus(`Error: ${error.message}`, 'error');
    } finally {
        // Reset button state
        elements.plotBtn.disabled = false;
        elements.plotBtn.classList.remove('loading');
        elements.plotBtn.textContent = '📈 Request Plot from R API';
    }
}

/**
 * Display plot response from R API
 */
function displayPlotResponse(data) {
    elements.plotResponseContent.textContent = JSON.stringify(data, null, 2);
    elements.plotResponse.style.display = 'block';

    // Scroll to response
    elements.plotResponse.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

/**
 * Copy R code to clipboard
 */
async function copyRCode() {
    if (!state.rCode) return;

    try {
        await navigator.clipboard.writeText(state.rCode);
        showStatus('R code copied to clipboard!', 'success');

        // Temporary button feedback
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

/**
 * Update button enabled/disabled states based on current state
 */
function updateButtonStates() {
    // Enable analyze button if image is uploaded
    elements.analyzeBtn.disabled = !state.imageFile;

    // Enable plot button if image has been analyzed
    elements.plotBtn.disabled = !state.chartType;
}

/**
 * Show status message to user
 */
function showStatus(message, type = 'info') {
    elements.statusMessage.textContent = message;
    elements.statusMessage.className = `status-message ${type} show`;

    // Auto-hide after 4 seconds
    setTimeout(() => {
        elements.statusMessage.classList.remove('show');
    }, 4000);
}

/**
 * Initialize the application
 */
function init() {
    console.log('Initializing Chart Reconstruction App...');
    initializeEventListeners();
    updateButtonStates();
    console.log('App ready!');
}

// Start the app when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
