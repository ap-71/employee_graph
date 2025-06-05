import { useCallback, useState } from "react";
import {
  createNode,
  createNodeType,
  createSection,
  linkNodes,
} from "../../services/api";
import {
  Button,
  CircularProgress,
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
  node = null,
  nodeTypes = [],
} = {}) => {
  const [loading, setLoading] = useState(false);
  const [selectedNodeType, setSelectedNodeType] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);

  const handleFormSubmit = useCallback(() => {
    if (node?.id && selectedNode?.id) {
      setLoading(true);

      linkNodes(node.id, selectedNode.id).then((data) => {
        onSubmit(data);
        setSelectedNodeType(null);
        setSelectedNode(null);
      }).catch(e => {
        console.error(`Ошибка при связывании: ${e}`)
      }).finally(() => {
        setLoading(false);
      })
      
    } else {
      alert("Ошибка при связывании");
    }
  }, [node?.id, onSubmit, selectedNode?.id]);

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
            value={selectedNodeType?.id || ""}
            label="Выбрать тип"
            onChange={(e) =>
              setSelectedNodeType(
                nodeTypes.find((f) => f.id === +e.target.value)
              )
            }
          >
            <MenuItem value="">
              <em>Не выбрано</em>
            </MenuItem>
            {nodeTypes.filter(nt => nt.nodes?.filter(n => n.id !== node?.id).length > 0 ).map((nt) => (
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
            {selectedNodeType?.nodes
              ?.filter((n) => n.id !== node.id)
              .map((n) => (
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
          startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
          sx={{ minWidth: "auto"}}
        >
          Связать
        </Button>
      </Stack>
    </BasicDialog>
  );
};

export const DialogDelete = ({
  title = "Удаление",
  buttonDeleteText="Удалить",
  contentText="Вы уверены, что хотите удалить?",
  openDialog = false,
  onCloseDialog = () => {},
  onDelete = () => {},
  fetchService = async () => {},
  data = null,
} = {}) => {
  const handleDelete = useCallback(() => {
    fetchService(data?.id).then(() => {
      onDelete()
      onCloseDialog()
    }).catch(e => {
      console.error(`Ошибка при удалении: ${e}`)
    })
  }, [data?.id, fetchService, onCloseDialog, onDelete])

  return <BasicDialog
    open={openDialog}
    onClose={onCloseDialog}
    onDelete={handleDelete}
    buttonDeleteText={buttonDeleteText}
    title={title}
  >
    <Typography>
      {contentText}
    </Typography>
  </BasicDialog>
}