from typing import List
from fastapi import Depends, HTTPException
from api.auth import app
from api.routes_helpers import (
    RequestContext,
    get_context,
)
from api.schemas import (
    SectionCreate,
    SectionRead,
)
from api.crud import (
    section_crud,
)


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
