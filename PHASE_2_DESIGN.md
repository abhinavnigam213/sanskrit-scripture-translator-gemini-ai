# Phase 2 Design Reference Architecture: Veda-Vāṇī
## Relational Databases, RAG Vector Search, ASP.NET Core APIs, and Frontend Architectural Analysis

This document serves as the official **Phase 2 Design Reference Specification** for the Veda-Vāṇī (Scripture Translation & Transliteration) platform. It provides a strategic analysis of frontend migration pathing, instructions for separating the backend API layer using **ASP.NET Core**, database design for durable cloud persistence, and a highly specialized evaluation of **RAG (Retrieval-Augmented Generation)** embedding models for ancient Sanskrit and multilingual Indic texts.

---

## 1. Frontend Architecture Evaluation: React vs. Angular

A key query during the scoping of Phase 2 is whether to migrate the frontend application from React to Angular. Below is a professional architectural comparison tailored precisely to the functional needs of Veda-Vāṇī.

| Architectural Metric | React 18+ (Current Setup) | Angular 18+ (Proposed Setup) |
| :--- | :--- | :--- |
| **Component Model** | Functional components with Hooks. Highly composable, low boilerplate. | Class-based with TypeScript decorators. Rigid structure but strict conventions. |
| **State Management** | Lightweight local state (`useState`, `useContext`) or modular hooks. | RxJS-powered reactive streams, Signals for granular change detection. |
| **Bundle Footprint** | Extremely minimal, especially when combined with Vite tree-shaking. | Larger initial footprint, though mitigated by Standalone Components. |
| **Data Flow Complexity** | Direct unidirectional flow; easy to customize per component. | Strongly typed forms, bidirectional binding, and enterprise services. |
| **Tooling & Build** | Fast HMR (Hot Module Replacement) with Vite. | Angular CLI (Webpack/Esbuild based). Slower build cycles but cohesive suite. |

### Migration Recommendation
*   **The Decision:** **Maintain React 18+ with Vite.**
*   **Rationale:** The core value of Veda-Vāṇī lies in its lightning-fast character-workspace interaction, rendering dynamic transcription charts, and communicating with rapid backend microservices. React offers zero-friction state-binding for immediate text area changes, integrates seamlessly with custom script converters, and avoids the unnecessary cognitive overhead of Angular’s RxJS dependencies. Additionally, keeping the current React build guarantees a high-performance web deployment container footprint.

---

## 2. API Layer Separation: Transitioning to ASP.NET Core

Decoupling the frontend web assets from backend generation logic can be achieved gracefully by migrating from the current built-in Node.js server to an **ASP.NET Core Web API**. This provides enterprise-level performance, superior asynchronous request processing, and strong typing.

### API Controllers & Routing Plan
An ASP.NET Core backend would expose the following structured RESTful endpoints:

```csharp
[ApiController]
[Route("api/[controller]")]
public class ScriptureController : ControllerBase
{
    private readonly IGeminiService _geminiService;
    private readonly IDatabaseRepository _dbRepository;

    public ScriptureController(IGeminiService geminiService, IDatabaseRepository dbRepository)
    {
        _geminiService = geminiService;
        _dbRepository = dbRepository;
    }

    [HttpPost("analyze")]
    public async Task<IActionResult> AnalyzeVerse([FromBody] AnalysisRequest request)
    {
        var result = await _geminiService.AnalyzeSanskritVerseAsync(request.Text, request.SourceContext);
        return Ok(result);
    }

    [HttpPost("translate")]
    public async Task<IActionResult> TranslateText([FromBody] TranslationRequest request)
    {
        var result = await _geminiService.TranslateDirectAsync(request.Text, request.SourceLang, request.TargetLang);
        return Ok(result);
    }

    [HttpPost("transliterate")]
    public async Task<IActionResult> TransliterateText([FromBody] TransliterationRequest request)
    {
        var result = TransliterationEngine.Convert(request.Text, request.SourceScript, request.TargetScript);
        return Ok(new { TransliteratedText = result });
    }
}
```

### Key Integration Points
1.  **CORS Integration:** Configure the standard middleware inside `Program.cs` to safely allow local or deployed React cross-origin requests:
    ```csharp
    builder.Services.AddCors(options => {
        options.AddPolicy("AllowReactApp", policy => {
            policy.WithOrigins("https://your-react-domain.com")
                  .AllowAnyHeader()
                  .AllowAnyMethod();
        });
    });
    ```
2.  **HttpClient Authentication:** Secrets management for external services like Gemini would reside in secure user secrets or environmental variables, injected via `IConfiguration`:
    ```json
    {
      "Gemini": {
        "ApiKey": "YOUR_SECURE_GEMINI_API_KEY"
      }
    }
    ```

---

## 3. Database Selection: Cloud Relational Schema

To support durable scripture persistence, search logging, user bookmarks, and vector lookups, the platform will leverage a **Relational Cloud SQL (PostgreSQL)** database.

### Relational Schema Diagram (Veda-Vāṇī)

```
  ┌───────────────────────┐          ┌───────────────────────┐
  │      Scriptures       │          │    WordBreakdowns     │
  ├───────────────────────┤          ├───────────────────────┤
  │ PK │ Id               │◄─────────┤ FK │ ScriptureId      │
  │    │ Source           │          │ PK │ Id               │
  │    │ Title            │          │    │ Word             │
  │    │ VerseText        │          │    │ Grammar          │
  │    │ Transliteration  │          │    │ MeaningEnglish   │
  │    │ TranslationEng   │          │    │ MeaningHindi     │
  │    │ TranslationHin   │          └───────────────────────┘
  │    │ SpiritualSignif  │
  │    │ PoeticMeter      │
  └──────────┬────────────┘
             │
             ▼
  ┌───────────────────────┐
  │   ScriptureVectors    │
  ├───────────────────────┤
  │ PK │ Id               │
  │ FK │ ScriptureId      │
  │    │ EmbeddingVector  │<─── [Vector data type for similarity search]
  │    │ ChunkContent     │
  └───────────────────────┘
```

---

## 4. RAG Implementation & Embedding Model Strategy

Retrieval-Augmented Generation (RAG) is essential for answering deep scriptural and philosophical user inquiries by referencing verified scriptures, rather than allowing the core LLM to hallucinate translations. 

Below is the design pattern for building a domain-specific scripture RAG pipeline.

### Vector Databases and PGVector
For the relational setup, **Cloud SQL PostgreSQL** with the `pgvector` extension represents the optimal configuration. It permits storing embeddings alongside normalized text, managing scalar SQL joins directly with vector indexes.
1.  **Initialize pgvector in PostgreSQL:**
    ```sql
    CREATE EXTENSION IF NOT EXISTS vector;
    ```
2.  **Vector Store Table Definition:**
    ```sql
    CREATE TABLE scripture_embeddings (
        id SERIAL PRIMARY KEY,
        scripture_id INTEGER REFERENCES scriptures(id),
        chunk_text TEXT NOT NULL,
        embedding vector(768) -- Matches the 768-dimension output of the chosen Google model
    );
    CREATE INDEX ON scripture_embeddings USING hnsw (embedding vector_cosine_ops);
    ```

---

### Evaluation: Best-Fit RAG Embedding Models for Ancient Sanskrit

Sanskrit holds critical lexical, morphological, and structural characteristics (e.g., *Sandhí* conjugation, word-compounding, complex diacritic marks in IAST orthography). Standard English-centric embedding models perform poorly on these structures. Here is the evaluation of major multi-lingual candidates:

#### Option A: Google `text-multilingual-embedding-002` (RECOMMENDED / BEST FIT)
*   **Dimensionality:** 768 dimensions.
*   **Parameters & Architecture:** Natively trained across more than 100 languages, with direct corpus ingestion of Hindi, Sanskrit, and ancient Indian liturgies.
*   **Why it is the Best Fit:**
    *   **High Semantic Overlap Preservation:** Natively understands semantic similarity between a Sanskrit verse input (e.g., Devanagari or IAST) and its translated English/Hindi equivalent answers.
    *   **Diacritic Sensitivity:** Unlike western-centric models, it preserves structural tokenization integrity when parsing academic Sanskrit texts that possess advanced diacritics (dots, bar lines, macrons).
    *   **Lightweight, Highly Responsive:** 768 dimensions strike a perfect performance balance, ensuring fast search queries on Cloud SQL databases while remaining rich enough to capture profound theological metaphysics.
    *   **Perfect Platform Integration:** Directly matches the existing server-side Gemini ecosystem of the Veda-Vāṇī application stack.

#### Option B: Google `text-embedding-004` (Alternative)
*   **Dimensionality:** Up to 768 / 1536 dimensions.
*   **Pros:** Highly optimized for general agent tasks and reasoning pipelines. Excellent multilingual search capabilities.
*   **Cons:** Tends to over-weight English-semantic contexts over complex Sanskrit word structures compared to the specialized multilingual model.

#### Option C: OpenAI `text-embedding-3-small` / `large`
*   **Dimensionality:** 1536 / 3072 dimensions.
*   **Pros:** Strong general-purpose semantic clustering, dimensionality reduction options.
*   **Cons:** Tokenizer struggles heavily with Devanagari consonant conjuncts, leading to fragmented token sequences, increased billing overhead, and dilution of semantic proximity in classical texts.

---

### End-to-End RAG Query Flow
1.  **User Question Ingestion:** Users ask: *"What does Krishna teach about keeping a steady mind amidst confusion?"*
2.  **Vector Generation:** Send the question to Google's `text-multilingual-embedding-002` to generate a 768-dimensional float array.
3.  **Vector Database Query:** Run a cosine similarity query on the PostgreSQL `scripture_embeddings` database using `pgvector` to identify the top 3 most relevant verses (e.g., finds Bhagavad Gita 2.47 and 2.54).
4.  **Prompt Enrichment (Augmentation):** Inject the retrieved Sanskrit verses, translation matrices, and classical commentarial breakdowns into the LLM system prompt.
5.  **Grounding Validation:** The server-side Gemini API synthesizes an answer grounded entirely in the verified database verses, preventing hallucinations and preserving spiritual integrity.
