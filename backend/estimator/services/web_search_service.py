import os
import requests
import json
import logging
import urllib.parse
from bs4 import BeautifulSoup

logger = logging.getLogger(__name__)

WEB_SEARCH_API_KEY = os.environ.get('WEB_SEARCH_API_KEY', '').strip()
WEB_SEARCH_PROVIDER = os.environ.get('WEB_SEARCH_PROVIDER', 'auto').lower().strip()

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    'Accept-Language': 'en-US,en;q=0.9',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8'
}


def search_tavily(query):
    if not WEB_SEARCH_API_KEY:
        return None
    try:
        res = requests.post(
            "https://api.tavily.com/search",
            json={"api_key": WEB_SEARCH_API_KEY, "query": query, "max_results": 5},
            timeout=8
        )
        print(f"[WEB SEARCH LOG] Tavily Status: {res.status_code}")
        if res.status_code == 200:
            data = res.json()
            results = []
            snippets = []
            for item in data.get('results', []):
                title = item.get('title', '')
                snippet = item.get('content', '')
                url = item.get('url', '')
                domain = url.split('/')[2] if '://' in url else url
                results.append({
                    "title": title,
                    "snippet": snippet,
                    "url": url,
                    "source": domain,
                    "date": item.get('published_date', 'Current Market')
                })
                snippets.append(f"Source: {title} ({url})\n{snippet}")

            if results:
                return {
                    "success": True,
                    "provider": "Tavily AI Web Search",
                    "results": results,
                    "extracted_context": "\n\n".join(snippets)
                }
    except Exception as e:
        print(f"[WEB SEARCH LOG] Tavily search error: {e}")
    return None


def search_serper(query):
    if not WEB_SEARCH_API_KEY:
        return None
    try:
        res = requests.post(
            "https://google.serper.dev/search",
            headers={"X-API-KEY": WEB_SEARCH_API_KEY, "Content-Type": "application/json"},
            json={"q": query, "num": 5},
            timeout=8
        )
        print(f"[WEB SEARCH LOG] Serper Status: {res.status_code}")
        if res.status_code == 200:
            data = res.json()
            results = []
            snippets = []
            for item in data.get('organic', []):
                title = item.get('title', '')
                snippet = item.get('snippet', '')
                url = item.get('link', '')
                domain = item.get('domain', url.split('/')[2] if '://' in url else url)
                results.append({
                    "title": title,
                    "snippet": snippet,
                    "url": url,
                    "source": domain,
                    "date": item.get('date', 'Current Market')
                })
                snippets.append(f"Source: {title} ({url})\n{snippet}")

            if results:
                return {
                    "success": True,
                    "provider": "Serper Google Search API",
                    "results": results,
                    "extracted_context": "\n\n".join(snippets)
                }
    except Exception as e:
        print(f"[WEB SEARCH LOG] Serper search error: {e}")
    return None


import base64

def unwrap_bing_url(link):
    try:
        if 'bing.com/ck/a' in link and '&u=' in link:
            u_param = link.split('&u=')[1].split('&')[0]
            if u_param.startswith('a1'):
                raw_b64 = u_param[2:]
                # Add padding if needed
                missing_padding = len(raw_b64) % 4
                if missing_padding:
                    raw_b64 += '=' * (4 - missing_padding)
                decoded = base64.b64decode(raw_b64).decode('utf-8', errors='ignore')
                if decoded.startswith('http'):
                    return decoded
    except Exception:
        pass
    return link


def search_bing_html(query):
    try:
        encoded_query = urllib.parse.quote(query)
        url = f"https://www.bing.com/search?q={encoded_query}"
        res = requests.get(url, headers=HEADERS, timeout=7)
        print(f"[WEB SEARCH LOG] Bing HTML Search Status: {res.status_code}")
        if res.status_code == 200:
            soup = BeautifulSoup(res.text, 'html.parser')
            results = []
            snippets = []
            for li in soup.find_all('li', class_='b_algo')[:5]:
                h2 = li.find('h2')
                a_tag = h2.find('a') if h2 else None
                snippet_p = li.find('p')
                if h2 and a_tag:
                    title = h2.text.strip()
                    snippet = snippet_p.text.strip() if snippet_p else title
                    raw_link = a_tag.get('href', '#')
                    clean_link = unwrap_bing_url(raw_link)
                    domain = clean_link.split('/')[2] if '://' in clean_link else clean_link
                    results.append({
                        "title": title,
                        "snippet": snippet,
                        "url": clean_link,
                        "source": domain,
                        "date": "Current Market"
                    })
                    snippets.append(f"Source: {title} ({clean_link})\n{snippet}")

            if results:
                return {
                    "success": True,
                    "provider": "Bing Web Search Engine",
                    "results": results,
                    "extracted_context": "\n\n".join(snippets)
                }
    except Exception as e:
        print(f"[WEB SEARCH LOG] Bing HTML Search error: {e}")
    return None



def perform_web_search(query, location=None):
    """
    Executes web search for current construction market information.
    Logs execution steps for debugging.
    """
    search_query = f"{query} in {location}" if location and location.lower() not in query.lower() else query
    print(f"\n[WEB SEARCH LOG] Starting search for query: '{search_query}' (Provider config: {WEB_SEARCH_PROVIDER})")

    # 1. Try Tavily if configured
    if WEB_SEARCH_PROVIDER == 'tavily' or (WEB_SEARCH_API_KEY and WEB_SEARCH_PROVIDER == 'auto'):
        res = search_tavily(search_query)
        if res:
            print(f"[WEB SEARCH LOG] Successfully retrieved {len(res['results'])} results via Tavily")
            return res

    # 2. Try Serper if configured
    if WEB_SEARCH_PROVIDER == 'serper' or (WEB_SEARCH_API_KEY and WEB_SEARCH_PROVIDER == 'auto'):
        res = search_serper(search_query)
        if res:
            print(f"[WEB SEARCH LOG] Successfully retrieved {len(res['results'])} results via Serper")
            return res

    # 3. Direct Bing / HTML Web Research
    res = search_bing_html(search_query)
    if res and res.get('success'):
        print(f"[WEB SEARCH LOG] Successfully retrieved {len(res['results'])} results via Bing Web Search")
        return res

    print("[WEB SEARCH LOG] Live search returned 0 results or failed. Using fallback.")
    return {
        "success": False,
        "provider": WEB_SEARCH_PROVIDER,
        "results": [],
        "extracted_context": "",
        "note": "Live web pricing could not be retrieved."
    }
