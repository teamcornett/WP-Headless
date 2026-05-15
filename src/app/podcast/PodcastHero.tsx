import type { MegaphoneChannel } from "@/lib/megaphone";
import PodcastSubscribeRow from "./PodcastSubscribeRow";
import styles from "./podcast.module.scss";

type Props = {
  channel: MegaphoneChannel | null;
  pageTitle: string;
  introHtml?: string;
};

export default function PodcastHero({ channel, pageTitle, introHtml }: Props) {
  const showArt = channel?.imageUrl;
  const showTitle = channel?.title ?? "OWNIT";

  return (
    <header className={styles.hero}>
      <div className={styles.heroVisual} aria-hidden="true">
        {showArt ? (
          // eslint-disable-next-line @next/next/no-img-element -- RSS channel artwork
          <img
            src={showArt}
            alt=""
            className={styles.heroArt}
            width={200}
            height={200}
          />
        ) : null}
        <span className={styles.heroRing}>{showTitle}</span>
      </div>

      <div className={styles.heroContent}>
        <p className={styles.heroEyebrow}>{showTitle.toUpperCase()}</p>
        <h1
          className={styles.heroTitle}
          dangerouslySetInnerHTML={{ __html: pageTitle }}
        />
        {introHtml ? (
          <div
            className={`${styles.heroIntro} wp-content`}
            dangerouslySetInnerHTML={{ __html: introHtml }}
          />
        ) : channel?.description ? (
          <p className={styles.heroIntro}>{channel.description}</p>
        ) : null}
        <PodcastSubscribeRow />
      </div>
    </header>
  );
}
