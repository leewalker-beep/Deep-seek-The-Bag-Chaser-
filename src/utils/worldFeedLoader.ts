export let WORLD_FEED_CONTENT: any = null;

export function setWorldFeedContent(content: any) {
  WORLD_FEED_CONTENT = content;
}

export async function loadWorldFeedContent(): Promise<any> {
  if (WORLD_FEED_CONTENT) return WORLD_FEED_CONTENT;

  try {
    const content = (await import('../config/worldFeed/templates.json')).default;
    setWorldFeedContent(content);
    return content;
  } catch (err) {
    console.error('Failed to dynamically load world feed content templates', err);
    return null;
  }
}
