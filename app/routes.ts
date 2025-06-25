import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
    index("routes/home.tsx"),
    route("todos/:todoID", "routes/todos.tsx"),
    route("projects", "routes/projects.tsx"),
    //route("cookies", "routes/cookies.tsx"),
    route("login", "routes/login.tsx"),
    //index("routes/login.tsx"),
    route("register", "routes/register.tsx"),
    route("logout", "routes/logout.tsx")
] satisfies RouteConfig;
