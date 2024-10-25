"""alter_entity_tables_add_timestamps

Revision ID: b36c9b299df1
Revises: 272b6015eb36
Create Date: 2024-07-29 09:11:05.751327

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.sql import func

# revision identifiers, used by Alembic.
revision = 'b36c9b299df1'
down_revision = '272b6015eb36'
branch_labels = None
depends_on = None


def upgrade():
    with op.batch_alter_table('project', schema=None) as batch_op:
        batch_op.alter_column(
            column_name='created',
            new_column_name='created_at',
            existing_server_default=func.now(),
            server_default=None,
            nullable=False,
        )
        batch_op.add_column(
            sa.Column(
                'updated_at',
                sa.DateTime(),
                # Allow accessing the datetime in Python before the model is
                # inserted.
                default=func.now(),
                # Allows populating the `now()` value on the column creation.
                # Crucial, as the value is unknown because of its newness.
                # Required, because of `nullable=False`.
                server_default=func.now(),
                onupdate=func.now(),
                nullable=False,
            ),
        )

    with op.batch_alter_table('user', schema=None) as batch_op:
        batch_op.add_column(
            sa.Column(
                'created_at',
                sa.DateTime(),
                # Allow accessing the datetime in Python before the model is
                # inserted.
                default=func.now(),
                # Allows populating the `now()` value on the column creation.
                # Crucial, as the value is unknown because of its newness.
                # Required, because of `nullable=False`.
                server_default=func.now(),
                nullable=False,
            ),
        )
        batch_op.add_column(
            sa.Column(
                'updated_at',
                sa.DateTime(),
                # Allow accessing the datetime in Python before the model is
                # inserted.
                default=func.now(),
                # Allows populating the `now()` value on the column creation.
                # Crucial, as the value is unknown because of its newness.
                # Required, because of `nullable=False`.
                server_default=func.now(),
                onupdate=func.now(),
                nullable=False,
            ),
        )


def downgrade():
    with op.batch_alter_table('user', schema=None) as batch_op:
        batch_op.drop_column('updated_at')
        batch_op.drop_column('created_at')

    with op.batch_alter_table('project', schema=None) as batch_op:
        batch_op.alter_column(
            column_name='created_at',
            new_column_name='created',
            existing_server_default=None,
            server_default=func.now(),
            nullable=False,
        )
        batch_op.drop_column('updated_at')
