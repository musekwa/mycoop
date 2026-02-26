---
description: Add farmers to cooperatives workflow
---

# Add Member to Cooperative Workflow

This workflow allows adding existing farmers as members to cooperatives through the "Adicionar Membros" popup in the group members list.

## Steps to Add Members to Cooperative

### 1. Navigate to Group Members List
- Go to the cooperative profile page (`/(profiles)/group`)
- Navigate to the "Membros" tab
- Tap the menu button (three dots) in the header
- Select "Adicionar Membro" from the popup menu

### 2. Select Farmer to Add
- The system displays a list of all available farmers who are not already members of this cooperative
- Each farmer item shows:
  - Full name (surname + other_names)
  - Phone number
  - Selection indicator (radio button)
- Tap on a farmer to select them
- Selected farmers are highlighted with a green border and checkmark

### 3. Confirm Addition
- After selecting a farmer, tap the "Adicionar Membro" button
- The system validates that a farmer is selected
- If validation passes, the farmer is added to the cooperative
- A success confirmation dialog appears
- Tap "OK" to return to the members list

## Technical Implementation

### Database Operations
- **Query**: Fetches all farmers not already in the group
- **Insert**: Adds new entry to `GROUP_MEMBERS` table with:
  - Generated UUID as ID
  - Group ID from current resource
  - Selected farmer's ID
  - Member type: 'FARMER'
  - Current timestamp

### Key Components
- **File**: `src/app/(aux)/actors/org-membership/add-member.tsx`
- **Route**: `/(aux)/actors/org-membership/add-member`
- **Schema**: Zod validation for farmer selection
- **Form**: React Hook Form with controller

### Error Handling
- Shows loading state while fetching available farmers
- Validates farmer selection before submission
- Displays success/error alerts
- Handles database errors gracefully

### Navigation Flow
1. Group members list → Add member screen
2. Add member screen → Back to members list (after success/cancel)

## Important Notes

- Only shows farmers who are not already members of the cooperative
- Uses current group context from `useActionStore()`
- Automatically updates the members list after successful addition
- Maintains consistent UI with the rest of the app
- Includes proper TypeScript typing and error handling

## Dependencies

- React Hook Form for form management
- Zod for validation
- PowerSync for database operations
- Expo Router for navigation
- Action Store for current resource context
