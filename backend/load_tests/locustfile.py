from locust import HttpUser, task, between
import random


class RiftShieldLoadUser(HttpUser):
    wait_time = between(1, 3)

    def on_start(self):
        self.login()

    def login(self):
        self.client.post("/api/auth/login", json={
            "email": "loadtest@riftshield.com",
            "password": "loadtest123",
        })

    @task(3)
    def health_check(self):
        self.client.get("/api/health")

    @task(2)
    def dashboard_stats(self):
        self.client.get("/api/dashboard/stats")

    @task(2)
    def list_inferences(self):
        self.client.get("/api/inference/reports")

    @task(2)
    def list_threats(self):
        self.client.get("/api/inference/threats")

    @task(1)
    def list_vulnerabilities(self):
        self.client.get("/api/kb/vulnerabilities?lang=pt-BR")

    @task(1)
    def list_countermeasures(self):
        self.client.get("/api/kb/countermeasures?lang=pt-BR")

    @task(1)
    def get_profile(self):
        self.client.get("/api/users/me")

    @task(1)
    def get_hermes_config(self):
        self.client.get("/api/hermes/config")

    @task(1)
    def export_json(self):
        self.client.post("/api/export/export", json={
            "sections": ["inferences", "threats"],
            "format": "json",
        })
