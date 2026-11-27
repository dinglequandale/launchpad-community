import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { getConnectionsByStatus } from "../services/connectionService";
import { useAuth } from "./auth/AuthContext";

const ConnectionContext = createContext();

export function useConnections() {
  return useContext(ConnectionContext);
}

export function ConnectionProvider({ children }) {
  // COMMUNITY VERSION: Removed parent approval states
  const [connections, setConnections] = useState({
    pending: [],
    approved: [],
    incomingRequests: [],
  });
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();
  const uid = currentUser?.uid || null;
  const lastFetchRef = useRef(0);

  const fetchAllConnections = useCallback(async () => {
    // The provider wraps public pages too; never call the backend while signed out.
    if (!uid) {
      setConnections({ pending: [], approved: [], incomingRequests: [] });
      setLoading(false);
      return;
    }
    lastFetchRef.current = Date.now();
    setLoading(true);
    try {
      // COMMUNITY VERSION: Simplified to only pending and approved
      const statuses = ["pending", "approved"];
      const results = await Promise.all(
        statuses.map((status) => getConnectionsByStatus(status))
      );
      const categorized = {};
      statuses.forEach((status, i) => {
        categorized[status] = results[i]?.connections || [];
      });

      const incomingRequests = categorized["pending"].filter((connection) => connection.role==='target');

      setConnections({...categorized, incomingRequests});

      // Update localStorage for compatibility
      localStorage.setItem(
        "approvedConnections",
        JSON.stringify(
          categorized["approved"].map((conn) =>
            conn.role === "initiator" ? conn.targetUserId : conn.initiateUserId
          )
        )
      );
    } catch (error) {
      console.error('Error fetching connections:', error);
      // Set empty connections on error
      setConnections({
        pending: [],
        approved: [],
        incomingRequests: [],
      });
    } finally {
      setLoading(false);
    }
  }, [uid]);

  // Fetch whenever the signed-in user changes (login, logout, account switch).
  useEffect(() => {
    fetchAllConnections();
  }, [fetchAllConnections]);

  // Refetch connections when user returns to the tab (handles cases where connections
  // were updated while user was away or in another tab)
  useEffect(() => {
    // 'focus' and 'visibilitychange' usually fire together; throttle to one fetch.
    const refetchIfStale = () => {
      if (Date.now() - lastFetchRef.current > 5000) {
        fetchAllConnections();
      }
    };
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        refetchIfStale();
      }
    };

    const handleFocus = () => {
      refetchIfStale();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [fetchAllConnections]);

  // Optionally, expose a refetch function for when connections change
  const refetchConnections = fetchAllConnections;

  return (
    <ConnectionContext.Provider
      value={{ ...connections, loading, refetchConnections }}
    >
      {children}
    </ConnectionContext.Provider>
  );
} 