import React, {createContext} from 'react';

type DashboardState = {
  tabState: {
    tab: string;
    setTab: React.Dispatch<React.SetStateAction<string>>;
  };
} | null;

export const DashboardContext = createContext<DashboardState>(null);
