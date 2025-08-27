import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Bell } from 'lucide-react';

const mockNotifications = [
  { id: 1, user: "Suresh Patel", image: "/api/placeholder/40/40", action: "liked your post:", content: "My wheat harvest is ready...", time: "2 hours ago" },
  { id: 2, user: "Marketplace", image: "/api/placeholder/40/40", action: "posted a new listing for:", content: "Fresh Organic Tomatoes", time: "5 hours ago" },
  { id: 3, user: "Priya Sharma", image: "/api/placeholder/40/40", action: "commented on your post:", content: "Looks like a healthy crop! Have you checked...", time: "1 day ago" },
];

const NotificationsPage = () => {
  return (
    <Layout>
      <div className="container mx-auto max-w-2xl p-4 sm:p-6">
        <h1 className="text-3xl font-bold mb-6 flex items-center gap-2"><Bell /> Notifications</h1>
        <Card>
          <CardContent className="p-0">
            <ul className="divide-y">
              {mockNotifications.map(notif => (
                <li key={notif.id} className="p-4 flex items-start gap-4 hover:bg-muted transition-colors">
                  <Avatar className="h-10 w-10"><AvatarImage src={notif.image} /><AvatarFallback>{notif.user.charAt(0)}</AvatarFallback></Avatar>
                  <div className="flex-1">
                    <p className="text-sm">
                      <span className="font-semibold">{notif.user}</span> {notif.action} <span className="text-muted-foreground italic">"{notif.content}"</span>
                    </p>
                    <p className="text-xs text-primary mt-1">{notif.time}</p>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default NotificationsPage;