import os
import kaggle
import time
import sys
from dotenv import load_dotenv

load_dotenv()

# Setup your paths to find the Scrapy Item just like before
current_dir = os.path.dirname(os.path.abspath(__file__))
scrapy_project_dir = os.path.abspath(os.path.join(current_dir, "..", "..", "scrapy"))
if scrapy_project_dir not in sys.path:
    sys.path.append(scrapy_project_dir)

from dataset_engine.items import DatasetEngineItem

def index_kaggle_datasets(max_pages=5):
    """
    Paginates through Kaggle's public datasets and extracts metadata.
    """
    kaggle.api.authenticate()
    print("🚀 Starting Kaggle global indexer...")
    
    total_indexed = 0
    
    # Loop through pages of results
    for page in range(1, max_pages + 1):
        print(f"📄 Fetching Page {page}...")
        
        try:
            # dataset_list fetches a page of metadata objects without downloading files
            datasets = kaggle.api.dataset_list(page=page)
            
            if not datasets:
                print("🏁 Reached the end of Kaggle's index.")
                break
                
            for ds in datasets:
                item = DatasetEngineItem()
                
                # The object properties are slightly different here than in dataset_metadata()
                item['title'] = getattr(ds, 'title', 'Untitled Dataset')
                item['description'] = getattr(ds, 'subtitle', '')
                
                # The identifier is required to build the URLs
                identifier = getattr(ds, 'ref', None) 
                if not identifier:
                    continue
                    
                item['source_url'] = f"https://www.kaggle.com/datasets/{identifier}"
                
                # Extract text from tag objects
                raw_tags = getattr(ds, 'tags', [])
                item['tags'] = [tag.name.lower() for tag in raw_tags] if raw_tags else []
                
                # Generate the dynamic download link for the end user
                download_url = f"kaggle datasets download -d {identifier}"
                
                # We assume ZIP since Kaggle bundles everything
                item['resources'] = [{
                    'name': f"{identifier.split('/')[-1]}.zip",
                    'format': 'ZIP',
                    'url': download_url,
                    'source': 'kaggle_api'
                }]
                
                # In your real pipeline, you would yield this item or save to PostgreSQL here
                total_indexed += 1
                
            # Sleep to respect Kaggle's API limits
            time.sleep(2)
            
        except Exception as e:
            print(f"❌ API Error on page {page}: {e}")
            break

    print(f"✅ Indexing complete. Total metadata records scraped: {total_indexed}")

if __name__ == "__main__":
    # Start small to test the pipeline
    index_kaggle_datasets(max_pages=3)