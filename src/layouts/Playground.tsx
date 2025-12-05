import React, { useCallback, useEffect } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  addEdge,
  useKeyPress,
  Connection,
  Node,
  Instance,
  Edge
} from 'reactflow';
import styles from '@/styles/Playground.module.css'
import { nodeTypes } from '@/nodes';
import NodeEdge from '@/layouts/NodeEdge';
import useCtrlA from '@/util/useCtrlA';

type Props = {
  onNodeChange: React.Dispatch<React.SetStateAction<any>>,
  nodes: Node[],
  setNodes: Instance.SetNodes<any>,

  onEdgeChange: React.Dispatch<React.SetStateAction<any>>,
  edges: Edge[],
  setEdges: Instance.SetEdges<any>,
  onNodeDragStop?: (event: any, node: Node) => void,
}

const Playground = function Playground({
  onEdgeChange,
  edges,
  setEdges,

  onNodeChange,
  nodes,
  setNodes,
  onNodeDragStop,
}: Props) {
  const ctrlAPress = useCtrlA()
  const backspacePress = useKeyPress('Backspace')


  const onConnect = useCallback((params: Connection) => {
    setEdges((eds) => addEdge(params, eds))
  }
    , [setEdges]
  );


  useEffect(() => {
    setNodes((nds) =>
      nds.map((node) => {
        const values = Object.keys(node.data)
        values.forEach((value) => {
          if (!nodes.map((nd) => nd.id).includes(value)) {
            const { [value]: removed, ...rest } = node.data;
            node.data = rest;
          }
        })
        return node;
      }))
      onNodeChange(nodes)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [backspacePress]);

  
  useEffect(() => {
    if (ctrlAPress.split("-")[0] == "true") {
      setNodes((nodes) => nodes.map((nd) => { return { ...nd, selected: true } }))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ctrlAPress])



  return (
    <ReactFlow
      nodes={nodes}
      nodeTypes={nodeTypes}
      edges={edges}
      id="rf-main"
      nodesDraggable
      nodesConnectable
      nodesFocusable
      proOptions={{ hideAttribution: true }}
      onNodesChange={onNodeChange}
      onEdgesChange={onEdgeChange}
      onConnect={onConnect}
      onNodeDragStop={onNodeDragStop}
      edgeTypes={{ default: NodeEdge }}
    >
      <Controls className={styles.controls} position="bottom-right" />
      <MiniMap
        nodeColor="#FF00994d"
        nodeStrokeColor="#FF0099"
        maskColor='#3e3a6d4d'
        className={styles.minimap}
        zoomable
        pannable />
    </ReactFlow>
  );
}

export default Playground
