### **Execution Plan: `products` API Module**

**1. Context & Scope**
This plan covers the creation of a new, full-stack "minimal API" module for managing `products`. The module will include a Deno API for CRUD operations, database migrations, auto-generated documentation, and a CI/CD pipeline for deployment to Supabase Edge Functions.

**2. Functional Requirements**
*   The API must expose endpoints for full CRUD and advanced query operations (`get`, `post`, `put`, `patch`, `delete`, `getByName`, `getById`, `getByQuery`, etc.).
*   The API must serve auto-generated, interactive documentation at `/swagger`, `/scalar`, and provide a downloadable `/collection` file for API clients.

**3. Non-Functional Requirements**
*   **Persistence:** Data will be stored in a Supabase Postgres database.
*   **Error Handling:** All operations will use the `Result` pattern for predictable success/error responses.
*   **Logging:** All requests will be logged via middleware.
*   **Deployment:** The API will be deployed as a Supabase Edge Function, automated via a GitHub Actions workflow.
*   **Developer Experience:** The module will include Deno tasks for local development and deployment.

**4. Architecture & Decisions**
*   **Module Name:** `products`
*   **Integration:** `Supabase`
*   **File Structure:** A new `src/api/products/` directory will be created with the standard structure (`handler.ts`, `service.ts`, `repository.ts`, `model.ts`, `migrations/`, `docs/`, etc.).
*   **Data Model:** I will first search for an existing `assets/mocks/product.json`. If it's not found, I will ask you to provide a sample JSON model before I proceed with implementation.

**5. High-Level Backlog**
1.  **Foundation:** Create the directory structure and barrel files for `src/api/products`.
2.  **Data Layer:** Implement `products.model.ts` and `products.repository.ts`.
3.  **Business Logic:** Implement `products.service.ts`.
4.  **Presentation:** Implement `products.handler.ts` to expose the API routes.
5.  **Wiring:** Create `src/api/products/index.ts` to handle dependency injection and exports.
6.  **Database:** Create the initial SQL migration for the `products` table.
7.  **Documentation:** Create the documentation files and the routes to serve them.
8.  **Automation:** Create the `task.ts` file, update `deno.json`, and create the `products-deploy.yml` GitHub workflow.
