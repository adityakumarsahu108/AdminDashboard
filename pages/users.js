import { getUsers } from "../js/api.js";

let currentPage = 1;
const pageSize = 20;
let search = "";

export async function loadUsers() {

    document.getElementById("content").innerHTML = `

        <h1>Users</h1>

        <div class="table-toolbar">

            <input
                id="userSearch"
                class="search-box"
                type="text"
                placeholder="Search alias, browser, platform..."
            >

        </div>
        <div class="table-container">


            <br>

            <table class="data-table">

                <thead>

                    <tr>

                        <th>Alias</th>
                        <th>Browser</th>
                        <th>Platform</th>
                        <th>Version</th>
                        <th>First Seen</th>
                        <th>Last Active</th>
                        <th>Status</th>

                    </tr>

                </thead>

                <tbody id="usersTable">

                    <tr>

                        <td colspan="7">

                            Loading...

                        </td>

                    </tr>

                </tbody>

            </table>

            <div class="pagination">

                <button id="prevBtn">

                    Previous

                </button>

                <span id="pageInfo"></span>

                <button id="nextBtn">

                    Next

                </button>

            </div>

        </div>

    `;

    document
        .getElementById("userSearch")
        .addEventListener("input", e => {

            search = e.target.value;

            currentPage = 1;

            loadUsersTable();

        });

    document
        .getElementById("prevBtn")
        .addEventListener("click", () => {

            if (currentPage > 1) {

                currentPage--;

                loadUsersTable();

            }

        });

    document
        .getElementById("nextBtn")
        .addEventListener("click", () => {

            currentPage++;

            loadUsersTable();

        });

    await loadUsersTable();

}

async function loadUsersTable() {

    const response = await getUsers(

        currentPage,

        pageSize,

        search

    );

    const users = response.data;
    const total = response.total;

    const tbody = document.getElementById("usersTable");

    tbody.innerHTML = "";

    if (users.length === 0) {

        tbody.innerHTML = `

            <tr>

                <td colspan="7">

                    No users found.

                </td>

            </tr>

        `;

        document.getElementById("pageInfo").textContent = "";

        return;

    }

    const now = Date.now();

    users.forEach(user => {

        const lastActive = new Date(user.last_activity).getTime();

        const online =

            (now - lastActive) < 2 * 60 * 1000;

        tbody.innerHTML += `

            <tr>

                <td>${user.alias ?? "-"}</td>

                <td>${user.browser ?? "-"}</td>

                <td>${user.platform ?? "-"}</td>

                <td>${user.version ?? "-"}</td>

                <td>${formatDate(user.first_seen)}</td>

                <td>${formatDate(user.last_activity)}</td>

                <td>

                    <span class="${online ? "online" : "offline"}">

                        ${online ? "🟢 Online" : "🔴 Offline"}

                    </span>

                </td>

            </tr>

        `;

    });

    const totalPages = Math.max(1, Math.ceil(total / pageSize));

    document.getElementById("pageInfo").textContent =

        `Page ${currentPage} of ${totalPages}`;

    document.getElementById("prevBtn").disabled =

        currentPage === 1;

    document.getElementById("nextBtn").disabled =

        currentPage >= totalPages;

}

function formatDate(date) {

    if (!date) return "-";

    return new Date(date).toLocaleString("en-IN", {

        day: "2-digit",

        month: "short",

        year: "numeric",

        hour: "2-digit",

        minute: "2-digit"

    });

}