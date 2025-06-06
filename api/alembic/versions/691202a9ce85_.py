"""empty message

Revision ID: 691202a9ce85
Revises: be65b6d2f715
Create Date: 2025-06-02 22:24:03.408199

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '691202a9ce85'
down_revision: Union[str, None] = 'be65b6d2f715'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # ### commands auto generated by Alembic - please adjust! ###
    op.alter_column('node_types', 'section_id',
               existing_type=sa.INTEGER(),
               nullable=False)
    # ### end Alembic commands ###


def downgrade() -> None:
    """Downgrade schema."""
    # ### commands auto generated by Alembic - please adjust! ###
    op.alter_column('node_types', 'section_id',
               existing_type=sa.INTEGER(),
               nullable=True)
    # ### end Alembic commands ###
