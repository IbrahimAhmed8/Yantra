from terminal_chat import build_arg_parser, sanitize_for_console


def test_terminal_chat_parser_supports_once_and_goals() -> None:
    parser = build_arg_parser()
    args = parser.parse_args(
        [
            "--once",
            "hello",
            "--name",
            "Aarav",
            "--level",
            "Beginner",
            "--path",
            "Yantra AI",
            "--progress",
            "15",
            "--goal",
            "Ship the terminal chat",
        ]
    )

    assert args.once == "hello"
    assert args.name == "Aarav"
    assert args.level == "Beginner"
    assert args.current_path == "Yantra AI"
    assert args.progress == 15
    assert args.goal == ["Ship the terminal chat"]


def test_sanitize_for_console_replaces_unprintable_characters() -> None:
    assert sanitize_for_console("math \u2192 step", encoding="cp1252") == "math ? step"
