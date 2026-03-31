from __future__ import annotations

from pathlib import Path
import os
import shutil
import subprocess

from yantra_ai.core.config import Settings, get_settings
from yantra_ai.schemas.chat import Message


class CopilotCliError(RuntimeError):
    """Raised when the Copilot CLI provider cannot generate a response."""


class CopilotCliClient:
    def __init__(self, settings: Settings) -> None:
        self.settings = settings

    def is_available(self) -> bool:
        return shutil.which(self.settings.copilot_command) is not None

    def generate(
        self,
        *,
        system_prompt: str,
        messages: list[Message],
        knowledge_dir: Path,
    ) -> str:
        if not self.is_available():
            raise CopilotCliError("Copilot CLI is not installed or not on PATH.")

        env = os.environ.copy()
        token = (
            env.get("COPILOT_GITHUB_TOKEN")
            or env.get("GH_TOKEN")
            or env.get("GITHUB_TOKEN")
            or self._read_gh_token()
        )
        if not token:
            raise CopilotCliError("No GitHub authentication token is available for Copilot CLI.")

        env["GH_TOKEN"] = token
        env["COPILOT_GITHUB_TOKEN"] = token
        env.setdefault("HF_HUB_DISABLE_SYMLINKS_WARNING", "1")

        prompt = self._build_prompt(system_prompt=system_prompt, messages=messages)
        command = [
            self.settings.copilot_command,
            "-p",
            prompt,
            "--model",
            self.settings.copilot_model,
            "--output-format",
            "text",
            "--silent",
            "--disable-builtin-mcps",
            "--no-custom-instructions",
        ]

        completed = subprocess.run(
            command,
            cwd=knowledge_dir,
            env=env,
            capture_output=True,
            text=True,
            encoding="utf-8",
            errors="replace",
            timeout=self.settings.copilot_timeout_s,
        )
        if completed.returncode != 0:
            raise CopilotCliError((completed.stderr or completed.stdout).strip() or "Copilot CLI failed.")

        output = completed.stdout.strip().replace("—", "-")
        if not output:
            raise CopilotCliError("Copilot CLI returned an empty response.")

        return output

    def _read_gh_token(self) -> str | None:
        gh = shutil.which("gh")
        if gh is None:
            return None

        completed = subprocess.run(
            [gh, "auth", "token"],
            capture_output=True,
            text=True,
            encoding="utf-8",
            errors="replace",
            timeout=10,
        )
        if completed.returncode != 0:
            return None

        return completed.stdout.strip() or None

    def _build_prompt(self, *, system_prompt: str, messages: list[Message]) -> str:
        conversation = []
        for message in messages[-4:]:
            conversation.append(f"{message.role.upper()}: {message.content}")

        return "\n\n".join(
            [
                system_prompt,
                "Answer only as Yantra. Use only the provided context and conversation.",
                "Default to a concise reply under 120 words unless the user explicitly asks for more depth.",
                "Conversation:",
                "\n".join(conversation),
                "Return only the final assistant reply.",
            ]
        )


def get_copilot_cli_client(settings: Settings | None = None) -> CopilotCliClient:
    return CopilotCliClient(settings or get_settings())
