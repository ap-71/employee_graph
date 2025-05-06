// API service for employee management
const API_BASE_URL = 'http://localhost:8000';
const token = () => {
    const accessToken = JSON.parse(localStorage.getItem('token_data'))?.access_token

    if (accessToken === undefined) {
        localStorage.removeItem('token_data');
        location.href = "/login"
    }

    return `Bearer ${accessToken}`
}
const processingErrorStatus = (status) => {
    if ( status === 401){
        localStorage.removeItem('token_data');
        location.href = "/login"
    }

}

// Employee CRUD operations
export const getEmployees = async () => {
    const response = await fetch(`${API_BASE_URL}/employee/`);
    if (!response.ok) {
        processingErrorStatus(response.status)

        throw new Error(`HTTP error! status: ${status}`);
    }
    return await response.json();
};

export const createEmployee = async (employeeData) => {
    const response = await fetch(`${API_BASE_URL}/employee/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(employeeData)
    });

    if (!response.ok) {
        processingErrorStatus(response.status)

        let errorDetails = '';
        try {
            const errorData = await response.json();
            errorDetails = errorData.detail || JSON.stringify(errorData);
        } catch {
            errorDetails = await response.text();
        }
        throw new Error(`HTTP error! status: ${response.status}, details: ${errorDetails}`);
    }

    return await response.json();
};

export const updateEmployee = async (uuid, employeeData) => {
    const response = await fetch(`${API_BASE_URL}/employee/${uuid}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(employeeData)
    });

    if (!response.ok) {
        processingErrorStatus(response.status)

        let errorDetails = '';
        try {
            const errorData = await response.json();
            errorDetails = errorData.detail || JSON.stringify(errorData);
        } catch {
            errorDetails = await response.text();
        }
        throw new Error(`HTTP error! status: ${response.status}, details: ${errorDetails}`);
    }

    return await response.json();
};

export const deleteEmployee = async (uuid) => {
    const response = await fetch(`${API_BASE_URL}/employee/${uuid}`, {
        method: 'DELETE'
    });

    if (!response.ok) {
        processingErrorStatus(response.status)

        let errorDetails = '';
        try {
            const errorData = await response.json();
            errorDetails = errorData.detail || JSON.stringify(errorData);
        } catch {
            errorDetails = await response.text();
        }
        throw new Error(`HTTP error! status: ${response.status}, details: ${errorDetails}`);
    }

    return response;
};

// Relation data fetching
export const getDepartments = async () => {
    const response = await fetch(`${API_BASE_URL}/departments/`);
    if (!response.ok) {
        processingErrorStatus(response.status)

        throw new Error(`Departments fetch failed: ${response.status}`);
    }
    return await response.json();
};

export const getPositions = async () => {
    const response = await fetch(`${API_BASE_URL}/positions/`);
    if (!response.ok) {
        processingErrorStatus(response.status)

        throw new Error(`Positions fetch failed: ${response.status}`);
    }
    return await response.json();
};

export const getProjects = async () => {
    const response = await fetch(`${API_BASE_URL}/projects/`);
    if (!response.ok) {
        processingErrorStatus(response.status)

        throw new Error(`Projects fetch failed: ${response.status}`);
    }
    return await response.json();
};

// // Get employee relationships
// export const getEmployeeRelationships = async (employeeUuid) => {
//   const response = await fetch(`${API_BASE_URL}/employee/${employeeUuid}/relationships`);
//   if (!response.ok) {
//     throw new Error(`Relationships fetch failed: ${response.status}`);
//   }
//   return await response.json();
// };

export const getEmployeeDepartments = async (employeeUuid) => {
    const response = await fetch(`${API_BASE_URL}/employee_department/${employeeUuid}`);
    if (!response.ok) {
        processingErrorStatus(response.status)

        throw new Error(`Employee departments fetch failed: ${response.status}`);
    }
    return await response.json();
};

export const getEmployeePositions = async (employeeUuid) => {
    const response = await fetch(`${API_BASE_URL}/employee_position/${employeeUuid}`);
    if (!response.ok) {
        processingErrorStatus(response.status)

        throw new Error(`Employee positions fetch failed: ${response.status}`);
    }
    return await response.json();
};

export const getEmployeeProjects = async (employeeUuid) => {
    const response = await fetch(`${API_BASE_URL}/employee_project/${employeeUuid}`);
    if (!response.ok) {
        processingErrorStatus(response.status)

        throw new Error(`Employee projects fetch failed: ${response.status}`);
    }
    return await response.json();
};

export const getEmployeeEmployee = async (employeeUuid) => {
    const response = await fetch(`${API_BASE_URL}/employee_employee/${employeeUuid}`);
    if (!response.ok) {
        processingErrorStatus(response.status)

        throw new Error(`Linked employees fetch failed: ${response.status}`);
    }
    return await response.json();
};

// Relation assignments
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

// Helper function for relation assignments
async function assignRelation(url, body) {
    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });

    if (!response.ok) {
        processingErrorStatus(response.status)

        let errorDetails = '';
        try {
            const errorData = await response.json();
            errorDetails = errorData.detail || JSON.stringify(errorData);
        } catch {
            errorDetails = await response.text();
        }
        throw new Error(`HTTP error! status: ${response.status}, details: ${errorDetails}`);
    }

    return await response.json();
}


// Delete employee relationships
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

// Helper function for deleting relations
async function deleteRelation(url, body) {
    const response = await fetch(url, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });

    if (!response.ok) {
        processingErrorStatus(response.status)

        let errorDetails = '';
        try {
            const errorData = await response.json();
            errorDetails = errorData.detail || JSON.stringify(errorData);
        } catch {
            errorDetails = await response.text();
        }
        throw new Error(`HTTP error! status: ${response.status}, details: ${errorDetails}`);
    }

    return response;
}

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
// Helper function
async function getCounts(name) {
    const response = await fetch(`${API_BASE_URL}/${name}/count`, {
        headers: {
            authorization: token()
        }
    });
    if (!response.ok) {
        processingErrorStatus(response.status)

        throw new Error(`Employee positions fetch failed: ${response.status}`, {
            status: response.status,
            data: await response.json()
        });
    }
    return await response.json();
}

export async function getGraph() {
    const res = await fetch(`${API_BASE_URL}/graph`, {
        headers: {
            authorization: token()
        }
    });
    const data = await res.json();

    return data
}

export async function getToken(data = {}){
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