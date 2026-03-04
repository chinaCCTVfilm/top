export const onRequest = async () => {
  return new Response(JSON.stringify({
    message: "这是来自 Cloudflare Workers 的动态数据！",
    serverTime: new Date().toISOString(),
    status: "success"
  }), {
    headers: { "Content-Type": "application/json; charset=utf-8" }
  });
};
