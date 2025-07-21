import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) {
      setError('No blog post slug provided');
      setLoading(false);
      return;
    }

    // Simulate fetching blog post content
    // In a real app, you would fetch the markdown content and process it
    const simulatedPosts: Record<string, BlogPost> = {
      'getting-started-with-wire-loop': {
        slug: 'getting-started-with-wire-loop',
        title: 'Getting Started with Wire Loop',
        date: '2024-01-15',
        excerpt: 'Learn the basics of playing Wire Loop and master the art of precision gaming.',
        author: 'Wire Loop Team',
        tags: ['tutorial', 'beginner', 'gameplay'],
        content: `
          <h1>Getting Started with Wire Loop</h1>
          <p>Welcome to Wire Loop, the ultimate precision-based game that will test your steady hands and patience!</p>
          
          <h2>What is Wire Loop?</h2>
          <p>Wire Loop is a challenging game where you must navigate a cursor along a complex wire path without touching the wire itself. It's inspired by the classic steady-hand games you might have seen at carnivals or science museums.</p>
          
          <h2>Basic Gameplay</h2>
          <ol>
            <li><strong>Start the Game</strong>: Click or tap the green START point to begin</li>
            <li><strong>Follow the Path</strong>: Keep your mouse or finger pressed while following the wire</li>
            <li><strong>Stay on Track</strong>: Don't let go and don't touch the wire edges</li>
            <li><strong>Reach the End</strong>: Successfully navigate to the red END point</li>
          </ol>
          
          <h2>Tips for Success</h2>
          <ul>
            <li><strong>Take Your Time</strong>: There's no time pressure, so move slowly and steadily</li>
            <li><strong>Use Smooth Movements</strong>: Jerky motions are more likely to cause mistakes</li>
            <li><strong>Practice Makes Perfect</strong>: Each level teaches you something new</li>
            <li><strong>Stay Calm</strong>: If you fail, take a deep breath and try again</li>
          </ul>
          
          <h2>Level Progression</h2>
          <p>The game features 8 challenging levels, each with increasing difficulty:</p>
          <ul>
            <li><strong>Levels 1-2</strong>: Simple curves to get you started</li>
            <li><strong>Levels 3-4</strong>: More complex patterns with tighter turns</li>
            <li><strong>Levels 5-6</strong>: Advanced shapes with rapid direction changes</li>
            <li><strong>Levels 7-8</strong>: Expert-level challenges for true masters</li>
          </ul>
          
          <h2>Mobile vs Desktop</h2>
          <p>The game works on both desktop and mobile devices, but each has its advantages:</p>
          <ul>
            <li><strong>Desktop</strong>: More precise control with a mouse</li>
            <li><strong>Mobile</strong>: Touch interface with larger wire paths for better visibility</li>
          </ul>
          
          <p>Good luck, and remember - patience is key!</p>
        `
      },
      'advanced-strategies': {
        slug: 'advanced-strategies',
        title: 'Advanced Strategies for Wire Loop Masters',
        date: '2024-01-20',
        excerpt: 'Discover pro tips and advanced techniques to conquer the most challenging Wire Loop levels.',
        author: 'Pro Gamer',
        tags: ['advanced', 'strategy', 'tips'],
        content: `
          <h1>Advanced Strategies for Wire Loop Masters</h1>
          <p>Ready to take your Wire Loop skills to the next level? Here are some advanced strategies that will help you master even the most challenging levels.</p>
          
          <h2>Understanding the Physics</h2>
          <p>Wire Loop isn't just about steady hands - it's about understanding the game's mechanics:</p>
          
          <h3>Collision Detection</h3>
          <ul>
            <li>The game uses a tolerance zone around the wire</li>
            <li>Moving too quickly can sometimes trigger false positives</li>
            <li>Smooth, deliberate movements are always better than fast ones</li>
          </ul>
          
          <h3>Path Following</h3>
          <ul>
            <li>The game tracks your sequential progress</li>
            <li>You cannot skip sections of the wire</li>
            <li>Going backwards is limited to prevent cheating</li>
          </ul>
          
          <h2>Level-Specific Strategies</h2>
          
          <h3>Level 4: Double Helix</h3>
          <ul>
            <li>Focus on the rhythm of the curves</li>
            <li>Don't fight the pattern - flow with it</li>
            <li>Take breaks at the center points</li>
          </ul>
          
          <h3>Level 5: The Gauntlet</h3>
          <ul>
            <li>This level has sharp transitions</li>
            <li>Use micro-movements around corners</li>
            <li>Stay centered during straight sections</li>
          </ul>
          
          <h3>Level 6: Zigzag Vortex</h3>
          <ul>
            <li>The key is maintaining momentum</li>
            <li>Don't stop at each zigzag</li>
            <li>Find the natural flow of the pattern</li>
          </ul>
          
          <h3>Level 8: Elephant Path</h3>
          <ul>
            <li>Break it down into sections</li>
            <li>Master the trunk first</li>
            <li>The ear section requires patience</li>
          </ul>
          
          <h2>Mental Techniques</h2>
          
          <h3>Focus and Concentration</h3>
          <ol>
            <li><strong>Breathing</strong>: Maintain steady breathing throughout</li>
            <li><strong>Visualization</strong>: See the entire path before starting</li>
            <li><strong>Mindfulness</strong>: Stay present, don't think about previous failures</li>
          </ol>
          
          <h3>Dealing with Failure</h3>
          <ul>
            <li>Every failure is a learning opportunity</li>
            <li>Pay attention to where you consistently struggle</li>
            <li>Practice difficult sections multiple times</li>
          </ul>
          
          <h2>Hardware Optimization</h2>
          
          <h3>Mouse Settings</h3>
          <ul>
            <li>Lower your mouse sensitivity for better control</li>
            <li>Disable mouse acceleration if possible</li>
            <li>Use a mouse pad for consistent surface</li>
          </ul>
          
          <h3>Mobile Tips</h3>
          <ul>
            <li>Clean your screen for better touch response</li>
            <li>Use your index finger for best control</li>
            <li>Ensure your device is at a comfortable angle</li>
          </ul>
          
          <h2>The Perfect Run</h2>
          <p>A perfect Wire Loop run combines:</p>
          <ul>
            <li>Technical precision</li>
            <li>Mental focus</li>
            <li>Pattern recognition</li>
            <li>Muscle memory</li>
          </ul>
          
          <p>Remember, becoming a Wire Loop master takes time and practice. Don't get discouraged by failures - they're part of the journey!</p>
        `
      }
    };

    const foundPost = simulatedPosts[slug];
    if (foundPost) {
      setPost(foundPost);
    } else {
      setError('Blog post not found');
    }
    setLoading(false);
  }, [slug]);

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
        <div className="text-xl">Loading blog post...</div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Blog Post Not Found</h1>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Link to="/blog">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Blog
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <Link to="/blog">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Blog
              </Button>
            </Link>
            <ThemeToggle />
          </div>
          
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-green-400 via-green-300 to-purple-500 bg-clip-text text-transparent">
            {post.title}
          </h1>
          
          {/* Meta information */}
          <div className="flex items-center justify-between mb-6 text-muted-foreground">
            <div className="flex items-center space-x-4">
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
          
          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-6">
            {post.tags.map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
        </div>

        {/* Content */}
        <article className="prose prose-lg prose-invert max-w-none">
          <div 
            className="blog-content"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </article>

        {/* Back to blog link */}
        <div className="mt-12 pt-8 border-t border-border">
          <Link to="/blog">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Blog
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
} 