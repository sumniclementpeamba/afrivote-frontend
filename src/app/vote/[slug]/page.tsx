import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function VoteShortLinkPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  redirect(`/public/election/${slug}`);
}