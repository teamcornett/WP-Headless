import { notFound } from "next/navigation";
import { getPageBySlug } from "@/lib/wordpress";
import styles from "../about/about.module.scss";

export const metadata = {
  title: "Owners | Headless WordPress Site",
};

export default async function OwnersPage() {
  const page = await getPageBySlug("owners");

  if (!page) {
    notFound();
  }

  return (
    <main className={styles.main}>
      <h1
        className={styles.title}
        dangerouslySetInnerHTML={{ __html: page.title.rendered }}
      />
      <div
        className={`${styles.content} wp-content`}
        dangerouslySetInnerHTML={{ __html: page.content.rendered }}
      />
    </main>
  );
}
