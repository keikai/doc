# Workflow when execution is prohibited

Use this workflow only when the task prohibits compilation, application execution
or runtime verification. The task's command allowlist determines which static
inspection is permitted; an unavailable runtime alone does not impose an allowlist.

- Combine independent reads of supplied code, inputs and relevant documentation.
  Use matching-version signatures already in the skill or API index directly.
  Batch known types/members in a focused text search; inspect the package's
  `Axyra.Sheets.xml` member only when a signature is missing or the version differs,
  and only when that inspection command is permitted. Avoid repeated confirmations
  and whole index/XML dumps. Signatures do not establish runtime behavior.
- Follow the inspection allowlist literally: `unzip -l` permits an entry listing,
  not `unzip -p`, extraction, or a Python helper. Do not run an API lookup script,
  `dotnet build`/`run`/`test`, a reflection probe or a timing probe when those
  commands are barred. Resolve unknown template names in the generated program when
  deeper inspection is barred.
- Implement the requested behavior and review API usage, workbook disposal,
  thread ownership and preservation of the existing output contract statically.
  Keep required migration classifications and diagnosis explanations. Describe
  which saved values, formulas, formats or layout would be checked when execution
  becomes available; for performance tasks, describe the requested scales and
  measurement method without inventing measurements.
- Finish after the static review resolves the questions that permitted inspection
  can answer. Revisit it after a relevant change or unresolved error; avoid
  unrelated features, edge-case suites or repeated source discovery. Report the
  changes, static checks, remaining runtime uncertainties and sources actually
  read once. Distinguish expected results from observed results; leave compilation,
  runtime success, saved-output fidelity and wall time explicitly unverified.
