import { getArticlesState } from "./domain.js";
import { getArticle } from "./service.js";

const NOT_FOUND_ROUTE = { title: "404", render: async () => await "<h1>404 - Not Found</h1>" }
const routes = {
    "/": { title: "home", render: renderHome },
    "#/": { title: "home", render: renderHome },
    "#/articles": {title: "articles", render: renderArticlesIndex },
    "#/articles/new": { title: "Create Article", render: renderArticleCreate},
}

async function renderHome(){
    const {headerElement, navElement} = setupSharedLayout();
    return `${headerElement.outerHTML} ${navElement.outerHTML}<h1>HOME</h1>`
}

async function renderArticlesIndex(){
    const {headerElement, navElement} = setupSharedLayout();
    const articleSectionElement = await renderArticles();

    console.log(articleSectionElement)
    
    return `${headerElement.outerHTML} ${navElement.outerHTML}<main><h1>ARTICLES INDEX</h1>${articleSectionElement.outerHTML}</main>`
    
};

async function renderArticleShow(){
    const {headerElement, navElement} = setupSharedLayout();
    return `${headerElement.outerHTML} ${navElement.outerHTML}<h1>ARTICLE</h1>`
};

async function renderArticleCreate(){
    const {headerElement, navElement} = setupSharedLayout();
    return `${headerElement.outerHTML} ${navElement.outerHTML}<h1>CREATE ARTICLE</h1>`
}

const getDynamicPath = async (path) => {
  const dynamicArticleMatch = path.match(/^#\/articles\/(.+)$/);
  if (!dynamicArticleMatch) {
    return null;
  }

  const id = dynamicArticleMatch[1];
  const article = await getArticle(id);
  return article ? { title: article.title, render: async () => await renderArticleShow() } : null;
};

const router = async () => {
  const path = window.location.hash || "#/";

  const routePromise = routes[path]
    ? Promise.resolve(routes[path])
    : getDynamicPath(path).then((dynamicRoute) =>
        dynamicRoute || NOT_FOUND_ROUTE,
      ).catch(() => NOT_FOUND_ROUTE);

  const route = await routePromise;
  document.title = route.title;
  document.getElementById("app").innerHTML = await route.render();
};

const navigateTo = (url) => {
  window.history.pushState(null, null, url);
  router();
};

const setupArticles = () => {
    const sectionElement = document.createElement("section");
    sectionElement.classList.add(
        "articles-section"
    )
   return sectionElement;
}

const createArticleOverviewElement = (article) => {
    const articleTableRowElement = document.createElement("tr");
    articleTableRowElement.classList.add("article-overview");
    delete article.body;
    articleTableRowElement.replaceChildren(...Object.values(article).map(val => {
        const tdElement = document.createElement("th");
        tdElement.innerText = val;
        return tdElement;
    }));

    return articleTableRowElement;
}

async function renderArticles(){
    const articles = await getArticlesState();
    const articleSectionElement = setupArticles();
    const articlesTableElement = document.createElement("table");
    articlesTableElement.classList.add("articles-table");

    const tHeadElement = document.createElement("thead");
    const headerRowElement = document.createElement("tr");
    tHeadElement.replaceChildren(headerRowElement);

    const headers = Object.keys(articles[0] || {});
    headerRowElement.replaceChildren(...headers.filter(h => h !== "body").map((header) => {
        const thElement = document.createElement("th");
        thElement.innerText = header;
        return thElement;
    }))
    const tBodyElement = document.createElement("tbody");
    tBodyElement.replaceChildren(...articles.map(createArticleOverviewElement))
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
    linkElement.setAttribute("href", `/intro-to-web-dev-final-project/#/${link === "home" ? "" : link}`);

    listItemElement.replaceChildren(linkElement)

    return listItemElement;
}

const setupSharedLayout = () => {
    const headerElement = document.createElement("header")
    headerElement.classList.add("top-header");

    const titleElement = document.createElement("h1");
    titleElement.innerText = "Markdown Blog";

    headerElement.replaceChildren(titleElement);
    const navElement = document.createElement("nav");
    navElement.classList.add("navigation");

    const listElement = document.createElement("ul");
    listElement.classList.add("navigation-list")
    const links = ["home", "articles", "articles/new"];
    listElement.replaceChildren(...links.map(setupNavigationLinks))

    navElement.replaceChildren(listElement);
    return {navElement, headerElement};
}


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