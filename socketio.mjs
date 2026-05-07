export async function handler() {
  return {
    statusCode: 501,
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      error: "Socket.IO is not supported in Netlify Functions. Use polling-based realtime mode.",
    }),
  };
}
