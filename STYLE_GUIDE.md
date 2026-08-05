# Markdown and Writing Style Guide

This guide defines the default Markdown and writing conventions for long-term knowledge-base notes and technical documentation. It is intended for human authors and automated agents.

Extended examples and edge cases belong in `STYLE_GUIDE_EXAMPLES.md`.

## Normative Language

- **MUST** and **MUST NOT** indicate absolute requirements.
- **SHOULD** and **SHOULD NOT** indicate strong defaults. Depart only for a clear reason.
- **MAY** indicates an optional practice.

## Scope

This guide covers Markdown structure, technical prose, grammar, punctuation, emphasis, lists, blockquotes, code, mathematics, links, tables, and visuals.

Repository-specific metadata, file organization, build commands, lint commands, custom components, and publishing behavior belong in repository-level instructions.

## Authority and Precedence

Apply rules in this order:

1. Repository-specific instructions.
2. This guide.
3. [Google Developer Documentation Style Guide](https://developers.google.com/style/).
4. [CommonMark Specification](https://spec.commonmark.org/).
5. [Microsoft Writing Style Guide](https://learn.microsoft.com/style-guide/).
6. [The Chicago Manual of Style](https://www.chicagomanualofstyle.org/).

A higher-ranked source overrides a lower-ranked source.

Use CommonMark for Markdown syntax, Google for technical prose and UI conventions, Microsoft for unresolved technical-writing questions, and Chicago for unresolved general-English questions.

Do not invent a local convention when a fallback source resolves the issue.

## Core Principles

### Prefer Consistency

Consistency takes precedence over decorative preference. Use the same terminology, punctuation, and markup for equivalent concepts. Do not vary terminology merely to avoid repetition.

### Format According to Meaning

Choose formatting based on semantic role:

- Bold marks an important phrase.
- Italics introduce a term or mark a title.
- Inline code represents literal program or system text.
- LaTeX represents mathematics.
- Blockquotes contain supplementary information.

Do not use markup as decoration.

### Prefer Compact Technical Explanations

Notes SHOULD resemble concise technical documentation with textbook-level explanatory depth.

A strong explanation usually:

1. Defines the topic and why it matters.
2. Explains the core mechanism, model, or invariant.
3. Shows an important example, equation, diagram, or implementation.
4. Covers relevant trade-offs, failure cases, variants, or applications.

Useful patterns include:

- State an invariant before explaining how it is maintained.
- Introduce the ordinary case before exceptions or optimizations.
- Pair benefits with costs.
- Use examples that make abstractions testable.
- Use explicit transitions when they improve flow.

### Preserve Semantic Distinctions

Do not blur mathematics with implementation syntax, main information with supplementary information, ordered procedures with unordered collections, complete sentences with fragments, or abstract terms with literal identifiers.

## Document Structure

### Document Title

A standalone document SHOULD contain exactly one H1 title. A document MAY omit an in-body H1 when the surrounding system supplies the title. Do not render the same title twice.

### Opening

Begin with a concise definition or framing paragraph. The opening SHOULD explain the subject without merely repeating the title.

### Headings

Use ATX headings and Title Case:

```md
## Building the Jump Table
```

MUST NOT:

- Use Setext headings.
- Skip heading levels.
- Put bold or italics in headings.
- Add headings merely to divide a small amount of content.

When an in-body H1 is omitted, begin the content hierarchy at H2. Use H3 and H4 only when they clarify a larger section. Keep headings concise and descriptive.

## Prose

### Tone and Voice

Write in clear, matter-of-fact prose. Prefer direct technical explanation over ceremonial, academic, or conversational wording.

Use an impersonal style by default:

```md
The server can be configured by editing `config.yaml`.
```

Avoid first-person pronouns unless the subject is inherently personal.

Prefer active voice. Use passive voice when the actor is unknown, irrelevant, obvious, or less important than the action.

Contractions are preferred in ordinary explanatory prose when they read naturally. Avoid them only when they sound too casual or weaken a formal definition. Normative instructions MAY use uncontracted forms for clarity.

### Paragraphs and Sentences

A paragraph SHOULD contain no more than five sentences. Split a paragraph when it covers more than one main idea, becomes visually dense, contains a substantial transition, or exceeds five sentences.

Avoid unnecessary one-sentence paragraphs. A one-sentence paragraph MAY remain separate when it functions as a restatement, conclusion, transition, contrast, or short definition.

Sentences MAY be moderately long when their structure remains clear. Break a sentence when it contains too many clauses, requires rereading, or obscures the main relationship.

Use exactly one space after sentence-ending punctuation.

### Definitions and Examples

Define specialized terms when they first become important, then use the chosen term consistently.

Integrate definitions into normal prose:

```md
*Idempotence* is the property that repeating an operation has no additional effect.
```

Do not require labels such as “Definition,” “Fact,” or “Example.” Introduce examples with natural prose, and place them after the concept they illustrate.

### Drafting Language

Published prose MUST NOT contain unresolved drafting language, abandoned alternatives, or vague placeholders. A TODO in an HTML comment is permitted and is not considered published prose or unresolved drafting language.

An HTML TODO comment MAY be used for a specific, actionable deferred edit:

```md
<!-- TODO: Link the consensus note after it is created. -->
```

Remove the comment when the edit is completed.

## Emphasis

### Bold

Bold MAY be used sparingly for the smallest meaningful phrase containing a central result, constraint, distinction, conclusion, warning, or easily missed detail.

Correct:

```md
A reader may observe only **a prefix of the established write order**.
```

Bold MUST NOT:

- Cover an entire sentence or paragraph.
- Appear in headings.
- Serve as decoration.
- Be repeated throughout a paragraph.
- Introduce label-style list items.

### Italics

Italicize a central technical term on its first meaningful introduction in the body text when the note defines or develops that term. A heading does not count as an introduction. Subsequent occurrences in the body use plain text unless another rule requires emphasis.

Use italics for:

- A central technical term that the note defines or explains in depth, on its first meaningful introduction in body text.
- A foreign word or phrase not naturalized in English.
- Titles of books, papers, films, videos, and other standalone works.

Do not italicize every technical term. Leave terms that appear only as incidental examples, applications, or passing references in plain text. If a term appears incidentally before its dedicated explanation, italicize it at the first meaningful explanatory introduction instead.

After introducing a term, use ordinary roman text. Do not italicize code identifiers or mathematical variables manually.

### Combined Emphasis

Bold italics MUST NOT be used.

## Blockquotes

Blockquotes contain supplementary information related to the topic but not essential to the main narrative.

They MAY contain:

- Additional explanation.
- Concise caveats.
- Supporting context.
- External resources.
- Tangential qualifications.
- Sourced excerpts or quotations.
- A supplementary definition that would interrupt the main flow.

Critical requirements, central definitions, primary warnings, and conclusions MUST remain in the main narrative. Supplementary caveats, optional refinements, precise follow-up facts, and references MAY use blockquotes when a reader who skips every blockquote can still understand the core topic.

A blockquote MUST NOT be used only for visual emphasis and MUST contain no more than two paragraphs.

Use descriptive links rather than bare URLs. Identify the source of an actual quotation when practical.

## Lists

### When to Use Lists

Use a list for a parallel collection, sequence, ranking, alternatives, or information that is easier to scan separately. Prefer prose when the items form a continuous explanation.

### Markers and Order

Use `-` for unordered lists. Do not mix unordered marker styles.

Use numbered lists only for procedures, chronological sequences, rankings, meaningful counts, or lists introduced with an exact count.

Text introducing a list SHOULD end with a colon.

### Grammar and Punctuation

Every list item MUST begin with a capital letter.

Complete-sentence items MUST end with periods. Fragment items MUST NOT end with periods. A list MUST NOT mix sentences and fragments.

List items MUST use parallel grammatical structure.

### Nesting

Nested lists are allowed but discouraged. Do not exceed three levels. Prefer a subsection, table, or prose when nesting becomes difficult to scan.

## Code and Literal Text

### Inline Code

Use inline code for literal program or system elements:

- Functions, methods, classes, variables, and parameters.
- Commands and command-line options.
- File and directory names.
- Configuration keys and literal values.
- Data types and database objects.
- Exact source expressions.
- User input and machine output.

Do not use inline code to emphasize ordinary words.

### Code Blocks

Use fenced code blocks with three backticks. Every fenced block MUST declare a language.

Use the correct language when known. Use `text` for unstructured output, compact notation, or language-independent pseudocode.

Introduce a substantial code block before it appears. Explain what it demonstrates or assumes. Explain its important consequence or limitation afterward when that point is not self-evident.

Code examples SHOULD be syntactically valid, internally consistent, and runnable-looking when implementation details matter. Preserve exact identifier spelling and capitalization.

## User-Interface Elements

Follow Google's UI-element rules.

Use bold for visible UI labels:

```md
Select **Save**.
```

Use `>` between sequential choices:

```md
Go to **Settings** > **General**.
```

Do not use inline code for ordinary UI labels. Preserve displayed capitalization when known.

## Mathematics

### LaTeX

Use LaTeX for mathematical notation whenever practical.

Use `$...$` for inline mathematics and `$$...$$` for display mathematics.

```md
The query runs in $O(\log n)$ time.
```

Do not use inline code for mathematical expressions.

### Mathematics vs. Implementation

Use LaTeX for abstract variables and mathematical concepts:

```md
Let $\operatorname{up}(u,j)$ denote the $2^j$-th ancestor of node $u$.
```

Use LaTeX for variables when prose describes the mathematical problem or algorithm. For example, write "the $k$-th ancestor of node $u$" and "move $k$ steps upward."

Use inline code for literal implementation elements:

```md
The implementation stores the entry in `up[u][j]`.
```

Use inline code when prose refers to the spelling of a parameter, identifier, or source expression. For example, write "the function parameter `k`" or "the expression `up[u][j]`." Do not use inline code for an abstract variable merely because the implementation uses the same letter.

The same name MAY appear in both forms when the note moves between mathematical explanation and implementation.

Prefer distinct notation for an abstract quantity and its implementation variable when this improves clarity.

Use display math when an equation is central, long, aligned, or discussed by surrounding prose. Define variables directly before or after the equation.

## Links and Sources

### Descriptive Links and Wikilinks

Ordinary Markdown links MUST use descriptive text. Do not use vague text such as `here`, `this page`, `more`, or `link`.

Wikilinks MAY use the canonical title of the linked note and do not need to be rewritten as descriptive prose. Wikilinks SHOULD sit naturally in the surrounding sentence rather than appearing as unexplained standalone references.

Bare URLs MUST NOT appear in prose unless the URL itself is the subject.

Integrate links naturally into sentences. A short supplementary resource list MAY appear in a blockquote.

Do not link every repeated technical term. Link when it provides a useful next step or necessary context.

### Avoid Duplication

When another document is the canonical explanation of a concept, link to it instead of repeating its full definition, mechanism, examples, or comparison rules.

In the current document, explain only:

- How the linked concept is applied.
- Which constraint or trade-off matters here.
- Why it is relevant.
- Any difference from the canonical treatment.

Repeat a small amount of context only when necessary for local understanding.

## Tables

Use tables for compact comparisons of complexity, guarantees, capabilities, trade-offs, operations, or cases with consistent attributes.

Use tables only for genuinely tabular data with consistent columns. Do not use them for long prose, procedures, deeply nested information, or cells requiring substantial explanation.

Introduce a table before it appears. Explain the important comparison afterward when it is not self-evident.

Keep cells concise. Use sentence case in ordinary cells unless the content is a title or official name. Apply the same sentence-versus-fragment punctuation rules used for lists.

Use LaTeX rather than inline code for mathematical notation in tables unless a cell refers to a literal program string.

## Images and Diagrams

### When to Use Visuals

Use a visual only when it explains a relationship, topology, state transition, sequence, spatial arrangement, or transformation more clearly than prose. Do not add visuals merely for decoration.

Every informative visual MUST follow this reading flow:

1. Introduce the visual with a complete sentence.
2. Place the visual immediately after that introduction.
3. Explain the important takeaway immediately after the visual.
4. Continue the surrounding discussion.

A reader should never encounter an unexplained visual.

Do not begin a section with a visual before explaining why it exists.

Do not end a section with a visual unless its purpose has already been explained.

### Alt Text

Use descriptive alt text that communicates the visual's purpose. Do not use redundant phrases such as “image of” or repeat a nearby caption verbatim.

Place a visual near the paragraph that introduces it.

### Choosing a Format

Apply the same reading-flow rule to every visual, including:

- Images.
- Conceptual diagrams.
- Excalidraw diagrams.
- Mermaid diagrams.
- State diagrams.
- Sequence diagrams.
- Architecture diagrams.
- Screenshots.

Choose the format according to the content:

- Use an editable diagram for conceptual structures, architectures, topologies, relationships, and transformations.
- Use a text-defined diagram for sequential flows, state transitions, and diagrams likely to evolve with the prose.
- Use a raster image for screenshots, scans, photographs, and source material that cannot be represented cleanly as a diagram.

Prefer the format that is easiest to edit and review.

### Diagram Design

Diagrams SHOULD use short labels, align related elements, follow a clear reading order, use grouping consistently, and avoid decorative complexity.

Do not place a diagram immediately after a heading. First explain what the reader is about to see, then present the diagram, then interpret its important takeaway.

Text-defined diagrams are especially suitable for request flows, transactions, replication, message sequences, state transitions, and failure scenarios.

Use sequence numbering only when it improves the explanation.

### Static Images

Use PNG or JPEG for screenshots, scans, photographs, and other raster material. Crop irrelevant content when safe, ensure text remains legible, and remove sensitive information before publication.

## Punctuation and Grammar

### American English

Use American English spelling and punctuation. Preserve official names that use another spelling.

### Oxford Comma

Always use the Oxford comma.

### Quotation Marks

Use double quotation marks by default. Use single quotation marks only for a quotation within a quotation.

Follow American punctuation conventions: periods and commas normally appear inside closing quotation marks. Question marks and exclamation marks appear inside only when they belong to the quoted material.

Do not use quotation marks for code, identifiers, filenames, or mathematical variables.

### Parentheses

Prefer parentheses over em dashes for parenthetical information.

When a parenthetical is part of a sentence, place the final period outside. When the entire sentence is parenthetical, place the period inside.

### Colons

Use a colon after a complete clause to introduce a list, explanation, example, quotation, result, equation, code block, or diagram.

Use lowercase after a colon when what follows is a continuation or single ordinary clause.

Capitalize after a colon when what follows is multiple complete sentences, a direct quotation, a heading, a formal label, a proper noun, or conventionally capitalized content.

Do not place a colon directly after a verb or preposition when it interrupts the grammar.

### Semicolons and Commas

Semicolons are permitted for closely related independent clauses or complex list elements. Prefer a period or conjunction when clearer.

Use commas to prevent ambiguity. Do not use comma splices.

### Em Dashes, Ellipses, and `etc.`

Use the em dash character (`—`), not a spaced hyphen, when an em dash is necessary. Prefer parentheses under this guide.

Use ellipses only for omitted text, trailing speech, or deliberate hesitation.

Avoid `etc.` after a list that is already clearly illustrative.

## Capitalization and Terminology

### Headings

Use Title Case for all headings. Capitalize the first and last words, nouns, pronouns, verbs, adjectives, adverbs, subordinating conjunctions, and major words in hyphenated compounds.

Lowercase short articles, coordinating conjunctions, and short prepositions unless first or last.

### Technical Terms and Official Names

Use sentence capitalization for ordinary technical terms. Do not capitalize a common noun merely for emphasis.

Preserve official capitalization for products, libraries, protocols, organizations, commands, and identifiers.

### Abbreviations

Expand an abbreviation on its first meaningful use, then use the abbreviation consistently. Do not create an abbreviation used only once.

### Terminology

Use one term consistently for one concept. Do not rotate among synonyms merely to reduce repetition.

When terminology is disputed or overloaded:

1. Choose the term used by the most relevant authoritative source.
2. Define it on first use.
3. Mention useful aliases once.
4. Use the chosen term consistently afterward.

Consult the [Google word list](https://developers.google.com/style/word-list) for unresolved wording choices.

## Markdown Layout and Syntax

Leave one blank line around paragraphs, headings, lists, blockquotes, tables, code fences, visuals, and display mathematics.

Do not use repeated blank lines for spacing, trailing spaces for manual line breaks, or indentation for ordinary paragraphs.

Do not wrap paragraphs or other continuous prose across multiple source lines. Keep each paragraph on one source line, regardless of its rendered width. Preserve intentional line breaks in code, lists, tables, and display mathematics.

Follow CommonMark unless this guide or repository instructions state otherwise.

Escape Markdown punctuation only when necessary.

Use horizontal rules sparingly; prefer headings. When required, use `---` and avoid positions where it may be confused with metadata syntax.

Avoid raw HTML when Markdown or a supported component can express the same meaning.

Do not introduce custom Markdown glyphs, callouts, or extensions unless repository instructions define them.

## Accessibility

- Write link text that makes sense out of context.
- Provide meaningful alt text for informative images.
- Do not rely on formatting, color, or position alone to communicate meaning.
- Use headings in a logical hierarchy.
- Prefer named references over phrases such as “the section below.”
- Prefer plain, direct language over jargon when both are accurate.

## Agent Instructions

When creating or editing a note, an automated agent MUST:

1. Preserve valid repository-specific metadata and syntax.
2. Apply this guide before lower-priority fallbacks.
3. Preserve the author's technical meaning.
4. Format text according to semantic role.
5. Maintain consistent terminology.
6. Avoid adding structure or emphasis without a reason.
7. Distinguish mathematics from literal code.
8. Avoid rewriting merely for stylistic novelty.
9. Keep paragraphs at five sentences or fewer unless splitting reduces clarity.
10. Ensure lists are parallel and do not mix fragments with sentences.
11. Use descriptive links and meaningful alt text.
12. Declare a language on every fenced code block.
13. Never skip heading levels.
14. Never use bold italics.
15. Never duplicate a title rendered by the publishing system.
16. Introduce and explain substantial code, equations, diagrams, and tables.
17. Link canonical explanations rather than unnecessarily duplicating them.
18. Remove unresolved drafting language and obsolete TODO comments.

When a rule is not stated:

1. Check repository-specific instructions.
2. Check this guide for a broader principle.
3. Apply Google.
4. Apply CommonMark for syntax.
5. Apply Microsoft for unresolved technical-writing questions.
6. Apply Chicago for unresolved general-English questions.
7. Choose the interpretation most consistent with the surrounding document.

An agent MUST NOT silently invent a convention when an authoritative fallback resolves the issue.

## Review Checklist

### Structure and Prose

- The document has one effective title.
- The opening defines or frames the topic.
- Headings use Title Case and do not skip levels.
- Sections follow a logical progression.
- The tone is direct, technical, and primarily impersonal.
- Active voice is used where practical.
- Paragraphs generally contain no more than five sentences.
- Terminology is consistent.
- Abbreviations are expanded on first meaningful use.
- Drafting language has been removed.

### Formatting and Lists

- Bold is sparse and limited to the smallest meaningful phrase.
- Italics mark first-use terms, foreign words, or titles.
- Bold italics do not appear.
- Blockquotes contain only supplementary material and no more than two paragraphs.
- Critical information remains in the main narrative.
- Lists are appropriate, parallel, and consistently punctuated.
- List nesting does not exceed three levels.

### Code, Mathematics, and Visuals

- Literal code uses inline code.
- Mathematics uses LaTeX.
- Abstract variables and implementation identifiers are distinguished.
- Every fenced code block declares a language.
- UI labels use bold rather than inline code.
- Code, equations, diagrams, and tables have surrounding prose.
- Images have meaningful alt text.
- Visuals are necessary and explained.

### Links and Punctuation

- Links use descriptive text.
- Bare URLs do not appear in prose.
- Canonical explanations are linked rather than duplicated.
- American English and the Oxford comma are used.
- Quotation punctuation follows American rules.
- Parentheses are preferred over em dashes.
- Colons and semicolons are grammatical.
- There is exactly one space after sentence-ending punctuation.

## Maintenance

Update this guide when a recurring ambiguity appears, documents conflict, a repository feature requires a rule, a fallback changes materially, or agents repeatedly make the same error.

When adding a rule:

1. State the semantic reason.
2. Use normative language.
3. Include a concise example only when needed.
4. Prefer adopting an authoritative external rule by reference.
5. Avoid copying large sections of fallback guides.
6. Put extended examples in `STYLE_GUIDE_EXAMPLES.md`.

Keep this guide compact enough for routine agent context.
