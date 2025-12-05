"""
Flask Backend for AI-Assisted Chart Reconstruction
Vibe_Chart - Dataset-Driven Chart Generation System

This server provides API endpoints for:
1. Dataset upload and analysis (CSV/Excel)
2. Chart generation from datasets (10+ chart types)
3. Compatibility checking between datasets and chart types
4. Image analysis for chart type detection (LLM placeholder)
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import matplotlib
matplotlib.use('Agg')  # Non-interactive backend
import matplotlib.pyplot as plt
import seaborn as sns
import io
import base64
import os
from werkzeug.utils import secure_filename
import numpy as np

app = Flask(__name__)
CORS(app)

# Configuration
UPLOAD_FOLDER = 'uploads'
ALLOWED_IMAGE_EXTENSIONS = {'png', 'jpg', 'jpeg'}
ALLOWED_DATA_EXTENSIONS = {'csv', 'xlsx', 'xls'}

os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB

# Global state for current dataset
current_df = None
current_columns_metadata = None


def allowed_file(filename, allowed_extensions):
    """Check if file has an allowed extension"""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in allowed_extensions


def infer_column_type(series):
    """
    Infer if a column is numeric or categorical.
    Returns: 'numeric' or 'categorical'
    """
    # Check if dtype is numeric
    if pd.api.types.is_numeric_dtype(series):
        # Additional check: if unique values are very few, might be categorical
        unique_ratio = series.nunique() / len(series)
        if unique_ratio < 0.05 and series.nunique() < 10:
            return 'categorical'
        return 'numeric'
    else:
        return 'categorical'


def analyze_dataframe(df):
    """
    Analyze DataFrame and return column metadata.
    Returns list of dicts with: name, type, sample_values
    """
    columns_meta = []
    for col in df.columns:
        col_type = infer_column_type(df[col])
        # Get first 3 non-null sample values
        sample_values = df[col].dropna().head(3).tolist()
        
        columns_meta.append({
            'name': col,
            'type': col_type,
            'sample_values': sample_values
        })
    
    return columns_meta


def get_chart_types_info():
    """
    Return information about all supported chart types.
    """
    return [
        {
            'id': 'bar',
            'label': 'Bar Chart',
            'requirements': '1 categorical (x) + 1 numeric (y)'
        },
        {
            'id': 'line',
            'label': 'Line Chart',
            'requirements': '1 ordered/categorical (x) + 1 numeric (y)'
        },
        {
            'id': 'scatter',
            'label': 'Scatter Plot',
            'requirements': '2 numeric columns (x, y)'
        },
        {
            'id': 'histogram',
            'label': 'Histogram',
            'requirements': '1 numeric column'
        },
        {
            'id': 'boxplot',
            'label': 'Box Plot',
            'requirements': '1 numeric column + optional 1 categorical (group)'
        },
        {
            'id': 'heatmap',
            'label': 'Heatmap',
            'requirements': '2 categorical (x, y) + 1 numeric (value)'
        },
        {
            'id': 'pie',
            'label': 'Pie Chart',
            'requirements': '1 categorical (labels) + 1 numeric (values)'
        },
        {
            'id': 'violin',
            'label': 'Violin Plot',
            'requirements': '1 numeric + optional 1 categorical (group)'
        },
        {
            'id': 'area',
            'label': 'Area Chart',
            'requirements': '1 x column + 1 numeric (y)'
        },
        {
            'id': 'stacked_bar',
            'label': 'Stacked Bar Chart',
            'requirements': '2 categorical (x, group) + 1 numeric (height)'
        }
    ]


def check_chart_compatibility(chart_type, columns_meta):
    """
    Check if the dataset has compatible columns for the requested chart type.
    Returns: (compatible: bool, reason: str, suggested_columns: dict)
    """
    numeric_cols = [c['name'] for c in columns_meta if c['type'] == 'numeric']
    categorical_cols = [c['name'] for c in columns_meta if c['type'] == 'categorical']
    
    suggestions = {'x_column': None, 'y_column': None, 'group_column': None}
    
    if chart_type == 'bar':
        if len(categorical_cols) >= 1 and len(numeric_cols) >= 1:
            suggestions['x_column'] = categorical_cols[0]
            suggestions['y_column'] = numeric_cols[0]
            return True, "Found categorical + numeric columns", suggestions
        return False, "Bar chart requires 1 categorical and 1 numeric column", suggestions
    
    elif chart_type == 'line':
        if len(numeric_cols) >= 1:
            # Line chart can use index or any column as x
            suggestions['x_column'] = categorical_cols[0] if categorical_cols else 'index'
            suggestions['y_column'] = numeric_cols[0]
            return True, "Found columns for line chart", suggestions
        return False, "Line chart requires at least 1 numeric column", suggestions
    
    elif chart_type == 'scatter':
        if len(numeric_cols) >= 2:
            suggestions['x_column'] = numeric_cols[0]
            suggestions['y_column'] = numeric_cols[1]
            return True, "Found 2 numeric columns", suggestions
        return False, "Scatter plot requires 2 numeric columns", suggestions
    
    elif chart_type == 'histogram':
        if len(numeric_cols) >= 1:
            suggestions['x_column'] = numeric_cols[0]
            return True, "Found numeric column", suggestions
        return False, "Histogram requires 1 numeric column", suggestions
    
    elif chart_type == 'boxplot':
        if len(numeric_cols) >= 1:
            suggestions['y_column'] = numeric_cols[0]
            if categorical_cols:
                suggestions['group_column'] = categorical_cols[0]
            return True, "Found numeric column for boxplot", suggestions
        return False, "Boxplot requires 1 numeric column", suggestions
    
    elif chart_type == 'heatmap':
        if len(categorical_cols) >= 2 and len(numeric_cols) >= 1:
            suggestions['x_column'] = categorical_cols[0]
            suggestions['y_column'] = categorical_cols[1]
            suggestions['group_column'] = numeric_cols[0]  # value column
            return True, "Found 2 categorical + 1 numeric", suggestions
        return False, "Heatmap requires 2 categorical and 1 numeric column", suggestions
    
    elif chart_type == 'pie':
        if len(categorical_cols) >= 1 and len(numeric_cols) >= 1:
            suggestions['x_column'] = categorical_cols[0]
            suggestions['y_column'] = numeric_cols[0]
            return True, "Found categorical + numeric columns", suggestions
        return False, "Pie chart requires 1 categorical and 1 numeric column", suggestions
    
    elif chart_type == 'violin':
        if len(numeric_cols) >= 1:
            suggestions['y_column'] = numeric_cols[0]
            if categorical_cols:
                suggestions['group_column'] = categorical_cols[0]
            return True, "Found numeric column for violin plot", suggestions
        return False, "Violin plot requires 1 numeric column", suggestions
    
    elif chart_type == 'area':
        if len(numeric_cols) >= 1:
            suggestions['x_column'] = categorical_cols[0] if categorical_cols else 'index'
            suggestions['y_column'] = numeric_cols[0]
            return True, "Found columns for area chart", suggestions
        return False, "Area chart requires at least 1 numeric column", suggestions
    
    elif chart_type == 'stacked_bar':
        if len(categorical_cols) >= 2 and len(numeric_cols) >= 1:
            suggestions['x_column'] = categorical_cols[0]
            suggestions['group_column'] = categorical_cols[1]
            suggestions['y_column'] = numeric_cols[0]
            return True, "Found 2 categorical + 1 numeric", suggestions
        return False, "Stacked bar requires 2 categorical and 1 numeric column", suggestions
    
    return False, f"Unknown chart type: {chart_type}", suggestions


def generate_chart_matplotlib(chart_type, df, x_col, y_col, group_col=None):
    """
    Generate a chart using matplotlib/seaborn and return base64 encoded image.
    """
    plt.figure(figsize=(10, 6))
    plt.style.use('seaborn-v0_8-darkgrid')
    
    try:
        if chart_type == 'bar':
            plt.bar(df[x_col], df[y_col], color='steelblue')
            plt.xlabel(x_col)
            plt.ylabel(y_col)
            plt.title(f'Bar Chart: {y_col} by {x_col}')
            plt.xticks(rotation=45, ha='right')
        
        elif chart_type == 'line':
            if x_col == 'index':
                plt.plot(df.index, df[y_col], marker='o', linewidth=2, color='darkblue')
                plt.xlabel('Index')
            else:
                plt.plot(df[x_col], df[y_col], marker='o', linewidth=2, color='darkblue')
                plt.xlabel(x_col)
            plt.ylabel(y_col)
            plt.title(f'Line Chart: {y_col}')
            plt.grid(True, alpha=0.3)
        
        elif chart_type == 'scatter':
            plt.scatter(df[x_col], df[y_col], alpha=0.6, s=50, color='coral')
            plt.xlabel(x_col)
            plt.ylabel(y_col)
            plt.title(f'Scatter Plot: {y_col} vs {x_col}')
            plt.grid(True, alpha=0.3)
        
        elif chart_type == 'histogram':
            plt.hist(df[x_col].dropna(), bins=20, color='steelblue', edgecolor='black', alpha=0.7)
            plt.xlabel(x_col)
            plt.ylabel('Frequency')
            plt.title(f'Histogram: {x_col}')
            plt.grid(True, alpha=0.3)
        
        elif chart_type == 'boxplot':
            if group_col:
                df.boxplot(column=y_col, by=group_col, figsize=(10, 6))
                plt.suptitle('')
                plt.title(f'Box Plot: {y_col} by {group_col}')
            else:
                plt.boxplot(df[y_col].dropna())
                plt.ylabel(y_col)
                plt.title(f'Box Plot: {y_col}')
        
        elif chart_type == 'heatmap':
            # Create pivot table for heatmap
            pivot = df.pivot_table(values=group_col, index=y_col, columns=x_col, aggfunc='mean')
            sns.heatmap(pivot, annot=True, fmt='.1f', cmap='YlOrRd')
            plt.title(f'Heatmap: {group_col} by {x_col} and {y_col}')
        
        elif chart_type == 'pie':
            # Aggregate data for pie chart
            pie_data = df.groupby(x_col)[y_col].sum()
            plt.pie(pie_data, labels=pie_data.index, autopct='%1.1f%%', startangle=90)
            plt.title(f'Pie Chart: {y_col} by {x_col}')
            plt.axis('equal')
        
        elif chart_type == 'violin':
            if group_col:
                sns.violinplot(data=df, x=group_col, y=y_col)
                plt.title(f'Violin Plot: {y_col} by {group_col}')
            else:
                sns.violinplot(y=df[y_col])
                plt.title(f'Violin Plot: {y_col}')
        
        elif chart_type == 'area':
            if x_col == 'index':
                plt.fill_between(df.index, df[y_col], alpha=0.5, color='skyblue')
                plt.plot(df.index, df[y_col], color='darkblue', linewidth=2)
                plt.xlabel('Index')
            else:
                plt.fill_between(range(len(df)), df[y_col], alpha=0.5, color='skyblue')
                plt.plot(range(len(df)), df[y_col], color='darkblue', linewidth=2)
                plt.xlabel(x_col)
            plt.ylabel(y_col)
            plt.title(f'Area Chart: {y_col}')
            plt.grid(True, alpha=0.3)
        
        elif chart_type == 'stacked_bar':
            # Create pivot for stacked bar
            pivot = df.pivot_table(values=y_col, index=x_col, columns=group_col, aggfunc='sum', fill_value=0)
            pivot.plot(kind='bar', stacked=True, figsize=(10, 6))
            plt.xlabel(x_col)
            plt.ylabel(y_col)
            plt.title(f'Stacked Bar: {y_col} by {x_col} and {group_col}')
            plt.legend(title=group_col)
            plt.xticks(rotation=45, ha='right')
        
        plt.tight_layout()
        
        # Save to BytesIO buffer
        buffer = io.BytesIO()
        plt.savefig(buffer, format='png', dpi=100, bbox_inches='tight')
        buffer.seek(0)
        
        # Encode to base64
        image_base64 = base64.b64encode(buffer.read()).decode('utf-8')
        plt.close()
        
        return f"data:image/png;base64,{image_base64}"
    
    except Exception as e:
        plt.close()
        raise Exception(f"Error generating chart: {str(e)}")


# ============================================================================
# API ENDPOINTS
# ============================================================================

@app.route('/api/upload-data', methods=['POST'])
def upload_data():
    """
    Upload and parse CSV or Excel file.
    Stores dataset in global current_df variable.
    Returns column metadata with types and sample values.
    """
    global current_df, current_columns_metadata
    
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
    
    file = request.files['file']
    
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    
    if not allowed_file(file.filename, ALLOWED_DATA_EXTENSIONS):
        return jsonify({'error': 'Invalid file type. Please upload CSV or Excel file'}), 400
    
    try:
        filename = secure_filename(file.filename)
        file_ext = filename.rsplit('.', 1)[1].lower()
        
        # Read file into pandas DataFrame
        if file_ext == 'csv':
            current_df = pd.read_csv(file)
        elif file_ext in ['xlsx', 'xls']:
            current_df = pd.read_excel(file)
        
        # Analyze columns
        current_columns_metadata = analyze_dataframe(current_df)
        
        return jsonify({
            'success': True,
            'dataset_id': 'current',
            'rows': len(current_df),
            'columns': current_columns_metadata,
            'message': f'Dataset uploaded successfully: {len(current_df)} rows, {len(current_columns_metadata)} columns'
        }), 200
    
    except Exception as e:
        return jsonify({'error': f'Error parsing file: {str(e)}'}), 500


@app.route('/api/chart-types', methods=['GET'])
def get_chart_types():
    """
    Return list of supported chart types with their requirements.
    """
    return jsonify({
        'success': True,
        'chart_types': get_chart_types_info()
    }), 200


@app.route('/api/generate-chart', methods=['POST'])
def generate_chart():
    """
    Generate a chart from the current dataset.
    Checks compatibility and returns base64 encoded image.
    """
    global current_df, current_columns_metadata
    
    if current_df is None:
        return jsonify({
            'success': False,
            'error': 'No dataset loaded. Please upload a dataset first.'
        }), 400
    
    data = request.get_json()
    chart_type = data.get('chart_type')
    x_column = data.get('x_column')
    y_column = data.get('y_column')
    group_column = data.get('group_column')
    
    if not chart_type:
        return jsonify({'success': False, 'error': 'chart_type is required'}), 400
    
    # Check compatibility
    compatible, reason, suggestions = check_chart_compatibility(chart_type, current_columns_metadata)
    
    if not compatible:
        return jsonify({
            'success': False,
            'compatible': False,
            'message': reason
        }), 400
    
    # Validate columns exist
    if x_column and x_column != 'index' and x_column not in current_df.columns:
        return jsonify({'success': False, 'error': f'Column {x_column} not found'}), 400
    if y_column and y_column not in current_df.columns:
        return jsonify({'success': False, 'error': f'Column {y_column} not found'}), 400
    if group_column and group_column not in current_df.columns:
        return jsonify({'success': False, 'error': f'Column {group_column} not found'}), 400
    
    try:
        # Generate chart
        image_base64 = generate_chart_matplotlib(chart_type, current_df, x_column, y_column, group_column)
        
        return jsonify({
            'success': True,
            'compatible': True,
            'message': 'Chart generated successfully',
            'image_base64': image_base64
        }), 200
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Error generating chart: {str(e)}'
        }), 500


@app.route('/api/check-compatibility', methods=['POST'])
def check_compatibility():
    """
    Check if current dataset is compatible with requested chart type.
    Returns suggested columns if compatible.
    """
    global current_df, current_columns_metadata
    
    if current_df is None:
        return jsonify({
            'success': False,
            'error': 'No dataset loaded'
        }), 400
    
    data = request.get_json()
    chart_type = data.get('chart_type')
    
    if not chart_type:
        return jsonify({'success': False, 'error': 'chart_type is required'}), 400
    
    compatible, reason, suggested_columns = check_chart_compatibility(chart_type, current_columns_metadata)
    
    return jsonify({
        'success': True,
        'chart_type': chart_type,
        'compatible': compatible,
        'reason': reason,
        'suggested_columns': suggested_columns
    }), 200


@app.route('/api/analyze-image', methods=['POST'])
def analyze_image():
    """
    Analyze uploaded chart image (PLACEHOLDER for LLM integration).
    
    ============================================================================
    LLM INTEGRATION POINT: CHART IMAGE ANALYSIS
    ============================================================================
    
    FUTURE: Use Google Gemini Vision API or NotebookLM to:
    1. Detect chart type from image
    2. Extract features (title, axes, labels)
    3. Estimate data characteristics
    4. Generate confidence score
    
    Example integration:
    ```python
    import google.generativeai as genai
    model = genai.GenerativeModel('gemini-1.5-flash')
    response = model.generate_content([
        "Analyze this chart image and identify the chart type...",
        Image.open(filepath)
    ])
    ```
    ============================================================================
    """
    
    if 'image' not in request.files:
        return jsonify({'error': 'No image file provided'}), 400
    
    file = request.files['image']
    
    if file.filename == '' or not allowed_file(file.filename, ALLOWED_IMAGE_EXTENSIONS):
        return jsonify({'error': 'Invalid image file'}), 400
    
    # Save file
    filename = secure_filename(file.filename)
    filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    file.save(filepath)
    
    # PLACEHOLDER: Simulated chart detection
    # In real implementation, use Gemini Vision API here
    detected_chart_type = "bar"  # Placeholder
    confidence = 85
    
    return jsonify({
        'success': True,
        'chart_type': detected_chart_type,
        'confidence': confidence,
        'detected_features': {
            'has_title': True,
            'has_legend': False,
            'has_axes_labels': True
        },
        'example_r_code': f"# Placeholder R code for {detected_chart_type}\nlibrary(ggplot2)\n# ...",
        'llm_mode': 'placeholder',
        'message': 'Image analyzed (placeholder mode - integrate Gemini Vision for real detection)'
    }), 200


@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint with dataset status."""
    global current_df
    
    dataset_status = {
        'loaded': current_df is not None,
        'rows': len(current_df) if current_df is not None else 0,
        'columns': len(current_df.columns) if current_df is not None else 0
    }
    
    return jsonify({
        'status': 'healthy',
        'service': 'vibe-chart-api',
        'version': '2.0.0',
        'features': {
            'dataset_upload': True,
            'chart_generation': True,
            'chart_types_count': len(get_chart_types_info()),
            'llm_integration': 'placeholder'
        },
        'dataset': dataset_status
    }), 200


if __name__ == '__main__':
    print("=" * 70)
    print("Vibe_Chart - Dataset-Driven Chart Generation System")
    print("=" * 70)
    print("\nServer: http://localhost:5000")
    print("\nAPI Endpoints:")
    print("  - POST /api/upload-data      → Upload CSV/Excel dataset")
    print("  - GET  /api/chart-types      → Get supported chart types")
    print("  - POST /api/generate-chart   → Generate chart from dataset")
    print("  - POST /api/check-compatibility → Check dataset compatibility")
    print("  - POST /api/analyze-image    → Analyze chart image (placeholder)")
    print("  - GET  /api/health           → Health check")
    print("\nSupported Chart Types: 10")
    print("  Bar, Line, Scatter, Histogram, Boxplot, Heatmap, Pie, Violin, Area, Stacked Bar")
    print("\nReady to accept requests...")
    print("=" * 70)
    print()
    
    app.run(debug=True, host='0.0.0.0', port=5000)
