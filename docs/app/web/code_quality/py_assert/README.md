# Python Assertions

Python's [assert](https://docs.python.org/3/reference/simple_stmts.html#the-assert-statement) statement allows adding [sanity checks](https://en.wikipedia.org/wiki/Sanity_check) to the code. These checks are known as assertions and used to test whether certain assumptions remain true while developing.

## Usage

### assert

```python
def get_name(data: dict) -> str | None:
    assert isinstance(data, dict), "The `data` must be a dict."
    name = data.get("name")
    assert isinstance(name, (str, type(None))), "The `data.name` must be of `str | None`."
    return name

# - Assertions ON: raises `AssertionError: The `data` must be a dict.`.
# - Assertions OFF: raises `AttributeError: 'NoneType' object has no attribute 'get'`.
get_name(None)

# - Assertions ON: raises `AssertionError: The `data.name` must be of `str | None`.`.
# - Assertions OFF: returns `1`.
get_name({"name": 1})

# - Assertions ON: returns `None`.
# - Assertions OFF: returns `None`.
get_name({})
```

### \_\_debug__

```python
if __debug__:
    raise RuntimeError()

print(1)
```

Running the above program with `python -O` or `PYTHONOPTIMIZE=1 python` will result in printing `1`. Doing so with `python` or `PYTHONOPTIMIZE=0 python` will raise the `RuntimeError`.

> [!CAUTION]
> The assertions slows down the app as they have an interpretation and execution costs.
>
> Consider this example:
> ```python
> from time import sleep
>
> # Mimicking the long-running operation here.
> assert sleep(3) is None
> ```
>
> Running the above program would take more than 3 seconds.

By default, the assertions are enabled only locally. On AWS instances the [Python's optimization](https://docs.python.org/3/using/cmdline.html#cmdoption-O) is [enabled on the AWS ECS container level](https://github.com/JeremyDemers/the-sink/blob/23db547a34b687b526d8ca1542f953149a450ba5/runtimes/python/3.10.Dockerfile#L17) for CLI and Gunicorn which positively affects the speed of the app by generating the bytecode with assertion statements stripped out (including the code inside the `__debug__` conditions).

## Disable the optimization on AWS

In case there is a need to run the assertions and the code within the `__debug__` conditions on AWS the Python's optimization can be disabled following these steps:
- Proceed to the [aws/Dockerfile](/aws/Dockerfile) of the project the optimization has to be disabled for.
- After the `FROM` instruction, place:
  ```dockerfile
  ENV PYTHONOPTIMIZE=0
  ```
- Create a PR, wait for the CI checks, merge it, and wait the deployment completion.

> [!CAUTION]
> It is highly recommended to enabled back the Python optimization after finishing the debugging on AWS. Do so by deleting the `ENV PYTHONOPTIMIZE=0` from the app's `Dockerfile`.

## Enable the optimization locally

There might be a need to locally test app's behavior having the Python's optimization turned on. This can be achieved following these steps:
- Proceed to the [docker-compose.yml](/docker-compose.yml).
- Find the `server` service and add to its `environment` section:
  ```yaml
  PYTHONOPTIMIZE: 1
  ```
- Run `slw restart server` in CLI within the project directory.
