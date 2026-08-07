import { useEffect, useState } from "react";
import { getTasks, deleteTask, updateTask } from "../services/taskService";

function TaskList({ refreshTrigger }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");

  const loadTasks = async () => {
    setLoading(true);
    const data = await getTasks();
    setTasks(data);
    setLoading(false);
  };

  useEffect(() => {
    loadTasks();
  }, [refreshTrigger]);

  const handleDelete = async (taskId) => {
    await deleteTask(taskId);
    loadTasks();
  };

  const handleToggleComplete = async (task) => {
    await updateTask(task.id, {
      title: task.title,
      description: task.description,
      due_date: task.due_date,
      completed: !task.completed,
    });
    loadTasks();
  };

  const handleEditClick = (task) => {
    setEditingId(task.id);
    setEditTitle(task.title);
  };

  const handleEditSave = async (task) => {
    await updateTask(task.id, {
      title: editTitle,
      description: task.description,
      due_date: task.due_date,
      completed: task.completed,
    });
    setEditingId(null);
    loadTasks();
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
          {editingId === task.id ? (
            <>
              <input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
              />
              <button onClick={() => handleEditSave(task)}>Save</button>
              <button onClick={() => setEditingId(null)}>Cancel</button>
            </>
          ) : (
            <>
              <strong>{task.title}</strong>
              <button onClick={() => handleEditClick(task)}>Edit</button>
            </>
          )}

          {task.description && <p>{task.description}</p>}
          {task.due_date && <p>Due: {task.due_date}</p>}

          <p>
            <label>
              <input
                type="checkbox"
                checked={task.completed}
                onChange={() => handleToggleComplete(task)}
              />
              {" "}Completed
            </label>
          </p>

          <button onClick={() => handleDelete(task.id)}>Delete</button>
        </li>
      ))}
    </ul>
  );
}

export default TaskList;