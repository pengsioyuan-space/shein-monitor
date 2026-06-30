const API_BASE = "https://shein-monitor-backend-production.up.railway.app";
const REFRESH_MS = 5 * 60 * 1000;

let riskChart = null;
let regionChart = null;

async function fetchJSON(url) {
  const res = await fetch(url, {
    method: "GET",
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${url}`);
  }

  return await res.json();
}

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) {
    el.textContent = value ?? 0;
  }
}

function setStatus(text, isError = false) {
  const el = document.getElementById("sync-status");
  if (!el) return;
  el.textContent = text;
  el.className = isError ? "status error" : "status";
}

const API_BASE = "https://shein-monitor-backend-production.up.railway.app";

function getTimeQuery() {
  const start = document.getElementById("start-time")?.value;
  const end = document.getElementById("end-time")?.value;

  const params = new URLSearchParams();

  if (start) {
    params.append("start", start.replace("T", " ") + ":00");
  }

  if (end) {
    params.append("end", end.replace("T", " ") + ":00");
  }

  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

async function fetchJSON(url) {
  const res = await fetch(url, {
    method: "GET",
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${url}`);
  }

  return await res.json();
}

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) {
    el.textContent = value ?? 0;
  }
}

function setDefaultTimeRange() {
  const end = new Date();
  const start = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);

  const format = (d) => {
    const pad = (n) => String(n).padStart(2, "0");

    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const startInput = document.getElementById("start-time");
  const endInput = document.getElementById("end-time");

  if (startInput && !startInput.value) {
    startInput.value = format(start);
  }

  if (endInput && !endInput.value) {
    endInput.value = format(end);
  }
}

async function loadDashboard() {
  try {
    const query = getTimeQuery();
    const data = await fetchJSON(`${API_BASE}/dashboard/${query}`);

    console.log("dashboard data:", data);

    setText("total", data.total);
    setText("eu", data.eu);
    setText("us", data.us);
    setText("ca", data.ca);
    setText("other", data.other);

    setText("pending-process-risk", data.pending_process_risk);
    setText("pending-ship-risk", data.pending_ship_risk);
    setText("pickup-appointment-risk", data.pickup_appointment_risk);
    setText("pickup-risk", data.pickup_risk);

    updateCharts(data);
  } catch (err) {
    console.error("Dashboard 加载失败：", err);
  }
}

async function loadOrders() {
  try {
    const query = getTimeQuery();
    const data = await fetchJSON(`${API_BASE}/orders/list/${query}`);

    const tbody = document.getElementById("orders-body");
    if (!tbody) return;

    tbody.innerHTML = "";

    const orders = Array.isArray(data)
      ? data
      : data.data || data.orders || data.results || [];

    orders.forEach((item) => {
      const tr = document.createElement("tr");

      tr.innerHTML = `
        <td>${item.order_no || ""}</td>
        <td>${item.shop_name || ""}</td>
        <td>${item.region || ""}</td>
        <td>${item.created_hours || ""}</td>
        <td>${item.logistics_no || ""}</td>
      `;

      tbody.appendChild(tr);
    });
  } catch (err) {
    console.error("订单列表加载失败：", err);
  }
}

function refreshAll() {
  loadDashboard();
  loadOrders();
}

function downloadOrders() {
  const query = getTimeQuery();
  window.open(`${API_BASE}/orders/export/${query}`, "_blank");
}

document.addEventListener("DOMContentLoaded", () => {
  setDefaultTimeRange();
  refreshAll();

  setInterval(refreshAll, 5 * 60 * 1000);
});

async function loadOrders() {
  try {
    const data = await fetchJSON(`${API_BASE}/orders/list/?limit=500`);
    console.log("orders data:", data);

    const tbody = document.getElementById("orders-body");
    if (!tbody) return;

    tbody.innerHTML = "";

    const orders = Array.isArray(data) ? data : data.data || data.orders || data.results || [];

    orders.forEach((item) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${item.order_no || item["订单编号"] || ""}</td>
        <td>${item.shop_name || item["店铺"] || ""}</td>
        <td>${item.region || "OTHER"}</td>
        <td>${item.created_hours || item["已创建小时数"] || 0}</td>
        <td>${item.logistics_no || item["物流单号"] || ""}</td>
      `;
      tbody.appendChild(tr);
    });
  } catch (err) {
    console.error("加载订单列表失败：", err);
  }
}

async function loadCharts() {
  try {
    const data = await fetchJSON(`${API_BASE}/orders/trend/`);
    console.log("trend data:", data);

    const risk = data.risk || {};
    const region = data.region || {};

    renderRiskChart(risk);
    renderRegionChart(region);
  } catch (err) {
    console.error("加载图表失败：", err);
  }
}

function renderRiskChart(risk) {
  const canvas = document.getElementById("risk-chart");
  if (!canvas || typeof Chart === "undefined") return;

  const labels = ["12h+", "24h+", "36h+", "48h+"];
  const values = labels.map((key) => risk[key] || 0);

  if (riskChart) {
    riskChart.data.labels = labels;
    riskChart.data.datasets[0].data = values;
    riskChart.update();
    return;
  }

  riskChart = new Chart(canvas, {
    type: "line",
    data: {
      labels,
      datasets: [{
        label: "超时风险订单数",
        data: values,
        tension: 0.35,
        fill: false,
      }],
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: true },
        tooltip: { enabled: true },
      },
      scales: {
        y: { beginAtZero: true },
      },
    },
  });
}

function renderRegionChart(region) {
  const canvas = document.getElementById("region-chart");
  if (!canvas || typeof Chart === "undefined") return;

  const labels = ["EU", "US", "CA", "OTHER"];
  const values = labels.map((key) => region[key] || 0);

  if (regionChart) {
    regionChart.data.labels = labels;
    regionChart.data.datasets[0].data = values;
    regionChart.update();
    return;
  }

  regionChart = new Chart(canvas, {
    type: "bar",
    data: {
      labels,
      datasets: [{
        label: "区域订单数",
        data: values,
      }],
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: true },
        tooltip: { enabled: true },
      },
      scales: {
        y: { beginAtZero: true },
      },
    },
  });
}

function refreshAll() {
  loadDashboard();
  loadOrders();
  loadCharts();
}

function downloadOrders() {
  window.open(`${API_BASE}/orders/export/`, "_blank");
}

document.addEventListener("DOMContentLoaded", () => {
  refreshAll();

  const refreshBtn = document.getElementById("refresh-btn");
  if (refreshBtn) {
    refreshBtn.addEventListener("click", refreshAll);
  }

  const downloadBtn = document.getElementById("download-btn");
  if (downloadBtn) {
    downloadBtn.addEventListener("click", downloadOrders);
  }

  setInterval(refreshAll, REFRESH_MS);
});
