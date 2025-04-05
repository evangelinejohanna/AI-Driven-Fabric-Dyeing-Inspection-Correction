import json
import cv2
from matplotlib import pyplot as plt
import numpy as np
from sklearn.cluster import KMeans
import os

def extract_colors(image_path, k=3):
    """Extract dominant and secondary colors from the image."""
    image = cv2.imread(image_path)
    image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    image = image.reshape((-1, 3))

    kmeans = KMeans(n_clusters=k, n_init=10)
    kmeans.fit(image)

    colors = kmeans.cluster_centers_.astype(int)  # Convert to int
    return [tuple(map(int, color)) for color in colors]  # Convert each value to Python int

def suggest_correction(dominant_color, secondary_colors):
    """Suggest a correction formula based on dominant color."""
    def calculate_adjustment(color):
        return np.array(dominant_color) - np.array(color)

    return {
        "Dominant": dominant_color,
        "Correction Formula": {
            f"Color {i+1}": list(map(int, calculate_adjustment(color)))  # Convert to Python int
            for i, color in enumerate(secondary_colors)
        }
    }

def process_fabric(image_path):
    """Analyze fabric color and generate correction formula."""
    colors = extract_colors(image_path)
    dominant_color = tuple(map(int, colors[0]))  # Convert to Python int
    secondary_colors = [tuple(map(int, color)) for color in colors[1:]]  # Convert all colors

    correction = suggest_correction(dominant_color, secondary_colors)

    # Save processed data
    fabric_data = {
        "defect_image": image_path,
        "dominant_color": dominant_color,
        "secondary_colors": secondary_colors,
        "correction": correction
    }
    with open("fabric_data.json", "w") as file:
        json.dump(fabric_data, file, indent=4)

    return fabric_data

def apply_correction(image, target_color, output_path):
    """Apply the corrected color to defect areas in the image and save the result."""
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    _, mask = cv2.threshold(gray, 150, 255, cv2.THRESH_BINARY_INV)   
    corrected_image = image.copy()
    corrected_image[mask > 0] = target_color
    
    # Save corrected image
    cv2.imwrite(output_path, cv2.cvtColor(corrected_image, cv2.COLOR_RGB2BGR))
    print(output_path)
    return corrected_image, output_path

def visualize_correction(original_image_path, corrected_color):
    """Generate an image showing before and after correction and save corrected image."""
    original_image = cv2.imread(original_image_path)
    original_image = cv2.cvtColor(original_image, cv2.COLOR_BGR2RGB)

    # Generate corrected image path
    corrected_image_path = os.path.splitext(original_image_path)[0] + "_corrected.jpg"
    corrected_image, saved_path = apply_correction(original_image, corrected_color, corrected_image_path)

    # fig, axes = plt.subplots(1, 2, figsize=(15, 5))
    # axes[0].imshow(original_image)
    # axes[0].set_title("Original Image")
    # axes[0].axis("off")
   
    # axes[1].imshow(np.full_like(corrected_image, corrected_color, dtype=np.uint8))
    # axes[1].set_title("Corrected Image")
    # axes[1].axis("off")

    # Update JSON with corrected image path
    with open("fabric_data.json", "r+") as file:
        data = json.load(file)
        data["corrected_image"] = saved_path
        file.seek(0)
        json.dump(data, file, indent=4)
        file.truncate()
    return saved_path
    # plt.show()


# Load defect results
# with open("defect_results.json", "r") as file:
#     defect_data = json.load(file)

# image_path = defect_data["image_path"]
