import os
import sys
import time
import pandas as pd
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
import glob
import importlib.util

# Import the upload function from db-connect.py
spec = importlib.util.spec_from_file_location("db_connect", os.path.join(os.path.dirname(__file__), "db-connect.py"))
db_connect = importlib.util.module_from_spec(spec)
spec.loader.exec_module(db_connect)
upload_dataframe_to_postgres = db_connect.upload_dataframe_to_postgres

RBI_URL = "https://website.rbi.org.in/web/rbi/ifscdetails"
DOWNLOAD_FOLDER = os.path.abspath("downloads")
os.makedirs(DOWNLOAD_FOLDER, exist_ok=True)

print("Launching browser to RBI website...")

# Configure Chrome options for download
chrome_options = Options()
prefs = {
    "download.default_directory": DOWNLOAD_FOLDER,
    "download.prompt_for_download": False,
    "download.directory_upgrade": True,
    "safebrowsing.enabled": True
}
chrome_options.add_experimental_option("prefs", prefs)

service = Service()
driver = webdriver.Chrome(service=service, options=chrome_options)

try:
    # Navigate to RBI IFSC page
    print(f"Opening RBI IFSC page: {RBI_URL}")
    driver.get(RBI_URL)
    
    # Wait for page to load
    wait = WebDriverWait(driver, 20)
    
    # Search for the Excel IFSC link (looking for link containing "Excel" or "IFSC" keywords)
    print("Searching for Excel IFSC codes download link...")
    time.sleep(3)  # Allow page to fully load
    
    # Try multiple selectors to find the Excel download link
    excel_link = None
    try:
        # Look for links containing "Excel" and "IFSC" in text or href
        links = driver.find_elements(By.TAG_NAME, "a")
        for link in links:
            link_text = link.text.lower()
            href = link.get_attribute("href") or ""
            if ("excel" in link_text or "excel" in href.lower()) and \
               ("ifsc" in link_text or "ifsc" in href.lower()):
                excel_link = link
                print(f"Found link: {link.text}")
                break
        
        # Alternative: look for .xlsx or .xls files
        if not excel_link:
            for link in links:
                href = link.get_attribute("href") or ""
                if ".xlsx" in href.lower() or ".xls" in href.lower():
                    excel_link = link
                    print(f"Found Excel file link: {link.text}")
                    break
    except Exception as e:
        print(f"Error finding link: {e}")
    
    if excel_link:
        # Click the download link
        print("Downloading Excel file...")
        excel_link.click()
        
        # Wait for download to complete
        print("Waiting for download to complete...")
        time.sleep(10)  # Give enough time for download
        
        # Find the most recent Excel file in downloads folder
        excel_files = glob.glob(os.path.join(DOWNLOAD_FOLDER, "*.xlsx")) + \
                      glob.glob(os.path.join(DOWNLOAD_FOLDER, "*.xls"))
        
        if excel_files:
            # Get the most recently downloaded file
            excel_path = max(excel_files, key=os.path.getctime)
            print(f"File downloaded to: {excel_path}")
        else:
            raise Exception("Excel file not found in downloads folder")
    else:
        raise Exception("Could not find Excel IFSC codes download link on the page")

finally:
    driver.quit()
    print("Browser closed.")

# ---------------- LOAD ALL SHEETS INTO DATAFRAMES ----------------
print("\nLoading Excel file...")

# Read all sheet names
xl_file = pd.ExcelFile(excel_path)
sheet_names = xl_file.sheet_names

print(f"Found {len(sheet_names)} sheet(s): {sheet_names}")

# ---------------- COMBINE ALL SHEETS ----------------
print("\nCombining all sheets...")

all_dataframes = []

for sheet_name in sheet_names:
    print(f"\nProcessing sheet: '{sheet_name}'")
    
    try:
        # Read the sheet
        df = pd.read_excel(excel_path, sheet_name=sheet_name)
        
        print(f"Sheet has {len(df)} rows and {len(df.columns)} columns")
        print(f"Columns: {list(df.columns)}")
        
        all_dataframes.append(df)
        
    except Exception as e:
        print(f"Error processing sheet '{sheet_name}': {e}")
        continue

# Combine all sheets into one dataframe
if all_dataframes:
    combined_df = pd.concat(all_dataframes, ignore_index=True)
    print(f"\n{'='*60}")
    print(f"Combined dataframe has {len(combined_df)} rows and {len(combined_df.columns)} columns")
    print(f"Columns: {list(combined_df.columns)}")
    print("\nFirst 3 rows:")
    print(combined_df.head(3))
    print(f"{'='*60}")
    
    print("\nUploading to PostgreSQL...")
    
    connection_parameters = {
        "dbname": "automation_db",
        "user": "postgres",
        "password": "2606",
        "host": "localhost",
        "port": "5432"
    }
    
    table_name = "ifsc_codes"
    upload_dataframe_to_postgres(combined_df, table_name, connection_parameters, incremental=True)
    
    print(f"\n{'='*60}")
    print("All sheets combined and uploaded successfully!")
    print(f"{'='*60}")
else:
    print("No data to upload")
