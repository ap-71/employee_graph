from typing import Optional
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
    uuid: str
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

class EmployeeDepartmentRead(EmployeeDepartmentBase):
    id: int
    class Config:
        from_attributes = True

class EmployeeEmployeeBase(BaseModel):
    employee1_uuid: str
    employee2_uuid: str

class EmployeeEmployeeCreate(EmployeeEmployeeBase):
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

class EmployeeProjectRead(EmployeeProjectBase):
    id: int
    class Config:
        from_attributes = True