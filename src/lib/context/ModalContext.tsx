import React, { createContext, useContext, useReducer, useCallback } from 'react';

type ModalType = string;

interface ModalState {
  stack: ModalType[];
}

type ModalAction = 
  | { type: 'PUSH_MODAL'; payload: ModalType }
  | { type: 'POP_MODAL' }
  | { type: 'CLOSE_ALL' };

interface ModalContextType {
  modalStack: ModalType[];
  pushModal: (modal: ModalType) => void;
  popModal: () => void;
  closeAllModals: () => void;
  isTopModal: (modal: ModalType) => boolean;
}

const ModalContext = createContext<ModalContextType | null>(null);

function modalReducer(state: ModalState, action: ModalAction): ModalState {
  switch (action.type) {
    case 'PUSH_MODAL':
      return {
        ...state,
        stack: [...state.stack, action.payload]
      };
    case 'POP_MODAL':
      return {
        ...state,
        stack: state.stack.slice(0, -1)
      };
    case 'CLOSE_ALL':
      return {
        ...state,
        stack: []
      };
    default:
      return state;
  }
}

export function ModalProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(modalReducer, { stack: [] });

  const pushModal = useCallback((modal: ModalType) => {
    dispatch({ type: 'PUSH_MODAL', payload: modal });
  }, []);

  const popModal = useCallback(() => {
    dispatch({ type: 'POP_MODAL' });
  }, []);

  const closeAllModals = useCallback(() => {
    dispatch({ type: 'CLOSE_ALL' });
  }, []);

  const isTopModal = useCallback((modal: ModalType) => {
    return state.stack[state.stack.length - 1] === modal;
  }, [state.stack]);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && state.stack.length > 0) {
        e.preventDefault();
        popModal();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [popModal]);

  const value = {
    modalStack: state.stack,
    pushModal,
    popModal,
    closeAllModals,
    isTopModal
  };

  return (
    <ModalContext.Provider value={value}>
      {children}
    </ModalContext.Provider>
  );
}

export function useModal() {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
}