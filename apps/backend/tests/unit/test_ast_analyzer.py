import pytest

from algoverse_backend.analysis.ast_analyzer import UnsafeCodeError, analyze, static_safety_check

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

MEMOIZED_FIBONACCI = (
    "from functools import lru_cache\n\n"
    "@lru_cache\n"
    "def fibonacci_recursive(n):\n"
    "    if n <= 1:\n"
    "        return n\n"
    "    return fibonacci_recursive(n - 1) + fibonacci_recursive(n - 2)\n"
)


def test_bubble_sort_detects_nested_loops_and_quadratic_complexity():
    info = analyze(BUBBLE_SORT, "bubble_sort")
    assert info.entrypoint_function.max_loop_nesting == 2
    assert not info.entrypoint_function.is_recursive
    assert "n^2" in info.complexity_hint


def test_binary_search_detects_single_loop_and_linear_complexity():
    info = analyze(BINARY_SEARCH, "binary_search")
    assert info.entrypoint_function.max_loop_nesting == 1
    assert not info.entrypoint_function.is_recursive
    assert info.complexity_hint.startswith("O(n)")


def test_fibonacci_detects_recursion_without_memoization():
    info = analyze(FIBONACCI, "fibonacci_recursive")
    assert info.entrypoint_function.is_recursive
    assert "2^n" in info.complexity_hint
    assert "no caching decorator" in info.complexity_basis


def test_memoized_fibonacci_is_not_flagged_as_naive():
    info = analyze(MEMOIZED_FIBONACCI, "fibonacci_recursive")
    assert info.entrypoint_function.is_recursive
    assert "2^n" not in info.complexity_hint


def test_missing_entrypoint_raises():
    with pytest.raises(ValueError):
        analyze(BUBBLE_SORT, "does_not_exist")


@pytest.mark.parametrize(
    "source",
    [
        "import os\ndef f():\n    os.system('ls')\n",
        "import subprocess\ndef f():\n    subprocess.run(['ls'])\n",
        "def f():\n    return eval('1+1')\n",
        "def f():\n    return open('/etc/passwd').read()\n",
    ],
)
def test_static_safety_check_rejects_dangerous_code(source):
    with pytest.raises(UnsafeCodeError):
        static_safety_check(source)


def test_static_safety_check_allows_pure_algorithm_code():
    static_safety_check(BUBBLE_SORT)  # should not raise
