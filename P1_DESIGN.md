# P1 Refactoring Design Proposal: Modular Creative Engine

## 1. Goal
Refactor the monolithic `generateCreativeSkeleton` in `src/logic.js` into five decoupled, testable pure functions. This improves maintainability, enables granular unit testing, and simplifies future feature additions.

## 2. Module Specifications

### A) normalize_overrides
**Responsibility**: Sanitize raw user input, strip legacy prefixes, and collect initial warnings.

```typescript
type NormalizeInput = {
  overrides: Record<string, any>;
}

type NormalizeResult = {
  clean: Record<string, string | string[]>;
  warnings: string[];
}

function normalize_overrides(input: NormalizeInput): NormalizeResult;
```

### B) validate_overrides
**Responsibility**: Verify if normalized slugs exist in the designated World's pools.

```typescript
type ValidateInput = {
  clean: Record<string, string | string[]>;
  pools: WorldPools;
  dimensions: string[];
}

type ValidateResult = {
  validated: Record<string, any>; // Actual data objects
  errors: string[];
  dropped: Array<{ field: string; user_input: any; reason: string }>;
}

function validate_overrides(input: ValidateInput): ValidateResult;
```

### C) apply_logic_constraints
**Responsibility**: Apply business rules from `generation_logic` and `inspiration_weights`.

```typescript
type ConstraintInput = {
  validated: Record<string, any>;
  logic: GenerationLogic;
  inspiration: InspirationWeights;
}

type SelectionConstraints = {
  fixed: Record<string, any>; // Items that MUST be included
  weights: Record<string, Record<string, number>>; // Influenced probability
  forbidden: string[]; // Term filters
}

function apply_logic_constraints(input: ConstraintInput): SelectionConstraints;
```

### D) sample_candidates
**Responsibility**: The stochastic core. Pick final items based on constraints and RNG.

```typescript
type SampleInput = {
  constraints: SelectionConstraints;
  pools: WorldPools;
  rng: RNG;
  kRange: [number, number];
}

type SelectionResult = {
  subject_kit: SubjectKit;
  twist_mechanisms: Twist[];
  stage_context: string;
  composition_rule: string;
  lighting_rule: string;
}

function sample_candidates(input: SampleInput): SelectionResult;
```

### E) assemble_prompt
**Responsibility**: Translate the structured selection into a human/AI-readable string.

```typescript
type PromptInput = {
  selection: SelectionResult;
  world_profile: string;
  lang: 'en' | 'zh';
}

function assemble_prompt(input: PromptInput): string;
```

## 3. Dependency Order & Rationale

1.  **Normalize** → **Validate** → **Apply Constraints** → **Sample** → **Assemble**

**Rationale**:
- **Normalize First**: Decouples input format (e.g., legacy prefixes) from business logic.
- **Validate before Constraints**: Ensures we only apply logic rules (like required twists) to valid, existing entities.
- **Constraints before Sampling**: Consolidation of "what we want" (user + logic + inspiration) into a single "Instruction Set" for the stochastic engine.
- **Sample before Assemble**: The prompt assembly is a deterministic view of the stochastic result.

## 4. Unit Testing Suggestions

| Module | Test Case Suggestions |
| :--- | :--- |
| **normalize** | `strip_legacy_prefix`, `handle_empty_input`, `warn_on_deprecated_format` |
| **validate** | `reject_invalid_slug`, `accept_valid_item`, `report_dropped_override` |
| **apply_constraints** | `append_required_twist`, `apply_inspiration_bias`, `merge_user_and_logic_twists` |
| **sample** | `respect_fixed_overrides`, `adhere_to_k_range`, `deterministic_with_same_seed` |
| **assemble** | `multilingual_output`, `template_interpolation`, `handle_missing_secondary_elements` |
