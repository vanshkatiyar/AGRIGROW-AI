import React, { useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../hooks/use-toast';

const SetExpertRolePage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { user, setUser } = useAuth();
  const { toast } = useToast();

  const handleSetExpert = async () => {
    setIsLoading(true);
    try {
      const response = await api.put('/users/set-expert');
      setUser(response.data.user);
      toast({
        title: "Success",
        description: "Your role has been updated to 'expert'. Please log in again to see the changes.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update role. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Set Expert Role</h1>
      <p>This page is a temporary tool to fix role permissions.</p>
      {user && <p>Current Role: {user.role}</p>}
      <button onClick={handleSetExpert} disabled={isLoading}>
        {isLoading ? 'Updating...' : 'Set My Role to Expert'}
      </button>
    </div>
  );
};

export default SetExpertRolePage;