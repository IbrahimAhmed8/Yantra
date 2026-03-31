from __future__ import annotations

import argparse
import os
import subprocess
import sys
from collections.abc import Sequence

from dotenv import load_dotenv

from yantra_ai.core.config import get_settings
from yantra_ai.core.rag import build_vector_index
from yantra_ai.core.service import ChatService
from yantra_ai.core.rag import warmup_retrieval
from yantra_ai.schemas.chat import ChatRequest, Message, StudentContext


HELP_TEXT = """Yantra terminal chat commands:
  /help                 Show commands
  /login                Run `gh auth login`
  /logout               Run `gh auth logout --hostname github.com`
  /status               Show GitHub auth status
  /provider             Show or override the current provider mode
  /provider local       Force fully local replies
  /provider copilot     Enable Copilot-backed replies
  /provider ring        Enable the Groq/Gemini/GitHub Models provider ring
  /speed                Show or override the current speed mode
  /speed fast           Keep fast local shortcuts enabled
  /speed full           Disable fast local shortcuts
  /reindex              Rebuild the local vector index
  /clear                Clear the current conversation
  /student              Show current student context
  /name <value>         Set student name
  /level <value>        Set skill level
  /path <value>         Set current learning path
  /progress <0-100>     Set progress percentage
  /goal add <text>      Add a learning goal
  /goal clear           Clear learning goals
  /exit                 Exit the chat

Anything else is sent to Yantra.
"""


def sanitize_for_console(text: str, *, encoding: str | None = None) -> str:
    target_encoding = encoding or sys.stdout.encoding or "utf-8"
    return text.encode(target_encoding, errors="replace").decode(target_encoding, errors="replace")


class TerminalChatApp:
    def __init__(self, student: StudentContext) -> None:
        self.student = student
        self.service = ChatService()
        self.messages: list[Message] = []

    def run(self) -> int:
        self._print_banner()

        while True:
            try:
                raw = input("\nyou> ").strip()
            except (EOFError, KeyboardInterrupt):
                print("\nExiting Yantra terminal chat.")
                return 0

            if not raw:
                continue

            if raw.startswith("/"):
                should_exit = self._handle_command(raw)
                if should_exit:
                    return 0
                continue

            self._chat_once(raw)

    def chat_once(self, prompt: str) -> int:
        self._chat_once(prompt)
        return 0

    def _chat_once(self, prompt: str) -> None:
        request = ChatRequest(messages=[*self.messages, Message(role="user", content=prompt)], student=self.student)
        response = self.service.reply(request)

        self.messages.append(Message(role="user", content=prompt))
        self.messages.append(Message(role="assistant", content=response.reply))

        header = f"yantra [{response.provider}"
        if response.model_used:
            header += f"/{response.model_used}"
        header += f", {response.retrieval_mode}]"

        print(sanitize_for_console(f"\n{header}> {response.reply}"))
        if response.sources:
            source_text = ", ".join(source.title for source in response.sources[:3])
            print(sanitize_for_console(f"sources> {source_text}"))

    def _handle_command(self, raw: str) -> bool:
        parts = raw.split()
        command = parts[0].lower()
        args = parts[1:]

        if command in {"/exit", "/quit"}:
            print("Exiting Yantra terminal chat.")
            return True

        if command == "/help":
            print(HELP_TEXT)
            return False

        if command == "/login":
            self._run_external(["gh", "auth", "login"])
            return False

        if command == "/logout":
            self._run_external(["gh", "auth", "logout", "--hostname", "github.com"])
            return False

        if command == "/status":
            self._run_external(["gh", "auth", "status"])
            return False

        if command == "/provider":
            if not args:
                self._print_provider_state()
                return False

            provider = args[0].lower()
            if provider == "local":
                self._reload_service(chat_provider="local")
                print("Provider set to local.")
                self._print_provider_state()
                return False
            if provider in {"copilot", "copilot-cli"}:
                self._reload_service(chat_provider="copilot-cli")
                print("Provider set to copilot-cli.")
                self._print_provider_state()
                return False
            if provider == "ring":
                self._reload_service(chat_provider="ring")
                print("Provider set to ring.")
                self._print_provider_state()
                return False

            print("Usage: /provider [local|copilot|ring]")
            return False

        if command == "/speed":
            if not args:
                self._print_provider_state()
                return False

            mode = args[0].lower()
            if mode == "fast":
                self._reload_service(fast_responses=True)
                print("Fast local shortcuts enabled.")
                self._print_provider_state()
                return False
            if mode == "full":
                self._reload_service(fast_responses=False)
                print("Fast local shortcuts disabled.")
                self._print_provider_state()
                return False

            print("Usage: /speed [fast|full]")
            return False

        if command == "/reindex":
            vector_index = build_vector_index(force=True)
            print(
                f"Rebuilt local vector index with {len(vector_index.chunks)} chunks using "
                f"{vector_index.model_name}."
            )
            return False

        if command == "/clear":
            self.messages.clear()
            print("Conversation cleared.")
            return False

        if command == "/student":
            goals = ", ".join(self.student.learning_goals) if self.student.learning_goals else "(none)"
            print(
                "\n".join(
                    [
                        f"name: {self.student.name}",
                        f"level: {self.student.skill_level}",
                        f"path: {self.student.current_path}",
                        f"progress: {self.student.progress}",
                        f"goals: {goals}",
                    ]
                )
            )
            return False

        if command == "/name":
            if not args:
                print("Usage: /name <value>")
                return False
            self.student.name = " ".join(args)
            print(f"Student name set to {self.student.name}.")
            return False

        if command == "/level":
            if not args:
                print("Usage: /level <value>")
                return False
            self.student.skill_level = " ".join(args)
            print(f"Skill level set to {self.student.skill_level}.")
            return False

        if command == "/path":
            if not args:
                print("Usage: /path <value>")
                return False
            self.student.current_path = " ".join(args)
            print(f"Current path set to {self.student.current_path}.")
            return False

        if command == "/progress":
            if len(args) != 1:
                print("Usage: /progress <0-100>")
                return False
            try:
                value = int(args[0])
            except ValueError:
                print("Progress must be a number between 0 and 100.")
                return False
            if value < 0 or value > 100:
                print("Progress must be a number between 0 and 100.")
                return False
            self.student.progress = value
            print(f"Progress set to {self.student.progress}.")
            return False

        if command == "/goal":
            if not args:
                print("Usage: /goal add <text> | /goal clear")
                return False
            action = args[0].lower()
            if action == "add" and len(args) > 1:
                goal = " ".join(args[1:])
                self.student.learning_goals.append(goal)
                print(f"Added goal: {goal}")
                return False
            if action == "clear":
                self.student.learning_goals.clear()
                print("Learning goals cleared.")
                return False
            print("Usage: /goal add <text> | /goal clear")
            return False

        print("Unknown command. Type /help.")
        return False

    def _print_banner(self) -> None:
        print("Yantra Terminal Chat")
        print("Default mode uses local embeddings and the provider ring. No website involved.")
        print("Type /help for commands.")
        print("")
        self._print_provider_state()
        self._run_external(["gh", "auth", "status"], allow_failure=True)

    def _run_external(self, command: list[str], *, allow_failure: bool = False) -> None:
        try:
            completed = subprocess.run(command, check=False)
        except FileNotFoundError:
            print(f"Command not found: {command[0]}")
            return

        if completed.returncode != 0 and not allow_failure:
            print(f"Command failed with exit code {completed.returncode}.")

    def _reload_service(
        self,
        *,
        chat_provider: str | None = None,
        fast_responses: bool | None = None,
    ) -> None:
        if chat_provider is not None:
            os.environ["YANTRA_CHAT_PROVIDER"] = chat_provider
        if fast_responses is not None:
            os.environ["YANTRA_FAST_RESPONSES"] = "true" if fast_responses else "false"

        get_settings.cache_clear()
        self.service = ChatService()

    def _print_provider_state(self) -> None:
        settings = self.service.settings
        parts = [
            f"provider={settings.chat_provider}",
            f"fast_responses={str(settings.fast_responses).lower()}",
        ]

        if settings.chat_provider == "ring":
            configured_lanes = [
                lane_name
                for lane_name in settings.provider_chain
                if (lane := settings.provider_lane(lane_name)) is not None and lane.api_key
            ]
            parts.append(f"configured_lanes={len(configured_lanes)}/{len(settings.provider_chain)}")

        print(f"mode> {', '.join(parts)}")
        if settings.chat_provider == "ring" and not any(
            (lane := settings.provider_lane(lane_name)) is not None and lane.api_key
            for lane_name in settings.provider_chain
        ):
            print("warning> provider ring has no upstream API keys configured.")


def build_arg_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Yantra terminal chat without the website.")
    parser.add_argument("--once", help="Send one message and exit.")
    parser.add_argument("--name", default="Learner", help="Student name.")
    parser.add_argument("--level", default="Beginner", help="Student skill level.")
    parser.add_argument("--path", dest="current_path", default="AI Foundations", help="Current learning path.")
    parser.add_argument("--progress", type=int, default=0, help="Progress percentage.")
    parser.add_argument(
        "--goal",
        action="append",
        default=[],
        help="Add a learning goal. Can be used multiple times.",
    )
    return parser


def main(argv: Sequence[str] | None = None) -> int:
    load_dotenv()
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(errors="replace")
    if hasattr(sys.stderr, "reconfigure"):
        sys.stderr.reconfigure(errors="replace")
    parser = build_arg_parser()
    args = parser.parse_args(argv)

    student = StudentContext(
        name=args.name,
        skill_level=args.level,
        current_path=args.current_path,
        progress=args.progress,
        learning_goals=list(args.goal),
    )
    try:
        warmup_retrieval(get_settings())
    except Exception as exc:
        print(sanitize_for_console(f"warmup> skipped ({exc})"))
    app = TerminalChatApp(student)

    if args.once:
        return app.chat_once(args.once)

    return app.run()


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
