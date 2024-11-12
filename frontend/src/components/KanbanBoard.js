import React, { useState, useEffect } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

const ItemType = "TASK";

const KanbanBoard = () => {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await fetch("http://localhost:8080/tasks");
      const data = await response.json();
      setTasks(data);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  const addTask = async () => {
    if (newTask.trim() !== "") {
      try {
        const response = await fetch("http://localhost:8080/tasks", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ title: newTask, status: "To Do" }),
        });
        const data = await response.json();
        setTasks([...tasks, data]);
        setNewTask("");
      } catch (error) {
        console.error("Error adding task:", error);
      }
    }
  };

  const moveTask = async (taskId, newStatus) => {
    try {
      const task = tasks.find((task) => task.id === taskId);
      const response = await fetch(`http://localhost:8080/tasks/${taskId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...task, status: newStatus }),
      });
      const data = await response.json();
      setTasks(tasks.map((task) => (task.id === taskId ? data : task)));
    } catch (error) {
      console.error("Error moving task:", error);
    }
  };

  const deleteTask = async (taskId) => {
    try {
      await fetch(`http://localhost:8080/tasks/${taskId}`, {
        method: "DELETE",
      });
      setTasks(tasks.filter((task) => task.id !== taskId));
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  const Task = ({ task }) => {
    const [, ref] = useDrag({
      type: ItemType,
      item: { id: task.id },
    });

    return (
      <div ref={ref} className="bg-white p-4 mb-4 rounded shadow">
        <p>{task.title}</p>
        <div className="flex justify-between">
          {task.status !== "Done" && (
            <button
              onClick={() =>
                moveTask(
                  task.id,
                  task.status === "To Do" ? "In Progress" : "Done"
                )
              }
              className="mt-2 p-2 bg-green-500 text-white rounded"
            >
              Move to {task.status === "To Do" ? "In Progress" : "Done"}
            </button>
          )}
          <button
            onClick={() => deleteTask(task.id)}
            className="mt-2 p-2 bg-red-500 text-white rounded"
          >
            Delete
          </button>
        </div>
      </div>
    );
  };

  const Column = ({ status, children }) => {
    const [, ref] = useDrop({
      accept: ItemType,
      drop: (item) => moveTask(item.id, status),
    });

    return (
      <div ref={ref} className="w-1/3 bg-gray-100 p-4 rounded shadow">
        <h2 className="text-xl font-semibold mb-4">{status}</h2>
        {children}
      </div>
    );
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="w-full h-full items-center justify-center p-4">
        <h1 className="text-2xl font-bold text-center mb-4">Kanban Board</h1>
        <div className="mb-4 flex justify-center w-full">
          <input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            placeholder="Enter new task"
            className="p-2 border border-gray-300 rounded mr-2"
          />
          <button
            onClick={addTask}
            className="p-2 bg-blue-500 text-white rounded"
          >
            Add Task
          </button>
        </div>
        <div className="flex overflow-x-auto space-x-4">
          {["To Do", "In Progress", "Done"].map((status) => (
            <Column key={status} status={status}>
              {tasks
                .filter((task) => task.status === status)
                .map((task) => (
                  <Task key={task.id} task={task} />
                ))}
            </Column>
          ))}
        </div>
      </div>
    </DndProvider>
  );
};

export default KanbanBoard;
