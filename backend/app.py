from flask import Flask, request, jsonify, redirect, url_for, send_from_directory, send_file
import os
from flask_cors import CORS
from sample import *  # Import the model prediction function
from process import *  # Import the process function

app = Flask(__name__)
CORS(app)  # Enable CORS

UPLOAD_FOLDER = "captured_images"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)  # Ensure folder exists

@app.route('/upload', methods=['POST'])
def upload_image():
    try:
        if 'image' not in request.files:
            return jsonify({"error": "No file part in the request"}), 400

        file = request.files['image']
        if file.filename == '':
            return jsonify({"error": "No selected file"}), 400

        # Save file locally
        file_path = os.path.join(UPLOAD_FOLDER, file.filename)
        file.save(file_path)
        print("File received:", file_path)

        # Redirect to processing function with filename (not full path)
        return redirect(url_for('process_image', filename=file.filename, _external=True))

    except Exception as e:
        print("Error:", str(e))
        return jsonify({"error": str(e)}), 500

@app.route('/process_image/<filename>', methods=['GET'])
def process_image(filename):
    try:
        # Construct the full file path correctly
        file_path = os.path.join(UPLOAD_FOLDER, filename)
        flag = 0
        print("Processing image:", filename)
        # Predict the defect type
        predicted_label, probabilities = predict_image(file_path)
        print("Predicted label:", predicted_label)

        if predicted_label == "Defect Free":
            flag = 1
            return jsonify({
                "flag": flag,
                "predicted_label": predicted_label,
                "probabilities": probabilities.tolist()  # Convert to list for JSON serialization
            }), 200

        # Process fabric image
        fabric_result = process_fabric(file_path)

        # Generate corrected image
        corrected_image_filename = visualize_correction(file_path, fabric_result["dominant_color"])
        # corrected_image_path = os.path.join(UPLOAD_FOLDER, corrected_image_filename)
        print("Corrected image path:", corrected_image_filename)
        corrected_image_filename = os.path.basename(corrected_image_filename)

        # Construct public URL for the corrected image
        # corrected_image_url = url_for('serve_image', filename=corrected_image_filename, _external=True)

        print("Fabric processing completed. Returning corrected image URL.")

        return jsonify({
            "flag": flag,
            "predicted_label": predicted_label,
            "probabilities": probabilities.tolist(),
            "fabric_result": fabric_result,
            "corrected_image": corrected_image_filename, # Return full URL
            "dominant_color": fabric_result["dominant_color"],
        }), 200

    except Exception as e:
        print("Error:", str(e))
        return jsonify({"error": str(e)}), 500

# Route to serve corrected images
@app.route('/captured/<filename>')
def serve_image(filename):
    print(send_from_directory(UPLOAD_FOLDER, filename))
    return send_from_directory(UPLOAD_FOLDER,filename)

if __name__ == "__main__":
    app.run(debug=True)
