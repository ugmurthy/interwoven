/**
 * Utility functions for extracting content from URLs
 */

/**
 * Extracts content from URLs found in the input text and replaces them with the content
 * @param text Input text that may contain URLs
 * @returns Text with URLs replaced by their content
 */
export async function extractUrlContent(text: string): Promise<string> {
  // Detect URLs using regex
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const urls = text.match(urlRegex) || [];
  
  if (urls.length === 0) {
    return text; // No URLs found, return original text
  }
  
  console.log(`Found ${urls.length} URLs in input text`);
  
  // Process each URL
  for (const url of urls) {
    try {
      console.log(`Fetching content from URL: ${url}`);
      const content = await fetchUrlContent(url);
      
      // Replace URL with content
      text = text.replace(url, `URL Content (${url}):\n${content}\n`);
      console.log(`Successfully replaced URL with content: ${url}`);
    } catch (error) {
      console.error(`Error fetching content from ${url}:`, error);
      // Replace with error message
      text = text.replace(url, `[Failed to fetch content from ${url}: ${error instanceof Error ? error.message : String(error)}]`);
    }
  }
  
  return text;
}

/**
 * Fetches content from a URL and handles different content types
 * @param url URL to fetch content from
 * @returns Extracted content as string
 */
async function fetchUrlContent(url: string): Promise<string> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch URL: ${response.status} ${response.statusText}`);
  }
  
  // Handle different content types
  const contentType = response.headers.get('content-type') || '';
  
  if (contentType.includes('text/html')) {
    // Extract main content from HTML
    const html = await response.text();
    return extractMainContentFromHtml(html);
  } else if (contentType.includes('application/json')) {
    // Format JSON content
    const json = await response.json();
    return JSON.stringify(json, null, 2);
  } else {
    // Default to plain text
    return response.text();
  }
}

/**
 * Extracts main content from HTML by removing scripts, styles, and tags
 * @param html HTML content
 * @returns Extracted text content
 */
function extractMainContentFromHtml(html: string): string {
  // Simple extraction of text content from HTML
  // In a production environment, consider using a proper HTML parser
  const textContent = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<head\b[^<]*(?:(?!<\/head>)<[^<]*)*<\/head>/gi, '')
    .replace(/<nav\b[^<]*(?:(?!<\/nav>)<[^<]*)*<\/nav>/gi, '')
    .replace(/<footer\b[^<]*(?:(?!<\/footer>)<[^<]*)*<\/footer>/gi, '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  
  // Limit content length to avoid overwhelming the model
  const maxLength = 2000;
  return textContent.length > maxLength 
    ? textContent.substring(0, maxLength) + '... (content truncated)'
    : textContent;
}