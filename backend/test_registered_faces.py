import sqlite3
import base64
import numpy as np
import cv2

# Open database
conn = sqlite3.connect("attendance.db")

students = conn.execute(
    "SELECT student_id, name, face_image FROM students WHERE face_image IS NOT NULL"
).fetchall()

conn.close()

face_cascade = cv2.CascadeClassifier(
    cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
)

for student_id, name, face_image in students:

    # Remove base64 header
    if "," in face_image:
        face_image = face_image.split(",", 1)[1]

    # Decode image
    image_bytes = base64.b64decode(face_image)

    # Convert to OpenCV image
    image_array = np.frombuffer(image_bytes, dtype=np.uint8)
    image = cv2.imdecode(image_array, cv2.IMREAD_COLOR)

    if image is None:
        print(f"{student_id} - {name}: Image decode failed")
        continue

    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

    faces = face_cascade.detectMultiScale(
        gray,
        scaleFactor=1.1,
        minNeighbors=5,
        minSize=(80, 80)
    )

    print(
        f"{student_id} - {name}: "
        f"Image loaded | Faces detected: {len(faces)}"
    )

    # Show detected face
    for (x, y, w, h) in faces:
        cv2.rectangle(
            image,
            (x, y),
            (x + w, y + h),
            (0, 255, 0),
            2
        )

    cv2.imshow(f"{student_id} - {name}", image)

print("\nPress any key to close.")

cv2.waitKey(0)
cv2.destroyAllWindows()