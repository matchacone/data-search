import scrapy
from dataset_engine.items import DatasetEngineItem

class Spider(scrapy.Spider):
    name = "US_Gov"
    
    allowed_domains = ["catalog.data.gov"] # restrict crawling to this domain
    
    start_urls = ["https://catalog.data.gov/dataset"] # the starting url
    
    def parse(self, response):
        # 1. Extract the container for each dataset
        datasets = response.css('ul.organization-datasets__list > li')
        
        for dataset in datasets:
            # Extract the link to the detail page
            dataset_link = dataset.css('a.usa-link::attr(href)').get()
            
            # Extract the title right now (optional, but good for tracking)
            dataset_title = dataset.css('a.usa-link::text').get(default='').strip()
            
            if dataset_link:
                # We use cb_kwargs to pass the title we just scraped down to the parse_dataset method!
                yield response.follow(
                    dataset_link, 
                    callback=self.parse_dataset,
                    cb_kwargs={'title': dataset_title}
                )

        # 2. Extract the 'after' token dynamically from the webpage
        next_token = response.css('button.show-more-button::attr(data-after)').get()
        
        if next_token:
            # 3. Construct the next URL using the dynamic token
            next_page_url = f"https://catalog.data.gov/search?q=&per_page=20&after={next_token}"
            
            # 4. Recursively feed the new URL back into the same parse function
            yield scrapy.Request(url=next_page_url, callback=self.parse)
            
    def parse_dataset(self, response, title):
        """
        This method extracts the actual metadata from a single dataset page.
        """
        item = DatasetEngineItem()
        
        # Extracting data using CSS selectors
        item['title'] = title

        raw_desc = response.css('div.dataset-description *::text').getall()
        item['description'] = ' '.join(raw_desc).strip()

        item['source_url'] = response.url
        
        # Extracting lists of tags
        raw_tags = response.css('div.tag-list a.tag-link::text').getall()
        item['tags'] = [tags.strip() for tags in raw_tags if tags.strip()]

        # 1. Initialize an empty list to hold our structured file data
        resources = []
        
        # 2. Find all the resource list items
        resource_blocks = response.css('li.resources-list__item')
        
        # 3. Loop through each block individually
        for block in resource_blocks:
            file_name = block.css('p.resources-list__name::text').get(default='').strip()
            file_format = block.css('div.resources-list__format::text').get(default='').strip()
            download_url = block.css('a[aria-label*="Download"]::attr(href)').get()
            
            # Only add it to our list if a download URL actually exists
            if download_url:
                resources.append({
                    'name': file_name,
                    'format': file_format,
                    'url': download_url
                })
        
        # 4. Save the entire structured list into your item
        item['resources'] = resources

        yield item