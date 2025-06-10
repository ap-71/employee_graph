from datetime import datetime
from typing import List, Optional, Self
from pydantic import BaseModel


class DepartmentBase(BaseModel):
    name: Optional[str]
    description: Optional[str]


class DepartmentCreate(DepartmentBase):
    pass


class DepartmentRead(DepartmentBase):
    id: int

    class Config:
        from_attributes = True


class EmployeeBase(BaseModel):
    uuid: str | None = None
    fio: str


class EmployeeCreate(EmployeeBase):
    pass


class EmployeeRead(EmployeeBase):
    class Config:
        from_attributes = True


class EmployeeDepartmentBase(BaseModel):
    employee_uuid: str
    department_id: int


class EmployeeDepartmentCreate(EmployeeDepartmentBase):
    pass


class EmployeeDepartmentDelete(EmployeeDepartmentBase):
    pass


class EmployeeDepartmentRead(EmployeeDepartmentBase):
    id: int

    class Config:
        from_attributes = True


class EmployeeEmployeeBase(BaseModel):
    employee1_uuid: str
    employee2_uuid: str


class EmployeeEmployeeCreate(EmployeeEmployeeBase):
    pass


class EmployeeEmployeeDelete(EmployeeEmployeeBase):
    pass


class EmployeeEmployeeRead(EmployeeEmployeeBase):
    id: int

    class Config:
        from_attributes = True


class PositionBase(BaseModel):
    value: str
    description: Optional[str]


class PositionCreate(PositionBase):
    pass


class PositionRead(PositionBase):
    id: int

    class Config:
        from_attributes = True


class EmployeePositionBase(BaseModel):
    employee_uuid: str
    position_id: int


class EmployeePositionCreate(EmployeePositionBase):
    pass


class EmployeePositionDelete(EmployeePositionBase):
    pass


class EmployeePositionRead(EmployeePositionBase):
    id: int

    class Config:
        from_attributes = True


class ProjectBase(BaseModel):
    value: str
    description: Optional[str]


class ProjectCreate(ProjectBase):
    pass


class ProjectRead(ProjectBase):
    id: int

    class Config:
        from_attributes = True


class EmployeeProjectBase(BaseModel):
    employee_uuid: str
    project_id: int


class EmployeeProjectCreate(EmployeeProjectBase):
    pass


class EmployeeProjectDelete(EmployeeProjectBase):
    pass


class EmployeeProjectRead(EmployeeProjectBase):
    id: int

    class Config:
        from_attributes = True


class NodeSchema(BaseModel):
    id: str
    name: str
    type: str


class LinkSchema(BaseModel):
    id: str
    source: str
    target: str


class GraphDataSchema(BaseModel):
    nodes: List[NodeSchema]
    links: List[LinkSchema]


class ConfigSchemaBase(BaseModel):
    name: str
    description: str
    key: str
    value: str
    user_id: int | None = None


class ConfigSchemaCreate(ConfigSchemaBase):
    pass


class ConfigSchemaDelete(ConfigSchemaBase):
    pass


class ConfigSchemaRead(ConfigSchemaBase):
    id: int

    class Config:
        from_attributes = True


class ConfigNodesSchema(BaseModel):
    distance: int | None = None
    node_radius: int | None = None
    multiplier_node_size: float | None = None
    node_labels_show: bool | None = None


class UserSchema(BaseModel):
    id: int
    username: str
    is_active: bool


class SectionCreate(BaseModel):
    name: str
    description: Optional[str] = None
    user_id: int | None = None

    class Config:
        from_attributes = True


class SectionRead(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    dt_create: datetime | None = None
    user: UserSchema | None = None

    class Config:
        from_attributes = True


class NodeTypeCreate(BaseModel):
    name: str
    description: Optional[str] = None
    user_id: int | None = None
    section_id: int
    user_id: int | None = None

    class Config:
        from_attributes = True


class NodeTypeRead(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    dt_create: datetime | None = None
    user: UserSchema | None = None
    nodes: List["NodeRead"] = []

    class Config:
        from_attributes = True


class NodeCreate(BaseModel):
    name: str
    description: Optional[str] = None
    type_id: int
    user_id: int | None = None
    section_id: int | None = None

    class Config:
        from_attributes = True


class NodeTypeRef(BaseModel):
    id: int
    name: str
    description: str

    class Config:
        from_attributes = True

class NodeRef(BaseModel):
    id: int
    name: str
    type: NodeTypeRef

    class Config:
        from_attributes = True


class NodeRead(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    user: UserSchema | None = None
    dt_create: datetime | None = None

    nodes: List[NodeRef] = []
    nodes_to_this: List[NodeRef] = []

    class Config:
        from_attributes = True


class NodeLink(BaseModel):
    node1_id: int
    node2_id: int
    user_id: int | None = None
