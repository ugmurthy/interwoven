# Enhanced Workflow Amendment Plan

## Current Understanding

The application has a Home page that allows users to:
1. Input text, audio, or files
2. Process the input using either a Model Card or a Workflow
3. View the output of the processing

Currently, the Home page has separate text input components for Model Card and Workflow processing. The workflow execution details are displayed in a collapsible section, but the individual model results are not individually collapsible.

## Requested Amendments

1. Use a common text area in the input component for both Model Card and Workflow on the Home page
2. Reposition the "View Workflow Execution details" button
3. Make the workflow execution details for each model show "Input", "Output" and "Usage" as individually collapsible for that model
4. Ensure that the content relating to system prompts in the input is NOT shown or hidden by default but expandable

## Implementation Plan

### 1. Common Text Area for Model Card and Workflow

#### Current Implementation
- Currently, there are separate TextInput components for Model Card and Workflow processing
- The Model Card input is directly in the Home component
- The Workflow input is wrapped in the WorkflowInputWrapper component

#### Proposed Changes
1. Create a shared state for the text input in the Home component
2. Use a single TextInput component that updates this shared state
3. Pass the shared state to both processing paths (Model Card and Workflow)

#### Mode Switching Behavior
1. **Mode Switching = New Session**: When switching between Model Card and Workflow modes, the application will behave as if the "New Session" button was clicked:
   - Clear the current input
   - Clear the current output
   - Reset any selected model card or workflow
   - Focus the input field for immediate use
2. **Implementation Details**:
   - Add an effect hook that watches for changes to the `selectedTarget` state
   - When `selectedTarget` changes, trigger the same reset function used by the New Session button
   - This ensures consistent behavior between explicit resets and mode switches

### 2. Reposition "View Workflow Execution Details" Button

#### Current Implementation
- The "View Workflow Execution Details" button is inside the WorkflowOutputRenderer component
- It's positioned below the main output

#### Proposed Changes
1. Move the button to a more prominent position between the input and output sections
2. Update the styling to make it more visible and consistent with the application design

### 3. Make Workflow Execution Details Individually Collapsible

#### Current Implementation
- The IntermediateResultsView component displays execution details for each model
- When a model result is expanded, it shows Input, Output, and Usage statistics all at once

#### Proposed Changes
1. Modify the IntermediateResultsView component to have separate collapsible sections for:
   - Input (including system prompt, which will be hidden by default)
   - Output
   - Usage statistics
2. Add state management for tracking which sections are expanded

#### Enhanced UI/UX for Collapsible Sections
1. **Visual Indicators**: 
   - Each collapsible section will have a clear icon (ChevronRight/ChevronDown) to indicate its collapsed/expanded state
   - Color-coded headers for each section (blue for Input, green for Output, purple for Usage)

2. **Interaction Design**:
   - Click anywhere on the section header to expand/collapse
   - Smooth animation for expanding/collapsing (height transition of 150ms)
   - Optional keyboard navigation support (Tab to focus, Enter to expand/collapse)

3. **Layout**:
   - Each section will have a distinct card-like appearance with subtle border and shadow
   - When collapsed, only the header with a summary is visible (e.g., "Input: 250 characters")
   - When expanded, the full content is shown with appropriate formatting

4. **Responsive Behavior**:
   - On smaller screens, the layout will adjust to stack sections vertically
   - Text will wrap appropriately within containers

### 4. Make System Prompts Expandable

#### Current Implementation
- System prompts are currently shown as part of the input in the IntermediateResultsView component
- They are not separated from the user input

#### Proposed Changes
1. Modify the IntermediateResultsView component to separate system prompts from user input
2. Add a collapsible section for system prompts that is collapsed by default
3. Add a toggle button to expand/collapse the system prompt section

### 5. Add Session Restart Button

#### Current Implementation
- Currently, there's no dedicated way to restart a session after processing
- Users need to manually clear inputs and select options again

#### Proposed Changes
1. Add a "New Session" button in a prominent location (top-right of the output section)
2. When clicked, this button will:
   - Clear the current input
   - Clear the current output
   - Reset any selected model card or workflow
   - Focus the input field for immediate use
3. The button will be styled consistently with other action buttons in the application
4. Add appropriate confirmation if there's unsaved work
5. **Shared Reset Logic**: Create a reusable `resetSession()` function that will be called by:
   - The New Session button click handler
   - The effect hook that watches for mode switches between Model Card and Workflow

## Files to Modify

1. `app/pages/Home.tsx` - To implement the common text area
2. `app/components/workflow/WorkflowOutputRenderer.tsx` - To reposition the execution details button
3. `app/components/workflow/IntermediateResultsView.tsx` - To implement individually collapsible sections and system prompt hiding

## Detailed UI/UX Mockup for Collapsible Sections

```
┌─ Model: GPT-4 ──────────────────────────────────────┐
│                                                     │
├─ Input ▼ ─────────────────────────────────────────┐ │
│                                                   │ │
│  ┌─ System Prompt ▶ ───────────────────────────┐  │ │
│  │ (Hidden by default, expandable)             │  │ │
│  └───────────────────────────────────────────────┘  │ │
│                                                   │ │
│  User Input:                                      │ │
│  "What is the capital of France?"                 │ │
│                                                   │ │
└───────────────────────────────────────────────────┘ │
│                                                     │
├─ Output ▼ ────────────────────────────────────────┐ │
│                                                   │ │
│  The capital of France is Paris. Paris is located │ │
│  on the Seine River and is known for landmarks    │ │
│  like the Eiffel Tower, Louvre Museum, and        │ │
│  Notre-Dame Cathedral.                            │ │
│                                                   │ │
└───────────────────────────────────────────────────┘ │
│                                                     │
├─ Usage Statistics ▶ ─────────────────────────────┐ │
│ (Collapsed by default)                           │ │
└───────────────────────────────────────────────────┘ │
│                                                     │
└─────────────────────────────────────────────────────┘