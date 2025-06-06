"""empty message

Revision ID: be65b6d2f715
Revises: 91aa3641786c
Create Date: 2025-06-02 22:18:43.459715

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'be65b6d2f715'
down_revision: Union[str, None] = '91aa3641786c'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('node_types', sa.Column('section_id', sa.Integer(), nullable=True))
    op.create_foreign_key(None, 'node_types', 'sections', ['section_id'], ['id'])
    # ### end Alembic commands ###


def downgrade() -> None:
    """Downgrade schema."""
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_constraint(None, 'node_types', type_='foreignkey')
    op.drop_column('node_types', 'section_id')
    # ### end Alembic commands ###
