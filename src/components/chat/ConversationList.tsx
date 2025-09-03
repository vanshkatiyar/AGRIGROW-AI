import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
// import { Conversation } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';

interface ConversationListProps {
  conversations: any[]; // Combined list for now
  groups: any[];
  selectedConversationId: string | null;
  onSelectConversation: (conversation: any) => void;
  isLoading: boolean;
}

export const ConversationList: React.FC<ConversationListProps> = ({ conversations, groups, selectedConversationId, onSelectConversation, isLoading }) => {
    if (isLoading) {
        return (
            <div className="w-1/3 border-r p-2 space-y-2">
                {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
            </div>
        )
    }
  return (
    <div className="w-1/3 border-r flex flex-col">
      <div className="p-4 border-b"><h2 className="text-xl font-bold">Chats</h2></div>
      <div className="flex-1 overflow-y-auto">
        {/* Render individual conversations and groups */}
        {[...conversations, ...groups].map((convo) => (
          <div
            key={convo._id}
            className={cn("p-4 flex items-start gap-3 border-b cursor-pointer hover:bg-muted", selectedConversationId === convo._id && "bg-muted")}
            onClick={() => onSelectConversation(convo)}
          >
            <Avatar className="h-10 w-10">
              <AvatarImage src={convo.participants[0].profileImage} />
              <AvatarFallback>{convo.name ? convo.name.charAt(0) : convo.participants[0].name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 overflow-hidden">
              <p className="font-semibold truncate">{convo.name || convo.participants[0].name}</p>
              <p className="text-xs text-muted-foreground truncate">{convo.lastMessage?.content || 'Start a conversation'}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};