import {
  createArticle,
  deleteArticle,
  getAllArticles,
  updateArticle,
} from "./service.js";

let articles = [];
let articlesPromise = null;

const ensureArticlesLoaded = async () => {
  if (articles.length > 0) {
    return articles;
  }

  if (!articlesPromise) {
    articlesPromise = getAllArticles().then((loadedArticles) => {
      articles = loadedArticles;
      return articles;
    });
  }

  return await articlesPromise;
};

export const getArticlesState = async () => {
  await ensureArticlesLoaded();
  return [...articles];
};

export const getArticle = async (id) => {
  await ensureArticlesLoaded();
  const index = articles.findIndex((a) => a.id === id);
  return index !== -1 ? articles[index] : null;
};

export const updateArticleState = async (article) => {
  await ensureArticlesLoaded();
  const res = await updateArticle(article);
  const index = articles.findIndex((a) => a.id === article.id);
  if (index !== -1) {
    articles[index] = res ?? article;
  }
};

export const createArticleState = async (article) => {
  await ensureArticlesLoaded();
  const res = await createArticle(article);
  articles.push(res ?? article);
};

export const deleteArticleState = async (id) => {
  await ensureArticlesLoaded();
  const json = await deleteArticle(id);
  if (json) {
    const index = articles.findIndex((a) => a.id === id);
    if (index !== -1) {
      articles.splice(index, 1);
    }
  }
};

// validate articles fields
export const validateTextLength = (value) => {
    if (value.length <= 0) return "Value is required";
    return "";
}