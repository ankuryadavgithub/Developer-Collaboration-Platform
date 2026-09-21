// client/src/context/NavigationLoadingContext.jsx

import { createContext, useCallback, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";

const NavigationLoadingContext = createContext(null);

export function NavigationLoadingProvider({ children }) {
  const navigate = useNavigate();
  const [isNavigating, setIsNavigating] = useState(false);

  const goTo = useCallback(
    (to, options = {}) => {
      setIsNavigating(true);

      window.setTimeout(() => {
        navigate(to, options);

        // Keep the loader visible briefly after the next page renders.
        window.setTimeout(() => {
          setIsNavigating(false);
        }, 150);
      }, 1000);
    },
    [navigate]
  );

  return (
    <NavigationLoadingContext.Provider value={{ isNavigating, goTo }}>
      {children}
    </NavigationLoadingContext.Provider>
  );
}

export function useNavigationLoading() {
  const context = useContext(NavigationLoadingContext);

  if (!context) {
    throw new Error(
      "useNavigationLoading must be used inside NavigationLoadingProvider."
    );
  }

  return context;
}