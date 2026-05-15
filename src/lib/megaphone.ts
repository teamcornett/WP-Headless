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

export type MegaphoneChannel = {
  title: string;
  description: string;
  imageUrl: string | null;
  link: string | null;
};

export type MegaphoneEpisodesPage = {
  episodes: MegaphoneEpisode[];
  featuredEpisode: MegaphoneEpisode | null;
  channel: MegaphoneChannel | null;
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
};

type RssFeed = Awaited<ReturnType<typeof parser.parseString>>;

const parser = new Parser<{
  title: string;
  link?: string;
  description?: string;
  image?: { url?: string };
  pubDate?: string;
  content?: string;
  contentSnippet?: string;
  enclosure?: { url?: string } | string;
  itunes?: { image?: string; duration?: string; summary?: string };
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

function parseChannelImage(feed: RssFeed): string | null {
  if (feed.image?.url) return feed.image.url;

  const itunesImage = feed.itunes?.image;
  if (typeof itunesImage === "string") return itunesImage;
  if (
    itunesImage &&
    typeof itunesImage === "object" &&
    "$" in itunesImage &&
    (itunesImage as { $?: { href?: string } }).$?.href
  ) {
    return (itunesImage as { $: { href: string } }).$.href;
  }

  return null;
}

function parseChannel(feed: RssFeed): MegaphoneChannel {
  return {
    title: feed.title?.trim() || "Own It",
    description:
      feed.description?.trim() ||
      feed.itunes?.summary?.trim() ||
      "",
    imageUrl: parseChannelImage(feed),
    link: feed.link?.trim() || null,
  };
}

function mapItemToEpisode(
  item: NonNullable<RssFeed["items"]>[number],
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

async function fetchMegaphoneFeed(rssUrl: string): Promise<{
  channel: MegaphoneChannel;
  episodes: MegaphoneEpisode[];
}> {
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
    return {
      channel: {
        title: "Own It",
        description: "",
        imageUrl: null,
        link: null,
      },
      episodes: [],
    };
  }

  const xml = await res.text();
  const feed = await parser.parseString(xml);
  const items = feed.items ?? [];

  return {
    channel: parseChannel(feed),
    episodes: items.map((item, index) => mapItemToEpisode(item, index)),
  };
}

function computeTotalPages(total: number, perPage: number): number {
  if (total === 0) return 0;
  if (total <= perPage + 1) return 1;
  return 1 + Math.ceil((total - perPage - 1) / perPage);
}

function sliceEpisodesForPage(
  all: MegaphoneEpisode[],
  page: number,
  perPage: number,
): { featuredEpisode: MegaphoneEpisode | null; episodes: MegaphoneEpisode[] } {
  if (all.length === 0) {
    return { featuredEpisode: null, episodes: [] };
  }

  if (page === 1) {
    return {
      featuredEpisode: all[0],
      episodes: all.slice(1, perPage + 1),
    };
  }

  const start = perPage + 1 + (page - 2) * perPage;
  return {
    featuredEpisode: null,
    episodes: all.slice(start, start + perPage),
  };
}

/**
 * Paginated episodes (newest first). Page 1 includes a featured latest episode
 * plus a grid of up to `perPage` additional episodes.
 */
export async function getMegaphoneEpisodesPage(
  rssUrl: string | undefined,
  requestedPage = 1,
  perPage = MEGAPHONE_EPISODES_PER_PAGE,
): Promise<MegaphoneEpisodesPage> {
  if (!rssUrl?.trim()) {
    return {
      episodes: [],
      featuredEpisode: null,
      channel: null,
      page: 1,
      perPage,
      total: 0,
      totalPages: 0,
    };
  }

  const { channel, episodes: all } = await fetchMegaphoneFeed(rssUrl);
  const total = all.length;
  const totalPages = computeTotalPages(total, perPage);
  const page =
    totalPages === 0
      ? 1
      : Math.max(1, Math.min(requestedPage, totalPages));
  const { featuredEpisode, episodes } = sliceEpisodesForPage(
    all,
    page,
    perPage,
  );

  return {
    episodes,
    featuredEpisode,
    channel,
    page,
    perPage,
    total,
    totalPages,
  };
}

/** @deprecated Prefer getMegaphoneEpisodesPage for the podcast route. */
export async function getMegaphoneEpisodes(
  rssUrl: string | undefined,
  limit = 50,
): Promise<MegaphoneEpisode[]> {
  if (!rssUrl?.trim()) {
    return [];
  }
  const { episodes } = await fetchMegaphoneFeed(rssUrl);
  return episodes.slice(0, limit);
}
