# Define here the models for your scraped items
#
# See documentation in:
# https://docs.scrapy.org/en/latest/topics/items.html

import scrapy


class DatasetEngineItem(scrapy.Item):
    title = scrapy.Field()
    description = scrapy.Field()
    source_url = scrapy.Field()
    download_url = scrapy.Field()
    file_formats = scrapy.Field()  # e.g., CSV, JSON, PDF
    tags = scrapy.Field()
    pass
