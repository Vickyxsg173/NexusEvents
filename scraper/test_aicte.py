import requests
from bs4 import BeautifulSoup

url = "https://internship.aicte-india.org/"
headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"}
r = requests.get(url, headers=headers)
soup = BeautifulSoup(r.text, 'html.parser')
# Let's find any internship cards or links
links = soup.find_all('a', href=True)
for l in links[:20]:
    print(l['href'])

print("---")
# Or look for api endpoints in the javascript
scripts = soup.find_all('script', src=True)
for s in scripts:
    print(s['src'])
