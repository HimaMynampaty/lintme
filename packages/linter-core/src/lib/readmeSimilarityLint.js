/**
 * Calls the backend /api/compare-readmes route
 * to get an array of { url, similarity, sectionSimilarity[] } objects.
 *
 * @param {string}  currentMarkdown       – Current README content
 * @param {string[]} historicalUrls       – Array of GitHub raw URLs
 * @param {string}  method = "embedding_cosine"
 *                    cosine | soft_cosine | embedding_cosine | sectional_embedding
 *                    euclidean | damerau_levenshtein | llm_diff
 */
export async function fetchHistoricalReadmesFromBackend(
  currentMarkdown,
  historicalUrls,
  method = "embedding_cosine", 
  repo,
  versionCount = 2
) {
  try {
    const response = await fetch("http://localhost:5000/api/compare-readmes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        current:    currentMarkdown,
        historical: historicalUrls,
        method,
        repo,
        versionCount     
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to compare README files.");
    }

    const data = await response.json();
    return data.comparison; // [{ url, similarity, sectionSimilarity }]
  } catch (err) {
    console.error("Error fetching historical comparisons:", err);
    return [];
  }
}
