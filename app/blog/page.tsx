import { Metadata } from 'next';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, ArrowRight } from 'lucide-react';
import blogPostsData from '@/data/blog-posts.json';

export const metadata: Metadata = {
  title: 'QR Code Blog - Tips, Tutorials & Best Practices | YOQR',
  description: 'Learn everything about QR codes - from basic tutorials to advanced use cases. Discover how businesses use QR codes effectively.',
  keywords: 'qr code blog, qr code tutorial, qr code best practices, qr code marketing, qr code for business',
  openGraph: {
    title: 'QR Code Blog - Tips, Tutorials & Best Practices | YOQR',
    description: 'Learn everything about QR codes - from basic tutorials to advanced use cases.',
    url: 'https://yoqr.netlify.app/blog',
    type: 'website',
  },
};

type BlogPostListItem = {
  id: string;
  title: string;
  description: string;
  category: string;
  readTime: string;
  date: string;
  excerpt: string;
  tags: string[];
};

export default function BlogPage() {
  const blogPosts = (blogPostsData as BlogPostListItem[]).slice().sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="min-h-screen bg-gradient-radial from-background to-background/80">
      <div className="border-b border-border/50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/40 px-4 py-2 text-sm text-muted-foreground backdrop-blur">
              <span className="h-2 w-2 rounded-full bg-primary" />
              Articles, guides, and practical QR strategies
            </div>
            <h1 className="mt-6 text-4xl sm:text-5xl font-bold tracking-tight">
              QR Code Blog
            </h1>
            <p className="mt-4 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
              Tips, tutorials, and best practices for creating, scanning, and using QR codes with confidence.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              <Badge variant="secondary">Tutorials</Badge>
              <Badge variant="secondary">Marketing</Badge>
              <Badge variant="secondary">Security</Badge>
              <Badge variant="secondary">Analytics</Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        {/* Blog Posts Grid */}
        <div className="grid gap-6 md:grid-cols-2">
          {blogPosts.map((post) => (
            <Card
              key={post.id}
              className="group relative overflow-hidden border-border/50 bg-card/30 backdrop-blur-sm transition-all duration-300 hover:shadow-xl hover:border-primary/40"
            >
              <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <div className="absolute -top-24 -right-24 h-56 w-56 rounded-full bg-primary/10 blur-3xl" />
                <div className="absolute -bottom-24 -left-24 h-56 w-56 rounded-full bg-primary/5 blur-3xl" />
              </div>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between gap-4 mb-3">
                  <Badge variant="outline" className="text-xs">
                    {post.category}
                  </Badge>
                  <div className="flex items-center text-xs sm:text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4 mr-1" />
                    {new Date(post.date).toLocaleDateString()}
                  </div>
                </div>
                <CardTitle className="leading-tight tracking-tight text-xl sm:text-2xl group-hover:text-primary transition-colors">
                  <Link href={`/blog/${post.id}`} className="hover:underline underline-offset-4">
                    {post.title}
                  </Link>
                </CardTitle>
                <CardDescription className="text-sm sm:text-base">
                  {post.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm sm:text-base text-muted-foreground mb-5 line-clamp-3">
                  {post.excerpt}
                </p>
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center text-xs sm:text-sm text-muted-foreground whitespace-nowrap">
                    <Clock className="w-4 h-4 mr-1" />
                    {post.readTime} read
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="hidden sm:flex flex-wrap gap-1">
                      {post.tags.slice(0, 2).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <Link
                      href={`/blog/${post.id}`}
                      className="text-primary hover:text-primary/80 inline-flex items-center gap-1 text-sm font-medium"
                    >
                      Read article
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Newsletter Signup */}
        <div className="mt-14 text-center bg-card/40 backdrop-blur-lg rounded-xl p-8 sm:p-10 border border-border/50">
          <h2 className="text-2xl font-bold mb-4">Stay Updated</h2>
          <p className="text-muted-foreground mb-6">
            Get the latest QR code tips and tutorials delivered to your inbox
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-2 rounded-md border border-border bg-background"
            />
            <button className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
              Subscribe
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
