const storage_key = 'employees';
const page_size = 5;

let employees = loademployees();
let currentpage = 1;
let searchTerm = '';
let sortmode = '';
let editingid = null;

const from =
document.getElementById('employeeForm');
const tableBody = 
document.getElementById('employeeTableBody');
const emptystate =
document.getElementById('emptystate');
const searchinput = 
document.getElementById('searchinput');
const sortselect =
document.getElementById('sortselect');
const submitbin =
document.getElementById('submitbin');
const cancelbtn = 
document.getElementById('cancelbtn');
const formtitle = 
document.getElementById('formtitle');
const pagination =
document.getElementById('pagination');
const themetoggle =
document.getElementById('themetoggle');

function loadEmployees() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
  catch { return []; }
}
function saveEmployees() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(employees));
}

function validate(data) {
  const errors = {};
  if (!data.name.trim())          errors.name        = 'Full name is required';
  if (!data.email.trim())         errors.email       = 'Email is required';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email))
                                  errors.email       = 'Enter a valid email';
  if (!data.department)           errors.department  = 'Select a department';
  if (!data.designation.trim())   errors.designation = 'Designation is required';
  if (!data.joiningDate)          errors.joiningDate = 'Joining date is required';
  return errors;
}

function showErrors(errors) {
  ['name','email','department','designation','joiningDate'].forEach(key => {
    const errEl   = document.getElementById('err' + cap(key));
    const fieldEl = document.getElementById(key).parentElement;
    if (errors[key]) {
      errEl.textContent = errors[key];
      fieldEl.classList.add('invalid');
    } else {
      errEl.textContent = '';
      fieldEl.classList.remove('invalid');
    }
  });
}
const cap = s => s.charAt(0).toUpperCase() + s.slice(1);

