from unittest.mock import MagicMock, patch, Mock
from flask import Flask
from flask_login import current_user
from sqlalchemy.exc import SQLAlchemyError
from pytest import raises

from api.database import db
from api.models.user import User, UserStatus
from api.models.mixins.entity import EntityMixin, EntitySchema
from api.principal.role import Role
from api.schema import Schema

from ...conftest import configure_app_fixture


def _auth_user() -> User:
    return User(
        ntid="1234567",
        email="new-user@example.com",
        name="Test",
        role=Role.ADMIN.value,
        status=UserStatus.ACTIVE.value,
    )


class TestEntity(EntityMixin):
    """DB model stub to test the Entity mixin"""

    __test__ = False

    schema = EntitySchema(
        item=Schema(),
    )

    id = db.Column(db.Integer, primary_key=True)
    property = db.Column(db.String)

    def get_label(self) -> str:
        return str(self.property)


@configure_app_fixture(auth_user=_auth_user)
def test_save(app: Flask) -> None:
    entity = TestEntity(id=1, property="Test Entity")
    app.logger = Mock()  # type: ignore[misc]

    with patch("api.database.db.session") as mock_session:
        mock_session.add = MagicMock()
        mock_session.commit = MagicMock()

        entity.save()

        mock_session.add.assert_called_once_with(entity)
        mock_session.commit.assert_called_once()
        app.logger.info.assert_called_once_with(
            f'TestEntity "Test Entity"[1] has been updated by {current_user.email}',
        )


@configure_app_fixture(auth_user=_auth_user)
def test_delete(app: Flask) -> None:
    entity = TestEntity(id=1, property="Test Entity")
    app.logger = Mock()  # type: ignore[misc]

    with patch("api.database.db.session") as mock_session:
        mock_session.delete = MagicMock()
        mock_session.commit = MagicMock()

        entity.delete()

        mock_session.delete.assert_called_once_with(entity)
        mock_session.commit.assert_called_once()

        app.logger.info.assert_called_once_with(
            f'TestEntity "Test Entity"[1] has been deleted by {current_user.email}'
        )


@configure_app_fixture(auth_user=_auth_user)
def test_safe_session_execute_or_rollback(
    app: Flask,  # pylint: disable=locally-disabled, unused-argument
) -> None:
    entity = TestEntity(id=1, property="Test Entity")

    with patch("api.database.db.session") as mock_session:
        mock_session.add = MagicMock()
        mock_session.rollback = MagicMock()
        mock_session.commit.side_effect = SQLAlchemyError("Something has happened")
        with raises(SQLAlchemyError):
            entity.safe_session_execute_or_rollback(db.session.add)
            mock_session.rollback.assert_called_once()
