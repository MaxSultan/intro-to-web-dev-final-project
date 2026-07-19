import {
  createArticle,
  deleteArticle,
  getAllArticles,
  updateArticle,
} from "./service.js";

// local cache; populated asynchronously
let articles = [];

// populate cache (no top-level await)
getAllArticles().then((data) => {
  articles = Array.isArray(data) ? data : [];
}).catch(() => {
  articles = [];
});

// get all articles
export const getArticles = () => [...articles];

// get one article by id
export const getArticle = (id) => {
  const index = articles.findIndex((a) => a.id === id);
  return index !== -1 ? articles[index] : null;
};

// update an article
export const updateArticleState = (article) =>
  updateArticle(article).then((res) => {
    const index = articles.findIndex((a) => a.id === article.id);
    if (index !== -1) {
      articles[index] = res ?? article;
    }
  });

// create an article
export const createArticleState = (article) =>
  createArticle(article).then((res) => {
    articles.push(res ?? article);
  });

// delete an article
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
