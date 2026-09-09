from sqlalchemy import Column, Integer, String
from database import Base


class Student(Base):
    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True)

    student_id = Column(
        String,
        unique=True,
        index=True,
        nullable=False
    )

    name = Column(
        String,
        nullable=False
    )

    email = Column(
        String,
        nullable=False
    )

    phone = Column(
        String,
        nullable=True
    )

    course = Column(
        String,
        nullable=True
    )

    department = Column(
        String,
        nullable=True
    )

    semester = Column(
        String,
        nullable=True
    )

    status = Column(
        String,
        default="Active"
    )

    face_image = Column(
        String,
        nullable=True
    )


class Attendance(Base):
    __tablename__ = "attendance"

    id = Column(Integer, primary_key=True, index=True)

    student_id = Column(
        String,
        nullable=False
    )

    name = Column(
        String,
        nullable=False
    )

    date = Column(
        String,
        nullable=False
    )

    time = Column(
        String,
        nullable=False
    )

    status = Column(
        String,
        default="Present"
    )


class User(Base):
    __tablename__ = "users"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    username = Column(
        String,
        unique=True,
        index=True,
        nullable=False
    )

    password_hash = Column(
        String,
        nullable=False
    )

    role = Column(
        String,
        nullable=False
    )

    student_id = Column(
        String,
        nullable=True
    )


class ClassRoom(Base):
    __tablename__ = "classes"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    class_name = Column(
        String,
        nullable=False
    )

    class_code = Column(
        String,
        unique=True,
        index=True,
        nullable=False
    )

    admin_id = Column(
        Integer,
        nullable=False
    )


class ClassStudent(Base):
    __tablename__ = "class_students"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    class_id = Column(
        Integer,
        nullable=False
    )

    student_id = Column(
        String,
        nullable=False
    )