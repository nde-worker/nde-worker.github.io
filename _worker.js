export default {
  async fetch(request) {
    try {
      const url = new URL(request.url);

      // ambil parameter
      const imageUrl = url.searchParams.get("url");
      const width = parseInt(url.searchParams.get("w") || "300");
      const height = parseInt(url.searchParams.get("h") || "0"); // optional
      const fit = url.searchParams.get("fit") || "scale-down"; // cover, contain, fill, inside, outside

      if (!imageUrl) {
        return new Response("Missing url parameter", { status: 400 });
      }

      // panggil gambar asli + resize via CF
      const response = await fetch(imageUrl, {
        cf: {
          image: {
            width,
            height: height > 0 ? height : undefined,
            fit,
            quality: 85,
            format: "webp", // konsisten, ringan, SEO friendly
          },
        },
      });

      // cek error
      if (!response.ok) {
        return new Response("Failed to fetch image", { status: response.status });
      }

      // return hasil gambar langsung
      return new Response(response.body, {
        headers: {
          "Content-Type": response.headers.get("Content-Type") || "image/jpeg",
          "Cache-Control": "public, max-age=31536000", // cache 1 tahun
        },
      });
    } catch (err) {
      return new Response("Error: " + err.message, { status: 500 });
    }
  },
};
