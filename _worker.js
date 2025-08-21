export default {
  async fetch(request) {
    const { pathname } = new URL(request.url);

    if (pathname.startsWith("/thumb-worker")) {
      return handleThumbnail(request);
    }

    return new Response("OK");
  },
};

async function handleThumbnail(request) {
  const url = new URL(request.url);
  const imageUrl = url.searchParams.get("url");
  const width = parseInt(url.searchParams.get("w")) || 150;
  const height = parseInt(url.searchParams.get("h")) || width;
  const quality = parseInt(url.searchParams.get("q")) || 60;

  if (!imageUrl) return new Response("No image URL", { status: 400 });

  try {
    const resizedRes = await fetch(imageUrl, {
      cf: {
        image: {
          width,
          height,
          fit: "cover",
          format: "auto",
          quality,
          metadata: "none",
        },
      },
    });

    if (!resizedRes.ok) {
      return new Response("Failed to fetch image", { status: 502 });
    }

    return new Response(resizedRes.body, {
      headers: {
        "Content-Type": resizedRes.headers.get("Content-Type") || "image/webp",
        "Cache-Control": "public, max-age=2592000, s-maxage=2592000",
      },
    });
  } catch (err) {
    return new Response("Thumbnail generation failed: " + err.message, { status: 500 });
  }
}
