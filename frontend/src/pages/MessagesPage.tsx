import { Layout } from '@/components/layout/Layout';
import { MessageCenter } from '@/components/messaging/MessageCenter';

const MessagesPage = () => {
  return (
    <Layout>
      <div className="w-full h-[calc(100vh-4.1rem)] p-0 sm:p-2 lg:p-4">
        <div className="h-full w-full border-0 sm:border sm:rounded-lg overflow-hidden">
          <MessageCenter />
        </div>
      </div>
    </Layout>
  );
};

export default MessagesPage;