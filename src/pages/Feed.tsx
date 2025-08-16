import { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  Heart, 
  MessageSquare, 
  Share2, 
  MapPin, 
  Clock,
  ShoppingCart,
  MoreHorizontal
} from 'lucide-react';
import { mockPosts } from '@/services/mockData';
import { formatDistanceToNow } from 'date-fns';

const Feed = () => {
  const [posts, setPosts] = useState(mockPosts);

  const handleLike = (postId: string) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? { 
            ...post, 
            isLiked: !post.isLiked,
            likes: post.isLiked ? post.likes - 1 : post.likes + 1
          }
        : post
    ));
  };

  return (
    <Layout>
      <div className="container mx-auto max-w-2xl p-4 space-y-6">
        {/* Create Post Card */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src="/api/placeholder/40/40" />
                <AvatarFallback>RK</AvatarFallback>
              </Avatar>
              <Button 
                variant="outline" 
                className="flex-1 justify-start text-muted-foreground hover:bg-muted"
              >
                What's happening in your farm today?
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Posts Feed */}
        {posts.map((post) => (
          <Card key={post.id} className="overflow-hidden">
            <CardContent className="p-0">
              {/* Post Header */}
              <div className="p-4 pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={post.userImage} />
                      <AvatarFallback>{post.userName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-sm">{post.userName}</h3>
                        <Badge variant="secondary" className="text-xs">
                          Farmer
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        {post.userLocation}
                        <span>•</span>
                        <Clock className="h-3 w-3" />
                        {formatDistanceToNow(new Date(post.timestamp), { addSuffix: true })}
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>

                {/* Post Content */}
                <div className="mt-3">
                  <p className="text-sm leading-relaxed">{post.content}</p>
                  
                  {/* For Sale Badge */}
                  {post.forSale && (
                    <div className="mt-3 p-3 bg-success/10 border border-success/20 rounded-lg">
                      <div className="flex items-center gap-2">
                        <ShoppingCart className="h-4 w-4 text-success" />
                        <span className="text-sm font-medium text-success">Available for Sale</span>
                      </div>
                      <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                        <span>₹{post.price}/kg</span>
                        <span>{post.quantity}</span>
                        <span className="capitalize">{post.cropType}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Post Images */}
              {post.images.length > 0 && (
                <div className="px-4 pb-3">
                  {post.images.length === 1 ? (
                    <img 
                      src={post.images[0]} 
                      alt="Post content" 
                      className="w-full h-64 object-cover rounded-lg"
                    />
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      {post.images.slice(0, 4).map((image, index) => (
                        <div key={index} className="relative">
                          <img 
                            src={image} 
                            alt={`Post content ${index + 1}`} 
                            className="w-full h-32 object-cover rounded-lg"
                          />
                          {index === 3 && post.images.length > 4 && (
                            <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                              <span className="text-white font-medium">
                                +{post.images.length - 4} more
                              </span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Post Actions */}
              <div className="px-4 py-3 border-t border-border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <button 
                      onClick={() => handleLike(post.id)}
                      className={`flex items-center gap-2 text-sm transition-colors ${
                        post.isLiked 
                          ? 'text-red-500 hover:text-red-600' 
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <Heart className={`h-4 w-4 ${post.isLiked ? 'fill-current' : ''}`} />
                      {post.likes}
                    </button>
                    
                    <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                      <MessageSquare className="h-4 w-4" />
                      {post.comments}
                    </button>
                    
                    <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                      <Share2 className="h-4 w-4" />
                      Share
                    </button>
                  </div>

                  {post.forSale && (
                    <Button size="sm" variant="outline">
                      Contact Seller
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Load More */}
        <div className="text-center py-6">
          <Button variant="outline">
            Load More Posts
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default Feed;