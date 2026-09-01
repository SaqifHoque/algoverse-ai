from algoverse_backend.gamification import completion_xp, earned_badges, level_for_xp


def test_completion_xp_rewards_difficulty_and_score():
    assert completion_xp(80, "beginner") == 130
    assert completion_xp(80, "intermediate") == 155
    assert completion_xp(80, "advanced") == 180


def test_level_increases_every_250_xp():
    assert level_for_xp(0) == 1
    assert level_for_xp(249) == 1
    assert level_for_xp(250) == 2


def test_badges_follow_progress_milestones():
    badges = earned_badges(scores=[100, 80, 90, 70, 60], total_xp=1_050)
    assert [badge.id for badge in badges] == [
        "first_steps",
        "perfect_score",
        "dedicated_learner",
        "xp_explorer",
    ]


def test_no_progress_earns_no_badges():
    assert earned_badges(scores=[], total_xp=0) == []
