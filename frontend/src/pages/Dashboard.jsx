import { useEffect, useState } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

function Dashboard() {
  const { user, logout } = useAuth();

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    dueDate: "",
  });

  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editData, setEditData] = useState({
    title: "",
    description: "",
    dueDate: "",
  });

  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/tasks");

      setTasks(response.data);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Unable to load your tasks. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  const handleCreateTask = async (event) => {
    event.preventDefault();
    setError("");

    if (!formData.title.trim()) {
      setError("Task title is required.");
      return;
    }

    try {
      setCreating(true);

      const response = await api.post("/tasks", {
        title: formData.title.trim(),
        description: formData.description.trim(),
        dueDate: formData.dueDate || undefined,
      });

      setTasks((currentTasks) => [response.data, ...currentTasks]);

      setFormData({
        title: "",
        description: "",
        dueDate: "",
      });
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Unable to create the task. Please try again."
      );
    } finally {
      setCreating(false);
    }
  };

  const toggleComplete = async (task) => {
    try {
      setError("");

      const response = await api.put(`/tasks/${task._id}`, {
        isCompleted: !task.isCompleted,
      });

      setTasks((currentTasks) =>
        currentTasks.map((currentTask) =>
          currentTask._id === task._id ? response.data : currentTask
        )
      );
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Unable to update the task. Please try again."
      );
    }
  };

  const startEditing = (task) => {
    setEditingTaskId(task._id);

    setEditData({
      title: task.title,
      description: task.description || "",
      dueDate: task.dueDate
        ? new Date(task.dueDate).toISOString().split("T")[0]
        : "",
    });
  };

  const cancelEditing = () => {
    setEditingTaskId(null);

    setEditData({
      title: "",
      description: "",
      dueDate: "",
    });
  };

  const handleEditChange = (event) => {
    setEditData({
      ...editData,
      [event.target.name]: event.target.value,
    });
  };

  const saveEdit = async (taskId) => {
    if (!editData.title.trim()) {
      setError("Task title is required.");
      return;
    }

    try {
      setError("");

      const response = await api.put(`/tasks/${taskId}`, {
        title: editData.title.trim(),
        description: editData.description.trim(),
        dueDate: editData.dueDate || undefined,
      });

      setTasks((currentTasks) =>
        currentTasks.map((task) =>
          task._id === taskId ? response.data : task
        )
      );

      cancelEditing();
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Unable to update the task. Please try again."
      );
    }
  };

  const deleteTask = async (taskId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this task?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      await api.delete(`/tasks/${taskId}`);

      setTasks((currentTasks) =>
        currentTasks.filter((task) => task._id !== taskId)
      );
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Unable to delete the task. Please try again."
      );
    }
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div>
          <h1>Ledger</h1>
          <p>Welcome, {user?.username}</p>
        </div>

        <button onClick={logout}>Logout</button>
      </header>

      <main>
        <div className="dashboard-title">
          <h2>Your Tasks</h2>
          <p>Manage your tasks and keep track of your progress.</p>
        </div>

        {error && <div className="error-banner">{error}</div>}

        <section className="create-task">
          <h3>Create a Task</h3>

          <form onSubmit={handleCreateTask}>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Task title"
              maxLength="100"
            />

            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Task description"
              rows="3"
            />

            <input
              type="date"
              name="dueDate"
              value={formData.dueDate}
              onChange={handleChange}
            />

            <button type="submit" disabled={creating}>
              {creating ? "Creating..." : "Add Task"}
            </button>
          </form>
        </section>

        {loading ? (
          <div className="loading">
            <p>Loading your tasks...</p>
          </div>
        ) : tasks.length === 0 ? (
          <div className="empty-state">
            <h3>No tasks yet</h3>
            <p>Create your first task to get started.</p>
          </div>
        ) : (
          <div className="task-grid">
            {tasks.map((task) => (
              <div className="task-card" key={task._id}>
                {editingTaskId === task._id ? (
                  <>
                    <input
                      type="text"
                      name="title"
                      value={editData.title}
                      onChange={handleEditChange}
                      maxLength="100"
                    />

                    <textarea
                      name="description"
                      value={editData.description}
                      onChange={handleEditChange}
                      rows="3"
                    />

                    <input
                      type="date"
                      name="dueDate"
                      value={editData.dueDate}
                      onChange={handleEditChange}
                    />

                    <div className="task-actions">
                      <button onClick={() => saveEdit(task._id)}>
                        Save
                      </button>

                      <button onClick={cancelEditing}>
                        Cancel
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <h3>{task.title}</h3>

                    {task.description && <p>{task.description}</p>}

                    {task.dueDate && (
                      <small>
                        Due:{" "}
                        {new Date(task.dueDate).toLocaleDateString()}
                      </small>
                    )}

                    <div className="task-status">
                      {task.isCompleted ? "Completed" : "Pending"}
                    </div>

                    <div className="task-actions">
                      <button onClick={() => toggleComplete(task)}>
                        {task.isCompleted
                          ? "Mark Pending"
                          : "Complete"}
                      </button>

                      <button onClick={() => startEditing(task)}>
                        Edit
                      </button>

                      <button onClick={() => deleteTask(task._id)}>
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default Dashboard;