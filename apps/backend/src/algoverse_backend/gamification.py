from dataclasses import dataclass

from algoverse_backend.lesson.schema import Difficulty


@dataclass(frozen=True)
class Badge:
    id: str
    name: str
    description: str


BADGES = {
    "first_steps": Badge("first_steps", "First Steps", "Complete your first lesson."),
    "perfect_score": Badge("perfect_score", "Perfect Score", "Earn 100% on a lesson quiz."),
    "dedicated_learner": Badge("dedicated_learner", "Dedicated Learner", "Complete five lessons."),
    "xp_explorer": Badge("xp_explorer", "XP Explorer", "Earn 1,000 XP."),
}

BASE_XP: dict[Difficulty, int] = {
    "beginner": 50,
    "intermediate": 75,
    "advanced": 100,
}


def completion_xp(score: int, difficulty: Difficulty) -> int:
    """Award predictable XP from difficulty and the learner's best quiz score."""
    return BASE_XP[difficulty] + score


def level_for_xp(total_xp: int) -> int:
    return total_xp // 250 + 1


def earned_badges(*, scores: list[int], total_xp: int) -> list[Badge]:
    badges: list[Badge] = []
    if scores:
        badges.append(BADGES["first_steps"])
    if any(score == 100 for score in scores):
        badges.append(BADGES["perfect_score"])
    if len(scores) >= 5:
        badges.append(BADGES["dedicated_learner"])
    if total_xp >= 1_000:
        badges.append(BADGES["xp_explorer"])
    return badges
