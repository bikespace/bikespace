import {StateCreator} from 'zustand';

export interface FocusedIdSlice {
  focusedId: number | null;
  setFocusedId: (id: number | null) => void;
}

export const createFocusedIdSlice: StateCreator<
  FocusedIdSlice,
  [],
  [],
  FocusedIdSlice
> = set => ({
  focusedId: null,
  setFocusedId: id => set(() => ({focusedId: id})),
});
