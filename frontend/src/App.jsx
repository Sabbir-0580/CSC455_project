import { useState } from "react";
import { createTask } from "./services/taskService";
import TaskList from "./components/TaskList";

function App() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleSubmit = async (e) => {
    e.preventDefault(); // stops the page from reloading on form submit

    if (!title.trim()) {
      alert("Title is required");
      return;
    }

    const newTask = {
      title,
      description: description || null,
      due_date: dueDate || null,
    };

    await createTask(newTask);

    // Clear the form
    setTitle("");
    setDescription("");
    setDueDate("");

    // Change refreshTrigger so TaskList knows to reload
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div style={{ maxWidth: "600px", margin: "40px auto", fontFamily: "sans-serif" }}>
      <h1>Smart Task Manager</h1>

      <form onSubmit={handleSubmit}>
        <div>
          <label>Title: </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div>
          <label>Description: </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div>
          <label>Due Date: </label>
          <input
            type="datetime-local"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </div>

        <button type="submit">Add Task</button>
      </form>

      <hr />

      <TaskList refreshTrigger={refreshTrigger} />
    </div>
  );
}

export default App;