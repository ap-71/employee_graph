from fastapi import Depends
from sqlalchemy import select
from api.auth import app
from api.models import (
    Node,
    NodeType,
    employee_department,
    employee_employee,
    employee_position,
    employee_project,
    node_node,
)
from api.routes_helpers import (
    RequestContext,
    RequestPubContext,
    get_context,
    get_pub_context,
)
from api.schemas import (
    GraphDataSchema,
    LinkSchema,
    NodeSchema,
)
from api.crud import (
    department_crud,
    employee_crud,
    position_crud,
    project_crud,
    node_crud,
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


@app.get("/graph/section/{section_id}", response_model=GraphDataSchema, tags=["graph"])
async def get_graph_section_by_id(
    section_id: int,
    ctx: RequestContext = Depends(get_context),
):
    nodes = []
    links = []

    model_nodes = node_crud.get_by_section_id(db=ctx.db, section_id=section_id)

    # Добавляем узлы
    nodes.extend(
        [
            NodeSchema(id=f"node-{n.id}", name=n.name, type=n.type.name)
            for n in model_nodes
        ]
    )

    # Связи
    for nn in ctx.db.execute(
        select(node_node).where(
            (node_node.c.node1_id == Node.id)
            & (Node.type_id == NodeType.id)
            & (NodeType.section_id == section_id)
        )
    ).fetchall():
        node_1, node_2, *_ = nn
        links.append(
            LinkSchema(
                id=f"nn-{node_1}-{node_2}",
                source=f"node-{node_1}",
                target=f"node-{node_2}",
            )
        )

    return GraphDataSchema(nodes=nodes, links=links)
