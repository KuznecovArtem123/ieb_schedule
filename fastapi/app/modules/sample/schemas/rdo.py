import uuid
from datetime import datetime
from pydantic import BaseModel, ConfigDict


class ItemRDO(BaseModel):
    """Данные на выход клиенту (RDO / Response model)"""
    id: uuid.UUID
    title: str
    description: str | None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
