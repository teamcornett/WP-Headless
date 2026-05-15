import Parser from "rss-parser";

/** Default Own It show feed on Megaphone (override with `MEGAPHONE_RSS_URL`). */
export const DEFAULT_MEGAPHONE_RSS_URL = "https://feeds.megaphone.fm/ownit";

export const MEGAPHONE_EPISODES_PER_PAGE = 15;

export type MegaphoneEpisode = {
  id: string;
  title: string;
  link: string;
  publishedAt: string | null;
  audioUrl: string | null;
  description: string | null;
  imageUrl: string | null;
};

export type MegaphoneEpisodesPage = {
  episodes: MegaphoneEpisode[];
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
};

const parser = new Parser<{
  title: string;
  link?: string;
  pubDate?: string;
  content?: string;
  contentSnippet?: string;
  enclosure?: { url?: string } | string;
  itunes?: { image?: string; duration?: string };
}>({
  customFields: {
    item: ["media:content", "itunes:image", "itunes:duration"],
  },
});

function enclosureUrl(
  enclosure: { url?: string } | string | undefined,
): string | null {
  if (!enclosure) return null;
  if (typeof enclosure === "string") return enclosure || null;
  return enclosure.url ?? null;
}

function mapItemToEpisode(
  item: NonNullable<Awaited<ReturnType<typeof parser.parseString>>["items"]>[number],
  index: number,
): MegaphoneEpisode {
  const title = item.title?.trim() || "Untitled episode";
  const link = item.link?.trim() || "";
  const guid =
    typeof item.guid === "string"
      ? item.guid
      : item.guid && typeof item.guid === "object" && "value" in item.guid
        ? String((item.guid as { value: string }).value)
        : `${index}-${title}`;

  let audioUrl = enclosureUrl(item.enclosure);

  const media = item["media:content"] as { $?: { url?: string } } | undefined;
  const mediaUrl =
    media && typeof media === "object" && media.$ ? media.$.url : undefined;
  if (!audioUrl && mediaUrl) {
    audioUrl = mediaUrl;
  }

  const itunesImage = item.itunes?.image;
  let imageUrl: string | null = null;
  if (typeof itunesImage === "string") {
    imageUrl = itunesImage;
  } else if (
    itunesImage &&
    typeof itunesImage === "object" &&
    "$" in itunesImage &&
    (itunesImage as { $?: { href?: string } }).$?.href
  ) {
    imageUrl = (itunesImage as { $: { href: string } }).$.href;
  }

  return {
    id: guid,
    title,
    link,
    publishedAt: item.pubDate ?? item.isoDate ?? null,
    audioUrl,
    description: item.contentSnippet ?? item.content ?? null,
    imageUrl,
  };
}

async function fetchAllMegaphoneEpisodes(
  rssUrl: string,
): Promise<MegaphoneEpisode[]> {
  const res = await fetch(rssUrl.trim(), {
    next: { revalidate: 3600 },
    headers: {
      "User-Agent": "OwnItHeadless/1.0 (podcast RSS reader)",
    },
  });

  if (!res.ok) {
    console.error(
      `[megaphone] RSS fetch failed ${res.status} for ${rssUrl.slice(0, 80)}…`,
    );
    return [];
  }

  const xml = await res.text();
  const feed = await parser.parseString(xml);
  const items = feed.items ?? [];

  return items.map((item, index) => mapItemToEpisode(item, index));
}

/**
 * Paginated episodes (newest first, as in the RSS feed).
 * @see https://support.megaphone.fm/megaphone-faqs/how-do-i-find-my-rss-feed
 */
export async function getMegaphoneEpisodesPage(
  rssUrl: string | undefined,
  requestedPage = 1,
  perPage = MEGAPHONE_EPISODES_PER_PAGE,
): Promise<MegaphoneEpisodesPage> {
  if (!rssUrl?.trim()) {
    return {
      episodes: [],
      page: 1,
      perPage,
      total: 0,
      totalPages: 0,
    };
  }

  const all = await fetchAllMegaphoneEpisodes(rssUrl);
  const total = all.length;
  const totalPages = total === 0 ? 0 : Math.ceil(total / perPage);
  const page =
    totalPages === 0
      ? 1
      : Math.max(1, Math.min(requestedPage, totalPages));
  const start = (page - 1) * perPage;
  const episodes = all.slice(start, start + perPage);

  return { episodes, page, perPage, total, totalPages };
}

/** @deprecated Prefer getMegaphoneEpisodesPage for the podcast route. */
export async function getMegaphoneEpisodes(
  rssUrl: string | undefined,
  limit = 50,
): Promise<MegaphoneEpisode[]> {
  if (!rssUrl?.trim()) {
    return [];
  }
  const all = await fetchAllMegaphoneEpisodes(rssUrl);
  return all.slice(0, limit);
}
