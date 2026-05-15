import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPageBySlug } from "@/lib/wordpress";
import {
  getMegaphoneEpisodesPage,
  DEFAULT_MEGAPHONE_RSS_URL,
} from "@/lib/megaphone";
import PodcastHero from "./PodcastHero";
import PodcastFeatured from "./PodcastFeatured";
import PodcastEpisodeGrid from "./PodcastEpisodeGrid";
import PodcastPagination from "./PodcastPagination";
import PodcastCta from "./PodcastCta";
import styles from "./podcast.module.scss";

const rssUrl =
  process.env.MEGAPHONE_RSS_URL?.trim() || DEFAULT_MEGAPHONE_RSS_URL;

type PodcastPageProps = {
  searchParams: Promise<{ page?: string }>;
};

function parsePageParam(value: string | undefined): number {
  const n = Number.parseInt(value ?? "1", 10);
  return Number.isFinite(n) && n > 0 ? n : 1;
}

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPageBySlug("podcast");
  if (!page) {
    return { title: "Podcast" };
  }
  const raw = page.title.rendered.replace(/<[^>]+>/g, "").trim();
  return { title: `${raw} | Own It` };
}

export default async function PodcastPage({ searchParams }: PodcastPageProps) {
  const page = await getPageBySlug("podcast");

  if (!page) {
    notFound();
  }

  const { page: pageParam } = await searchParams;
  const requestedPage = parsePageParam(pageParam);
  const feed = await getMegaphoneEpisodesPage(rssUrl, requestedPage);

  const hasEpisodes =
    feed.episodes.length > 0 || feed.featuredEpisode !== null;

  return (
    <main className={styles.page}>
      <PodcastHero
        channel={feed.channel}
        pageTitle={page.title.rendered}
        introHtml={page.content.rendered}
      />

      {!hasEpisodes ? (
        <p className={styles.feedMissing}>
          No episodes could be loaded from the Megaphone feed. Try again later.
        </p>
      ) : (
        <>
          {feed.featuredEpisode ? (
            <PodcastFeatured episode={feed.featuredEpisode} />
          ) : null}
          <PodcastEpisodeGrid episodes={feed.episodes} />
          <PodcastPagination
            page={feed.page}
            totalPages={feed.totalPages}
          />
        </>
      )}

      <PodcastCta />
    </main>
  );
}
