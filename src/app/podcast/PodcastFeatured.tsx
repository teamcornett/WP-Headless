import type { MegaphoneEpisode } from "@/lib/megaphone";
import styles from "./podcast.module.scss";

type Props = {
  episode: MegaphoneEpisode;
};

function formatDate(isoOrRfc: string | null): string {
  if (!isoOrRfc) return "";
  const d = new Date(isoOrRfc);
  if (Number.isNaN(d.getTime())) return isoOrRfc;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function PodcastFeatured({ episode }: Props) {
  const image = episode.imageUrl;

  return (
    <section className={styles.featured} aria-labelledby="featured-heading">
      <h2 id="featured-heading" className={styles.sectionTitle}>
        Featured Podcast
      </h2>
      <article className={styles.featuredCard}>
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element -- RSS episode artwork
          <img
            src={image}
            alt=""
            className={styles.featuredImage}
            width={480}
            height={480}
            loading="eager"
          />
        ) : (
          <div className={styles.featuredImagePlaceholder} aria-hidden="true" />
        )}
        <div className={styles.featuredBody}>
          <h3 className={styles.featuredTitle}>{episode.title}</h3>
          {episode.publishedAt ? (
            <time
              className={styles.featuredDate}
              dateTime={episode.publishedAt}
            >
              {formatDate(episode.publishedAt)}
            </time>
          ) : null}
          {episode.description ? (
            <p className={styles.featuredDescription}>{episode.description}</p>
          ) : null}
          {episode.audioUrl ? (
            <audio
              className={styles.featuredPlayer}
              controls
              preload="metadata"
              src={episode.audioUrl}
            >
              <a href={episode.audioUrl}>Download audio</a>
            </audio>
          ) : null}
        </div>
      </article>
    </section>
  );
}
