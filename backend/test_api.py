import unittest
import json
import urllib.request
import time
import subprocess
import socket

class TestGramPulseAPI(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        # Check if port 8000 is open, indicating the server is already running
        # If not, we will spin up a process for testing
        cls.server_proc = None
        s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        try:
            s.connect(("127.0.0.1", 8000))
            s.close()
            print("FastAPI server is already running on port 8000. Testing against active server...")
        except socket.error:
            print("Starting FastAPI server locally for testing...")
            cls.server_proc = subprocess.Popen(
                ["python", "-m", "uvicorn", "main:app", "--port", "8000"],
                cwd="."
            )
            # wait for server to spin up (including initial seed)
            time.sleep(15)

    @classmethod
    def tearDownClass(cls):
        if cls.server_proc:
            print("Terminating testing FastAPI server...")
            cls.server_proc.terminate()
            cls.server_proc.wait()

    def get_url_json(self, path):
        url = f"http://127.0.0.1:8000{path}"
        req = urllib.request.Request(url)
        with urllib.request.urlopen(req) as response:
            self.assertEqual(response.status, 200)
            return json.loads(response.read().decode())

    def post_url_json(self, path, payload):
        url = f"http://127.0.0.1:8000{path}"
        data = json.dumps(payload).encode('utf-8')
        req = urllib.request.Request(
            url, 
            data=data, 
            headers={'Content-Type': 'application/json'}
        )
        with urllib.request.urlopen(req) as response:
            self.assertEqual(response.status, 200)
            return json.loads(response.read().decode())

    def test_health(self):
        data = self.get_url_json("/api/health")
        self.assertEqual(data["status"], "healthy")

    def test_profiles_list(self):
        data = self.get_url_json("/api/profiles")
        self.assertTrue(len(data) >= 3)
        first_prof = data[0]
        self.assertIn("id", first_prof)
        self.assertIn("ownerName", first_prof)
        self.assertIn("businessName", first_prof)

    def test_profile_details_and_related(self):
        # query first profile
        profs = self.get_url_json("/api/profiles")
        prof_id = profs[0]["id"]
        
        prof = self.get_url_json(f"/api/profiles/{prof_id}")
        self.assertEqual(prof["id"], prof_id)

        txs = self.get_url_json(f"/api/profiles/{prof_id}/transactions")
        self.assertTrue(len(txs) > 0)
        self.assertIn("amount", txs[0])

        emi = self.get_url_json(f"/api/profiles/{prof_id}/emi")
        self.assertTrue(len(emi) > 0)
        self.assertIn("amount", emi[0])

        alerts = self.get_url_json(f"/api/profiles/{prof_id}/alerts")
        self.assertTrue(len(alerts) > 0)
        self.assertIn("title", alerts[0])

        weather = self.get_url_json(f"/api/profiles/{prof_id}/weather")
        self.assertIn("temp", weather)

    def test_mandi(self):
        data = self.get_url_json("/api/mandi")
        self.assertTrue(len(data) >= 4)
        self.assertIn("commodity", data[0])

    def test_chat_endpoint(self):
        payload = {
            "question": "When is my next EMI?",
            "enterprise_id": "ramesh_dairy",
            "language": "en"
        }
        res = self.post_url_json("/api/chat", payload)
        self.assertIn("reply", res)

    def test_consent_endpoint(self):
        payload = {
            "sms": True,
            "upi": True,
            "mandi": False,
            "weather": True
        }
        res = self.post_url_json("/api/profiles/ramesh_dairy/consent", payload)
        self.assertEqual(res["status"], "success")

    def test_onboard_endpoint(self):
        payload = {
            "ownerName": "Test Owner",
            "businessName": "Test Shop",
            "businessType": "Kirana Store",
            "village": "Test Village",
            "district": "Anand",
            "preferredLanguage": "en",
            "loanDetails": "Mudra Loan: 20000 remaining",
            "upiLinked": True,
            "smsPermission": True
        }
        res = self.post_url_json("/api/onboard", payload)
        self.assertEqual(res["status"], "success")
        self.assertIn("id", res)

if __name__ == "__main__":
    unittest.main()
