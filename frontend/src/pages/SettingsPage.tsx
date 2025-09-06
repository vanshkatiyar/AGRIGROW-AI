import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/context/AuthContext';

const SettingsPage = () => {
  const { user } = useAuth();
  
  return (
    <Layout>
      <div className="container mx-auto p-4 sm:p-6">
        <h1 className="text-3xl font-bold mb-6">Settings</h1>
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile">
            <Card>
              <CardHeader><CardTitle>Public Profile</CardTitle><CardDescription>This information will be displayed publicly.</CardDescription></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2"><Label htmlFor="name">Name</Label><Input id="name" defaultValue={user?.name} /></div>
                <div className="space-y-2"><Label htmlFor="location">Location</Label><Input id="location" defaultValue={user?.location} /></div>
                <div className="space-y-2"><Label htmlFor="bio">Bio</Label><Input id="bio" defaultValue={user?.bio} /></div>
                <Button>Save Changes</Button>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="account">
             <Card>
              <CardHeader><CardTitle>Account Settings</CardTitle><CardDescription>Manage your account details.</CardDescription></CardHeader>
              <CardContent className="space-y-4">
                 <div className="space-y-2"><Label htmlFor="email">Email</Label><Input id="email" type="email" defaultValue={user?.email} disabled /></div>
                 <Button variant="outline">Change Password</Button>
                 <Card className="border-destructive bg-destructive/10">
                    <CardHeader><CardTitle className="text-destructive">Danger Zone</CardTitle></CardHeader>
                    <CardContent>
                        <p className="text-sm mb-4">Deleting your account is permanent and cannot be undone.</p>
                        <Button variant="destructive">Delete My Account</Button>
                    </CardContent>
                 </Card>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications">
            <Card>
              <CardHeader><CardTitle>Notification Settings</CardTitle><CardDescription>How you want to be notified.</CardDescription></CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div><Label>New Messages</Label><p className="text-xs text-muted-foreground">Receive a notification when someone messages you.</p></div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div><Label>Post Likes & Comments</Label><p className="text-xs text-muted-foreground">Get notified about engagement on your posts.</p></div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div><Label>Market Alerts</Label><p className="text-xs text-muted-foreground">Receive price alerts for crops you follow.</p></div>
                  <Switch />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default SettingsPage;