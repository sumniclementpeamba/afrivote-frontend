import Link from 'next/link';

interface BlogPost {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
}

const blogPosts: BlogPost[] = [
  {
    slug: 'getting-started-with-afrivote',
    title: 'Getting Started with AfriVote: A Guide for Organizations',
    date: '2026-08-01',
    excerpt:
      'Learn how to set up your organization, create elections, and invite voters in under 10 minutes.',
  },
  {
    slug: 'afrivote-plans-comparison',
    title: 'AfriVote Plans: Free vs Standard vs Enterprise',
    date: '2026-08-10',
    excerpt:
      'A detailed breakdown of features, limits, and pricing for every plan.',
  },
  {
    slug: 'how-elections-work-on-afrivote',
    title: 'How Elections Work on AfriVote – Step by Step',
    date: '2026-08-12',
    excerpt:
      'From creating positions to declaring winners, see the full election lifecycle.',
  },
];

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 px-6 py-20">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-black tracking-tight mb-2">Blog</h1>
        <p className="text-slate-500 dark:text-slate-400 mb-10">
          Tips, updates, and guides for running successful digital elections.
        </p>

        <div className="grid gap-8">
          {blogPosts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm hover:shadow-lg hover:border-indigo-200 dark:hover:border-indigo-800 transition-all"
            >
              <h2 className="text-xl font-black group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                {post.title}
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                {new Date(post.date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-3 leading-relaxed">
                {post.excerpt}
              </p>
              <span className="inline-block mt-4 text-xs font-bold text-indigo-600 dark:text-indigo-400 group-hover:underline">
                Read more →
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}