import os
from dotenv import load_dotenv

load_dotenv()


SERVICE_NAME = os.getenv("SERVICE_NAME")

ENVIRONMENT = os.getenv("ENVIRONMENT")

PORT = int(os.getenv("PORT"))

YOLO_MODEL = os.getenv("YOLO_MODEL")

BACKEND_URL = os.getenv("BACKEND_URL")