from typing import List
from fastapi import Depends, HTTPException
from api.auth import app
from api.routes_helpers import (
    RequestContext,
    get_context,
)
from api.schemas import (
    ProjectCreate,
    ProjectRead,
)
from api.crud import (
    project_crud,
)


@app.get("/projects/count", tags=["count"])
def count_projects(ctx: RequestContext = Depends(get_context)):
    """Возвращает количество проектов"""
    count_ = project_crud.get_count(ctx.db)

    return {"count": count_}


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
