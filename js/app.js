import { createSidebar } from "../components/sidebar.js";
import { loadDashboard } from "../pages/dashboard.js";

const app = document.getElementById("app");

app.innerHTML = `
<div class="layout">

    <aside id="sidebar"></aside>

    <main id="content"></main>

</div>
`;

createSidebar();

loadDashboard();
