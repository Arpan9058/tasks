We need deterministic evaluators for agent behavior in `pydantic_evals`. Agent runs already expose an OpenTelemetry span tree through `EvaluatorContext.span_tree`, so these evaluators should inspect that data directly and must not make model calls.

Add five public evaluators—`ToolCorrectness`, `TrajectoryMatch`, `ArgumentCorrectness`, `MaxToolCalls`, and `MaxModelRequests`—and make them importable from `pydantic_evals.evaluators`. Export their public typing aliases `TrajectoryOrder`, `ArgumentMatchMode`, and `ArgumentOccurrence` from the same package. The evaluator classes must also be recognized by the dataset loader as built-in evaluator types, preserving the existing built-in ordering with the new types between `HasMatchingSpan` and `GEval`.

All five evaluators return `EvaluationReason` and support the normal `evaluation_name` override. Their default evaluation names are their class names.

## Tool and request extraction

Tool calls come from all matching nodes in the span tree, including calls made by nested agents, and are ordered by span start time. Support both instrumentation formats:

- v2: span name `running tool`, arguments in `tool_arguments`
- v3+: span name beginning with `execute_tool `, arguments in `gen_ai.tool.call.arguments`

Both formats identify the tool with the `gen_ai.tool.name` attribute. Ignore spans whose tool name is not a string, unrelated spans, output-function spans, and calls marked as deferred by `pydantic_ai.tool.deferral.name`.

Failed tool executions are spans with status `error`. `ToolCorrectness`, `TrajectoryMatch`, and `ArgumentCorrectness` exclude them by default; `MaxToolCalls` includes them by default because failed attempts consume budget. Each evaluator that counts or inspects tools accepts `include_failed` to override its default.

If the span tree was not recorded, evaluators must return a failing result rather than raising. `TrajectoryMatch` returns the float score `0.0`; the other four return `False`. The reason should explain that Logfire instrumentation is required.

## Evaluator behavior

`ToolCorrectness(expected_tools, allow_extra=False, include_failed=False)` compares tool-name multisets. It passes when every expected occurrence was called and, unless `allow_extra` is enabled, no unexpected occurrence was called. Failure diagnostics must separately identify missing and unexpected names with their occurrence counts. Empty expected and actual multisets pass.

`TrajectoryMatch(expected_trajectory, order='in_order', include_failed=False)` always returns a float:

- `exact`: `1.0` only when the sequences are identical, otherwise `0.0`.
- `in_order`: compute precision and recall from the longest common subsequence length, then return their F1 score.
- `any_order`: compute precision and recall from the size of the multiset intersection, then return their F1 score.

For either F1 mode, two empty trajectories score `1.0`; if only one is empty, the score is `0.0`. Diagnostics for `in_order` and `any_order` must report the matching count, precision, recall, and F1 (rounded to three decimal places), so users can reproduce the score.

`ArgumentCorrectness(tool_name, expected_arguments, match_mode='subset', occurrence='first', include_failed=False)` selects a call to `tool_name` and compares its recorded JSON-object arguments. `occurrence` accepts `first`, `last`, or a non-negative integer index. An invalid or out-of-range occurrence fails cleanly.

In `subset` mode, every expected top-level key and value must match, while extra actual keys are allowed. Nested values are compared in full; subset matching is not recursive. In `exact` mode, key sets and values must match. Failure diagnostics must distinguish missing keys, unexpected keys, and differing values. Also fail cleanly, with a useful explanation, when the tool was not called, arguments were not captured, the argument text is invalid JSON, or the decoded value is not an object.

`MaxToolCalls(max_calls, include_failed=True)` returns whether the extracted tool-call count is at most the configured budget. Its reason reports the observed count and, on failure, the budget.

`MaxModelRequests(max_requests)` returns whether the request count is at most the configured budget. Prefer `ctx.metrics['requests']` when present and say so in the reason. Otherwise count chat request spans in the span tree and identify that fallback in the reason. A request span must carry `gen_ai.request.model` and have `gen_ai.operation.name == 'chat'`; other operations such as embeddings do not count.

## Span-tree support

Extend `SpanNode` with a backward-compatible `status` field whose values are `unset`, `ok`, or `error`, defaulting to `unset`, and populate it from the OpenTelemetry span status. Export the `SpanStatus` type alias and `SpanTreeRecordingError` from `pydantic_evals.otel`. Serialized span nodes must include their status.

Add `has_status` to `SpanQuery`. It must compose with the existing query conditions and logical operators, allowing callers to find spans by any of the three status values.

This feature is additive and must not regress existing evaluator, serialization, or span-query behavior.
