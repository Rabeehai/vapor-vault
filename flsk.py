from flask import Flask, render_template, request, redirect, url_for
from flask import send_from_directory
from flask.helpers import send_from_directory
from flask import send_from_directory
import os
from flask import jsonify


app = Flask(__name__)
files_directory = 'files'

# Route for rendering the HTML page
@app.route('/')
def index():
    files = [f for f in os.listdir(files_directory) if os.path.isfile(os.path.join(files_directory, f))]
    return render_template('index.html', files=files)

# Route for handling file upload
@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return "No file part", 400

    file = request.files['file']

    if file.filename == '':
        return "No file selected", 400

    if file:
        filename = os.path.join('files', file.filename)
        file.save(filename)
        return "File saved", 200

@app.route('/get-files', methods=['GET'])
def get_files():
    files = [f for f in os.listdir(files_directory) if os.path.isfile(os.path.join(files_directory, f))]
    return {"files": files}

@app.route('/get-file/<filename>', methods=['GET'])
def get_file_content(filename):
    try:
        return send_from_directory(files_directory, filename, as_attachment=False)
    except Exception as e:
        return str(e), 400


@app.route('/download/<filename>', methods=['GET'])
def download_file(filename):
    return send_from_directory(files_directory, filename, as_attachment=True)

@app.route('/delete-file/<filename>', methods=['POST'])
def delete_file(filename):
    try:
        file_path = os.path.join('files', filename)
        if os.path.exists(file_path):
            os.remove(file_path)
            return jsonify({'status': 'File deleted'})
        else:
            return jsonify({'status': 'File not found'}), 404
    except Exception as e:
        return jsonify({'status': 'An error occurred', 'error': str(e)}), 500

if __name__ == '__main__':
    if not os.path.exists('files'):
        os.makedirs('files')
    app.run(debug=True)
