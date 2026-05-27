```markdown
# grc-framework-mapping-tool Development Patterns

> Auto-generated skill from repository analysis

## Overview
This skill teaches the core development conventions and workflows used in the `grc-framework-mapping-tool` repository. The project is a TypeScript codebase built with the Vite framework, following clear coding conventions and commit standards. It uses Vitest for testing and emphasizes maintainable, readable code with consistent patterns.

## Coding Conventions

### File Naming
- Use **camelCase** for file names.
  - Example: `frameworkMapping.ts`, `dataLoader.tsx`

### Import Style
- Mixed import styles are allowed.
  - **Named imports:**
    ```typescript
    import { useState } from 'react';
    ```
  - **Default imports:**
    ```typescript
    import FrameworkMapping from './frameworkMapping';
    ```

### Export Style
- Use **default exports** for modules.
  - Example:
    ```typescript
    // frameworkMapping.ts
    const FrameworkMapping = () => { /* ... */ };
    export default FrameworkMapping;
    ```

### Commit Messages
- Follow the **Conventional Commits** standard.
- Use the `feat` prefix for new features.
  - Example: `feat: add mapping validation for custom frameworks`

## Workflows

### Starting Development
**Trigger:** When beginning work on a new feature or bugfix  
**Command:** `/start-dev`

1. Pull the latest changes from the main branch.
2. Create a new branch with a descriptive name (e.g., `feat/add-custom-mapping`).
3. Begin coding following the conventions below.

### Running the Development Server
**Trigger:** When you want to see live changes during development  
**Command:** `/dev-server`

1. Run the Vite development server:
   ```bash
   npm run dev
   ```
2. Open the provided local URL in your browser.

### Writing and Running Tests
**Trigger:** When you need to write or execute tests  
**Command:** `/test`

1. Create test files alongside your components using the `*.test.tsx` pattern.
   - Example: `frameworkMapping.test.tsx`
2. Run all tests with:
   ```bash
   npm run test
   ```
3. Review the output and fix any failing tests.

### Committing Changes
**Trigger:** When you are ready to commit code  
**Command:** `/commit`

1. Stage your changes:
   ```bash
   git add .
   ```
2. Write a commit message using the conventional format:
   - Example: `feat: improve mapping UI for better accessibility`
3. Commit your changes:
   ```bash
   git commit -m "feat: improve mapping UI for better accessibility"
   ```

### Pushing and Creating a Pull Request
**Trigger:** When your feature or fix is ready for review  
**Command:** `/pr`

1. Push your branch to the remote repository:
   ```bash
   git push origin <branch-name>
   ```
2. Open a pull request on GitHub, following the repository's PR template.

## Testing Patterns

- **Framework:** Vitest
- **Test File Pattern:** `*.test.tsx`
- **Example Test:**
  ```typescript
  // frameworkMapping.test.tsx
  import { render } from '@testing-library/react';
  import FrameworkMapping from './frameworkMapping';

  test('renders mapping component', () => {
    const { getByText } = render(<FrameworkMapping />);
    expect(getByText('Mapping Tool')).toBeInTheDocument();
  });
  ```

## Commands
| Command      | Purpose                                        |
|--------------|------------------------------------------------|
| /start-dev   | Start a new feature or bugfix branch           |
| /dev-server  | Run the Vite development server                |
| /test        | Run all Vitest tests                           |
| /commit      | Commit changes with a conventional message     |
| /pr          | Push branch and open a pull request            |
```
