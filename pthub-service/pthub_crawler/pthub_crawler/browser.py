"""Playwright 브라우저 컨텍스트 헬퍼"""
from __future__ import annotations
from contextlib import contextmanager
from playwright.sync_api import sync_playwright, Browser, BrowserContext, Page


REAL_BROWSER_HEADERS = {
    'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
}

USER_AGENT = (
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) '
    'AppleWebKit/537.36 (KHTML, like Gecko) '
    'Chrome/120.0.0.0 Safari/537.36'
)


@contextmanager
def browser_context(headless: bool = True):
    """
    Playwright 브라우저 컨텍스트.
    실제 브라우저 환경을 모사해 학회 사이트의 봇 차단을 우회.

    사용:
        with browser_context() as ctx:
            page = ctx.new_page()
            page.goto(url)
    """
    with sync_playwright() as p:
        browser: Browser = p.chromium.launch(headless=headless)
        context: BrowserContext = browser.new_context(
            user_agent=USER_AGENT,
            locale='ko-KR',
            timezone_id='Asia/Seoul',
            viewport={'width': 1280, 'height': 800},
            extra_http_headers=REAL_BROWSER_HEADERS,
            ignore_https_errors=True,
        )
        # 자동화 탐지 회피 스크립트
        context.add_init_script("""
            Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
            Object.defineProperty(navigator, 'languages', { get: () => ['ko-KR', 'ko', 'en'] });
            Object.defineProperty(navigator, 'plugins', { get: () => [1,2,3,4,5] });
            window.chrome = { runtime: {} };
        """)
        try:
            yield context
        finally:
            context.close()
            browser.close()


def safe_goto(page: Page, url: str, timeout: int = 20000) -> bool:
    """페이지 이동. 실패 시 False."""
    try:
        resp = page.goto(url, wait_until='domcontentloaded', timeout=timeout)
        if resp is None:
            return False
        return resp.ok or resp.status < 400
    except Exception as e:
        print(f"  [warn] goto 실패 {url}: {e}")
        return False
