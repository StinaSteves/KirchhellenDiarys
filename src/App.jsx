import { BrowserRouter } from "react-router-dom";
import BlogRoutes from "./routes/BlogRoutes.jsx";

function App() {
    return (
        <BrowserRouter>
            <BlogRoutes />
        </BrowserRouter>
    );
}

export default App;
