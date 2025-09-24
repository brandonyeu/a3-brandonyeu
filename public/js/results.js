async function fetchResults() {
    const response = await fetch("/results");
    if (!response.ok) {
      alert("You must be logged in to view results.");
      window.location.href = "account.html";
      return;
    }
  
    const results = await response.json();
    const tbody = document.querySelector("#resultsTable tbody");
    tbody.innerHTML = "";
  
    results.forEach((rsvp) => {
      const tr = document.createElement("tr");
  
      tr.innerHTML = `
        <td>${rsvp.yourname}</td>
        <td>${rsvp.event}</td>
        <td>${rsvp.totalGuests}</td>
        <td>${rsvp.phoneNumber}</td>
        <td>${rsvp.emailAddress}</td>
        <td>
          <button class="tableButton editButton" data-id="${rsvp._id}">Edit</button>
          <button class="tableButton deleteButton" data-id="${rsvp._id}">Delete</button>
        </td>
      `;
  
      tbody.appendChild(tr);
    });
  
    // Wire up edit & delete
    document.querySelectorAll(".editButton").forEach((btn) =>
      btn.addEventListener("click", () => openEditModal(btn.dataset.id))
    );
    document.querySelectorAll(".deleteButton").forEach((btn) =>
      btn.addEventListener("click", () => deleteRSVP(btn.dataset.id))
    );
  }
  
  async function deleteRSVP(id) {
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
  }
  
  function openEditModal(id) {
    // TODO: Fill in modal editing logic
    alert("Open edit modal for RSVP " + id);
  }
  
  window.onload = fetchResults;
  