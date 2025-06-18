from typing import Generic, List, TypeVar
from fastapi import HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import and_, delete, or_

from api.routes_helpers import RequestContext


from .models import (
    Config,
    Department,
    Employee,
    Node,
    NodeType,
    Position,
    Project,
    Section,
    employee_department,
    employee_position,
    employee_employee,
    employee_project,
    node_node,
)
from .schemas import (
    ConfigSchemaCreate,
    ConfigSchemaRead,
    DepartmentCreate,
    DepartmentRead,
    EmployeeCreate,
    EmployeeRead,
    NodeCreate,
    NodeLink,
    NodeRead,
    NodeTypeCreate,
    NodeTypeRead,
    PositionCreate,
    PositionRead,
    ProjectCreate,
    ProjectRead,
    SectionCreate,
    SectionRead,
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


class CRUDSection(CRUDBase[Section, SectionCreate, SectionRead]):
    def create(self, db: Session, obj_in: SectionCreate) -> MODEL:
        current = (
            db.query(self.model)
            .filter(
                self.model.name == obj_in.name, self.model.user_id == obj_in.user_id
            )
            .first()
        )

        if current:
            raise HTTPException(
                status_code=400,
                detail=f"Раздел с именем '{obj_in.name}' уже существует для пользователя {obj_in.user_id}.",
            )

        obj = self.model(**obj_in.model_dump())

        db.add(obj)
        db.commit()
        db.refresh(obj)

        return obj

    def get_by_name(self, db: Session, name: str) -> MODEL | None:
        return db.query(self.model).filter(self.model.name == name).first()

    def get_by_user_id(self, db: Session, user_id: int) -> List[MODEL]:
        return db.query(self.model).filter(self.model.user_id == user_id).all()


class CRUDNodeType(CRUDBase[NodeType, NodeTypeCreate, NodeTypeRead]):
    def get_by_name(self, db: Session, name: str) -> MODEL | None:
        return db.query(self.model).filter(self.model.name == name).first()

    def get_by_user_id(self, db: Session, user_id: int) -> List[MODEL]:
        return db.query(self.model).filter(self.model.user_id == user_id).all()

    def get_by_section_id(self, db: Session, section_id: int) -> List[MODEL]:
        return db.query(self.model).filter(self.model.section_id == section_id).all()


class CRUDNode(CRUDBase[Node, NodeCreate, NodeRead]):
    def create(self, db: Session, obj_in) -> MODEL:
        section_id = obj_in.section_id

        section = db.query(Section).filter(Section.id == section_id).first()
        exists_node = (
            db.query(Node)
            .filter(
                Node.name == obj_in.name,
                Node.type_id == obj_in.type_id
            )
            .first()
        )

        if exists_node:
            raise HTTPException(
                status_code=400,
                detail=f"Node with name '{obj_in.name}' already exists in section {section_id}.",
            )
        if not section:
            raise HTTPException(
                status_code=404, detail=f"Section with id {section_id} not found."
            )

        obj = obj_in.dict()
        del obj["section_id"]

        node = Node(**obj)

        db.add(node)
        db.commit()
        db.refresh(node)

        return node

    def get_by_id(self, db: Session, node_id: int) -> MODEL | None:
        return db.query(self.model).filter(self.model.id == node_id).first()

    def get_by_name(self, db: Session, name: str) -> MODEL | None:
        return db.query(self.model).filter(self.model.name == name).first()

    def get_by_user_id(self, db: Session, user_id: int) -> List[MODEL]:
        return db.query(self.model).filter(self.model.user_id == user_id).all()

    def link(self, db: Session, obj_in: NodeLink):
        node_node_link = (
            db.query(node_node)
            .filter(
                or_(
                    and_(
                        node_node.c.node1_id == obj_in.node1_id,
                        node_node.c.node2_id == obj_in.node2_id,
                    ),
                    and_(
                        node_node.c.node1_id == obj_in.node2_id,
                        node_node.c.node2_id == obj_in.node1_id,
                    ),
                )
            )
            .first()
        )

        if node_node_link is not None:
            raise HTTPException(
                status_code=400,
                detail=f"Link already exists: {obj_in.node1_id}:{obj_in.node2_id}",
            )

        db.execute(
            node_node.insert().values(
                node1_id=obj_in.node1_id, 
                node2_id=obj_in.node2_id,
                user_id=obj_in.user_id
            )
        )
        
        db.commit()

    def delete_link(self, ctx: RequestContext, node_id_1: int, node_id_2: int):
        db = ctx.db
        
        delete_ = delete(node_node).where(
            ((node_node.c.node1_id == node_id_1) & (node_node.c.node2_id == node_id_2))
            | ((node_node.c.node1_id == node_id_2) & (node_node.c.node2_id == node_id_1))
        )
        deleted = db.execute(delete_).rowcount
        
        try:
            assert deleted > 0, "Нет записей для удаления"
            print(f"Удалено записей: {deleted}")
        except AssertionError as e:
            raise HTTPException(status_code=400, detail=str(e))
        
        db.commit()

# ----------- CRUD объекты -----------

department_crud = CRUDDepartment()
employee_crud = CRUDEmployee()
position_crud = CRUDPosition()
project_crud = CRUDProject()
config_crud = CRUDConfig()
section_crud = CRUDSection()
node_type_crud = CRUDNodeType()
node_crud = CRUDNode()
