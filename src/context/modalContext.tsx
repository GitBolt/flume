import { ReactNode, createContext, useContext } from 'react';
import { useDisclosure } from '@chakra-ui/react';

type ModalContextType = {
  cmdPalette: {
    isOpen: boolean;
    onOpen: () => void;
    onClose: () => void;
  };
};

export const ModalContext = createContext<ModalContextType>({
  cmdPalette: {
    isOpen: false,
    onOpen: () => { },
    onClose: () => { },
  },
});

export const ModalProvider = ({ children }: { children: ReactNode }) => {
  const cmdPalette = useDisclosure();

  return (
    <ModalContext.Provider value={{ cmdPalette }}>
      {children}
    </ModalContext.Provider>
  );
};

export const useCustomModal = () => {
  return useContext(ModalContext)
};
