/**
 * dropdownOptions.js
 * 
 * Predefined dropdown options for editable fields.
 * 
 * TO FETCH FROM BACKEND LATER:
 * Replace each array with an API call in employeeService.js
 * e.g. export const getJobTitles = () => apiClient.get('/options/job-titles')
 */

export const JOB_TITLES = [
  "President",
  "Vice President",
  "Executive Manager",
  "Senior Manager",
  "Manager",
  "Senior Engineer",
  "Engineer",
  "Senior Analyst",
  "Analyst",
  "Plant Manager",
  "Project Manager",
  "Quality Supervisor",
  "Sales Representative",
  "Legal Counsel",
  "Research Analyst",
  "Talent Management Sr. Analyst",
  "AI Engineer",
  "Transport Driver",
  "Internal Communications Director",
  "HR Manager",
  "Finance Manager",
  "IT Manager",
  "Operations Manager",
].sort();

export const JOB_CODES = [
  "1000", "1100", "1200", "1300", "1400",
  "1464", "1500", "1510", "1520", "1530",
  "1600", "1700", "1800", "1900", "2000",
  "2100", "2200", "2300", "2400", "2500",
].sort();

export const JOB_LEVELS = [
  "A",  // Associate
  "B",  // Band B
  "C",  // Band C
  "CL", // CL level
  "D",  // Director
  "E",  // Executive
  "M",  // Manager
  "P",  // President / Top level
  "S",  // Senior
  "VP", // Vice President
].sort();

export const DEPARTMENTS = [
  "7200", "7210", "7220", "7300", "7310",
  "7320", "7330", "7400", "7410", "7420",
  "7420S", "7430", "7500", "7510", "7600",
  "Executive", "Finance", "Human Resources",
  "Information Technology", "Legal",
  "Operations", "Sales & Marketing",
].sort();

export const BUSINESS_UNITS = [
  "7000", "7100", "7200", "7300", "7400",
  "7500", "7600", "7700", "7800", "7900",
].sort();

export const DIVISIONS = [
  "7000", "7100", "7200", "7300", "7400",
  "7410", "7420", "7430", "7500", "7600",
].sort();

export const COMPANIES = [
  "7000", // L&T main entity
  "7100",
  "7200",
  "7300",
].sort();

/**
 * Central options map — used by DropdownRow to get options by field name.
 * Add new fields here when backend integration is done.
 */
export const FIELD_OPTIONS = {
  jobTitle:     JOB_TITLES,
  jobCode:      JOB_CODES,
  jobLevel:     JOB_LEVELS,
  department:   DEPARTMENTS,
  businessUnit: BUSINESS_UNITS,
  division:     DIVISIONS,
  company:      COMPANIES,
};

export default FIELD_OPTIONS;