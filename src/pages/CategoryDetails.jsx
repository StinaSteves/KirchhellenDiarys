import { useParams } from "react-router-dom";
import blogData from "../assets/data/blogData.js";
import NewNav from "../assets/components/ArticleNav.jsx";
import Footer from "../assets/components/Footer.jsx";
import BlogCard from "../assets/components/BlogCard.jsx";

export default function CategoryDetails() {
    const { categoryName } = useParams();

    const filteredArticles = blogData
        .filter(
            (article) =>
                article.category.toLowerCase() === categoryName.toLowerCase()
        )
        .sort((a, b) => new Date(b.date) - new Date(a.date));

    const [firstArticle, secondArticle, thirdArticle, ...rest] =
        filteredArticles;

    return (
        <>
            <NewNav theme="light" />
            <div className="categoryDetailsWrapper">
                <h1 className="categoryTitle">{categoryName}</h1>

                <div className="featuredArticlesLayout">
                    {firstArticle && (
                        <div className="featuredMain">
                            <BlogCard article={firstArticle} className="is-featured" />
                        </div>
                    )}
                    <div className="featuredSide">
                        {secondArticle && (
                            <BlogCard article={secondArticle} maxWords={20} />
                        )}
                        {thirdArticle && (
                            <BlogCard article={thirdArticle} maxWords={20} />
                        )}
                    </div>
                </div>


                {rest.length > 0 && (
                    <div className="articlesGrid">
                        {rest.map((article) => (
                            <BlogCard key={article.id} article={article} />
                        ))}
                    </div>
                )}
            </div>
            <Footer />
        </>
    );
}
