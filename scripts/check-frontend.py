import urllib.request

urls = ['http://localhost:5173/', 'http://127.0.0.1:5173/', 'http://127.0.0.1:4173/']
for url in urls:
    try:
        with urllib.request.urlopen(url, timeout=5) as resp:
            print(url, '->', resp.status)
            print(resp.read(200).decode('utf-8', errors='ignore').split('\n')[0])
    except Exception as e:
        print(url, '->', type(e).__name__, e)
