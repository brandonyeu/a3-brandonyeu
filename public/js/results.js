let currentData = [];

async function fetchResults() {
  try {
    const response = await fetch("/results", { credentials: "same-origin" });
    if (!response.ok) {
      alert("You must be logged in to view results.");
      window.location.href = "account.html";
      return;
    }

    const results = await response.json();
    console.log("Fetched results:", results);
    currentData = results;

    const tbody = document.querySelector("#resultsTable tbody");
    tbody.innerHTML = "";

    results.forEach(rsvp => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td class="px-4 py-2 border border-[#E6DBD0] bg-[#5C4950] text-[#E6DBD0]">${rsvp.yourname}</td>
        <td class="px-4 py-2 border border-[#E6DBD0] bg-[#5C4950] text-[#E6DBD0]">${rsvp.event}</td>
        <td class="px-4 py-2 border border-[#E6DBD0] bg-[#5C4950] text-[#E6DBD0]">${rsvp.totalGuests}</td>
        <td class="px-4 py-2 border border-[#E6DBD0] bg-[#5C4950] text-[#E6DBD0]">${rsvp.phoneNumber}</td>
        <td class="px-4 py-2 border border-[#E6DBD0] bg-[#5C4950] text-[#E6DBD0]">${rsvp.emailAddress}</td>
        <td class="px-4 py-2 border border-[#E6DBD0] bg-[#5C4950] flex gap-2">
          <button class="editButton bg-yellow-400 px-3 py-1 rounded hover:bg-yellow-500" data-id="${rsvp._id}">Edit</button>
          <button class="deleteButton bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600" data-id="${rsvp._id}">Delete</button>
        </td>
      `;
      tbody.appendChild(tr);
    });

    document.querySelectorAll(".editButton").forEach(btn => {
      btn.addEventListener("click", (e) => {
        console.log("Edit clicked:", btn.dataset.id);
        openEditModal(btn.dataset.id);
      });
    });

    document.querySelectorAll(".deleteButton").forEach(btn => {
      btn.addEventListener("click", () => deleteRSVP(btn.dataset.id));
    });
  } catch (err) {
    console.error("Error fetching results:", err);
  }
}

function openEditModal(id) {
  console.log("Edit clicked:", id);
  const rsvp = currentData.find(item => item._id === id);
  if (!rsvp) return;

  document.getElementById("editName").value = rsvp.yourname;
  document.getElementById("editEvent").value = rsvp.event;
  document.getElementById("editNumAdditional").value = rsvp.totalGuests;
  document.getElementById("editPhone").value = rsvp.phoneNumber;
  document.getElementById("editEmail").value = rsvp.emailAddress;

  document.getElementById("saveEdit").dataset.id = id;

  document.getElementById("editOverlay").classList.remove("hidden");
}

document.getElementById("cancelEdit").addEventListener("click", () => {
  document.getElementById("editOverlay").classList.add("hidden");
});


async function deleteRSVP(id) {
  try {
    const response = await fetch("/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (response.ok) {
      fetchResults();
    } else {
      alert("Error deleting RSVP");
    }
  } catch (err) {
    console.error("Delete error:", err);
  }
}

async function updateNavbar() {
  const navRight = document.querySelector("#nav-right");
  if (!navRight) return;
  navRight.innerHTML = "";
  const accountLi = document.createElement("li");
  accountLi.innerHTML = `<a href="account.html" class="font-bold text-[#F9E0D9] hover:text-[#E6DBD0]">Account</a>`;
  navRight.appendChild(accountLi);
}

// DOMContentLoaded ensures all elements exist
window.addEventListener("DOMContentLoaded", async () => {
  await updateNavbar();
  await fetchResults();

  document.getElementById("cancelEdit").addEventListener("click", () => {
    console.log("Cancel clicked");
    document.getElementById("editOverlay").classList.add("hidden");
  });

  document.getElementById("saveEdit").addEventListener("click", async (e) => {
    const id = e.target.dataset.id;
    console.log("Save clicked for id:", id);

    const updated = {
      yourname: document.getElementById("editName").value,
      event: document.getElementById("editEvent").value,
      totalGuests: document.getElementById("editNumAdditional").value,
      phoneNumber: document.getElementById("editPhone").value,
      emailAddress: document.getElementById("editEmail").value,
    };

    const response = await fetch(`/update/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated),
    });

    if (response.ok) {
      document.getElementById("editOverlay").classList.add("hidden");
      fetchResults();
    } else {
      alert("Error updating RSVP");
    }
  });
});
