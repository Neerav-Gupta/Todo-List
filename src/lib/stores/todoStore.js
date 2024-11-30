import { writable } from "svelte/store";
import { browser } from '$app/environment';

const savedTodos = JSON.parse(browser && localStorage.getItem('todos')) || [];
const savedContainers = JSON.parse(browser && localStorage.getItem('containers')) || [];

export const todos = writable(savedTodos);
export const containers = writable(savedContainers);

todos.subscribe(($todos) => {
    browser && localStorage.setItem('todos', JSON.stringify($todos));
});

containers.subscribe(($containers) => {
    browser && localStorage.setItem('containers', JSON.stringify($containers));
});
