import React, { createContext, useContext, useEffect, useState } from "react";
import { getConnectionsByStatus } from "../services/connectionService";

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

  const fetchAllConnections = async () => {
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
  };

  useEffect(() => {
    fetchAllConnections();
    // eslint-disable-next-line
  }, []);

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