import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
    //index("routes/home.tsx"),
    route("todos/:todoID", "routes/todos.tsx"),
    route("projects", "routes/projects.tsx"),
    route("cookies", "routes/cookies.tsx")
] satisfies RouteConfig;
