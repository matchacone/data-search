import scrapy
from dataset_engine.items import DatasetEngineItem

class Spider(scrapy.Spider):
    name = "datasets"
    
    allowed_domains = ["catalog.data.gov"] # restrict crawling to this domain
    
    start_urls = ["https://catalog.data.gov/dataset"] # the starting url
    
    def parse(self, response):
        # 1. Extract and yield your datasets from the current page content
        datasets = response.css('.dataset-content')
        for dataset in datasets:
            # (Your extraction logic here)
            yield item

        # 2. Extract the 'after' token dynamically from the webpage
        # This is typically found inside a 'data-after' attribute on the button
        next_token = response.css('button.show-more-button::attr(data-after)').get()
        
        if next_token:
            # 3. Construct the next URL using the dynamic token
            next_page_url = f"https://catalog.data.gov/search?q=&per_page=20&after={next_token}"
            
            # 4. Recursively feed the new URL back into the same parse function
            yield scrapy.Request(url=next_page_url, callback=self.parse)
            
    def parse_dataset(self, response):
        """
        This method extracts the actual metadata from a single dataset page.
        """
        item = DatasetItem()
        
        # Extracting data using CSS selectors
        item['title'] = response.css('h1.dataset-title::text').get(default='').strip()
        item['description'] = response.css('div.dataset-description::text').get(default='').strip()
        item['source_url'] = response.url
        
        # Extracting lists of items (like tags or formats)
        item['tags'] = response.css('ul.tags-list li a::text').getall()
        item['file_formats'] = response.css('span.format-label::text').getall()
        
        # Finding the direct download link
        item['download_url'] = response.css('a.resource-url-analytics::attr(href)').get()

        yield item