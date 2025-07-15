import React, { createContext, useContext, useEffect, useState } from "react";
import { getConnectionsByStatus } from "../services/connectionService";

const ConnectionContext = createContext();

export function useConnections() {
  return useContext(ConnectionContext);
}

export function ConnectionProvider({ children }) {
  const [connections, setConnections] = useState({
    pending: [],
    pending_parental_approval: [],
    parent_approved: [],
    approved: [],
    incomingRequests: [],
  });
  const [loading, setLoading] = useState(true);

  const fetchAllConnections = async () => {
    setLoading(true);
    const schoolId = localStorage.getItem("schoolId");
    if (!schoolId) {
      setLoading(false);
      return;
    }
    const statuses = [
      "pending",
      "pending_parental_approval",
      "parent_approved",
      "approved",
    ];
    const results = await Promise.all(
      statuses.map((status) => getConnectionsByStatus(schoolId, status))
    );
    const categorized = {};
    statuses.forEach((status, i) => {
      categorized[status] = results[i]?.connections || [];
    });

    const unfilteredIncomingRequests = [...categorized["pending"], ...categorized["parent_approved"]]
    const incomingRequests = unfilteredIncomingRequests.filter((connection) => connection.role==='target');

    setConnections({...categorized, incomingRequests});

    // Update localStorage for compatibility
    localStorage.setItem(
      "pendingConnections",
      JSON.stringify(
        categorized["pending_parental_approval"].map((conn) =>
          conn.role === "initiator" ? conn.targetUserId : conn.initiateUserId
        )
      )
    );
    localStorage.setItem(
      "approvedConnections",
      JSON.stringify(
        categorized["parent_approved"].map((conn) =>
          conn.role === "initiator" ? conn.targetUserId : conn.initiateUserId
        )
      )
    );
    setLoading(false);
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