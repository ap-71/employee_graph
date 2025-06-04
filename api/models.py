from typing import List
from sqlalchemy import (
    Boolean,
    ForeignKey,
    Integer,
    String,
    Table,
    Column,
    UniqueConstraint,
    DateTime,
    func,
)
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

section_node = Table(
    "section_node",
    Base.metadata,
    Column("section_id", ForeignKey("sections.id"), nullable=False),
    Column("node_id", ForeignKey("nodes.id"), nullable=False),
    UniqueConstraint("section_id", "node_id", name="unique_section_node"),
)

node_node = Table(
    "node_node",
    Base.metadata,
    Column("node1_id", ForeignKey("nodes.id"), nullable=False),
    Column("node2_id", ForeignKey("nodes.id"), nullable=False),
    Column("user_id", ForeignKey("users.id"), nullable=True),
    UniqueConstraint("node1_id", "node2_id", name="unique_node_node"),
)


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    username: Mapped[str] = mapped_column(unique=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(unique=True, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    dt_create: Mapped[DateTime] = mapped_column(DateTime, default=func.now(), nullable=True)

    sections: Mapped[List["Section"]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )
    node_types: Mapped[List["NodeType"]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )

    nodes: Mapped[List["Node"]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )


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


class Config(Base):
    __tablename__ = "config"

    id = mapped_column(Integer, primary_key=True, index=True)
    name = mapped_column(String, nullable=False)
    description = mapped_column(String, nullable=True)
    key = mapped_column(String, nullable=False)
    value = mapped_column(String, nullable=False)
    is_active = mapped_column(Boolean, default=True, nullable=False)
    user_id = mapped_column(Integer)
    dt_create = mapped_column(DateTime, default=func.now(), nullable=False)


class Section(Base):
    __tablename__ = "sections"

    id = mapped_column(Integer, primary_key=True, index=True)
    name = mapped_column(String, nullable=False)
    description = mapped_column(String, nullable=True)
    dt_create = mapped_column(DateTime, default=func.now(), nullable=False)

    user_id = mapped_column(Integer, ForeignKey("users.id"), nullable=True)
    user: Mapped[User] = relationship("User", back_populates="sections")

    nodes: Mapped[List["Node"]] = relationship(
        secondary=section_node, back_populates="section"
    )
    node_types: Mapped[List["NodeType"]] = relationship(
        "NodeType", back_populates="section", cascade="all, delete-orphan"
    )


class NodeType(Base):
    __tablename__ = "node_types"

    id = mapped_column(Integer, primary_key=True, index=True)
    name = mapped_column(String, nullable=False)
    description = mapped_column(String, nullable=True)
    dt_create = mapped_column(DateTime, default=func.now(), nullable=False)
    section_id = mapped_column(Integer, ForeignKey("sections.id"), nullable=False)
    user_id = mapped_column(Integer, ForeignKey("users.id"), nullable=True)
    user: Mapped[User] = relationship("User", back_populates="node_types")
    nodes: Mapped[List["Node"]] = relationship(
        back_populates="type", cascade="all, delete-orphan"
    )
    section: Mapped[Section] = relationship(
        "Section", back_populates="node_types"
    )


class Node(Base):
    __tablename__ = "nodes"

    id = mapped_column(Integer, primary_key=True, index=True)
    name = mapped_column(String, nullable=False)
    description = mapped_column(String, nullable=True)
    type_id = mapped_column(Integer, ForeignKey("node_types.id"), nullable=False)
    dt_create = mapped_column(DateTime, default=func.now(), nullable=False)

    user_id = mapped_column(Integer, ForeignKey("users.id"), nullable=True)
    user: Mapped[User] = relationship("User", back_populates="nodes")

    section: Mapped[Section] = relationship(
        "Section", secondary=section_node, back_populates="nodes"
    )
    type: Mapped[NodeType] = relationship("NodeType", back_populates="nodes")
