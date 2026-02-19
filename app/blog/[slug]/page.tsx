import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar, Clock, Share2, Bookmark } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import blogPostsData from '@/data/blog-posts.json';
import { renderMarkdownToHtml } from '@/lib/markdown';

type BlogPost = {
  id: string;
  title: string;
  description: string;
  category: string;
  readTime: string;
  date: string;
  author: string;
  excerpt: string;
  tags: string[];
  content: string;
};

const blogPosts = blogPostsData as BlogPost[];

function getPostBySlug(slug: string): BlogPost | undefined {
  return blogPosts.find((p) => p.id === slug);
}

export async function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.id }));
}

interface BlogPostPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  
  if (!post) {
    return {
      title: 'Post Not Found',
    };
  }

  return {
    title: `${post.title} | YOQR Blog`,
    description: post.description,
    keywords: post.tags.join(', '),
    openGraph: {
      title: post.title,
      description: post.description,
      url: `https://yoqr.netlify.app/blog/${slug}`,
      type: 'article',
      publishedTime: post.date,
      authors: [post.author],
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const html = renderMarkdownToHtml(post.content);

  return (
    <div className="min-h-screen bg-gradient-radial from-background to-background/80">
      <div className="border-b border-border/50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
          {/* Navigation */}
          <Link href="/blog" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary">
            <ArrowLeft className="w-4 h-4" />
            Back to Blog
          </Link>

          {/* Article Header */}
          <div className="mt-8">
            <div className="flex flex-wrap items-center gap-2 mb-5">
              <Badge variant="outline">{post.category}</Badge>
              <div className="flex items-center text-sm text-muted-foreground">
                <Calendar className="w-4 h-4 mr-1" />
                {new Date(post.date).toLocaleDateString()}
              </div>
              <span className="text-muted-foreground/60">•</span>
              <div className="flex items-center text-sm text-muted-foreground">
                <Clock className="w-4 h-4 mr-1" />
                {post.readTime} read
              </div>
            </div>

            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">{post.title}</h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl">{post.description}</p>

            <div className="mt-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-semibold">
                  {post.author.charAt(0)}
                </div>
                <div>
                  <p className="font-medium leading-tight">{post.author}</p>
                  <p className="text-sm text-muted-foreground">Published on {new Date(post.date).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
                <Button variant="outline" size="sm">
                  <Bookmark className="w-4 h-4 mr-2" />
                  Save
                </Button>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              {post.tags.map((tag: string) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <article className="prose prose-neutral dark:prose-invert max-w-none">
          {/* Article Content */}
          <div
            className="prose-headings:font-bold prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl prose-p:text-base prose-p:leading-relaxed prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-code:bg-muted prose-code:px-1 prose-code:rounded prose-pre:bg-muted prose-pre:p-4 prose-pre:rounded-lg prose-pre:overflow-x-auto prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:pl-4 prose-blockquote:italic prose-img:rounded-lg prose-img:shadow-lg"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </article>

        {/* Related Posts */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-6">Related Posts</h2>
          <div className="grid gap-6 md:grid-cols-2">
            {blogPosts
              .filter((p) => p.id !== slug)
              .slice(0, 2)
              .map((relatedPost) => (
                <Card key={relatedPost.id} className="group hover:shadow-lg transition-all duration-300 border-border/50 bg-card/30 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="group-hover:text-primary transition-colors">
                      <Link href={`/blog/${relatedPost.id}`} className="hover:underline">
                        {relatedPost.title}
                      </Link>
                    </CardTitle>
                    <CardDescription>{relatedPost.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="w-4 h-4 mr-1" />
                        {relatedPost.readTime} read
                      </div>
                      <Link
                        href={`/blog/${relatedPost.id}`}
                        className="text-primary hover:text-primary/80 text-sm font-medium"
                      >
                        Read more →
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>

        {/* Newsletter */}
        <Card className="mt-16 bg-card/50 backdrop-blur-lg border-border/50">
          <CardHeader className="text-center">
            <CardTitle>Enjoyed this article?</CardTitle>
            <CardDescription>
              Get more QR code tips and tutorials delivered to your inbox
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-2 rounded-md border border-border bg-background"
              />
              <Button>Subscribe</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
