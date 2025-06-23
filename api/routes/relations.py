from typing import List
from fastapi import Depends
from api.auth import app
from api.routes_helpers import (
    RequestContext,
    get_context,
)
from api.schemas import (
    DepartmentRead,
    EmployeeDepartmentCreate,
    EmployeeDepartmentDelete,
    EmployeeEmployeeCreate,
    EmployeeEmployeeDelete,
    EmployeePositionCreate,
    EmployeePositionDelete,
    EmployeeProjectCreate,
    EmployeeProjectDelete,
    EmployeeRead,
    PositionRead,
    ProjectRead,
)
from api.crud import (
    department_crud,
    employee_crud,
    position_crud,
    project_crud,
)


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
