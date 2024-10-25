from api.principal.role import Role


PERMISSIONS_BY_ROLE = {
    Role.ADMIN: tuple(
        sorted(
            (
                "view users",
                "edit users",
                "create users",
                "delete users",
                "view projects",
                "edit projects",
                "create projects",
                "delete projects",
            ),
        ),
    ),
    Role.SCIENTIST: tuple(
        sorted(
            (
                "view projects",
                "edit projects",
                "create projects",
            ),
        ),
    ),
    Role.AUTHENTICATED: tuple(
        sorted(
            ("view projects",),
        ),
    ),
}
