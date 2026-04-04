from typing import Literal

from pydantic import BaseModel, Field


class Message(BaseModel):
    role: Literal["user", "assistant", "system"]
    content: str = Field(min_length=1)


class StudentContext(BaseModel):
    name: str = "Learner"
    skill_level: str = "Beginner"
    current_path: str = "AI Foundations"
    current_surface: str = "Yantra Dashboard"
    progress: int = Field(default=0, ge=0, le=100)
    learning_goals: list[str] = Field(default_factory=list)
    current_focus: str = ""
    path_description: str = ""
    recommended_action_title: str = ""
    recommended_action_description: str = ""
    strongest_skills: list[str] = Field(default_factory=list)
    active_rooms: list[str] = Field(default_factory=list)
    memory_summary: str = ""
    approved_learner_summary: str = ""
    approved_import_facts: dict[str, object] | None = None


class ChatRequest(BaseModel):
    messages: list[Message]
    student: StudentContext = Field(default_factory=StudentContext)
    top_k: int = Field(default=3, ge=1, le=8)


class SourceSnippet(BaseModel):
    title: str
    path: str
    score: float
    excerpt: str


class ChatResponse(BaseModel):
    reply: str
    intent: str
    context_used: bool
    retrieval_mode: str
    provider: str
    model_used: str | None = None
    sources: list[SourceSnippet]


class DashboardRecommendationRequest(BaseModel):
    student: StudentContext = Field(default_factory=StudentContext)


class DashboardRecommendationResponse(BaseModel):
    title: str
    description: str
    prompt: str
    provider: str
    model_used: str | None = None


class ApprovedFactsNormalized(BaseModel):
    target_goals: list[str] = Field(default_factory=list)
    inferred_skill_level: Literal["Beginner", "Intermediate", "Advanced"] | None = None
    prior_projects: list[str] = Field(default_factory=list)
    topics_of_interest: list[str] = Field(default_factory=list)
    time_availability: Literal["Light", "Focused", "Intensive"] | None = None
    preferred_learning_style: list[str] = Field(default_factory=list)
    constraints: list[str] = Field(default_factory=list)


class ApprovedFacts(BaseModel):
    confirmed_facts: list[str] = Field(default_factory=list)
    likely_preferences: list[str] = Field(default_factory=list)
    uncertain_inferences: list[str] = Field(default_factory=list)
    missing_information: list[str] = Field(default_factory=list)
    normalized: ApprovedFactsNormalized = Field(default_factory=ApprovedFactsNormalized)


class PersonalizationExtractRequest(BaseModel):
    source_provider: Literal["chatgpt", "gemini", "other"]
    source_summary: str = Field(min_length=1, max_length=12000)


class PersonalizationExtractResponse(BaseModel):
    source_provider: Literal["chatgpt", "gemini", "other"]
    source_prompt_version: str
    approved_facts: ApprovedFacts
    learner_summary: str
    confidence_summary: str
    assumptions: list[str] = Field(default_factory=list)
    provider: str
    model_used: str | None = None


class DashboardGenerationProfile(BaseModel):
    name: str = "Learner"
    skill_level: Literal["Beginner", "Intermediate", "Advanced"] = "Beginner"
    progress: int = Field(default=0, ge=0, le=100)
    user_role: str | None = None
    age_range: str | None = None
    primary_learning_goals: list[str] = Field(default_factory=list)
    learning_pace: Literal["Light", "Focused", "Intensive"] | None = None


class DashboardGenerationPersonalization(BaseModel):
    learner_summary: str = ""
    approved_facts: ApprovedFacts | None = None


class DashboardGenerationRequest(BaseModel):
    profile: DashboardGenerationProfile = Field(default_factory=DashboardGenerationProfile)
    personalization: DashboardGenerationPersonalization | None = None


class GeneratedDashboardPath(BaseModel):
    path_title: str
    path_description: str
    path_status_label: str
    path_progress: int = Field(ge=0, le=100)
    current_focus: str
    recommended_action_title: str
    recommended_action_description: str
    recommended_action_prompt: str
    learning_track_title: str
    learning_track_description: str
    completion_estimate_label: str
    mastery_progress: int = Field(ge=0, le=100)
    mastery_unlocked_count: int = Field(ge=0)
    mastery_total_count: int = Field(ge=0)
    next_session_date_day: str
    next_session_date_month: str
    next_session_title: str
    next_session_day_label: str
    next_session_time_label: str
    next_session_instructor_name: str
    next_session_instructor_role: str
    next_session_instructor_image_url: str
    weekly_completed_sessions: int = Field(ge=0)
    weekly_change_label: str
    momentum_summary: str
    focus_summary: str
    consistency_summary: str


class GeneratedDashboardSkill(BaseModel):
    skill_key: str
    title: str
    description: str
    level_label: str
    progress: int | None = Field(default=None, ge=0, le=100)
    icon_key: Literal["python", "logic", "ml", "data", "networks", "prompt"] | None = None
    tone_key: Literal["primary", "soft", "muted"] | None = None
    locked: bool | None = None
    sort_order: int | None = Field(default=None, ge=0)


class GeneratedDashboardCurriculumNode(BaseModel):
    node_key: str
    module_label: str
    title: str
    description: str
    status_label: str
    unlocked: bool | None = None
    sort_order: int | None = Field(default=None, ge=0)


class GeneratedDashboardRoom(BaseModel):
    room_key: str
    title: str
    description: str
    status_label: str
    cta_label: str
    prompt: str
    featured: bool
    texture_key: Literal["python-room", "neural-builder", "data-explorer", "prompt-lab"]
    sort_order: int = Field(ge=0)


class GeneratedDashboardWeeklyActivity(BaseModel):
    day_key: str
    day_label: str
    container_height: int = Field(ge=0)
    fill_height: int = Field(ge=0, le=100)
    highlighted: bool
    sort_order: int = Field(ge=0)


class RecommendedAction(BaseModel):
    title: str
    description: str
    prompt: str


class DashboardGenerationResponse(BaseModel):
    learner_summary: str
    recommended_track: str
    recommended_action: RecommendedAction
    confidence_summary: str
    assumptions: list[str] = Field(default_factory=list)
    path: GeneratedDashboardPath
    skills: list[GeneratedDashboardSkill] = Field(default_factory=list)
    curriculum_nodes: list[GeneratedDashboardCurriculumNode] = Field(default_factory=list)
    recommended_rooms: list[GeneratedDashboardRoom] = Field(default_factory=list)
    weekly_activity: list[GeneratedDashboardWeeklyActivity] = Field(default_factory=list)
    provider: str
    model_used: str | None = None
