import axios from "axios";
import employeesData from "../data/employees.json";

export const USE_API = true;

//const API_BASE_URL =
  //import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  "https://l-t-orgchart.onrender.com/api";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.response.use(
  (res) => res,
  (err) => {
    console.error("API Error:", err.response?.data || err.message);
    return Promise.reject(err);
  }
);

export function flattenSFTree(node, parentCode = null, depth = 0, result = [], photoMap = {}) {
  if (!node) return result;

  const positionCode = String(node.code || "");
  const photo = photoMap[positionCode] || "";

  result.push({
    id: node.code,
    code: node.code,
    name: node.name || node.positionTitle || "Unknown",
    designation: node.jobTitle || node.title || "",
    department: node.department || node.businessUnit || "",
    location: node.location || "",
    managerId: parentCode,

    title: node.title || "",
    jobCode: node.jobCode || "",
    division: node.division || "",
    businessUnit: node.businessUnit || "",
    company: node.company || "",
    costCenter: node.costCenter || "",
    payGrade: node.payGrade || "",
    jobLevel: node.jobLevel || "",
    employeeClass: node.employeeClass || "",
    employmentType: node.employmentType || "",
    regularTemporary: node.regularTemporary || "",
    standardHours: node.standardHours ?? "",
    targetFTE: node.targetFTE ?? "",
    effectiveStatus: node.effectiveStatus || "",
    effectiveStartDate: node.effectiveStartDate || "",
    effectiveEndDate: node.effectiveEndDate || "",
    vacant: node.vacant ?? false,
    incumbent: node.incumbent || "",
    criticality: node.criticality || "",
    positionCriticality: node.positionCriticality || "",
    createdBy: node.createdBy || "",
    createdDateTime: node.createdDateTime || "",
    lastModifiedBy: node.lastModifiedBy || "",
    lastModifiedDateTime: node.lastModifiedDateTime || "",

    level: depth,

    avatar: photo,
    initials: getInitials(node.name || node.positionTitle || "??"),
    avatarColor: getAvatarColor(depth, node.department),

    status:
      node.effectiveStatus === "A"
        ? "Active"
        : node.effectiveStatus || "Unknown",

    email: node.incumbent
      ? `${node.incumbent.toLowerCase().replace(/\s+/g, ".")}@company.com`
      : "",

    phone: "",
    joiningDate: node.effectiveStartDate || "",
  });

  (node.children || []).forEach((child) =>
    flattenSFTree(child, node.code, depth + 1, result, photoMap)
  );

  return result;
}

function getInitials(name) {
  return name
    .split(/[\s\-_]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() || "")
    .join("");
}

const DEPT_COLORS = {
  finance: "#5c3d8f",
  hr: "#1b4f72",
  it: "#0e6655",
  sales: "#784212",
  operations: "#1a5276",
  engineering: "#145a32",
  marketing: "#6e2f1a",
};

function getAvatarColor(depth, department) {
  const dept = (department || "").toLowerCase();

  for (const [key, color] of Object.entries(DEPT_COLORS)) {
    if (dept.includes(key)) return color;
  }

  const depthColors = [
    "#1a1a2e",
    "#16213e",
    "#0f3460",
    "#533483",
    "#1b4332",
    "#2c3e50",
  ];

  return depthColors[depth % depthColors.length];
}

const mockDelay = (ms = 200) =>
  new Promise((res) => setTimeout(res, ms));

let _flatCache = null;

export const getAllEmployees = async () => {
  if (USE_API) {
    const [treeResponse, photoResponse] = await Promise.all([
      apiClient.get("/org-tree"),
      apiClient.get("/photos"),
    ]);

    const photoMap = photoResponse.data || {};
    const flat = flattenSFTree(treeResponse.data, null, 0, [], photoMap);

    _flatCache = flat;
    return flat;
  }

  await mockDelay();
  return [...employeesData];
};

export const getEmployeeById = async (id) => {
  if (USE_API) {
    return _flatCache?.find((e) => e.id === id) || null;
  }

  await mockDelay(100);
  return employeesData.find((emp) => emp.id === id) || null;
};

export const searchEmployees = async (query) => {
  if (USE_API) {
    const response = await apiClient.get("/search", {
      params: { q: query },
    });

    return response.data.results.map((p) => ({
      id: p.code,
      ...p,
    }));
  }

  await mockDelay(100);

  const q = query.toLowerCase();

  return employeesData.filter((emp) =>
    [emp.name, emp.id, emp.department, emp.designation].some((f) =>
      f?.toLowerCase().includes(q)
    )
  );
};

export const getDepartments = async () => {
  if (USE_API) {
    const response = await apiClient.get("/departments");
    return response.data;
  }

  await mockDelay(100);

  return [...new Set(employeesData.map((e) => e.department))].sort();
};

export const refreshOrgData = async () => {
  if (USE_API) {
    const response = await apiClient.post("/refresh");
    return response.data;
  }

  return { message: "Static mode — no refresh needed" };
};

export const getServerHealth = async () => {
  if (USE_API) {
    const response = await apiClient.get("/health");
    return response.data;
  }

  return {
    status: "ok",
    cached: true,
    positionCount: employeesData.length,
  };
};

export default {
  getAllEmployees,
  getEmployeeById,
  searchEmployees,
  getDepartments,
  refreshOrgData,
  getServerHealth,
};