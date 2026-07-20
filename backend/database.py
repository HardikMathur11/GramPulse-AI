import os
import pymongo
import mongomock
import logging

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/gram")
DB_NAME = os.getenv("DB_NAME", "gram")

try:
    logger.info(f"Attempting to connect to MongoDB Atlas...")
    # Use 5s timeout to allow secure cloud connection handshake
    client = pymongo.MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
    client.server_info() # triggers connection check
    db = client[DB_NAME]
    logger.info("Successfully connected to real MongoDB instance.")
    IS_MOCK = False
except Exception as e:
    logger.warning(f"Could not connect to MongoDB ({e}). Falling back to in-memory mongomock.")
    client = mongomock.MongoClient()
    db = client[DB_NAME]
    IS_MOCK = True

def get_db():
    return db

def is_mock_db():
    return IS_MOCK
