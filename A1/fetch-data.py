import requests
from bs4 import BeautifulSoup

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
        capital = capital.split("[")[0]

        data.append((state, capital))

    return data


if __name__ == "__main__":
    print(fetch_states_and_capitals())
