<script>
    export let todo;
    export let toggleCheck;
    export let deleteTodo;
</script>

<div class="todo-item">
    <button class="main-button" on:click={() => toggleCheck(todo.text)}>
        <input
            type="checkbox"
            bind:checked={todo.checked}
            on:click={(e) => e.stopPropagation()}
        />
        <span class={todo.checked ? "checked" : ""}>{todo.text}</span>
        <span class="meta">
            <span class="priority {todo.priority.toLowerCase()}"
                >{todo.priority}</span
            >
            <span class="date">{todo.date}, {todo.time}</span>
        </span>
    </button>
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div
        class="delete"
        on:click={(e) => {
            e.stopPropagation();
            deleteTodo(todo.text);
        }}>❌</div
    >
</div>

<style>
    .todo-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin: 0.5rem 0;
    }

    .main-button {
        all: unset;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        flex: 1;
        padding: 0.5rem;
        cursor: pointer;
        margin-right: 0.6rem;
    }

    .main-button:hover {
        outline: 2px solid #007bff;
        border-radius: 5px;
    }

    .checked {
        text-decoration: line-through;
        color: grey;
    }

    .delete {
        color: grey;
        font-size: 0.9rem;
        cursor: pointer;
    }

    .delete:hover {
        color: black;
    }

    .meta {
        margin-left: 1rem;
        font-size: 0.85rem;
        display: flex;
        gap: 0.5rem;
        align-items: center;
    }

    .priority {
        padding: 0.2rem 0.5rem;
        border-radius: 5px;
        color: white;
        font-weight: bold;
    }

    .priority.low {
        background-color: green;
    }

    .priority.medium {
        background-color: orange;
    }

    .priority.high {
        background-color: red;
    }

    .date {
        font-style: italic;
        color: gray;
    }
</style>
