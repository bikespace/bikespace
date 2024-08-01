import React, {createContext} from 'react';

type FocusedSubmissionIdContextData = {
  focus: number | null;
  setFocus: React.Dispatch<React.SetStateAction<number | null>>;
};

export const FocusedSubmissionIdContext =
  createContext<FocusedSubmissionIdContextData>({
    focus: null,
    setFocus: () => {},
  });
