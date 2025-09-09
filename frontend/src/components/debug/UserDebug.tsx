import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getUsersForMessaging } from '@/services/messageService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const UserDebug: React.FC = () => {
  const { data: usersData, isLoading, error, refetch } = useQuery({
    queryKey: ['debug-users'],
    queryFn: () => getUsersForMessaging('', 1, 50), // Get all users
  });

  const users = usersData?.users || [];

  return (
    <Card className="m-4">
      <CardHeader>
        <CardTitle>Debug: Users Available for Messaging</CardTitle>
        <Button onClick={() => refetch()}>Refresh</Button>
      </CardHeader>
      <CardContent>
        {isLoading && <p>Loading users...</p>}
        {error && <p className="text-red-500">Error: {error.message}</p>}
        
        <div className="space-y-2">
          <p><strong>Total users found:</strong> {users.length}</p>
          
          {users.length === 0 ? (
            <div className="p-4 bg-yellow-100 rounded">
              <p><strong>No users found!</strong></p>
              <p>This could mean:</p>
              <ul className="list-disc ml-4 mt-2">
                <li>No users are registered in the system</li>
                <li>All users have messaging disabled</li>
                <li>There's an API issue</li>
              </ul>
            </div>
          ) : (
            <div className="space-y-2">
              {users.map((user) => (
                <div key={user._id} className="p-2 border rounded">
                  <p><strong>{user.name}</strong> ({user.email})</p>
                  <p>Role: {user.role || 'No role'}</p>
                  <p>Location: {user.location}</p>
                  <p>ID: {user._id}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};