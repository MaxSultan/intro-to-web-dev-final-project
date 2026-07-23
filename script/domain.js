import {
  createArticle,
  deleteArticle,
  getAllArticles,
  updateArticle,
} from "./service.js";

const articles = getAllArticles();

export const getArticlesState = async () => [...(await articles)]

export const getArticle = (id) => {
  const index = articles.findIndex((a) => a.id === id);
  return index !== -1 ? articles[index] : null;
};

export const updateArticleState = (article) =>
  updateArticle(article).then((res) => {
    const index = articles.findIndex((a) => a.id === article.id);
    if (index !== -1) {
      articles[index] = res ?? article;
    }
  });

export const deleteArticleState = (id) =>
  deleteArticle(id).then((json) => {
    if (json) {
      const index = articles.findIndex((a) => a.id === article.id);
      if (index !== -1) {
        articles.splice(index, 1);
      }
    }
  });

// validate articles fields
export const validateTextLength = (value) => {
    if (value.length <= 0) return "Value is required";
    return "";
}