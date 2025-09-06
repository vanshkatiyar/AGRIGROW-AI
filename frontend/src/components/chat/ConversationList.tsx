import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/context/AuthContext';

interface ConversationListProps {
  conversations: any[];
  groups: any[];
  selectedConversationId: string | null;
  onSelectConversation: (conversation: any) => void;
  isLoading: boolean;
}

export const ConversationList: React.FC<ConversationListProps> = ({ conversations, groups, selectedConversationId, onSelectConversation, isLoading }) => {
    const { user } = useAuth();

    if (isLoading) {
      return (
        <div className="w-1/3 border-r p-2 space-y-2">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}</div>
      )
    }

  return (
    <div className="w-1/3 border-r flex flex-col">
      <div className="p-4 border-b"><h2 className="text-xl font-bold">Chats</h2></div>
      <div className="flex-1 overflow-y-auto">
        {conversations.map((convo) => {
            const otherParticipant = convo.participants.find((p: any) => p._id !== user?.id);
            if (!otherParticipant) return null;
            return (
              <div key={convo._id} className={cn("p-4 flex items-start gap-3 border-b cursor-pointer hover:bg-muted", selectedConversationId === convo._id && "bg-muted")} onClick={() => onSelectConversation(convo)}>
                <Avatar className="h-10 w-10"><AvatarImage src={otherParticipant.profileImage} /><AvatarFallback>{otherParticipant.name.charAt(0)}</AvatarFallback></Avatar>
                <div className="flex-1 overflow-hidden"><p className="font-semibold truncate">{otherParticipant.name}</p><p className="text-xs text-muted-foreground truncate">{convo.lastMessage?.content || '...'}</p></div>
              </div>
            )
        })}
        {groups.map((group) => (
             <div key={group._id} className={cn("p-4 flex items-start gap-3 border-b cursor-pointer hover:bg-muted", selectedConversationId === group._id && "bg-muted")} onClick={() => onSelectConversation(group)}>
                <Avatar className="h-10 w-10"><AvatarFallback>{group.name.charAt(0)}</AvatarFallback></Avatar>
                <div className="flex-1 overflow-hidden"><p className="font-semibold truncate">{group.name}</p><p className="text-xs text-muted-foreground truncate">{group.participants.length} members</p></div>
              </div>
        ))}
      </div>
    </div>
  );
};