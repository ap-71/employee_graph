from typing import Generic, List, TypeVar
from fastapi import HTTPException
from sqlalchemy.orm import Session


from .models import (
    Config,
    Department,
    Employee,
    Position,
    Project,
    employee_department,
    employee_position,
    employee_employee,
    employee_project,
)
from .schemas import (
    ConfigSchemaCreate,
    ConfigSchemaRead,
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
            raise HTTPException(
                status_code=404, detail=f"{self.__class__.__name__}:{obj_id}:Not found"
            )

        return obj

    def get_all(
        self, db: Session, skip: int = 0, limit: int | None = None
    ) -> list[MODEL]:
        if limit is None:
            return db.query(self.model).offset(skip).all()
        else:
            return db.query(self.model).offset(skip).limit(limit).all()

    def update(self, db: Session, obj_id: int, obj_in) -> MODEL:
        obj = self.get(db, obj_id)
        if not obj:
            raise HTTPException(
                status_code=404, detail=f"{self.__class__.__name__}:{obj_id}:Not found"
            )

        for field, value in obj_in.dict().items():
            if value is not None:
                setattr(obj, field, value)

        db.commit()
        db.refresh(obj)

        return obj

    def delete(self, db: Session, obj_id: int) -> None:
        obj = self.get(db, obj_id)
        if not obj:
            raise HTTPException(
                status_code=404, detail=f"{self.__class__.__name__}:{obj_id}:Not found"
            )
        db.delete(obj)
        db.commit()

    def get_count(self, db: Session) -> int:
        count_ = db.query(self.model).count()

        return count_

    def bind(self, db: Session, obj_id: int | str, bind_attr_name: str, bind_obj):
        obj = self.get(db, obj_id)
        bind_attr = getattr(obj, bind_attr_name)

        if getattr(bind_attr, "__len__") and bind_obj not in bind_attr:
            bind_attr.append(bind_obj)

            db.commit()
            db.refresh(obj)

            return getattr(obj, bind_attr_name)
        elif bind_obj in bind_attr:
            raise HTTPException(
                status_code=400, detail=f"{self.__class__.__name__}:{obj_id}:Duplicate"
            )
        else:
            raise HTTPException(
                status_code=404, detail=f"{self.__class__.__name__}:{obj_id}:Not found"
            )


class CRUDDepartment(CRUDBase[Department, DepartmentCreate, DepartmentRead]): ...


class CRUDEmployee(CRUDBase[Employee, EmployeeCreate, EmployeeRead]):
    def bind_employee(self, db: Session, uuid1: str, uuid2: str):
        db.execute(
            employee_employee.insert().values(
                employee1_uuid=uuid1, employee2_uuid=uuid2
            )
        )
        db.commit()

    def get(self, db: Session, obj_id: str) -> MODEL:
        obj = db.query(self.model).filter(self.model.uuid == obj_id).first()

        if obj is None:
            raise HTTPException(
                status_code=404, detail=f"{self.__class__.__name__}:{obj_id}:Not found"
            )

        return obj

    def get_bind_employee(self, db: Session, uuid: str | None = None):
        query_ = db.query(Employee).join(
            employee_employee, Employee.uuid == employee_employee.c.employee2_uuid
        )

        if uuid is not None:
            query_ = query_.filter(employee_employee.c.employee1_uuid == uuid)

        data = query_.all()

        return data

    def get_bind_department(self, db: Session, uuid: str | None = None):
        query_ = db.query(Department).join(
            employee_department, Department.id == employee_department.c.departments_id
        )

        if uuid is not None:
            query_ = query_.filter(employee_department.c.employee_uuid == uuid)

        data = query_.all()

        return data

    def get_bind_position(self, db: Session, uuid: str | None = None):
        query_ = db.query(Position).join(
            employee_position, Position.id == employee_position.c.position_id
        )

        if uuid is not None:
            query_ = query_.filter(employee_position.c.employee_uuid == uuid)

        data = query_.all()

        return data

    def get_bind_project(self, db: Session, uuid: str | None = None):
        query_ = db.query(Project).join(
            employee_project, Project.id == employee_project.c.project_id
        )

        if uuid is not None:
            query_ = query_.filter(employee_project.c.employee_uuid == uuid)

        data = query_.all()

        return data

    def delete_bind_department(self, db: Session, uuid: str, id: int):
        db.execute(
            employee_department.delete()
            .where(employee_department.c.employee_uuid == uuid)
            .where(employee_department.c.departments_id == id)
        )
        db.commit()

    def delete_bind_employee(self, db: Session, uuid1: str, uuid2: str):
        db.execute(
            employee_employee.delete()
            .where(employee_employee.c.employee1_uuid == uuid1)
            .where(employee_employee.c.employee2_uuid == uuid2)
        )
        db.commit()

    def delete_bind_position(self, db: Session, uuid: str, id: int):
        db.execute(
            employee_position.delete()
            .where(employee_position.c.employee_uuid == uuid)
            .where(employee_position.c.position_id == id)
        )
        db.commit()

    def delete_bind_project(self, db: Session, uuid: str, id: int):
        db.execute(
            employee_project.delete()
            .where(employee_project.c.employee_uuid == uuid)
            .where(employee_project.c.project_id == id)
        )
        db.commit()


class CRUDPosition(CRUDBase[Position, PositionCreate, PositionRead]): ...


class CRUDProject(CRUDBase[Project, ProjectCreate, ProjectRead]): ...


class CRUDConfig(CRUDBase[Config, ConfigSchemaCreate, ConfigSchemaRead]):
    def create(
        self, db: Session, name: str, key: str, value: str, user_id: int | None = None
    ) -> Config:
        obj = self.model(
            name=name,
            key=key,
            value=value,
            user_id=user_id if user_id is not None else -1,
        )

        db.add(obj)
        db.commit()
        db.refresh(obj)

        return obj

    def get(
        self, db: Session, name: str, key: str | None = None, user_id: int | None = None
    ) -> List[MODEL] | MODEL | None:
        filter_ = [self.model.name == name]
        is_list = True

        if user_id is not None:
            filter_.append(self.model.user_id == user_id)
        elif user_id is None:
            filter_.append(self.model.user_id == -1)

        if key is not None:
            is_list = False
            filter_.append(self.model.key == key)

        if not is_list:
            obj = db.query(self.model).filter(*filter_).first()
        else:
            obj = db.query(self.model).filter(*filter_).all()

        return obj

    def update(
        self, db: Session, name: str, key: str, value: str, user_id: int | None = None
    ):
        obj = self.get(db, name, key, user_id)

        if not obj:
            return self.create(
                db, name, key, value, user_id if user_id is not None else -1
            )

        if obj.value != str(value):
            obj.value = str(value)

            db.commit()
            db.refresh(obj)

            return obj


# ----------- CRUD объекты -----------

department_crud = CRUDDepartment()
employee_crud = CRUDEmployee()
position_crud = CRUDPosition()
project_crud = CRUDProject()
config_crud = CRUDConfig()
