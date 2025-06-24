from fastapi import Depends, HTTPException, Request
from sqlalchemy.orm import Session
from api.db import get_db
from api.auth import app, check_token, oauth2_scheme
from api.schemas import (
    ConfigNodesSchema,
)
from api.crud import (
    config_crud,
)


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
            section_id=data.section_id,
        ),
        dict(
            name="nodes",
            key="node_radius",
            value=data.node_radius,
            section_id=data.section_id,
        ),
        dict(
            name="nodes",
            key="multiplier_node_size",
            value=data.multiplier_node_size,
            section_id=data.section_id,
        ),
        dict(
            name="nodes",
            key="node_labels_show",
            value=data.node_labels_show,
            section_id=data.section_id,
        ),
    ]

    for item in data:
        config_crud.update(db=db, user_id=user_id, **item)


@app.get("/config/nodes", response_model=ConfigNodesSchema, tags=["config"])
async def get_config_nodes(
    request: Request, 
    db: Session = Depends(get_db), 
    section_id: int | None = None
):
    try:
        user = check_token(await oauth2_scheme(request), db)
    except HTTPException:
        user = None

    user_id = user.id if user else None

    config = config_crud.get(
        db=db, 
        name="nodes", 
        key=None, 
        user_id=user_id, 
        section_id=section_id
    )

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


@app.get(
    "/config/nodes/section/{section_id}",
    response_model=ConfigNodesSchema,
    tags=["config"],
)
async def get_config_nodes_by_section_id(
    section_id: int, 
    request: Request, 
    db: Session = Depends(get_db)
):
    return await get_config_nodes(section_id=section_id, request=request, db=db)
