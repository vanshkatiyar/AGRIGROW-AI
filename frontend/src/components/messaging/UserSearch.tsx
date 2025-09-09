import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Search, MessageCircle, Phone, Video } from 'lucide-react';
import { getUsersForMessaging, createConversation } from '@/services/messageService';
import { Conversation, User } from '@/types';
import { OnlineStatus } from './OnlineStatus';
import { useAuth } from '@/context/AuthContext';
import { useCall } from '@/context/CallContext';
import { cn } from '@/lib/utils';

interface UserSearchProps {
  onConversationCreated: (conversation: Conversation) => void;
}

export const UserSearch: React.FC<UserSearchProps> = ({ onConversationCreated }) => {
  const { user: currentUser } = useAuth();
  const { startCall } = useCall();
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [isCreatingConversation, setIsCreatingConversation] = useState<string | null>(null);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch users
  const {
    data: usersData,
    isLoading: isLoadingUsers,
    error
  } = useQuery({
    queryKey: ['users-for-messaging', debouncedQuery],
    queryFn: () => {
      console.log('🔍 Fetching users with query:', debouncedQuery);
      return getUsersForMessaging(debouncedQuery);
    },
    enabled: true, // Always enabled to show all users initially
    onSuccess: (data) => {
      console.log('✅ Users fetched successfully:', data);
    },
    onError: (error) => {
      console.error('❌ Error fetching users:', error);
    }
  });

  const users = usersData?.users || [];

  const handleStartConversation = async (user: User) => {
    if (!user._id || isCreatingConversation) return;

    setIsCreatingConversation(user._id);

    try {
      const conversation = await createConversation(user._id);
      onConversationCreated(conversation);
    } catch (error) {
      console.error('Failed to create conversation:', error);
    } finally {
      setIsCreatingConversation(null);
    }
  };

  const handleStartCall = async (user: User, callType: 'audio' | 'video') => {
    try {
      await startCall(user._id, user.name, callType);
    } catch (error) {
      console.error('Failed to start call:', error);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'farmer':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'buyer':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'expert':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search users by name or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Search Results */}
      <ScrollArea className="h-[400px]">
        {isLoadingUsers ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="flex items-center space-x-3 p-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
                <Skeleton className="h-8 w-20" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <p className="text-red-500 font-medium">Failed to load users</p>
              <p className="text-sm text-muted-foreground mt-1">
                Error: {error instanceof Error ? error.message : 'Unknown error'}
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Check console for more details
              </p>
            </div>
          </div>
        ) : users.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {searchQuery.length < 2
                  ? 'Type at least 2 characters to search'
                  : 'No users found'}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {users.map((user) => (
              <div
                key={user._id}
                className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
              >
                {/* Avatar with online status */}
                <div className="relative">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user.profileImage} />
                    <AvatarFallback>
                      {user.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <OnlineStatus userId={user._id} />
                </div>

                {/* User details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <h4 className="font-medium truncate">{user.name}</h4>
                    {user.role && (
                      <Badge
                        variant="secondary"
                        className={cn('text-xs', getRoleBadgeColor(user.role))}
                      >
                        {user.role}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    {user.email}
                  </p>
                  {user.location && (
                    <p className="text-xs text-muted-foreground truncate">
                      📍 {user.location}
                    </p>
                  )}
                </div>

                {/* Action buttons */}
                <div className="flex items-center space-x-1 sm:space-x-2 shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleStartCall(user, 'audio')}
                    title="Audio call"
                    className="p-2"
                  >
                    <Phone className="h-3 w-3 sm:h-4 sm:w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleStartCall(user, 'video')}
                    title="Video call"
                    className="p-2"
                  >
                    <Video className="h-3 w-3 sm:h-4 sm:w-4" />
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleStartConversation(user)}
                    disabled={isCreatingConversation === user._id}
                    className="text-xs sm:text-sm"
                  >
                    {isCreatingConversation === user._id ? (
                      <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-white" />
                    ) : (
                      <>
                        <MessageCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                        <span className="hidden sm:inline">Message</span>
                        <span className="sm:hidden">Chat</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Help text */}
      <div className="text-xs text-muted-foreground text-center">
        Select a user to start a new conversation
      </div>
    </div>
  );
};