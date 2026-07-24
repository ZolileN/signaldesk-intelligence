from typing import List, Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field
import uuid

# Ontology imports
from packages.ontology import (
    SourceType,
    ContentType,
    ProcessingStatus,
    ClaimType,
    VerificationStatus,
    EntityType,
    EventStatus,
    SituationType,
    SituationStatus,
    TrajectoryDirection,
    SeverityLevel,
    AlertLevel,
    ExposureType,
)

class SourceCreate(BaseModel):
    name: str
    source_type: SourceType
    country_code: Optional[str] = None
    language_codes: List[str] = Field(default_factory=list)
    url: Optional[str] = None
    reliability_score: Optional[float] = 0.85

class SourceSchema(SourceCreate):
    id: str
    active: bool = True
    created_at: datetime

class ObservationCreate(BaseModel):
    source_id: str
    content_type: ContentType
    title: Optional[str] = None
    raw_content: Optional[str] = None
    transcript: Optional[str] = None
    source_url: Optional[str] = None
    published_at: Optional[datetime] = None
    language_code: Optional[str] = "en"
    country_code: Optional[str] = "ZA"
    metadata: Dict[str, Any] = Field(default_factory=dict)

class ObservationSchema(ObservationCreate):
    id: str
    captured_at: datetime
    content_hash: str
    processing_status: ProcessingStatus

class EntityCreate(BaseModel):
    canonical_name: str
    entity_type: EntityType
    description: Optional[str] = None
    country_code: Optional[str] = None
    aliases: List[str] = Field(default_factory=list)
    confidence_score: float = 0.90

class EntitySchema(EntityCreate):
    id: str

class ClaimCreate(BaseModel):
    observation_id: str
    claim_text: str
    claim_type: ClaimType
    claimant_entity_id: Optional[str] = None
    verification_status: VerificationStatus = VerificationStatus.UNVERIFIED
    confidence_score: float = 0.80

class ClaimSchema(ClaimCreate):
    id: str

class EventCreate(BaseModel):
    event_type: str
    title: str
    description: Optional[str] = None
    start_time: Optional[datetime] = None
    severity: SeverityLevel = SeverityLevel.MEDIUM
    confidence_score: float = 0.85
    observation_ids: List[str] = Field(default_factory=list)
    entity_roles: List[Dict[str, str]] = Field(default_factory=list) # [{"entity_id": "...", "role": "ACTOR"}]

class EventSchema(EventCreate):
    id: str
    status: EventStatus = EventStatus.DETECTED
    created_at: datetime

class TrajectorySnapshotSchema(BaseModel):
    trajectory: TrajectoryDirection
    trajectory_score: float
    event_frequency_delta: float
    severity_score: float
    actor_expansion_score: float
    geographic_expansion_score: float
    explanation: str
    recorded_at: datetime

class CustomerAssetCreate(BaseModel):
    organisation_id: str
    asset_type: str
    name: str
    location_name: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    metadata: Dict[str, Any] = Field(default_factory=dict)

class CustomerAssetSchema(CustomerAssetCreate):
    id: str

class ExposureSchema(BaseModel):
    id: str
    organisation_id: str
    situation_id: str
    asset_id: Optional[str] = None
    asset_name: Optional[str] = None
    exposure_type: ExposureType
    exposure_score: float
    impact_score: float
    probability_score: float
    explanation: str

class RecommendationSchema(BaseModel):
    id: str
    organisation_id: str
    situation_id: str
    exposure_id: Optional[str] = None
    recommendation_text: str
    urgency: AlertLevel
    reason: str
    evidence_ids: List[str] = Field(default_factory=list)
    confidence_score: float

# The 8-Question Intelligence Response Model
class EightQuestionIntelligenceResponse(BaseModel):
    situation_id: str
    title: str

    # 1. WHAT IS HAPPENING?
    what_is_happening: Dict[str, Any] = Field(
        description="Summary, status, key events, latest developments"
    )

    # 2. IS IT GETTING WORSE OR BETTER?
    trajectory_analysis: Dict[str, Any] = Field(
        description="Direction (STABLE/ESCALATING/etc), score, time-series metrics, calculation metrics"
    )

    # 3. WHERE IS IT HAPPENING?
    where_is_it_happening: Dict[str, Any] = Field(
        description="Countries, provinces, cities, facilities, spatial scope"
    )

    # 4. WHO IS INVOLVED?
    who_is_involved: List[Dict[str, Any]] = Field(
        description="Actors, targets, responders, regulators, communities, companies with assigned roles"
    )

    # 5. WHAT IS DRIVING IT?
    what_is_driving_it: Dict[str, Any] = Field(
        description="Immediate triggers, structural, economic, political drivers vs hypotheses"
    )

    # 6. WHAT HAPPENS NEXT?
    what_happens_next: Dict[str, Any] = Field(
        description="Observed facts, analytical inferences, forecasts, scenarios"
    )

    # 7. HOW AM I EXPOSED?
    how_am_i_exposed: List[Dict[str, Any]] = Field(
        description="Customer specific operational, financial, security, regulatory exposures"
    )

    # 8. WHAT SHOULD I DO?
    what_should_i_do: List[Dict[str, Any]] = Field(
        description="Actionable recommendations with urgency, rationale, and confidence"
    )
