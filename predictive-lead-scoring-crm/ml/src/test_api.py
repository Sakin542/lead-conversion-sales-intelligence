import unittest
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from api import health_check, get_model_info, predict_endpoint, predict_batch_endpoint, LeadPayload, startup_event

class TestMlPredictionApi(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        startup_event()

    def test_health_check(self):
        res = health_check()
        self.assertEqual(res["status"], "online")
        self.assertIn("model_name", res)

    def test_model_info(self):
        res = get_model_info()
        self.assertIn("roc_auc", res)

    def test_predict_single_lead(self):
        payload = LeadPayload(lead_data={
            "Lead Origin": "Landing Page Submission",
            "Lead Source": "Google",
            "Do Not Email": "No",
            "Do Not Call": "No",
            "TotalVisits": 8,
            "Total Time Spent on Website": 850,
            "Page Views Per Visit": 4.0,
            "Last Activity": "Email Opened"
        })
        res = predict_endpoint(payload)
        self.assertEqual(res["status"], "success")
        self.assertIn("conversion_probability", res["data"])
        self.assertIn("lead_score", res["data"])
        self.assertIn("temperature", res["data"])
        self.assertIn(res["data"]["temperature"], ["HOT", "WARM", "COLD"])

    def test_predict_batch_leads(self):
        leads = [
            {
                "Lead Source": "Google",
                "TotalVisits": 10,
                "Total Time Spent on Website": 1200,
                "Last Activity": "SMS Sent"
            },
            {
                "Lead Source": "Olark Chat",
                "TotalVisits": 1,
                "Total Time Spent on Website": 10,
                "Last Activity": "Email Opened"
            }
        ]
        res = predict_batch_endpoint(leads)
        self.assertEqual(res["status"], "success")
        self.assertEqual(res["count"], 2)
        self.assertEqual(len(res["data"]), 2)

if __name__ == "__main__":
    unittest.main()

