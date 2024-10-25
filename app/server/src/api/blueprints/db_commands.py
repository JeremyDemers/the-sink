from flask import Blueprint


db_commands_bp = Blueprint("db-seeder", __name__)


@db_commands_bp.cli.command("seed")
def seed_database() -> None:
    pass


__all__ = [
    "db_commands_bp",
]
