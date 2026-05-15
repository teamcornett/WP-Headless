import Link from "next/link";
import styles from "./podcast.module.scss";

export default function PodcastCta() {
  return (
    <section className={styles.cta} aria-labelledby="podcast-cta-heading">
      <h2 id="podcast-cta-heading" className={styles.ctaTitle}>
        51% of the population. Less than 1% of agency owners.
      </h2>
      <p className={styles.ctaSubtitle}>Are you with us?</p>
      <Link href="/be-counted" className={styles.ctaButton}>
        Stand up and be counted
      </Link>
    </section>
  );
}
