from typing import List
from fastapi import Depends, HTTPException
from api.auth import app
from api.routes_helpers import (
    RequestContext,
    get_context,
)
from api.schemas import (
    DepartmentCreate,
    DepartmentRead,
)
from api.crud import (
    department_crud,
)


@app.get("/departments/count", tags=["count"])
def count_departments(ctx: RequestContext = Depends(get_context)):
    """Возвращает количество отделов"""
    count_ = department_crud.get_count(ctx.db)

    return {"count": count_}


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
