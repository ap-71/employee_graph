import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import ForceGraph2D from "react-force-graph-2d";
import { getGraph, getNodesConfig, saveNodesConfig } from "../services/api";
import { Loader } from "./Loader";
import { Button, Checkbox, FormControlLabel, Stack } from "@mui/material";

const nodeTypes = {
  employee: { type: "employee", color: "#1f78b4", name: "Сотрудник" }, // синий
  department: { type: "department", color: "#33a02c", name: "Отдел" }, // зелёный
  position: { type: "position", color: "#e31a1c", name: "Должность" }, // красный
  project: { type: "project", color: "#e1e1e1", name: "Проект" },
};

const defaultNodeConfig = {
  distance: 100, // расстояние между нодами
  nodeRadius: 8, // размер ноды
  multiplierNodeSize: 1, // множитель размера ноды
  nodeLabelsShow: false, // показывать ли названия нод
}

export default function GraphComponent({
  publicView = false,
} = {}) {
  const [windowSize, setWindowSize] = useState({
      width: window.innerWidth,
      height: window.innerHeight,
    });
  
  const fgRef = useRef();
  const [selectedTypeNodes, setSelectedTypeNodes] = useState([]);
  const [highlightNode, setHighlightNode] = useState(null);
  const [highlightNodes, setHighlightNodes] = useState(new Set());
  const [highlightLinks, setHighlightLinks] = useState(new Set());
  const [graphDataRaw, setGraphDataRaw] = useState({ nodes: [], links: [] });
  const [loading, setLoading] = useState(true);
  const [nodeConfig, setNodeConfig] = useState({});
  const [configIsChenged, setConfigIsChenged] = useState(false);
  
  useEffect(() => {
    getNodesConfig(!publicView).then((data) => {
      setNodeConfig((prev) => ({
        ...prev,
        distance: data.distance ?? defaultNodeConfig.distance,
        nodeRadius: data.node_radius ?? defaultNodeConfig.nodeRadius,
        multiplierNodeSize: data.multiplier_node_size ?? defaultNodeConfig.multiplierNodeSize,
        nodeLabelsShow: data.node_labels_show ?? defaultNodeConfig.nodeLabelsShow,
      }));
    }).catch((e) => {
      console.debug("error => " + e);
      setNodeConfig((prev) => ({...prev, ...defaultNodeConfig }));
    });
  }, [publicView]);
  
  useEffect(() => {
    // Функция для обновления состояния размера окна
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    // Добавляем слушатель события resize
    window.addEventListener('resize', handleResize);

    // Убираем слушатель при размонтировании компонента
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

   useEffect(() => {
    if (fgRef.current) {
      fgRef.current.refresh?.(); // заставляет график перерисоваться
    }
  }, [windowSize]);

  const graphData = useMemo(() => {
    const ids = [];
    const nodes = graphDataRaw.nodes.filter((n) => {
      if (selectedTypeNodes.includes(n.type)) {
        ids.push(n.id);
        return true;
      }

      return false;
    });

    const links = graphDataRaw.links.filter(
      (f) => ids.includes(f.source.id) && ids.includes(f.target.id)
    );

    return {
      nodes: nodes.length === 0 ? graphDataRaw.nodes : nodes,
      links:
        links.length === 0 && nodes.length === 0 ? graphDataRaw.links : links,
    };
  }, [graphDataRaw, selectedTypeNodes]);

  const setLinksDistance = (current) => {
    if (fgRef.current) {
      fgRef.current.d3Force("link").distance(() => current);
      fgRef.current.d3ReheatSimulation();
    }
  };

  const handleSetLinksDistance = useCallback((current) => {
    setLinksDistance(current);
    setNodeConfig((prev) => ({...prev, distance: current }));
    setConfigIsChenged(true);
  }, []);

  useEffect(() => {
    getGraph({ publicView })
      .then((data) => {
        // Удаляем зафиксированные координаты, чтобы включилась физика
        const cleanedData = {
          nodes: data.nodes.map((node) => {
            // eslint-disable-next-line no-unused-vars
            const { x, y, vx, vy, ...rest } = node;
            return rest;
          }),
          links: data.links,
        };

        setGraphDataRaw(cleanedData);
      })
      .catch((e) => {
        console.debug("error => " + e);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [publicView]);

  // Создаем карту связей для быстрого поиска соседей
  const nodeNeighbors = useMemo(() => {
    const obj = {};

    graphData.nodes.forEach((node) => {
      obj[node.id] = new Set();
    });

    graphData.links.forEach(({ source, target }) => {
      const objSource = obj[source.id || source];
      const objTarget = obj[target.id || target];

      // Если нода не найдена - пропускаем
      if (objSource === undefined || objTarget === undefined) {
        return;
      }

      // Добавляем соседей
      objSource.add(target.id || target);
      objTarget.add(source.id || source);
    });

    return obj;
  }, [graphData.nodes, graphData.links]);

  const handleTypeNodeClick = (typeNodeKey) => {
    setSelectedTypeNodes((prev) =>
      [
        ...prev.filter((f) => f !== typeNodeKey),
        prev.includes(typeNodeKey) ? null : typeNodeKey,
      ].filter((f) => f)
    );
  };

  const handleNodeClick = (node) => {
    if (highlightNode && highlightNode.id === node.id) {
      // Уже выделена эта нода - сброс
      setHighlightNode(null);
      setHighlightNodes(new Set());
      setHighlightLinks(new Set());
    } else {
      setHighlightNode(node);

      // Соседи + сама нода
      const neighbors = nodeNeighbors[node.id] || new Set();
      const newHighlightNodes = new Set([...neighbors, node.id]);

      // Выделяем связи, которые связаны с выбранными нодами
      const newHighlightLinks = new Set();
      graphData.links.forEach((link) => {
        if (
          newHighlightNodes.has(link.source.id) &&
          newHighlightNodes.has(link.target.id)
        ) {
          newHighlightLinks.add(link);
        }
      });
      setHighlightNodes(newHighlightNodes);
      setHighlightLinks(newHighlightLinks);
    }
  };
  const getSizeByCountNeighbors = useCallback((node) => {
    return (nodeNeighbors[node.id] || new Set()).size*nodeConfig.multiplierNodeSize || 1
  }, [nodeConfig.multiplierNodeSize, nodeNeighbors]);

  const handleSetNodeConfig = useCallback((key, value) => {
    setNodeConfig((prev) => ({ ...prev, [key]: value }));
    setConfigIsChenged(true);
  }, []);

  const handleSaveNodeConfig = useCallback(() => {
    saveNodesConfig(nodeConfig, !publicView)
      .then((data) => {
        console.debug("Сохранено", data);
        setConfigIsChenged(false);
      })
      .catch((e) => {
        console.debug("error => " + e);
      });
  }, [nodeConfig, publicView]);
  
  if (loading) {
    return (
      <Stack style={{
            position: "absolute", 
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)"
      }}>
        <Loader />
      </Stack>
    );
  }

  setLinksDistance(nodeConfig.distance);

  return (<>
    <Stack background="#1a1a1a" border="2px solid #202020" style={{ width: "100%", height: "100%", position: "absolute", left: 0, top: 0}}>
      <ForceGraph2D
        ref={fgRef}
        graphData={graphData}
        width={windowSize.width-12}
        height={windowSize.height-12}
        nodeAutoColorBy="type"
        linkDirectionalParticles={2}
        linkDirectionalParticleWidth={1}
        backgroundColor="#121212"
        linkDistance={nodeConfig.distance}
        nodeCanvasObject={(node, ctx, globalScale) => {
          const label = node.name;
          const fontSize = 12 / globalScale;
          ctx.font = `${fontSize}px Sans-Serif`;

          // Определяем начальную прозрачность
          let alpha = 1;
          // Если что-то выделено - непросветленные ноды становятся прозрачными
          if (highlightNode) {
            alpha = highlightNodes.has(node.id) ? 1 : 0.1;
          }
          ctx.globalAlpha = alpha;

          // Цвет ноды по типу
          const color = nodeTypes[node.type]?.color || "gray";

          const sizeByCountNeighbors =  getSizeByCountNeighbors(node)
          // Рисуем круг ноды
          ctx.beginPath();
          ctx.fillStyle = color;
          ctx.strokeStyle = "#aaa";
          ctx.lineWidth = 1;

          ctx.arc(node.x, node.y, nodeConfig.nodeRadius+sizeByCountNeighbors, 0, 2 * Math.PI, false);
          ctx.fill();
          ctx.stroke();

          // Подпись у ноды
          ctx.fillStyle = "#ddd";
          ctx.fillText(
            highlightNodes.has(node.id) || nodeConfig.nodeLabelsShow ? label : "",
            node.x + 10,
            node.y + 4
          );

          ctx.globalAlpha = 1;
        }}
        nodePointerAreaPaint={(node, color, ctx) => {
          const sizeByCountNeighbors =  getSizeByCountNeighbors(node)

          ctx.beginPath();
          ctx.arc(node.x, node.y, nodeConfig.nodeRadius+sizeByCountNeighbors, 0, 2 * Math.PI);
          ctx.fillStyle = color;
          ctx.fill();
        }}
        linkWidth={(link) => (highlightLinks.has(link) ? 6 : 4)}
        linkColor={(link) => (highlightLinks.has(link) ? "#666" : "#222")}
        linkDirectionalArrowLength={4}
        linkDirectionalArrowRelPos={1}
        onNodeClick={handleNodeClick}
        nodeLabel={(node) => `${node.name} (${node.type})`}
      />
      <Stack style={{ position: "absolute",padding: 12, bottom: -2, backdropFilter: 'blur(8px)',
          backgroundColor: 'rgba(18, 18, 18, 0.8)'}}>
        <Stack direction="row" margin={2} style={{ color: "#ccc", fontSize: 14 }}>
          <b>Типы узлов:</b> &nbsp;
          {Object.entries(nodeTypes).map(([key, { color, name }]) => (
            <span
              key={key}
              style={{
                display: "inline-block",
                marginRight: 16,
                paddingLeft: 10,
                borderLeft: `10px solid ${color}`,
                cursor: "pointer",
                opacity:
                  selectedTypeNodes.includes(key) ||
                  selectedTypeNodes.length === 0
                    ? 1
                    : 0.2,
              }}
              onClick={() => handleTypeNodeClick(key)}
            >
              {name}
            </span>
          ))}
        </Stack>
        <Stack direction="row" gap={4} margin={2}>
          <Stack style={{ color: "#ccc", fontSize: 14 }}>
            <label htmlFor="distance">
              Расстояние между связанными узлами: {nodeConfig.distance}px
            </label>
            <input
              type="range"
              id="distance"
              min="50"
              max="300"
              step="10"
              value={nodeConfig.distance}
              onChange={(e) => handleSetLinksDistance(Number(e.target.value))} //FIXME
            />
          </Stack>
          <Stack style={{ color: "#ccc", fontSize: 14 }}>
            <label htmlFor="nodeRadius">Размер узла: {nodeConfig.nodeRadius}px</label>
            <input
              type="range"
              id="nodeRadius"
              min="4"
              max="24"
              step="1"
              value={nodeConfig.nodeRadius}
              onChange={(e) => handleSetNodeConfig("nodeRadius", Number(e.target.value))}
              style={{ width: "100%", marginTop: 4 }}
            />
          </Stack>
          <Stack style={{ color: "#ccc", fontSize: 14 }}>
            <label htmlFor="nodeRadius" title="Влияет на узлы со связями">Множитель размера узла: {nodeConfig.multiplierNodeSize}</label>
            <input
              type="range"
              id="multiplierNodeSize"
              min="0"
              max="10"
              step="0.1"
              value={nodeConfig.multiplierNodeSize}
              onChange={(e) => handleSetNodeConfig("multiplierNodeSize", Number(e.target.value))}
              style={{ width: "100%", marginTop: 4 }}
            />
          </Stack>
          <Stack style={{ color: "#ccc", fontSize: 14 }}>
            <FormControlLabel
              onChange={(e, value) => handleSetNodeConfig("nodeLabelsShow", value)}
              control={<Checkbox checked={nodeConfig.nodeLabelsShow} />}
              label="Отображение надписей"
              name="1"
            />
          </Stack>
          <Stack style={{ color: "#ccc", fontSize: 14, display: configIsChenged ? "block" : "none" }}>
            <Button variant="contained" color="success" onClick={handleSaveNodeConfig}>Сохранить изменения</Button>
          </Stack>
        </Stack>
      </Stack>
     </Stack>
    </>
  );
}
