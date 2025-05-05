import { useEffect, useState } from "react";
import { Box, LinearProgress, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from "@mui/material";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

// Base URL for the API
const API_BASE_URL = 'http://localhost:8000'; // Adjust if necessary

export default function Positions() {
    const [positions, setPositions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [openFormDialog, setOpenFormDialog] = useState(false);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [selectedPosition, setSelectedPosition] = useState(null); // For editing/deleting
    const [formData, setFormData] = useState({ id: null, value: '', description: '' }); // For create/edit form

    const fetchPositions = async () => {
      setLoading(true);
      setError(null);
      try {
        // API Call: mcp_fastapi-mcp_get_positions_positions__get
        const response = await fetch(`${API_BASE_URL}/positions/`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setPositions(data || []);
      } catch (err) {
        console.error("Failed to fetch positions:", err);
        setError(`Не удалось загрузить список должностей: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    useEffect(() => {
      fetchPositions();
    }, []);

    const handleOpenCreateForm = () => {
      setSelectedPosition(null);
      setFormData({ id: null, value: '', description: '' });
      setOpenFormDialog(true);
    };

    const handleOpenEditForm = (position) => {
      setSelectedPosition(position);
      setFormData({ id: position.id, value: position.value, description: position.description });
      setOpenFormDialog(true);
    };

    const handleCloseFormDialog = () => {
      setOpenFormDialog(false);
      setSelectedPosition(null);
      setFormData({ id: null, value: '', description: '' });
    };

    const handleOpenDeleteDialog = (position) => {
      setSelectedPosition(position);
      setOpenDeleteDialog(true);
    };

    const handleCloseDeleteDialog = () => {
      setOpenDeleteDialog(false);
      setSelectedPosition(null);
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
          value: formData.value,
          description: formData.description
      };

      try {
        if (selectedPosition) {
          // Update Position: mcp_fastapi-mcp_update_position_positions__id__put
          url = `${API_BASE_URL}/positions/${selectedPosition.id}`;
          options = {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bodyData)
          };
        } else {
          // Create Position: mcp_fastapi-mcp_create_position_positions__post
          url = `${API_BASE_URL}/positions/`;
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
        await fetchPositions(); // Refresh list
      } catch (err) {
        console.error("Failed to save position:", err);
        setError(`${selectedPosition ? "Не удалось обновить должность" : "Не удалось создать должность"}: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    const handleDeleteConfirm = async () => {
      if (!selectedPosition) return;
      setLoading(true);
      setError(null);
      try {
        // Delete Position: mcp_fastapi-mcp_delete_position_positions__id__delete
        const response = await fetch(`${API_BASE_URL}/positions/${selectedPosition.id}`, {
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
        await fetchPositions(); // Refresh list
      } catch (err) {
        console.error("Failed to delete position:", err);
        setError(`Не удалось удалить должность: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    // --- UI ---
    if (loading && positions.length === 0) {
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
            Должности
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleOpenCreateForm}
          >
            Добавить должность
          </Button>
        </Box>

        {/* Error Message */}
        {error && <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>}

        {/* Loading Indicator */}
        {loading && <LinearProgress color="secondary" sx={{ mb: 2 }} />}

        {/* Positions Table */}
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} aria-label="positions table">
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Значение</TableCell> {/* Changed from Название */} 
                <TableCell>Описание</TableCell>
                <TableCell align="right">Действия</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {positions.length === 0 && !loading ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">Нет данных</TableCell>
                </TableRow>
              ) : (
                positions.map((pos) => (
                  <TableRow
                    key={pos.id}
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  >
                    <TableCell component="th" scope="row">{pos.id}</TableCell>
                    <TableCell>{pos.value}</TableCell> {/* Changed from pos.name */} 
                    <TableCell>{pos.description}</TableCell>
                    <TableCell align="right">
                      <IconButton color="primary" onClick={() => handleOpenEditForm(pos)} aria-label="edit">
                        <EditIcon />
                      </IconButton>
                      <IconButton color="error" onClick={() => handleOpenDeleteDialog(pos)} aria-label="delete">
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
          <DialogTitle>{selectedPosition ? 'Редактировать должность' : 'Добавить должность'}</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              id="value"
              name="value"
              label="Значение должности"
              type="text"
              fullWidth
              variant="standard"
              value={formData.value}
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
            <Button onClick={handleFormSubmit} variant="contained" disabled={loading || !formData.value || !formData.description}>
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
              Вы уверены, что хотите удалить должность "{selectedPosition?.value}"? {/* Changed from name */} 
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