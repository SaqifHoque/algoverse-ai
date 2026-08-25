from fastapi import APIRouter, Depends

from algoverse_backend.api.deps import get_model_tag, get_planner
from algoverse_backend.api.schemas import ModelStatusResponse
from algoverse_backend.llm.model_selector import selection_reason, total_ram_gb
from algoverse_backend.llm.ollama_client import OllamaLessonPlanner

router = APIRouter()


@router.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}


@router.get("/health/model", response_model=ModelStatusResponse)
async def health_model(
    planner: OllamaLessonPlanner = Depends(get_planner),
    model_tag: str = Depends(get_model_tag),
) -> ModelStatusResponse:
    health = planner.health_check()
    return ModelStatusResponse(
        model_tag=model_tag,
        reachable=health.reachable,
        total_ram_gb=round(total_ram_gb(), 1),
        selection_reason=selection_reason(),
    )
