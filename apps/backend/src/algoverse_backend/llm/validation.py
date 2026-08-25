from typing import TypeVar

from pydantic import BaseModel, TypeAdapter

T = TypeVar("T")


def parse_as(target: type[BaseModel] | TypeAdapter, raw: str) -> object:
    """Accepts either a Pydantic BaseModel subclass or a pre-built TypeAdapter (for generic
    types like list[SomeModel] that aren't themselves BaseModels). Raises json.JSONDecodeError
    or pydantic.ValidationError on failure -- callers drive the retry loop."""
    if isinstance(target, TypeAdapter):
        return target.validate_json(raw)
    return target.model_validate_json(raw)
