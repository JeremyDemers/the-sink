"""create projects and add user roles

Revision ID: 58046549b727
Revises: 9baab1ce8911
Create Date: 2024-05-31 08:43:10.335414

"""
from alembic import op
import sqlalchemy as sa

from api.principal.role import Role

# revision identifiers, used by Alembic.
revision = '58046549b727'
down_revision = '9baab1ce8911'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('project',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('title', sa.String(), nullable=True),
    sa.Column('description', sa.Text(), nullable=True),
    sa.Column('author_id', sa.Integer(), nullable=True),
    sa.Column('state', sa.String(length=50), nullable=True),
    sa.ForeignKeyConstraint(['author_id'], ['user.id'], ),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('id')
    )
    with op.batch_alter_table('user', schema=None) as batch_op:
        batch_op.add_column(
            sa.Column(
                'role',
                sa.Integer(),
                nullable=False,
                server_default=str(Role.AUTHENTICATED.value),
            ),
        )
        batch_op.alter_column(
            'email',
            existing_type=sa.VARCHAR(),
            nullable=False,
        )
        batch_op.create_unique_constraint('user_email_key', ['email'])

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('user', schema=None) as batch_op:
        batch_op.drop_constraint('user_email_key', type_='unique')
        batch_op.alter_column('email',
               existing_type=sa.VARCHAR(),
               nullable=True)
        batch_op.drop_column('role')

    op.drop_table('project')
    # ### end Alembic commands ###
