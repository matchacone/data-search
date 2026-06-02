# Scrapy settings for dataset_engine project

BOT_NAME = "dataset_engine"

SPIDER_MODULES = ["dataset_engine.spiders"]
NEWSPIDER_MODULE = "dataset_engine.spiders"

# 1. Identify Yourself (Crucial for scraping government/public sites)
# Always provide a way for the site admin to contact you if your bot causes issues.
USER_AGENT = "DatasetSearchEngineBot (+http://www.yourdomain.com/bot-info)"

# 2. Respect the site's rules
ROBOTSTXT_OBEY = True

# 3. Configure Politeness (Rate Limiting)
# Limit how many requests you make at the exact same time
CONCURRENT_REQUESTS = 4 

# Add a hard delay between requests to the same domain (in seconds)
DOWNLOAD_DELAY = 1.5 

# 4. Enable AutoThrottle (The ultimate safety net)
# This automatically slows your scraper down if the target server starts responding slowly
AUTOTHROTTLE_ENABLED = True
AUTOTHROTTLE_START_DELAY = 2.0
AUTOTHROTTLE_MAX_DELAY = 15.0
AUTOTHROTTLE_TARGET_CONCURRENCY = 1.0

# 5. Enable Resilient Retries
# If the server throws a temporary error, Scrapy will pause and try again
RETRY_ENABLED = True
RETRY_TIMES = 3
RETRY_HTTP_CODES = [500, 502, 503, 504, 429] # 429 = Too Many Requests

# Set settings whose default value is deprecated to a future-proof value
REQUEST_FINGERPRINTER_IMPLEMENTATION = "2.7"
TWISTED_REACTOR = "twisted.internet.asyncioreactor.AsyncioSelectorReactor"
FEED_EXPORT_ENCODING = "utf-8"