from typing import Generic, TypeVar
from fastapi import HTTPException
from sqlalchemy.orm import Session

from .models import Department, Employee, Position, Project
from .schemas import (
    DepartmentCreate,
    DepartmentRead,
    EmployeeCreate,
    EmployeeRead,
    PositionCreate,
    PositionRead,
    ProjectCreate,
    ProjectRead,
)

MODEL = TypeVar("MODEL")
SCHEMA_CREATE = TypeVar("SCHEMA_CREATE")
SCHEMA_READ = TypeVar("SCHEMA_READ")
class DublicateException(Exception): ...

class CRUDBase(Generic[MODEL, SCHEMA_CREATE, SCHEMA_READ]):
    def __init__(self):
        self.model: MODEL = self.__orig_bases__[0].__args__[0]
        self.schema_create: SCHEMA_CREATE = self.__orig_bases__[0].__args__[1]
        self.schema_read: SCHEMA_READ = self.__orig_bases__[0].__args__[2]

    def create(self, db: Session, obj_in) -> MODEL:
        obj = self.model(**obj_in.dict())
        db.add(obj)
        db.commit()
        db.refresh(obj)
        return obj

    def get(self, db: Session, obj_id: int) -> MODEL:
        obj = db.query(self.model).filter(self.model.id == obj_id).first()

        if obj is None:
            raise HTTPException(status_code=404, detail=f"{self.__class__.__name__}:{obj_id}:Not found")

        return obj

    def get_all(self, db: Session, skip=0, limit=100) -> list[MODEL]:
        return db.query(self.model).offset(skip).limit(limit).all()

    def update(self, db: Session, obj_id: int, obj_in) -> MODEL:
        obj = self.get(db, obj_id)
        if not obj:
            raise HTTPException(status_code=404, detail=f"{self.__class__.__name__}:{obj_id}:Not found")

        for field, value in obj_in.dict().items():
            setattr(obj, field, value)

        db.commit()
        db.refresh(obj)

        return obj

    def delete(self, db: Session, obj_id: int) -> None:
        obj = self.get(db, obj_id)
        if not obj:
            raise HTTPException(status_code=404, detail=f"{self.__class__.__name__}:{obj_id}:Not found")
        db.delete(obj)
        db.commit()

    def bind(self, db: Session, obj_id: int | str, bind_attr_name: str, bind_obj):
        obj = self.get(db, obj_id)
        bind_attr = getattr(obj, bind_attr_name)
        
        if getattr(bind_attr, "__len__") and bind_obj not in bind_attr:
            bind_attr.append(bind_obj)

            db.commit()
            db.refresh(obj)

            return getattr(obj, bind_attr_name)
        elif bind_obj in bind_attr:
            raise HTTPException(status_code=400, detail=f"{self.__class__.__name__}:{obj_id}:Duplicate")
        else:
            raise HTTPException(status_code=404, detail=f"{self.__class__.__name__}:{obj_id}:Not found")
            

class CRUDDepartment(CRUDBase[Department, DepartmentCreate, DepartmentRead]): ...


class CRUDEmployee(CRUDBase[Employee, EmployeeCreate, EmployeeRead]):
    def get(self, db: Session, obj_id: str) -> MODEL:
        obj = db.query(self.model).filter(self.model.uuid == obj_id).first()

        if obj is None:
            raise HTTPException(status_code=404, detail=f"{self.__class__.__name__}:{obj_id}:Not found")

        return obj


class CRUDPosition(CRUDBase[Position, PositionCreate, PositionRead]): ...


class CRUDProject(CRUDBase[Project, ProjectCreate, ProjectRead]): ...


# ----------- CRUD объекты -----------

department_crud = CRUDDepartment()
employee_crud = CRUDEmployee()
# employee_department_crud = CRUDBase(EmployeeDepartment, EmployeeDepartmentCreate, EmployeeDepartmentRead)
# employee_employee_crud = CRUDBase(EmployeeEmployee, EmployeeEmployeeCreate, EmployeeEmployeeRead)
position_crud = CRUDPosition()
# employee_position_crud = CRUDBase(EmployeePosition, EmployeePositionCreate, EmployeePositionRead)
project_crud = CRUDProject()
# employee_project_crud = CRUDBase(EmployeeProject, EmployeeProjectCreate, EmployeeProjectRead)
