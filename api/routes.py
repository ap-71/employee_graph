from typing import List
import uuid
from fastapi import Depends, HTTPException, Request
from sqlalchemy import select
from sqlalchemy.orm import Session
from api.db import get_db
from api.auth import app, check_token, oauth2_scheme
from api.models import (
    User,
    employee_department,
    employee_employee,
    employee_position,
    employee_project,
)
from api.schemas import (
    ConfigNodesSchema,
    DepartmentCreate,
    DepartmentRead,
    GraphDataSchema,
    LinkSchema,
    EmployeeCreate,
    EmployeeDepartmentCreate,
    EmployeeDepartmentDelete,
    EmployeeEmployeeCreate,
    EmployeeEmployeeDelete,
    EmployeePositionCreate,
    EmployeePositionDelete,
    EmployeeProjectCreate,
    EmployeeProjectDelete,
    EmployeeRead,
    NodeCreate,
    NodeLink,
    NodeRead,
    NodeSchema,
    NodeTypeCreate,
    NodeTypeRead,
    PositionCreate,
    PositionRead,
    ProjectCreate,
    ProjectRead,
    SectionCreate,
    SectionRead,
)
from api.crud import (
    department_crud,
    employee_crud,
    position_crud,
    project_crud,
    config_crud,
    section_crud,
    node_type_crud,
    node_crud,
)


from typing import NamedTuple


class RequestContext(NamedTuple):
    db: Session
    user: User


class RequestPubContext(NamedTuple):
    db: Session


def get_context(
    db: Session = Depends(get_db), user: User = Depends(check_token)
) -> RequestContext:
    return RequestContext(db=db, user=user)


def get_pub_context(
    db: Session = Depends(get_db),
) -> RequestContext:
    return RequestPubContext(db=db)


# ----------- Маршруты для получения количества объектов -----------


@app.get("/employees/count", tags=["count"])
def count_employees(ctx: RequestContext = Depends(get_context)):
    """Возвращает количество сотрудников"""
    count_ = employee_crud.get_count(ctx.db)

    return {"count": count_}


@app.get("/departments/count", tags=["count"])
def count_departments(ctx: RequestContext = Depends(get_context)):
    """Возвращает количество отделов"""
    count_ = department_crud.get_count(ctx.db)

    return {"count": count_}


@app.get("/positions/count", tags=["count"])
def count_positions(ctx: RequestContext = Depends(get_context)):
    """Возвращает количество должностей"""
    count_ = position_crud.get_count(ctx.db)

    return {"count": count_}


@app.get("/projects/count", tags=["count"])
def count_projects(ctx: RequestContext = Depends(get_context)):
    """Возвращает количество проектов"""
    count_ = project_crud.get_count(ctx.db)

    return {"count": count_}


# ----------- Маршруты для /departments -----------


@app.post("/departments/", response_model=DepartmentRead, tags=["departments"])
def create_department(
    data: DepartmentCreate, ctx: RequestContext = Depends(get_context)
):
    return department_crud.create(ctx.db, data)


@app.get("/departments/", response_model=List[DepartmentRead], tags=["departments"])
def get_departments(
    skip: int = 0, limit: int = 250, ctx: RequestContext = Depends(get_context)
):
    return department_crud.get_all(ctx.db, skip, limit)


@app.get("/departments/{id}", response_model=DepartmentRead, tags=["departments"])
def get_department(id: int, ctx: RequestContext = Depends(get_context)):
    obj = department_crud.get(ctx.db, id)
    if not obj:
        raise HTTPException(status_code=404, detail="Not found")
    return obj


@app.put("/departments/{id}", response_model=DepartmentRead, tags=["departments"])
def update_department(
    id: int, data: DepartmentCreate, ctx: RequestContext = Depends(get_context)
):
    return department_crud.update(ctx.db, id, data)


@app.delete("/departments/{id}", tags=["departments"])
def delete_department(id: int, ctx: RequestContext = Depends(get_context)):
    department_crud.delete(ctx.db, id)
    return {"detail": "Deleted"}


# ----------- Маршруты для /employee -----------


@app.post("/employee/", response_model=EmployeeRead, tags=["employee"])
def create_employee(data: EmployeeCreate, ctx: RequestContext = Depends(get_context)):
    # Генерация UUID, если не передан
    if not data.uuid:
        data.uuid = str(uuid.uuid4())
    return employee_crud.create(ctx.db, data)


@app.get("/employee/", response_model=List[EmployeeRead], tags=["employee"])
def get_employees(
    skip: int = 0, limit: int = 250, ctx: RequestContext = Depends(get_context)
):
    return employee_crud.get_all(ctx.db, skip, limit)


@app.get("/employee/{uuid}", response_model=EmployeeRead, tags=["employee"])
def get_employee(uuid: str, ctx: RequestContext = Depends(get_context)):
    return employee_crud.get(ctx.db, uuid)


@app.put("/employee/{uuid}", response_model=EmployeeRead, tags=["employee"])
def update_employee(
    uuid: str, data: EmployeeCreate, ctx: RequestContext = Depends(get_context)
):
    return employee_crud.update(ctx.db, uuid, data)


@app.delete("/employee/{uuid}", tags=["employee"])
def delete_employee(uuid: str, ctx: RequestContext = Depends(get_context)):
    employee_crud.delete(ctx.db, uuid)

    return {"detail": "Deleted"}


# ----------- Маршруты для /employee_department -----------


@app.post("/employee_department/", tags=["employee"])
def create_employee_department(
    data: EmployeeDepartmentCreate, ctx: RequestContext = Depends(get_context)
):
    department = department_crud.get(ctx.db, data.department_id)
    employee_crud.bind(
        ctx.db,
        obj_id=data.employee_uuid,
        bind_attr_name="departments",
        bind_obj=department,
    )

    return {"detail": "Binded"}


@app.get(
    "/employee_department/{uuid}",
    response_model=List[DepartmentRead],
    tags=["employee"],
)
def get_employee_department_uuid(uuid: str, ctx: RequestContext = Depends(get_context)):
    return employee_crud.get_bind_department(ctx.db, uuid)


@app.get(
    "/employee_department/", response_model=List[DepartmentRead], tags=["employee"]
)
def get_employee_department(ctx: RequestContext = Depends(get_context)):
    return employee_crud.get_bind_department(ctx.db)


@app.delete("/employee_department/", tags=["employee"])
def delete_employee_department(
    data: EmployeeDepartmentDelete, ctx: RequestContext = Depends(get_context)
):
    return employee_crud.delete_bind_department(
        ctx.db, uuid=data.employee_uuid, id=data.department_id
    )


# ----------- Маршруты для /employee_employee -----------


@app.post("/employee_employee/", tags=["employee"])
def create_employee_employee(
    data: EmployeeEmployeeCreate, ctx: RequestContext = Depends(get_context)
):
    employee_crud.bind_employee(
        ctx.db, uuid1=data.employee1_uuid, uuid2=data.employee2_uuid
    )

    return {"detail": "Binded"}


@app.get(
    "/employee_employee/{uuid}", response_model=List[EmployeeRead], tags=["employee"]
)
def get_employee_employee_uuid(uuid: str, ctx: RequestContext = Depends(get_context)):
    return employee_crud.get_bind_employee(ctx.db, uuid)


@app.get("/employee_employee/", response_model=List[EmployeeRead], tags=["employee"])
def get_employee_employee(ctx: RequestContext = Depends(get_context)):
    return employee_crud.get_bind_employee(ctx.db)


@app.delete("/employee_employee/", tags=["employee"])
def delete_employee_employee(
    data: EmployeeEmployeeDelete, ctx: RequestContext = Depends(get_context)
):
    return employee_crud.delete_bind_employee(
        ctx.db, uuid1=data.employee1_uuid, uuid2=data.employee2_uuid
    )


# ----------- Маршруты для /positions -----------


@app.post("/positions/", response_model=PositionRead, tags=["positions"])
def create_position(data: PositionCreate, ctx: RequestContext = Depends(get_context)):
    return position_crud.create(ctx.db, data)


@app.get("/positions/", response_model=List[PositionRead], tags=["positions"])
def get_positions(
    skip: int = 0, limit: int = 250, ctx: RequestContext = Depends(get_context)
):
    return position_crud.get_all(ctx.db, skip, limit)


@app.get("/positions/{id}", response_model=PositionRead, tags=["positions"])
def get_position(id: int, ctx: RequestContext = Depends(get_context)):
    obj = position_crud.get(ctx.db, id)
    if not obj:
        raise HTTPException(status_code=404, detail="Not found")
    return obj


@app.put("/positions/{id}", response_model=PositionRead, tags=["positions"])
def update_position(
    id: int, data: PositionCreate, ctx: RequestContext = Depends(get_context)
):
    return position_crud.update(ctx.db, id, data)


@app.delete("/positions/{id}", tags=["positions"])
def delete_position(id: int, ctx: RequestContext = Depends(get_context)):
    position_crud.delete(ctx.db, id)
    return {"detail": "Deleted"}


# ----------- Маршруты для /employee_position -----------


@app.post("/employee_position/", tags=["employee"])
def create_employee_position(
    data: EmployeePositionCreate, ctx: RequestContext = Depends(get_context)
):
    obj = position_crud.get(ctx.db, data.position_id)
    employee_crud.bind(
        ctx.db, obj_id=data.employee_uuid, bind_attr_name="positions", bind_obj=obj
    )

    return {"detail": "Binded"}


@app.get(
    "/employee_position/{uuid}", response_model=List[PositionRead], tags=["employee"]
)
def get_employee_position_uuid(uuid: str, ctx: RequestContext = Depends(get_context)):
    return employee_crud.get_bind_position(ctx.db, uuid)


@app.get("/employee_position/", response_model=List[PositionRead], tags=["employee"])
def get_employee_position(ctx: RequestContext = Depends(get_context)):
    return employee_crud.get_bind_position(ctx.db)


@app.delete("/employee_position/", tags=["employee"])
def delete_employee_position(
    data: EmployeePositionDelete, ctx: RequestContext = Depends(get_context)
):
    return employee_crud.delete_bind_position(
        ctx.db, uuid=data.employee_uuid, id=data.position_id
    )


# ----------- Маршруты для /projects -----------


@app.post("/projects/", response_model=ProjectRead, tags=["projects"])
def create_project(data: ProjectCreate, ctx: RequestContext = Depends(get_context)):
    return project_crud.create(ctx.db, data)


@app.get("/projects/", response_model=List[ProjectRead], tags=["projects"])
def get_projects(
    skip: int = 0, limit: int = 250, ctx: RequestContext = Depends(get_context)
):
    return project_crud.get_all(ctx.db, skip, limit)


@app.get("/projects/{id}", response_model=ProjectRead, tags=["projects"])
def get_project(id: int, ctx: RequestContext = Depends(get_context)):
    obj = project_crud.get(ctx.db, id)
    if not obj:
        raise HTTPException(status_code=404, detail="Not found")
    return obj


@app.put("/projects/{id}", response_model=ProjectRead, tags=["projects"])
def update_project(
    id: int, data: ProjectCreate, ctx: RequestContext = Depends(get_context)
):
    return project_crud.update(ctx.db, id, data)


@app.delete("/projects/{id}", tags=["projects"])
def delete_project(id: int, ctx: RequestContext = Depends(get_context)):
    project_crud.delete(ctx.db, id)
    return {"detail": "Deleted"}


# ----------- Маршруты для /employee_project -----------


@app.post("/employee_project/", tags=["employee"])
def create_employee_project(
    data: EmployeeProjectCreate, ctx: RequestContext = Depends(get_context)
):
    obj = project_crud.get(ctx.db, data.project_id)
    employee_crud.bind(
        ctx.db, obj_id=data.employee_uuid, bind_attr_name="projects", bind_obj=obj
    )

    return {"detail": "Binded"}


@app.get(
    "/employee_project/{uuid}", response_model=List[ProjectRead], tags=["employee"]
)
def get_employee_project_uuid(uuid: str, ctx: RequestContext = Depends(get_context)):
    return employee_crud.get_bind_project(ctx.db, uuid)


@app.get("/employee_project/", response_model=List[ProjectRead], tags=["employee"])
def get_employee_project(ctx: RequestContext = Depends(get_context)):
    return employee_crud.get_bind_project(ctx.db)


@app.delete("/employee_project/", tags=["employee"])
def delete_employee_project(
    data: EmployeeProjectDelete, ctx: RequestContext = Depends(get_context)
):
    return employee_crud.delete_bind_project(
        ctx.db, uuid=data.employee_uuid, id=data.project_id
    )


@app.get("/graph", response_model=GraphDataSchema, tags=["graph"])
async def get_graph(ctx: RequestContext = Depends(get_context)):
    nodes = []
    links = []

    # Загружаем все данные
    employees = employee_crud.get_all(db=ctx.db)
    departments = department_crud.get_all(db=ctx.db)
    positions = position_crud.get_all(db=ctx.db)
    projects = project_crud.get_all(db=ctx.db)

    # Добавляем узлы
    nodes.extend(
        [NodeSchema(id=e.uuid, name=e.fio, type="employee") for e in employees]
    )
    nodes.extend(
        [
            NodeSchema(
                id=f"department-{d.id}",
                name=d.name or f"Dept {d.id}",
                type="department",
            )
            for d in departments
        ]
    )
    nodes.extend(
        [
            NodeSchema(id=f"position-{p.id}", name=p.value, type="position")
            for p in positions
        ]
    )
    nodes.extend(
        [
            NodeSchema(id=f"project-{p.id}", name=p.value, type="project")
            for p in projects
        ]
    )

    # Связи: employee - department
    for ed in ctx.db.execute(select(employee_department)).fetchall():
        employee_uuid, dept_id = ed
        links.append(
            LinkSchema(
                id=f"ed-{employee_uuid}-{dept_id}",
                source=employee_uuid,
                target=f"department-{dept_id}",
            )
        )

    # employee - project
    for ep in ctx.db.execute(select(employee_project)).fetchall():
        employee_uuid, proj_id = ep
        links.append(
            LinkSchema(
                id=f"ep-{employee_uuid}-{proj_id}",
                source=employee_uuid,
                target=f"project-{proj_id}",
            )
        )

    # employee - position
    for ep in ctx.db.execute(select(employee_position)).fetchall():
        employee_uuid, pos_id = ep
        links.append(
            LinkSchema(
                id=f"epos-{employee_uuid}-{pos_id}",
                source=employee_uuid,
                target=f"position-{pos_id}",
            )
        )

    # employee - employee
    for ee in ctx.db.execute(select(employee_employee)).fetchall():
        e1, e2 = ee
        links.append(LinkSchema(id=f"ee-{e1}-{e2}", source=e1, target=e2))

    return GraphDataSchema(nodes=nodes, links=links)


@app.get("/public/graph", response_model=GraphDataSchema, tags=["graph"])
async def public_get_graph(ctx: RequestPubContext = Depends(get_pub_context)):
    return await get_graph(ctx)


@app.post("/config/nodes", tags=["config"])
async def update_config_nodes(
    data: ConfigNodesSchema, request: Request, db: Session = Depends(get_db)
):
    try:
        user = check_token(await oauth2_scheme(request), db)
    except HTTPException:
        user = None

    user_id = user.id if user else None

    data = [
        dict(
            name="nodes",
            key="distance",
            value=data.distance,
        ),
        dict(
            name="nodes",
            key="node_radius",
            value=data.node_radius,
        ),
        dict(
            name="nodes",
            key="multiplier_node_size",
            value=data.multiplier_node_size,
        ),
        dict(
            name="nodes",
            key="node_labels_show",
            value=data.node_labels_show,
        ),
    ]

    for item in data:
        config_crud.update(db=db, user_id=user_id, **item)


@app.get("/config/nodes", response_model=ConfigNodesSchema, tags=["config"])
async def get_config_nodes(request: Request, db: Session = Depends(get_db)):
    try:
        user = check_token(await oauth2_scheme(request), db)
    except HTTPException:
        user = None

    user_id = user.id if user else None

    config = config_crud.get(db=db, name="nodes", key=None, user_id=user_id)

    data = {}

    for conf in config:
        if conf.key == "node_labels_show":
            data["node_labels_show"] = conf.value
        elif conf.key == "distance":
            data["distance"] = conf.value
        elif conf.key == "node_radius":
            data["node_radius"] = conf.value
        elif conf.key == "multiplier_node_size":
            data["multiplier_node_size"] = conf.value

    return ConfigNodesSchema(**data)


# ----------- Маршруты для /sections -----------


@app.post("/sections/", tags=["sections"])
def create_section(data: SectionCreate, ctx: RequestContext = Depends(get_context)):
    data.user_id = ctx.user.id  # Устанавливаем ID пользователя из контекста

    section_crud.create(ctx.db, data)


@app.get("/sections/", response_model=List[SectionRead], tags=["sections"])
def get_sections(
    skip: int = 0, limit: int = 250, ctx: RequestContext = Depends(get_context)
):
    return section_crud.get_all(ctx.db, skip, limit)


@app.get("/sections/{id}", response_model=SectionRead, tags=["sections"])
def get_section(id: int, ctx: RequestContext = Depends(get_context)):
    return section_crud.get(ctx.db, id)


@app.get("/sections/by-name/{name}", response_model=SectionRead, tags=["sections"])
def get_section_by_name(name: str, ctx: RequestContext = Depends(get_context)):
    section = section_crud.get_by_name(ctx.db, name)
    if not section:
        raise HTTPException(status_code=404, detail="Section not found")
    return section


@app.get(
    "/sections/by-user/{user_id}", response_model=List[SectionRead], tags=["sections"]
)
def get_sections_by_user(user_id: int, ctx: RequestContext = Depends(get_context)):
    return section_crud.get_by_user_id(ctx.db, user_id)


@app.put("/sections/{id}", response_model=SectionRead, tags=["sections"])
def update_section(
    id: int, data: SectionCreate, ctx: RequestContext = Depends(get_context)
):
    return section_crud.update(ctx.db, id, data)


@app.delete("/sections/{id}", tags=["sections"])
def delete_section(id: int, ctx: RequestContext = Depends(get_context)):
    section_crud.delete(ctx.db, id)
    return {"detail": "Deleted"}


# ----------- Маршруты для /node-types -----------


@app.post("/node-types/", response_model=NodeTypeRead, tags=["node-types"])
def create_node_type(data: NodeTypeCreate, ctx: RequestContext = Depends(get_context)):
    # Устанавливаем ID пользователя из контекста
    data.user_id = ctx.user.id

    return node_type_crud.create(ctx.db, data)


@app.get("/node-types/", response_model=List[NodeTypeRead], tags=["node-types"])
def get_node_types(
    skip: int = 0, limit: int = 250, ctx: RequestContext = Depends(get_context)
):
    return node_type_crud.get_all(ctx.db, skip, limit)


@app.get(
    "/node-types/by-section/{section_id}",
    response_model=List[NodeTypeRead],
    tags=["node-types"],
)
def get_node_types(section_id: int, ctx: RequestContext = Depends(get_context)):
    return node_type_crud.get_by_section_id(ctx.db, section_id=section_id)


@app.get("/node-types/{id}", response_model=NodeTypeRead, tags=["node-types"])
def get_node_type(id: int, ctx: RequestContext = Depends(get_context)):
    return node_type_crud.get(ctx.db, id)


@app.get("/node-types/by-name/{name}", response_model=NodeTypeRead, tags=["node-types"])
def get_node_type_by_name(name: str, ctx: RequestContext = Depends(get_context)):
    node_type = node_type_crud.get_by_name(ctx.db, name)
    if not node_type:
        raise HTTPException(status_code=404, detail="Node type not found")
    return node_type


@app.get(
    "/node-types/by-user/{user_id}",
    response_model=List[NodeTypeRead],
    tags=["node-types"],
)
def get_node_types_by_user(user_id: int, ctx: RequestContext = Depends(get_context)):
    return node_type_crud.get_by_user_id(ctx.db, user_id)


@app.put("/node-types/{id}", response_model=NodeTypeRead, tags=["node-types"])
def update_node_type(
    id: int, data: NodeTypeCreate, ctx: RequestContext = Depends(get_context)
):
    return node_type_crud.update(ctx.db, id, data)


@app.delete("/node-types/{id}", tags=["node-types"])
def delete_node_type(id: int, ctx: RequestContext = Depends(get_context)):
    node_type_crud.delete(ctx.db, id)
    return {"detail": "Deleted"}


# ----------- Маршруты для /nodes -----------


@app.post("/nodes/", response_model=NodeRead, tags=["nodes"])
def create_node(data: NodeCreate, ctx: RequestContext = Depends(get_context)):
    # Устанавливаем ID пользователя из контекста
    data.user_id = ctx.user.id

    return node_crud.create(ctx.db, data)


@app.get("/nodes/", response_model=List[NodeRead], tags=["nodes"])
def get_nodes(
    skip: int = 0, limit: int = 250, ctx: RequestContext = Depends(get_context)
):
    return node_crud.get_all(ctx.db, skip, limit)


@app.get("/nodes/{id}", response_model=NodeRead, tags=["nodes"])
def get_node(id: int, ctx: RequestContext = Depends(get_context)):
    return node_crud.get(ctx.db, id)


@app.get("/nodes/by-id/{node_id}", response_model=NodeRead, tags=["nodes"])
def get_node_by_id(node_id: int, ctx: RequestContext = Depends(get_context)):
    node = node_crud.get_by_id(ctx.db, node_id)
    if not node:
        raise HTTPException(status_code=404, detail="Node not found")
    return node


@app.get("/nodes/by-name/{name}", response_model=NodeRead, tags=["nodes"])
def get_node_by_name(name: str, ctx: RequestContext = Depends(get_context)):
    node = node_crud.get_by_name(ctx.db, name)
    if not node:
        raise HTTPException(status_code=404, detail="Node not found")
    return node


@app.get("/nodes/by-user/{user_id}", response_model=List[NodeRead], tags=["nodes"])
def get_nodes_by_user(user_id: int, ctx: RequestContext = Depends(get_context)):
    return node_crud.get_by_user_id(ctx.db, user_id)


@app.get(
    "/nodes/by-section/{section_id}", response_model=List[NodeRead], tags=["nodes"]
)
def get_nodes_by_user(section_id: int, ctx: RequestContext = Depends(get_context)):
    return node_crud.get_by_section_id(ctx.db, section_id)


@app.put("/nodes/{id}", response_model=NodeRead, tags=["nodes"])
def update_node(id: int, data: NodeCreate, ctx: RequestContext = Depends(get_context)):
    return node_crud.update(ctx.db, id, data)


@app.delete("/nodes/{id}", tags=["nodes"])
def delete_node(id: int, ctx: RequestContext = Depends(get_context)):
    node_crud.delete(ctx.db, id)
    return {"detail": "Deleted"}


@app.post("/nodes/link", tags=["nodes"])
def create_node(data: NodeLink, ctx: RequestContext = Depends(get_context)):
    # Устанавливаем ID пользователя из контекста
    data.user_id = ctx.user.id

    node_crud.link(ctx.db, data)
