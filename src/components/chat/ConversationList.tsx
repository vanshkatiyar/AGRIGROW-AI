import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

// Define a type for your conversation/user object
export interface Conversation {
  id: string;
  name: string;
  profileImage?: string;
  lastMessage?: string;
}

interface ConversationListProps {
  conversations: Conversation[];
  selectedConversationId: string | null;
  onSelectConversation: (conversation: Conversation) => void;
}

export const ConversationList: React.FC<ConversationListProps> = ({ conversations, selectedConversationId, onSelectConversation }) => {
  return (
    <div className="w-1/3 border-r flex flex-col">
      <div className="p-4 border-b">
        <h2 className="text-xl font-bold">Chats</h2>
        {/* Search functionality can be added here */}
      </div>
      <div className="flex-1 overflow-y-auto">
        {conversations.map((convo) => (
          <div
            key={convo.id}
            className={cn(
              "p-4 flex items-start gap-3 border-b cursor-pointer hover:bg-muted",
              selectedConversationId === convo.id && "bg-muted"
            )}
            onClick={() => onSelectConversation(convo)}
          >
            <Avatar className="h-10 w-10">
              <AvatarImage src={convo.profileImage} />
              <AvatarFallback>{convo.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 overflow-hidden">
              <p className="font-semibold truncate">{convo.name}</p>
              <p className="text-xs text-muted-foreground truncate">
                {convo.lastMessage || 'Click to start a chat...'}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};