from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field

class OrderItem(BaseModel):
    initialPrice: float = 0.0
    quantity: int = 1
    model_config = ConfigDict(extra="ignore")

class OrderData(BaseModel):
    id: int
    firstName: Optional[str] = ""
    lastName: Optional[str] = ""
    phone: Optional[str] = ""
    email: Optional[str] = ""
    status: Optional[str] = "new"
    totalSumm: Optional[float] = None
    items: List[OrderItem] = Field(default_factory=list)
    model_config = ConfigDict(extra="ignore")

    @property
    def calculated_total(self) -> float:
        if self.totalSumm is not None:
            return self.totalSumm
        return sum(item.initialPrice * item.quantity for item in self.items)
