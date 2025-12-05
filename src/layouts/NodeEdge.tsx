import React, { memo } from 'react';
import { getBezierPath, useReactFlow } from 'reactflow';
import { CloseButton } from '@chakra-ui/react';

const foreignObjectSize = 40;

const Edge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
}: any) => {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const { setEdges, getEdge, setNodes } = useReactFlow()

  const removeNodeData = (targetNodeId: string, sourceNodeId: string) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === targetNodeId) {
          const { [sourceNodeId]: removed, ...rest } = node.data;
          node.data = rest;
        }
        return node;
      }))
  };

  const onEdgeClick = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>, id: string) => {
    event.stopPropagation();
    setEdges((eds) => eds.filter((e) => e.id !== id));
    const edge = getEdge(id)
    if (!edge || !edge.target || !edge.source) return
    removeNodeData(edge.target, edge.source)

  };
  return (
    <path
      id={id}
      style={style}
      className="react-flow__edge-path"
      d={edgePath}
      markerEnd={markerEnd}
      onClick={(event) => {
        event.stopPropagation();
        setEdges((eds) => eds.filter((e) => e.id !== id));
        const edge = getEdge(id);
        if (edge && edge.target && edge.source) {
          removeNodeData(edge.target, edge.source);
        }
      }}
    />
  );
}

export default memo(Edge)