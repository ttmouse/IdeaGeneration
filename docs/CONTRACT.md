# IdeaGeneration Interface Contract (P0)

This document defines the technical behavior and interface standards of the IdeaGeneration system as of the P0 milestone.

## 1. Override Priority & Selection Logic

1.  **Strict Preference**: Manual `overrides` always take precedence over random selection or inspiration-based injection.
2.  **Inspiration Injection**: If no override is provided for a dimension, the system may inject preferred values based on the `inspirationSeed` (if matching keywords are found in the configuration).
3.  **Random Fallback**: If neither an override nor an inspiration-based preference is applicable, a random selection from the available pool is performed.

## 2. Identifier Standards (Raw Slugs)

-   **Standard**: All internal and external identifiers for system components (Worlds, Intents, Dimensions, Mechanisms) use **Raw Slugs**.
-   **Format**: Lowercase, alphanumeric, hyphen-separated (e.g., `scale_mismatch`, `advertising`).
-   **Anti-pattern**: Avoid using prefixed identifiers like `twist:scale_mismatch` or `world:advertising` in input `overrides`.

## 3. Legacy Compatibility & Normalization

-   **Prefix Normalization**: The system automatically detects and strips legacy prefixes (e.g., `twist:`, `subject:`) from user input overrides.
-   **Validation Warning**: When normalization occurs, a warning is added to the `validation.warnings` array.
-   **Example**: `{"twist_mechanisms": ["twist:scale_mismatch"]}` is processed as `["scale_mismatch"]`.

## 4. Required Dimension Strategies

### Required Twist Append (Decision A)
-   **Rule**: If a `generation_logic` requires a specific `twist_category` (e.g., `process-driven` requires `cutaway_logic`), the system will **append** the required twist to the user's manual overrides if it's missing.
-   **Validation**: A warning is added to `validation.warnings` when a required twist is appended against user overrides.

## 5. Error & Validation Strategy

### Subject Kit Miss Detection
-   **Strict Matching**: Overrides for `subject_kit` must match a `primary_subject` slug in the current world's pool.
-   **Error Reporting**: If an override is provided but not found:
    1.  The override is added to `validation.dropped_overrides`.
    2.  An explicit error message is added to `validation.errors`.
    3.  A random fallback is applied to ensure the system returns a valid object.

## 6. Response Schema (v1)

Every generation response includes a `validation` object:
-   `errors`: `string[]` - Fatal or logical issues (e.g., missing overrides).
-   `warnings`: `string[]` - Non-blocking issues or normalization notices.
-   `dropped_overrides`: `Object[]` - Details of overrides that were ignored or fell back.
