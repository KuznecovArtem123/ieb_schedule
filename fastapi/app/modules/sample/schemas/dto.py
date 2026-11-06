from pydantic import BaseModel, Field


class ItemCreateDTO(BaseModel):
    """Данные на вход при создании (DTO)"""
    title: str = Field(..., min_length=1, max_length=100, examples=["Тестовая запись"])
    description: str | None = Field(None, examples=["Подробное описание"])


class ItemUpdateDTO(BaseModel):
    """Данные на вход при обновлении (DTO)"""
    title: str | None = Field(None, min_length=1, max_length=100)
    description: str | None = None
