async function test() {
  const pollinationsUrl = `https://image.pollinations.ai/prompt/Food?width=800&height=800&nologo=true&seed=123&model=flux`;
  try {
    const res = await fetch(pollinationsUrl, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } });
    console.log('Status:', res.status);
    if (!res.ok) {
      console.log(await res.text());
    }
  } catch(e) {
    console.error('Fetch error:', e);
  }
}
test();
