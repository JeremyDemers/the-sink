#! /usr/bin/env python3
# pylint: disable=invalid-name

import os
import sys
import time
from typing import AnyStr

PATH = "/mnt/shared/uploads"


def write_stdout(s: AnyStr) -> None:
    # only eventlistener protocol messages may be sent to stdout
    sys.stdout.write(s)  # type: ignore
    sys.stdout.flush()


def write_stderr(s: AnyStr) -> None:
    sys.stderr.write(s)  # type: ignore
    sys.stderr.flush()


def main() -> None:
    while True:
        # transition from ACKNOWLEDGED to READY
        write_stdout("READY\n")

        # read header line and print it to stderr
        line = sys.stdin.readline()
        write_stderr(line)

        # read event payload and print it to stderr
        headers = dict([x.split(":") for x in line.split()])
        data = sys.stdin.read(int(headers["len"]))
        write_stderr(data)

        retention_period = time.time() - 86400  # 1 day in seconds.
        for file in os.listdir(PATH):
            file = os.path.join(PATH, file)

            try:
                # Remove files modified earlier than retention period
                if os.path.isfile(file) and os.stat(file).st_mtime < retention_period:
                    write_stderr(f"Removing: {file}")
                    os.remove(file)
            except OSError as error:
                write_stderr(f"Error: {file}: {error.strerror}")

        # transition from READY to ACKNOWLEDGED
        write_stdout("RESULT 2\nOK")


if __name__ == "__main__":
    main()
