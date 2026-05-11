"""create profiles

Revision ID: 0002_create_profiles
Revises: 0001_create_users
Create Date: 2026-05-10
"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "0002_create_profiles"
down_revision: Union[str, None] = "0001_create_users"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "profiles",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "user_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("users.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("label", sa.String(length=80), nullable=False),
        sa.Column("gender", sa.String(length=8), nullable=False),
        sa.Column("birth_year", sa.Integer(), nullable=False),
        sa.Column("birth_month", sa.Integer(), nullable=False),
        sa.Column("birth_day", sa.Integer(), nullable=False),
        sa.Column("birth_hour", sa.Integer(), nullable=False),
        sa.Column("is_lunar", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("is_leap_month", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column(
            "birth_timezone",
            sa.String(length=64),
            nullable=False,
            server_default="Asia/Taipei",
        ),
        sa.Column("location", sa.String(length=255), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
    )
    op.create_index("ix_profiles_user_id", "profiles", ["user_id"])
    op.create_index(
        "ix_profiles_user_created", "profiles", ["user_id", sa.text("created_at DESC")]
    )


def downgrade() -> None:
    op.drop_index("ix_profiles_user_created", table_name="profiles")
    op.drop_index("ix_profiles_user_id", table_name="profiles")
    op.drop_table("profiles")
