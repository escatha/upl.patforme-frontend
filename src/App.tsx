// src/App.tsx
import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { UserProvider } from "./contexts/UserContext";
import { ExamProvider } from "./contexts/ExamContext";
import * as ReactDirection from "@radix-ui/react-direction";
import { ThemeProvider } from "./components/theme-provider";
import AppRoutes from "./AppRoutes";

const App: React.FC = () => {
  return (
    <ReactDirection.Provider dir="ltr">
      <ThemeProvider>
        <UserProvider>
          <ExamProvider>
            <Router>
              <AppRoutes />
            </Router>
          </ExamProvider>
        </UserProvider>
      </ThemeProvider>
    </ReactDirection.Provider>
  );
};

export default App;

