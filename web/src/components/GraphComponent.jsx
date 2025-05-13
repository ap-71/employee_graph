import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { getGraph } from '../services/api';
import { Loader } from './Loader';
import { Checkbox, FormControlLabel, Stack } from '@mui/material';

const nodeTypes = {
    employee: { color: '#1f78b4', name: "Сотрудник" }, // синий
    department: { color: '#33a02c', name: "Отдел" }, // зелёный
    position: { color: '#e31a1c', name: "Должность" }, // красный
    project: { color: '#e1e1e1', name: "Проект" }
};

export default function GraphComponent({ width = 800, height = 600, publicView=false } = {}) {
    const fgRef = useRef();
    const [selectedTypeNodes, setSelectedTypeNodes] = useState([])
    const [highlightNode, setHighlightNode] = useState(null);
    const [highlightNodes, setHighlightNodes] = useState(new Set());
    const [highlightLinks, setHighlightLinks] = useState(new Set());
    const [graphDataRaw, setGraphDataRaw] = useState({ nodes: [], links: [] })
    const graphData = useMemo(() => {

        const nodes = graphDataRaw.nodes.filter(n => selectedTypeNodes.includes(n.type) )

        console.debug(selectedTypeNodes, graphDataRaw, nodes)


        return {...graphDataRaw, nodes: nodes.length === 0 ? graphDataRaw.nodes: nodes}
    }, [graphDataRaw, selectedTypeNodes])
    const [loading, setLoading] = useState(true)
    const [distance, setDistance] = useState(100); // расстояние между нодами
    const [nodeRadius, setNodeRadius] = useState(8) // размер ноды
    const [nodeLabelsShow, setNodeLabelsShow] = useState(false)

    const setLinksDistance = (current) => {
        if (fgRef.current) {
            fgRef.current.d3Force('link').distance(() => current);
            fgRef.current.d3ReheatSimulation();
        }
    }

    const handleSetLinksDistance = useCallback((current) => {
        setLinksDistance(current)
        setDistance(current)
    }, [])

    useEffect(() => {
        getGraph({ publicView }).then(data => {
            // Удаляем зафиксированные координаты, чтобы включилась физика
            const cleanedData = {
                nodes: data.nodes.map(node => {
                    const { x, y, vx, vy, ...rest } = node;
                    return rest;
                }),
                links: data.links
            };

            setGraphDataRaw(cleanedData);
        }).catch(e => {
            console.debug('error => ' + e)
        }).finally(() => {
            setLoading(false);
        })
    }, [publicView]);

    // Создаем карту связей для быстрого поиска соседей
    const nodeNeighbors = React.useMemo(() => {
        const map = new Map();
        graphData.nodes.forEach((node) => map.set(node.id, new Set()));
        graphData.links.forEach(({ source, target }) => {
            const mapSource = map.get(source)
            const mapTarget = map.get(target)

            if (mapSource === undefined || mapTarget === undefined) {
                return
            }

            mapSource.add(target);
            mapTarget.add(source);
        });
        return map;
    }, [graphData.links, graphData.nodes]);

    const handleTypeNodeClick = (typeNode) => {
        console.debug(typeNode)
        setSelectedTypeNodes(prev => [...prev.filter(f => f !== typeNode.key), typeNode.key])
    }
    const handleNodeClick = (node) => {
        if (highlightNode && highlightNode.id === node.id) {
            // Уже выделена эта нода - сброс
            setHighlightNode(null);
            setHighlightNodes(new Set());
            setHighlightLinks(new Set());
        } else {
            setHighlightNode(node);
            // Соседи + сама нода
            const neighbors = nodeNeighbors.get(node.id) || new Set();
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

    if (loading) {
        return <Stack {...{ width, height }}>
            <Loader />
        </Stack>
    }

    setLinksDistance(distance)

    return (
        <Stack background="#1a1a1a" border="2px solid #202020">
            <ForceGraph2D
                ref={fgRef}
                graphData={graphData}
                width={width}
                height={height}
                nodeAutoColorBy="type"
                linkDirectionalParticles={2}
                linkDirectionalParticleWidth={1}
                backgroundColor="#121212"
                linkDistance={distance}
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
                    const color = nodeTypes[node.type]?.color || 'gray';

                    // Рисуем круг ноды
                    ctx.beginPath();
                    ctx.fillStyle = color;
                    ctx.strokeStyle = '#aaa';
                    ctx.lineWidth = 1;
                    ctx.arc(node.x, node.y, nodeRadius, 0, 2 * Math.PI, false);
                    ctx.fill();
                    ctx.stroke();

                    // Подпись у ноды
                    ctx.fillStyle = '#ddd';
                    ctx.fillText(highlightNodes.has(node.id) || nodeLabelsShow ? label : '', node.x + 10, node.y + 4);

                    ctx.globalAlpha = 1;
                }}
                linkWidth={(link) => (highlightLinks.has(link) ? 6 : 4)}
                linkColor={(link) => (highlightLinks.has(link) ? '#666' : '#222')}
                linkDirectionalArrowLength={4}
                linkDirectionalArrowRelPos={1}
                onNodeClick={handleNodeClick}
                nodeLabel={(node) => `${node.name} (${node.type})`}
            />
            <Stack direction="row" margin={2} style={{ color: '#ccc', fontSize: 14 }}>
                <b>Типы узлов:</b> &nbsp;
                {Object.entries(nodeTypes).map(([key, { color, name }]) => (
                    <span
                        key={key}
                        style={{
                            display: 'inline-block',
                            marginRight: 16,
                            paddingLeft: 10,
                            borderLeft: `10px solid ${color}`,
                            cursor: "pointer"
                        }}
                        onClick={() => handleTypeNodeClick({key, ...(nodeTypes?.[key] || {})})}
                    >
                        {name}
                    </span>
                ))}
            </Stack>
            <Stack direction="row" gap={4} margin={2} >

                <Stack style={{ color: '#ccc', fontSize: 14 }}>
                <label htmlFor="distance">Расстояние между связанными узлами: {distance}px</label>
                <input
                    type="range"
                    id="distance"
                    min="50"
                    max="300"
                    step="10"
                    value={distance}
                    onChange={(e) => handleSetLinksDistance(Number(e.target.value))}
                />
            </Stack>
            <Stack style={{ color: '#ccc', fontSize: 14 }}>
                <label htmlFor="nodeRadius">Размер узла: {nodeRadius}px</label>
                <input
                    type="range"
                    id="nodeRadius"
                    min="0"
                    max="30"
                    step="1"
                    value={nodeRadius}
                    onChange={(e) => setNodeRadius(Number(e.target.value))}
                    style={{ width: '100%', marginTop: 4 }}
                />
            </Stack>
            <Stack style={{ color: '#ccc', fontSize: 14 }}>
                <FormControlLabel onChange={(e, value) => setNodeLabelsShow(value)} control={<Checkbox value={nodeLabelsShow} />} label="Отображение подписей" name="1"/>
            </Stack>
            </Stack>
            
        </Stack>
    );
}