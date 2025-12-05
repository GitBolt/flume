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
import { useReactFlow } from "reactflow";
import { createNodeId } from "@/util/randomData";
import { useCustomModal } from "@/context/modalContext";

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
  const { setNodes, setEdges } = useReactFlow();
  const toast = useToast();

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
      const response = await fetch('/api/generate-flow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
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

    // Starting position
    let xPosition = 200;
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

      // Create edge from previous node
      if (index > 0 && step.assetSource) {
        const sourceIndex = step.assetSource === 'portfolio' ? -1 : parseInt(step.assetSource.replace('step', '')) - 1;
        if (sourceIndex >= 0 && sourceIndex < nodeIds.length) {
          newEdges.push({
            id: `${nodeIds[sourceIndex]}-${nodeId}`,
            source: nodeIds[sourceIndex],
            target: nodeId,
            animated: true,
            style: { stroke: '#A1A2FF', strokeWidth: 2 },
          });
        }
      }

      xPosition += xSpacing;
    });

    setNodes((nds) => [...nds, ...newNodes]);
    setEdges((eds) => [...eds, ...newEdges]);

    toast({
      title: 'Flow created!',
      description: `Added ${newNodes.length} nodes to canvas`,
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
      size={steps.length > 0 ? 'xl' : 'md'}
    >
      <ModalOverlay bg="#00000060" backdropFilter="blur(8px)" />
      <ModalContent
        bg="linear-gradient(243.86deg, rgba(30, 30, 46, 0.95) 0%, rgba(37, 37, 53, 0.95) 100.97%)"
        border="0.5px solid rgba(161, 162, 255, 0.3)"
        boxShadow="0px 0px 60px rgba(161, 162, 255, 0.3)"
        borderRadius="1.2rem"
        p="2rem"
      >
        <VStack spacing="1.5rem" align="stretch">
          <Box>
            <Text fontSize="2rem" fontWeight="700" color="white" mb="0.5rem">
              ✨ AI Flow Generator
            </Text>
            <Text fontSize="1.1rem" color="rgba(255, 255, 255, 0.7)">
              Describe what you want to do, and I'll build it for you
            </Text>
          </Box>

          <Input
            ref={inputRef}
            placeholder="e.g., convert 50% of my solana into usdc and lend it on jupiter"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            size="lg"
            fontSize="1.2rem"
            h="3.5rem"
            bg="rgba(255, 255, 255, 0.05)"
            border="1px solid rgba(255, 255, 255, 0.15)"
            _hover={{ border: '1px solid rgba(161, 162, 255, 0.5)' }}
            _focus={{ border: '1px solid rgba(161, 162, 255, 0.8)', boxShadow: '0 0 0 1px rgba(161, 162, 255, 0.3)' }}
            disabled={loading}
          />

          {loading && (
            <Flex align="center" justify="center" py="2rem">
              <Spinner size="xl" color="primary.200" thickness="4px" />
              <Text ml="1rem" fontSize="1.2rem" color="primary.200">
                Generating flow...
              </Text>
            </Flex>
          )}

          {error && (
            <Box
              bg="rgba(255, 107, 107, 0.1)"
              border="1px solid rgba(255, 107, 107, 0.4)"
              borderRadius="0.8rem"
              p="1rem"
            >
              <Text color="red.300" fontSize="1rem">
                {error}
              </Text>
            </Box>
          )}

          {steps.length > 0 && !loading && (
            <VStack spacing="0.8rem" align="stretch" maxH="300px" overflowY="auto">
              {steps.map((step, index) => (
                <Box
                  key={index}
                  bg="rgba(161, 162, 255, 0.08)"
                  border="1px solid rgba(161, 162, 255, 0.3)"
                  borderRadius="0.8rem"
                  p="1rem"
                >
                  <Flex align="center" mb="0.5rem">
                    <Text
                      fontSize="0.9rem"
                      fontWeight="600"
                      color="primary.200"
                      bg="rgba(161, 162, 255, 0.2)"
                      px="0.6rem"
                      py="0.2rem"
                      borderRadius="0.4rem"
                    >
                      Step {index + 1}
                    </Text>
                    <Text ml="0.8rem" fontSize="1rem" fontWeight="600" color="white">
                      {step.action}
                    </Text>
                  </Flex>
                  <Text fontSize="0.95rem" color="rgba(255, 255, 255, 0.8)">
                    {step.description}
                  </Text>
                </Box>
              ))}
            </VStack>
          )}

          <Flex justify="space-between" gap="1rem">
            <Button
              variant="ghost"
              onClick={() => {
                cmdPalette.onClose();
                setPrompt('');
                setSteps([]);
                setError(null);
              }}
              size="lg"
              fontSize="1.1rem"
            >
              Cancel
            </Button>

            {steps.length > 0 ? (
              <Button
                bg="linear-gradient(135deg, #A1A2FF 0%, #7172E8 100%)"
                color="white"
                onClick={handleCreateFlow}
                size="lg"
                fontSize="1.1rem"
                fontWeight="700"
                _hover={{
                  transform: 'scale(1.05)',
                  boxShadow: '0 8px 25px rgba(161, 162, 255, 0.4)',
                }}
                transition="all 0.2s"
              >
                Create Flow 🚀
              </Button>
            ) : (
              <Button
                bg="linear-gradient(135deg, #A1A2FF 0%, #7172E8 100%)"
                color="white"
                onClick={handleGenerate}
                isLoading={loading}
                size="lg"
                fontSize="1.1rem"
                fontWeight="700"
                _hover={{
                  transform: 'scale(1.05)',
                  boxShadow: '0 8px 25px rgba(161, 162, 255, 0.4)',
                }}
                transition="all 0.2s"
                isDisabled={!prompt.trim()}
              >
                Generate ✨
              </Button>
            )}
          </Flex>

          <Text fontSize="0.85rem" color="rgba(255, 255, 255, 0.5)" textAlign="center">
            Press Enter to generate • Press Esc to close
          </Text>
        </VStack>
      </ModalContent>
    </Modal>
  );
};
