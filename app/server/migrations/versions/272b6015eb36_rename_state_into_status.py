"""Rename state into status

Revision ID: 272b6015eb36
Revises: 5a35979619f8
Create Date: 2024-07-16 08:53:18.379900

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '272b6015eb36'
down_revision = '5a35979619f8'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('project', schema=None) as batch_op:
        batch_op.add_column(
            sa.Column(
                'status',
                sa.String(length=50),
                nullable=True,
            )
        )

    # Migrate values from the legacy state column into the new one.
    op.execute("UPDATE project SET status = state")

    with op.batch_alter_table('project', schema=None) as batch_op:
        batch_op.drop_column('state')

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('project', schema=None) as batch_op:
        batch_op.add_column(
            sa.Column(
                'state',
                sa.VARCHAR(length=50),
                autoincrement=False,
                nullable=True,
            )
        )

    op.execute("UPDATE project SET state = status")

    with op.batch_alter_table('project', schema=None) as batch_op:
        batch_op.drop_column('status')

    # ### end Alembic commands ###
