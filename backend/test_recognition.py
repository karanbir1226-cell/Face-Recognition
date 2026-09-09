import cv2
import numpy as np


MODEL_PATH = "models/face_model.yml"
MAPPING_PATH = "models/student_map.npy"


# Load trained model
recognizer = cv2.face.LBPHFaceRecognizer_create()
recognizer.read(MODEL_PATH)

# Load student mapping
student_map = np.load(
    MAPPING_PATH,
    allow_pickle=True
).item()


# Face detector
face_cascade = cv2.CascadeClassifier(
    cv2.data.haarcascades
    + "haarcascade_frontalface_default.xml"
)


# Start camera
cap = cv2.VideoCapture(0)

print("Recognition started.")
print("Press Q to stop.")


while True:

    ret, frame = cap.read()

    if not ret:
        print("Camera frame nahi mil raha.")
        break

    gray = cv2.cvtColor(
        frame,
        cv2.COLOR_BGR2GRAY
    )

    detected_faces = face_cascade.detectMultiScale(
        gray,
        scaleFactor=1.1,
        minNeighbors=5,
        minSize=(80, 80)
    )

    for (x, y, w, h) in detected_faces:

        face_crop = gray[
            y:y + h,
            x:x + w
        ]

        label, confidence = recognizer.predict(
            face_crop
        )

        if label in student_map:

            student = student_map[label]

            student_id = student["student_id"]
            name = student["name"]

            # LBPH confidence:
            # lower = better match
            if confidence < 70:

                text = f"{name} ({student_id})"

                cv2.rectangle(
                    frame,
                    (x, y),
                    (x + w, y + h),
                    (0, 255, 0),
                    2
                )

                cv2.putText(
                    frame,
                    text,
                    (x, y - 10),
                    cv2.FONT_HERSHEY_SIMPLEX,
                    0.7,
                    (0, 255, 0),
                    2
                )

                print(
                    f"Recognized: {name} | "
                    f"{student_id} | "
                    f"Confidence: {confidence:.2f}"
                )

            else:

                cv2.rectangle(
                    frame,
                    (x, y),
                    (x + w, y + h),
                    (0, 0, 255),
                    2
                )

                cv2.putText(
                    frame,
                    "Unknown Face",
                    (x, y - 10),
                    cv2.FONT_HERSHEY_SIMPLEX,
                    0.7,
                    (0, 0, 255),
                    2
                )

    cv2.imshow(
        "Face Recognition Test",
        frame
    )

    if cv2.waitKey(1) & 0xFF == ord("q"):
        break


cap.release()
cv2.destroyAllWindows()