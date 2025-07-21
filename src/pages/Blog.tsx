import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
import { ArrowLeft, Calendar, User } from 'lucide-react';

interface BlogPost {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  author: string;
  tags: string[];
  content: string;
}

export default function Blog() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app, you would fetch from an API
    // For now, we'll simulate the blog posts
    const simulatedPosts: BlogPost[] = [
      {
        slug: 'getting-started-with-wire-loop',
        title: 'Getting Started with Wire Loop',
        date: '2024-01-15',
        excerpt: 'Learn the basics of playing Wire Loop and master the art of precision gaming.',
        author: 'Wire Loop Team',
        tags: ['tutorial', 'beginner', 'gameplay'],
        content: ''
      },
      {
        slug: 'advanced-strategies',
        title: 'Advanced Strategies for Wire Loop Masters',
        date: '2024-01-20',
        excerpt: 'Discover pro tips and advanced techniques to conquer the most challenging Wire Loop levels.',
        author: 'Pro Gamer',
        tags: ['advanced', 'strategy', 'tips'],
        content: ''
      }
    ];
    
    setPosts(simulatedPosts);
    setLoading(false);
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-xl">Loading blog posts...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link to="/">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Game
              </Button>
            </Link>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-green-400 via-green-300 to-purple-500 bg-clip-text text-transparent">
              Wire Loop Blog
            </h1>
          </div>
          <ThemeToggle />
        </div>

        {/* Blog Posts */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <Link key={post.slug} to={`/blog/${post.slug}`}>
              <Card className="h-full hover:shadow-lg transition-shadow duration-200 bg-card/80 backdrop-blur-sm border-primary/20 hover:border-primary/40">
                <CardHeader>
                  <CardTitle className="text-xl text-primary hover:text-primary/80 transition-colors">
                    {post.title}
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    {post.excerpt}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Tags */}
                    <div className="flex flex-wrap gap-2">
                      {post.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    
                    {/* Meta information */}
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(post.date)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <User className="w-4 h-4" />
                        <span>{post.author}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {posts.length === 0 && (
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold text-muted-foreground">No blog posts yet</h2>
            <p className="text-muted-foreground mt-2">Check back soon for new content!</p>
          </div>
        )}
      </div>
    </div>
  );
} 