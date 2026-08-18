from fastapi import FastAPI

from app.detector import MallDetector
from app.tracker import MallTracker
from app.activity import ActivityRecognizer
from app.rules import MallRuleEngine
from app.events import EventGenerator

from app.config import SERVICE_NAME

app = FastAPI(title=SERVICE_NAME)

detector = MallDetector()

tracker = MallTracker()

activity = ActivityRecognizer()

rule_engine = MallRuleEngine()

event_generator = EventGenerator()


@app.get("/")
def home():

    return {
        "service": SERVICE_NAME,
        "status": "Running"
    }


@app.get("/health")
def health():

    return {
        "status": "healthy"
    }