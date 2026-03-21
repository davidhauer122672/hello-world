# NotebookLM Exports — Google Sheets Setup

## Step 1: Create the Google Sheet
1. Go to [Google Sheets](https://sheets.google.com) and create a new spreadsheet
2. Rename it to **NotebookLM Exports**

## Step 2: Import Each Tab
For each CSV file, create a tab and import:

| Tab Name         | CSV File              |
|------------------|-----------------------|
| CompetitorData   | CompetitorData.csv    |
| MarketData       | MarketData.csv        |
| PortfolioData    | PortfolioData.csv     |
| RegulatoryData   | RegulatoryData.csv    |

### Import steps per tab:
1. Click the **+** at the bottom to add a new sheet tab
2. Rename the tab to match the name above
3. Go to **File → Import → Upload** and select the CSV
4. Choose **"Replace current sheet"** as the import location
5. Click **Import data**

## Step 3: Connect to NotebookLM
1. Open [NotebookLM](https://notebooklm.google.com)
2. Create a new notebook
3. Click **Add Source → Google Drive**
4. Select the **NotebookLM Exports** spreadsheet
5. NotebookLM will index all tabs automatically

## Tab Headers Reference

### CompetitorData
Competitor Name, Service Area, Services Offered, Pricing Monthly, Pricing Notes, Documentation Level, Google Review Score, Review Count, Website URL, Key Weakness, CK Advantage

### MarketData
Data Point, Source, Date, Value, Metric Type, Service Zone, Notes

### PortfolioData
Property Reference, Service Zone, Assessed Value, Service Tier, Monthly Revenue, Inspection Frequency, Risk Score, Notes

### RegulatoryData
Regulation Name, Jurisdiction, Category, Deadline, Renewal Frequency, Status, Notes, Source URL
