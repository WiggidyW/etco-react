export const jsonOrStatusError = async (
  res: Response,
  fetching: string
): Promise<any> => {
  if (res.ok) {
    return res.json();
  } else {
    const text = await res.text();
    throw new Error(`fetching ${fetching}: ${res.statusText} ${text}`);
  }
};
