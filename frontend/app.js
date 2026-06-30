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

async function loadDashboard() {
  try {
    const data = await fetchJSON(`${API_BASE}/`);
    console.log("dashboard data:", data);

    setText("total", data.total);
    setText("eu", data.eu);
    setText("us", data.us);
    setText("ca", data.ca);
    setText("other", data.other);
    setText("t12", data.t12);
    setText("t24", data.t24);
    setText("t36", data.t36);
    setText("t48", data.t48);

    setStatus(`已刷新：${new Date().toLocaleString()}`);
  } catch (err) {
    console.error("加载 dashboard 失败：", err);
    setStatus("Dashboard 加载失败，检查后端或 CORS", true);
  }
}

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
