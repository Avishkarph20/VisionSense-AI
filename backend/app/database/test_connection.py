from sqlalchemy import text

from app.database.connection import engine

try:
    with engine.connect() as connection:
        result = connection.execute(text("SELECT version();"))

        print("=" * 60)
        print("✅ Connected Successfully to PostgreSQL")
        print("=" * 60)

        print(result.fetchone()[0])

except Exception as e:
    print("Connection Failed")
    print(e)