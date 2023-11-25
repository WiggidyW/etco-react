const RE_SHOP_APPRAISAL_CODE_QUERY = /^s[0-9a-f]{15}$/;
const RE_BUYBACK_APPRAISAL_CODE_QUERY = /^u[0-9a-f]{15}$/;

export const isBuybackAppraisalCodeQuery = (query: string): boolean =>
  RE_BUYBACK_APPRAISAL_CODE_QUERY.test(query);

export const isShopAppraisalCodeQuery = (query: string): boolean =>
  RE_SHOP_APPRAISAL_CODE_QUERY.test(query);
