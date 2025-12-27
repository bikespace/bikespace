import {StateCreator} from 'zustand';

export interface UiState {
  sidebar: {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
  };
  loading: {
    isFullDataLoading: boolean;
    setIsFullDataLoading: (isFullDataLoading: boolean) => void;
    isFirstMarkerDataLoading: boolean;
    setIsFirstMarkerDataLoading: (isFirstMarkerDataLoading: boolean) => void;
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
    loading: {
      isFullDataLoading: false,
      setIsFullDataLoading: (isFullDataLoading: boolean) => {
        set(state => ({
          ui: {
            ...state.ui,
            loading: {
              ...state.ui.loading,
              isFullDataLoading: isFullDataLoading,
            },
          },
        }));
      },
      isFirstMarkerDataLoading: false,
      setIsFirstMarkerDataLoading: (isFirstMarkerDataLoading: boolean) => {
        set(state => ({
          ui: {
            ...state.ui,
            loading: {
              ...state.ui.loading,
              isFirstMarkerDataLoading: isFirstMarkerDataLoading,
            },
          },
        }));
      },
    },
  },
});
