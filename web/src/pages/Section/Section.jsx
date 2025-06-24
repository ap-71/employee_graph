import { Box, Button, IconButton, Stack, Typography } from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import LinkIcon from "@mui/icons-material/Link";
import VisibilityIcon from "@mui/icons-material/Visibility";
import {
  deleteNode,
  deleteNodeType,
  deleteSection,
  getNodeTypesBySection,
  getSectionById,
  getSections,
} from "../../services/api";
import Employee from "../Employee";
import Departments from "../Departments";
import Positions from "../Positions";
import Projects from "../Projects";
import { useLocation } from "wouter";
import {
  DialogAddNode,
  DialogAddNodeLink,
  DialogAddNodeType,
  DialogAddSection,
  DialogDelete,
  DialogEditNode,
  DialogViewLinkNode,
} from "./Dialogs";
import { BasicTable } from "../Table";
import { GraphSectionComponent } from "../../components/GraphComponent";

export const Section = ({ name = "Разделы", buttonName } = {}) => {
  const [openDialog, openDialogActions, dialogData] = useOpenDialog();
  const [, navigate] = useLocation();
  const [sections, setSections] = useState([]);
  const [openCreateSection, setOpenCreateSection] = useState(false);

  const handleLoadSections = useCallback(() => {
    getSections()
      .then((sections) => {
        setSections(sections);
      })
      .catch((error) => {
        console.error(`Error fetching sections: ${error.message}`);
      });
  }, []);

  useEffect(() => {
    handleLoadSections();
  }, [handleLoadSections]);

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
          onClick={() => setOpenCreateSection(true)}
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
            alignItems: "center",
            justifyContent: "flex-start",
            "&:hover": {
              color: "primary.main",
            },
            height: 56,
          }}
        >
          <Typography>Сотрудники, отделы, должности и проекты</Typography>
        </Button>
      </Stack>
      {sections.length > 0 && (
        <Stack spacing={2} sx={{ mb: 2 }}>
          {sections.map((section) => (
            <Button
              key={section.id}
              color="inherit"
              sx={{
                transition: "color 0.2s",
                textTransform: "none",
                alignItems: "center",
                justifyContent: "space-between",
                "&:hover": {
                  color: "primary.main",
                },
              }}
            >
              <Typography
                onClick={() => navigate(`/management/sections/${section.id}`)}
                sx={{
                  width: "100%",
                  textAlign: "start",
                  height: "100%",
                }}
              >
                {section.description || section.name || "Неизвестно"}
              </Typography>
              <IconButton
                color="error"
                onClick={() => openDialogActions.openDeleteSection(section)}
                aria-label="delete"
              >
                <DeleteIcon />
              </IconButton>
            </Button>
          ))}
        </Stack>
      )}

      <DialogAddSection
        openDialog={openCreateSection}
        onCloseDialog={() => setOpenCreateSection(false)}
        onSubmit={() => handleLoadSections()}
      />
      <DialogDelete
        title="Удаление раздела"
        contentText="Вы уверены, что хотите удалить раздел?"
        openDialog={openDialog.open === openDialog.deleteSection}
        onCloseDialog={openDialogActions.reset}
        onDelete={handleLoadSections}
        data={dialogData}
        fetchService={deleteSection}
      />
    </Stack>
  );
};

const useOpenDialog = () => {
  const [dialogData, setDialogData] = useState(null);
  const [state, setState] = useState({
    open: null,
    addNode: "addNode",
    addNodeType: "addNodeType",
    deleteNode: "deleteNode",
    deleteNodeType: "deleteNodeType",
    deleteSection: "deleteSection",
    deleteLink: "deleteLink",
    linkNode: "linkNode",
    editNode: "editNode",
    viewLinkNode: "viewLinkNode",
  });

  const handleChangeState = {
    openAddNode: (data) => {
      handleChangeState.setState(state.addNode, data)
    },
    openAddNodeType: (data) => {
      handleChangeState.setState(state.addNodeType, data)
    },
    openDeleteNode: (data) => {
      handleChangeState.setState(state.deleteNode, data)
    },
    openDeleteNodeType: (data) => {
      handleChangeState.setState(state.deleteNodeType, data)
    },
    openDeleteSection: (data) => {
      handleChangeState.setState(state.deleteSection, data)
    },
    openDeleteLink: (data) => {
      handleChangeState.setState(state.deleteLink, data)
    },
    openLinkNode: (data) => {
      handleChangeState.setState(state.linkNode, data)
    },
    editNode: (data) => {
      handleChangeState.setState(state.editNode, data)
    },
    viewLinkNode: (data) => {
      handleChangeState.setState(state.viewLinkNode, data)
    },
    setState: (currentState, currentData) => {
      setState((prev) => ({ ...prev, open: currentState }));
      setDialogData(JSON.parse(JSON.stringify(currentData)));
    },
    reset: () => {
      setState((prev) => ({ ...prev, open: null }));
      setDialogData(null);
    },
  };

  return [state, handleChangeState, dialogData];
};

export const ConcretSection = ({ sectionId }) => {
  const [openDialog, openDialogActions, dialogData] = useOpenDialog();
  // const [selectedNodeType, setSelectedNodeType] = useState({});
  const [sectionData, setSectionData] = useState({});
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

  // const handleOpenDialogNodeAdd = useCallback(
  //   (nodeType) => {
  //     console.debug(nodeType)
  //     openDialogActions.openAddNode();
  //     setSelectedNodeType(nodeType);
  //   },
  //   [openDialogActions]
  // );

  const loadNodeTypes = useCallback(() => {
    getNodeTypesBySection({ sectionId })
      .then((types) => {
        setNodeTypes(types);
      })
      .catch((error) => {
        console.error(`Error fetching node types: ${error.message}`);
      });
  }, [sectionId]);

  const handleFormSubmit = useCallback(() => {
    loadNodeTypes();
  }, [loadNodeTypes]);

  useEffect(() => {
    if (sectionId === "st_0") {
      return;
    }
    // Загружаем узлы при монтировании компонента
    loadNodeTypes();
    loadSectionData();
  }, [loadNodeTypes, loadSectionData, sectionId]);

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
      <Stack
        direction="row"
        justifyContent="space-between"
        spacing={2}
        sx={{ mb: 2 }}
      >
        <Typography
          variant="h4"
          overflow="hidden"
          textOverflow="ellipsis"
          whiteSpace="nowrap"
        >
          Раздел:{" "}
          {sectionData?.description || sectionData?.name || "Неизвестно"}
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={openDialogActions.openAddNodeType}
          sx={{ width: 150 }}
        >
          Добавить тип
        </Button>
      </Stack>
      {Object.keys(nodeTypes).length === 0 && (
        <Typography variant="body1">Здесь пока еще ничего нет.</Typography>
      )}
      {nodeTypes.map((nodeType) => {
        return (
          <Stack key={nodeType.id}>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              sx={{ mb: 1 }}
            >
              <Typography variant="h5">
                {nodeType.description || nodeType.name}
                <div
                  style={{
                    display: "inline-block",
                    marginLeft: 12,
                    paddingLeft: 10,
                    background: nodeType.color,
                    userSelect: "none",
                    width: 24,
                    height: 24,
                    verticalAlign: "middle",
                    borderRadius: "50%"
                  }}
              ></div>
              </Typography>
              <Stack
                direction="row"
                justifyContent="space-between"
                spacing={1}
                sx={{ width: 150 }}
              >
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => openDialogActions.openAddNode(nodeType)}
                >
                  <AddIcon />
                </Button>
                <Button
                  variant="contained"
                  color="error"
                  onClick={() => openDialogActions.openDeleteNodeType(nodeType)}
                >
                  <DeleteIcon />
                </Button>
              </Stack>
            </Stack>
            <Stack direction="column" sx={{ mb: 2 }}>
              <BasicTable
                rows={nodeType?.nodes?.map((item) => {
                  return {
                    name: item.name,
                    description: item.description,
                    actions: (
                      <>
                        <IconButton
                          color="info"
                          onClick={() => openDialogActions.viewLinkNode(item)}
                          aria-label="view relations"
                        >
                          <VisibilityIcon />
                        </IconButton>
                        <IconButton
                          color="primary"
                          onClick={() => openDialogActions.editNode(item)}
                          aria-label="edit"
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          color="secondary"
                          onClick={() => openDialogActions.openLinkNode(item)}
                          aria-label="manage relations"
                        >
                          <LinkIcon />
                        </IconButton>
                        <IconButton
                          color="error"
                          onClick={() => openDialogActions.openDeleteNode(item)}
                          aria-label="delete"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </>
                    ),
                  };
                })}
                cols={[
                  { field: "name", headerName: "Имя" },
                  { field: "description", headerName: "Описание" },
                  { field: "actions", headerName: "Действия", align: "right" },
                ]}
              />
            </Stack>
          </Stack>
        );
      })}

      {/* Редактирование узла */}
      <DialogEditNode
        openDialog={openDialog.open === openDialog.editNode}
        onCloseDialog={openDialogActions.reset}
        onSubmit={handleFormSubmit}
        // sectionId={sectionId}
        data={dialogData}
      />

      {/* Добавление узла */}
      <DialogAddNode
        openDialog={openDialog.open === openDialog.addNode}
        onCloseDialog={openDialogActions.reset}
        onSubmit={handleFormSubmit}
        sectionId={sectionId}
        nodeType={dialogData}
      />

      {/* Добавление типа */}
      <DialogAddNodeType
        openDialog={openDialog.open === openDialog.addNodeType}
        onCloseDialog={openDialogActions.reset}
        onSubmit={handleFormSubmit}
        sectionId={sectionId}
      />

      {/* Удаление узла */}
      <DialogDelete
        title="Удаление узла"
        contentText="Вы уверены, что хотите удалить узел?"
        openDialog={openDialog.open === openDialog.deleteNode}
        onCloseDialog={openDialogActions.reset}
        onDelete={handleFormSubmit}
        data={dialogData}
        fetchService={deleteNode}
      />
      {/* Удаление типа узла */}
      <DialogDelete
        title="Удаление типа узла"
        contentText="Вы уверены, что хотите удалить тип узла?"
        openDialog={openDialog.open === openDialog.deleteNodeType}
        onCloseDialog={openDialogActions.reset}
        onDelete={handleFormSubmit}
        data={dialogData}
        fetchService={deleteNodeType}
      />
      {/* Управление связями узла */}
      <DialogAddNodeLink
        openDialog={openDialog.open === openDialog.linkNode}
        onCloseDialog={openDialogActions.reset}
        onSubmit={handleFormSubmit}
        sectionId={sectionId}
        data={{
          node: dialogData,
          nodeTypes: nodeTypes,
        }}
      />

      {/* редактирование связей узла */}
      <DialogViewLinkNode
        openDialog={openDialog.open === openDialog.viewLinkNode}
        onCloseDialog={() => {
          openDialogActions.reset()
          handleFormSubmit()
        }}
        onDeleteLink={({ deletedNodeLink }) => {
          dialogData.nodes = [...dialogData.nodes.filter(n => n.id !== deletedNodeLink.id)]
          dialogData.nodes_to_this = [...dialogData.nodes_to_this.filter(n => n.id !== deletedNodeLink.id)]
          openDialogActions.viewLinkNode({...dialogData})
        }}
        data={dialogData}
      />
    </Stack>
  );
};

export const GraphSection = ({ name="Графы", sectionId, isPublic=false } = {}) => {
  const [openDialog, openDialogActions, dialogData] = useOpenDialog();
  const [, navigate] = useLocation();
  const [sections, setSections] = useState([]);
  const [openCreateSection, setOpenCreateSection] = useState(false);

  const handleLoadSections = useCallback(() => {
    getSections()
      .then((sections) => {
        setSections(sections);
      })
      .catch((error) => {
        console.error(`Error fetching sections: ${error.message}`);
      });
  }, []);

  useEffect(() => {
    handleLoadSections();
  }, [handleLoadSections]);

  return (
    <Stack sx={{ p: 2, width: "50vw" }}>
      <Stack
        direction="row"
        justifyContent="space-between"
        sx={{ mb: 2, width: "100%" }}
      >
        <Typography variant="h4">{name}</Typography>
      </Stack>

      <Stack spacing={2} sx={{ mb: 2 }}>
        <Button
          color="inherit"
          onClick={() => navigate(`/graph`)}
          
          sx={{
            transition: "color 0.2s",
            textTransform: "none",
            alignItems: "center",
            justifyContent: "flex-start",
            "&:hover": {
              color: "primary.main",
            },
            height: 56,
          }}
        >
          <Typography>Сотрудники, отделы, должности и проекты</Typography>
        </Button>
      </Stack>
      {sections.length > 0 && (
        <Stack spacing={2} sx={{ mb: 2 }}>
          {sections.map((section) => (
            <Button
              key={section.id}
              color="inherit"
              sx={{
                transition: "color 0.2s",
                textTransform: "none",
                alignItems: "center",
                justifyContent: "space-between",
                "&:hover": {
                  color: "primary.main",
                },
                height: 56,
              }}
              onClick={() => navigate(`/graph/sections/${section.id}`)}
            >
              <Typography
                onClick={() => navigate(`/graph/sections/${section.id}`)}
              >
                {section.description || section.name || "Неизвестно"}
              </Typography>
            </Button>
          ))}
        </Stack>
      )}
    </Stack>
  );
}

export const GraphConcretSection = ({headText="", publicView, sectionId }) => {
  // useEffect(()=> {
  //   getSectionById({ sectionId }).then(d => {

  //   }).catch(e => {
  //     console.error("Ошибка при получении секции: "+e)
  //   })
  // },[sectionId])
  return(
    <Box sx={{ flexGrow: 1 }}>
      <Typography variant="h4" sx={{ mb: 4 }}>
        {headText}
      </Typography>
      <GraphSectionComponent publicView={publicView} sectionId={sectionId}/>
    </Box>
  );
}