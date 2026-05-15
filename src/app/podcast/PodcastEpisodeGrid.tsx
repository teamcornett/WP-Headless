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
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function PodcastEpisodeGrid({ episodes }: Props) {
  if (episodes.length === 0) {
    return null;
  }

  return (
    <section className={styles.episodes} aria-labelledby="episodes-heading">
      <h2 id="episodes-heading" className={styles.sectionTitle}>
        Latest Episodes
      </h2>
      <ul className={styles.grid}>
        {episodes.map((ep) => (
          <li key={ep.id} className={styles.gridItem}>
            <article className={styles.card}>
              <div className={styles.cardMedia}>
                {ep.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element -- RSS episode artwork
                  <img
                    src={ep.imageUrl}
                    alt=""
                    className={styles.cardImage}
                    width={400}
                    height={400}
                    loading="lazy"
                  />
                ) : (
                  <div className={styles.cardImagePlaceholder} aria-hidden="true" />
                )}
              </div>
              <header className={styles.cardHeader}>
                <h3 className={styles.cardTitle}>{ep.title}</h3>
                {ep.publishedAt ? (
                  <time className={styles.cardDate} dateTime={ep.publishedAt}>
                    {formatDate(ep.publishedAt)}
                  </time>
                ) : null}
              </header>
              <footer className={styles.cardFooter}>
                {ep.audioUrl ? (
                  <audio
                    className={styles.cardPlayer}
                    controls
                    preload="none"
                    src={ep.audioUrl}
                  >
                    <a href={ep.audioUrl}>Listen</a>
                  </audio>
                ) : null}
              </footer>
            </article>
          </li>
        ))}
      </ul>
    </section>
  );
}
