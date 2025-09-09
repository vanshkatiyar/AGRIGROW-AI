import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getUsersForMessaging, createConversation } from '@/services/messageService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/AuthContext';

const TestMessaging = () => {
    const { user } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const [creatingConversation, setCreatingConversation] = useState<string | null>(null);

    const { data: usersData, isLoading, error, refetch } = useQuery({
        queryKey: ['test-users', searchTerm],
        queryFn: () => getUsersForMessaging(searchTerm),
        enabled: !!user
    });

    const handleCreateConversation = async (recipientId: string, recipientName: string) => {
        setCreatingConversation(recipientId);
        try {
            const conversation = await createConversation(recipientId);
            alert(`✅ Conversation created with ${recipientName}! ID: ${conversation._id}`);
        } catch (error) {
            console.error('Error creating conversation:', error);
            alert(`❌ Failed to create conversation: ${error.message}`);
        } finally {
            setCreatingConversation(null);
        }
    };

    if (!user) {
        return (
            <div className="p-8">
                <Card>
                    <CardContent className="pt-6">
                        <p className="text-center text-muted-foreground">
                            Please login to test messaging features
                        </p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <Card>
                <CardHeader>
                    <CardTitle>🧪 Messaging Feature Test</CardTitle>
                    <p className="text-muted-foreground">
                        Current user: <strong>{user.name}</strong> ({user.email})
                    </p>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Search Input */}
                    <div className="flex gap-2">
                        <Input
                            placeholder="Search users by name or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <Button onClick={() => refetch()}>Refresh</Button>
                    </div>

                    {/* Loading State */}
                    {isLoading && (
                        <div className="text-center py-4">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                            <p className="mt-2 text-muted-foreground">Loading users...</p>
                        </div>
                    )}

                    {/* Error State */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <h3 className="font-medium text-red-800">❌ Error Loading Users</h3>
                            <p className="text-red-600 mt-1">
                                {error instanceof Error ? error.message : 'Unknown error'}
                            </p>
                            <p className="text-sm text-red-500 mt-2">
                                Check the browser console and network tab for more details
                            </p>
                        </div>
                    )}

                    {/* Users List */}
                    {usersData && (
                        <div>
                            <h3 className="font-medium mb-3">
                                📋 Available Users ({usersData.users?.length || 0})
                            </h3>

                            {usersData.users?.length === 0 ? (
                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                    <p className="text-yellow-800">
                                        No users found. This could mean:
                                    </p>
                                    <ul className="list-disc ml-4 mt-2 text-yellow-700">
                                        <li>No other users are registered</li>
                                        <li>All users have messaging disabled</li>
                                        <li>Search term doesn't match any users</li>
                                    </ul>
                                </div>
                            ) : (
                                <div className="grid gap-3">
                                    {usersData.users?.map((user) => (
                                        <div
                                            key={user._id}
                                            className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
                                        >
                                            <div className="flex items-center space-x-3">
                                                <Avatar className="h-10 w-10">
                                                    <AvatarImage src={user.profileImage} />
                                                    <AvatarFallback>
                                                        {user.name.charAt(0).toUpperCase()}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <div className="flex items-center space-x-2">
                                                        <h4 className="font-medium">{user.name}</h4>
                                                        {user.role && (
                                                            <Badge variant="secondary">{user.role}</Badge>
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-muted-foreground">{user.email}</p>
                                                    {user.location && (
                                                        <p className="text-xs text-muted-foreground">📍 {user.location}</p>
                                                    )}
                                                </div>
                                            </div>
                                            <Button
                                                onClick={() => handleCreateConversation(user._id, user.name)}
                                                disabled={creatingConversation === user._id}
                                                size="sm"
                                            >
                                                {creatingConversation === user._id ? (
                                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                                                ) : (
                                                    'Start Chat'
                                                )}
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Debug Info */}
                    <details className="mt-6">
                        <summary className="cursor-pointer text-sm text-muted-foreground">
                            🔍 Debug Information
                        </summary>
                        <div className="mt-2 p-3 bg-gray-50 rounded text-xs">
                            <pre>{JSON.stringify({ usersData, error: error?.message }, null, 2)}</pre>
                        </div>
                    </details>
                </CardContent>
            </Card>
        </div>
    );
};

export default TestMessaging;