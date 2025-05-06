import { useEffect, useState } from "react";
// import { useAuth } from "../context/AuthContext"; // Uncomment if auth is needed
import { Box, LinearProgress, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from "@mui/material";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

// Base URL for the API
const API_BASE_URL = 'http://localhost:8000'; // Adjust if necessary

export default function Departments() {
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [openFormDialog, setOpenFormDialog] = useState(false);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [selectedDepartment, setSelectedDepartment] = useState(null); // For editing/deleting
    const [formData, setFormData] = useState({ id: null, name: '', description: '' }); // For create/edit form

    const fetchDepartments = async () => {
      setLoading(true);
      setError(null);
      try {
        // API Call: mcp_fastapi-mcp_get_departments_departments__get
        const response = await fetch(`${API_BASE_URL}/departments/`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setDepartments(data || []);
      } catch (err) {
        console.error("Failed to fetch departments:", err);
        setError(`Не удалось загрузить список отделов: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    useEffect(() => {
      fetchDepartments();
    }, []);

    const handleOpenCreateForm = () => {
      setSelectedDepartment(null);
      setFormData({ id: null, name: '', description: '' });
      setOpenFormDialog(true);
    };

    const handleOpenEditForm = (department) => {
      setSelectedDepartment(department);
      setFormData({ id: department.id, name: department.name, description: department.description });
      setOpenFormDialog(true);
    };

    const handleCloseFormDialog = () => {
      setOpenFormDialog(false);
      setSelectedDepartment(null);
      setFormData({ id: null, name: '', description: '' });
    };

    const handleOpenDeleteDialog = (department) => {
      setSelectedDepartment(department);
      setOpenDeleteDialog(true);
    };

    const handleCloseDeleteDialog = () => {
      setOpenDeleteDialog(false);
      setSelectedDepartment(null);
    };

    const handleFormChange = (event) => {
      const { name, value } = event.target;
      setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFormSubmit = async () => {
      setLoading(true);
      setError(null);
      let url = '';
      let options = {};
      const bodyData = {
          name: formData.name,
          description: formData.description
      };

      try {
        if (selectedDepartment) {
          // Update Department: mcp_fastapi-mcp_update_department_departments__id__put
          url = `${API_BASE_URL}/departments/${selectedDepartment.id}`;
          options = {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bodyData)
          };
        } else {
          // Create Department: mcp_fastapi-mcp_create_department_departments__post
          url = `${API_BASE_URL}/departments/`;
          options = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bodyData)
          };
        }

        const response = await fetch(url, options);
        if (!response.ok) {
          let errorDetails = '';
          try {
            const errorData = await response.json();
            errorDetails = errorData.detail || JSON.stringify(errorData);
          } catch {
             errorDetails = await response.text();
          }
          throw new Error(`HTTP error! status: ${response.status}, details: ${errorDetails}`);
        }

        handleCloseFormDialog();
        await fetchDepartments(); // Refresh list
      } catch (err) {
        console.error("Failed to save department:", err);
        setError(`${selectedDepartment ? "Не удалось обновить отдел" : "Не удалось создать отдел"}: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    const handleDeleteConfirm = async () => {
      if (!selectedDepartment) return;
      setLoading(true);
      setError(null);
      try {
        // Delete Department: mcp_fastapi-mcp_delete_department_departments__id__delete
        const response = await fetch(`${API_BASE_URL}/departments/${selectedDepartment.id}`, {
          method: 'DELETE'
        });

        if (!response.ok) {
           let errorDetails = '';
           try {
             const errorData = await response.json();
             errorDetails = errorData.detail || JSON.stringify(errorData);
           } catch {
              errorDetails = await response.text();
           }
          throw new Error(`HTTP error! status: ${response.status}, details: ${errorDetails}`);
        }

        handleCloseDeleteDialog();
        await fetchDepartments(); // Refresh list
      } catch (err) {
        console.error("Failed to delete department:", err);
        setError(`Не удалось удалить отдел: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    // --- UI ---
    if (loading && departments.length === 0) {
      return (
        <Box sx={{ width: '100%', mt: 4 }}>
          <LinearProgress color="secondary" />
        </Box>
      );
    }

    return (
      <Box sx={{ flexGrow: 1, p: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4">
            Отделы
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleOpenCreateForm}
          >
            Добавить отдел
          </Button>
        </Box>

        {/* Error Message */}
        {error && <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>}

        {/* Loading Indicator */}
        {loading && <LinearProgress color="secondary" sx={{ mb: 2 }} />}

        {/* Departments Table */}
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} aria-label="departments table">
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Название</TableCell>
                <TableCell>Описание</TableCell>
                <TableCell align="right">Действия</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {departments.length === 0 && !loading ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">Нет данных</TableCell>
                </TableRow>
              ) : (
                departments.map((dept) => (
                  <TableRow
                    key={dept.id}
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  >
                    <TableCell component="th" scope="row">{dept.id}</TableCell>
                    <TableCell>{dept.name}</TableCell>
                    <TableCell>{dept.description}</TableCell>
                    <TableCell align="right">
                      <IconButton color="primary" onClick={() => handleOpenEditForm(dept)} aria-label="edit">
                        <EditIcon />
                      </IconButton>
                      <IconButton color="error" onClick={() => handleOpenDeleteDialog(dept)} aria-label="delete">
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Form Dialog (Create/Edit) */}
        <Dialog open={openFormDialog} onClose={handleCloseFormDialog} fullWidth maxWidth="sm">
          <DialogTitle>{selectedDepartment ? 'Редактировать отдел' : 'Добавить отдел'}</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              id="name"
              name="name"
              label="Название отдела"
              type="text"
              fullWidth
              variant="standard"
              value={formData.name}
              onChange={handleFormChange}
              required
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              id="description"
              name="description"
              label="Описание"
              type="text"
              fullWidth
              variant="standard"
              value={formData.description}
              onChange={handleFormChange}
              required
              multiline
              rows={3}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseFormDialog}>Отмена</Button>
            <Button onClick={handleFormSubmit} variant="contained" disabled={loading || !formData.name || !formData.description}>
              {loading ? 'Сохранение...' : 'Сохранить'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={openDeleteDialog}
          onClose={handleCloseDeleteDialog}
        >
          <DialogTitle>Подтвердить удаление</DialogTitle>
          <DialogContent>
            <Typography>
              Вы уверены, что хотите удалить отдел "{selectedDepartment?.name}"?
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDeleteDialog}>Отмена</Button>
            <Button onClick={handleDeleteConfirm} color="error" autoFocus disabled={loading}>
              {loading ? 'Удаление...' : 'Удалить'}
            </Button>
          </DialogActions>
        </Dialog>

      </Box>
    );
  } 