const API = "https://shein-monitor-backend-production.up.railway.app";

// =====================
// loading
// =====================
function setLoading(id, text) {
  document.getElementById(id).innerText = text;
}

// =====================
// dashboard
// =====================
async function loadDashboard() {
  try {
    const res = await fetch(`${API}/orders/dashboard/`);
    const json = await res.json();

    const d = json.data;

    document.getElementById("total").innerText = d.total;
    document.getElementById("eu").innerText = d.eu;
    document.getElementById("us").innerText = d.us;
    document.getElementById("ca").innerText = d.ca;

  } catch (e) {
    console.log("dashboard error", e);
  }
}

// =====================
// orders list
// =====================
async function loadOrders() {
  try {
    const res = await fetch(`${API}/orders/list/`);
    const json = await res.json();

    const tbody = document.getElementById("tbody");
    tbody.innerHTML = "";

    json.data.forEach(o => {
      tbody.innerHTML += `
        <tr>
          <td>${o.order_no}</td>
          <td>${o.shop_name}</td>
          <td>${o.region}</td>
          <td>${o.created_hours}</td>
          <td>${o.logistics_no || ""}</td>
        </tr>
      `;
    });

  } catch (e) {
    console.log("orders error", e);
  }
}

// =====================
// export
// =====================
function downloadOrders() {
  window.open(`${API}/orders/export/`, "_blank");
}

// =====================
// refresh
// =====================
function refreshAll() {
  loadDashboard();
  loadOrders();
}

// =====================
// init
// =====================
window.onload = () => {
  refreshAll();

  setInterval(refreshAll, 10000);
};
