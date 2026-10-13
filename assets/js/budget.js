const storageKey = "northlineBudgetEntries";
const starterEntries = [
  { id: 1, name: "Emergency fund", category: "Savings", amount: 1800, status: "On track" },
  { id: 2, name: "Retirement contribution", category: "Retirement", amount: 1500, status: "Scheduled" },
  { id: 3, name: "Home down payment", category: "Investment", amount: 960, status: "Review" }
];
const form = document.querySelector("#budgetForm");
const body = document.querySelector("#budgetRows");
let entries = readEntries();
let editingId = null;

function readEntries() {
  try {
    const saved = localStorage.getItem(storageKey);
    if (!saved) {
      localStorage.setItem(storageKey, JSON.stringify(starterEntries));
      return [...starterEntries];
    }
    const parsed = JSON.parse(saved);
    if (!Array.isArray(parsed)) throw new Error("Saved budget data is not a list.");
    return parsed;
  } catch (error) {
    console.error("Unable to read saved budget data:", error);
    return [...starterEntries];
  }
}

function money(amount) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(amount);
}

function save() {
  try {
    localStorage.setItem(storageKey, JSON.stringify(entries));
  } catch (error) {
    console.error("Unable to save budget data:", error);
    alert("Your browser could not save this change. Check browser storage settings and try again.");
  }
}

function render() {
  body.replaceChildren();
  if (!entries.length) {
    const row = body.insertRow();
    const cell = row.insertCell();
    cell.colSpan = 5;
    cell.className = "empty-row";
    cell.textContent = "No goals yet. Add a financial goal above to get started.";
  }
  for (const entry of entries) {
    const row = body.insertRow();
    for (const value of [entry.name, entry.category, money(Number(entry.amount)), entry.status]) {
      row.insertCell().textContent = value;
    }
    const actions = row.insertCell();
    actions.className = "table-actions";
    const edit = document.createElement("button");
    edit.type = "button";
    edit.className = "secondary";
    edit.textContent = "Edit";
    edit.dataset.action = "edit";
    edit.dataset.id = String(entry.id);
    const remove = document.createElement("button");
    remove.type = "button";
    remove.textContent = "Delete";
    remove.dataset.action = "delete";
    remove.dataset.id = String(entry.id);
    actions.append(edit, remove);
  }
  document.querySelector("#totalAmount").textContent = money(entries.reduce((sum, item) => sum + Number(item.amount), 0));
  document.querySelector("#goalCount").textContent = String(entries.length);
}

function resetForm() {
  editingId = null;
  form.reset();
  document.querySelector("#saveGoal").textContent = "Add goal";
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!form.reportValidity()) return;
  const data = new FormData(form);
  const entry = {
    id: editingId ?? Date.now(),
    name: String(data.get("name")).trim(),
    category: String(data.get("category")),
    amount: Number(data.get("amount")),
    status: String(data.get("status"))
  };
  if (!entry.name || !Number.isFinite(entry.amount) || entry.amount <= 0) return;
  entries = editingId === null
    ? [entry, ...entries]
    : entries.map((item) => item.id === editingId ? entry : item);
  save();
  render();
  resetForm();
});

document.querySelector("#resetGoal").addEventListener("click", resetForm);
body.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-action]");
  if (!button) return;
  const id = Number(button.dataset.id);
  if (button.dataset.action === "delete") {
    entries = entries.filter((entry) => entry.id !== id);
    save();
    render();
    if (editingId === id) resetForm();
  } else {
    const selected = entries.find((entry) => entry.id === id);
    if (!selected) return;
    editingId = id;
    form.elements.name.value = selected.name;
    form.elements.category.value = selected.category;
    form.elements.amount.value = selected.amount;
    form.elements.status.value = selected.status;
    document.querySelector("#saveGoal").textContent = "Update goal";
    form.scrollIntoView({ behavior: "smooth", block: "center" });
  }
});
render();
