# LaboratoryImagingAutocomplete Component

A specialized autocomplete component for searching and selecting laboratory tests, imaging procedures, and special medical tests. Built on top of the `base-autocomplete` component and integrated with the comprehensive test database.

## Features

- 🔍 **Smart Search**: Debounced search with 300ms delay for optimal performance
- 🏷️ **Rich Data Display**: Shows test categories, preparation instructions, fasting requirements, and additional metadata
- 🎯 **Type Filtering**: Filter results by test type (Laboratory, Imaging, Special Test, Procedure)
- 📱 **Responsive Design**: Works seamlessly across different screen sizes
- 🌙 **Dark Mode Support**: Fully compatible with light and dark themes
- ⚡ **Performance Optimized**: Efficient API calls and state management

## Installation

The component is already included in your project at:

```
components/ui/laboratory-imaging-autocomplete.tsx
```

## Basic Usage

```tsx
import LaboratoryImagingAutocomplete, {
  TestSuggestion,
} from "@/components/ui/laboratory-imaging-autocomplete";

function MyComponent() {
  const [selectedTest, setSelectedTest] = React.useState<TestSuggestion | null>(
    null
  );

  return (
    <LaboratoryImagingAutocomplete
      value={selectedTest}
      onValueChange={setSelectedTest}
      placeholder="Search for tests..."
      limit={15}
      showPreparationInfo={true}
      showFastingIndicator={true}
    />
  );
}
```

## Props

| Prop                   | Type                                                                | Default                                    | Description                               |
| ---------------------- | ------------------------------------------------------------------- | ------------------------------------------ | ----------------------------------------- |
| `value`                | `TestSuggestion \| null`                                            | `undefined`                                | Currently selected test                   |
| `onValueChange`        | `(value: TestSuggestion \| null) => void`                           | `undefined`                                | Callback when selection changes           |
| `placeholder`          | `string`                                                            | `"Search Laboratory Tests and Imaging..."` | Input placeholder text                    |
| `className`            | `string`                                                            | `undefined`                                | Additional CSS classes                    |
| `disabled`             | `boolean`                                                           | `false`                                    | Whether the component is disabled         |
| `limit`                | `number`                                                            | `15`                                       | Maximum number of search results          |
| `filterByType`         | `Array<"Laboratory" \| "Imaging" \| "Special Test" \| "Procedure">` | `undefined`                                | Filter results by test type               |
| `showPreparationInfo`  | `boolean`                                                           | `true`                                     | Whether to show preparation instructions  |
| `showFastingIndicator` | `boolean`                                                           | `true`                                     | Whether to show fasting requirement badge |

## TestSuggestion Interface

```tsx
export interface TestSuggestion {
  id: string;
  name: string;
  category: string[];
  type: "Laboratory" | "Imaging" | "Special Test" | "Procedure";
  preparation?: string[];
  fasting_required?: boolean;
  insurance_coverage?: boolean;
  cost_estimate?: number;
  turnaround_time?: string;
  sample_type?: string;
}
```

## Advanced Usage

### Filter by Test Type

```tsx
// Show only Laboratory tests
<LaboratoryImagingAutocomplete
  filterByType={["Laboratory"]}
  onValueChange={(test) => console.log("Lab test:", test)}
/>

// Show only Imaging tests
<LaboratoryImagingAutocomplete
  filterByType={["Imaging"]}
  onValueChange={(test) => console.log("Imaging:", test)}
/>

// Show multiple types
<LaboratoryImagingAutocomplete
  filterByType={["Laboratory", "Imaging"]}
  onValueChange={(test) => console.log("Test:", test)}
/>
```

### Controlled Component with External State

```tsx
function ControlledSearch() {
  const [tests, setTests] = React.useState<TestSuggestion[]>([]);
  const [selectedTest, setSelectedTest] = React.useState<TestSuggestion | null>(
    null
  );

  const handleTestSelect = (test: TestSuggestion | null) => {
    setSelectedTest(test);
    // Add to your tests list
    if (test) {
      setTests((prev) => [...prev, test]);
    }
  };

  return (
    <div>
      <LaboratoryImagingAutocomplete
        value={selectedTest}
        onValueChange={handleTestSelect}
        placeholder="Add a test to the prescription..."
      />

      {/* Display selected tests */}
      <div className="mt-4">
        <h3>Selected Tests ({tests.length})</h3>
        {tests.map((test) => (
          <div key={test.id} className="p-2 border rounded">
            <strong>{test.name}</strong>
            <span className="ml-2 text-sm text-gray-500">({test.type})</span>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### With Custom Styling

```tsx
<LaboratoryImagingAutocomplete
  className="w-full max-w-md"
  placeholder="Find your test..."
  limit={10}
  showPreparationInfo={false} // Hide preparation info for cleaner look
  showFastingIndicator={true}
/>
```

## Demo

A comprehensive demo is available at `/laboratory-imaging-demo` showing:

- Full-featured search with all options
- Filtered searches (Laboratory only, Imaging only, Special Tests only)
- Selected test details display
- Search history
- Various usage examples

Visit `/laboratory-imaging-demo` to see it in action.

## Integration with Prescription System

Here's how you might integrate this into a prescription form:

```tsx
function PrescriptionForm() {
  const [tests, setTests] = React.useState<TestSuggestion[]>([]);

  const addTest = (test: TestSuggestion | null) => {
    if (test && !tests.find((t) => t.id === test.id)) {
      setTests((prev) => [...prev, test]);
    }
  };

  const removeTest = (testId: string) => {
    setTests((prev) => prev.filter((t) => t.id !== testId));
  };

  return (
    <form className="space-y-4">
      <div>
        <label>Laboratory Tests & Imaging</label>
        <LaboratoryImagingAutocomplete
          onValueChange={addTest}
          filterByType={["Laboratory", "Imaging"]}
          limit={20}
        />
      </div>

      {tests.length > 0 && (
        <div className="space-y-2">
          <h4>Selected Tests:</h4>
          {tests.map((test) => (
            <div
              key={test.id}
              className="flex items-center justify-between p-2 border rounded"
            >
              <div>
                <span className="font-medium">{test.name}</span>
                {test.fasting_required && (
                  <Badge variant="outline" className="ml-2">
                    Fasting
                  </Badge>
                )}
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeTest(test.id)}
              >
                Remove
              </Button>
            </div>
          ))}
        </div>
      )}
    </form>
  );
}
```

## API Integration

The component makes POST requests to `/api/autocomplete/tests` with the following payload:

```json
{
  "text": "search query",
  "limit": 15
}
```

The API returns suggestions in this format:

```json
{
  "suggestions": [
    {
      "id": "test001",
      "name": "CBC",
      "category": ["Blood Test", "Hematology"],
      "type": "Laboratory",
      "preparation": ["None required"],
      "fasting_required": false
    }
  ],
  "query": "search query",
  "total": 1,
  "timestamp": "2025-12-27T23:14:42.496Z"
}
```

## Dependencies

- React 18+
- `@/components/ui/base-autocomplete`
- `@/components/ui/badge`
- `lucide-react` (for icons)
- `@/lib/utils` (for cn function)

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile responsive design
- Touch-friendly interface

## Performance Notes

- Uses debounced search (300ms) to reduce API calls
- Efficient state management with useCallback and useMemo
- Groups results by type for better UX
- Limits results to prevent overwhelming the UI

## Accessibility

- ARIA labels and roles
- Keyboard navigation support
- Screen reader friendly
- High contrast mode compatible
