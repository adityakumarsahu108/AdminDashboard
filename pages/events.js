import { getEvents } from "../js/api.js";
import { showModal } from "../components/modal.js";
let currentPage = 1;
const pageSize = 25;

export async function loadEvents() {

    document.getElementById("content").innerHTML = `

        <div class="page-header">

            <h1>Events</h1>

            <input
                id="searchEvents"
                type="text"
                placeholder="Search Events..."
            >

        </div>

        <div class="table-container">

            <table class="data-table">

                <thead>

                   <tr>

    <th>Alias</th>
    <th>Event</th>
    <th>Time</th>
    <th>Details</th>

</tr>
                </thead>

                <tbody id="eventsTable">

                    <tr>

                        <td colspan="4">

                            Loading...

                        </td>

                    </tr>

                </tbody>

            </table>

        </div>

        <div class="pagination">

            <button id="prevBtn">Previous</button>

            <span id="pageInfo"></span>

            <button id="nextBtn">Next</button>

        </div>

    `;

    document
        .getElementById("searchEvents")
        .addEventListener("input", () => {

            currentPage = 1;

            loadEventsTable();

        });

    document
        .getElementById("prevBtn")
        .onclick = () => {

            if (currentPage > 1) {

                currentPage--;

                loadEventsTable();

            }

        };

    document
        .getElementById("nextBtn")
        .onclick = () => {

            currentPage++;

            loadEventsTable();

        };

    loadEventsTable();

}
async function loadEventsTable() {

    const search = document
        .getElementById("searchEvents")
        .value;

    const response = await getEvents(

        currentPage,

        pageSize,

        search

    );

    const tbody =
        document.getElementById("eventsTable");

    tbody.innerHTML = "";

    if (response.data.length === 0) {

        tbody.innerHTML = `

            <tr>

                <td colspan="4">

                    No Events Found

                </td>

            </tr>

        `;

        return;

    }

    response.data.forEach(event => {

        tbody.innerHTML += `

           <tr>

    <td>

        ${event.alias ?? "-"}

    </td>

    <td>

        ${formatEvent(event.event)}

    </td>

    <td>

        ${formatDate(event.created_at)}

    </td>

    <td>

        <button
            class="view-btn"
            onclick='showEventDetails(${JSON.stringify(event.details || {})})'
        >

            View

        </button>

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
function formatEvent(event) {

    return event
        .replaceAll("_", " ")
        .replace(/\b\w/g, c => c.toUpperCase());

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
window.showEventDetails = function (details) {

    showModal(

        "Event Details",

        JSON.stringify(details, null, 4)

    );

}