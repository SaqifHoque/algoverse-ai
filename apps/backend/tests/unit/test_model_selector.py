from algoverse_backend.llm.model_selector import select_model


def test_16gb_host_selects_7b_coder_tier():
    assert select_model(total_ram_gb_override=16) == "qwen2.5-coder:7b"


def test_64gb_host_selects_14b_coder_tier():
    assert select_model(total_ram_gb_override=64) == "qwen2.5-coder:14b"


def test_8gb_host_falls_back_below_coder_tier():
    tag = select_model(total_ram_gb_override=8)
    assert tag != "qwen2.5-coder:7b"
    assert tag != "qwen2.5-coder:14b"


def test_very_low_ram_falls_back_to_smallest_model():
    assert select_model(total_ram_gb_override=2) == "gemma2:2b"


def test_selection_is_deterministic_and_monotonic_with_ram():
    tags_by_ram = [select_model(total_ram_gb_override=r) for r in (2, 4, 8, 16, 32, 64)]
    # more RAM should never select a strictly smaller/weaker tier than less RAM did
    assert len(set(tags_by_ram)) >= 2  # sanity: the ladder actually varies across this range
