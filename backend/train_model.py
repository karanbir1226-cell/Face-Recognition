import sqlite3
import base64
import os
import json

import cv2
import numpy as np


# =========================
# MODEL PATHS
# =========================

MODEL_DIR = "models"

MODEL_PATH = os.path.join(
    MODEL_DIR,
    "face_model.yml"
)

MAPPING_PATH = os.path.join(
    MODEL_DIR,
    "student_map.npy"
)

os.makedirs(
    MODEL_DIR,
    exist_ok=True
)


# =========================
# LOAD STUDENTS FROM DATABASE
# =========================

conn = sqlite3.connect(
    "attendance.db"
)

students = conn.execute(
    """
    SELECT student_id, name, face_image
    FROM students
    WHERE face_image IS NOT NULL
    """
).fetchall()

conn.close()


if not students:
    print("No registered faces found.")
    exit(1)


# =========================
# FACE DETECTOR
# =========================

face_cascade = cv2.CascadeClassifier(
    cv2.data.haarcascades
    + "haarcascade_frontalface_default.xml"
)


# =========================
# TRAINING DATA
# =========================

faces = []
labels = []

student_map = {}


# =========================
# PROCESS STUDENTS
# =========================

for label, (
    student_id,
    name,
    face_image
) in enumerate(students):

    # Student mapping
    student_map[label] = {
        "student_id": student_id,
        "name": name,
    }

    # =================================
    # SUPPORT SINGLE + MULTIPLE IMAGES
    # =================================

    try:
        # New format:
        # ["base64_image_1", "base64_image_2", ...]

        if face_image.strip().startswith("["):
            face_images = json.loads(face_image)

        else:
            # Old format:
            # "base64_image"
            face_images = [face_image]

    except Exception as error:
        print(
            f"Could not read face data for {student_id}: {error}"
        )
        continue


    # =========================
    # PROCESS EACH FACE IMAGE
    # =========================

    student_faces_added = 0

    for image_number, image_data in enumerate(face_images, start=1):

        if not image_data:
            continue

        # Remove Base64 header
        if "," in image_data:
            image_data = image_data.split(
                ",",
                1
            )[1]

        try:
            # Base64 decode
            image_bytes = base64.b64decode(
                image_data
            )

            # Convert to NumPy
            image_array = np.frombuffer(
                image_bytes,
                dtype=np.uint8
            )

            # Decode image
            image = cv2.imdecode(
                image_array,
                cv2.IMREAD_COLOR
            )

        except Exception as error:
            print(
                f"Could not decode image {image_number} "
                f"for {student_id}: {error}"
            )
            continue


        if image is None:
            print(
                f"Could not load image {image_number} "
                f"for {student_id}"
            )
            continue


        # =========================
        # GRAYSCALE
        # =========================

        gray = cv2.cvtColor(
            image,
            cv2.COLOR_BGR2GRAY
        )


        # =========================
        # DETECT FACE
        # =========================

        detected_faces = face_cascade.detectMultiScale(
            gray,
            scaleFactor=1.1,
            minNeighbors=5,
            minSize=(80, 80)
        )


        if len(detected_faces) == 0:
            print(
                f"No face detected in image {image_number} "
                f"for {student_id}"
            )
            continue


        # =========================
        # FIRST DETECTED FACE
        # =========================

        x, y, w, h = detected_faces[0]

        face_crop = gray[
            y:y + h,
            x:x + w
        ]


        # =========================
        # ADD TRAINING SAMPLE
        # =========================

        faces.append(face_crop)
        labels.append(label)

        student_faces_added += 1


    print(
        f"Added: {student_id} - {name} "
        f"({student_faces_added}/{len(face_images)} samples)"
    )


# =========================
# CHECK TRAINING DATA
# =========================

if not faces:
    print()
    print("No usable face images found.")
    exit(1)


# =========================
# TRAIN LBPH MODEL
# =========================

recognizer = cv2.face.LBPHFaceRecognizer_create()

recognizer.train(
    faces,
    np.array(labels)
)


# =========================
# SAVE MODEL
# =========================

recognizer.write(
    MODEL_PATH
)


# =========================
# SAVE STUDENT MAPPING
# =========================

np.save(
    MAPPING_PATH,
    student_map
)


# =========================
# SUCCESS
# =========================

print()
print("================================")
print("Face model trained successfully")
print("================================")
print(
    f"Model: {MODEL_PATH}"
)
print(
    f"Total training samples: {len(faces)}"
)
print(
    f"Students: {len(student_map)}"
)
print(
    f"Mapping: {MAPPING_PATH}"
)