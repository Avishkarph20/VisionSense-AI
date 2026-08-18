from sqlalchemy import select

from app.database.connection import SessionLocal
from app.database.models.role import Role


def main():

    session = SessionLocal()

    try:

        roles = session.scalars(
            select(Role)
        ).all()

        print("\n===== Roles =====")

        for role in roles:
            print(
                f"ID={role.id}, "
                f"Name={role.name}, "
                f"Description={role.description}"
            )

    finally:
        session.close()


if __name__ == "__main__":
    main()
