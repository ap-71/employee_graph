from typing import List
from fastapi import Depends, HTTPException
from api.auth import app
from api.routes_helpers import (
    RequestContext,
    get_context,
)
from api.schemas import (
    NodeCreate,
    NodeLink,
    NodeRead,
    NodeUpdate,
)
from api.crud import (
    node_crud,
)


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
def update_node(id: int, data: NodeUpdate, ctx: RequestContext = Depends(get_context)):
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


@app.delete("/nodes/link/{node_id_1}/{node_id_2}", tags=["nodes"])
def delete_node_link(
    node_id_1: int, node_id_2: int, ctx: RequestContext = Depends(get_context)
):
    node_crud.delete_link(ctx, node_id_1, node_id_2)
