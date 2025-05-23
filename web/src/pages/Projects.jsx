import { useEffect, useState } from "react";
import { Box, LinearProgress, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from "@mui/material";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { createProject, deleteProject, getProjects, updateProject } from "../services/api";


export default function Projects() {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [openFormDialog, setOpenFormDialog] = useState(false);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [selectedProject, setSelectedProject] = useState(null);
    const [formData, setFormData] = useState({ id: null, value: '', description: '' });

    const fetchProjects = async () => {
      setLoading(true);
      setError(null);

      getProjects().then(data => {
        setProjects(data || []);
      }).catch(err => {
        console.error("Failed to fetch projects:", err);
        setError(`Не удалось загрузить список проектов: ${err.message}`);
      }).finally(() => {
        setLoading(false);
      })
    };

    useEffect(() => {
      fetchProjects();
    }, []);

    const handleOpenCreateForm = () => {
      setSelectedProject(null);
      setFormData({ id: null, value: '', description: '' });
      setOpenFormDialog(true);
    };

    const handleOpenEditForm = (project) => {
      setSelectedProject(project);
      setFormData({ id: project.id, value: project.value, description: project.description });
      setOpenFormDialog(true);
    };

    const handleCloseFormDialog = () => {
      setOpenFormDialog(false);
      setSelectedProject(null);
      setFormData({ id: null, value: '', description: '' });
    };

    const handleOpenDeleteDialog = (project) => {
      setSelectedProject(project);
      setOpenDeleteDialog(true);
    };

    const handleCloseDeleteDialog = () => {
      setOpenDeleteDialog(false);
      setSelectedProject(null);
    };

    const handleFormChange = (event) => {
      const { name, value } = event.target;
      setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFormSubmit = async () => {
      setLoading(true);
      setError(null);

      const bodyData = {
          value: formData.value,
          description: formData.description
      };

      try {
        if (selectedProject) {
          await updateProject(selectedProject.id, bodyData)
        } else {
          await createProject(bodyData)
        }

        handleCloseFormDialog();
        await fetchProjects(); // Refresh list
      } catch (err) {
        console.error("Failed to save project:", err);
        setError(`${selectedProject ? "Не удалось обновить проект" : "Не удалось создать проект"}: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    const handleDeleteConfirm = async () => {
      if (!selectedProject) return;
      setLoading(true);
      setError(null);

      try {
        await deleteProject(selectedProject.id)

        handleCloseDeleteDialog();
        await fetchProjects(); // Refresh list
      } catch (err) {
        console.error("Failed to delete project:", err);
        setError(`Не удалось удалить проект: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    if (loading && projects.length === 0) {
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
            Проекты
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleOpenCreateForm}
          >
            Добавить проект
          </Button>
        </Box>

        {/* Error Message */}
        {error && <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>}

        {/* Loading Indicator */}
        {loading && <LinearProgress color="secondary" sx={{ mb: 2 }} />}

        {/* Projects Table */}
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} aria-label="projects table">
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Значение</TableCell> 
                <TableCell>Описание</TableCell>
                <TableCell align="right">Действия</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {projects.length === 0 && !loading ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">Нет данных</TableCell>
                </TableRow>
              ) : (
                projects.map((proj) => (
                  <TableRow
                    key={proj.id}
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  >
                    <TableCell component="th" scope="row">{proj.id}</TableCell>
                    <TableCell>{proj.value}</TableCell> 
                    <TableCell>{proj.description}</TableCell>
                    <TableCell align="right">
                      <IconButton color="primary" onClick={() => handleOpenEditForm(proj)} aria-label="edit">
                        <EditIcon />
                      </IconButton>
                      <IconButton color="error" onClick={() => handleOpenDeleteDialog(proj)} aria-label="delete">
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
          <DialogTitle>{selectedProject ? 'Редактировать проект' : 'Добавить проект'}</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              id="value"
              name="value"
              label="Значение проекта"
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
              Вы уверены, что хотите удалить проект "{selectedProject?.value}"?
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