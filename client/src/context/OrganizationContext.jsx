import React, { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";

const OrganizationContext = createContext();

export const OrganizationProvider = ({ children }) => {
  const [organizations, setOrganizations] = useState([]);
  const [currentOrg, setCurrentOrg] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch all organizations the logged-in user belongs to
  const fetchOrganizations = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/organizations/mine",
        { withCredentials: true },
      );
      if (res.data.success) {
        setOrganizations(res.data.data);

        // Remember the last organization they were looking at
        const storedOrgId = localStorage.getItem("currentOrgId");
        if (res.data.data.length > 0) {
          const orgToSelect =
            res.data.data.find((o) => o.id === parseInt(storedOrgId)) ||
            res.data.data[0];
          setCurrentOrg(orgToSelect);
          localStorage.setItem("currentOrgId", orgToSelect.id);
        } else {
          setCurrentOrg(null);
          localStorage.removeItem("currentOrgId");
        }
      }
    } catch (error) {
      console.error("Failed to fetch organizations", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Only fetch if a user is currently logged in
    if (localStorage.getItem("user")) {
      fetchOrganizations();
    } else {
      setLoading(false);
    }
  }, []);

  const switchOrganization = (orgId) => {
    const org = organizations.find((o) => o.id === parseInt(orgId));
    if (org) {
      setCurrentOrg(org);
      localStorage.setItem("currentOrgId", org.id);
    }
  };

  return (
    <OrganizationContext.Provider
      value={{
        organizations,
        currentOrg,
        switchOrganization,
        loading,
        fetchOrganizations,
      }}
    >
      {children}
    </OrganizationContext.Provider>
  );
};

export const useOrganization = () => useContext(OrganizationContext);
