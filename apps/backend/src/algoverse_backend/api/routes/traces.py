from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from algoverse_backend.api.deps import get_db_session
from algoverse_backend.db.repositories import get_execution_trace
from algoverse_backend.execution.models import ExecutionTrace

router = APIRouter()


@router.get("/traces/{submission_id}", response_model=ExecutionTrace)
async def get_trace_route(submission_id: UUID, session: AsyncSession = Depends(get_db_session)) -> ExecutionTrace:
    trace = await get_execution_trace(session, submission_id)
    if trace is None:
        raise HTTPException(status_code=404, detail="Trace not found")
    return trace
