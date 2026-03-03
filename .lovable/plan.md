

# SEO & GEO – Sistema Inteligente de Configuração

## Scope Assessment

This is a very large system. To deliver quality and avoid errors, I'll implement it in **Phase 1** (core foundation) now, with subsequent phases buildable on top.

**Phase 1 (this implementation):**
- Database tables for stages, questions, rules, and responses
- Admin menu entry "SEO & GEO" with subpages
- Checklist configuration page (CRUD stages + questions)
- Dynamic checklist with progress calculation
- Question field types and validation config
- Conditional rules engine (basic)
- Dashboard with configurable score

**Future phases (on request):**
- GEO module (semantic strategy, FAQ, entity config)
- Integration management (Search Console, Analytics OAuth)
- Monitoring & alerts
- Learning Hub
- Version history with restore
- Drag-and-drop reordering

---

## Database Tables (6 new tables)

### `seo_stages`
Stages/steps of the SEO checklist.
- `id`, `name`, `description`, `order_index`, `importance_weight` (numeric), `min_completion_pct` (default 100), `is_active`, `requires_previous_complete` (bool), `created_at`, `updated_at`

### `seo_questions`
Configurable questions within each stage.
- `id`, `stage_id` (FK), `label`, `description`, `field_type` (enum: text, textarea, wysiwyg, toggle, upload, html_code, json_ld, number, url, domain, api_integration), `is_required`, `weight` (numeric), `seo_impact` (low/medium/high), `min_chars`, `max_chars`, `validation_regex`, `error_message`, `success_message`, `order_index`, `is_active`, `applies_to` (jsonb - page types), `created_at`, `updated_at`

### `seo_responses`
User answers to each question.
- `id`, `question_id` (FK), `page_reference` (text - which page), `value` (jsonb), `status` (complete/incomplete/critical), `updated_by` (uuid), `created_at`, `updated_at`

### `seo_rules`
Conditional validation rules.
- `id`, `name`, `condition_field`, `condition_operator` (lt, gt, eq, contains, not_exists, etc.), `condition_value`, `result_status` (needs_improvement/critical/warning), `result_message`, `is_active`, `order_index`, `created_at`

### `seo_config`
Global SEO configuration (score formula, dashboard widgets, etc.).
- `id`, `key`, `value` (jsonb), `category`, `description`, `created_at`, `updated_at`

### `seo_history`
Change log for SEO modifications.
- `id`, `user_id`, `entity_type` (stage/question/response/rule), `entity_id`, `action` (create/update/delete), `old_value` (jsonb), `new_value` (jsonb), `created_at`

All tables will have RLS: admin/super_admin for management, editor for viewing/responding.

---

## Admin Pages (4 new pages)

### 1. SEO Dashboard (`/admin/seo`)
- Overall score (calculated from weighted responses)
- Progress bars per stage
- Critical errors list
- Recommendations

### 2. Checklist & Responses (`/admin/seo/checklist`)
- Accordion per stage showing questions
- Status indicators (green/yellow/red)
- Inline editing of responses
- Auto-calculated progress per stage

### 3. Configuration (`/admin/seo/config`)
- Tabs: Stages | Questions | Rules | Settings
- CRUD for stages with weight/importance config
- CRUD for questions with full field-type config
- CRUD for conditional rules
- Global settings (score formula, dashboard widgets)

### 4. History (`/admin/seo/history`)
- Table showing who changed what and when
- Filterable by entity type, user, date

---

## Files to Create

| File | Purpose |
|------|---------|
| `src/pages/admin/SeoGeo.tsx` | Dashboard page |
| `src/pages/admin/SeoChecklist.tsx` | Checklist with responses |
| `src/pages/admin/SeoConfig.tsx` | Configuration (stages, questions, rules) |
| `src/pages/admin/SeoHistory.tsx` | Change history |

## Files to Modify

| File | Change |
|------|--------|
| `src/components/admin/AdminLayout.tsx` | Add "SEO & GEO" menu with sub-items |
| `src/App.tsx` | Add routes for 4 new pages |

---

## Menu Structure

```text
SEO & GEO (icon: Search)
├── Dashboard        → /admin/seo
├── Checklist        → /admin/seo/checklist
├── Configuração     → /admin/seo/config
└── Histórico        → /admin/seo/history
```

The menu will use a parent item with sub-navigation handled via tabs within the config page (Stages | Questions | Rules | Settings).

---

## Question Field Types

Each question renders a different input based on `field_type`:
- **text**: Input with char limits
- **textarea**: Textarea with char counter
- **wysiwyg**: React Quill editor
- **toggle**: Switch component
- **upload**: File upload
- **html_code/json_ld**: Code editor (monospace textarea)
- **number**: Numeric input
- **url/domain**: Input with URL/domain validation

---

## Progress Calculation

```text
Stage Progress = Σ(completed_question_weight) / Σ(all_question_weights) × 100
Overall Score = Σ(stage_progress × stage_importance_weight) / Σ(stage_importance_weights)
```

Both formulas use the configurable weights from the database.

---

## Conditional Rules Engine

Rules are evaluated against responses:
```text
IF response[condition_field] operator condition_value
THEN status = result_status, message = result_message
```

Operators: `<`, `>`, `=`, `contains`, `not_exists`, `length_lt`, `length_gt`

Rules are stored in `seo_rules` and evaluated client-side when displaying the checklist.

