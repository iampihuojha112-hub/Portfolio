import PortfolioView from "@/components/PortfolioView";
import { getPortfolio } from "@/lib/database/public";
import { EMPTY_PORTFOLIO } from "@/data/fallback";

export default async function Home() {
  let data = EMPTY_PORTFOLIO;
  try {
    data = await getPortfolio();
  } catch (e) {
    // Never take the public site down because the database is unreachable.
    console.error("[portfolio] load failed", e);
  }
  return <PortfolioView data={data} />;
}
