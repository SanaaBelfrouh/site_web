from flask_cors import CORS
from flask import Flask, request, jsonify, render_template
import numpy as np
import tensorflow as tf
from keras.models import load_model
import cv2
import mediapipe as mp
import os

app = Flask(__name__)
CORS(app)
model_info = tf.keras.models.load_model(r"models\best_GRU_LSTM.h5", compile=False)
model_info.compile(run_eagerly=True)

# Load the signs as a dictionary
signs_info_dict = {
    0: 'agrandir',
    1: 'clavier',
    2: 'disque_dur',
    3: 'ecran',
    4: 'imprimante',
    5: 'ordinateur',
    6: 'ouvrir',
    7: 'reduire',
    8: 'souris',
    9: 'stop'
}

mp_holistic = mp.solutions.holistic

@app.route('/')
def home():
    return render_template('index.html')

# Flask route handler
@app.route('/upload_video', methods=['POST'])
def upload_video():
    # Check if a video has been submitted
    if 'video_file' not in request.files:
        return jsonify({'error': 'Aucune vidéo n\'a été soumise.'})
    
    # Retrieve the video file
    video_file = request.files['video_file']
    video_path = r"./pred/1.mp4"  # Adjust this path as needed
    video_file.save(video_path)
    
    # Make prediction
    output = prediction(video_path)
    
    # Return prediction result as JSON
    return jsonify({'prediction_text': output})


def prediction(video_path):
    # Prétraiter la vidéo
    keypoints_list = preprocess_video(video_path)
    # Vérifier si des keypoints ont été extraits
    if len(keypoints_list) == 0:
        return jsonify({'error': 'Aucun keypoints n\'a été extrait de la vidéo.'})
    # Convertir la liste de keypoints en tableau numpy
    sequence = [keypoints_list]
    final_features = np.array(sequence)
    # Vérifier la forme des features
    if final_features.shape != (1, 15, 138):
        return jsonify({'error': 'Les keypoints extraits ne sont pas dans le bon format.'})
    # Effectuer la prédiction
    prediction = model_info.predict(final_features)
    sign_index = np.argmax(prediction)
    print(signs_info_dict.get(sign_index, 'Unknown Sign'))
    return signs_info_dict.get(sign_index, 'Unknown Sign')


def preprocess_video(video_path):
    with mp_holistic.Holistic(min_detection_confidence=0.5, min_tracking_confidence=0.5) as holistic:
        keypoints_list = []
        cap = cv2.VideoCapture(video_path)
        num_frames = count_frames(video_path)
        save_frames = int(num_frames / 15)
        nbr, k = 0, 0
        while nbr < 15:
            ret, frame = cap.read()
            if not ret:
                keypoints_list.append(np.full(138, -1))
                nbr += 1
            else:
                image, results = mediapipe_detection(frame, holistic)
                if k % save_frames == save_frames - 1:
                    keypoints = extract_values(results)
                    keypoints_list.append(keypoints)
                    nbr += 1
                k += 1
    return keypoints_list

def count_frames(video_path):
    # Ouvrir la vidéo en utilisant OpenCV
    video = cv2.VideoCapture(video_path)
    # Obtenir le nombre total de frames dans la vidéo
    total_frames = int(video.get(cv2.CAP_PROP_FRAME_COUNT))
    # Fermer la vidéo
    video.release()
    return total_frames

def mediapipe_detection(image, model):
    image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)  # COLOR CONVERSION BGR 2 RGB
    image.flags.writeable = False  # Image is no longer writeable
    results = model.process(image)  # Make prediction
    image.flags.writeable = True  # Image is now writeable
    image = cv2.cvtColor(image, cv2.COLOR_RGB2BGR)  # COLOR COVERSION RGB 2 BGR
    return image, results

def extract_values(results):
    keypoints = []
    # Left, Right shoulder
    keypoints.extend([results.pose_landmarks.landmark[11].x if results.pose_landmarks else -1,
                      results.pose_landmarks.landmark[11].y if results.pose_landmarks else -1,
                      results.pose_landmarks.landmark[11].z if results.pose_landmarks else -1])
    keypoints.extend([results.pose_landmarks.landmark[12].x if results.pose_landmarks else -1,
                      results.pose_landmarks.landmark[12].y if results.pose_landmarks else -1,
                      results.pose_landmarks.landmark[12].z if results.pose_landmarks else -1])
    # Left, Right elbow
    keypoints.extend([results.pose_landmarks.landmark[13].x if results.pose_landmarks else -1,
                      results.pose_landmarks.landmark[13].y if results.pose_landmarks else -1,
                      results.pose_landmarks.landmark[13].z if results.pose_landmarks else -1])
    keypoints.extend([results.pose_landmarks.landmark[14].x if results.pose_landmarks else -1,
                      results.pose_landmarks.landmark[14].y if results.pose_landmarks else -1,
                      results.pose_landmarks.landmark[14].z if results.pose_landmarks else -1])
    
    # On a 21 land mark on chaque main et chaque landmark est représenté en 3d alors on a 21*3 valeurs
    lh = np.array([[res.x, res.y, res.z] for res in results.left_hand_landmarks.landmark]).flatten() if results.left_hand_landmarks else np.full(21*3, -1)
    rh = np.array([[res.x, res.y, res.z] for res in results.right_hand_landmarks.landmark]).flatten() if results.right_hand_landmarks else np.full(21*3, -1)
    # retourner les 3 listes concaténées
    # Number of keyPoints = 4+21*2 represented in 3d
    return np.concatenate([keypoints, lh, rh])

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=3000, debug=True)
