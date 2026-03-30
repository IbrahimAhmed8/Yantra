import os

from yantra_ai.core.config import get_settings

os.environ["YANTRA_EMBEDDING_BACKEND"] = "lexical"
os.environ["YANTRA_CHAT_PROVIDER"] = "local"
get_settings.cache_clear()
