export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export const token = () => {
    const accessToken = JSON.parse(localStorage.getItem('token_data'))?.access_token

    if (accessToken === undefined) {
        localStorage.removeItem('token_data');
        location.href = "/login"
    }

    return `Bearer ${accessToken}`
}
export const processingErrorStatus = (status) => {
    if ( status === 401){
        localStorage.removeItem('token_data');
        location.href = "/login"
    }

}
export async function createData(url, body) {
    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', authorization: token() },
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

export async function deleteRelation(url, body) {
    const response = await fetch(url, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', authorization: token()},
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

export async function getCounts(name) {
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

export async function assignRelation(url, body) {
    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', authorization: token() },
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

export const getData = async (url, useAuth=true) => {
    const response = await fetch(url, {
        headers: useAuth ? { authorization: token() } : {}
    });
    
    if (!response.ok) {
        processingErrorStatus(response.status)

        throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
}

export const updateData = async (url, body) => {
    const response = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', authorization: token() },
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

export const deleteData = async (url) => {
    const response = await fetch(url, {
        method: 'DELETE',
        headers: { authorization: token() }
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