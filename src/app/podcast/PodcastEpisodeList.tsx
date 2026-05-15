import type { MegaphoneEpisode } from "@/lib/megaphone";
import styles from "./podcast.module.scss";

type Props = {
  episodes: MegaphoneEpisode[];
};

function formatDate(isoOrRfc: string | null): string {
  if (!isoOrRfc) return "";
  const d = new Date(isoOrRfc);
  if (Number.isNaN(d.getTime())) return isoOrRfc;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function PodcastEpisodeList({ episodes }: Props) {
  if (episodes.length === 0) {
    return (
      <section className={styles.episodes} aria-labelledby="episodes-heading">
        <h2 id="episodes-heading" className={styles.episodesTitle}>
          Episodes
        </h2>
        <p className={styles.feedMissing}>
          No episodes could be loaded from the Megaphone feed. Try again later,
          or set <code className={styles.code}>MEGAPHONE_RSS_URL</code> if you
          are overriding the default feed.
        </p>
      </section>
    );
  }

  return (
    <section className={styles.episodes} aria-labelledby="episodes-heading">
      <h2 id="episodes-heading" className={styles.episodesTitle}>
        Episodes
      </h2>
      <ol className={styles.list}>
        {episodes.map((ep) => (
          <li key={ep.id} className={styles.card}>
            <div className={styles.cardBody}>
              {ep.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element -- remote episode artwork from RSS
                <img
                  src={ep.imageUrl}
                  alt=""
                  className={styles.artwork}
                  width={80}
                  height={80}
                  loading="lazy"
                />
              ) : null}
              <div className={styles.cardText}>
                <h3 className={styles.episodeTitle}>
                  {ep.link ? (
                    <a href={ep.link} className={styles.episodeLink}>
                      {ep.title}
                    </a>
                  ) : (
                    ep.title
                  )}
                </h3>
                {ep.publishedAt ? (
                  <time
                    className={styles.date}
                    dateTime={ep.publishedAt}
                  >
                    {formatDate(ep.publishedAt)}
                  </time>
                ) : null}
                {ep.description ? (
                  <p className={styles.description}>{ep.description}</p>
                ) : null}
                {ep.audioUrl ? (
                  <audio
                    className={styles.player}
                    controls
                    preload="none"
                    src={ep.audioUrl}
                  >
                    <a href={ep.audioUrl}>Download audio</a>
                  </audio>
                ) : null}
              </div>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
