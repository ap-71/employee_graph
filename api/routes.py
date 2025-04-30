from typing import List
import uuid
from fastapi import Depends, HTTPException
from sqlalchemy.orm import Session
from api.db import get_db
from api import app
from api.schemas import DepartmentCreate, DepartmentRead, EmployeeCreate, EmployeeDepartmentCreate, EmployeeDepartmentRead, EmployeeEmployeeCreate, EmployeeEmployeeRead, EmployeePositionCreate, EmployeePositionRead, EmployeeProjectCreate, EmployeeProjectRead, EmployeeRead, PositionCreate, PositionRead, ProjectCreate, ProjectRead
from api.crud import department_crud, employee_crud, position_crud, project_crud

# ----------- Маршруты для /departments -----------

@app.post("/departments/", response_model=DepartmentRead, tags=["departments"])
def create_department(data: DepartmentCreate, db: Session = Depends(get_db)):
    return department_crud.create(db, data)

@app.get("/departments/", response_model=List[DepartmentRead], tags=["departments"])
def get_departments(skip: int=0, limit: int=100, db: Session=Depends(get_db)):
    return department_crud.get_all(db, skip, limit)

@app.get("/departments/{id}", response_model=DepartmentRead, tags=["departments"])
def get_department(id: int, db: Session=Depends(get_db)):
    obj = department_crud.get(db, id)
    if not obj:
        raise HTTPException(status_code=404, detail="Not found")
    return obj

@app.put("/departments/{id}", response_model=DepartmentRead, tags=["departments"])
def update_department(id: int, data: DepartmentCreate, db: Session=Depends(get_db)):
    return department_crud.update(db, id, data)

@app.delete("/departments/{id}", tags=["departments"])
def delete_department(id: int, db: Session=Depends(get_db)):
    department_crud.delete(db, id)
    return {"detail": "Deleted"}

# ----------- Маршруты для /employee -----------

@app.post("/employee/", response_model=EmployeeRead, tags=["employee"])
def create_employee(data: EmployeeCreate, db: Session=Depends(get_db)):
    # Генерация UUID, если не передан
    if not data.uuid:
        data.uuid = str(uuid.uuid4())
    return employee_crud.create(db, data)

@app.get("/employee/", response_model=List[EmployeeRead], tags=["employee"])
def get_employees(skip: int=0, limit: int=100, db: Session=Depends(get_db)):
    return employee_crud.get_all(db, skip, limit)

@app.get("/employee/{uuid}", response_model=EmployeeRead, tags=["employee"])
def get_employee(uuid:str, db: Session=Depends(get_db)):
    return employee_crud.get(db, uuid)

@app.put("/employee/{uuid}", response_model=EmployeeRead, tags=["employee"])
def update_employee(uuid:str, data: EmployeeCreate, db: Session=Depends(get_db)):
    return employee_crud.update(db, uuid, data)

@app.delete("/employee/{uuid}", tags=["employee"])
def delete_employee(uuid:str, db: Session=Depends(get_db)):
    employee_crud.delete(db, uuid)
    
    return {"detail": "Deleted"}

# ----------- Маршруты для /employee_department -----------

@app.post("/employee_department/", tags=["employee"])
def create_employee_department(data: EmployeeDepartmentCreate, db: Session=Depends(get_db)):
    department = department_crud.get(db, data.department_id)
    employee_crud.bind(db, obj_id=data.employee_uuid, bind_attr_name="departments", bind_obj=department)
    
    return {"detail": "Binded"}

# @app.get("/employee_department/", response_model=List[EmployeeDepartmentRead])
# def get_employee_departments(skip: int=0, limit: int=100, db: Session=Depends(get_db)):
#     return employee_department_crud.get_all(db, skip, limit)

# @app.get("/employee_department/{id}", response_model=EmployeeDepartmentRead)
# def get_employee_department(id: int, db: Session=Depends(get_db)):
#     obj = employee_department_crud.get(db, id)
#     if not obj:
#         raise HTTPException(status_code=404, detail="Not found")
#     return obj

# @app.put("/employee_department/{id}", response_model=EmployeeDepartmentRead)
# def update_employee_department(id: int, data: EmployeeDepartmentCreate, db: Session=Depends(get_db)):
#     return employee_department_crud.update(db, id, data)

# @app.delete("/employee_department/{id}")
# def delete_employee_department(id: int, db: Session=Depends(get_db)):
#     employee_department_crud.delete(db, id)
#     return {"detail": "Deleted"}

# ----------- Маршруты для /employee_employee -----------

@app.post("/employee_employee/", tags=["employee"])
def create_employee_employee(data: EmployeeEmployeeCreate, db: Session=Depends(get_db)):
    employee2 = employee_crud.get(db, data.employee2_uuid)
    employee_crud.bind(db, obj_id=data.employee1_uuid, bind_attr_name="employees", bind_obj=employee2)
    
    return {"detail": "Binded"}

# @app.get("/employee_employee/", response_model=List[EmployeeEmployeeRead])
# def get_employee_employees(skip: int=0, limit: int=100, db: Session=Depends(get_db)):
#     return employee_employee_crud.get_all(db, skip, limit)

# @app.get("/employee_employee/{id}", response_model=EmployeeEmployeeRead)
# def get_employee_employee(id: int, db: Session=Depends(get_db)):
#     obj = employee_employee_crud.get(db, id)
#     if not obj:
#         raise HTTPException(status_code=404, detail="Not found")
#     return obj

# @app.put("/employee_employee/{id}", response_model=EmployeeEmployeeRead)
# def update_employee_employee(id: int, data: EmployeeEmployeeCreate, db: Session=Depends(get_db)):
#     return employee_employee_crud.update(db, id, data)

# @app.delete("/employee_employee/{id}")
# def delete_employee_employee(id: int, db: Session=Depends(get_db)):
#     employee_employee_crud.delete(db, id)
#     return {"detail": "Deleted"}

# ----------- Маршруты для /positions -----------

@app.post("/positions/", response_model=PositionRead, tags=["positions"])
def create_position(data: PositionCreate, db: Session=Depends(get_db)):
    return position_crud.create(db, data)

@app.get("/positions/", response_model=List[PositionRead], tags=["positions"])
def get_positions(skip: int=0, limit: int=100, db: Session=Depends(get_db)):
    return position_crud.get_all(db, skip, limit)

@app.get("/positions/{id}", response_model=PositionRead, tags=["positions"])
def get_position(id: int, db: Session=Depends(get_db)):
    obj = position_crud.get(db, id)
    if not obj:
        raise HTTPException(status_code=404, detail="Not found")
    return obj

@app.put("/positions/{id}", response_model=PositionRead, tags=["positions"])
def update_position(id: int, data: PositionCreate, db: Session=Depends(get_db)):
    return position_crud.update(db, id, data)

@app.delete("/positions/{id}", tags=["positions"])
def delete_position(id: int, db: Session=Depends(get_db)):
    position_crud.delete(db, id)
    return {"detail": "Deleted"}

# ----------- Маршруты для /employee_position -----------

@app.post("/employee_position/", tags=["employee"])
def create_employee_position(data: EmployeePositionCreate, db: Session=Depends(get_db)):
    obj = position_crud.get(db, data.position_id)
    employee_crud.bind(db, obj_id=data.employee_uuid, bind_attr_name="positions", bind_obj=obj)
    
    return {"detail": "Binded"}

# @app.get("/employee_position/", response_model=List[EmployeePositionRead])
# def get_employee_positions(skip: int=0, limit: int=100, db: Session=Depends(get_db)):
#     return employee_position_crud.get_all(db, skip, limit)

# @app.get("/employee_position/{id}", response_model=EmployeePositionRead)
# def get_employee_position(id: int, db: Session=Depends(get_db)):
#     obj = employee_position_crud.get(db, id)
#     if not obj:
#         raise HTTPException(status_code=404, detail="Not found")
#     return obj

# @app.put("/employee_position/{id}", response_model=EmployeePositionRead)
# def update_employee_position(id: int, data: EmployeePositionCreate, db: Session=Depends(get_db)):
#     return employee_position_crud.update(db, id, data)

# @app.delete("/employee_position/{id}")
# def delete_employee_position(id: int, db: Session=Depends(get_db)):
#     employee_position_crud.delete(db, id)
#     return {"detail": "Deleted"}

# ----------- Маршруты для /projects -----------

@app.post("/projects/", response_model=ProjectRead, tags=["projects"])
def create_project(data: ProjectCreate, db: Session=Depends(get_db)):
    return project_crud.create(db, data)

@app.get("/projects/", response_model=List[ProjectRead], tags=["projects"])
def get_projects(skip: int=0, limit: int=100, db: Session=Depends(get_db)):
    return project_crud.get_all(db, skip, limit)

@app.get("/projects/{id}", response_model=ProjectRead, tags=["projects"])
def get_project(id: int, db: Session=Depends(get_db)):
    obj = project_crud.get(db, id)
    if not obj:
        raise HTTPException(status_code=404, detail="Not found")
    return obj

@app.put("/projects/{id}", response_model=ProjectRead, tags=["projects"])
def update_project(id: int, data: ProjectCreate, db: Session=Depends(get_db)):
    return project_crud.update(db, id, data)

@app.delete("/projects/{id}", tags=["projects"])
def delete_project(id: int, db: Session=Depends(get_db)):
    project_crud.delete(db, id)
    return {"detail": "Deleted"}

# ----------- Маршруты для /employee_project -----------

@app.post("/employee_project/", tags=["employee"])
def create_employee_project(data: EmployeeProjectCreate, db: Session=Depends(get_db)):
    obj = project_crud.get(db, data.project_id)
    employee_crud.bind(db, obj_id=data.employee_uuid, bind_attr_name="projects", bind_obj=obj)
    
    return {"detail": "Binded"}

# @app.get("/employee_project/", response_model=List[EmployeeProjectRead])
# def get_employee_projects(skip: int=0, limit: int=100, db: Session=Depends(get_db)):
#     return employee_project_crud.get_all(db, skip, limit)

# @app.get("/employee_project/{id}", response_model=EmployeeProjectRead)
# def get_employee_project(id: int, db: Session=Depends(get_db)):
#     obj = employee_project_crud.get(db, id)
#     if not obj:
#         raise HTTPException(status_code=404, detail="Not found")
#     return obj

# @app.put("/employee_project/{id}", response_model=EmployeeProjectRead)
# def update_employee_project(id: int, data: EmployeeProjectCreate, db: Session=Depends(get_db)):
#     return employee_project_crud.update(db, id, data)

# @app.delete("/employee_project/{id}")
# def delete_employee_project(id: int, db: Session=Depends(get_db)):
#     employee_project_crud.delete(db, id)
#     return {"detail": "Deleted"}