export async function checkCrossPlatformDifference(markdown, compare = { first: 'marked', second: 'puppeteer' }) {
  try {
    const res = await fetch('http://localhost:5000/api/cross-platform-diff', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ markdown, compare })
    })

    const data = await res.json()

    if (!res.ok) {
      throw new Error(data.error || 'Unknown error from backend')
    }

    return {
      success: true,
      rendererA: data.rendererA,
      rendererB: data.rendererB,
      htmlA: data.htmlA,
      htmlB: data.htmlB,
      domDiff: data.domDiff,
      rawDiff: data.rawDiff,
      formattedRawDiff: data.formattedRawDiff || "",
      lineNumbers: data.lineNumbers || [],
      pixelChanges: data.pixelChanges || 0,
      pngA: data.pngAPath || null,
      pngB: data.pngBPath || null,
      pngDiff: data.pngDiffPath || null
    }
  } catch (err) {
    return {
      success: false,
      error: err.message || 'Cross-platform check failed'
    }
  }
}
