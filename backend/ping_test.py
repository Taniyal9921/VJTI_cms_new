import os
import requests

try:
    response = requests.post(
        "http://127.0.0.1:8000/api/auth/login",
        json={"email": "student@college.edu", "password": "Demo@12345"},
        timeout=3
    )
    print("Status:", response.status_code)
    print("Response:", response.text)
except Exception as e:
    print("Error:", e)
