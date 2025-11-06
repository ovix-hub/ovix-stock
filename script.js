let pieces = [];
let catalog = [];

const stockForm = document.getElementById("stockForm");
const catalogForm = document.getElementById("catalogForm");
const nameSelect = document.getElementById("name");
const catalogList = document.getElementById("catalogList");
const tableBody = document.getElementById("stockBody");

const filterPiece = document.getElementById("filterPiece");
const filterPrinter = document.getElementById("filterPrinter");
const filterStatus = document.getElementById("filterStatus");
const clearFiltersBtn = document.getElementById("clearFilters");
const themeToggleBtn = document.getElementById("themeToggle");

window.addEventListener("DOMContentLoaded", () => {
  const savedPieces = localStorage.getItem("stockPieces");
  const savedCatalog = localStorage.getItem("pieceCatalog");
  const savedTheme = localStorage.getItem("theme");

  if (savedPieces) pieces = JSON.parse(savedPieces);
  if (savedCatalog) catalog = JSON.parse(savedCatalog);
  if (savedTheme) {
    document.body.classList.remove("light", "dark");
    document.body.classList.add(savedTheme);
  }

  if (!catalog || catalog.length === 0) {
    catalog = [
      "Base conducida_mk", "Base Husillo v2_mk", "Brazo_mk", "Contrapeso_mkm", "Disco 45_mk", "Husillo_mkm",
      "Manibela_mkm v2", "Patas_mkm_v2", "Polea motor", "Sop_prensa hilo_mk", "Soporte guía_mkm", "Cono 49_mk",
      "Contrapeso_mk9", "Correa Base husillo 236", "Correas 259", "Espaciadores 0,7", "Espaciadores 4mm",
      "Espaciadores m6", "Gabinete mk9", "Perilla ajuste_mk", "Polea_mkm v2", "Resorte", "Rulo Bronce",
      "Soporte guía_mk9", "Tapon m8 corto_mkm", "Tapon m8 largo_mkm"
    ];
    saveAll();
  }

  updateCatalogDropdown();
  updatePrinterFilter();
  renderCatalogList();
  renderTable();
});

function saveAll() {
  localStorage.setItem("stockPieces", JSON.stringify(pieces));
  localStorage.setItem("pieceCatalog", JSON.stringify(catalog));
}

stockForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const piece = {
    name: document.getElementById("name").value,
    material: document.getElementById("material").value,
    colorPrint: document.getElementById("colorPrint").value,
    qtyPrint: parseInt(document.getElementById("qtyPrint").value) || 0,
    colorStock: document.getElementById("colorStock").value,
    qtyStock: parseInt(document.getElementById("qtyStock").value) || 0,
    status: document.getElementById("status").value,
    printer: document.getElementById("printer").value,
    createdAt: new Date().toLocaleString()
  };
  pieces.push(piece);
  saveAll();
  renderTable();
  stockForm.reset();
});

function renderTable() {
  tableBody.innerHTML = "";
  const fPiece = filterPiece.value.toLowerCase();
  const fPrinter = filterPrinter.value;
  const fStatus = filterStatus.value;

  pieces
    .filter(p => (!fPiece || p.name.toLowerCase().includes(fPiece)))
    .filter(p => (!fPrinter || p.printer === fPrinter))
    .filter(p => (!fStatus || p.status === fStatus))
    .forEach((p, i) => {
      const tr = document.createElement("tr");
      if (p.qtyStock < p.qtyPrint || p.status === "Reponer") tr.classList.add("to-print");
      tr.innerHTML = `
        <td>${p.name}</td>
        <td>${p.material}</td>
        <td>${p.colorPrint}</td>
        <td>${p.colorStock}</td>
        <td>${p.qtyPrint}</td>
        <td>${p.qtyStock}</td>
        <td>${p.status}</td>
        <td>${p.printer}</td>
        <td>${p.createdAt}</td>
        <td><button onclick="removePiece(${i})">🗑️</button></td>
      `;
      tableBody.appendChild(tr);
    });
}

function removePiece(index) {
  if (!confirm("¿Eliminar esta entrada?")) return;
  pieces.splice(index, 1);
  saveAll();
  renderTable();
}

function exportToCSV() {
  const header = ["Pieza","Material","Color a imprimir","Color en stock","Cantidad a imprimir","Cantidad en stock","Estado","Impresora","Fecha creación","Fecha export"];
  const toExport = pieces.filter(p => p.qtyStock < p.qtyPrint || p.status === "Reponer");
  if (toExport.length === 0) { alert("No hay piezas para reponer ✅"); return; }

  const rows = [header];
  const fechaExport = new Date().toLocaleString();
  toExport.forEach(p => {
    rows.push([
      p.name,
      p.material,
      p.colorPrint,
      p.colorStock,
      p.qtyPrint,
      p.qtyStock,
      p.status,
      p.printer,
      p.createdAt,
      fechaExport
    ]);
  });

  const csv = "\uFEFF" + rows.map(r => r.join(";")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "pedido_reposicion.csv";
  link.click();
}

catalogForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const newName = document.getElementById("newPieceName").value.trim();
  if (!newName) return alert("Ingresá un nombre válido.");
  if (catalog.includes(newName)) return alert("Esa pieza ya existe.");
  catalog.push(newName);
  catalog.sort();
  saveAll();
  updateCatalogDropdown();
  renderCatalogList();
  catalogForm.reset();
});

function updateCatalogDropdown() {
  nameSelect.innerHTML = `<option value="">Pieza</option>`;
  catalog.forEach(n => {
    const opt = document.createElement("option");
    opt.value = n;
    opt.textContent = n;
    nameSelect.appendChild(opt);
  });
}

function renderCatalogList() {
  catalogList.innerHTML = "";
  catalog.forEach((n, idx) => {
    const li = document.createElement("li");
    li.textContent = n;
    const editBtn = document.createElement("button");
    editBtn.textContent = "✏️";
    editBtn.onclick = () => {
      const nuevo = prompt("Nuevo nombre:", n);
      if (nuevo && nuevo.trim()) {
        catalog[idx] = nuevo.trim();
        pieces.forEach(p => { if (p.name === n) p.name = nuevo.trim(); });
        saveAll();
        updateCatalogDropdown();
        renderCatalogList();
        renderTable();
      }
    };
    const delBtn = document.createElement("button");
    delBtn.textContent = "🗑️";
    delBtn.onclick = () => {
      if (confirm(`¿Eliminar "${n}" del catálogo?`)) {
        catalog.splice(idx, 1);
        saveAll();
        updateCatalogDropdown();
        renderCatalogList();
      }
    };
    li.appendChild(editBtn);
    li.appendChild(delBtn);
    catalogList.appendChild(li);
  });
}

function updatePrinterFilter() {
  const printers = [
    "", "Ender 3 v3 PLUS", "Ender 3 S1 Pro", "Ender 3 V2",
    "CR10 SPRO", "Prusa Mk3", "Prusa Mini", "CR10 MAX", "K1C"
  ];
  const sel = filterPrinter;
  sel.innerHTML = "";
  printers.forEach(p => {
    const opt = document.createElement("option");
    opt.value = p;
    opt.textContent = p || "Todas las impresoras";
    sel.appendChild(opt);
  });
}

[filterPiece, filterPrinter, filterStatus].forEach(el => {
  el.addEventListener("input", renderTable);
});
clearFiltersBtn.addEventListener("click", () => {
  filterPiece.value = "";
  filterPrinter.value = "";
  filterStatus.value = "";
  renderTable();
});

themeToggleBtn.addEventListener("click", () => {
  const isLight = document.body.classList.contains("light");
  document.body.classList.toggle("light", !isLight);
  document.body.classList.toggle("dark", isLight);
  const newTheme = document.body.classList.contains("light") ? "light" : "dark";
  localStorage.setItem("theme", newTheme);
});
