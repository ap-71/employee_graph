from typing import List
from sqlalchemy import Boolean, ForeignKey, Integer, String, Table, Column, UniqueConstraint
from sqlalchemy.orm import DeclarativeBase, mapped_column, Mapped, relationship
from api.db import engine


class Base(DeclarativeBase):
    """Базовый класс для всех моделей"""

employee_department = Table(
    "employee_department",
    Base.metadata,
    Column("employee_uuid", ForeignKey("employees.uuid"), nullable=False),
    Column("departments_id", ForeignKey("departments.id"), nullable=False),
    UniqueConstraint(
        "employee_uuid", "departments_id", name="unique_employee_department"
    ),
)

employee_employee = Table(
    "employee_employee",
    Base.metadata,
    Column("employee1_uuid", ForeignKey("employees.uuid"), nullable=False),
    Column("employee2_uuid", ForeignKey("employees.uuid"), nullable=False),
    UniqueConstraint(
        "employee1_uuid", "employee2_uuid", name="unique_employee_employee"
    ),
)

employee_position = Table(
    "employee_position",
    Base.metadata,
    Column("employee_uuid", ForeignKey("employees.uuid"), nullable=False),
    Column("position_id", ForeignKey("positions.id"), nullable=False),
    UniqueConstraint("employee_uuid", "position_id", name="unique_employee_position"),
)

employee_project = Table(
    "employee_project",
    Base.metadata,
    Column("employee_uuid", ForeignKey("employees.uuid"), nullable=False),
    Column("project_id", ForeignKey("projects.id"), nullable=False),
    UniqueConstraint("employee_uuid", "project_id", name="unique_employee_project"),
)


class User(Base):
    __tablename__ = "users"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    username: Mapped[str] = mapped_column(unique=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(unique=True, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    
class Department(Base):
    __tablename__ = "departments"

    id = mapped_column(Integer, primary_key=True, index=True)
    name = mapped_column(String, nullable=True)
    description = mapped_column(String, nullable=True)

    employees: Mapped[List["Employee"]] = relationship(
        "Employee", secondary=employee_department, back_populates=__tablename__
    )


class Employee(Base):
    __tablename__ = "employees"

    uuid = mapped_column(String, primary_key=True, index=True)
    fio = mapped_column(String, nullable=False)

    departments: Mapped[List["Department"]] = relationship(
        "Department", secondary=employee_department, back_populates=__tablename__
    )
    positions: Mapped[List["Position"]] = relationship(
        "Position", secondary=employee_position, back_populates=__tablename__
    )
    projects: Mapped[List["Project"]] = relationship(
        "Project", secondary=employee_project, back_populates=__tablename__
    )


class Position(Base):
    __tablename__ = "positions"

    id = mapped_column(Integer, primary_key=True, index=True)
    value = mapped_column(String, nullable=False)
    description = mapped_column(String, nullable=True)

    employees: Mapped[List["Employee"]] = relationship(
        "Employee", secondary=employee_position, back_populates=__tablename__
    )


class Project(Base):
    __tablename__ = "projects"

    id = mapped_column(Integer, primary_key=True, index=True)
    value = mapped_column(String, nullable=False)
    description = mapped_column(String, nullable=True)

    employees: Mapped[List["Employee"]] = relationship(
        "Employee", secondary=employee_project, back_populates=__tablename__
    )
