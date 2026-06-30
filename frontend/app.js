const API_BASE = "https://shein-monitor-backend-production.up.railway.app";

let riskChart = null;
let regionChart = null;

function setStatus(text) {
  const el = document.getElementById("status");
  if (el) {
    el.textContent = text;
  }
}

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) {
    el.textContent = value ?? 0;
  }
}

function formatDateTimeLocal(date) {
  const pad = (n) => String(n).padStart(2, "0");

  return (
    `${date.getFullYear()}-` +
    `${pad(date.getMonth() + 1)}-` +
    `${pad(date.getDate())}T` +
    `${pad(date.getHours())}:` +
    `${pad(date.getMinutes())}`
  );
}

function setDefaultTimeRange() {
  const end = new Date();
  const start = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);

  const startInput = document.getElementById("start-time");
  const endInput = document.getElementById("end-time");

  if (startInput && !startInput.value) {
    startInput.value = formatDateTimeLocal(start);
  }

  if (endInput && !endInput.value) {
    endInput.value = formatDateTimeLocal(end);
  }
}

function getTimeQuery(extra = {}) {
  const start = document.getElementById("start-time")?.value;
  const end = document.getElementById("end-time")?.value;

  const params = new URLSearchParams();

  if (start) {
    params.append("start", start.replace("T", " ") + ":00");
  }

  if (end) {
    params.append("end", end.replace("T", " ") + ":00");
  }

  Object.entries(extra).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params.append(key, value);
    }
  });

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

function updateRiskChart(data) {
  const ctx = document.getElementById("risk-chart");
  if (!ctx || !window.Chart) return;

  const risk = data.risk_chart || {
    "即将处理超时": data.pending_process_risk || 0,
    "即将发货超时": data.pending_ship_risk || 0,
    "即将预约取件超时": data.pickup_appointment_risk || 0,
    "即将揽收超时": data.pickup_risk || 0,
  };

  const labels = Object.keys(risk);
  const values = Object.values(risk);

  if (riskChart) {
    riskChart.data.labels = labels;
    riskChart.data.datasets[0].data = values;
    riskChart.update();
    return;
  }

  riskChart = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: "风险订单数",
          data: values,
          borderWidth: 3,
          tension: 0.35,
          fill: false,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
        },
      },
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
  });
}

function updateRegionChart(data) {
  const ctx = document.getElementById("region-chart");
  if (!ctx || !window.Chart) return;

  const region = data.region_chart || {
    EU: data.eu || 0,
    US: data.us || 0,
    CA: data.ca || 0,
    OTHER: data.other || 0,
  };

  const labels = Object.keys(region);
  const values = Object.values(region);

  if (regionChart) {
    regionChart.data.labels = labels;
    regionChart.data.datasets[0].data = values;
    regionChart.update();
    return;
  }

  regionChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets: [
        {
          label: "区域订单数",
          data: values,
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
        },
      },
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
  });
}

async function loadDashboard() {
  const query = getTimeQuery();
#这里是dashboard的api
  const data = await fetchJSON(`${API_BASE}/orders/dashboard/${query}`);

  setText("total", data.total);
  setText("eu", data.eu);
  setText("us", data.us);
  setText("ca", data.ca);
  setText("other", data.other);

  setText("pending-process-risk", data.pending_process_risk);
  setText("pending-ship-risk", data.pending_ship_risk);
  setText("pickup-appointment-risk", data.pickup_appointment_risk);
  setText("pickup-risk", data.pickup_risk);

  updateRiskChart(data);
  updateRegionChart(data);
}

async function loadOrders() {
  const query = getTimeQuery({ limit: 100 });
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
      <td>${item.created_hours ?? ""}</td>
      <td>${item.logistics_no || ""}</td>
    `;

    tbody.appendChild(tr);
  });
}

async function refreshAll() {
  try {
    setStatus("正在读取数据库...");

    await Promise.all([
      loadDashboard(),
      loadOrders(),
    ]);

    setStatus("上次刷新：" + new Date().toLocaleString());
  } catch (err) {
    console.error(err);
    setStatus("加载失败，请检查后端接口");
  }
}

function downloadOrders() {
  const query = getTimeQuery();
  window.open(`${API_BASE}/orders/export/${query}`, "_blank");
}

document.addEventListener("DOMContentLoaded", () => {
  setDefaultTimeRange();

  const refreshBtn = document.getElementById("refresh-btn");
  if (refreshBtn) {
    refreshBtn.addEventListener("click", refreshAll);
  }

  const downloadBtn = document.getElementById("download-btn");
  if (downloadBtn) {
    downloadBtn.addEventListener("click", downloadOrders);
  }

  refreshAll();

  // 前端每5分钟刷新数据库展示，不触发妙手同步
  setInterval(refreshAll, 5 * 60 * 1000);
});
