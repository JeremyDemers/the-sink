from typing import TYPE_CHECKING
from flask_migrate import Migrate
from flask_sqlalchemy import SQLAlchemy


db = SQLAlchemy()
migrate = Migrate(db=db)


if TYPE_CHECKING:
    from flask_sqlalchemy.model import Model as BaseModel

    class Model(BaseModel):  # pylint: disable=locally-disabled, too-few-public-methods
        """
        The model definition for type-checking.

        See https://github.com/pallets-eco/flask-sqlalchemy/issues/1186
        """

else:
    Model = db.Model
