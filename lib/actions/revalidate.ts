import { revalidatePath, revalidateTag } from "next/cache";

export const PORTFOLIO_TAG = "portfolio";

/** Make published changes visible immediately without a redeploy. */
export function revalidatePortfolio() {
  revalidateTag(PORTFOLIO_TAG);
  revalidatePath("/");
  revalidatePath("/resume");
  revalidatePath("/admin", "layout");
}
