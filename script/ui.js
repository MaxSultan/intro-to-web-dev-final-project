import { getArticlesState } from "./domain.js";
import { getArticle } from "./service.js";

const notFoundElement = document.createElement("h2");
notFoundElement.innerText = "404 - Not Found";

const NOT_FOUND_ROUTE = {
  title: "404",
  render: async () => await [notFoundElement],
};

const routes = {
  "/": { title: "home", render: renderHome },
  "#/": { title: "home", render: renderHome },
  "#/articles": { title: "articles", render: renderArticlesIndex },
  "#/articles/new": { title: "Create Article", render: renderArticleCreate },
};

async function renderHome() {
  const { headerElement, navElement } = setupSharedLayout();
  const mainElement = document.createElement("main");

  const titleElement = document.createElement("h2");
  titleElement.innerText = "HOME";

  mainElement.replaceChildren(titleElement);

  return [headerElement, navElement, mainElement];
}

async function renderArticlesIndex() {
  const { headerElement, navElement } = setupSharedLayout();
  const articleSectionElement = await renderArticles();

  const mainElement = document.createElement("main");
  const titleElement = document.createElement("h2");
  titleElement.innerText = "ARTICLES INDEX";

  mainElement.replaceChildren(titleElement, articleSectionElement);

  return [headerElement, navElement, mainElement];
}

const createTagsElement = (tag) => {
    const divElement = document.createElement("div");
    divElement.classList.add("tag");
    divElement.innerText = tag;

    return divElement;
}

async function renderArticleShow(article) {
  const { headerElement, navElement } = setupSharedLayout();

  const mainElement = document.createElement("main");
  mainElement.classList.add("article-content");

  const titleElement = document.createElement("h2");
  titleElement.classList.add("article-title");
  titleElement.innerText = article.title;

  const subtitleElement = document.createElement("p");
  subtitleElement.classList.add("article-subtitle");
  subtitleElement.innerText = `Description: ${article.description}`;

  const authorElement = document.createElement("p");
  authorElement.classList.add("article-author");
  authorElement.innerText = `Author: ${article.author}`;

  const articleBodyElement = document.createElement("p");
  articleBodyElement.classList.add("article-body");
  articleBodyElement.innerText = article.body;

  mainElement.replaceChildren(titleElement, subtitleElement, authorElement, ...((article?.tags || []).map(createTagsElement)), articleBodyElement);

  return [headerElement, navElement, mainElement];
}

async function renderArticleCreate() {
  const { headerElement, navElement } = setupSharedLayout();
  const mainElement = document.createElement("main");

  const titleElement = document.createElement("h2");
  titleElement.innerText = "CREATE ARTICLE";
  mainElement.replaceChildren(titleElement);

  return [headerElement, navElement, mainElement];
}

const getDynamicPath = async (path) => {
  const dynamicArticleMatch = path.match(/^#\/articles\/(.+)$/);
  if (!dynamicArticleMatch) {
    return null;
  }

  const id = dynamicArticleMatch[1];
  const article = await getArticle(id);
  return article
    ? { title: article.title, render: async () => await renderArticleShow(article) }
    : null;
};

const router = async () => {
  const path = window.location.hash || "#/";

  const routePromise = routes[path]
    ? Promise.resolve(routes[path])
    : getDynamicPath(path)
        .then((dynamicRoute) => dynamicRoute || NOT_FOUND_ROUTE)
        .catch(() => NOT_FOUND_ROUTE);

  const route = await routePromise;
  document.title = route.title;
  document.getElementById("app").replaceChildren(...(await route.render()));
};

const navigateTo = (url) => {
  window.history.pushState(null, null, url);
  router();
};

const setupArticles = () => {
  const sectionElement = document.createElement("section");
  sectionElement.classList.add("articles-section");
  return sectionElement;
};

const createArticleOverviewElement = (article) => {
  const articleTableRowElement = document.createElement("tr");
  articleTableRowElement.classList.add("article-overview");
  delete article.body;
  articleTableRowElement.replaceChildren(
    ...Object.values(article).map((val) => {
      const tdElement = document.createElement("td");
      const anchorElement = document.createElement("a");
      anchorElement.setAttribute(
        "href",
        `/intro-to-web-dev-final-project/#/articles/${article.id}`,
      );
      anchorElement.innerText = val;
      anchorElement.style.display = "block";
      tdElement.replaceChildren(anchorElement);
      return tdElement;
    }),
  );

  return articleTableRowElement;
};

async function renderArticles() {
  const articles = await getArticlesState();
  const articleSectionElement = setupArticles();
  const articlesTableElement = document.createElement("table");
  articlesTableElement.classList.add("articles-table");

  const tHeadElement = document.createElement("thead");
  const headerRowElement = document.createElement("tr");
  tHeadElement.replaceChildren(headerRowElement);

  const headers = Object.keys(articles[0] || {});
  headerRowElement.replaceChildren(
    ...headers
      .filter((h) => h !== "body")
      .map((header) => {
        const thElement = document.createElement("th");
        thElement.innerText = header;
        return thElement;
      }),
  );
  const tBodyElement = document.createElement("tbody");
  tBodyElement.replaceChildren(...articles.map(createArticleOverviewElement));
  articlesTableElement.replaceChildren(tHeadElement, tBodyElement);

  articleSectionElement.replaceChildren(articlesTableElement);
  return articleSectionElement;
}

const setupNavigationLinks = (link) => {
  const listItemElement = document.createElement("li");

  const linkElement = document.createElement("a");
  linkElement.classList.add("naviagation-link");
  linkElement.setAttribute("data-link", "");
  linkElement.innerText = link;
  linkElement.setAttribute(
    "href",
    `/intro-to-web-dev-final-project/#/${link === "home" ? "" : link}`,
  );

  listItemElement.replaceChildren(linkElement);

  return listItemElement;
};

const setupSharedLayout = () => {
  const headerElement = document.createElement("header");
  headerElement.classList.add("top-header");

  const titleElement = document.createElement("h1");
  titleElement.innerText = "Markdown Blog";

  headerElement.replaceChildren(titleElement);
  const navElement = document.createElement("nav");
  navElement.classList.add("navigation");

  const listElement = document.createElement("ul");
  listElement.classList.add("navigation-list");
  const links = ["home", "articles", "articles/new"];
  listElement.replaceChildren(...links.map(setupNavigationLinks));

  navElement.replaceChildren(listElement);
  return { navElement, headerElement };
};

document.addEventListener("DOMContentLoaded", () => {
  document.body.addEventListener("click", (e) => {
    if (e.target.matches("[data-link]")) {
      e.preventDefault();
      navigateTo(e.target.href);
    }
  });

  window.addEventListener("popstate", router);

  router();
});
