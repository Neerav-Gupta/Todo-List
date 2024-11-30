<script>
    import { todos } from "$lib/stores/todoStore";
    import TodoItem from "$lib/components/oldTodoItem.svelte";

    let newTodo = "";
    let newPriority = "Low";
    let newDate = "";
    let newTime = "";

    $: sortedTodos = [...$todos].sort((a, b) => {
        const priorityOrder = { High: 3, Medium: 2, Low: 1 };
        if (a.checked !== b.checked) {
            return a.checked - b.checked;
        }
        const priorityDiff =
            priorityOrder[b.priority] - priorityOrder[a.priority];
        if (priorityDiff !== 0) return priorityDiff;
        const dateDiff = new Date(a.date) - new Date(b.date);
        if (dateDiff !== 0) return dateDiff;
        return a.time.localeCompare(b.time);
    });

    const addTodo = () => {
        if (newTodo.trim() && newDate && newTime) {
            const isDuplicate = $todos.some(
                (todo) => todo.text.toLowerCase() === newTodo.toLowerCase(),
            );
            if (isDuplicate) {
                alert("This task already exists!");
                return;
            }

            todos.update((current) => [
                ...current,
                {
                    text: newTodo,
                    checked: false,
                    priority: newPriority,
                    date: newDate,
                    time: new Date(`${newDate}T${newTime}`).toLocaleTimeString(
                        "en-US",
                        { hour12: true, hour: "numeric", minute: "numeric" },
                    ),
                },
            ]);
            newTodo = "";
            newPriority = "Low";
            newDate = "";
            newTime = "";
        }
    };

    const deleteTodo = (text) => {
        todos.update((current) => current.filter((todo) => todo.text !== text));
    };

    const toggleCheck = (text) => {
        todos.update((current) =>
            current.map((todo) => {
                if (todo.text === text) {
                    return { ...todo, checked: !todo.checked };
                }
                return todo;
            }),
        );
    };

    const clearChecked = () => {
        todos.update((current) => current.filter((todo) => !todo.checked));
    };

    $: uncheckedCount = $todos.filter((todo) => !todo.checked).length;
</script>

<div class="todo-app">
    <h1>To-Do List</h1>

    <div class="input-group">
        <input
            type="text"
            bind:value={newTodo}
            placeholder="Add a new task..."
        />

        <select bind:value={newPriority}>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
        </select>

        <input type="date" bind:value={newDate} />
        <input type="time" bind:value={newTime} />

        <button on:click={addTodo}>Add</button>
    </div>

    <div class="controls">
        <button class="clear-checked" on:click={clearChecked}
            >Delete Checked</button
        >
        <p>{uncheckedCount} unchecked item{uncheckedCount === 1 ? "" : "s"}</p>
    </div>

    <hr class="divider" />

    <div class="todo-list">
        {#each sortedTodos.filter((todo) => !todo.checked) as todo (todo.text)}
            <TodoItem {todo} {deleteTodo} {toggleCheck} />
        {/each}

        {#if sortedTodos.some((todo) => todo.checked)}
            <div class="divider"></div>
        {/if}

        {#if sortedTodos.some((todo) => todo.checked)}
            <div class="checked-zone">
                {#each sortedTodos.filter((todo) => todo.checked) as todo (todo.text)}
                    <TodoItem {todo} {deleteTodo} {toggleCheck} />
                {/each}
            </div>
        {/if}
    </div>
</div>

<style>
    @import url("https://fonts.googleapis.com/css2?family=League+Spartan:wght@400&display=swap");

    :global(body) {
        font-family: "League Spartan", sans-serif;
        margin: 0;
        padding: 0;
        box-sizing: border-box;
    }

    .todo-app {
        max-width: 500px;
        margin: auto;
        padding: 1rem;
    }

    h1 {
        font-size: 2.5rem;
        margin-bottom: 1.5rem;
        font-weight: 900;
    }

    .input-group {
        display: flex;
        margin-bottom: 1rem;
    }

    .input-group input {
        flex: 1;
        padding: 0.5rem;
        border: 1px solid #ccc;
        border-radius: 5px;
    }

    .input-group button {
        padding: 0.5rem 1rem;
        margin-left: 0.5rem;
        border: 1px solid #ccc;
        border-radius: 5px;
        cursor: pointer;
    }

    .controls {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 1rem;
    }

    .todo-list {
        text-align: left;
    }

    .clear-checked {
        padding: 0.5rem 1rem;
        border: 1px solid #ccc;
        border-radius: 5px;
        cursor: pointer;
    }

    p {
        font-size: 0.9rem;
        color: #555;
        margin: 0;
    }

    .divider {
        border: 0;
        border-top: 1px solid #ccc;
        margin: 1rem 0;
    }

    .input-group select,
    .input-group input[type="date"] {
        margin-left: 0.5rem;
        padding: 0.5rem;
        border: 1px solid #ccc;
        border-radius: 5px;
    }

    .checked-zone {
        background-color: #f0f0f0;
        margin-top: 1rem;
        padding: 1rem;
        border-radius: 5px;
    }

    .input-group input[type="time"] {
        margin-left: 0.5rem;
        padding: 0.5rem;
        border: 1px solid #ccc;
        border-radius: 5px;
    }

    button:hover {
        color: white;
        background-color: #555;
    }

    button,
    select,
    option,
    input {
        font-family: "League Spartan";
        font-size: 0.85rem;
    }
</style>
