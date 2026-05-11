"""SQLAlchemy declarative Base.

Models import this Base. alembic/env.py imports `target_metadata = Base.metadata`,
so every model module must be imported somewhere before alembic autogenerate runs.
We import them here in __init__.py via `app.models` to register them on Base.metadata.
"""

from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    pass
