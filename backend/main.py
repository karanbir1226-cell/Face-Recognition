from jose import JWTError, jwt
from datetime import datetime, timedelta
import random
import string
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel
from passlib.context import CryptContext

import base64
import os
import cv2
import numpy as np

from database import Base, engine, SessionLocal
import models
from schemas import StudentUpdate

# =========================================================
# CREATE DATABASE TABLES
# =========================================================

Base.metadata.create_all(bind=engine)


# =========================================================
# FASTAPI APP
# =========================================================

app = FastAPI()


# =========================================================
# CORS CONFIGURATION
# =========================================================

app.add_middleware(
    CORSMiddleware,
   allow_origins=[
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================================================
# DATABASE DEPENDENCY
# =========================================================

def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


# =========================================================
# PASSWORD HASHING
# =========================================================

pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto"
)
SECRET_KEY = "face-attendance-secret-key-2026"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/admin-login")
def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        user_id = payload.get("sub")

        if user_id is None:
            raise credentials_exception

    except JWTError:
        raise credentials_exception

    user = db.query(models.User).filter(
        models.User.id == int(user_id)
    ).first()

    if user is None:
        raise credentials_exception

    return user

def get_current_admin(
    current_user: models.User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )

    return current_user
def generate_class_code(db: Session):
    while True:
        code = "CLS-" + "".join(
            random.choices(string.ascii_uppercase + string.digits, k=6)
        )

        existing_class = db.query(models.ClassRoom).filter(
            models.ClassRoom.class_code == code
        ).first()

        if not existing_class:
            return code



@app.get("/auth/me")
def get_my_profile(current_user: models.User = Depends(get_current_admin)):
    return {
        "id": current_user.id,
        "username": current_user.username,
        "role": current_user.role
    }
   

def hash_password(password: str):
    return pwd_context.hash(password)


def verify_password(password: str, password_hash: str):
    return pwd_context.verify(password, password_hash)
def create_access_token(data: dict):
    to_encode = data.copy()

    expire = datetime.utcnow() + timedelta(
        minutes=ACCESS_TOKEN_EXPIRE_MINUTES
    )

    to_encode.update({"exp": expire})

    return jwt.encode(
        to_encode,
        SECRET_KEY,
        algorithm=ALGORITHM
    )
@app.get("/auth/student-me")
def get_student_profile(
    current_user: models.User = Depends(get_current_user)
):
    if current_user.role != "student":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Student access required"
        )

    return {
        "id": current_user.id,
        "username": current_user.username,
        "role": current_user.role,
        "student_id": current_user.student_id
    }

# =========================================================
# REQUEST SCHEMAS
# =========================================================

class StudentCreate(BaseModel):
    student_id: str
    name: str
    email: str
    phone: str | None = None
    course: str | None = None
    department: str | None = None
    semester: str | None = None
    status: str = "Active"


class FaceRegistration(BaseModel):
    face_image: str


class AdminLogin(BaseModel):
    username: str
    password: str
    
class ClassCreate(BaseModel):
    class_name: str

class JoinClassRequest(BaseModel):
    class_code: str
    
class StudentCreateAccount(BaseModel):
    username: str
    password: str
    student_id: str


class RecognitionRequest(BaseModel):
    image: str

@app.post("/classes/create")
def create_class(
    class_data: ClassCreate,
    current_admin: models.User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    class_code = generate_class_code(db)

    new_class = models.ClassRoom(
        class_name=class_data.class_name,
        class_code=class_code,
        admin_id=current_admin.id
    )

    db.add(new_class)
    db.commit()
    db.refresh(new_class)

    return {
        "message": "Class created successfully",
        "class": {
            "id": new_class.id,
            "class_name": new_class.class_name,
            "class_code": new_class.class_code,
            "admin_id": new_class.admin_id
        }
    }
@app.post("/classes/join")
def join_class(
    join_data: JoinClassRequest,
    current_student: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_student.role != "student":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Student access required"
        )

    class_room = db.query(models.ClassRoom).filter(
        models.ClassRoom.class_code == join_data.class_code
    ).first()

    if not class_room:
        raise HTTPException(
            status_code=404,
            detail="Invalid class code"
        )

    existing_join = db.query(models.ClassStudent).filter(
        models.ClassStudent.class_id == class_room.id,
        models.ClassStudent.student_id == current_student.student_id
    ).first()

    if existing_join:
        raise HTTPException(
            status_code=400,
            detail="Student already joined this class"
        )

    class_student = models.ClassStudent(
        class_id=class_room.id,
        student_id=current_student.student_id
    )

    db.add(class_student)
    db.commit()
    db.refresh(class_student)

    return {
        "message": "Class joined successfully",
        "class": {
            "id": class_room.id,
            "class_name": class_room.class_name,
            "class_code": class_room.class_code
        },
        "student_id": current_student.student_id
    }

@app.get("/classes/my-classes")
def get_my_classes(
    current_student: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_student.role != "student":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Student access required"
        )

    joined_classes = (
        db.query(models.ClassRoom)
        .join(
            models.ClassStudent,
            models.ClassRoom.id == models.ClassStudent.class_id
        )
        .filter(
            models.ClassStudent.student_id == current_student.student_id
        )
        .all()
    )

    return {
        "student_id": current_student.student_id,
        "classes": [
            {
                "id": class_room.id,
                "class_name": class_room.class_name,
                "class_code": class_room.class_code
            }
            for class_room in joined_classes
        ]
    }

@app.get("/attendance/my-attendance")
def get_my_attendance(
    current_student: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_student.role != "student":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Student access required"
        )

    attendance_records = (
        db.query(models.Attendance)
        .filter(
            models.Attendance.student_id == current_student.student_id
        )
        .order_by(
            models.Attendance.date.desc(),
            models.Attendance.time.desc()
        )
        .all()
    )

    return {
        "student_id": current_student.student_id,
        "attendance": [
            {
                "id": record.id,
                "name": record.name,
                "date": record.date,
                "time": record.time,
                "status": record.status
            }
            for record in attendance_records
        ]
    }
    
@app.get("/attendance/my-summary")
def get_my_attendance_summary(
    current_student: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_student.role != "student":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Student access required"
        )

    records = db.query(models.Attendance).filter(
        models.Attendance.student_id == current_student.student_id
    ).all()

    total = len(records)
    present = sum(
        1 for record in records
        if record.status.lower() == "present"
    )
    absent = sum(
        1 for record in records
        if record.status.lower() == "absent"
    )

    percentage = (present / total * 100) if total > 0 else 0

    return {
        "student_id": current_student.student_id,
        "total_classes": total,
        "present": present,
        "absent": absent,
        "attendance_percentage": round(percentage, 2)
    }
    
                
# =========================================================
# ADMIN AUTHENTICATION
# =========================================================

@app.post("/auth/create-admin")
def create_admin(db: Session = Depends(get_db)):

    existing_admin = (
        db.query(models.User)
        .filter(
            models.User.username == "admin"
        )
        .first()
    )

    if existing_admin:
        return {
            "message": "Admin account already exists"
        }

    admin = models.User(
        username="admin",
        password_hash=hash_password("Admin@123"),
        role="admin",
        student_id=None
    )

    db.add(admin)
    db.commit()
    db.refresh(admin)

    return {
        "message": "Admin account created successfully",
        "username": "admin"
    }
@app.post("/auth/admin-login")
def admin_login(login: AdminLogin, db: Session = Depends(get_db)):
    admin = (
        db.query(models.User)
        .filter(
            models.User.username == login.username,
            models.User.role == "admin"
        )
        .first()
    )

    if not admin:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password"
        )

    if not verify_password(login.password, admin.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password"
        )

    token = create_access_token(
        data={
            "sub": str(admin.id),
            "username": admin.username,
            "role": admin.role
        }
    )

    return {
        "message": "Admin login successful",
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": admin.id,
            "username": admin.username,
            "role": admin.role
        }
    }
@app.post("/auth/create-student-account")
def create_student_account(
    account: StudentCreateAccount,
    db: Session = Depends(get_db)
):
    student = db.query(models.Student).filter(
        models.Student.student_id == account.student_id
    ).first()

    if not student:
        raise HTTPException(
            status_code=404,
            detail="Student not found"
        )

    existing_user = db.query(models.User).filter(
        models.User.username == account.username
    ).first()

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Username already exists"
        )

    existing_student_account = db.query(models.User).filter(
        models.User.student_id == account.student_id
    ).first()

    if existing_student_account:
        raise HTTPException(
            status_code=400,
            detail="Student account already exists"
        )

    user = models.User(
        username=account.username,
        password_hash=hash_password(account.password),
        role="student",
        student_id=account.student_id
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return {
        "message": "Student account created successfully",
        "username": user.username,
        "student_id": user.student_id,
        "role": user.role
    }
@app.post("/auth/student-login")
def student_login(
    login: AdminLogin,
    db: Session = Depends(get_db)
):
    student_user = (
        db.query(models.User)
        .filter(
            models.User.username == login.username,
            models.User.role == "student"
        )
        .first()
    )

    if not student_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password"
        )

    if not verify_password(
        login.password,
        student_user.password_hash
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password"
        )

    token = create_access_token(
        data={
            "sub": str(student_user.id),
            "username": student_user.username,
            "role": student_user.role,
            "student_id": student_user.student_id
        }
    )

    return {
        "message": "Student login successful",
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": student_user.id,
            "username": student_user.username,
            "role": student_user.role,
            "student_id": student_user.student_id
        }
    }


# =========================================================
# HOME
# =========================================================

@app.get("/")
def home():
    return {
        "message": "Face Recognition Attendance API is running"
    }


# =========================================================
# GET ALL STUDENTS
# =========================================================

@app.get("/students/")
def get_students(
    current_admin: models.User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):

    students = db.query(models.Student).all()

    return [
        {
            "id": student.id,
            "student_id": student.student_id,
            "name": student.name,
            "email": student.email,
            "phone": student.phone,
            "course": student.course,
            "department": student.department,
            "semester": student.semester,
            "status": student.status,
        }
        for student in students
    ]


# =========================================================
# GET SINGLE STUDENT
# =========================================================

@app.get("/students/{student_id}")
def get_student(
    student_id: str,
    current_admin: models.User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):

    student = (
        db.query(models.Student)
        .filter(
            models.Student.student_id == student_id
        )
        .first()
    )

    if not student:
        raise HTTPException(
            status_code=404,
            detail="Student not found"
        )

    return {
        "id": student.id,
        "student_id": student.student_id,
        "name": student.name,
        "email": student.email,
        "phone": student.phone,
        "course": student.course,
        "department": student.department,
        "semester": student.semester,
        "status": student.status,
    }


# =========================================================
# CREATE STUDENT
# =========================================================

@app.post("/students/")
def create_student(
    student: StudentCreate,
    current_admin: models.User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):

    existing_student = (
        db.query(models.Student)
        .filter(
            models.Student.student_id == student.student_id
        )
        .first()
    )

    if existing_student:
        raise HTTPException(
            status_code=400,
            detail="Student ID already exists"
        )

    new_student = models.Student(
        student_id=student.student_id,
        name=student.name,
        email=student.email,
        phone=student.phone,
        course=student.course,
        department=student.department,
        semester=student.semester,
        status=student.status,
    )

    db.add(new_student)
    db.commit()
    db.refresh(new_student)

    return {
        "id": new_student.id,
        "student_id": new_student.student_id,
        "name": new_student.name,
        "email": new_student.email,
        "phone": new_student.phone,
        "course": new_student.course,
        "department": new_student.department,
        "semester": new_student.semester,
        "status": new_student.status,
    }


# =========================================================
# UPDATE STUDENT
# =========================================================

@app.put("/students/{student_id}")
def update_student(
    student_id: str,
    student: StudentUpdate,
    current_admin: models.User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):

    existing_student = (
        db.query(models.Student)
        .filter(
            models.Student.student_id == student_id
        )
        .first()
    )

    if not existing_student:
        raise HTTPException(
            status_code=404,
            detail="Student not found"
        )

    existing_student.name = student.name
    existing_student.email = student.email
    existing_student.phone = student.phone
    existing_student.course = student.course
    existing_student.department = student.department
    existing_student.semester = student.semester
    existing_student.status = student.status

    db.commit()
    db.refresh(existing_student)

    return {
        "id": existing_student.id,
        "student_id": existing_student.student_id,
        "name": existing_student.name,
        "email": existing_student.email,
        "phone": existing_student.phone,
        "course": existing_student.course,
        "department": existing_student.department,
        "semester": existing_student.semester,
        "status": existing_student.status,
    }


# =========================================================
# FACE REGISTRATION
# =========================================================

@app.put("/students/{student_id}/face")
def register_face(
    student_id: str,
    face: FaceRegistration,
    db: Session = Depends(get_db)
):

    student = (
        db.query(models.Student)
        .filter(
            models.Student.student_id == student_id
        )
        .first()
    )

    if not student:
        raise HTTPException(
            status_code=404,
            detail="Student not found"
        )

    # Save face image
    student.face_image = face.face_image

    db.commit()
    db.refresh(student)

    # =====================================================
    # AUTOMATIC MODEL TRAINING
    # =====================================================

    try:

        import subprocess
        import sys

        train_script = os.path.join(
            os.path.dirname(__file__),
            "train_model.py"
        )

        subprocess.run(
            [sys.executable, train_script],
            check=True
        )

        load_recognition_model()

        model_message = (
            "Face registered and model retrained successfully"
        )

    except Exception as error:

        print(
            "Model training error:",
            error
        )

        model_message = (
            "Face registered, but model retraining failed"
        )

    return {
        "message": "Face registered successfully",
        "student_id": student.student_id,
        "model": model_message
    }


# =========================================================
# MARK ATTENDANCE
# =========================================================

@app.post("/attendance/")
def mark_attendance(
    student_id: str,
    db: Session = Depends(get_db)
):

    # Find student
    student = (
        db.query(models.Student)
        .filter(
            models.Student.student_id == student_id
        )
        .first()
    )

    if not student:
        raise HTTPException(
            status_code=404,
            detail="Student not found"
        )

    # Current date and time
    now = datetime.now()

    current_date = now.strftime("%Y-%m-%d")
    current_time = now.strftime("%H:%M:%S")

    # Check duplicate attendance
    existing_attendance = (
        db.query(models.Attendance)
        .filter(
            models.Attendance.student_id == student_id,
            models.Attendance.date == current_date
        )
        .first()
    )

    if existing_attendance:

        return {
            "message": "Attendance already marked",
            "student_id": student.student_id,
            "name": student.name,
            "date": existing_attendance.date,
            "time": existing_attendance.time,
            "status": existing_attendance.status
        }

    # New attendance
    attendance = models.Attendance(
        student_id=student.student_id,
        name=student.name,
        date=current_date,
        time=current_time,
        status="Present"
    )

    db.add(attendance)
    db.commit()
    db.refresh(attendance)

    return {
        "message": "Attendance marked successfully",
        "student_id": student.student_id,
        "name": student.name,
        "date": current_date,
        "time": current_time,
        "status": "Present"
    }


# =========================================================
# FACE RECOGNITION MODEL
# =========================================================

MODEL_PATH = "models/face_model.yml"
MAPPING_PATH = "models/student_map.npy"

recognizer = None
student_map = {}

face_cascade = cv2.CascadeClassifier(
    cv2.data.haarcascades
    + "haarcascade_frontalface_default.xml"
)


def load_recognition_model():

    global recognizer
    global student_map

    if not os.path.exists(MODEL_PATH):
        return False

    if not os.path.exists(MAPPING_PATH):
        return False

    recognizer = cv2.face.LBPHFaceRecognizer_create()

    recognizer.read(MODEL_PATH)

    student_map = np.load(
        MAPPING_PATH,
        allow_pickle=True
    ).item()

    return True


load_recognition_model()


# =========================================================
# FACE RECOGNITION
# =========================================================

@app.post("/recognize/")
def recognize_face(
    request: RecognitionRequest,
    db: Session = Depends(get_db)
):

    if recognizer is None:

        raise HTTPException(
            status_code=500,
            detail="Recognition model not loaded"
        )

    try:

        image_data = request.image

        if "," in image_data:
            image_data = image_data.split(
                ",",
                1
            )[1]

        image_bytes = base64.b64decode(
            image_data
        )

        image_array = np.frombuffer(
            image_bytes,
            dtype=np.uint8
        )

        image = cv2.imdecode(
            image_array,
            cv2.IMREAD_COLOR
        )

        if image is None:

            raise HTTPException(
                status_code=400,
                detail="Invalid image"
            )

        gray = cv2.cvtColor(
            image,
            cv2.COLOR_BGR2GRAY
        )

        detected_faces = face_cascade.detectMultiScale(
            gray,
            scaleFactor=1.1,
            minNeighbors=5,
            minSize=(80, 80)
        )

        if len(detected_faces) == 0:

            return {
                "recognized": False,
                "message": "No face detected"
            }

        x, y, w, h = detected_faces[0]

        face_crop = gray[
            y:y + h,
            x:x + w
        ]

        label, confidence = recognizer.predict(
            face_crop
        )

        # Lower confidence value = better match
        if confidence >= 45:

            return {
                "recognized": False,
                "message": "Unknown face",
                "confidence": round(
                    float(confidence),
                    2
                )
            }

        if label not in student_map:

            return {
                "recognized": False,
                "message": "Student not found"
            }

        student_data = student_map[label]

        student_id = student_data["student_id"]

        student = (
            db.query(models.Student)
            .filter(
                models.Student.student_id == student_id
            )
            .first()
        )

        if not student:

            return {
                "recognized": False,
                "message": "Student not found"
            }

        # =================================================
        # AUTOMATIC ATTENDANCE
        # =================================================

        now = datetime.now()

        current_date = now.strftime(
            "%Y-%m-%d"
        )

        current_time = now.strftime(
            "%H:%M:%S"
        )

        existing_attendance = (
            db.query(models.Attendance)
            .filter(
                models.Attendance.student_id == student_id,
                models.Attendance.date == current_date
            )
            .first()
        )

        if existing_attendance:

            return {
                "recognized": True,
                "message": "Attendance already marked",
                "student_id": student.student_id,
                "name": student.name,
                "date": existing_attendance.date,
                "time": existing_attendance.time,
                "status": existing_attendance.status,
                "confidence": round(
                    float(confidence),
                    2
                )
            }

        attendance = models.Attendance(
            student_id=student.student_id,
            name=student.name,
            date=current_date,
            time=current_time,
            status="Present"
        )

        db.add(attendance)
        db.commit()
        db.refresh(attendance)

        return {
            "recognized": True,
            "message": "Attendance marked successfully",
            "student_id": student.student_id,
            "name": student.name,
            "date": current_date,
            "time": current_time,
            "status": "Present",
            "confidence": round(
                float(confidence),
                2
            )
        }

    except Exception as error:

        print(
            "Recognition error:",
            error
        )

        raise HTTPException(
            status_code=500,
            detail="Face recognition failed"
        )


# =========================================================
# GET ATTENDANCE
# =========================================================

@app.get("/attendance/")
def get_attendance(
    db: Session = Depends(get_db)
):

    attendance_records = (
        db.query(models.Attendance)
        .order_by(
            models.Attendance.date.desc(),
            models.Attendance.time.desc()
        )
        .all()
    )

    return [
        {
            "id": record.id,
            "student_id": record.student_id,
            "name": record.name,
            "date": record.date,
            "time": record.time,
            "status": record.status,
        }
        for record in attendance_records
    ]