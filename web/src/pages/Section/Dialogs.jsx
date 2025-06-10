import { useCallback, useEffect, useMemo, useState } from "react";
import {
  createNode,
  createNodeType,
  createSection,
  getNodeById,
  linkNodes,
} from "../../services/api";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputLabel,
  ListItemText,
  MenuItem,
  Select,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";

export const BasicDialog = ({
  open = false,
  onClose = () => {},
  title = "Диалоговое окно",
  children = null,
  onSubmit = null,
  buttonSubmitText = "Сохранить",
  onDelete = null,
  buttonDeleteText = "Удалить",
  isValid = true,
} = {}) => {
  const handleSubmit = useCallback(() => {
    if (isValid && onSubmit) {
      onSubmit();
    }
  }, [isValid, onSubmit]);

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        {!children && (
          <Typography variant="body1">Здесь пока ничего нет</Typography>
        )}
        {children}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Закрыть</Button>
        {onSubmit && (
          <Button onClick={handleSubmit} disabled={!isValid}>
            {buttonSubmitText}
          </Button>
        )}
        {onDelete && (
          <Button onClick={onDelete} color="error" variant="contained">
            {buttonDeleteText}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

const defaultSectionFormData = {
  name: "",
  description: "",
};

export const DialogAddSection = ({
  openDialog = false,
  onCloseDialog = () => {},
  onSubmit = () => {},
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ ...defaultSectionFormData });

  const handleFormChange = useCallback((event) => {
    const { name, value } = event.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  }, []);

  const handleSubmit = async () => {
    setLoading(true);
    createSection(formData)
      .then(() => {
        setLoading(false);
        onCloseDialog();
        onSubmit();
        setFormData({ ...defaultSectionFormData });
      })
      .catch((error) => {
        console.error(`Error creating section: ${error.message}`);
        setLoading(false);
      });
  };

  return (
    <BasicDialog
      open={openDialog}
      onClose={onCloseDialog}
      title="Добавление раздела"
      onSubmit={handleSubmit}
      buttonSubmitText={loading ? "Сохранение..." : "Сохранить"}
      isValid={formData.name}
    >
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
      />
    </BasicDialog>
  );
};

const defaultFormData = {
  name: "",
  description: "",
};

export const DialogAddNodeType = ({
  openDialog = false,
  onCloseDialog = () => {},
  onSubmit = () => {},
  sectionId = null,
} = {}) => {
  const [formData, setFormData] = useState({
    ...defaultFormData,
  });

  const handleSubmit = useCallback(() => {
    createNodeType({ ...formData, section_id: sectionId })
      .then((obj) => {
        onCloseDialog(false);
        onSubmit({ type_id: obj.id });
        setFormData({ ...defaultFormData });
        console.log(`Node type created: ${obj.name} (ID: ${obj.id})`);
      })
      .catch((error) => {
        console.error(`Error creating node type: ${error.message}`);
      });
  }, [formData, onCloseDialog, onSubmit, sectionId]);

  return (
    <BasicDialog
      open={openDialog}
      onClose={onCloseDialog}
      title="Добавление типа узла"
      onSubmit={handleSubmit}
      buttonSubmitText="Добавить"
      isValid={formData.name}
    >
      <TextField
        autoFocus
        margin="dense"
        id="name"
        name="name"
        label="Название типа"
        type="text"
        fullWidth
        variant="standard"
        value={formData.name}
        onChange={(e) =>
          setFormData((prev) => ({ ...prev, name: e.target.value }))
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
        value={formData.description}
        onChange={(e) =>
          setFormData((prev) => ({ ...prev, description: e.target.value }))
        }
      />
    </BasicDialog>
  );
};

const defaultNodeFormData = {
  name: "",
  description: "",
};

export const DialogAddNode = ({
  openDialog,
  onCloseDialog = () => {},
  onSubmit = () => {},
  sectionId = null,
  nodeType = {},
} = {}) => {
  const [formData, setFormData] = useState({ ...defaultNodeFormData });

  const handleFormSubmit = () => {
    createNode({ ...formData, section_id: sectionId, type_id: nodeType.id })
      .then(() => {
        onCloseDialog();
        setFormData({ ...defaultNodeFormData });
        onSubmit();
      })
      .catch((error) => {
        console.error(`Error creating node: ${error.message}`);
      });
  };

  return (
    <BasicDialog
      title="Добавление узла"
      open={openDialog}
      onClose={onCloseDialog}
      onSubmit={handleFormSubmit}
      buttonSubmitText="Добавить"
      isValid={formData.name && nodeType.id}
    >
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
    </BasicDialog>
  );
};

export const DialogAddNodeLink = ({
  openDialog = false,
  onCloseDialog = () => {},
  onSubmit = () => {},
  data = {
    node: null,
    nodeTypes: [],
  },
} = {}) => {
  const [loading, setLoading] = useState(false);
  const [selectedNodeType, setSelectedNodeType] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [node, setNode] = useState({});
  const nodeTypes = useMemo(() => {
    return data?.nodeTypes?.filter(
      (nt) =>
        nt.nodes?.filter(
          (n) =>
            n.id !== node?.id &&
            node?.nodes?.find((f) => f.id === n.id) === undefined &&
            node?.nodes_to_this?.find((f) => f.id === n.id) === undefined
        ).length > 0
    );
  }, [data?.nodeTypes, node?.id, node?.nodes, node?.nodes_to_this]);

  const nodesForSelectedNodeType = useMemo(() => {
    return selectedNodeType?.nodes?.filter(
      (n) =>
        n.id !== node.id &&
        node?.nodes.find((f) => f.id === n.id) === undefined &&
        node?.nodes_to_this.find((f) => f.id === n.id) === undefined
    );
  }, [node?.id, node?.nodes, node?.nodes_to_this, selectedNodeType?.nodes]);

  const loadNode = useCallback(() => {
    if (!openDialog) {
      return;
    }

    getNodeById(data.node.id)
      .then((d) => {
        setNode(d);
      })
      .catch((e) => {
        console.error("Ошибка при получении узла: " + e);
      });
  }, [data?.node?.id, openDialog]);

  useEffect(() => {
    if (data?.node?.id === undefined) {
      return;
    }

    loadNode();
  }, [data?.node?.id, loadNode]);

  const handleFormSubmit = useCallback(() => {
    if (node?.id && selectedNode?.id) {
      setLoading(true);

      linkNodes(node.id, selectedNode.id)
        .then((data) => {
          onSubmit(data);
          setSelectedNode(null);
          loadNode();
        })
        .catch((e) => {
          console.error(`Ошибка при связывании: ${e}`);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      alert("Ошибка при связывании");
    }
  }, [loadNode, node?.id, onSubmit, selectedNode?.id]);

  const handleClose = useCallback(() => {
    onCloseDialog();
    setSelectedNodeType(null);
    setSelectedNode(null);
  }, [onCloseDialog]);

  return (
    <BasicDialog
      title="Добавление связи узла"
      open={openDialog}
      onClose={handleClose}
    >
      <Stack direction="row" spacing={2} sx={{ width: 500, p: 2 }}>
        <FormControl fullWidth sx={{ mt: 2 }}>
          <InputLabel id="department-select-label">Выбрать тип</InputLabel>
          <Select
            labelId="department-select-label"
            id="department-select"
            value={nodeTypes.length !== 0 ? selectedNodeType?.id || "" : ""}
            label="Выбрать тип"
            onChange={(e) =>
              setSelectedNodeType(
                data.nodeTypes.find((f) => f.id === +e.target.value)
              )
            }
          >
            <MenuItem value="" selected>
              <em>Не выбрано</em>
            </MenuItem>
            {nodeTypes.map((nt) => (
              <MenuItem key={nt.id} value={nt.id}>
                {nt.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl fullWidth sx={{ mt: 2 }}>
          <InputLabel id="department-select-label">Выбрать узел</InputLabel>
          <Select
            labelId="department-select-label"
            id="department-select"
            value={selectedNode?.id || ""}
            label="Выбрать узел"
            onChange={(e) =>
              setSelectedNode(
                (selectedNodeType?.nodes || []).find(
                  (f) => f.id === +e.target.value
                )
              )
            }
          >
            <MenuItem value="">
              <em>Не выбрано</em>
            </MenuItem>
            {nodesForSelectedNodeType?.map((n) => (
              <MenuItem key={n.id} value={n.id}>
                {n.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button
          onClick={handleFormSubmit}
          variant="contained"
          size="small"
          disabled={loading || !selectedNode}
          startIcon={
            loading ? <CircularProgress size={20} color="inherit" /> : null
          }
          sx={{ minWidth: "auto" }}
        >
          Связать
        </Button>
      </Stack>
    </BasicDialog>
  );
};

export const DialogDelete = ({
  title = "Удаление",
  buttonDeleteText = "Удалить",
  contentText = "Вы уверены, что хотите удалить?",
  openDialog = false,
  onCloseDialog = () => {},
  onDelete = () => {},
  fetchService = async () => {},
  data = null,
} = {}) => {
  const handleDelete = useCallback(() => {
    fetchService(data?.id)
      .then(() => {
        onDelete();
        onCloseDialog();
      })
      .catch((e) => {
        console.error(`Ошибка при удалении: ${e}`);
      });
  }, [data?.id, fetchService, onCloseDialog, onDelete]);

  return (
    <BasicDialog
      open={openDialog}
      onClose={onCloseDialog}
      onDelete={handleDelete}
      buttonDeleteText={buttonDeleteText}
      title={title}
    >
      <Typography>{contentText}</Typography>
    </BasicDialog>
  );
};

export const DialogViewLinkNode = ({
  title = "Связи узла",
  openDialog = false,
  onCloseDialog = () => {},
  data = {},
} = {}) => {
  const [tab, setTab] = useState("val-1");
  const links = useMemo(
    () => [...(data?.nodes || []), ...(data?.nodes_to_this || [])],
    [data?.nodes, data?.nodes_to_this]
  );
  const tabs = useMemo(() => {
    const obj = {};

    links.forEach((l) => {
      if (obj[l.type?.id] === undefined) {
        obj[l.type?.id] = { ...l.type, nodes: [] };
      }
      obj[l.type?.id]?.nodes?.push(l);
    });

    return obj;
  }, [links]);

  useEffect(() => {
    setTab(Object.keys(tabs)[0]);
  }, [tabs]);

  return (
    <BasicDialog open={openDialog} onClose={onCloseDialog} title={title}>
      {Object.values(tabs).length === 0 && <Typography>Связей пока нет</Typography>}
      {Object.values(tabs).length > 0 && <>
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs
          value={tab}
          onChange={(e, val) => setTab(val)}
          aria-label="basic tabs example"
          variant="scrollable"
        >
          {Object.values(tabs).map((val) => (
            <Tab
              key={val.id}
              label={val.description || val.name}
              value={"" + val.id}
            />
          ))}
        </Tabs>
      </Box>
      <Stack mt={4} mb={4} ml={2} mr={2}>
        {Object.values(tabs).map((t) => {
          return (
            <Stack
              key={t.id}
              direction="column"
              spacing={2}
              sx={{
                display: "" + t.id === tab ? "unset" : "none",
              }}
            >
              {t.nodes.map((n) => {
                return (
                  <Stack
                    key={n.id}
                    direction="row"
                    sx={{
                      minWidth: 500,
                      borderBottom: 1,
                      borderColor: "divider",
                    }}
                  >
                    <ListItemText primary={n.name} secondary={`ID: ${n.id}`} />
                    <IconButton color="error" sx={{ width: 50, height: 50 }}>
                      <DeleteIcon />
                    </IconButton>
                  </Stack>
                );
              })}
            </Stack>
          );
        })}
      </Stack>
      </>}
    </BasicDialog>
  );
};
