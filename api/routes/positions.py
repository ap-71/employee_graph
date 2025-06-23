from typing import List
from fastapi import Depends, HTTPException
from api.auth import app
from api.routes_helpers import (
    RequestContext,
    get_context,
)
from api.schemas import (
    PositionCreate,
    PositionRead,
)
from api.crud import (
    position_crud,
)


@app.get("/positions/count", tags=["count"])
def count_positions(ctx: RequestContext = Depends(get_context)):
    """Возвращает количество должностей"""
    count_ = position_crud.get_count(ctx.db)

    return {"count": count_}


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
