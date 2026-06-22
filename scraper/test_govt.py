import requests

urls = [
    "https://internship.aicte-india.org/",
    "https://www.isro.gov.in/Careers.html",
    "https://drdo.gov.in/drdo/careers"
]

headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
}

for u in urls:
    try:
        r = requests.get(u, headers=headers, timeout=10)
        print(f"{u}: {r.status_code}")
    except Exception as e:
        print(f"{u}: ERROR {e}")
