from flask_login import LoginManager

from api.models.user import User

login_manager = LoginManager()


@login_manager.user_loader
def load_user(user_id: int | str) -> User | None:
    return User.get(user_id)


# @login_manager.unauthorized_handler
# def unauthorized():
#     return redirect(url_for('index'))
