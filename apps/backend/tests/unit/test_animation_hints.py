import uuid

from algoverse_backend.execution.sandbox import run_in_sandbox
from algoverse_backend.lesson.animation_hints import derive_animation_hints

BUBBLE_SORT = (
    "def bubble_sort(items):\n"
    "    n = len(items)\n"
    "    for i in range(n):\n"
    "        for j in range(0, n - i - 1):\n"
    "            if items[j] > items[j + 1]:\n"
    "                items[j], items[j + 1] = items[j + 1], items[j]\n"
    "    return items\n"
)

BINARY_SEARCH = (
    "def binary_search(items, target):\n"
    "    low, high = 0, len(items) - 1\n"
    "    while low <= high:\n"
    "        mid = (low + high) // 2\n"
    "        if items[mid] == target:\n"
    "            return mid\n"
    "        if items[mid] < target:\n"
    "            low = mid + 1\n"
    "        else:\n"
    "            high = mid - 1\n"
    "    return -1\n"
)

FIBONACCI = (
    "def fibonacci_recursive(n):\n"
    "    if n <= 1:\n"
    "        return n\n"
    "    return fibonacci_recursive(n - 1) + fibonacci_recursive(n - 2)\n"
)


def _flat_hints(hints_by_step):
    return [h for hs in hints_by_step.values() for h in hs]


def test_bubble_sort_hints_include_every_real_swap():
    trace = run_in_sandbox(uuid.uuid4(), BUBBLE_SORT, "bubble_sort", [[5, 3, 1, 4, 2]])
    hints = derive_animation_hints("bubble_sort", BUBBLE_SORT, ["items"], trace.steps)
    swaps = [h for h in _flat_hints(hints) if h.kind == "swap"]
    compares = [h for h in _flat_hints(hints) if h.kind == "compare"]

    assert len(swaps) == 7  # bubbling [5,3,1,4,2] -> [1,2,3,4,5] takes exactly 7 adjacent swaps
    assert len(compares) >= len(swaps)
    for swap in swaps:
        i, j = swap.target_indices
        assert abs(i - j) == 1  # bubble sort only ever swaps adjacent elements


def test_binary_search_hints_narrow_toward_target():
    trace = run_in_sandbox(uuid.uuid4(), BINARY_SEARCH, "binary_search", [[1, 3, 5, 7, 9, 11], 7])
    hints = derive_animation_hints("binary_search", BINARY_SEARCH, ["items", "target"], trace.steps)
    flat = _flat_hints(hints)
    assert any(h.kind == "compare" for h in flat)
    assert any(h.kind == "pointer_move" for h in flat)


def test_generic_hints_detect_swap_for_non_recursive_custom_code():
    # Regression: a single top-level call/return pair (any non-recursive function) must not
    # be mistaken for recursion just because _derive_recursion_hints always finds *something*.
    source = (
        "def reverse_array(items):\n"
        "    left = 0\n"
        "    right = len(items) - 1\n"
        "    while left < right:\n"
        "        items[left], items[right] = items[right], items[left]\n"
        "        left += 1\n"
        "        right -= 1\n"
        "    return items\n"
    )
    trace = run_in_sandbox(uuid.uuid4(), source, "reverse_array", [[1, 2, 3, 4, 5]])
    hints = derive_animation_hints("custom", source, ["items"], trace.steps)
    flat = _flat_hints(hints)
    assert any(h.kind == "swap" for h in flat)
    assert not any(h.kind in ("recurse_in", "recurse_out") for h in flat)


def test_generic_hints_still_detect_real_recursion():
    trace = run_in_sandbox(uuid.uuid4(), FIBONACCI, "fibonacci_recursive", [5])
    hints = derive_animation_hints("custom", FIBONACCI, ["n"], trace.steps)
    flat = _flat_hints(hints)
    assert any(h.kind == "recurse_in" for h in flat)


def test_recursion_hints_are_balanced_in_and_out():
    trace = run_in_sandbox(uuid.uuid4(), FIBONACCI, "fibonacci_recursive", [5])
    hints = derive_animation_hints("fibonacci_recursive", FIBONACCI, ["n"], trace.steps)
    flat = _flat_hints(hints)
    ins = [h for h in flat if h.kind == "recurse_in"]
    outs = [h for h in flat if h.kind == "recurse_out"]
    assert len(ins) == len(outs)
    assert len(ins) > 0
