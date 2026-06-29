const API_BASE = "https://shein-monitor-backend-production.up.railway.app";

// ====== 页面初始化 ======
document.addEventListener("DOMContentLoaded", () => {
    loadDashboard();

    // 每30秒自动刷新（实时看板）
    setInterval(loadDashboard, 30000);

    // 绑定按钮
    bindEvents();
});

// ====== 加载 dashboard ======
async function loadDashboard() {
    try {
        const res = await fetch(`${API_BASE}/dashboard/`);
        const data = await res.json();

        console.log("dashboard数据：", data);

        updateUI(data);

    } catch (err) {
        console.error("加载失败：", err);
    }
}

// ====== 更新页面 ======
function updateUI(data) {
    setText("total", data.total);
    setText("eu", data.eu);
    setText("us", data.us);
    setText("ca", data.ca);
    setText("t12", data.t12);
    setText("t24", data.t24);
    setText("t36", data.t36);
    setText("t48", data.t48);
}

// ====== 工具：写DOM ======
function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.innerText = value;
}

// ====== 事件绑定 ======
function bindEvents() {

    // 查询按钮（如果你有）
    const queryBtn = document.getElementById("queryBtn");
    if (queryBtn) {
        queryBtn.onclick = loadDashboard;
    }

    // 导出按钮
    const exportBtn = document.getElementById("exportBtn");
    if (exportBtn) {
        exportBtn.onclick = exportOrders;
    }
}

// ====== 导出订单 ======
function exportOrders() {
    window.open(`${API_BASE}/orders/export/`, "_blank");
}
