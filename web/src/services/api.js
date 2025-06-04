import { API_BASE_URL, assignRelation, createData, deleteData, deleteRelation, getCounts, getData, updateData } from "./helpers";

export const getEmployees = async () => {
    return await getData(`${API_BASE_URL}/employee/`);
};
export const createEmployee = async (employeeData) => {
    return await createData(`${API_BASE_URL}/employee/`, employeeData);
};
export const updateEmployee = async (uuid, employeeData) => {
    return await updateData(`${API_BASE_URL}/employee/${uuid}`, employeeData);
};
export const deleteEmployee = async (uuid) => {
    return await deleteData(`${API_BASE_URL}/employee/${uuid}`);
};
export const getEmployeeDepartments = async (employeeUuid) => {
    return await getData(`${API_BASE_URL}/employee_department/${employeeUuid}`);
};
export const getEmployeePositions = async (employeeUuid) => {
    return await getData(`${API_BASE_URL}/employee_position/${employeeUuid}`);
};
export const getEmployeeProjects = async (employeeUuid) => {
    return await getData(`${API_BASE_URL}/employee_project/${employeeUuid}`);
};
export const getEmployeeEmployee = async (employeeUuid) => {
    return await getData(`${API_BASE_URL}/employee_employee/${employeeUuid}`);
};
export const assignDepartmentToEmployee = async (employeeUuid, departmentId) => {
    return assignRelation(`${API_BASE_URL}/employee_department/`, {
        employee_uuid: employeeUuid,
        department_id: departmentId
    });
};
export const assignPositionToEmployee = async (employeeUuid, positionId) => {
    return assignRelation(`${API_BASE_URL}/employee_position/`, {
        employee_uuid: employeeUuid,
        position_id: positionId
    });
};
export const assignProjectToEmployee = async (employeeUuid, projectId) => {
    return assignRelation(`${API_BASE_URL}/employee_project/`, {
        employee_uuid: employeeUuid,
        project_id: projectId
    });
};
export const linkEmployees = async (employee1Uuid, employee2Uuid) => {
    return assignRelation(`${API_BASE_URL}/employee_employee/`, {
        employee1_uuid: employee1Uuid,
        employee2_uuid: employee2Uuid
    });
};
export const removeEmployeeDepartment = async (employeeUuid, departmentId) => {
    return deleteRelation(`${API_BASE_URL}/employee_department/`, {
        employee_uuid: employeeUuid,
        department_id: departmentId
    });
};
export const removeEmployeePosition = async (employeeUuid, positionId) => {
    return deleteRelation(`${API_BASE_URL}/employee_position/`, {
        employee_uuid: employeeUuid,
        position_id: positionId
    });
};
export const removeEmployeeProject = async (employeeUuid, projectId) => {
    return deleteRelation(`${API_BASE_URL}/employee_project/`, {
        employee_uuid: employeeUuid,
        project_id: projectId
    });
};
export const unlinkEmployees = async (employee1Uuid, employee2Uuid) => {
    return deleteRelation(`${API_BASE_URL}/employee_employee/`, {
        employee1_uuid: employee1Uuid,
        employee2_uuid: employee2Uuid
    });
};
export async function getCountEmployees() {
    return await getCounts("employees")
}
export async function getCountDepartments() {
    return await getCounts("departments")
}
export async function getCountPositions() {
    return await getCounts("positions")
}
export async function getCountProjects() {
    return await getCounts("projects")
}
export async function getGraph({ publicView } = {}) {
    if( publicView ){
        return await getData(`${API_BASE_URL}/public/graph`, false);
    } else {
        return await getData(`${API_BASE_URL}/graph`);
    }
}
export async function getToken(data){
    const formData = new FormData()

    formData.append("username", data.username)
    formData.append("password", data.password)

    const body = new URLSearchParams(formData).toString();

    const res = await fetch(`${API_BASE_URL}/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body
    });

    if(!res.ok){
        throw new Error(`HTTP error! status: ${res.status}`);
    }

    return await res.json()
}
export async function registerAccount(data){
    const formData = new FormData()

    formData.append("username", data.username)
    formData.append("password", data.password)

    const body = new URLSearchParams(formData).toString();

    const res = await fetch(`${API_BASE_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body
    });

    if(!res.ok){
        throw new Error(`HTTP error! status: ${res.status}`);
    }

    return await res.json()
}
export const getProjects = async () => {
    return await getData(`${API_BASE_URL}/projects/`);
};
export async function updateProject(id, data){
    return updateData(`${API_BASE_URL}/projects/${id}`, data);
}
export async function createProject(data){
    return await createData(`${API_BASE_URL}/projects/`, data);
}
export async function deleteProject(id){
    return await deleteData(`${API_BASE_URL}/projects/${id}`);
}
export const getDepartments = async () => {
    return await getData(`${API_BASE_URL}/departments/`);
};
export async function updateDepartment(id, data){
    return updateData(`${API_BASE_URL}/departments/${id}`, data);
}
export async function createDepartment(data){
    return await createData(`${API_BASE_URL}/departments/`, data);
}
export async function deleteDepartment(id){
    return await deleteData(`${API_BASE_URL}/departments/${id}`);
}
export const getPositions = async () => {
    return await getData(`${API_BASE_URL}/positions/`);
};
export async function updatePositions (id, data){
    return updateData(`${API_BASE_URL}/positions/${id}`, data);
}
export async function createPositions (data){
    return await createData(`${API_BASE_URL}/positions/`, data);
}
export async function deletePositions (id){
    return await deleteData(`${API_BASE_URL}/positions/${id}`);
}
export async function saveNodesConfig(data, useAuth=false){
    const body = {
        distance: data.distance,
        node_radius: data.nodeRadius,
        multiplier_node_size: data.multiplierNodeSize,
        node_labels_show: data.nodeLabelsShow,
    }

    return await createData(`${API_BASE_URL}/config/nodes`, body, useAuth);
}
export const getNodesConfig = async (useAuth=false) => {
    return await getData(`${API_BASE_URL}/config/nodes`, useAuth);
};

export const getSections = async () => {
    return await getData(`${API_BASE_URL}/sections/`);
}
export const getSectionById = async ({ sectionId }) => {
    return await getData(`${API_BASE_URL}/sections/${sectionId}`);
}
export const createSection = async (sectionData) => {
    return await createData(`${API_BASE_URL}/sections/`, sectionData);
}
export const getNodesBySection = async ({ sectionId }) => {
    return await getData(`${API_BASE_URL}/nodes/by-section/${sectionId}`);
}
export const createNode = async (nodeData) => {
    return await createData(`${API_BASE_URL}/nodes/`, nodeData);
}
export const getNodeTypes = async () => {
    return await getData(`${API_BASE_URL}/node-types/`);
}
export const getNodeTypesBySection = async ({ sectionId }) => {
    return await getData(`${API_BASE_URL}/node-types/by-section/${sectionId}`);
}
export const createNodeType = async (nodeTypeData) => {
    return await createData(`${API_BASE_URL}/node-types/`, nodeTypeData);
}

export const linkNodes = async (nodeId1, nodeId2) => {
    return await createData(`${API_BASE_URL}/nodes/link`, {node1_id: nodeId1, node2_id: nodeId2});
}