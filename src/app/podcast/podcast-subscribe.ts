import { DEFAULT_MEGAPHONE_RSS_URL } from "@/lib/megaphone";

export type PodcastSubscribeLink = {
  id: "rss" | "apple" | "spotify" | "stitcher" | "google";
  label: string;
  href: string;
};

const googlePodcastsFeed = encodeURIComponent(
  process.env.MEGAPHONE_RSS_URL?.trim() || DEFAULT_MEGAPHONE_RSS_URL,
);

/** Platform URLs (defaults match untilyouownit.com/podcast). Override via env if needed. */
export function getPodcastSubscribeLinks(): PodcastSubscribeLink[] {
  return [
    {
      id: "rss",
      label: "RSS feed",
      href:
        process.env.PODCAST_RSS_URL?.trim() ||
        process.env.MEGAPHONE_RSS_URL?.trim() ||
        DEFAULT_MEGAPHONE_RSS_URL,
    },
    {
      id: "apple",
      label: "Apple Podcasts",
      href:
        process.env.PODCAST_APPLE_URL?.trim() ||
        "https://podcasts.apple.com/us/podcast/own-it/id1614156969",
    },
    {
      id: "spotify",
      label: "Spotify",
      href:
        process.env.PODCAST_SPOTIFY_URL?.trim() ||
        "https://open.spotify.com/show/4hAdbrYO8P3ZGxUD3rnrwn",
    },
    {
      id: "stitcher",
      label: "Stitcher",
      href:
        process.env.PODCAST_STITCHER_URL?.trim() ||
        "https://www.stitcher.com/podcast/691676",
    },
    {
      id: "google",
      label: "Google Podcasts",
      href:
        process.env.PODCAST_GOOGLE_URL?.trim() ||
        `https://podcasts.google.com/feed/${googlePodcastsFeed}`,
    },
  ];
}
