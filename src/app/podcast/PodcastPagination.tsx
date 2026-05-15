import Link from "next/link";
import styles from "./podcast.module.scss";

type Props = {
  page: number;
  totalPages: number;
};

function pageHref(page: number): string {
  return page <= 1 ? "/podcast" : `/podcast?page=${page}`;
}

function buildPaginationItems(current: number, total: number): (number | "ellipsis")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const items: (number | "ellipsis")[] = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  if (start > 2) items.push("ellipsis");
  for (let i = start; i <= end; i++) items.push(i);
  if (end < total - 1) items.push("ellipsis");
  items.push(total);

  return items;
}

export default function PodcastPagination({ page, totalPages }: Props) {
  if (totalPages <= 1) {
    return null;
  }

  const items = buildPaginationItems(page, totalPages);

  return (
    <nav className={styles.pagination} aria-label="Podcast episodes pagination">
      <ul className={styles.paginationList}>
        {items.map((item, index) => (
          <li key={`${item}-${index}`} className={styles.paginationItem}>
            {item === "ellipsis" ? (
              <span className={styles.paginationEllipsis} aria-hidden="true">
                …
              </span>
            ) : item === page ? (
              <span className={styles.paginationCurrent} aria-current="page">
                {item}
              </span>
            ) : (
              <Link href={pageHref(item)} className={styles.paginationLink}>
                {item}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
}
