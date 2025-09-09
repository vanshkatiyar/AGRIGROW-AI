import React from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ResponsiveContainer, ResponsiveGrid, ResponsiveFlex, ResponsiveText } from '@/components/common/ResponsiveContainer';
import { useResponsive, useIsMobile, useIsDesktop } from '@/hooks/useResponsive';
import { 
  Smartphone, 
  Tablet, 
  Monitor, 
  Laptop, 
  Eye, 
  Grid3X3, 
  Layers,
  Type,
  Palette
} from 'lucide-react';

const ResponsiveTest = () => {
  const { windowSize, isMobile, isTablet, isDesktop } = useResponsive();
  const isMobileHook = useIsMobile();
  const isDesktopHook = useIsDesktop();

  const getDeviceType = () => {
    if (isMobile) return { icon: Smartphone, label: 'Mobile', color: 'bg-red-500' };
    if (isTablet) return { icon: Tablet, label: 'Tablet', color: 'bg-yellow-500' };
    if (isDesktop) return { icon: Monitor, label: 'Desktop', color: 'bg-green-500' };
    return { icon: Laptop, label: 'Unknown', color: 'bg-gray-500' };
  };

  const device = getDeviceType();
  const DeviceIcon = device.icon;

  return (
    <Layout>
      <ResponsiveContainer maxWidth="full" padding="md">
        {/* Header */}
        <div className="mb-8 text-center">
          <ResponsiveText size="3xl" weight="bold" align="center" className="mb-4">
            🎯 Responsive Design Test
          </ResponsiveText>
          <ResponsiveText size="base" className="text-muted-foreground">
            This page demonstrates the responsive design system across all device sizes
          </ResponsiveText>
        </div>

        {/* Device Detection */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Current Device Detection
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveFlex direction="col" gap="md" align="center" justify="between">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-full ${device.color} text-white`}>
                  <DeviceIcon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{device.label}</h3>
                  <p className="text-sm text-muted-foreground">
                    {windowSize.width} × {windowSize.height}px
                  </p>
                </div>
              </div>
              
              <div className="flex gap-2 flex-wrap">
                <Badge variant={isMobile ? "default" : "secondary"}>
                  Mobile: {isMobile ? '✓' : '✗'}
                </Badge>
                <Badge variant={isTablet ? "default" : "secondary"}>
                  Tablet: {isTablet ? '✓' : '✗'}
                </Badge>
                <Badge variant={isDesktop ? "default" : "secondary"}>
                  Desktop: {isDesktop ? '✓' : '✗'}
                </Badge>
              </div>
            </ResponsiveFlex>
          </CardContent>
        </Card>

        {/* Responsive Grid Test */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Grid3X3 className="h-5 w-5" />
              Responsive Grid System
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h4 className="font-medium mb-3">2-Column Grid (1 on mobile, 2 on desktop)</h4>
                <ResponsiveGrid cols={2} gap="md">
                  <Card className="p-4 bg-blue-50 dark:bg-blue-950">
                    <p className="text-sm">Grid Item 1</p>
                  </Card>
                  <Card className="p-4 bg-green-50 dark:bg-green-950">
                    <p className="text-sm">Grid Item 2</p>
                  </Card>
                </ResponsiveGrid>
              </div>

              <div>
                <h4 className="font-medium mb-3">4-Column Grid (1→2→3→4 responsive)</h4>
                <ResponsiveGrid cols={4} gap="md">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <Card key={i} className="p-4 bg-purple-50 dark:bg-purple-950">
                      <p className="text-sm">Item {i + 1}</p>
                    </Card>
                  ))}
                </ResponsiveGrid>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Responsive Flex Test */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Layers className="h-5 w-5" />
              Responsive Flex Layouts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h4 className="font-medium mb-3">Column to Row (Mobile: Column, Desktop: Row)</h4>
                <ResponsiveFlex direction="col" gap="md" align="center" justify="between" className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>JD</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">John Doe</p>
                      <p className="text-sm text-muted-foreground">Farmer</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm">Message</Button>
                    <Button size="sm" variant="outline">Follow</Button>
                  </div>
                </ResponsiveFlex>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Responsive Typography Test */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Type className="h-5 w-5" />
              Responsive Typography
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <ResponsiveText size="3xl" weight="bold">
                Heading 1 - Scales from 3xl to 4xl
              </ResponsiveText>
              <ResponsiveText size="2xl" weight="semibold">
                Heading 2 - Scales from 2xl to 3xl
              </ResponsiveText>
              <ResponsiveText size="xl" weight="medium">
                Heading 3 - Scales from xl to 2xl
              </ResponsiveText>
              <ResponsiveText size="base">
                Body text - Scales from base to lg for better readability on larger screens
              </ResponsiveText>
              <ResponsiveText size="sm" className="text-muted-foreground">
                Small text - Scales from sm to base
              </ResponsiveText>
            </div>
          </CardContent>
        </Card>

        {/* Responsive Components Test */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Component Responsiveness
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Responsive Card Layout */}
              <div>
                <h4 className="font-medium mb-3">Card Layouts</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Card key={i}>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base">Card {i + 1}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-3">
                          This card adapts to different screen sizes automatically.
                        </p>
                        <Button size="sm" className="w-full sm:w-auto">
                          Action
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Responsive Button Groups */}
              <div>
                <h4 className="font-medium mb-3">Button Groups</h4>
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                  <Button className="flex-1 sm:flex-none">Primary</Button>
                  <Button variant="outline" className="flex-1 sm:flex-none">Secondary</Button>
                  <Button variant="ghost" className="flex-1 sm:flex-none">Ghost</Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Breakpoint Information */}
        <Card>
          <CardHeader>
            <CardTitle>Breakpoint Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
              <div className="p-3 border rounded">
                <strong>Mobile (xs)</strong>
                <p className="text-muted-foreground">0px - 639px</p>
              </div>
              <div className="p-3 border rounded">
                <strong>Small (sm)</strong>
                <p className="text-muted-foreground">640px - 767px</p>
              </div>
              <div className="p-3 border rounded">
                <strong>Medium (md)</strong>
                <p className="text-muted-foreground">768px - 1023px</p>
              </div>
              <div className="p-3 border rounded">
                <strong>Large (lg)</strong>
                <p className="text-muted-foreground">1024px - 1279px</p>
              </div>
              <div className="p-3 border rounded">
                <strong>Extra Large (xl)</strong>
                <p className="text-muted-foreground">1280px - 1535px</p>
              </div>
              <div className="p-3 border rounded">
                <strong>2X Large (2xl)</strong>
                <p className="text-muted-foreground">1536px+</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </ResponsiveContainer>
    </Layout>
  );
};

export default ResponsiveTest;