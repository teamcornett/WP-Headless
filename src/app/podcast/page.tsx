import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPageBySlug } from "@/lib/wordpress";
import {
  getMegaphoneEpisodesPage,
  DEFAULT_MEGAPHONE_RSS_URL,
} from "@/lib/megaphone";
import aboutStyles from "../about/about.module.scss";
import PodcastEpisodeList from "./PodcastEpisodeList";
import PodcastPagination from "./PodcastPagination";

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
  return { title: `${raw} | Headless WordPress Site` };
}

export default async function PodcastPage({ searchParams }: PodcastPageProps) {
  const page = await getPageBySlug("podcast");

  if (!page) {
    notFound();
  }

  const { page: pageParam } = await searchParams;
  const requestedPage = parsePageParam(pageParam);
  const { episodes, page: currentPage, total, totalPages } =
    await getMegaphoneEpisodesPage(rssUrl, requestedPage);

  return (
    <main className={aboutStyles.main}>
      <h1
        className={aboutStyles.title}
        dangerouslySetInnerHTML={{ __html: page.title.rendered }}
      />
      <div
        className={`${aboutStyles.content} wp-content`}
        dangerouslySetInnerHTML={{ __html: page.content.rendered }}
      />
      <PodcastEpisodeList episodes={episodes} />
      <PodcastPagination
        page={currentPage}
        totalPages={totalPages}
        total={total}
      />
    </main>
  );
}
