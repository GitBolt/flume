import { useState, useRef, useEffect } from "react";
import {
  Input,
  Modal,
  Flex,
  Text,
  ModalContent,
  ModalOverlay,
  Box,
  Spinner,
  VStack,
  Button,
  useToast,
} from "@chakra-ui/react";
import { useReactFlow, Node } from "reactflow";
import { createNodeId } from "@/util/randomData";
import { useCustomModal } from "@/context/modalContext";
import { usePortfolio } from "@/context/portfolioContext";

type FlowStep = {
  action: string;
  config: Record<string, any>;
  description: string;
  assetSource?: string;
};


export const CommandPalette = () => {
  const { cmdPalette } = useCustomModal();
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [steps, setSteps] = useState<FlowStep[]>([]);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { setNodes, setEdges, getNodes } = useReactFlow();
  const toast = useToast();
  const { portfolio } = usePortfolio();

  useEffect(() => {
    if (cmdPalette.isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [cmdPalette.isOpen]);

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Escape") {
      event.preventDefault();
      cmdPalette.onClose();
      setPrompt("");
      setSteps([]);
      setError(null);
    }

    if (event.key === "Enter" && !loading) {
      event.preventDefault();
      if (steps.length > 0) {
        handleCreateFlow();
      } else {
        handleGenerate();
      }
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setLoading(true);
    setError(null);
    setSteps([]);

    try {
      // Format user assets for AI context
      const userAssets = portfolio ? {
        sol: portfolio.nativeBalance?.solana || '0',
        tokens: portfolio.tokens.map(t => ({
          symbol: t.symbol,
          mint: t.mint,
          amount: t.amount,
          decimals: t.decimals,
        })),
      } : null;

      const response = await fetch('/api/generate-flow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, userAssets }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate flow');
      }

      const parsedSteps = data.steps;
      
      if (!Array.isArray(parsedSteps) || parsedSteps.length === 0) {
        throw new Error('Invalid flow generated');
      }

      setSteps(parsedSteps);
      toast({
        title: 'Flow generated!',
        description: `Created ${parsedSteps.length} steps`,
        status: 'success',
        duration: 3000,
      });
    } catch (err: any) {
      console.error('Error generating flow:', err);
      setError(err.message || 'Failed to generate flow');
      toast({
        title: 'Error',
        description: err.message || 'Failed to generate flow',
        status: 'error',
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFlow = () => {
    if (steps.length === 0) return;

    const newNodes: any[] = [];
    const newEdges: any[] = [];
    const nodeIds: string[] = [];

    // Calculate starting position based on existing nodes - position flow to the right
    const existingNodes = getNodes();
    const rightmostX = existingNodes.length > 0 
      ? Math.max(...existingNodes.map(n => n.position.x))
      : 0;
    
    // Start flow significantly to the right of existing nodes
    let xPosition = rightmostX + 400;
    const yPosition = 200;
    const xSpacing = 280;

    steps.forEach((step, index) => {
      const nodeId = createNodeId();
      nodeIds.push(nodeId);

      newNodes.push({
        id: nodeId,
        type: step.action,
        position: { x: xPosition, y: yPosition },
        data: {
          config: step.config,
          description: step.description,
        },
      });

      xPosition += xSpacing;
    });

    // Create edges AFTER all nodes are defined
    for (let i = 1; i < nodeIds.length; i++) {
      newEdges.push({
        id: `edge-${nodeIds[i - 1]}-${nodeIds[i]}`,
        source: nodeIds[i - 1],
        target: nodeIds[i],
        type: 'default',
        animated: true,
        style: { 
          stroke: '#A1A2FF', 
          strokeWidth: 3
        },
      });
    }

    // Add nodes and edges together - ReactFlow handles this properly
    setNodes((nds) => [...nds, ...newNodes]);
    setEdges((eds) => [...eds, ...newEdges]);
    
    toast({
      title: 'Flow created!',
      description: `Added ${newNodes.length} nodes with ${newEdges.length} connections`,
      status: 'success',
      duration: 3000,
    });

    // Reset and close
    setPrompt('');
    setSteps([]);
    setError(null);
    cmdPalette.onClose();
  };

  useEffect(() => {
    const handleGlobalKeyDown = (event: KeyboardEvent) => {
      if (event.key === "k" && (event.ctrlKey || event.metaKey)) {
        event.preventDefault();
        cmdPalette.onOpen();
      }
    };

    document.addEventListener("keydown", handleGlobalKeyDown);
    return () => document.removeEventListener("keydown", handleGlobalKeyDown);
  }, [cmdPalette]);



  return (
    <Modal
      isOpen={cmdPalette.isOpen}
      onClose={cmdPalette.onClose}
      initialFocusRef={inputRef}
      size={steps.length > 0 ? '2xl' : 'lg'}
    >
      <ModalOverlay bg="rgba(0, 0, 0, 0.7)" backdropFilter="blur(10px)" />
      <ModalContent
        bg="rgba(30, 30, 46, 0.98)"
        border="1px solid rgba(161, 162, 255, 0.2)"
        boxShadow="0px 20px 80px rgba(0, 0, 0, 0.6), 0px 0px 40px rgba(161, 162, 255, 0.15)"
        borderRadius="1.5rem"
        p="3rem"
        maxH="85vh"
        overflowY="auto"
      >
        <VStack spacing="2rem" align="stretch">
          <Box textAlign="center">
            <Text fontSize="2.4rem" fontWeight="700" color="#FFFFFF" mb="0.8rem" letterSpacing="-0.5px">
              ✨ AI Flow Generator
            </Text>
            <Text fontSize="1.2rem" color="rgba(255, 255, 255, 0.75)" fontWeight="500">
              Describe your workflow in plain English
            </Text>
          </Box>

          <Input
            ref={inputRef}
            placeholder="e.g., swap 1 SOL to USDC and stake it on Jupiter"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            size="lg"
            fontSize="1.3rem"
            h="4.5rem"
            bg="rgba(161, 162, 255, 0.08)"
            border="2px solid rgba(161, 162, 255, 0.25)"
            borderRadius="1rem"
            color="#FFFFFF"
            _placeholder={{ color: "rgba(255, 255, 255, 0.5)" }}
            _hover={{ 
              border: '2px solid rgba(161, 162, 255, 0.45)',
              bg: "rgba(161, 162, 255, 0.12)"
            }}
            _focus={{ 
              border: '2px solid rgba(161, 162, 255, 0.7)', 
              boxShadow: '0 0 0 3px rgba(161, 162, 255, 0.15)',
              bg: "rgba(161, 162, 255, 0.12)"
            }}
            disabled={loading}
          />

          {loading && (
            <Flex align="center" justify="center" py="3rem">
              <Spinner size="xl" color="#B5B6FF" thickness="4px" />
              <Text ml="1.5rem" fontSize="1.3rem" color="#FFFFFF" fontWeight="600">
                Generating your flow...
              </Text>
            </Flex>
          )}

          {error && (
            <Box
              bg="rgba(255, 107, 107, 0.12)"
              border="1.5px solid rgba(255, 107, 107, 0.5)"
              borderRadius="1rem"
              p="1.5rem"
            >
              <Text color="#FFC5C5" fontSize="1.1rem" fontWeight="500">
                {error}
              </Text>
            </Box>
          )}

          {steps.length > 0 && !loading && (
            <VStack spacing="1rem" align="stretch" maxH="400px" overflowY="auto" pr="0.5rem">
              {steps.map((step, index) => (
                <Box
                  key={index}
                  bg="rgba(161, 162, 255, 0.1)"
                  border="1.5px solid rgba(161, 162, 255, 0.35)"
                  borderRadius="1.2rem"
                  p="1.5rem"
                  transition="all 0.2s"
                  _hover={{ 
                    bg: "rgba(161, 162, 255, 0.15)",
                    border: "1.5px solid rgba(161, 162, 255, 0.5)"
                  }}
                >
                  <Flex align="center" mb="0.8rem">
                    <Text
                      fontSize="1rem"
                      fontWeight="700"
                      color="#FFFFFF"
                      bg="rgba(161, 162, 255, 0.3)"
                      px="1rem"
                      py="0.4rem"
                      borderRadius="0.6rem"
                    >
                      Step {index + 1}
                    </Text>
                    <Text ml="1rem" fontSize="1.1rem" fontWeight="600" color="#B5B6FF">
                      {step.action}
                    </Text>
                  </Flex>
                  <Text fontSize="1.05rem" color="rgba(255, 255, 255, 0.85)" lineHeight="1.5">
                    {step.description}
                  </Text>
                </Box>
              ))}
            </VStack>
          )}

          <Flex justify="space-between" gap="1.5rem" mt="1rem">
            <Button
              variant="ghost"
              onClick={() => {
                cmdPalette.onClose();
                setPrompt('');
                setSteps([]);
                setError(null);
              }}
              size="lg"
              fontSize="1.2rem"
              h="4.5rem"
              color="rgba(255, 255, 255, 0.7)"
              _hover={{ bg: "rgba(255, 255, 255, 0.05)", color: "#FFFFFF" }}
            >
              Cancel
            </Button>

            {steps.length > 0 ? (
              <Button
                bg="linear-gradient(135deg, #A1A2FF 0%, #7172E8 100%)"
                color="#FFFFFF"
                onClick={handleCreateFlow}
                size="lg"
                fontSize="1.2rem"
                fontWeight="700"
                h="4.5rem"
                flex="1"
                _hover={{
                  transform: 'translateY(-2px)',
                  boxShadow: '0 12px 40px rgba(161, 162, 255, 0.5)',
                }}
                _active={{
                  transform: 'translateY(0px)',
                }}
                transition="all 0.2s"
              >
                Create Flow 🚀
              </Button>
            ) : (
              <Button
                bg="linear-gradient(135deg, #A1A2FF 0%, #7172E8 100%)"
                color="#FFFFFF"
                onClick={handleGenerate}
                isLoading={loading}
                size="lg"
                fontSize="1.2rem"
                fontWeight="700"
                h="4.5rem"
                flex="1"
                _hover={{
                  transform: 'translateY(-2px)',
                  boxShadow: '0 12px 40px rgba(161, 162, 255, 0.5)',
                }}
                _active={{
                  transform: 'translateY(0px)',
                }}
                transition="all 0.2s"
                isDisabled={!prompt.trim()}
              >
                Generate ✨
              </Button>
            )}
          </Flex>

          <Text fontSize="0.95rem" color="rgba(255, 255, 255, 0.6)" textAlign="center" fontWeight="500">
            Press <Text as="span" color="#B5B6FF" fontWeight="600">Enter</Text> to {steps.length > 0 ? 'create' : 'generate'} • <Text as="span" color="#B5B6FF" fontWeight="600">Esc</Text> to close
          </Text>
        </VStack>
      </ModalContent>
    </Modal>
  );
};
