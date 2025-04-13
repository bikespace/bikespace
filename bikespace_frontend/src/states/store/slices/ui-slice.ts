import {StateCreator} from 'zustand';

export interface UiState {
  sidebar: {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
  };
}

export interface UiSlice {
  ui: UiState;
}

export const createUiSlice: StateCreator<UiSlice, [], [], UiSlice> = set => ({
  ui: {
    sidebar: {
      isOpen: false,
      setIsOpen: (isOpen: boolean) => {
        set(state => ({
          ui: {
            ...state.ui,
            sidebar: {
              ...state.ui.sidebar,
              isOpen,
            },
          },
        }));
      },
    },
  },
});
