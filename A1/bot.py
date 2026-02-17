import requests
from bs4 import BeautifulSoup
import win32com.client as win32
import os

URL = "https://en.wikipedia.org/wiki/List_of_state_and_union_territory_capitals_in_India"

def fetch_states_and_capitals():
    headers = {"User-Agent": "Mozilla/5.0"}
    html = requests.get(URL, headers=headers, timeout=10).text

    soup = BeautifulSoup(html, "html.parser")
    table = soup.find("table", class_="wikitable")

    data = []

    rows = table.find_all("tr")[1:]  # skip header
    for row in rows:
        cols = row.find_all("td")
        if len(cols) < 2:
            continue

        state = cols[0].get_text(strip=True)
        capital = cols[1].get_text(strip=True)
        capital = capital.split("[")[0].strip()

        data.append((state, capital))

    return data


def create_excel_with_states():
    states_and_capitals = fetch_states_and_capitals()

    excel = win32.Dispatch("Excel.Application")
    excel.Visible = True
    excel.DisplayAlerts = False
    excel.WindowState = -4137  # xlMaximized

    workbook = excel.Workbooks.Add()
    sheet = workbook.ActiveSheet

    # Headers
    sheet.Cells(1, 1).Value = "State"
    sheet.Cells(1, 2).Value = "Capital"

    row = 2
    for state, capital in states_and_capitals:
        sheet.Cells(row, 1).Value = state
        sheet.Cells(row, 2).Value = capital
        row += 1

    sheet.Columns("A:B").AutoFit()

    file_path = os.path.join(os.getcwd(), "Indian_States_and_Capitals.xlsx")
    workbook.SaveAs(file_path)

    print("Excel automation completed successfully.")
    print("File saved at:", file_path)


if __name__ == "__main__":
    create_excel_with_states()
