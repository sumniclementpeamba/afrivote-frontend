import { notFound } from 'next/navigation';
import Link from 'next/link';
import GettingStartedPost from './GettingStartedPost';
import PlansComparisonPost from './PlansComparisonPost';

// Inline the missing post component
function HowElectionsWorkPost() {
    return (
        <>
            <h2 className="text-xl font-bold">The Election Lifecycle</h2>
            <p className="text-slate-600 dark:text-slate-400">
                From draft to winner announcement, here’s how AfriVote handles every stage of
                your election.
            </p>

            <h3 className="font-bold mt-6">🗓️ Draft</h3>
            <p className="text-slate-600 dark:text-slate-400">
                You create the election, add positions, and upload candidates. Everything stays
                hidden from voters until you’re ready.
            </p>

            <h3 className="font-bold mt-6">🚀 Active</h3>
            <p className="text-slate-600 dark:text-slate-400">
                When you start the election, your voters receive an invitation and can cast their
                ballots. You can watch the votes come in live, but individual votes are
                anonymous.
            </p>

            <h3 className="font-bold mt-6">🏁 Completed</h3>
            <p className="text-slate-600 dark:text-slate-400">
                The election automatically ends at the specified date, or you can end it manually.
                AfriVote instantly calculates the winners and marks them with a 👑 crown.
            </p>

            <h2 className="text-xl font-bold mt-8">Security & Anonymity</h2>
            <p className="text-slate-600 dark:text-slate-400">
                Every vote is recorded with a unique hash and stored separately from the voter’s
                identity. That means you can prove that someone voted, but you can never see
                <strong> who</strong> they voted for. The results are calculated from the anonymous
                ballot box.
            </p>

            <h2 className="text-xl font-bold mt-8">After the Election</h2>
            <p className="text-slate-600 dark:text-slate-400">
                You can export the detailed results, view the turnout chart, or share a public
                PDF link so stakeholders can see the outcome. All candidates are kept in your
                permanent archive for future reference.
            </p>
        </>
    );
}

// Blog post data
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
        excerpt: 'Learn how to set up your organization, create elections, and invite voters in under 10 minutes.',
    },
    {
        slug: 'afrivote-plans-comparison',
        title: 'AfriVote Plans: Free vs Standard vs Enterprise',
        date: '2026-08-10',
        excerpt: 'A detailed breakdown of features, limits, and pricing for every plan.',
    },
    {
        slug: 'how-elections-work-on-afrivote',
        title: 'How Elections Work on AfriVote – Step by Step',
        date: '2026-08-12',
        excerpt: 'From creating positions to declaring winners, see the full election lifecycle.',
    },
];

const postComponents: Record<string, React.ComponentType> = {
    'getting-started-with-afrivote': GettingStartedPost,
    'afrivote-plans-comparison': PlansComparisonPost,
    'how-elections-work-on-afrivote': HowElectionsWorkPost,
};

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const post = blogPosts.find((p) => p.slug === slug);
    if (!post) notFound();

    const PostContent = postComponents[slug];
    if (!PostContent) notFound();

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 px-6 py-20">
            <article className="max-w-3xl mx-auto">
                <Link
                    href="/blog"
                    className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline mb-6"
                >
                    ← Back to Blog
                </Link>
                <h1 className="text-3xl sm:text-4xl font-black tracking-tight mb-2">{post.title}</h1>
                <p className="text-sm text-slate-400 mb-8">
                    {new Date(post.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                    })}
                </p>
                <div className="prose prose-slate dark:prose-invert max-w-none">
                    <PostContent />
                </div>
            </article>
        </div>
    );
}