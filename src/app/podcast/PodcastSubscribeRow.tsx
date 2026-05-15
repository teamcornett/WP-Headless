import { getPodcastSubscribeLinks } from "./podcast-subscribe";
import {
  ApplePodcastsIcon,
  GooglePodcastsIcon,
  RssIcon,
  SpotifyIcon,
  StitcherIcon,
} from "./PodcastSubscribeIcons";
import styles from "./podcast.module.scss";

const iconMap = {
  rss: RssIcon,
  apple: ApplePodcastsIcon,
  spotify: SpotifyIcon,
  stitcher: StitcherIcon,
  google: GooglePodcastsIcon,
} as const;

export default function PodcastSubscribeRow() {
  const links = getPodcastSubscribeLinks();

  return (
    <div className={styles.subscribeRow}>
      <p className={styles.subscribeLabel}>Subscribe</p>
      <ul className={styles.subscribeList}>
        {links.map((link) => {
          const Icon = iconMap[link.id];
          return (
            <li key={link.id}>
              <a
                href={link.href}
                className={styles.subscribeIconLink}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={link.label}
                title={link.label}
              >
                <Icon className={styles.subscribeIcon} />
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
