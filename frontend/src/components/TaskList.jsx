import { useEffect, useState } from "react";
import { getTasks, deleteTask } from "../services/taskService";

function TaskList({ refreshTrigger }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch tasks from the backend
  const loadTasks = async () => {
    setLoading(true);
    const data = await getTasks();
    setTasks(data);
    setLoading(false);
  };

  // Run loadTasks() once when the component first appears,
  // and again every time "refreshTrigger" changes (e.g. after adding a task)
  useEffect(() => {
    loadTasks();
  }, [refreshTrigger]);

  const handleDelete = async (taskId) => {
    await deleteTask(taskId);
    loadTasks(); // refresh the list after deleting
  };

  if (loading) {
    return <p>Loading tasks...</p>;
  }

  if (tasks.length === 0) {
    return <p>No tasks yet. Add one above!</p>;
  }

  return (
    <ul>
      {tasks.map((task) => (
        <li key={task.id}>
          <strong>{task.title}</strong>
          {task.description && <p>{task.description}</p>}
          {task.due_date && <p>Due: {task.due_date}</p>}
          <p>Status: {task.completed ? "Completed" : "Not completed"}</p>
          <button onClick={() => handleDelete(task.id)}>Delete</button>
        </li>
      ))}
    </ul>
  );
}

export default TaskList;