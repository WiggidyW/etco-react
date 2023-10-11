import { CfgTypePricing } from "@/proto/etco";

export const ReprocessingDesc = (reprEff: number): string => {
  return `${reprEff}% Reprocessed`;
};

export const PricingDesc = ({
  isBuy,
  percentile,
  modifier,
  market,
}: CfgTypePricing): string => {
  const st = ["1", "21", "31", "41", "51", "61", "71", "81", "91"];
  const nd = ["2", "22", "32", "42", "52", "62", "72", "82", "92"];
  const rd = ["3", "23", "33", "43", "53", "63", "73", "83", "93"];

  let percentileStr: string;

  if (percentile === 0) {
    percentileStr = isBuy ? "MinBuy" : "MinSell";
  } else if (percentile === 100) {
    percentileStr = isBuy ? "MaxBuy" : "MaxSell";
  } else {
    let ordinal: string;
    if (st.includes(percentile.toString())) ordinal = "st";
    else if (nd.includes(percentile.toString())) ordinal = "nd";
    else if (rd.includes(percentile.toString())) ordinal = "rd";
    else ordinal = "th";
    percentileStr = `${percentile}${ordinal} Percentile ${
      isBuy ? "Buy" : "Sell"
    }`;
  }

  return `${market} ${modifier}% of ${percentileStr}`;
};
