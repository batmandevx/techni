# TenchiOne Components

## Layout Components

### Sidebar
Main navigation sidebar with active state indicators, search integration, and responsive design.

### FloatingActionButton
Quick action button that provides access to commonly used features:
- AI Assistant
- Upload Data
- New Order

### ClientLayout
Root layout wrapper that includes:
- Sidebar navigation
- Floating action button
- Toast notifications (react-hot-toast)

## UI Components

### Skeleton
Loading skeleton components for better UX:
- `Skeleton` - Basic skeleton loader
- `CardSkeleton` - Card-shaped skeleton
- `TableSkeleton` - Table rows skeleton
- `ChartSkeleton` - Chart area skeleton

### EmptyState
Displays when no data is available:
- `type`: 'data' | 'search' | 'file' | 'generic'
- Customizable title, description, and action

### Notification
Toast notification system:
- Success, error, warning, info variants
- Auto-dismiss with countdown
- Manual close option

### GlobalSearch
Command+K search modal:
- Keyboard shortcut (Cmd/Ctrl + K)
- Arrow key navigation
- Quick access to all pages

## Error Handling

### ErrorFallback
Full-page error display with:
- Error details
- Try again button
- Go home link

### ErrorBoundary
React error boundary for catching component errors.

## Usage Examples

### Skeleton Loading
```tsx
import { CardSkeleton, TableSkeleton } from '@/components/ui/Skeleton';

// While loading
{isLoading ? (
  <>
    <CardSkeleton />
    <TableSkeleton rows={5} />
  </>
) : (
  <ActualContent />
)}
```

### Empty State
```tsx
import EmptyState from '@/components/ui/EmptyState';

{data.length === 0 && (
  <EmptyState
    type="data"
    title="No orders found"
    description="Get started by creating your first order"
    actionLabel="Create Order"
    actionHref="/orders"
  />
)}
```

### Notification Hook
```tsx
import { useNotification } from '@/components/ui/Notification';

function MyComponent() {
  const { show, NotificationContainer } = useNotification();
  
  const handleAction = () => {
    show('success', 'Operation successful', 'Your changes have been saved');
  };
  
  return (
    <>
      <button onClick={handleAction}>Save</button>
      <NotificationContainer />
    </>
  );
}
```
