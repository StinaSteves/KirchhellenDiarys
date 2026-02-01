import { Routes, Route } from "react-router-dom";
import HomePage from "../pages/HomePage.jsx";
import ArticleDetails from "../pages/ArticleDetails.jsx";
import CategoryDetails from "../pages/CategoryDetails.jsx";
import CategoryPage from "../pages/CategoryPage.jsx"; 
import Impressum from "../pages/Impressum.jsx";
import Datenschutz from "../pages/Datenschutz.jsx";
import Archiev from "../pages/Archiev.jsx";
import SearchResults from "../pages/SearchResults.jsx";

export default function BlogRoutes() {
    return (
        <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/artikel/:id" element={<ArticleDetails />} />
            <Route path="/kategorie/:categoryName" element={<CategoryPage />} />
            <Route path="/kategorien" element={<CategoryPage />} />
            <Route path="/impressum" element={<Impressum />} />
            <Route path="/datenschutz" element={<Datenschutz />} />
            <Route path="/archiev" element={<Archiev />} />
            <Route path="/suche" element={<SearchResults />} />
            <Route path="*" element={<div>404 – Seite nicht gefunden</div>} />
        </Routes>
    );
}