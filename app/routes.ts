import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
    // Main application routes
    index("pages/Home.tsx"),
    route("model-cards", "pages/ModelCards.tsx"),
    // Use unique file paths for each route to avoid duplicate IDs
    route("model-cards/new", "pages/ModelCardEditor.tsx", { id: "model-card-new" }),
    route("model-cards/:id", "pages/ModelCardEditor.tsx", { id: "model-card-edit" }),
    
    // Workflow routes
    route("workflows", "pages/Workflows.tsx"),
    route("workflows/new", "pages/WorkflowEditor.tsx", { id: "workflow-new" }),
    route("workflows/:id", "pages/WorkflowEditor.tsx", { id: "workflow-edit" }),
    
    route("mcp-servers", "pages/MCPServerManager.tsx"),
    route("settings", "pages/Settings.tsx"),
    
    // Original demo routes
    route("component", "routes/component.tsx"),
    route("sample", "routes/sample.tsx"),
    route("samplesplat/*", "routes/samplesplat.tsx"),
    // routes with client loader
    route("users/:pid", "routes/users.pid.tsx"),
    route("/users", "routes/users.tsx"),
    // routes with server loader
    route("susers/:pid", "routes/susers.pid.tsx"),
    route("/susers", "routes/susers.tsx"),
    // posts
    route("/posts", "routes/posts.tsx"),
    route("/sposts", "routes/sposts.tsx")
] satisfies RouteConfig;
