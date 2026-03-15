# Organization-Prefixed Numbering System

## Overview

The SmartLenderUp platform now uses **organization-prefixed numbering** to clearly differentiate entities across multiple businesses. This ensures that clients, loans, staff, and products from different organizations are easily identifiable.

## Numbering Format

All entity numbers now follow this pattern:
```
{ORG_CODE}-{ENTITY_TYPE}{NUMBER}
```

### Examples

#### BV Funguo Ltd (Code: BVF)
- **Clients**: `BVF-CL00001`, `BVF-CL00002`, `BVF-CL00003`, ...
- **Loans**: `BVF-LN00001`, `BVF-LN00002`, `BVF-LN00003`, ...
- **Staff**: `BVF-EMP001`, `BVF-EMP002`, `BVF-EMP003`, ...
- **Products**: `BVF-PROD123456`, `BVF-PROD234567`, ...

#### Equity Bank (Code: EQB)
- **Clients**: `EQB-CL00001`, `EQB-CL00002`, `EQB-CL00003`, ...
- **Loans**: `EQB-LN00001`, `EQB-LN00002`, `EQB-LN00003`, ...
- **Staff**: `EQB-EMP001`, `EQB-EMP002`, `EQB-EMP003`, ...
- **Products**: `EQB-PROD123456`, `EQB-PROD234567`, ...

#### Mwananchi SACCO (Code: MSA)
- **Clients**: `MSA-CL00001`, `MSA-CL00002`, `MSA-CL00003`, ...
- **Loans**: `MSA-LN00001`, `MSA-LN00002`, `MSA-LN00003`, ...
- **Staff**: `MSA-EMP001`, `MSA-EMP002`, `MSA-EMP003`, ...
- **Products**: `MSA-PROD123456`, `MSA-PROD234567`, ...

## Organization Code Generation

### Automatic Generation

Organization codes are automatically generated based on the organization name:

1. **Multi-word names**: Take the first letter of the first 3 words
   - "BV Funguo Ltd" → **BVF**
   - "Kenya Women Finance Trust" → **KWF**
   - "Safaricom Digital Lending" → **SDL**

2. **Single-word names**: Take the first 3 letters
   - "Equity" → **EQU**
   - "Jamii" → **JAM**
   - "Sidian" → **SID**

3. **Special characters**: Removed automatically
   - "M-Pesa Trust" → "MPT" (hyphen removed)
   - "Co-op Bank" → "COB" (hyphen removed)

### Manual Override

Administrators can manually set a custom organization code in the organization settings. The code must be:
- **2-4 characters** long
- **Uppercase letters** and numbers only
- **Unique** across all organizations

### Benefits

1. **Clear Identification**: Instantly know which organization an entity belongs to
2. **Multi-Tenant Support**: Essential for platforms serving multiple businesses
3. **Reporting**: Easy filtering and grouping by organization
4. **Data Integrity**: Prevents confusion when data from multiple organizations is viewed together
5. **Audit Trail**: Clear ownership and accountability

## Technical Implementation

### Database Schema

The `organizations` table includes an `organization_code` column:
```sql
ALTER TABLE public.organizations 
ADD COLUMN organization_code TEXT UNIQUE;
```

### Number Generation Functions

All number generation functions now accept `organizationId` and automatically prefix with the org code:

```typescript
// Client numbers
generateClientNumber(organizationId) → "BVF-CL00001"

// Loan numbers
generateLoanNumber(organizationId) → "BVF-LN00001"

// Employee numbers
generateEmployeeNumber(organizationId) → "BVF-EMP001"

// Product codes
generateProductCode(organizationId) → "BVF-PROD123456"
```

### Organization Scoping

All queries are automatically scoped to the organization:
- Each organization's numbering starts from 1
- Numbers are unique **within** each organization
- Numbers are **independent** across organizations

Example:
- BV Funguo can have `BVF-CL00001`
- Equity Bank can also have `EQB-CL00001`
- Both are valid and don't conflict

## Migration Notes

### Existing Data

For organizations created before this update:
1. Organization codes are **auto-generated** from the organization name
2. Existing client/loan numbers **remain unchanged**
3. New entities created will use the prefixed format

### Backward Compatibility

The system supports both formats:
- **Old format**: `CL00001`, `LN001`, `EMP001`
- **New format**: `BVF-CL00001`, `BVF-LN00001`, `BVF-EMP001`

Regex patterns match both formats during parsing and validation.

## Best Practices

### For Administrators

1. **Set Organization Code Early**: Define your org code during setup
2. **Choose Memorable Codes**: Use recognizable acronyms
3. **Keep It Short**: 2-3 characters is ideal
4. **Avoid Confusion**: Don't use similar codes (e.g., "KCB" and "KBC")

### For Developers

1. **Always Pass Organization ID**: All number generation functions require it
2. **Use Helper Functions**: Don't manually construct numbers
3. **Scope All Queries**: Always filter by `organization_id`
4. **Display Full Numbers**: Show the prefix in all UI elements

## Examples in Use

### Client Registration Form
```
Client Number: BVF-CL00156
Organization: BV Funguo Ltd
Name: John Kamau
```

### Loan Application
```
Loan Number: BVF-LN00042
Client: BVF-CL00156 (John Kamau)
Organization: BV Funguo Ltd
Amount: KES 50,000
```

### Staff Dashboard
```
Employee: BVF-EMP012
Name: Mary Wanjiku
Organization: BV Funguo Ltd
Role: Loan Officer
```

### Multi-Organization Report
```
Organization    | Clients      | Active Loans | Staff
----------------|--------------|--------------|-------
BVF (Funguo)    | BVF-CL00001+ | BVF-LN00001+ | 15
EQB (Equity)    | EQB-CL00001+ | EQB-LN00001+ | 42
MSA (Mwananchi) | MSA-CL00001+ | MSA-LN00001+ | 8
```

## FAQs

**Q: Can I change my organization code after it's set?**  
A: Yes, but it's not recommended as it will affect all future entity numbers. Existing numbers won't change.

**Q: What happens if two organizations have similar names?**  
A: The system ensures uniqueness by adding numbers (e.g., BVF, BVF2, BVF3).

**Q: Can I use numbers in my organization code?**  
A: Yes, but letters are recommended for clarity.

**Q: Is the organization code case-sensitive?**  
A: No, all codes are stored and displayed in uppercase.

**Q: What if I want a specific code like "KCB"?**  
A: Administrators can manually set custom codes in organization settings (if not already taken).
