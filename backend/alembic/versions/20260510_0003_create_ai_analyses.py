"""create ai_analyses

Revision ID: 0003_create_ai_analyses
Revises: 0002_create_profiles
Create Date: 2026-05-10
"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "0003_create_ai_analyses"
down_revision: Union[str, None] = "0002_create_profiles"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "ai_analyses",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "user_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("users.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column(
            "profile_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("profiles.id", ondelete="SET NULL"),
            nullable=True,
        ),
        sa.Column("model", sa.String(length=128), nullable=False),
        sa.Column("request_prompt", sa.Text(), nullable=False),
        sa.Column("response_text", sa.Text(), nullable=True),
        sa.Column("reasoning_text", sa.Text(), nullable=True),
        sa.Column("prompt_tokens", sa.Integer(), nullable=True),
        sa.Column("completion_tokens", sa.Integer(), nullable=True),
        sa.Column("latency_ms", sa.Integer(), nullable=True),
        sa.Column("finish_reason", sa.String(length=32), nullable=True),
        sa.Column(
            "status",
            sa.String(length=16),
            nullable=False,
            server_default="streaming",
        ),
        sa.Column("error_message", sa.Text(), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
    )
    op.create_index("ix_ai_analyses_user_id", "ai_analyses", ["user_id"])
    op.create_index(
        "ix_ai_analyses_user_created",
        "ai_analyses",
        ["user_id", sa.text("created_at DESC")],
    )
    op.create_index(
        "ix_ai_analyses_quota",
        "ai_analyses",
        ["user_id", "status", sa.text("created_at DESC")],
    )


def downgrade() -> None:
    op.drop_index("ix_ai_analyses_quota", table_name="ai_analyses")
    op.drop_index("ix_ai_analyses_user_created", table_name="ai_analyses")
    op.drop_index("ix_ai_analyses_user_id", table_name="ai_analyses")
    op.drop_table("ai_analyses")
