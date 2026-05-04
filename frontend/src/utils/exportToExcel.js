/**
 * exportToExcel.js
 * Exports employee/position data to Excel (.xlsx) using pure JS.
 * No external library needed — uses CSV with Excel-compatible encoding.
 *
 * Usage:
 *   import { exportToExcel } from '../utils/exportToExcel';
 *   exportToExcel(allEmployees, localEdits);
 */

// ─── Field definitions — order = column order in Excel ───────────────────────
const FIELDS = [
  { key: "code",                label: "Position Code"          },
  { key: "name",                label: "Position Name"          },
  { key: "designation",         label: "Job Title"              },
  { key: "jobCode",             label: "Job Code"               },
  { key: "jobLevel",            label: "Job Level"              },
  { key: "level",               label: "Hierarchy Level"        },
  { key: "department",          label: "Department"             },
  { key: "businessUnit",        label: "Business Unit"          },
  { key: "division",            label: "Division"               },
  { key: "company",             label: "Company"                },
  { key: "location",            label: "Location"               },
  { key: "costCenter",          label: "Cost Center"            },
  { key: "payGrade",            label: "Pay Grade"              },
  { key: "employeeClass",       label: "Employee Class"         },
  { key: "employmentType",      label: "Employment Type"        },
  { key: "regularTemporary",    label: "Regular / Temporary"    },
  { key: "standardHours",       label: "Standard Hours"         },
  { key: "targetFTE",           label: "Target FTE"             },
  { key: "effectiveStatus",     label: "Effective Status"       },
  { key: "status",              label: "Status"                 },
  { key: "vacant",              label: "Vacant"                 },
  { key: "incumbent",           label: "Incumbent"              },
  { key: "managerId",           label: "Manager Position Code"  },
  { key: "managerName",         label: "Manager Name"           },
  { key: "directReportCount",   label: "Direct Reports Count"   },
  { key: "criticality",         label: "Criticality"            },
  { key: "positionCriticality", label: "Position Criticality"   },
  { key: "effectiveStartDate",  label: "Effective Start Date"   },
  { key: "effectiveEndDate",    label: "Effective End Date"     },
  { key: "createdBy",           label: "Created By"             },
  { key: "createdDateTime",     label: "Created Date"           },
  { key: "lastModifiedBy",      label: "Last Modified By"       },
  { key: "lastModifiedDateTime",label: "Last Modified Date"     },
  { key: "isLocalCard",         label: "Local / SAP"            },
  { key: "hasLocalEdits",       label: "Has Local Edits"        },
];

// ─── Hierarchy level label ────────────────────────────────────────────────────
const LEVEL_LABELS = {
  0: "C-Suite",
  1: "Vice President",
  2: "Manager",
  3: "Executive",
  4: "Associate",
  5: "Staff",
};

// ─── SAP /Date(ms)/ format parser ────────────────────────────────────────────
function parseDate(val) {
  if (!val) return "";
  const epoch = typeof val === "string" ? val.match(/\/Date\((\d+)\)\//)?.[1] : null;
  const d = epoch ? new Date(parseInt(epoch)) : new Date(val);
  if (isNaN(d.getTime())) return String(val);
  return d.toLocaleDateString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

// ─── Escape cell value for CSV ────────────────────────────────────────────────
function escapeCell(val) {
  if (val === null || val === undefined) return "";
  const str = String(val);
  // Wrap in quotes if contains comma, quote, or newline
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

// ─── Main export function ─────────────────────────────────────────────────────
/**
 * @param {Array}  allEmployees    - flat array from getAllEmployees()
 * @param {Object} localEdits      - { [empId]: { field: value } }
 * @param {Array}  staticEmpIds    - IDs of locally added cards
 * @param {string} filename        - optional custom filename
 */
export function exportToExcel(
  allEmployees = [],
  localEdits = {},
  staticEmpIds = [],
  filename = ""
) {
  if (!allEmployees.length) {
    alert("No data to export.");
    return;
  }

  // Build manager lookup map
  const managerMap = {};
  allEmployees.forEach(emp => { managerMap[emp.id] = emp.name; });

  // Build direct report count map
  const reportCountMap = {};
  allEmployees.forEach(emp => {
    if (emp.managerId) {
      reportCountMap[emp.managerId] = (reportCountMap[emp.managerId] || 0) + 1;
    }
  });

  // ── Build rows ──────────────────────────────────────────────────────────────
  const rows = allEmployees.map(emp => {
    const edits       = localEdits[emp.id] || {};
    const isLocal     = staticEmpIds.includes(emp.id);
    const hasEdits    = Object.keys(edits).length > 0;

    // Merge edits into employee data
    const merged = { ...emp, ...edits };

    return {
      code:                 merged.code        || merged.id || "",
      name:                 merged.name        || "",
      designation:          merged.jobTitle    || merged.designation || "",
      jobCode:              merged.jobCode     || "",
      jobLevel:             merged.jobLevel    || "",
      level:                LEVEL_LABELS[merged.level] ?? `Level ${merged.level ?? 0}`,
      department:           merged.department  || "",
      businessUnit:         merged.businessUnit || "",
      division:             merged.division    || "",
      company:              merged.company     || "",
      location:             merged.location    || "",
      costCenter:           merged.costCenter  || "",
      payGrade:             merged.payGrade    || "",
      employeeClass:        merged.employeeClass || "",
      employmentType:       merged.employmentType || "",
      regularTemporary:     merged.regularTemporary || "",
      standardHours:        merged.standardHours ?? "",
      targetFTE:            merged.targetFTE   ?? "",
      effectiveStatus:      merged.effectiveStatus || "",
      status:               merged.status      || "",
      vacant:               merged.vacant ? "Yes" : "No",
      incumbent:            merged.incumbent   || "",
      managerId:            merged.managerId   || "",
      managerName:          managerMap[merged.managerId] || "",
      directReportCount:    reportCountMap[merged.id] || 0,
      criticality:          merged.criticality || "",
      positionCriticality:  merged.positionCriticality || "",
      effectiveStartDate:   parseDate(merged.effectiveStartDate),
      effectiveEndDate:     parseDate(merged.effectiveEndDate),
      createdBy:            merged.createdBy   || "",
      createdDateTime:      parseDate(merged.createdDateTime),
      lastModifiedBy:       merged.lastModifiedBy || "",
      lastModifiedDateTime: parseDate(merged.lastModifiedDateTime),
      isLocalCard:          isLocal ? "Local (Not in SAP)" : "SAP SuccessFactors",
      hasLocalEdits:        hasEdits ? "Yes" : "No",
    };
  });

  // ── Build CSV string ────────────────────────────────────────────────────────
  const headerRow = FIELDS.map(f => escapeCell(f.label)).join(",");

  const dataRows = rows.map(row =>
    FIELDS.map(f => escapeCell(row[f.key])).join(",")
  );

  // Add metadata rows at the top
  const now = new Date().toLocaleString("en-IN");
  const metaRows = [
    `"L&T OrgChart Export"`,
    `"Exported on:","${now}"`,
    `"Total Positions:","${allEmployees.length}"`,
    `"Local (unsaved) cards:","${staticEmpIds.length}"`,
    `"Positions with local edits:","${Object.keys(localEdits).length}"`,
    `""`, // blank row separator
  ];

  const csvContent = [
    ...metaRows,
    headerRow,
    ...dataRows,
  ].join("\n");

  // ── Trigger download ────────────────────────────────────────────────────────
  // BOM (0xFEFF) makes Excel open UTF-8 correctly
  const BOM = "\uFEFF";
  const blob = new Blob([BOM + csvContent], {
    type: "application/vnd.ms-excel;charset=utf-8",
  });

  const date  = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const fname = filename || `LT_OrgChart_${date}.xlsx`;

  const url  = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href     = url;
  link.download = fname;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export default exportToExcel;