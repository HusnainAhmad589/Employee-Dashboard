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

form.addEventListener('submit', e => {
  e.preventDefault();

  const data = {
    name:         document.getElementById('name').value,
    email:        document.getElementById('email').value,
    department:   document.getElementById('department').value,
    designation:  document.getElementById('designation').value,
    joiningDate:  document.getElementById('joiningDate').value,
  };

  const errors = validate(data);
  showErrors(errors);
  if (Object.keys(errors).length) return;

  if (editingId) {
    employees = employees.map(emp =>
      emp.id === editingId ? { ...emp, ...data } : emp
    );
    editingId = null;
  } else {
    employees.push({ id: Date.now().toString(), ...data });
  }

  saveEmployees();
  resetForm();
  render();
});


cancelBtn.addEventListener('click', () => {
  editingId = null;
  resetForm();
});

function resetForm() {
  form.reset();
  showErrors({});
  submitBtn.textContent = 'Add Employee';
  formTitle.textContent = 'Add New Employee';
  cancelBtn.hidden      = true;
}


function editEmployee(id) {
  const emp = employees.find(e => e.id === id);
  if (!emp) return;
  editingId = id;
  document.getElementById('name').value        = emp.name;
  document.getElementById('email').value       = emp.email;
  document.getElementById('department').value  = emp.department;
  document.getElementById('designation').value = emp.designation;
  document.getElementById('joiningDate').value = emp.joiningDate;
  submitBtn.textContent = 'Update Employee';
  formTitle.textContent = 'Edit Employee';
  cancelBtn.hidden      = false;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function deleteEmployee(id) {
  if (!confirm('Delete this employee?')) return;
  employees = employees.filter(e => e.id !== id);
  saveEmployees();
  render();
}


searchInput.addEventListener('input', e => {
  searchTerm  = e.target.value.toLowerCase();
  currentPage = 1;
  render();
});
sortSelect.addEventListener('change', e => {
  sortMode = e.target.value;
  render();
});

function getVisibleEmployees() {
  let list = employees.filter(emp =>
    emp.name.toLowerCase().includes(searchTerm) ||
    emp.department.toLowerCase().includes(searchTerm)
  );

  switch (sortMode) {
    case 'name-asc':  list.sort((a,b) => a.name.localeCompare(b.name)); break;
    case 'name-desc': list.sort((a,b) => b.name.localeCompare(a.name)); break;
    case 'date-asc':  list.sort((a,b) => new Date(a.joiningDate) - new Date(b.joiningDate)); break;
    case 'date-desc': list.sort((a,b) => new Date(b.joiningDate) - new Date(a.joiningDate)); break;
  }
  return list;
}


function render() {
  renderStats();
  renderTable();
}

function renderStats() {
  document.getElementById('statTotal').textContent = employees.length;
  document.getElementById('statIT').textContent =
    employees.filter(e => e.department === 'IT').length;
  document.getElementById('statHR').textContent =
    employees.filter(e => e.department === 'HR').length;
  document.getElementById('statMK').textContent =
    employees.filter(e => e.department === 'Marketing').length;
}

function renderTable() {
  const list  = getVisibleEmployees();
  const pages = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
  if (currentPage > pages) currentPage = pages;

  const start = (currentPage - 1) * PAGE_SIZE;
  const slice = list.slice(start, start + PAGE_SIZE);

  tableBody.innerHTML = slice.map(emp => `
    <tr>
      <td>${escapeHtml(emp.name)}</td>
      <td>${escapeHtml(emp.email)}</td>
      <td>${escapeHtml(emp.department)}</td>
      <td>${escapeHtml(emp.designation)}</td>
      <td>${formatDate(emp.joiningDate)}</td>
      <td>
        <button class="action-btn edit-btn" onclick="editEmployee('${emp.id}')">Edit</button>
        <button class="action-btn del-btn"  onclick="deleteEmployee('${emp.id}')">Delete</button>
      </td>
    </tr>
  `).join('');

  emptyState.style.display = list.length ? 'none' : 'block';
  renderPagination(pages);
}

function renderPagination(pages) {
  if (pages <= 1) { pagination.innerHTML = ''; return; }
  let html = `<button ${currentPage===1?'disabled':''} onclick="goPage(${currentPage-1})">‹</button>`;
  for (let i = 1; i <= pages; i++) {
    html += `<button class="${i===currentPage?'active':''}" onclick="goPage(${i})">${i}</button>`;
  }
  html += `<button ${currentPage===pages?'disabled':''} onclick="goPage(${currentPage+1})">›</button>`;
  pagination.innerHTML = html;
}
function goPage(n) { currentPage = n; renderTable(); }


function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' });
}
function escapeHtml(str = '') {
  return str.replace(/[&<>"']/g, c => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[c]));
}


themeToggle.addEventListener('click', () => {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  document.documentElement.setAttribute('data-theme', isDark ? 'light' : 'dark');
  themeToggle.textContent = isDark ? '🌙' : '☀️';
  localStorage.setItem('theme', isDark ? 'light' : 'dark');
});
(function initTheme() {
  const saved = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', saved);
  themeToggle.textContent = saved === 'dark' ? '☀️' : '🌙';
})();


window.editEmployee   = editEmployee;
window.deleteEmployee = deleteEmployee;
window.goPage         = goPage;


render();