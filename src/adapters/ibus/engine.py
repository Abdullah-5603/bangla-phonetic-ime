#!/usr/bin/env python3
"""
Prototype IBus engine placeholder.

This file intentionally keeps IBus-specific code outside the Node engine core.
It documents the future bridge shape and can be expanded during desktop testing.
"""

import sys


def main():
    if "--status" in sys.argv:
        print("bangla-avro-ime ibus prototype: not registered")
        return

    print("This is a prototype IBus engine boundary, not a production engine.")


if __name__ == "__main__":
    main()
