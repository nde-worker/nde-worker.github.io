export default {
  async fetch(request) {
    const url = new URL(request.url);
    const imageUrl = url.searchParams.get("url");
    const width = parseInt(url.searchParams.get("w") || "190");

    if (!imageUrl) {
      return new Response("No image URL specified.", { status: 400 });
    }

    try {
      // Ambil gambar asli
      const res = await fetch(imageUrl);
      if (!res.ok) return new Response("Failed to fetch image.", { status: res.status });
      
      const imgBlob = await res.blob();

      // Buat image bitmap
      const imageBitmap = await createImageBitmap(imgBlob);

      // Hitung ukuran baru
      const origWidth = imageBitmap.width;
      const origHeight = imageBitmap.height;
      const newHeight = Math.round(origHeight * width / origWidth);

      // Resize via OffscreenCanvas
      const canvas = new OffscreenCanvas(width, newHeight);
      const ctx = canvas.getContext("2d");
      ctx.drawImage(imageBitmap, 0, 0, width, newHeight);

      // Pilih format WebP jika browser support
      const accept = request.headers.get("Accept") || "";
      let contentType = "image/jpeg";
      let blob;
      if (accept.includes("image/webp")) {
        blob = await canvas.convertToBlob({ type: "image/webp", quality: 0.8 });
        contentType = "image/webp";
      } else {
        blob = await canvas.convertToBlob({ type: "image/jpeg", quality: 0.8 });
      }

      return new Response(blob, {
        headers: {
          "Content-Type": contentType,
          "Cache-Control": "public, max-age=2592000", // 30 hari
        },
      });
    } catch (err) {
      return new Response("Error: " + err.message, { status: 500 });
    }
  },
};
