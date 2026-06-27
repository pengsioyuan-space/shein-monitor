
async function loadData(){

  let date = document.getElementById("date").value;
  let shop = document.getElementById("shop").value;

  let url = `/api/orders?date=${date}&shop=${shop}`;

  let res = await fetch(url);
  let data = await res.json();

  let html = "";

  data.data.forEach(o => {
    html += `
      <tr>
        <td>${o.order_no}</td>
        <td>${o.shop}</td>
        <td>${o.region}</td>
        <td><input type="checkbox"></td>
      </tr>
    `;
  });

  document.getElementById("table").innerHTML = html;
}


async function exportData(){
  let date = document.getElementById("date").value;
  let shop = document.getElementById("shop").value;

  window.open(`/api/export?date=${date}&shop=${shop}`);
}


loadData();
