const API_BASE = "https://shein-monitor-backend-production.up.railway.app";

/**
 * =========================
 * 1️⃣ 加载 Dashboard 数据
 * =========================
 */
async function loadDashboard() {
    try {
        const res = await fetch(`${API_BASE}/dashboard/`);
        const data = await res.json();

        console.log("dashboard data:", data);

        // ⚠️ 如果你页面有这些 id，就会自动更新
        setText("total", data.total);
        setText("eu", data.eu);
        setText("us", data.us);
        setText("ca", data.ca);

        setText("t12", data.t12);
        setText("t24", data.t24);
        setText("t36", data.t36);
        setText("t48", data.t48);

    } catch (err) {
        console.error("loadDashboard error:", err);
        alert("加载数据失败");
    }
}


/**
 * =========================
 * 2️⃣ 查询按钮（今天数据刷新）
 * =========================
 */
async function queryToday() {
    await loadDashboard();
}


/**
 * =========================
 * 3️⃣ 导出运营订单 CSV
 * =========================
 */
function exportOrders() {
    window.open(`${API_BASE}/export/`, "_blank");
}


/**
 * =========================
 * 4️⃣ 工具函数（防报错）
 * =========================
 */
function setText(id, value) {
    const el = document.getElementById(id);
    if (el) {
        el.innerText = value ?? 0;
    }
}


/**
 * =========================
 * 5️⃣ 页面自动加载
 * =========================
 */
document.addEventListener("DOMContentLoaded", () => {
    loadDashboard();
});
