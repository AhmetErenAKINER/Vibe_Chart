"""
Flask Backend for AI-Assisted Chart Reconstruction
University Assignment

This server provides API endpoints for:
1. Analyzing chart images to detect chart type (with LLM integration points)
2. Generating R code based on detected chart types
3. Forwarding plot requests to R Plumber API

INTEGRATION POINTS FOR LLM (NotebookLM / Google AI Studio):
- Image analysis using vision models
- Chart type classification
- R code generation based on chart characteristics
- Data-aware code customization
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import os
from werkzeug.utils import secure_filename
import base64

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend communication

# Configuration
UPLOAD_FOLDER = 'uploads'
ALLOWED_IMAGE_EXTENSIONS = {'png', 'jpg', 'jpeg'}
ALLOWED_DATA_EXTENSIONS = {'csv'}
R_PLUMBER_URL = 'http://localhost:8000/plot'

# Create upload folder if it doesn't exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size


def allowed_file(filename, allowed_extensions):
    """Check if file has an allowed extension"""
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in allowed_extensions


@app.route('/api/analyze-image', methods=['POST'])
def analyze_image():
    """
    Analyze uploaded chart image and return detected chart type with example R code.
    
    Expected: multipart/form-data with 'image' file
    Returns: JSON with chart_type, example_r_code, confidence, and detected_features
    
    ============================================================================
    LLM INTEGRATION POINT #1: IMAGE ANALYSIS
    ============================================================================
    
    CURRENT: Placeholder logic that returns dummy chart type
    
    FUTURE INTEGRATION WITH LLM (Google AI Studio / Gemini Vision):
    
    1. LOAD VISION MODEL:
       ```python
       import google.generativeai as genai
       genai.configure(api_key=os.environ['GOOGLE_API_KEY'])
       model = genai.GenerativeModel('gemini-1.5-flash')
       ```
    
    2. PREPARE IMAGE FOR ANALYSIS:
       ```python
       from PIL import Image
       img = Image.open(filepath)
       ```
    
    3. CREATE ANALYSIS PROMPT:
       ```python
       prompt = '''
       Analyze this chart image and provide:
       1. Chart type (bar_chart, line_chart, scatter_plot, pie_chart, histogram, box_plot)
       2. Detected features (axes labels, title, legend, data points)
       3. Confidence score (0-100)
       4. Suggested R visualization library (ggplot2, base R, plotly)
       
       Return response as JSON.
       '''
       ```
    
    4. CALL VISION MODEL:
       ```python
       response = model.generate_content([prompt, img])
       analysis = json.loads(response.text)
       chart_type = analysis['chart_type']
       confidence = analysis['confidence']
       features = analysis['detected_features']
       ```
    
    5. VALIDATE AND PROCESS RESULTS:
       - Verify chart_type is in allowed list
       - Check confidence threshold (e.g., > 70%)
       - Extract relevant features for R code generation
    
    ============================================================================
    """
    
    # Check if image file is present
    if 'image' not in request.files:
        return jsonify({'error': 'No image file provided'}), 400
    
    file = request.files['image']
    
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    
    if file and allowed_file(file.filename, ALLOWED_IMAGE_EXTENSIONS):
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        
        # ====================================================================
        # PLACEHOLDER: Replace this section with actual LLM vision analysis
        # ====================================================================
        
        # Simulate realistic analysis results
        detected_chart_type = "bar_chart"  # Would come from LLM
        confidence_score = 92  # Would come from LLM (0-100)
        detected_features = {
            "has_title": True,
            "has_legend": False,
            "has_axes_labels": True,
            "x_axis_label": "Categories",
            "y_axis_label": "Values",
            "estimated_data_points": 5,
            "color_scheme": "single_color"
        }
        
        # ====================================================================
        # LLM INTEGRATION POINT #2: R CODE GENERATION
        # ====================================================================
        
        # Generate R code based on detected chart type and features
        example_r_code = generate_r_code_with_llm(
            detected_chart_type, 
            detected_features
        )
        
        return jsonify({
            'success': True,
            'chart_type': detected_chart_type,
            'confidence': confidence_score,
            'detected_features': detected_features,
            'example_r_code': example_r_code,
            'message': 'Image analyzed successfully (placeholder detection)',
            'llm_ready': False  # Set to True when LLM is integrated
        }), 200
    
    return jsonify({'error': 'Invalid file type. Please upload PNG or JPG'}), 400


def generate_r_code_with_llm(chart_type, features=None):
    """
    Generate R code based on chart type and detected features.
    
    ============================================================================
    LLM INTEGRATION POINT #2: R CODE GENERATION
    ============================================================================
    
    CURRENT: Template-based code generation with basic customization
    
    FUTURE INTEGRATION WITH LLM (Google AI Studio / Gemini):
    
    1. CREATE CODE GENERATION PROMPT:
       ```python
       prompt = f'''
       Generate R code using ggplot2 for a {chart_type}.
       
       Detected features:
       - Title: {features.get('has_title')}
       - X-axis label: {features.get('x_axis_label', 'X')}
       - Y-axis label: {features.get('y_axis_label', 'Y')}
       - Data points: {features.get('estimated_data_points')}
       - Color scheme: {features.get('color_scheme')}
       
       Requirements:
       1. Use ggplot2 library
       2. Include data loading from CSV
       3. Add appropriate labels and title
       4. Use theme_minimal() for clean appearance
       5. Include comments explaining each step
       6. Make it production-ready and customizable
       
       Return only the R code, no explanations.
       '''
       ```
    
    2. CALL TEXT GENERATION MODEL:
       ```python
       model = genai.GenerativeModel('gemini-1.5-flash')
       response = model.generate_content(prompt)
       r_code = response.text
       ```
    
    3. POST-PROCESS CODE:
       - Remove markdown code fences if present
       - Validate R syntax (optional)
       - Add header comments with metadata
       - Ensure proper formatting
    
    4. CONTEXT-AWARE GENERATION:
       - If CSV data is available, analyze column types
       - Suggest appropriate mappings (x, y, fill, color)
       - Generate code specific to data structure
       - Include data preprocessing steps if needed
    
    ============================================================================
    """
    
    features = features or {}
    
    # Template-based generation (to be replaced with LLM)
    templates = {
        'bar_chart': f"""
# Bar Chart - Generated R Code
# Chart type detected with {features.get('confidence', 'unknown')} confidence
library(ggplot2)

# Load your data
data <- read.csv("your_data.csv")

# Create bar chart
ggplot(data, aes(x=category, y=value)) +
  geom_bar(stat="identity", fill="steelblue") +
  theme_minimal() +
  labs(
    title="Bar Chart",
    x="{features.get('x_axis_label', 'Category')}",
    y="{features.get('y_axis_label', 'Value')}"
  )

# Save plot
ggsave("bar_chart.png", width=10, height=6, dpi=300)
""",
        'line_chart': f"""
# Line Chart - Generated R Code
library(ggplot2)

# Load your data
data <- read.csv("your_data.csv")

# Create line chart
ggplot(data, aes(x=time, y=value)) +
  geom_line(color="darkblue", size=1.2) +
  geom_point(color="darkblue", size=2) +
  theme_minimal() +
  labs(
    title="Line Chart",
    x="{features.get('x_axis_label', 'Time')}",
    y="{features.get('y_axis_label', 'Value')}"
  )

# Save plot
ggsave("line_chart.png", width=10, height=6, dpi=300)
""",
        'scatter_plot': f"""
# Scatter Plot - Generated R Code
library(ggplot2)

# Load your data
data <- read.csv("your_data.csv")

# Create scatter plot
ggplot(data, aes(x=x_var, y=y_var)) +
  geom_point(color="coral", size=3, alpha=0.6) +
  geom_smooth(method="lm", se=TRUE, color="darkred") +
  theme_minimal() +
  labs(
    title="Scatter Plot",
    x="{features.get('x_axis_label', 'X Variable')}",
    y="{features.get('y_axis_label', 'Y Variable')}"
  )

# Save plot
ggsave("scatter_plot.png", width=10, height=6, dpi=300)
""",
        'pie_chart': f"""
# Pie Chart - Generated R Code
library(ggplot2)

# Load your data
data <- read.csv("your_data.csv")

# Create pie chart
ggplot(data, aes(x="", y=value, fill=category)) +
  geom_bar(stat="identity", width=1) +
  coord_polar("y", start=0) +
  theme_void() +
  labs(title="Pie Chart") +
  scale_fill_brewer(palette="Set3")

# Save plot
ggsave("pie_chart.png", width=8, height=8, dpi=300)
""",
        'histogram': f"""
# Histogram - Generated R Code
library(ggplot2)

# Load your data
data <- read.csv("your_data.csv")

# Create histogram
ggplot(data, aes(x=value)) +
  geom_histogram(bins=30, fill="steelblue", color="white", alpha=0.7) +
  theme_minimal() +
  labs(
    title="Histogram",
    x="{features.get('x_axis_label', 'Value')}",
    y="Frequency"
  )

# Save plot
ggsave("histogram.png", width=10, height=6, dpi=300)
"""
    }
    
    return templates.get(chart_type, "# Chart type not recognized\n# Please specify chart type manually")


@app.route('/api/plot', methods=['POST'])
def request_plot():
    """
    Forward plot request to R Plumber API.
    
    Expected JSON: {
        'chart_type': str,
        'options': str (user prompt/options),
        'data_summary': dict (optional data info)
    }
    
    Returns: Response from R Plumber API
    
    ============================================================================
    LLM INTEGRATION POINT #3: R PLUMBER API COMMUNICATION
    ============================================================================
    
    CURRENT: Simple forwarding to external R API with basic error handling
    
    FUTURE ENHANCEMENTS:
    
    1. R PLUMBER API SETUP:
       The R Plumber API should be running on http://localhost:8000
       
       Example R Plumber endpoint (plumber.R):
       ```r
       #* @post /plot
       #* @serializer json
       function(chart_type, options, data_summary) {
         library(ggplot2)
         
         # Parse options and data
         # Generate plot based on chart_type
         # Return plot as base64 or save to file
         
         list(
           status = "success",
           plot_path = "output/plot.png",
           message = "Plot generated successfully"
         )
       }
       ```
    
    2. DATA PREPROCESSING:
       Before sending to R API:
       ```python
       # Parse CSV data if provided
       if 'csv_data' in request.files:
           df = pd.read_csv(request.files['csv_data'])
           data_summary = {
               'columns': df.columns.tolist(),
               'dtypes': df.dtypes.to_dict(),
               'shape': df.shape,
               'sample': df.head().to_dict()
           }
       ```
    
    3. ENHANCED REQUEST PAYLOAD:
       ```python
       r_payload = {
           'chart_type': chart_type,
           'options': options,
           'data_summary': data_summary,
           'plot_config': {
               'width': 10,
               'height': 6,
               'dpi': 300,
               'format': 'png'
           }
       }
       ```
    
    4. RESPONSE HANDLING:
       - Receive plot image (base64 or file path)
       - Store generated plots
       - Return plot URL to frontend
       - Handle R errors gracefully
    
    5. LLM-ENHANCED OPTIONS PARSING:
       Use LLM to parse natural language options:
       ```python
       # User input: "Make it blue with larger text"
       # LLM converts to: {'color': 'blue', 'text_size': 14}
       ```
    
    ============================================================================
    """
    
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No JSON data provided'}), 400
        
        # Extract request parameters
        chart_type = data.get('chart_type', 'unknown')
        options = data.get('options', '')
        data_summary = data.get('data_summary', {})
        
        # Prepare payload for R Plumber API
        r_payload = {
            'chart_type': chart_type,
            'options': options,
            'data_summary': data_summary,
            'timestamp': str(os.times())
        }
        
        # ====================================================================
        # PLACEHOLDER: R API CALL
        # ====================================================================
        # In production, this would call the actual R Plumber API
        # For now, return a realistic mock response
        
        try:
            # Attempt to call R Plumber API
            r_response = requests.post(
                R_PLUMBER_URL,
                json=r_payload,
                timeout=30
            )
            
            # If R API is running, return its response
            return jsonify({
                'success': True,
                'r_response': r_response.json() if r_response.ok else None,
                'status_code': r_response.status_code,
                'message': 'Plot request forwarded to R API'
            }), 200
            
        except requests.exceptions.ConnectionError:
            # R API not running - return mock response
            mock_response = {
                'status': 'success',
                'message': 'Mock R API response (R Plumber not running)',
                'plot_generated': False,
                'chart_type': chart_type,
                'options_received': options,
                'data_summary': data_summary,
                'note': 'Start R Plumber API on http://localhost:8000 for actual plot generation'
            }
            
            return jsonify({
                'success': True,
                'r_response': mock_response,
                'status_code': 200,
                'message': 'Mock response - R API not available',
                'is_mock': True
            }), 200
            
        except requests.exceptions.Timeout:
            return jsonify({
                'error': 'R Plumber API request timed out'
            }), 504
            
    except Exception as e:
        return jsonify({
            'error': f'Server error: {str(e)}'
        }), 500


@app.route('/api/health', methods=['GET'])
def health_check():
    """
    Health check endpoint for monitoring and testing.
    
    Returns system status and configuration info.
    """
    return jsonify({
        'status': 'healthy',
        'service': 'chart-reconstruction-api',
        'version': '1.0.0',
        'endpoints': {
            'analyze_image': '/api/analyze-image',
            'plot': '/api/plot',
            'health': '/api/health'
        },
        'config': {
            'upload_folder': UPLOAD_FOLDER,
            'max_file_size_mb': 16,
            'r_api_url': R_PLUMBER_URL,
            'allowed_image_types': list(ALLOWED_IMAGE_EXTENSIONS),
            'allowed_data_types': list(ALLOWED_DATA_EXTENSIONS)
        },
        'llm_integration': {
            'vision_model': 'Not configured (placeholder mode)',
            'text_model': 'Not configured (placeholder mode)',
            'status': 'Ready for integration'
        }
    }), 200


if __name__ == '__main__':
    print("=" * 70)
    print("AI-Assisted Chart Reconstruction - Flask Backend")
    print("=" * 70)
    print("\nServer Configuration:")
    print(f"  - Host: http://localhost:5000")
    print(f"  - Upload folder: {UPLOAD_FOLDER}")
    print(f"  - R Plumber API: {R_PLUMBER_URL}")
    print("\nAPI Endpoints:")
    print("  - POST /api/analyze-image  → Analyze chart images")
    print("  - POST /api/plot           → Request plot generation")
    print("  - GET  /api/health         → Health check")
    print("\nLLM Integration Status:")
    print("  ⚠️  Currently running in PLACEHOLDER mode")
    print("  📝 See code comments for LLM integration points")
    print("\nReady to accept requests...")
    print("=" * 70)
    print()
    
    app.run(debug=True, host='0.0.0.0', port=5000)
