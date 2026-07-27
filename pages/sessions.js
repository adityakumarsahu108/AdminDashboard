import { getSessions } from "../js/api.js";
import { startAutoRefresh } from "../js/utils.js";
let currentPage = 1;
const pageSize = 25;

export function loadSessions() {

    document.getElementById("content").innerHTML = `

        <div class="page-header">

            <h1>Sessions</h1>

        </div>

        <div class="table-container">

            <table class="data-table">

                <thead>

                    <tr>
<th>Alias</th>
                        <th>Browser</th>
                        <th>Platform</th>
                        <th>Version</th>
                        <th>Started</th>
                        <th>Duration</th>
                        <th>Status</th>

                    </tr>

                </thead>

                <tbody id="sessionsTable">

                    <tr>

                        <td colspan="6">

                            Loading...

                        </td>

                    </tr>

                </tbody>

            </table>

        </div>

        <div class="pagination">

            <button id="prevBtn">

                Previous

            </button>

            <span id="pageInfo"></span>

            <button id="nextBtn">

                Next

            </button>

        </div>

    `;

    document.getElementById("prevBtn").onclick = () => {

        if (currentPage > 1) {

            currentPage--;

            loadSessionsTable();

        }

    };

    document.getElementById("nextBtn").onclick = () => {

        currentPage++;

        loadSessionsTable();

    };


    loadSessionsTable();

    startAutoRefresh(loadSessionsTable);

}

async function loadSessionsTable() {

    const response = await getSessions(

        currentPage,

        pageSize

    );

    const tbody =
        document.getElementById("sessionsTable");

    tbody.innerHTML = "";

    if (response.data.length === 0) {

        tbody.innerHTML = `

            <tr>

                <td colspan="6">

                    No Sessions Found

                </td>

            </tr>

        `;

        return;

    }

    response.data.forEach(session => {

        const active =
            session.ended_at === null;

        let duration;

        if (active) {

            duration = formatDuration(

                Math.floor(

                    (Date.now() -

                        new Date(session.started_at)) / 1000

                )

            );

        } else {

            duration = formatDuration(

                session.duration_seconds || 0

            );

        }

        tbody.innerHTML += `

            <tr>
            <td>

                    ${session.alias ?? "-"}

                </td>

                <td>

                    ${session.browser}

                </td>

                <td>

                    ${session.platform}

                </td>

                <td>

                    ${session.app_version}

                </td>

                <td>

                    ${formatDate(session.started_at)}

                </td>

                <td>

                    ${duration}

                </td>

                <td>

                    <span class="${active ? "online" : "offline"}">

                        ${active ? "🟢 Active" : "🔴 Ended"}

                    </span>

                </td>

            </tr>

        `;

    });

    const totalPages =
        Math.ceil(response.total / pageSize);

    document.getElementById("pageInfo").textContent =
        `Page ${currentPage} of ${totalPages}`;

    document.getElementById("prevBtn").disabled =
        currentPage === 1;

    document.getElementById("nextBtn").disabled =
        currentPage >= totalPages;

}

function formatDate(date) {

    return new Date(date).toLocaleString("en-IN", {

        day: "2-digit",

        month: "short",

        year: "numeric",

        hour: "2-digit",

        minute: "2-digit"

    });

}
function formatDuration(seconds) {

    const h = Math.floor(seconds / 3600);

    const m = Math.floor((seconds % 3600) / 60);

    const s = seconds % 60;

    if (h > 0)
        return `${h}h ${m}m`;

    if (m > 0)
        return `${m}m ${s}s`;

    return `${s}s`;

}