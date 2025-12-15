// List of background videos
const videoPaths = [
  "videos/01.mp4",
  "videos/02.mp4",
  "videos/03.mp4",
  "videos/04.mp4"
];

const bgVideo = document.getElementById("bg-video");
let currentVideoIndex = 0;

function loadVideo(index) {
  bgVideo.src = videoPaths[index];
  bgVideo.load();
  bgVideo.play().catch(() => {});
}

// Initial load
loadVideo(currentVideoIndex);

// Change every 6 seconds
setInterval(() => {
  currentVideoIndex = (currentVideoIndex + 1) % videoPaths.length;
  loadVideo(currentVideoIndex);
}, 20000);


// --- Task Logic ---
const container = document.getElementById("taskContainer");
const addTaskBtn = document.getElementById("addTaskBtn");
const taskModal = document.getElementById("taskModal");
const saveTask = document.getElementById("saveTask");
const cancelTask = document.getElementById("cancelTask");
const modalTitle = document.getElementById("modalTitle");

let tasks = JSON.parse(localStorage.getItem("tasks") || "[]");
let editIndex = null;
let draggedIndex = null;

// --- Date display ---
document.getElementById("current-day").textContent =
  new Date().toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" });

// --- Open modal ---
addTaskBtn.onclick = () => {
  editIndex = null;
  modalTitle.textContent = "Create Task";
  document.getElementById("taskTitle").value = "";
  document.getElementById("taskDescription").innerHTML = ""; // contenteditable
  document.getElementById("taskStart").value = "";
  document.getElementById("taskEnd").value = "";
  document.getElementById("taskColor").value = "#7a66ff";
  document.getElementById("taskImage").value = "";
  taskModal.style.display = "flex";
};

// --- Cancel modal ---
cancelTask.onclick = () => taskModal.style.display = "none";

// --- Render tasks ---
function renderTasks() {
  container.innerHTML = "";
  tasks.forEach((task, i) => {
    const card = document.createElement("div");
    card.className = "task-card";
    if (task.completed) {
      card.classList.add("completed");
    }

    card.draggable = true;

    // --- Drag events ---
    card.addEventListener("dragstart", () => {
      draggedIndex = i;
      card.style.opacity = "0.5";
    });
    card.addEventListener("dragend", () => {
      draggedIndex = null;
      card.style.opacity = "1";
    });
    card.addEventListener("dragover", e => e.preventDefault());
    card.addEventListener("drop", () => {
      if (draggedIndex === null || draggedIndex === i) return;
      [tasks[i], tasks[draggedIndex]] = [tasks[draggedIndex], tasks[i]];
      localStorage.setItem("tasks", JSON.stringify(tasks));
      renderTasks();
    });

    // --- Card actions ---
    const actions = document.createElement("div");
    actions.className = "card-actions";

    // Edit
    const editBtn = document.createElement("button");
    editBtn.className = "icon-btn edit-btn";
    editBtn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" fill="#00ffff" viewBox="0 0 24 24" width="16" height="16">
        <path d="M3 17.25V21h3.75l11-11.03-3.75-3.75L3 17.25zm18-10.71c.39-.39.39-1.02 0-1.41l-2.34-2.34a.9959.9959 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
      </svg>`;
    editBtn.onclick = () => openEditModal(i);

    // Delete
    const delBtn = document.createElement("button");
    delBtn.className = "icon-btn delete-btn";
    delBtn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" fill="#ff4c4c" viewBox="0 0 24 24" width="16" height="16">
        <path d="M16 9v10H8V9h8m-1.5-6h-5l-1 1H5v2h14V4h-4.5l-1-1z"/>
      </svg>`;
    delBtn.onclick = () => deleteTask(i);

    actions.appendChild(editBtn);
    actions.appendChild(delBtn);
    card.appendChild(actions);

    // --- Icon / image ---
    const wrapper = document.createElement("div");
    wrapper.className = "task-icon-wrapper";
    if (task.image) {
      const img = document.createElement("img");
      img.src = task.image || "images/light-bulb.gif";;
      img.className = "task-icon";
      wrapper.appendChild(img);
    }
    card.appendChild(wrapper);

    // --- Title ---
    const t = document.createElement("div");
    t.className = "task-title";
    t.textContent = task.title;
    t.style.color = task.color;
    card.appendChild(t);

    // --- Time ---
    const tm = document.createElement("div");
    tm.className = "task-time";
    tm.textContent = `${task.start} – ${task.end}`;
    card.appendChild(tm);

    // --- Description ---
    const d = document.createElement("div");
    d.className = "task-desc";
    d.innerHTML = task.description;
    card.appendChild(d);

    container.appendChild(card);
  });
}

// --- Save task ---
saveTask.onclick = () => {
  const fileInput = document.getElementById("taskImage");
  const file = fileInput.files[0];

  // Get HTML directly from contenteditable
  const descHTML = document.getElementById("taskDescription").innerHTML;

  // Function that actually saves the task
  const saveWithImage = (imageData) => {
    const newTask = {
      title: document.getElementById("taskTitle").value || "Untitled",
      description: descHTML,
      start: document.getElementById("taskStart").value || "",
      end: document.getElementById("taskEnd").value || "",
      color: document.getElementById("taskColor").value,
      image:file ? reader.result : (editIndex !== null ? tasks[editIndex].image : "images/light-bulb.gif")
    };

    if (editIndex !== null) tasks[editIndex] = newTask;
    else tasks.push(newTask);

    try {
      localStorage.setItem("tasks", JSON.stringify(tasks));
      renderTasks();
      taskModal.style.display = "none";
    } catch (e) {
      alert("Storage full! GIF too large. Use smaller icons.");
      if (editIndex === null) tasks.pop();
    }
  };

  // If user selected a file
  if (file) {
    if (!file.type.startsWith("image/")) {
      alert("Only image files allowed");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => saveWithImage(reader.result);
    reader.readAsDataURL(file); // Base64
  } 
  // No new image (edit mode)
  else {
    saveWithImage(editIndex !== null ? tasks[editIndex].image : null);
  }
};

// --- Edit & Delete ---
function openEditModal(i) {
  editIndex = i;
  modalTitle.textContent = "Edit Task";
  const task = tasks[i];

  document.getElementById("taskTitle").value = task.title;
  document.getElementById("taskDescription").innerHTML = task.description; // load HTML bullets
  document.getElementById("taskStart").value = task.start;
  document.getElementById("taskEnd").value = task.end;
  document.getElementById("taskColor").value = task.color;

  taskModal.style.display = "flex";
}

function deleteTask(i) {
  if (confirm("Are you sure you want to delete this task?")) {
    tasks.splice(i, 1);
    localStorage.setItem("tasks", JSON.stringify(tasks));
    renderTasks();
  }
}

// Initial render
renderTasks();

// --- Generate time dropdown ---
function generateCosmicTimes(select) {
  for (let h = 0; h < 24; h++) {
    for (let m of ["00", "30"]) {
      let time = `${String(h).padStart(2, "0")}:${m}`;
      let opt = document.createElement("option");
      opt.value = time;
      opt.textContent = time;
      select.appendChild(opt);
    }
  }
}

generateCosmicTimes(document.getElementById("taskStart"));
generateCosmicTimes(document.getElementById("taskEnd"));

// --- Confetti ---
function launchConfetti() {
  const count = 30;
  const burst = document.createElement("div");
  burst.className = "confetti-burst";
  document.body.appendChild(burst);

  for (let i = 0; i < count; i++) {
    const piece = document.createElement("div");
    piece.className = "confetti-piece";

    const angle = Math.random() * 360;
    const distance = 120 + Math.random() * 60;
    const color = `hsl(${Math.random() * 360}, 90%, 60%)`;

    piece.style.setProperty("--angle", `${angle}deg`);
    piece.style.setProperty("--distance", `${distance}px`);
    piece.style.backgroundColor = color;

    burst.appendChild(piece);
  }

  setTimeout(() => burst.remove(), 900);
}

// --- Auto bullet insertion ---
document.getElementById("taskDescription").addEventListener("keydown", function (e) {
  if (e.key === "Enter") {
    e.preventDefault();

    // Insert a proper bullet inside the UL
    document.execCommand("insertHTML", false, "<li><br></li>");
  }
});
