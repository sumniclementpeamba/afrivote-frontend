export interface BlogPost {
    slug: string;
    title: string;
    date: string;
    excerpt: string;
    content: string; // HTML or markdown – we’ll use JSX in the page
}

const blogPosts: BlogPost[] = [
    {
        slug: 'getting-started-with-afrivote',
        title: 'Getting Started with AfriVote: A Guide for Organizations',
        date: '2026-08-01',
        excerpt:
            'Learn how to set up your organization, create elections, and invite voters in under 10 minutes.',
        content: `...`, // will be a React component in the detail page
    },
    {
        slug: 'afrivote-plans-comparison',
        title: 'AfriVote Plans: Free vs Standard vs Enterprise',
        date: '2026-08-10',
        excerpt:
            'A detailed breakdown of features, limits, and pricing for every plan.',
        content: `...`,
    },
    {
        slug: 'how-elections-work-on-afrivote',
        title: 'How Elections Work on AfriVote – Step by Step',
        date: '2026-08-12',
        excerpt:
            'From creating positions to declaring winners, see the full election lifecycle.',
        content: `...`,
    },
];

export default blogPosts;