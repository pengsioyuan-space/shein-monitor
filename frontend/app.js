const API_BASE = "https://shein-monitor-backend-production.up.railway.app";

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

async function loadDashboard() {
  try {
    const data = await fetchJSON(`${API_BASE}/`);

    console.log("dashboard data:", data);

    setText("total", data.total);
    setText("eu", data.eu);
    setText("us", data.us);
    setText("ca", data.ca);

    setText("t12", data.t12);
    setText("t24", data.t24);
    setText("t36", data.t36);
    setText("t48", data.t48);
  } catch (err) {
    console.error("加载 dashboard 失败：", err);
  }
}

async function loadOrders() {
  try {
    let data;

    try {
      data = await fetchJSON(`${API_BASE}/orders/list/`);
    } catch (e) {
      console.warn("orders/list 失败，跳过订单表：", e);
      return;
    }

    console.log("orders data:", data);

    const tbody = document.getElementById("orders-body");
    if (!tbody) return;

    tbody.innerHTML = "";

    const orders = Array.isArray(data) ? data : data.orders || data.results || [];

    orders.forEach((item) => {
      const tr = document.createElement("tr");

      tr.innerHTML = `
        <td>${item.order_no || item["订单编号"] || ""}</td>
        <td>${item.shop_name || item["店铺"] || ""}</td>
        <td>${item.region || ""}</td>
        <td>${item.created_hours || item["已创建小时数"] || ""}</td>
        <td>${item.logistics_no || item["物流单号"] || ""}</td>
      `;

      tbody.appendChild(tr);
    });
  } catch (err) {
    console.error("加载订单列表失败：", err);
  }
}

function refreshAll() {
  loadDashboard();
  loadOrders();
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

  setInterval(refreshAll, 10000);
});
