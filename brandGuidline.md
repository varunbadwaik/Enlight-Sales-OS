# Brand Guidelines — Automated Draft Invoice Generation System

## 1. Brand Overview

**Product Name:** Automated Draft Invoice Generation System  
**Short Name:** Invoice Automation  
**Version:** V1.0  
**Brand Category:** B2B AI Accounting Automation  
**Primary Audience:** Dispatch teams, accountants, finance admins, business owners

### Brand Purpose

Make dispatch-to-invoice operations faster, clearer, safer, and easier to audit by combining AI document understanding with deterministic accounting workflows.

### Brand Promise

> **From dispatch documents to a verified draft invoice — automatically, transparently, and safely.**

### Brand Positioning

The product is not positioned as an autonomous accountant.

It is positioned as:

> **An intelligent accounting workflow assistant that reads documents, validates information, connects transactions, and prepares draft invoices for human approval.**

---

# 2. Brand Personality

The product personality should communicate:

| Trait | Meaning |
|---|---|
| Trustworthy | Financial data must feel safe and controlled |
| Precise | Numbers, documents, and references matter |
| Intelligent | AI reduces repetitive manual work |
| Professional | Designed for real business operations |
| Transparent | Users can see where information came from |
| Efficient | Minimize unnecessary manual entry |
| Controlled | Human approval remains important |
| Modern | Clean AI-first experience without gimmicks |

### Personality Statement

> **Calm, precise, intelligent, and dependable.**

Avoid making the product feel:

- Playful
- Experimental
- Overly futuristic
- Aggressive
- Cryptocurrency-like
- Consumer-social
- Casual
- Unnecessarily complicated

---

# 3. Brand Voice

## Primary Voice

The interface should sound:

**Clear + professional + concise + reassuring**

Example:

> Purchase documents validated successfully.

Instead of:

> 🎉 Awesome! AI crushed it!

---

## 3.1 Voice Principles

### Be Clear

Use:

> Vehicle number mismatch detected.

Avoid:

> Something seems to be wrong with the vehicle information.

### Be Specific

Use:

> PO selling rate: ₹58/kg

Avoid:

> Correct pricing detected.

### Be Honest About AI

Use:

> AI extracted this value from the purchase bill. Review recommended.

Avoid:

> AI verified this value as correct.

### Be Action-Oriented

Use:

> Review mismatch

Avoid:

> Something requires attention.

---

# 4. Product Messaging

## Primary Message

> **Automate dispatch-to-draft invoicing with AI-powered document extraction and validation.**

## Secondary Message

> Extract data from purchase bills, POs, LR documents, weighment slips, and dispatch messages — then validate and prepare the transaction in Zoho Books.

## Trust Message

> **AI extracts. Rules validate. Humans approve.**

This should be one of the core brand principles.

---

# 5. Tagline Options

### Primary

> **AI-powered invoicing. Human-controlled accounting.**

### Alternative

> **From dispatch to draft invoice.**

### Alternative

> **Read. Validate. Draft.**

### Alternative

> **Smarter document-to-invoice automation.**

For the product UI, **“Read. Validate. Draft.”** is recommended because it is short and directly describes the workflow.

---

# 6. Visual Identity

## 6.1 Design Direction

The UI should feel like a modern B2B SaaS platform.

Visual characteristics:

- Clean
- Spacious
- Structured
- Data-focused
- Minimal
- Professional
- High readability
- Strong hierarchy
- Subtle use of AI visual language

Avoid:

- Excessive gradients
- Heavy glassmorphism
- Large decorative illustrations
- Neon colors
- Excessive animations
- Dark cyberpunk styling
- Decorative UI that competes with financial data

---

# 7. Color System

The recommended primary palette is based around **deep navy + blue + neutral surfaces + semantic status colors**.

## 7.1 Primary Colors

| Token | Hex | Usage |
|---|---|---|
| `brand-900` | `#0F172A` | Primary text / navigation |
| `brand-800` | `#172554` | Strong brand surfaces |
| `brand-700` | `#1D4ED8` | Primary brand |
| `brand-600` | `#2563EB` | Primary actions |
| `brand-500` | `#3B82F6` | Interactive states |
| `brand-100` | `#DBEAFE` | Light brand backgrounds |
| `brand-50` | `#EFF6FF` | Subtle highlights |

### Primary Brand Color

**Blue — `#2563EB`**

Use for:

- Primary buttons
- Active navigation
- Links
- Selected states
- Progress indicators
- Important interactive elements

---

# 8. Neutral Color System

| Token | Hex | Usage |
|---|---|---|
| `neutral-950` | `#0A0A0A` | Maximum contrast text |
| `neutral-900` | `#171717` | Primary text |
| `neutral-700` | `#404040` | Secondary text |
| `neutral-600` | `#525252` | Supporting text |
| `neutral-500` | `#737373` | Placeholder text |
| `neutral-400` | `#A3A3A3` | Disabled/borders |
| `neutral-300` | `#D4D4D4` | Borders |
| `neutral-200` | `#E5E5E5` | Dividers |
| `neutral-100` | `#F5F5F5` | Secondary backgrounds |
| `neutral-50` | `#FAFAFA` | App background |
| `white` | `#FFFFFF` | Cards / primary surfaces |

---

# 9. Semantic Colors

Semantic colors should communicate state, not decoration.

## Success

```text
success-700: #15803D
success-600: #16A34A
success-100: #DCFCE7
success-50:  #F0FDF4
```

Use for:

- Validated
- Approved
- Completed
- Draft created successfully

Example:

> ✓ Validation passed

---

## Warning

```text
warning-700: #B45309
warning-600: #D97706
warning-100: #FEF3C7
warning-50:  #FFFBEB
```

Use for:

- Review required
- Low document quality
- Missing optional information
- Pending approval

Example:

> Review required

---

## Error

```text
error-700: #B91C1C
error-600: #DC2626
error-100: #FEE2E2
error-50:  #FEF2F2
```

Use for:

- Validation failure
- Integration failure
- Missing critical data
- Duplicate transaction

Example:

> Vehicle mismatch detected

---

## Information

```text
info-700: #0369A1
info-600: #0284C7
info-100: #E0F2FE
info-50:  #F0F9FF
```

Use for:

- AI processing
- Informational notices
- Workflow explanations

---

# 10. Color Usage Rules

### Do

- Use blue for primary actions.
- Use green only for successful states.
- Use amber for warnings.
- Use red only for errors/destructive actions.
- Keep financial data primarily neutral.

### Do Not

- Use red for normal navigation.
- Use green for buttons unrelated to success.
- Use multiple bright colors in one component.
- Use gradients as the primary visual language.
- Use color alone to communicate critical status.

Status should use:

```text
Color + Icon + Text
```

Example:

```text
✓ Validated
```

not just a green dot.

---

# 11. Typography

## Recommended Font

**Inter**

Use Inter across the product for a modern B2B SaaS appearance.

Fallback:

```text
Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif
```

---

# 12. Typography Scale

| Name | Size | Weight | Usage |
|---|---:|---:|---|
| Display | 36px | 700 | Marketing/hero |
| H1 | 30px | 700 | Main page title |
| H2 | 24px | 700 | Section title |
| H3 | 20px | 600 | Card section |
| H4 | 16px | 600 | Component title |
| Body | 14px | 400 | Main UI |
| Body Strong | 14px | 600 | Important values |
| Small | 13px | 400 | Secondary information |
| Caption | 12px | 400 | Metadata |
| Data Large | 24px | 700 | KPI values |

For dense accounting screens, 14px body text is preferred.

---

# 13. Number and Financial Formatting

Financial information must be visually prominent and consistent.

### Currency

Use:

```text
₹58/kg
₹7,37,500
```

Do not use inconsistent formats such as:

```text
Rs 58
INR 58
58 Rupees
```

unless required by a specific external system.

### Quantity

Use:

```text
12,500 KG
12.5 MT
```

### Percentage

Use:

```text
18%
0.10%
```

### Dates

Preferred UI format:

```text
11 Aug 2026
```

Detailed timestamps:

```text
11 Aug 2026, 10:32 AM
```

---

# 14. Layout Principles

## 14.1 App Shell

Recommended:

```text
┌───────────────────────────────────────────────┐
│ Logo              Search        User          │
├────────────┬──────────────────────────────────┤
│            │                                  │
│ Dashboard  │        Main Content              │
│ Dispatches │                                  │
│ Documents  │                                  │
│ Approvals  │                                  │
│ Invoices   │                                  │
│ Exceptions │                                  │
│ Settings   │                                  │
│            │                                  │
└────────────┴──────────────────────────────────┘
```

### Sidebar

Width:

```text
240px – 260px
```

Use compact icons with labels.

---

# 15. Dashboard Design

The dashboard should prioritize operational status.

### KPI cards

```text
┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│ Processing   │ │ Review      │ │ Drafts      │
│     08       │ │     05      │ │     24      │
└─────────────┘ └─────────────┘ └─────────────┘
```

Recommended KPIs:

- Processing
- Validation Errors
- Pending Approval
- Draft Invoices
- Completed

---

# 16. Dispatch Detail Design

The dispatch page is the most important operational screen.

Recommended tabs:

```text
Overview
Documents
Extracted Data
Validation
Zoho
Approval
Audit Log
```

### Overview

Show:

```text
PO Number
Customer
Vendor
Vehicle
Weight
Dispatch Date
Status
```

---

# 17. Document Viewer

Document viewer should allow:

- PDF preview
- Image preview
- Page navigation
- Zoom
- Download where authorized
- Source-field reference

When a user selects an extracted field:

```text
Extracted Field
      ↓
Source Document
      ↓
Relevant page/area
```

This improves trust in AI extraction.

---

# 18. AI Extraction UI

AI processing should be presented as a helpful assistant, not as a magical autonomous system.

### Processing state

```text
◌ Reading purchase bill...
```

Then:

```text
✓ Purchase bill processed
```

### Extraction card

```text
Vehicle Number

MH12AB1234

Source
Purchase Bill — Page 1

AI extracted
```

If review is required:

```text
⚠ Review recommended

Vehicle Number
MH12AB1234

Source is unclear.
```

---

# 19. Validation UI

Validation is a major trust feature.

### Example

```text
Document Validation

✓ Vehicle number
   MH12AB1234 matches all documents

✓ Customer
   XYZ Industries

✓ Weight
   12,500 KG

✓ PO
   PO-98765

✓ Selling rate
   ₹58/kg from Customer PO
```

For errors:

```text
⚠ Vehicle mismatch

Purchase Bill     MH12AB1234
LR                MH12AB5678

[Review documents]
```

---

# 20. Approval UI

Approval must feel controlled and serious.

Example:

```text
Purchase Bill Ready

Vendor
ABC Steel

Customer
XYZ Industries

PO
PO-98765

Amount
₹6,25,000

Validation
✓ Passed

[Reject]        [Approve]
```

Avoid making Approve look like a casual action.

---

# 21. Invoice Draft UI

The invoice screen should clearly show:

```text
DRAFT

Customer
XYZ Industries

PO
PO-98765

Material
HR Plate

Quantity
12,500 KG

Selling Rate
₹58/kg

GST
18%

Vehicle
MH12AB1234
```

Important:

> **DRAFT** must remain visible until the accountant completes the final accounting process.

---

# 22. Selling Rate Presentation

Because selling-rate accuracy is a critical business rule, make its source visible.

Recommended:

```text
Selling Rate

₹58/kg

Source
Customer PO — PO-98765

✓ PO rate applied
```

Do not simply show:

```text
Rate: ₹58
```

The source should be visible when reviewing the invoice.

---

# 23. Status System

Use a consistent status vocabulary.

| Status | Meaning |
|---|---|
| Received | Dispatch received |
| Processing | AI/workflow running |
| Extracted | Data extraction complete |
| Validation Required | Review needed |
| Validated | Validation passed |
| Pending Approval | Admin review required |
| Approved | Admin approved |
| Draft Created | Zoho draft invoice created |
| Completed | Accountant workflow completed |
| Failed | Technical failure |
| Rejected | Approval rejected |

---

# 24. Status Components

### Success

```text
✓ Validated
```

### Processing

```text
◌ Processing
```

### Warning

```text
⚠ Review Required
```

### Error

```text
× Failed
```

### Draft

```text
DRAFT
```

Use a neutral/blue badge for Draft rather than treating it as success or failure.

---

# 25. Icons

Recommended icon library:

**Lucide Icons**

Use icons consistently.

Examples:

| Action | Icon |
|---|---|
| Dashboard | LayoutDashboard |
| Dispatch | Truck |
| Document | FileText |
| Upload | Upload |
| AI | Sparkles |
| Validation | ShieldCheck |
| Approval | CheckCircle |
| Invoice | Receipt |
| Error | CircleAlert |
| Settings | Settings |
| Search | Search |
| Download | Download |
| View | Eye |

Do not use icons purely for decoration.

---

# 26. Buttons

## Primary

Blue background:

```text
[Create Dispatch]
[Approve]
[Create Draft Invoice]
```

## Secondary

Neutral outline:

```text
[View Documents]
[Review]
[Cancel]
```

## Destructive

Red:

```text
[Reject]
[Delete]
```

Only use destructive styling for destructive or irreversible actions.

---

# 27. Button Rules

Buttons should:

- Have clear action labels.
- Use verbs.
- Show loading state.
- Prevent duplicate clicks.
- Be keyboard accessible.

Good:

```text
Create Draft Invoice
Approve Purchase Bill
Review Mismatch
```

Avoid:

```text
Continue
Proceed
Go
Submit
```

when a more specific action can be named.

---

# 28. Forms

Forms should prioritize structured financial data.

Use:

- Labels above fields
- Clear units
- Inline validation
- Required indicators
- Helpful error messages
- Read-only source fields where appropriate

Example:

```text
Selling Rate *
₹ [58.00] / KG

Source
Customer PO — PO-98765
```

---

# 29. Tables

Tables should be used for:

- Dispatch lists
- Documents
- Validation results
- Invoice items
- Audit logs

Recommended columns should remain concise.

Example:

```text
PO        Customer          Vehicle       Weight     Status
PO-98765  XYZ Industries    MH12AB1234    12,500 KG  ✓ Validated
```

Use sticky headers for long tables where appropriate.

---

# 30. Cards

Cards should group related information.

Good card categories:

- Dispatch Summary
- Document Status
- Validation Summary
- Zoho Transaction
- Approval
- Audit History

Avoid excessive cards. Use a flat layout when information is already logically grouped.

---

# 31. Spacing System

Use a consistent 4px-based spacing scale.

```text
4px
8px
12px
16px
20px
24px
32px
40px
48px
64px
```

Default component spacing:

```text
16px
```

Section spacing:

```text
24px – 32px
```

---

# 32. Border Radius

Recommended:

```text
Small controls: 6px
Inputs: 6px
Cards: 10px
Dialogs: 12px
Large surfaces: 14px
```

Avoid excessive pill-shaped components.

Pills should primarily be used for statuses/tags.

---

# 33. Shadows

Use subtle shadows.

Recommended:

```text
Card:
0 1px 2px rgba(0,0,0,0.05)
```

Avoid heavy shadows.

The interface should feel structured rather than floating.

---

# 34. Borders

Use:

```text
#E5E7EB
```

for standard borders.

Borders should provide structure without becoming visually dominant.

---

# 35. Dark Mode

Dark mode can be supported in a later version.

If enabled, preserve:

- Contrast
- Status colors
- Document readability
- Financial number visibility

Do not simply invert the light theme.

---

# 36. Responsive Design

### Desktop

Primary target:

```text
1440px
```

Support:

```text
1280px+
```

### Tablet

Support:

```text
768px+
```

### Mobile

Mobile should support:

- Dashboard overview
- Approval
- Validation review
- Dispatch status

Complex document comparison can remain optimized for desktop.

---

# 37. Accessibility

Target:

**WCAG 2.2 AA**

Requirements:

- Keyboard navigation
- Visible focus states
- Sufficient color contrast
- Semantic HTML
- Screen-reader labels
- Accessible forms
- Accessible dialogs
- Status messages that are not color-only

Example:

Do not communicate:

```text
Green = Passed
Red = Failed
```

Use:

```text
✓ Passed
× Failed
```

---

# 38. Motion and Animation

Animations should be subtle.

Use for:

- Loading
- Page transitions
- Status changes
- Toast notifications
- Modal opening

Avoid:

- Large animated backgrounds
- Constant moving elements
- Excessive AI animations
- Long transitions

Recommended duration:

```text
150ms – 250ms
```

---

# 39. Toast Notifications

### Success

> Draft invoice created successfully.

### Error

> Draft invoice could not be created. Review the Zoho integration status.

### Warning

> Vehicle mismatch requires review.

### Info

> AI extraction is still processing.

Toasts should not be the only place critical information appears.

---

# 40. Empty States

Empty states should explain what the user can do.

Example:

```text
No dispatches yet

Create your first dispatch to begin
document-to-invoice automation.

[Create Dispatch]
```

Avoid:

> No data.

---

# 41. Loading States

Use skeleton loaders for page-level loading.

Example:

```text
┌──────────────────────────┐
│ █████████████            │
│ ██████                   │
│ █████████████████        │
└──────────────────────────┘
```

For AI:

```text
◌ Reading documents
◌ Extracting fields
◌ Validating information
```

---

# 42. Error Messages

Error messages must answer:

1. What happened?
2. Why?
3. What can the user do?

Example:

```text
Vehicle mismatch detected.

The vehicle number on the LR does not match
the weighment slip.

LR: MH12AB5678
Weighment Slip: MH12AB1234

[Review Documents]
```

Avoid technical messages such as:

> HTTP 500 Internal Server Error

unless shown in a technical details section.

---

# 43. AI Transparency

The UI should clearly distinguish:

```text
AI Extracted
```

from:

```text
System Validated
```

and:

```text
Human Approved
```

These are different trust levels.

### Recommended visual hierarchy

```text
AI Extracted
     ↓
System Validated
     ↓
Human Approved
```

This is a central brand principle.

---

# 44. Trust Indicators

Use small, contextual indicators:

```text
AI Extracted
Source: Purchase Bill

✓ Cross-document match

✓ Admin approved

Draft created in Zoho Books
```

Do not use meaningless AI badges everywhere.

---

# 45. Copywriting Guidelines

## Use

- Draft Invoice
- Validation Required
- Review Mismatch
- AI Extracted
- Source Document
- Customer PO Rate
- Admin Approval
- Zoho Books
- Accountant Review

## Avoid

- Magic
- Autonomous accounting
- AI knows everything
- Zero-error AI
- Fully automatic accounting
- Guaranteed accuracy
- One-click compliance

---

# 46. Marketing Language Restrictions

Never claim:

> 100% accurate AI invoices.

Instead:

> AI-assisted invoice preparation with cross-document validation and human approval.

Never claim:

> Fully autonomous accounting.

Instead:

> Automated workflow with human-controlled approval.

Never claim:

> Automatically handles all GST compliance.

Instead:

> Prepares accounting data while final statutory processing remains with the accountant.

---

# 47. Logo Direction

The logo should communicate:

```text
Document
+
Automation
+
Validation
+
Finance
```

### Recommended concept

A minimal document/invoice icon combined with a checkmark or workflow node.

Example concept:

```text
┌──────────┐
│  ╱       │
│ ───────  │
│ ───────  │ ✓
│ ───────  │
└──────────┘
```

Avoid using:

- Currency symbols as the main logo
- Robot heads
- Generic AI brains
- Overly complex illustrations
- Lightning bolts as the primary identity

---

# 48. Logo Usage

Maintain:

- Minimum clear space
- Minimum size
- Monochrome version
- Light-background version
- Dark-background version

Do not:

- Stretch
- Rotate
- Add shadows
- Change brand colors arbitrarily
- Add gradients
- Place over busy images

---

# 49. Illustration Style

If illustrations are required:

Use:

- Simple line illustrations
- Geometric shapes
- Minimal data-flow diagrams
- Document + workflow metaphors

Preferred style:

```text
Minimal
Technical
Professional
Flat
```

Avoid cartoon characters for core accounting workflows.

---

# 50. Data Visualization

Charts should prioritize clarity.

Recommended:

- Bar charts
- Line charts
- Simple status distributions
- Processing funnel

Use semantic colors sparingly.

Example:

```text
Dispatches
████████████████  120

Validated
██████████████    105

Review
███               10

Failed
█                 5
```

Do not use 3D charts.

---

# 51. Dashboard Information Hierarchy

Priority:

### Level 1

Critical operational state:

- Validation errors
- Pending approvals
- Failed workflows

### Level 2

Workflow progress:

- Processing
- Extracted
- Validated
- Draft created

### Level 3

Operational metrics:

- Total dispatches
- Average processing time
- Documents processed

### Level 4

Historical analytics.

---

# 52. Navigation

Recommended navigation:

```text
Dashboard

Operations
  ├── Dispatches
  ├── Documents
  └── Exceptions

Accounting
  ├── Purchase Bills
  ├── Approvals
  └── Draft Invoices

System
  ├── Audit Logs
  ├── Integrations
  └── Settings
```

Keep the navigation stable across the product.

---

# 53. Search

Global search should support:

- PO number
- Vehicle number
- Customer
- Vendor
- LR number
- Invoice number
- Dispatch ID

Example:

```text
Search PO, vehicle, customer, LR...
```

---

# 54. Filters

Dispatch filters:

```text
Status
Customer
Vendor
Date
Vehicle
PO
Validation
Approval
```

Use multi-select filters where useful.

---

# 55. Audit Log Design

Audit logs should look technical but readable.

Example:

```text
10:41 AM

Draft Invoice Created

Invoice:
INV-456

Selling Rate:
₹58/kg

Source:
Customer PO — PO-98765

By:
Automation
```

For corrections:

```text
10:32 AM

Vehicle Number Corrected

Before:
MH12AB1234

After:
MH12AB5678

By:
Accountant

Reason:
Corrected against LR
```

---

# 56. Brand Principles for AI

The product should communicate three principles everywhere:

## 1. AI Reads

AI handles repetitive document understanding.

## 2. Rules Validate

Deterministic rules verify critical business information.

## 3. Humans Approve

People retain control over financially important decisions.

Visual shorthand:

```text
AI
↓
READ

RULES
↓
VALIDATE

HUMAN
↓
APPROVE
```

---

# 57. Design Tokens

Recommended CSS variables:

```css
:root {
  --brand-primary: #2563EB;
  --brand-primary-hover: #1D4ED8;

  --text-primary: #171717;
  --text-secondary: #525252;
  --text-muted: #737373;

  --surface-primary: #FFFFFF;
  --surface-secondary: #FAFAFA;
  --surface-muted: #F5F5F5;

  --border-default: #E5E5E5;

  --success: #16A34A;
  --success-bg: #F0FDF4;

  --warning: #D97706;
  --warning-bg: #FFFBEB;

  --error: #DC2626;
  --error-bg: #FEF2F2;

  --info: #0284C7;
  --info-bg: #F0F9FF;

  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 12px;
}
```

---

# 58. Tailwind Design Direction

Use Tailwind utility classes consistently.

Example primary button:

```tsx
<Button className="bg-blue-600 hover:bg-blue-700 text-white">
  Create Draft Invoice
</Button>
```

Example success badge:

```tsx
<Badge className="bg-green-50 text-green-700 border-green-200">
  ✓ Validated
</Badge>
```

Example warning badge:

```tsx
<Badge className="bg-amber-50 text-amber-700 border-amber-200">
  ⚠ Review Required
</Badge>
```

---

# 59. Component Naming

Use semantic component names:

```text
DispatchCard
DispatchStatus
DocumentViewer
DocumentList
ExtractionField
ValidationSummary
ValidationIssue
ApprovalPanel
InvoicePreview
SellingRateSource
AuditTimeline
IntegrationStatus
WorkflowProgress
```

Avoid generic names such as:

```text
Box1
Card2
BlueCard
Thing
```

---

# 60. Design System Structure

Recommended frontend structure:

```text
apps/web/
├── app/
├── components/
│   ├── ui/
│   ├── dashboard/
│   ├── dispatch/
│   ├── documents/
│   ├── validation/
│   ├── approval/
│   ├── invoices/
│   └── audit/
├── styles/
│   └── globals.css
├── lib/
└── types/
```

---

# 61. Brand Consistency Rules

Every new screen must answer:

1. What is the user trying to do?
2. What is the current workflow state?
3. What information is most important?
4. What action should the user take?
5. Is the information AI-extracted, system-validated, or human-approved?

If these are unclear, the screen needs redesign.

---

# 62. Design QA Checklist

Before releasing a screen:

### Visual

- [ ] Correct brand colors
- [ ] Correct typography
- [ ] Consistent spacing
- [ ] Consistent border radius
- [ ] No unnecessary gradients
- [ ] Correct icon usage

### UX

- [ ] Clear primary action
- [ ] Clear workflow status
- [ ] Useful empty state
- [ ] Useful loading state
- [ ] Useful error state

### AI

- [ ] AI-generated data is clearly identified
- [ ] Source document is accessible
- [ ] Validation state is visible
- [ ] Human approval state is visible

### Accounting

- [ ] Selling rate source is visible
- [ ] Draft status is visible
- [ ] Critical financial values are readable
- [ ] Destructive actions require confirmation

### Accessibility

- [ ] Keyboard navigation
- [ ] Focus states
- [ ] Color contrast
- [ ] Labels
- [ ] Screen-reader support

---

# 63. Product Experience Flow

The ideal user experience should feel like:

```text
UPLOAD
  ↓
PROCESSING
  ↓
AI EXTRACTED
  ↓
VALIDATED
  ↓
APPROVED
  ↓
DRAFT CREATED
```

The user should always understand:

> **What happened? What is happening now? What needs my attention?**

---

# 64. Brand Summary

### Brand Personality

**Precise. Intelligent. Professional. Trustworthy.**

### Primary Color

**Blue — `#2563EB`**

### Typography

**Inter**

### UI Style

**Modern B2B SaaS / clean financial operations**

### Primary Tagline

**Read. Validate. Draft.**

### Brand Promise

**Automate repetitive document-to-invoice work while keeping financial decisions under human control.**

### Core Product Principle

```text
AI READS
   ↓
RULES VALIDATE
   ↓
HUMANS APPROVE
```

---

# 65. Final Brand Rule

The product should never look like an AI experiment.

It should look like a **trusted financial operations platform that happens to use AI**.

The visual system must communicate:

```text
CONFIDENCE
   +
CLARITY
   +
CONTROL
   +
AUTOMATION
```

Every design decision should support those four qualities.
