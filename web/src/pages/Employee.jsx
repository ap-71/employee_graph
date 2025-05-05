import React, { useEffect, useState } from "react";
// import { useAuth } from "../context/AuthContext";
import { Box, LinearProgress, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Select, MenuItem, FormControl, InputLabel, Grid, CircularProgress, Tabs, Tab, List, ListItem, ListItemText, Divider, Chip, ListItemSecondaryAction, Tooltip } from "@mui/material";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import LinkIcon from '@mui/icons-material/Link';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { 
  getEmployees, 
  createEmployee, 
  updateEmployee, 
  deleteEmployee, 
  getDepartments,
  getPositions,
  getProjects,
  assignDepartmentToEmployee,
  assignPositionToEmployee,
  assignProjectToEmployee,
  linkEmployees,
  getEmployeeDepartments,
  getEmployeePositions,
  getEmployeeProjects,
  getEmployeeEmployee,
  removeEmployeeDepartment,
  removeEmployeePosition,
  removeEmployeeProject,
  unlinkEmployees
} from "../services/api";


export default function Employee() {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [openFormDialog, setOpenFormDialog] = useState(false);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState(null); // For editing/deleting
    const [formData, setFormData] = useState({ uuid: '', fio: '' }); // For create/edit form

    // State for relations dialog
    const [openRelationsDialog, setOpenRelationsDialog] = useState(false);
    const [relationsEmployee, setRelationsEmployee] = useState(null); // Employee whose relations are being managed
    const [relationsLoading, setRelationsLoading] = useState(false); // Loading state for dropdown data
    const [relationsError, setRelationsError] = useState(null); // Error state for dropdown data/assignment
    const [allDepartments, setAllDepartments] = useState([]);
    const [allPositions, setAllPositions] = useState([]);
    const [allProjects, setAllProjects] = useState([]);
    const [allOtherEmployees, setAllOtherEmployees] = useState([]);
    const [selectedDepartmentId, setSelectedDepartmentId] = useState('');
    const [selectedPositionId, setSelectedPositionId] = useState('');
    const [selectedProjectId, setSelectedProjectId] = useState('');
    const [selectedEmployee2Uuid, setSelectedEmployee2Uuid] = useState('');
    const [assigningRelation, setAssigningRelation] = useState(null); // Track which relation is being assigned (e.g., 'department')

    // State for view relationships dialog
    const [openViewRelationsDialog, setOpenViewRelationsDialog] = useState(false);
    const [viewRelationsEmployee, setViewRelationsEmployee] = useState(null);
    const [viewRelationsLoading, setViewRelationsLoading] = useState(false);
    const [viewRelationsError, setViewRelationsError] = useState(null);
    const [employeeDepartments, setEmployeeDepartments] = useState([]);
    const [employeePositions, setEmployeePositions] = useState([]);
    const [employeeProjects, setEmployeeProjects] = useState([]);
    const [linkedEmployees, setLinkedEmployees] = useState([]);
    const [currentTab, setCurrentTab] = useState(0);
    const [deletingRelation, setDeletingRelation] = useState(null); // Track which relation is being deleted

    const fetchEmployees = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getEmployees();
        setEmployees(data || []);
      } catch (err) {
        console.error("Failed to fetch employees:", err);
        setError(`Не удалось загрузить список сотрудников: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    useEffect(() => {
      fetchEmployees();
    }, []);

    const handleOpenCreateForm = () => {
      setSelectedEmployee(null);
      setFormData({ uuid: '', fio: '' });
      setOpenFormDialog(true);
    };

    const handleOpenEditForm = (employee) => {
      setSelectedEmployee(employee);
      setFormData({ uuid: employee.uuid, fio: employee.fio });
      setOpenFormDialog(true);
    };

    const handleCloseFormDialog = () => {
      setOpenFormDialog(false);
      setSelectedEmployee(null);
      setFormData({ uuid: '', fio: '' });
    };

    const handleOpenDeleteDialog = (employee) => {
      setSelectedEmployee(employee);
      setOpenDeleteDialog(true);
    };

    const handleCloseDeleteDialog = () => {
      setOpenDeleteDialog(false);
      setSelectedEmployee(null);
    };

    const handleFormChange = (event) => {
      const { name, value } = event.target;
      setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFormSubmit = async () => {
      setLoading(true); // Show loading indicator during submit
      setError(null); // Clear previous errors

      try {
        if (selectedEmployee) {
          // Update employee
          await updateEmployee(selectedEmployee.uuid, { fio: formData.fio });
        } else {
          // Create employee
          const newUuid = formData.uuid || self.crypto.randomUUID(); // Basic UUID generation
          await createEmployee({ uuid: newUuid, fio: formData.fio });
        }

        handleCloseFormDialog();
        await fetchEmployees(); // Refresh list after successful operation
      } catch (err) {
        console.error("Failed to save employee:", err);
        setError(`${selectedEmployee ? "Не удалось обновить сотрудника" : "Не удалось создать сотрудника"}: ${err.message}`);
        // Keep dialog open on error
      } finally {
        setLoading(false);
      }
    };

    const handleDeleteConfirm = async () => {
      if (!selectedEmployee) return;
      setLoading(true);
      setError(null);
      try {
        await deleteEmployee(selectedEmployee.uuid);
        handleCloseDeleteDialog();
        await fetchEmployees(); // Refresh list
      } catch (err) {
        console.error("Failed to delete employee:", err);
        setError(`Не удалось удалить сотрудника: ${err.message}`);
        // Keep dialog open or show error?
      } finally {
        setLoading(false);
      }
    };

    // --- Relations Dialog Functions ---

    const fetchRelationDropdownData = async (employeeUuid) => {
      setRelationsLoading(true);
      setRelationsError(null);
      try {
        // Fetch all available options and existing relationships
        const [
          departments, 
          positions, 
          projects, 
          employees, 
          employeeDepartments, 
          employeePositions, 
          employeeProjects, 
          linkedEmps
        ] = await Promise.all([
          getDepartments(),
          getPositions(),
          getProjects(),
          getEmployees(),
          getEmployeeDepartments(employeeUuid),
          getEmployeePositions(employeeUuid),
          getEmployeeProjects(employeeUuid),
          getEmployeeEmployee(employeeUuid)
        ]);

        // Filter out departments that are already assigned
        const existingDepartmentIds = (employeeDepartments || []).map(dept => dept.id);
        const availableDepartments = (departments || []).filter(dept => 
          !existingDepartmentIds.includes(dept.id)
        );
        
        // Filter out positions that are already assigned
        const existingPositionIds = (employeePositions || []).map(pos => pos.id);
        const availablePositions = (positions || []).filter(pos => 
          !existingPositionIds.includes(pos.id)
        );
        
        // Filter out projects that are already assigned
        const existingProjectIds = (employeeProjects || []).map(proj => proj.id);
        const availableProjects = (projects || []).filter(proj => 
          !existingProjectIds.includes(proj.id)
        );
        
        // Filter out employees that are already linked and the current employee
        const existingEmployeeUuids = (linkedEmps || []).map(emp => emp.uuid);
        const availableEmployees = (employees || []).filter(emp => 
          emp.uuid !== employeeUuid && !existingEmployeeUuids.includes(emp.uuid)
        );

        setAllDepartments(availableDepartments);
        setAllPositions(availablePositions);
        setAllProjects(availableProjects);
        setAllOtherEmployees(availableEmployees);

      } catch (err) {
        console.error("Failed to fetch data for relations dialog:", err);
        setRelationsError(`Не удалось загрузить данные для связей: ${err.message}`);
      } finally {
        setRelationsLoading(false);
      }
    };

    const handleOpenRelationsDialog = (employee) => {
      setRelationsEmployee(employee);
      setSelectedDepartmentId('');
      setSelectedPositionId('');
      setSelectedProjectId('');
      setSelectedEmployee2Uuid('');
      setRelationsError(null); // Clear previous errors
      setAssigningRelation(null);
      setOpenRelationsDialog(true);
      fetchRelationDropdownData(employee.uuid);
    };

    const handleCloseRelationsDialog = () => {
      setOpenRelationsDialog(false);
      setRelationsEmployee(null);
      setAllDepartments([]);
      setAllPositions([]);
      setAllProjects([]);
      setAllOtherEmployees([]);
      setRelationsError(null);
      setAssigningRelation(null);
    };

    // Generic function to assign a relation
    const assignRelation = async (type, assignFunction, ...params) => {
      setAssigningRelation(type); // Show loading on the specific button
      setRelationsError(null);
      try {
          await assignFunction(...params);
          // Refresh the dropdown data after successful assignment
          await fetchRelationDropdownData(relationsEmployee.uuid);
          // Reset the specific select
          if(type === 'department') setSelectedDepartmentId('');
          if(type === 'position') setSelectedPositionId('');
          if(type === 'project') setSelectedProjectId('');
          if(type === 'employee') setSelectedEmployee2Uuid('');
          console.log(`${type} assigned successfully`);

      } catch (err) {
          console.error(`Failed to assign ${type}:`, err);
          setRelationsError(`Не удалось назначить ${type}: ${err.message}`);
      } finally {
          setAssigningRelation(null); // Hide loading on the specific button
      }
    };

    const handleAssignDepartment = () => {
        if (!selectedDepartmentId || !relationsEmployee) return;
        assignRelation('department', assignDepartmentToEmployee, relationsEmployee.uuid, selectedDepartmentId);
    };

    const handleAssignPosition = () => {
      if (!selectedPositionId || !relationsEmployee) return;
      assignRelation('position', assignPositionToEmployee, relationsEmployee.uuid, selectedPositionId);
    };

    const handleAssignProject = () => {
      if (!selectedProjectId || !relationsEmployee) return;
      assignRelation('project', assignProjectToEmployee, relationsEmployee.uuid, selectedProjectId);
    };

    const handleAssignEmployee = () => {
      if (!selectedEmployee2Uuid || !relationsEmployee) return;
      assignRelation('employee', linkEmployees, relationsEmployee.uuid, selectedEmployee2Uuid);
    };

    // --- End Relations Dialog Functions ---

    const fetchEmployeeRelationships = async (employeeUuid) => {
      setViewRelationsLoading(true);
      setViewRelationsError(null);
      try {
        const [departments, positions, projects, employees] = await Promise.all([
          getEmployeeDepartments(employeeUuid),
          getEmployeePositions(employeeUuid),
          getEmployeeProjects(employeeUuid),
          getEmployeeEmployee(employeeUuid)
        ]);
        
        setEmployeeDepartments(departments || []);
        setEmployeePositions(positions || []);
        setEmployeeProjects(projects || []);
        setLinkedEmployees(employees || []);
      } catch (err) {
        console.error("Failed to fetch employee relationships:", err);
        setViewRelationsError(`Не удалось загрузить связи: ${err.message}`);
      } finally {
        setViewRelationsLoading(false);
      }
    };

    const handleOpenViewRelations = (employee) => {
      setViewRelationsEmployee(employee);
      setOpenViewRelationsDialog(true);
      setViewRelationsError(null);
      setCurrentTab(0);
      fetchEmployeeRelationships(employee.uuid);
    };

    const handleCloseViewRelations = () => {
      setOpenViewRelationsDialog(false);
      setViewRelationsEmployee(null);
      setEmployeeDepartments([]);
      setEmployeePositions([]);
      setEmployeeProjects([]);
      setLinkedEmployees([]);
    };

    const handleTabChange = (event, newValue) => {
      setCurrentTab(newValue);
    };

    // Functions to delete relationships
    const handleDeleteDepartment = async (departmentId) => {
      if (!viewRelationsEmployee) return;
      setDeletingRelation(`department-${departmentId}`);
      setViewRelationsError(null);
      try {
        await removeEmployeeDepartment(viewRelationsEmployee.uuid, departmentId);
        // Refresh relations after delete
        await fetchEmployeeRelationships(viewRelationsEmployee.uuid);
        // Also refresh data for relations dialog if it's the same employee
        if (relationsEmployee && relationsEmployee.uuid === viewRelationsEmployee.uuid) {
          await fetchRelationDropdownData(viewRelationsEmployee.uuid);
        }
      } catch (err) {
        console.error("Failed to delete department relation:", err);
        setViewRelationsError(`Не удалось удалить связь с отделом: ${err.message}`);
      } finally {
        setDeletingRelation(null);
      }
    };

    const handleDeletePosition = async (positionId) => {
      if (!viewRelationsEmployee) return;
      setDeletingRelation(`position-${positionId}`);
      setViewRelationsError(null);
      try {
        await removeEmployeePosition(viewRelationsEmployee.uuid, positionId);
        // Refresh relations after delete
        await fetchEmployeeRelationships(viewRelationsEmployee.uuid);
        // Also refresh data for relations dialog if it's the same employee
        if (relationsEmployee && relationsEmployee.uuid === viewRelationsEmployee.uuid) {
          await fetchRelationDropdownData(viewRelationsEmployee.uuid);
        }
      } catch (err) {
        console.error("Failed to delete position relation:", err);
        setViewRelationsError(`Не удалось удалить связь с должностью: ${err.message}`);
      } finally {
        setDeletingRelation(null);
      }
    };

    const handleDeleteProject = async (projectId) => {
      if (!viewRelationsEmployee) return;
      setDeletingRelation(`project-${projectId}`);
      setViewRelationsError(null);
      try {
        await removeEmployeeProject(viewRelationsEmployee.uuid, projectId);
        // Refresh relations after delete
        await fetchEmployeeRelationships(viewRelationsEmployee.uuid);
        // Also refresh data for relations dialog if it's the same employee
        if (relationsEmployee && relationsEmployee.uuid === viewRelationsEmployee.uuid) {
          await fetchRelationDropdownData(viewRelationsEmployee.uuid);
        }
      } catch (err) {
        console.error("Failed to delete project relation:", err);
        setViewRelationsError(`Не удалось удалить связь с проектом: ${err.message}`);
      } finally {
        setDeletingRelation(null);
      }
    };

    const handleUnlinkEmployee = async (employee2Uuid) => {
      if (!viewRelationsEmployee) return;
      setDeletingRelation(`employee-${employee2Uuid}`);
      setViewRelationsError(null);
      try {
        await unlinkEmployees(viewRelationsEmployee.uuid, employee2Uuid);
        // Refresh relations after delete
        await fetchEmployeeRelationships(viewRelationsEmployee.uuid);
        // Also refresh data for relations dialog if it's the same employee
        if (relationsEmployee && relationsEmployee.uuid === viewRelationsEmployee.uuid) {
          await fetchRelationDropdownData(viewRelationsEmployee.uuid);
        }
      } catch (err) {
        console.error("Failed to unlink employee:", err);
        setViewRelationsError(`Не удалось удалить связь с сотрудником: ${err.message}`);
      } finally {
        setDeletingRelation(null);
      }
    };

    if (loading && employees.length === 0) { // Show loading only on initial load
      return (
        <Box sx={{ width: '100%', mt: 4 }}>
          <LinearProgress color="secondary" />
        </Box>
      );
    }

    return (
      <Box sx={{ flexGrow: 1, p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4">
            Сотрудники
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleOpenCreateForm}
          >
            Добавить сотрудника
          </Button>
        </Box>

        {error && <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>}
        
        {loading && <LinearProgress color="secondary" sx={{ mb: 2 }} />} 

        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell>UUID</TableCell>
                <TableCell>ФИО</TableCell>
                <TableCell align="right">Действия</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {employees.length === 0 && !loading ? (
                <TableRow>
                  <TableCell colSpan={3} align="center">Нет данных</TableCell>
                </TableRow>
              ) : (
                employees.map((employee) => (
                  <TableRow
                    key={employee.uuid}
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  >
                    <TableCell component="th" scope="row">
                      {employee.uuid}
                    </TableCell>
                    <TableCell>{employee.fio}</TableCell>
                    <TableCell align="right">
                      <IconButton color="primary" onClick={() => handleOpenEditForm(employee)} aria-label="edit">
                        <EditIcon />
                      </IconButton>
                      <IconButton color="error" onClick={() => handleOpenDeleteDialog(employee)} aria-label="delete">
                        <DeleteIcon />
                      </IconButton>
                      <IconButton color="secondary" onClick={() => handleOpenRelationsDialog(employee)} aria-label="manage relations">
                        <LinkIcon />
                      </IconButton>
                      <IconButton color="info" onClick={() => handleOpenViewRelations(employee)} aria-label="view relations">
                        <VisibilityIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Form Dialog (Create/Edit) */}
        <Dialog open={openFormDialog} onClose={handleCloseFormDialog}>
          <DialogTitle>{selectedEmployee ? 'Редактировать сотрудника' : 'Добавить сотрудника'}</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              id="fio"
              name="fio"
              label="ФИО"
              type="text"
              fullWidth
              variant="standard"
              value={formData.fio}
              onChange={handleFormChange}
              required
            />
            {!selectedEmployee && ( // Only show UUID for creation if needed, often backend generates this
               <TextField
                 margin="dense"
                 id="uuid"
                 name="uuid"
                 label="UUID (optional)"
                 type="text"
                 fullWidth
                 variant="standard"
                 value={formData.uuid}
                 onChange={handleFormChange}
                 helperText="Leave blank if backend generates UUID"
               />
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseFormDialog}>Отмена</Button>
            <Button onClick={handleFormSubmit} variant="contained" disabled={loading || !formData.fio}>
              {loading ? 'Сохранение...' : 'Сохранить'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={openDeleteDialog}
          onClose={handleCloseDeleteDialog}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">
            {"Подтвердить удаление"}
          </DialogTitle>
          <DialogContent>
            <Typography>
              Вы уверены, что хотите удалить сотрудника {selectedEmployee?.fio}?
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDeleteDialog}>Отмена</Button>
            <Button onClick={handleDeleteConfirm} color="error" autoFocus disabled={loading}>
              {loading ? 'Удаление...' : 'Удалить'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* View Relationships Dialog */}
        <Dialog 
          open={openViewRelationsDialog} 
          onClose={handleCloseViewRelations} 
          fullWidth 
          maxWidth="md"
        >
          <DialogTitle>Связи сотрудника: {viewRelationsEmployee?.fio}</DialogTitle>
          <DialogContent>
            {viewRelationsLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
              </Box>
            ) : (
              <>
                <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                  <Tabs value={currentTab} onChange={handleTabChange} aria-label="relationship tabs">
                    <Tab label="Отделы" />
                    <Tab label="Должности" />
                    <Tab label="Проекты" />
                    <Tab label="Связанные сотрудники" />
                  </Tabs>
                </Box>
                
                {currentTab === 0 && (
                  <Box sx={{ p: 1 }}>
                    {employeeDepartments.length === 0 ? (
                      <Typography color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                        Сотрудник не привязан к отделам
                      </Typography>
                    ) : (
                      <List>
                        {employeeDepartments.map((dept) => (
                          <React.Fragment key={dept.id}>
                            <ListItem>
                              <ListItemText 
                                primary={dept.name}
                                secondary={`ID: ${dept.id}`}
                              />
                              <ListItemSecondaryAction>
                                <Tooltip title="Удалить связь">
                                  <IconButton 
                                    edge="end" 
                                    color="error" 
                                    onClick={() => handleDeleteDepartment(dept.id)}
                                    disabled={deletingRelation === `department-${dept.id}`}
                                  >
                                    {deletingRelation === `department-${dept.id}` ? 
                                      <CircularProgress size={20} color="inherit" /> : 
                                      <DeleteIcon />
                                    }
                                  </IconButton>
                                </Tooltip>
                              </ListItemSecondaryAction>
                            </ListItem>
                            <Divider component="li" />
                          </React.Fragment>
                        ))}
                      </List>
                    )}
                  </Box>
                )}
                
                {currentTab === 1 && (
                  <Box sx={{ p: 1 }}>
                    {employeePositions.length === 0 ? (
                      <Typography color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                        Сотрудник не имеет должностей
                      </Typography>
                    ) : (
                      <List>
                        {employeePositions.map((pos) => (
                          <React.Fragment key={pos.id}>
                            <ListItem>
                              <ListItemText 
                                primary={pos.value}
                                secondary={`ID: ${pos.id}`}
                              />
                              <ListItemSecondaryAction>
                                <Tooltip title="Удалить связь">
                                  <IconButton 
                                    edge="end" 
                                    color="error"
                                    onClick={() => handleDeletePosition(pos.id)}
                                    disabled={deletingRelation === `position-${pos.id}`}
                                  >
                                    {deletingRelation === `position-${pos.id}` ? 
                                      <CircularProgress size={20} color="inherit" /> : 
                                      <DeleteIcon />
                                    }
                                  </IconButton>
                                </Tooltip>
                              </ListItemSecondaryAction>
                            </ListItem>
                            <Divider component="li" />
                          </React.Fragment>
                        ))}
                      </List>
                    )}
                  </Box>
                )}
                
                {currentTab === 2 && (
                  <Box sx={{ p: 1 }}>
                    {employeeProjects.length === 0 ? (
                      <Typography color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                        Сотрудник не привязан к проектам
                      </Typography>
                    ) : (
                      <List>
                        {employeeProjects.map((proj) => (
                          <React.Fragment key={proj.id}>
                            <ListItem>
                              <ListItemText 
                                primary={proj.value}
                                secondary={`ID: ${proj.id}`}
                              />
                              <ListItemSecondaryAction>
                                <Tooltip title="Удалить связь">
                                  <IconButton 
                                    edge="end" 
                                    color="error"
                                    onClick={() => handleDeleteProject(proj.id)}
                                    disabled={deletingRelation === `project-${proj.id}`}
                                  >
                                    {deletingRelation === `project-${proj.id}` ? 
                                      <CircularProgress size={20} color="inherit" /> : 
                                      <DeleteIcon />
                                    }
                                  </IconButton>
                                </Tooltip>
                              </ListItemSecondaryAction>
                            </ListItem>
                            <Divider component="li" />
                          </React.Fragment>
                        ))}
                      </List>
                    )}
                  </Box>
                )}
                
                {currentTab === 3 && (
                  <Box sx={{ p: 1 }}>
                    {linkedEmployees.length === 0 ? (
                      <Typography color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                        Нет связанных сотрудников
                      </Typography>
                    ) : (
                      <List>
                        {linkedEmployees.map((emp) => (
                          <React.Fragment key={emp.uuid}>
                            <ListItem>
                              <ListItemText 
                                primary={emp.fio}
                                secondary={`UUID: ${emp.uuid}`}
                              />
                              <ListItemSecondaryAction>
                                <Tooltip title="Удалить связь">
                                  <IconButton 
                                    edge="end" 
                                    color="error"
                                    onClick={() => handleUnlinkEmployee(emp.uuid)}
                                    disabled={deletingRelation === `employee-${emp.uuid}`}
                                  >
                                    {deletingRelation === `employee-${emp.uuid}` ? 
                                      <CircularProgress size={20} color="inherit" /> : 
                                      <DeleteIcon />
                                    }
                                  </IconButton>
                                </Tooltip>
                              </ListItemSecondaryAction>
                            </ListItem>
                            <Divider component="li" />
                          </React.Fragment>
                        ))}
                      </List>
                    )}
                  </Box>
                )}
              </>
            )}
            
            {viewRelationsError && 
              <Typography color="error" sx={{ mt: 2 }}>
                {viewRelationsError}
              </Typography>
            }
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseViewRelations}>Закрыть</Button>
          </DialogActions>
        </Dialog>

        {/* Relations Management Dialog */}
        <Dialog 
          open={openRelationsDialog} 
          onClose={handleCloseRelationsDialog} 
          fullWidth 
          maxWidth="md"
        >
          <DialogTitle>Управление связями для: {relationsEmployee?.fio}</DialogTitle>
          <DialogContent>
            {relationsLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                 <CircularProgress />
              </Box>
            ) : (
              <Grid container spacing={3} sx={{ pt: 1 }}>
                {/* Department Assignment */}
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>Отдел</Typography>
                  {allDepartments.length === 0 ? (
                    <Typography color="text.secondary" variant="body2" sx={{ mb: 2 }}>
                      Все доступные отделы уже назначены
                    </Typography>
                  ) : (
                    <>
                      <FormControl fullWidth sx={{ mb: 1 }}>
                        <InputLabel id="department-select-label">Выбрать отдел</InputLabel>
                        <Select
                          labelId="department-select-label"
                          id="department-select"
                          value={selectedDepartmentId}
                          label="Выбрать отдел"
                          onChange={(e) => setSelectedDepartmentId(e.target.value)}
                          disabled={assigningRelation === 'department'}
                        >
                          <MenuItem value=""><em>Не выбрано</em></MenuItem>
                          {allDepartments.map((dept) => (
                            <MenuItem key={dept.id} value={dept.id}>{dept.name}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      <Button 
                        onClick={handleAssignDepartment} 
                        variant="contained" 
                        size="small"
                        disabled={!selectedDepartmentId || !!assigningRelation}
                        startIcon={assigningRelation === 'department' ? <CircularProgress size={20} color="inherit" /> : null}
                      >
                        Назначить отдел
                      </Button>
                    </>
                  )}
                </Grid>

                {/* Position Assignment */}
                 <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>Должность</Typography>
                  {allPositions.length === 0 ? (
                    <Typography color="text.secondary" variant="body2" sx={{ mb: 2 }}>
                      Все доступные должности уже назначены
                    </Typography>
                  ) : (
                    <>
                      <FormControl fullWidth sx={{ mb: 1 }}>
                        <InputLabel id="position-select-label">Выбрать должность</InputLabel>
                        <Select
                          labelId="position-select-label"
                          id="position-select"
                          value={selectedPositionId}
                          label="Выбрать должность"
                          onChange={(e) => setSelectedPositionId(e.target.value)}
                          disabled={assigningRelation === 'position'}
                        >
                          <MenuItem value=""><em>Не выбрано</em></MenuItem>
                          {allPositions.map((pos) => (
                            <MenuItem key={pos.id} value={pos.id}>{pos.value}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                       <Button 
                        onClick={handleAssignPosition} 
                        variant="contained" 
                        size="small"
                        disabled={!selectedPositionId || !!assigningRelation}
                        startIcon={assigningRelation === 'position' ? <CircularProgress size={20} color="inherit" /> : null}
                      >
                         Назначить должность
                      </Button>
                    </>
                  )}
                </Grid>

                {/* Project Assignment */}
                 <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>Проект</Typography>
                  {allProjects.length === 0 ? (
                    <Typography color="text.secondary" variant="body2" sx={{ mb: 2 }}>
                      Все доступные проекты уже назначены
                    </Typography>
                  ) : (
                    <>
                      <FormControl fullWidth sx={{ mb: 1 }}>
                        <InputLabel id="project-select-label">Выбрать проект</InputLabel>
                        <Select
                          labelId="project-select-label"
                          id="project-select"
                          value={selectedProjectId}
                          label="Выбрать проект"
                          onChange={(e) => setSelectedProjectId(e.target.value)}
                          disabled={assigningRelation === 'project'}
                        >
                          <MenuItem value=""><em>Не выбрано</em></MenuItem>
                          {allProjects.map((proj) => (
                            <MenuItem key={proj.id} value={proj.id}>{proj.value}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                       <Button 
                        onClick={handleAssignProject} 
                        variant="contained" 
                        size="small"
                        disabled={!selectedProjectId || !!assigningRelation}
                        startIcon={assigningRelation === 'project' ? <CircularProgress size={20} color="inherit" /> : null}
                      >
                        Назначить проект
                      </Button>
                    </>
                  )}
                </Grid>

                 {/* Employee Assignment */}
                 <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>Связать с сотрудником</Typography>
                  {allOtherEmployees.length === 0 ? (
                    <Typography color="text.secondary" variant="body2" sx={{ mb: 2 }}>
                      Все доступные сотрудники уже связаны
                    </Typography>
                  ) : (
                    <>
                      <FormControl fullWidth sx={{ mb: 1 }}>
                        <InputLabel id="employee-select-label">Выбрать сотрудника</InputLabel>
                        <Select
                          labelId="employee-select-label"
                          id="employee-select"
                          value={selectedEmployee2Uuid}
                          label="Выбрать сотрудника"
                          onChange={(e) => setSelectedEmployee2Uuid(e.target.value)}
                          disabled={assigningRelation === 'employee'}
                        >
                          <MenuItem value=""><em>Не выбрано</em></MenuItem>
                          {allOtherEmployees.map((emp) => (
                            <MenuItem key={emp.uuid} value={emp.uuid}>{emp.fio}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                       <Button 
                        onClick={handleAssignEmployee} 
                        variant="contained" 
                        size="small"
                        disabled={!selectedEmployee2Uuid || !!assigningRelation}
                        startIcon={assigningRelation === 'employee' ? <CircularProgress size={20} color="inherit" /> : null}
                      >
                         Связать
                      </Button>
                    </>
                  )}
                </Grid>

              </Grid>
            )}
            {relationsError && 
              <Typography color="error" sx={{ mt: 2 }}>
                {relationsError}
              </Typography>
            }
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseRelationsDialog}>Закрыть</Button>
          </DialogActions>
        </Dialog>

      </Box>
    );
  } 