<script>
    import { todos, containers } from "$lib/stores/todoStore";
    import TodoItem from "$lib/components/TodoItem.svelte";
    import { onMount } from "svelte";

    let newTodo = "";
    let newPriority = "Low";
    let newDate = "";
    let newTime = "";
    let containerName = "";

    const addContainer = () => {
        if (containerName.trim() === "") return;

        const newContainer = {
            id: Date.now(),
            name: containerName,
            todos: [],
            expanded: false,
        };

        containers.update((current) => [...current, newContainer]);
        containerName = "";
    };

    const toggleContainer = (e, id) => {
        containers.update((current) => {
            return current.map((container) => {
                if (container.id === id) {
                    container.expanded = !container.expanded;
                }
                return container;
            });
        });
        if (e.target.children[0].innerHTML === "v") {
            e.target.children[0].innerHTML = ">";
        } else {
            e.target.children[0].innerHTML = "v";
        }
    };

    const onDrop = (event, containerId) => {
        const todoText = event.dataTransfer.getData("text/plain");

        todos.update((current) => {
            const todoIndex = current.findIndex((t) => t.text === todoText);
            if (todoIndex !== -1) {
                const todo = current[todoIndex];
                const updatedTodos = [...current];
                updatedTodos.splice(todoIndex, 1);

                containers.update((currentContainers) => {
                    const container = currentContainers.find(
                        (c) => c.id === containerId,
                    );
                    if (container) {
                        container.todos.push(todo);
                    }
                    return currentContainers;
                });

                return updatedTodos;
            }
            return current;
        });
    };

    const onDragOver = (event) => {
        event.preventDefault();
    };

    const addTodo = () => {
        if (newTodo.trim() && newDate && newTime) {
            const isDuplicate = $todos.some(
                (todo) => todo.text.toLowerCase() === newTodo.toLowerCase(),
            );
            if (isDuplicate) {
                alert("This task already exists!");
                return;
            }

            todos.update((current) => {
                const newTodoObj = {
                    text: newTodo,
                    checked: false,
                    priority: newPriority,
                    date: newDate,
                    time: new Date(`${newDate}T${newTime}`).toLocaleTimeString(
                        "en-US",
                        { hour12: true, hour: "numeric", minute: "numeric" },
                    ),
                };

                return [...current, newTodoObj];
            });

            newTodo = "";
            newPriority = "Low";
            newDate = "";
            newTime = "";
        }
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

    const deleteTodo = (text) => {
        todos.update((current) => current.filter((todo) => todo.text !== text));
    };

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

    $: uncheckedCount = $todos.filter((todo) => !todo.checked).length;

    const onDragStart = (event, todoText) => {
        event.dataTransfer.setData("text/plain", todoText);
    };

    const onDropOutside = (event) => {
        const todoText = event.dataTransfer.getData("text/plain");
        containers.update((currentContainers) => {
            const updatedContainers = currentContainers.map((container) => {
                if (container.todos.some((todo) => todo.text === todoText)) {
                    const updatedTodos = container.todos.filter(
                        (todo) => todo.text !== todoText,
                    );
                    container.todos = updatedTodos;
                }
                return container;
            });

            return updatedContainers;
        });

        todos.update((current) => {
            const todo = current.find((t) => t.text === todoText);
            if (todo) {
                return current;
            }
            const movedTodo = {
                text: todoText,
                checked: false,
                priority: "Low",
                date: "",
                time: "",
            };
            return [...current, movedTodo];
        });
    };

    const clearChecked = () => {
        todos.update((current) => current.filter((todo) => !todo.checked));
    };
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

    <div class="input-group">
        <input
            type="text"
            bind:value={containerName}
            placeholder="Enter container name"
        />
        <button on:click={addContainer}>Add</button>
    </div>

    <div class="controls">
        <button class="clear-checked" on:click={clearChecked}
            >Delete Checked</button
        >
        <p>{uncheckedCount} unchecked item{uncheckedCount === 1 ? "" : "s"}</p>
    </div>

    <hr class="divider" />

    {#each $containers as container (container.id)}
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <div
            class="container"
            on:drop={(e) => onDrop(e, container.id)}
            on:dragover={onDragOver}
        >
            <!-- svelte-ignore a11y_click_events_have_key_events -->
            <div
                class="container-header"
                on:click={(e) => {toggleContainer(e, container.id);}}
            >
                <h3><span class="arrow">></span>{container.name}</h3>
            </div>
            {#if container.expanded}
                <div>
                    {#each container.todos as todo (todo.text)}
                        <TodoItem {todo} {deleteTodo} {toggleCheck} />
                    {/each}
                </div>
            {/if}
        </div>
    {/each}

    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div
        class="todo-list"
        on:drop={(e) => onDropOutside(e)}
        on:dragover={onDragOver}
    >
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

    .arrow {
        transition: transform 0.3s ease;
        margin-right: 15px;
    }

    .container {
        border: 1px dashed #ccc;
        margin-bottom: 1rem;
        height: 3rem;
        padding-left: 1rem;
    }

    .container-header {
        font-weight: bold;
        cursor: pointer;
    }

    .container:hover {
        background-color: #f7f7f7;
    }

    input[type="text"] {
        padding: 5px;
        font-size: 1rem;
        margin-right: 10px;
    }

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
        min-height: 100px;
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
