# AlgoVerse improvement sequence

Implement and review one PR at a time. The original 20-commit rollout is merged. This sequence
follows the custom Python assessment and prioritizes correctness before training or polish.

| Order | PR scope | Validation |
| --- | --- | --- |
| 1 | Custom execution reliability: reject unsupported entrypoints/results; fail errored, empty, or step-limited traces before lesson generation; invalidate old lesson cache | Real sandbox execution through the submission HTTP route with storage/model doubles; success regressions |
| 2 | Trace and snapshot fidelity: explicit value truncation, collection representations, stable references, return/mutation preservation and pre/post-line semantics | Edge-case traces and structural reconstruction tests |
| 3 | Conservative complexity analysis: recognize supported patterns and return unknown when evidence is insufficient | Factorial, search, sorting, recursion, built-in operations, and misleading-pattern regressions |
| 4 | Grounded lesson generation and evaluation: source/trace context, JSON-schema generation, semantic validation, bounded prompts, reviewed corpus and held-out algorithms | Execution, schema, narration/quiz factuality, and latency metrics tracked separately |
| 5 | Generic visualizer coverage: linked lists, sets/deques, matrices/DP, aliases/cycles, visible limits, explicit structure descriptors | Fixture-based visual and playback checks; generic fallback remains available |
| 6 | Responsive generation: background jobs, immediate deterministic playback, progress/cancellation, limits and failure recovery | Job lifecycle, cancellation, concurrency and reconnect tests |
| 7 | Public execution isolation: replace denylist-only assumptions with a hardened isolated runner | Threat-model-specific isolation tests before public untrusted execution |
| 8 | Mobile parity: richer visualizers, progress/rewards, sound assets, device verification | iOS/Android production exports and real device/simulator checks |
| 9, conditional | Model adaptation only if the improved baseline still has persistent narration/quiz deficiencies | Reviewed source/input/trace-to-lesson labels, separate held-out families, LoRA/QLoRA pilot compared against the baseline |

Public deployment depends on isolation work even if other features are complete. Dataset
candidates are MBPP, EvalPlus, CRUXEval, and execution-grounded reasoning resources; preserve
benchmark splits and verify data provenance before ingestion. Do not use unreviewed model
output as ground truth. Training does not fix execution, trace, or renderer defects.

PR 1 intentionally does not alter the lesson schema or add partial-execution playback. The
existing clients already display the backend's failure details. Historical saved lessons and
fixture-mode demos are unchanged; fresh backend submissions receive the new validation.
