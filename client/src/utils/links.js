
/**
 * Opens a link in a new browser tab/page.
 * - On standard mobile browsers, this opens a new tab.
 * - In built-in wallet browsers like Essentials, this opens the link in the system browser.
 */
export const openExternalLink = (link) => {
  // Fix the link if needed
  if (!link.toLowerCase().startsWith("http"))
    link = `https://${link}`;

  window.open(link, "_system", "location=yes");
}