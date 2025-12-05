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
import { buildAssetPayload } from '@/util/assets';
import { ACTION_DEFINITIONS } from '@/util/sendaiActions';

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
    setEdges((eds) => addEdge(params, eds));
    setNodes((nds) => {
      if (!params.source || !params.target) return nds;

      const sourceNode = nds.find((n) => n.id === params.source);
      const targetIndex = nds.findIndex((n) => n.id === params.target);
      if (!sourceNode || targetIndex === -1) return nds;

      const payload = buildAssetPayload(sourceNode);
      if (!payload) return nds;

      const updatedNodes = [...nds];
      const targetNode = nds[targetIndex];

      updatedNodes[targetIndex] = {
        ...targetNode,
        data: {
          ...targetNode.data,
          [params.source]: payload,
        },
      };

      return updatedNodes;
    });
  }
    , [setEdges, setNodes]
  );


  useEffect(() => {
    // Filter nodes to delete - only delete DeFi action nodes, not asset nodes
    const assetNodeTypes = ['tokenCard', 'nftCard', 'walletBalance', 'folder'];
    const actionNodeTypes = ACTION_DEFINITIONS.map(def => def.type);
    
    setNodes((nds) => {
      // First, remove only deletable nodes (action nodes that are selected)
      const updatedNodes = nds.filter((node) => {
        // Keep all asset nodes regardless of selection
        if (assetNodeTypes.includes(node.type || '')) {
          return true;
        }
        // For action nodes, keep them if not selected
        return !node.selected;
      });
      
      // Then clean up data references
      return updatedNodes.map((node) => {
        const values = Object.keys(node.data || {});
        values.forEach((value) => {
          if (!updatedNodes.map((nd) => nd.id).includes(value)) {
            const { [value]: removed, ...rest } = node.data;
            node.data = rest;
          }
        });
        return node;
      });
    });
    
    onNodeChange(nodes);
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
        nodeColor="#A1A2FF"
        nodeStrokeColor="#A1A2FF"
        maskColor='#3e3a6d4d'
        className={styles.minimap}
        zoomable
        pannable />
    </ReactFlow>
  );
}

export default Playground
