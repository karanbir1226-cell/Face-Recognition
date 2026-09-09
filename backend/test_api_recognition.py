import cv2
import base64
import json
import urllib.request

API_URL = "http://127.0.0.1:8000/recognize/"

cap = cv2.VideoCapture(0)

if not cap.isOpened():
    print("Camera open nahi ho raha.")
    exit()

print("Camera started.")
print("Face ko camera ke saamne rakho.")
print("SPACE = Capture & Recognize")
print("Q = Quit")

try:
    while True:
        ret, frame = cap.read()

        if not ret:
            print("Camera frame nahi mil raha.")
            break

        cv2.imshow("Face Recognition API Test", frame)

        key = cv2.waitKey(1) & 0xFF

        # Capture
        if key == ord(" "):
            success, buffer = cv2.imencode(".jpg", frame)

            if not success:
                print("Image capture failed.")
                break

            image_base64 = base64.b64encode(
                buffer
            ).decode("utf-8")

            payload = json.dumps({
                "image": image_base64
            }).encode("utf-8")

            request = urllib.request.Request(
                API_URL,
                data=payload,
                headers={
                    "Content-Type": "application/json"
                },
                method="POST"
            )

            print("\nSending image to /recognize/ ...")

            try:
                with urllib.request.urlopen(request) as response:
                    result = response.read().decode("utf-8")

                print("\n========== API RESPONSE ==========")
                print(result)
                print("==================================")

            except Exception as error:
                print("\nAPI Error:", error)

            break

        # Quit
        if key == ord("q"):
            print("Test cancelled.")
            break

finally:
    cap.release()
    cv2.destroyAllWindows()

print("\nCamera closed.")