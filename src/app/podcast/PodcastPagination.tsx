import Link from "next/link";
import { MEGAPHONE_EPISODES_PER_PAGE } from "@/lib/megaphone";
import styles from "./podcast.module.scss";

type Props = {
  page: number;
  totalPages: number;
  total: number;
};

function pageHref(page: number): string {
  return page <= 1 ? "/podcast" : `/podcast?page=${page}`;
}

export default function PodcastPagination({ page, totalPages, total }: Props) {
  if (totalPages <= 1) {
    return null;
  }

  const hasNewer = page > 1;
  const hasOlder = page < totalPages;
  const rangeStart = (page - 1) * MEGAPHONE_EPISODES_PER_PAGE + 1;
  const rangeEnd = Math.min(page * MEGAPHONE_EPISODES_PER_PAGE, total);

  return (
    <nav
      className={styles.pagination}
      aria-label="Podcast episodes pagination"
    >
      <p className={styles.paginationSummary}>
        Showing {rangeStart}–{rangeEnd} of {total} episodes
      </p>
      <div className={styles.paginationControls}>
        {hasNewer ? (
          <Link href={pageHref(page - 1)} className={styles.paginationLink}>
            ← Newer
          </Link>
        ) : (
          <span className={styles.paginationDisabled} aria-hidden="true">
            ← Newer
          </span>
        )}
        <span className={styles.paginationCurrent}>
          Page {page} of {totalPages}
        </span>
        {hasOlder ? (
          <Link href={pageHref(page + 1)} className={styles.paginationLink}>
            Older →
          </Link>
        ) : (
          <span className={styles.paginationDisabled} aria-hidden="true">
            Older →
          </span>
        )}
      </div>
    </nav>
  );
}
