import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import {
  createNode,
  createNodeType,
  createSection,
  getNodesBySection,
  getNodeTypes,
  getSectionById,
  getSections,
} from "../services/api";
import AddIcon from "@mui/icons-material/Add";
import Employee from "./Employee";
import Departments from "./Departments";
import Positions from "./Positions";
import Projects from "./Projects";
import { useLocation } from "wouter";

const defaultFormData = {
  name: "",
  description: "",
};

export const Section = ({ name = "Разделы", buttonName } = {}) => {
  const [, navigate] = useLocation();
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ ...defaultFormData });
  const [openCreateSection, setOpenCreateSection] = useState(false);

  const handleLoadSections = useCallback(() => {
    getSections()
      .then((sections) => {
        if (sections.length === 0) {
          console.warn("No sections found");
        } else {
          setSections(sections);
        }
      })
      .catch((error) => {
        console.error(`Error fetching sections: ${error.message}`);
      });
  }, []);

  useEffect(() => {
    handleLoadSections();
  }, [handleLoadSections]);

  const handleOpenCreateSection = () => {
    setOpenCreateSection(true);
    setFormData({ ...defaultFormData });
  };
  const handleCloseFormDialog = () => {
    setOpenCreateSection(false);
    setFormData({ ...defaultFormData });
  };
  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };
  const handleFormSubmit = async () => {
    setLoading(true);
    createSection(formData)
      .then(() => {
        setLoading(false);
        handleCloseFormDialog();
        handleLoadSections();
      })
      .catch((error) => {
        console.error(`Error creating section: ${error.message}`);
        setLoading(false);
      });
  };
  return (
    <Stack sx={{ p: 2, width: "50vw" }}>
      <Stack
        direction="row"
        justifyContent="space-between"
        sx={{ mb: 2, width: "100%" }}
      >
        <Typography variant="h4">{name}</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleOpenCreateSection}
        >
          {buttonName || "Добавить раздел"}
        </Button>
      </Stack>

      <Stack spacing={2} sx={{ mb: 2 }}>
        <Button
          color="inherit"
          onClick={() => navigate(`/management/sections/st_0`)}
          sx={{
            transition: "color 0.2s",
            textTransform: "none",
            alignItems: "flex-start",
            justifyContent: "flex-start",
            "&:hover": {
              color: "primary.main",
            },
          }}
        >
          Сотрудники, отделы, должности и проекты
        </Button>
      </Stack>
      {sections.length > 0 && (
        <Stack spacing={2} sx={{ mb: 2 }}>
          {sections.map((section) => (
            <Button
              key={section.id}
              color="inherit"
              onClick={() => navigate(`/management/sections/${section.id}`)}
              sx={{
                transition: "color 0.2s",
                textTransform: "none",
                alignItems: "flex-start",
                justifyContent: "flex-start",
                "&:hover": {
                  color: "primary.main",
                },
              }}
            >
              {section.name || section.description || "Неизвестно"}
            </Button>
          ))}
        </Stack>
      )}

      <Dialog open={openCreateSection} onClose={handleOpenCreateSection}>
        <DialogTitle>Добавление раздела</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id="name"
            name="name"
            label="Название раздела"
            type="text"
            fullWidth
            variant="standard"
            value={formData.name}
            onChange={handleFormChange}
            required
          />
          <TextField
            autoFocus
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
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseFormDialog}>Отмена</Button>
          <Button
            onClick={handleFormSubmit}
            variant="contained"
            disabled={loading || !formData.name}
          >
            {loading ? "Сохранение..." : "Сохранить"}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
};

export const ConcretSection = ({ sectionId }) => {
  const defaultNodeFormData = {
    name: "",
    description: "",
    type_id: "",
    section_id: sectionId,
  };

  const defaultNodeTypeFormData = {
    name: "",
    description: "",
  };
  const [sectionData, setSectionData] = useState({});
  const [nodesData, setNodesData] = useState([]);
  const [formData, setFormData] = useState({ ...defaultNodeFormData });
  const [formNodeTypeData, setFormNodeTypeData] = useState({
    ...defaultNodeTypeFormData,
  });
  const [openDialogAdd, setOpenDialogAdd] = useState(false);
  const [openDialogNodeTypeAdd, setOpenDialogNodeTypeAdd] = useState(false);
  const [nodeTypes, setNodeTypes] = useState([]);

  const loadSectionData = useCallback(() => {
    getSectionById({ sectionId })
      .then((section) => {
        if (!section) {
          console.warn(`Section with id ${sectionId} not found`);
          return;
        }
        setSectionData(section);
      })
      .catch((error) => {
        console.error(`Error fetching section data: ${error.message}`);
      });
  }, [sectionId]);

  const loadNodes = useCallback(() => {
    getNodesBySection({ sectionId })
      .then((nodes) => {
        if (nodes.length === 0) {
          console.warn("No nodes found for this section");
        } else {
          const tmp = {};
          nodes.forEach((node) => {
            if (!tmp[node.type.name]) {
              tmp[node.type.name] = [];
            }
            tmp[node.type.name].push(node);
          });
          setNodesData(tmp);
        }
      })
      .catch((error) => {
        console.error(`Error fetching nodes: ${error.message}`);
      });
  }, [sectionId]);

  const loadNodeTypes = useCallback(() => {
    getNodeTypes()
      .then((types) => {
        if (types.length === 0) {
          console.warn("No node types found");
        } else {
          setNodeTypes(types);
        }
      })
      .catch((error) => {
        console.error(`Error fetching node types: ${error.message}`);
      });
  }, [setNodeTypes]);

  const handleFormSubmit = () => {
    createNode(formData)
      .then(() => {
        setOpenDialogAdd(false);
        setFormData({ ...defaultNodeFormData });
        loadNodes();
      })
      .catch((error) => {
        console.error(`Error creating node: ${error.message}`);
      });
  };
  const handleFormNodeTypeSubmit = () => {
    createNodeType(formNodeTypeData)
      .then((obj) => {
        setOpenDialogNodeTypeAdd(false);
        setFormNodeTypeData({ ...defaultNodeTypeFormData });
        loadNodeTypes();
        setFormData((prev) => ({ ...prev, type_id: obj.id }));
      })
      .catch((error) => {
        console.error(`Error creating node type: ${error.message}`);
      });
  };

  useEffect(() => {
    if (sectionId === "st_0") {
      return;
    }
    // Загружаем узлы при монтировании компонента
    loadNodes();
    loadSectionData();
  }, [loadNodeTypes, loadNodes, loadSectionData, sectionId]);

  useEffect(() => {
    // Если раздел "st_0", то не загружать типы узлов
    if (sectionId === "st_0") {
      return;
    }

    // Если открыто диалоговое окно добавления, то загружать типы узлов
    if (openDialogAdd) {
      loadNodeTypes();
    }
  }, [loadNodeTypes, openDialogAdd, sectionId]);

  if (sectionId === "st_0") {
    return (
      <Stack sx={{ p: 2, width: "50vw" }}>
        <Employee />
        <Departments />
        <Positions />
        <Projects />
      </Stack>
    );
  }

  return (
    <Stack sx={{ p: 2, width: "50vw" }}>
      <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
        <Typography
          variant="h4"
          overflow="hidden"
          textOverflow="ellipsis"
          whiteSpace="nowrap"
          width="99%"
        >
          Раздел: {sectionData?.name || sectionData?.description || "Неизвестно"}
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => setOpenDialogAdd(true)}
        >
          Добавить
        </Button>
      </Stack>
      {Object.keys(nodesData).length === 0 && (
        <Typography variant="body1">Здесь пока еще ничего нет.</Typography>
      )}
      {Object.entries(nodesData).map(([key, node]) => {
        return (
          <Stack>
            <Typography key={key} variant="h5">
              {key}
            </Typography>
            <Stack direction="column" sx={{ mb: 2 }}>
              {node.map((item) => (<div>{item.description || item.name}</div>))}
            </Stack>
          </Stack>
        );
      })}

      <Dialog open={openDialogAdd} onClose={() => setOpenDialogAdd(false)}>
        <DialogTitle>Раздел {sectionData.name || sectionData.description}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id="name"
            name="name"
            label="Название"
            type="text"
            fullWidth
            variant="standard"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <Stack direction="row" sx={{ width: 500, mt: 2 }}>
            <FormControl fullWidth variant="standard">
              <InputLabel id="type-label">Тип *</InputLabel>
              <Select
                labelId="type-label"
                id="type"
                name="type"
                value={formData.type_id}
                onChange={(e) =>
                  setFormData({ ...formData, type_id: e.target.value })
                }
                required
              >
                {nodeTypes?.map((type) => (
                  <MenuItem key={type.id} value={type.id}>
                    {type.name}
                  </MenuItem>
                ))}
                {nodeTypes?.length === 0 ||
                  (!nodeTypes && (
                    <MenuItem value="" disabled>
                      здесь ничего нет
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
            <Button
              variant="text"
              startIcon={<AddIcon />}
              color="primary"
              onClick={() => setOpenDialogNodeTypeAdd(true)}
              sx={{ ml: 2, alignSelf: "center" }}
              style={{ alignSelf: "center" }}
            >
              Добавить
            </Button>
          </Stack>
          <TextField
            margin="dense"
            id="description"
            name="description"
            label="Описание"
            type="text"
            fullWidth
            variant="standard"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialogAdd(false)}>Закрыть</Button>
          <Button
            variant="contained"
            disabled={!formData.name || !formData.type_id}
            onClick={handleFormSubmit}
          >
            Добавить
          </Button>
        </DialogActions>
      </Dialog>

      {/* Добавление типа */}
      <Dialog
        open={openDialogNodeTypeAdd}
        onClose={() => setOpenDialogNodeTypeAdd(false)}
      >
        <DialogTitle>Добавление типа</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id="name"
            name="name"
            label="Название типа"
            type="text"
            fullWidth
            variant="standard"
            value={formNodeTypeData.name}
            onChange={(e) =>
              setFormNodeTypeData({ ...formNodeTypeData, name: e.target.value })
            }
            required
          />
          <TextField
            margin="dense"
            id="description"
            name="description"
            label="Описание типа"
            type="text"
            fullWidth
            variant="standard"
            value={formNodeTypeData.description}
            onChange={(e) =>
              setFormNodeTypeData({
                ...formNodeTypeData,
                description: e.target.value,
              })
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialogNodeTypeAdd(false)}>
            Закрыть
          </Button>
          <Button
            variant="contained"
            disabled={!formNodeTypeData.name}
            onClick={handleFormNodeTypeSubmit}
          >
            Добавить
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
};
