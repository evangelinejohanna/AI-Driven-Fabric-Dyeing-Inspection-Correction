import React, { useState, useRef, useCallback } from "react";
import Webcam from "react-webcam";


const Upload = () => {
  const [imagePath, setImagePath] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [message, setMessage] = useState("");
  const [message2, setMessage2] = useState("");
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [correctedImage, setCorrectedImage] = useState(null);
  const webcamRef = useRef(null);

  // Handle file selection
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const filePath = URL.createObjectURL(file);
      setImagePath(filePath);
      setImageFile(file);
    }
  };

  // Open camera
  const startCamera = () => {
    setIsCameraOpen(true);
  };

  // Capture image from webcam
  const captureImage = useCallback(() => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      setImagePath(imageSrc);
      setIsCameraOpen(false); // Close the webcam

      // Convert base64 to File
      fetch(imageSrc)
        .then((res) => res.blob())
        .then((blob) => {
          const file = new File([blob], "captured_image.jpg", { type: "image/jpeg" });
          setImageFile(file);
        });
    }
  }, []);

  // Upload Image
  const uploadImage = async () => {
    if (!imageFile) {
      setMessage("No image selected or captured!");
      return;
    }

    const formData = new FormData();
    formData.append("image", imageFile);

    try {
      // Step 1: Send first request to upload
      const response = await fetch("http://127.0.0.1:5000/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        setMessage("Error uploading image!");
        return;
      }

      const data = await response.json();
      console.log("Setting message:", `Predicted Label: ${data.predicted_label}`);
      setMessage2(`Predicted defect: ${data.predicted_label} \n Dominant Color: ${data.dominant_color}`);
      console.log("Predicted Label:", data.dominant_color);
      console.log("Message set:", message);

  
      if (data.flag === 1) {
        // If image is defect-free, stop here
        setCorrectedImage(null);
      } else {
        // Step 2: Send second request for corrected image
        fetchCorrectedImage(data.corrected_image);
      }
    } catch (error) {
      console.error("Upload error:", error);
      setMessage("Error uploading image!");
    }
  };

  // Fetch corrected image
  const fetchCorrectedImage = async (imageUrl) => {
    try {
      console.log("image UrL: ",imageUrl);
      const imageResponse = await fetch(`http://127.0.0.1:5000/captured/${imageUrl}`);
      if (!imageResponse.ok) {
        setMessage("Error fetching corrected image!");
        return;
      }
      
      const blob = await imageResponse.blob();
      const correctedImageUrl = URL.createObjectURL(blob);
      setCorrectedImage(correctedImageUrl);
      setMessage("Corrected image received!");
    } catch (error) {
      console.error("Error fetching corrected image:", error);
      setMessage("Error fetching corrected image!");
    }
    
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Upload or Capture Fabric Image</h2>

      {/* File Upload Button */}
      <button style={styles.button} onClick={() => document.getElementById("fileInput").click()}>
        Select from System
      </button>
      <input type="file" id="fileInput" accept="image/*" onChange={handleFileChange} style={{ display: "none" }} />

      {/* Open Camera Button */}
      {!isCameraOpen && (
        <button style={styles.button} onClick={startCamera}>Open Camera</button>
      )}

      {/* Webcam Capture */}
      {isCameraOpen && (
        <div style={styles.videoContainer}>
          <Webcam
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            style={styles.video}
          />
          <button style={styles.captureButton} onClick={captureImage}>Capture</button>
        </div>
      )}

      {/* Captured or Uploaded Image Preview */}
      {imagePath && <img src={imagePath} alt="Selected or Captured" style={styles.image} />}

      {/* Upload Button */}
      <button style={styles.uploadButton} onClick={uploadImage}>Upload Image</button>
      <p style={styles.message}>{message2 }</p>

      {/* Display Corrected Image */}
      {correctedImage && (
        <>
          <h3 style={styles.correctedText}>Corrected Image:</h3>
          <img src={correctedImage} alt="Corrected Fabric" style={styles.image} />
        </>
      )}

      {/* Upload Status Message */}

      <p style={styles.message}>{message}</p>

      </div>
  );
};

// Styles
const styles = {
  container: {
    textAlign: "center",
    padding: "20px",
    fontFamily: "Arial, sans-serif",
  },
  heading: {
    color: "#2c3e50",
  },
  button: {
    backgroundColor: "#3498db",
    color: "white",
    padding: "10px 15px",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    margin: "10px",
  },
  uploadButton: {
    backgroundColor: "#2ecc71",
    color: "white",
    padding: "10px 15px",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    margin: "10px",
  },
  videoContainer: {
    position: "relative",
    marginTop: "10px",
  },
  video: {
    width: "100%",
    maxWidth: "400px",
    borderRadius: "10px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
  },
  captureButton: {
    backgroundColor: "#e74c3c",
    color: "white",
    padding: "8px 12px",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    marginTop: "10px",
  },
  image: {
    width: "300px",
    marginTop: "20px",
    borderRadius: "10px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
  },
  message: {
    marginTop: "10px",
    color: "#e74c3c",
  },
};

export default Upload;
