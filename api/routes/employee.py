from typing import List
import uuid
from fastapi import Depends
from api.auth import app
from api.routes_helpers import (
    RequestContext,
    get_context,
)
from api.schemas import (
    EmployeeCreate,
    EmployeeRead,
)
from api.crud import (
    employee_crud,
)


@app.get("/employees/count", tags=["count"])
def count_employees(ctx: RequestContext = Depends(get_context)):
    """Возвращает количество сотрудников"""
    count_ = employee_crud.get_count(ctx.db)

    return {"count": count_}


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
