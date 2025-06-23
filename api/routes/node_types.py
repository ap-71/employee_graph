from typing import List
from fastapi import Depends, HTTPException
from api.auth import app
from api.routes_helpers import (
    RequestContext,
    get_context,
)
from api.schemas import (
    NodeTypeCreate,
    NodeTypeRead,
)
from api.crud import (
    node_type_crud,
)


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
