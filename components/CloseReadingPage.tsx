import type { Flagship, ShelfEntry } from "@/lib/close-reading";

type Props = {
  flagship?: Flagship | null;
  shelf?: readonly ShelfEntry[];
};

/**
 * Mount point for the Close Reading page. The stub records which definition it
 * was given and does not render the scene. The home page does not mount it yet.
 */
export function CloseReadingPage({ flagship = null, shelf = [] }: Props) {
  return (
    <div
      data-scaffold="close-reading"
      data-flagship={flagship?.id ?? ""}
      data-shelf-count={String(shelf.length)}
    />
  );
}
