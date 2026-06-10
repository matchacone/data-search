import os
import kaggle
import time
import sys, os
from dotenv import load_dotenv
import django

django_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..', '..', 'django'))
sys.path.insert(0, django_dir)
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'datasearch.settings')
django.setup()

from searchEngine.models import Dataset


load_dotenv()

# Setup your paths to find the Scrapy Item just like before
current_dir = os.path.dirname(os.path.abspath(__file__))
scrapy_project_dir = os.path.abspath(os.path.join(current_dir, "..", "..", "scrapy"))
if scrapy_project_dir not in sys.path:
    sys.path.append(scrapy_project_dir)

from dataset_engine.items import DatasetEngineItem

def fetch_page_with_backoff(page, retries=3):
    """
    Fetches a single page of Kaggle datasets with exponential backoff on 429 errors.
    """
    for attempt in range(retries):
        try:
            return kaggle.api.dataset_list(page=page)
        except Exception as e:
            if '429' in str(e):
                wait = 60 * (2 ** attempt)  # 60s, 120s, 240s
                print(f"⚠️  Rate limited on page {page}. Waiting {wait}s before retry {attempt + 1}/{retries}...")
                time.sleep(wait)
            else:
                raise
    print(f"❌ Giving up on page {page} after {retries} retries.")
    return []


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
            datasets = fetch_page_with_backoff(page)
            
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
                
                Dataset.objects.update_or_create(
                    source_url=item['source_url'],
                    defaults={
                        'title':       item['title'],
                        'description': item['description'],
                        'tags':        item['tags'],
                        'resources':   item['resources'],
                        'source':      'kaggle',
                    }
                )
                total_indexed += 1
                
            # Sleep to respect Kaggle's API limits
            time.sleep(2)
            
        except Exception as e:
            print(f"❌ Unrecoverable error on page {page}: {e}")
            break

    print(f"✅ Indexing complete. Total metadata records scraped: {total_indexed}")

if __name__ == "__main__":
    index_kaggle_datasets(max_pages=50)