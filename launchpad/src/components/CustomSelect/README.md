# CustomSelect Component

A modern, customizable select component that mimics the clean UI of shadcn/ui select while matching the existing onboarding input styling.

## Features

- **Modern Design**: Clean, accessible UI with smooth animations
- **Multiple Modes**: Single select, multi-select, and searchable options
- **Keyboard Navigation**: Full keyboard support (Arrow keys, Enter, Escape)
- **Responsive**: Mobile-friendly design
- **Customizable**: Easy to style and configure
- **Accessible**: Proper ARIA attributes and focus management

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `options` | `Array` | `[]` | Array of options. Can be strings or objects with `{value, label}` |
| `value` | `any` | `undefined` | Current selected value(s) |
| `onChange` | `function` | - | Callback when selection changes |
| `placeholder` | `string` | `"Select an option..."` | Placeholder text |
| `isMulti` | `boolean` | `false` | Enable multi-select mode |
| `isSearchable` | `boolean` | `false` | Enable search functionality |
| `isDisabled` | `boolean` | `false` | Disable the select |
| `className` | `string` | `""` | Additional CSS classes |
| `onSearchQueryChange` | `function` | - | Callback for search input changes |
| `isLoading` | `boolean` | `false` | Show loading state |
| `loadingMessage` | `string` | `"Loading..."` | Loading message text |
| `noOptionsMessage` | `string` | `"No options available"` | Message when no options |

## Usage Examples

### Basic Single Select
```jsx
<CustomSelect
  options={[
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' }
  ]}
  value={selectedValue}
  onChange={setSelectedValue}
  placeholder="Choose an option..."
/>
```

### Multi-Select
```jsx
<CustomSelect
  options={careerInterests}
  value={selectedInterests}
  onChange={setSelectedInterests}
  placeholder="Select interests..."
  isMulti={true}
/>
```

### Searchable Select
```jsx
<CustomSelect
  options={colleges}
  value={selectedCollege}
  onChange={setSelectedCollege}
  placeholder="Search colleges..."
  isSearchable={true}
  onSearchQueryChange={handleSearch}
  isLoading={isSearching}
  loadingMessage="Searching..."
/>
```

### With String Options
```jsx
<CustomSelect
  options={['Yes', 'No']}
  value={decision}
  onChange={setDecision}
  placeholder="Make a decision..."
/>
```

## Styling

The component uses CSS custom properties and follows the existing onboarding design system:

- **Colors**: Matches `form-input` styling
- **Borders**: 2px solid with hover/focus states
- **Typography**: Inherits from parent font family
- **Spacing**: Consistent with other form elements
- **Animations**: Smooth transitions for all interactions

## Accessibility

- **Keyboard Navigation**: Full arrow key support
- **Screen Reader**: Proper ARIA labels and descriptions
- **Focus Management**: Visible focus indicators
- **High Contrast**: Meets accessibility standards

## Migration from react-select

To replace react-select with CustomSelect:

1. **Import**: Replace `react-select` import with `CustomSelect`
2. **Props Mapping**:
   - `value` → `value` (same)
   - `onChange` → `onChange` (same)
   - `isMulti` → `isMulti` (same)
   - `onInputChange` → `onSearchQueryChange`
   - `isLoading` → `isLoading` (same)
   - `loadingMessage` → `loadingMessage` (string instead of component)
3. **Remove**: No need for `react-select` specific styling

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- IE11+ (with polyfills for Array methods)
- Mobile browsers (iOS Safari, Chrome Mobile)


