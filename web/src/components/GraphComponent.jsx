import React, { useState, useRef, useEffect, useCallback } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { getGraph } from '../services/api';
import { Loader } from './Loader';
import { Stack } from '@mui/material';

const nodeTypes = {
    employee: { color: '#1f78b4', name: "Сотрудник" }, // синий
    department: { color: '#33a02c', name: "Отдел" }, // зелёный
    position: { color: '#e31a1c', name: "Должность" }, // красный
    project: { color: '#e1e1e1', name: "Проект" }
};

export default function GraphComponent({ width = 800, height = 600 } = {}) {
    const fgRef = useRef();
    const [highlightNode, setHighlightNode] = useState(null);
    const [highlightNodes, setHighlightNodes] = useState(new Set());
    const [highlightLinks, setHighlightLinks] = useState(new Set());
    const [graphData, setGraphData] = useState({ nodes: [], links: [] })
    const [loading, setLoading] = useState(true)
    const [distance, setDistance] = useState(250); // расстояние между нодами

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
        getGraph().then(data => {
            // Удаляем зафиксированные координаты, чтобы включилась физика
            const cleanedData = {
                nodes: data.nodes.map(node => {
                    const { x, y, vx, vy, ...rest } = node;
                    return rest;
                }),
                links: data.links
            };

            setGraphData(cleanedData);
        }).catch(e => {
            console.debug('error => ' + e)
        }).finally(() => {
            setLoading(false);
        })
    }, []);

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
                    ctx.arc(node.x, node.y, 8, 0, 2 * Math.PI, false);
                    ctx.fill();
                    ctx.stroke();

                    // Подпись у ноды
                    ctx.fillStyle = '#ddd';
                    ctx.fillText(label, node.x + 10, node.y + 4);

                    ctx.globalAlpha = 1;
                }}
                linkWidth={(link) => (highlightLinks.has(link) ? 6 : 4)}
                linkColor={(link) => (highlightLinks.has(link) ? '#666' : '#222')}
                linkDirectionalArrowLength={4}
                linkDirectionalArrowRelPos={1}
                onNodeClick={handleNodeClick}
                nodeLabel={(node) => `${node.name} (${node.type})`}
            />
            <div style={{ margin: 12, color: '#ccc', fontSize: 14 }}>
                <b>Типы узлов:</b> &nbsp;
                {Object.entries(nodeTypes).map(([key, { color, name }]) => (
                    <span
                        key={key}
                        style={{
                            display: 'inline-block',
                            marginRight: 16,
                            paddingLeft: 10,
                            borderLeft: `10px solid ${color}`,
                        }}
                    >
                        {name}
                    </span>
                ))}
            </div>
            <div style={{ margin: 12, color: '#ccc', fontSize: 14 }}>
                <label htmlFor="distance">Расстояние между связанными узлами: {distance}px</label>
                <input
                    type="range"
                    id="distance"
                    min="50"
                    max="300"
                    step="10"
                    value={distance}
                    onChange={(e) => handleSetLinksDistance(Number(e.target.value))}
                    style={{ width: '100%', marginTop: 4 }}
                />
            </div>
        </Stack>
    );
}