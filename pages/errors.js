import { getErrors } from "../js/api.js";
import { showModal } from "../components/modal.js";

let currentPage = 1;

const pageSize = 25;

export function loadErrors() {

    document.getElementById("content").innerHTML = `

    <div class="page-header">

        <h1>Errors</h1>

    </div>

    <div class="table-container">

        <table class="data-table">

            <thead>

                <tr>

                    <th>Alias</th>
                    <th>Message</th>
                    <th>File</th>
                    <th>Line</th>
                    <th>Time</th>
                    <th>Details</th>

                </tr>

            </thead>

            <tbody id="errorsTable">

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

            loadErrorsTable();

        }

    };

    document.getElementById("nextBtn").onclick = () => {

        currentPage++;

        loadErrorsTable();

    };

    loadErrorsTable();

}
async function loadErrorsTable() {

    const response = await getErrors(currentPage, pageSize);

    const tbody = document.getElementById("errorsTable");

    tbody.innerHTML = "";

    if (response.data.length === 0) {

        tbody.innerHTML = `

            <tr>

                <td colspan="6">

                    No Errors Found

                </td>

            </tr>

        `;

        return;

    }

    response.data.forEach(error => {

        tbody.innerHTML += `

        <tr>

            <td>${error.alias}</td>

            <td>${error.message}</td>

            <td>${error.file ?? "-"}</td>

            <td>${error.line ?? "-"}</td>

            <td>${formatDate(error.created_at)}</td>

            <td>

                <button
                    class="view-btn"
                    onclick='showError(${JSON.stringify(error).replace(/'/g,"&#39;")})'
                >

                    View

                </button>

            </td>

        </tr>

        `;

    });

    const totalPages = Math.ceil(response.total / pageSize);

    document.getElementById("pageInfo").textContent =
        `Page ${currentPage} of ${totalPages}`;

}
function formatDate(date){

    return new Date(date).toLocaleString("en-IN",{

        day:"2-digit",
        month:"short",
        year:"numeric",
        hour:"2-digit",
        minute:"2-digit"

    });

}
window.showError = function(error){

    showModal(

        "Error Details",

        JSON.stringify(error,null,4)

    );

}