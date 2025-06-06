"""empty message

Revision ID: d0958e5255f3
Revises: 8ad35c9b215c
Create Date: 2025-06-05 21:42:46.156784

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'd0958e5255f3'
down_revision: Union[str, None] = '8ad35c9b215c'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_constraint('node_node_node2_id_fkey', 'node_node', type_='foreignkey')
    op.drop_constraint('node_node_node1_id_fkey', 'node_node', type_='foreignkey')
    op.create_foreign_key(None, 'node_node', 'nodes', ['node2_id'], ['id'], ondelete='CASCADE')
    op.create_foreign_key(None, 'node_node', 'nodes', ['node1_id'], ['id'], ondelete='CASCADE')
    # ### end Alembic commands ###


def downgrade() -> None:
    """Downgrade schema."""
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_constraint(None, 'node_node', type_='foreignkey')
    op.drop_constraint(None, 'node_node', type_='foreignkey')
    op.create_foreign_key('node_node_node1_id_fkey', 'node_node', 'nodes', ['node1_id'], ['id'])
    op.create_foreign_key('node_node_node2_id_fkey', 'node_node', 'nodes', ['node2_id'], ['id'])
    # ### end Alembic commands ###
