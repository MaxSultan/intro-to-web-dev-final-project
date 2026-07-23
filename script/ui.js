import {
  createArticleState,
  deleteArticleState,
  getArticlesState,
  updateArticleState,
  validateTextLength,
} from "./domain.js";
import { getArticle } from "./service.js";

// #region router
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

const getDynamicPath = async (path) => {
  const updateArticleMatch = path.match(/^#\/articles\/(.+)\/update$/);
  if (updateArticleMatch) {
    const id = updateArticleMatch[1];
    const article = await getArticle(id);
    return article
      ? {
          title: `Update ${article.title}`,
          render: async () => await renderArticleUpdate(article),
        }
      : null;
  }

  const dynamicArticleMatch = path.match(/^#\/articles\/(.+)$/);
  if (!dynamicArticleMatch) {
    return null;
  }

  const id = dynamicArticleMatch[1];
  const article = await getArticle(id);
  return article
    ? {
        title: article.title,
        render: async () => await renderArticleShow(article),
      }
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
// #endregion router

// #region sharedLayout
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

  const brandElement = document.createElement("div");
  brandElement.classList.add("header-brand");

  const logoElement = document.createElement("img");
  logoElement.classList.add("header-logo");
  logoElement.setAttribute("src", "./assets/markdown_blog_logo.svg");
  logoElement.setAttribute("alt", "Markdown blog logo");

  const titleElement = document.createElement("h1");
  titleElement.innerText = "Markdown Blog";

  brandElement.replaceChildren(logoElement, titleElement);
  headerElement.replaceChildren(brandElement);

  const navElement = document.createElement("nav");
  navElement.classList.add("navigation");

  const listElement = document.createElement("ul");
  listElement.classList.add("navigation-list");
  const links = ["home", "articles", "articles/new"];
  listElement.replaceChildren(...links.map(setupNavigationLinks));

  navElement.replaceChildren(listElement);
  return { navElement, headerElement };
};

// #endregion sharedLayout

// #region home
async function renderHome() {
  const { headerElement, navElement } = setupSharedLayout();
  const mainElement = document.createElement("main");

  const titleElement = document.createElement("h2");
  titleElement.innerText = "HOME";

  mainElement.replaceChildren(titleElement);

  return [headerElement, navElement, mainElement];
}
// #endregion home

// #region articlesShow
const createTagsElement = (tag) => {
  const divElement = document.createElement("div");
  divElement.classList.add("tag");
  divElement.innerText = tag;

  return divElement;
};
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

  mainElement.replaceChildren(
    titleElement,
    subtitleElement,
    authorElement,
    ...(article?.tags || []).map(createTagsElement),
    articleBodyElement,
  );

  return [headerElement, navElement, mainElement];
}

// #endregion articlesShow

// #region articlesCreate
const buildArticlesForm = (article) => {
  const formElement = document.createElement("form");
  formElement.classList.add("form");
  const isEditing = Boolean(article?.id);

  const titleLabelElement = document.createElement("label");
  titleLabelElement.innerText = "Title";
  titleLabelElement.setAttribute("for", "title");
  titleLabelElement.classList.add("text-input-label");

  const titleInputElement = document.createElement("input");
  titleInputElement.type = "text";
  titleInputElement.classList.add("text-input");
  titleInputElement.setAttribute("id", "title");
  titleInputElement.setAttribute("name", "title");
  titleInputElement.value = article?.title || "";

  const titleErrorMesageElement = document.createElement("p");
  titleErrorMesageElement.classList.add("error-msg");

  const descriptionLabelElement = document.createElement("label");
  descriptionLabelElement.innerText = "Description";
  descriptionLabelElement.setAttribute("for", "description");
  descriptionLabelElement.classList.add("text-input-label");

  const descriptionInputElement = document.createElement("input");
  descriptionInputElement.type = "text";
  descriptionInputElement.classList.add("text-input");
  descriptionInputElement.setAttribute("id", "description");
  descriptionInputElement.setAttribute("name", "description");
  descriptionInputElement.value = article?.description || "";

  const descriptionErrorMesageElement = document.createElement("p");
  descriptionErrorMesageElement.classList.add("error-msg");

  const authorLabelElement = document.createElement("label");
  authorLabelElement.innerText = "Author";
  authorLabelElement.setAttribute("for", "author");
  authorLabelElement.classList.add("text-input-label");

  const authorInputElement = document.createElement("input");
  authorInputElement.type = "text";
  authorInputElement.classList.add("text-input");
  authorInputElement.setAttribute("id", "author");
  authorInputElement.setAttribute("name", "author");
  authorInputElement.value = article?.author || "";

  const authorErrorMesageElement = document.createElement("p");
  authorErrorMesageElement.classList.add("error-msg");

  const tagsLabelElement = document.createElement("label");
  tagsLabelElement.innerText = "Tags";
  tagsLabelElement.setAttribute("for", "tags");
  tagsLabelElement.classList.add("text-input-label");

  const tagsInputElement = document.createElement("input");
  tagsInputElement.type = "text";
  tagsInputElement.classList.add("text-input");
  tagsInputElement.setAttribute("id", "tags");
  tagsInputElement.setAttribute("name", "tags");
  tagsInputElement.value = (article?.tags || []).join(", ");

  const tagsErrorMesageElement = document.createElement("p");
  tagsErrorMesageElement.classList.add("error-msg");

  const bodyLabelElement = document.createElement("label");
  bodyLabelElement.innerText = "Body";
  bodyLabelElement.setAttribute("for", "body");
  bodyLabelElement.classList.add("text-input-label");

  const bodyInputElement = document.createElement("textarea");
  bodyInputElement.classList.add("text-input");
  bodyInputElement.setAttribute("id", "body");
  bodyInputElement.setAttribute("name", "body");
  bodyInputElement.value = article?.body || "";

  const bodyErrorMesageElement = document.createElement("p");
  bodyErrorMesageElement.classList.add("error-msg");

  const submitFormButtonELement = document.createElement("button");
  submitFormButtonELement.type = "submit";
  submitFormButtonELement.innerText = isEditing ? "Save Changes" : "Submit";
  submitFormButtonELement.classList.add("primary-button");

  const clearFormButtonELement = document.createElement("button");
  clearFormButtonELement.type = "reset";
  clearFormButtonELement.innerText = "Clear";
  clearFormButtonELement.classList.add("secondary-button");

  const validationFields = [
    [titleInputElement, titleErrorMesageElement],
    [descriptionInputElement, descriptionErrorMesageElement],
    [authorInputElement, authorErrorMesageElement],
    [tagsInputElement, tagsErrorMesageElement],
    [bodyInputElement, bodyErrorMesageElement],
  ];

  validationFields.forEach(([input, errorElement]) => {
    input.addEventListener("keyup", (event) => {
      const validationMessage = validateTextLength(event.target.value);
      errorElement.innerText = validationMessage;
    });
  });

  formElement.addEventListener("submit", async (event) => {
    event.preventDefault();

    let hasValidationErrors = false;

    validationFields.forEach(([input, errorElement]) => {
      const validationMessage = validateTextLength(input.value.trim());
      errorElement.innerText = validationMessage;

      if (validationMessage) {
        hasValidationErrors = true;
      }
    });

    if (hasValidationErrors) {
      return;
    }

    const articlePayload = {
      title: titleInputElement.value.trim(),
      description: descriptionInputElement.value.trim(),
      author: authorInputElement.value.trim(),
      tags: tagsInputElement.value
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
      body: bodyInputElement.value.trim(),
    };

    if (isEditing) {
      await updateArticleState({
        ...articlePayload,
        id: article.id,
      });
    } else {
      await createArticleState(articlePayload);
    }

    navigateTo("/intro-to-web-dev-final-project/#/articles");
  });

  formElement.replaceChildren(
    titleLabelElement,
    titleInputElement,
    titleErrorMesageElement,
    descriptionLabelElement,
    descriptionInputElement,
    descriptionErrorMesageElement,
    authorLabelElement,
    authorInputElement,
    authorErrorMesageElement,
    tagsLabelElement,
    tagsInputElement,
    tagsErrorMesageElement,
    bodyLabelElement,
    bodyInputElement,
    bodyErrorMesageElement,
    submitFormButtonELement,
    clearFormButtonELement,
  );
  return formElement;
};

async function renderArticleCreate() {
  const { headerElement, navElement } = setupSharedLayout();
  const mainElement = document.createElement("main");

  const titleElement = document.createElement("h2");
  titleElement.innerText = "CREATE ARTICLE";

  const formElement = buildArticlesForm();
  mainElement.replaceChildren(titleElement, formElement);

  return [headerElement, navElement, mainElement];
}

async function renderArticleUpdate(article) {
  const { headerElement, navElement } = setupSharedLayout();
  const mainElement = document.createElement("main");

  const titleElement = document.createElement("h2");
  titleElement.innerText = "UPDATE ARTICLE";

  const formElement = buildArticlesForm(article);
  mainElement.replaceChildren(titleElement, formElement);

  return [headerElement, navElement, mainElement];
}

// #endregion articlesCreate

// #region articlesIndex
const setupArticles = () => {
  const sectionElement = document.createElement("section");
  sectionElement.classList.add("articles-section");
  sectionElement.setAttribute("id", "articles-section")
  return sectionElement;
};

const createArticleOverviewElement = (article) => {
  const articleTableRowElement = document.createElement("tr");
  articleTableRowElement.classList.add("article-overview");

  const cells = Object.entries(article)
    .filter(([key]) => key !== "body")
    .map(([_, val]) => {
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
    });

  const actionCellElement = document.createElement("td");

  const editLinkElement = document.createElement("a");
  editLinkElement.classList.add("edit-link");
  editLinkElement.setAttribute("data-link", "");
  editLinkElement.setAttribute(
    "href",
    `/intro-to-web-dev-final-project/#/articles/${article.id}/update`,
  );
  editLinkElement.innerText = "Edit";

  const deleteButtonElement = document.createElement("button");
  deleteButtonElement.type = "button";
  deleteButtonElement.classList.add("delete-button");
  deleteButtonElement.innerText = "Delete";
  deleteButtonElement.addEventListener("click", async (event) => {
    event.preventDefault();
    event.stopPropagation();

    await deleteArticleState(article.id);

    const articlesSectionElement = document.getElementById("articles-section");
    const refreshedArticlesSection = await renderArticles();
    articlesSectionElement.replaceChildren(...refreshedArticlesSection.childNodes);
  });
  actionCellElement.replaceChildren(editLinkElement, deleteButtonElement);

  articleTableRowElement.replaceChildren(...cells, actionCellElement);

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
  const headerCells = headers
    .filter((header) => header !== "body")
    .map((header) => {
      const thElement = document.createElement("th");
      thElement.innerText = header;
      return thElement;
    });

  const actionsHeaderElement = document.createElement("th");
  actionsHeaderElement.innerText = "Actions";

  headerRowElement.replaceChildren(...headerCells, actionsHeaderElement);
  const tBodyElement = document.createElement("tbody");
  tBodyElement.replaceChildren(...articles.map(createArticleOverviewElement));
  articlesTableElement.replaceChildren(tHeadElement, tBodyElement);

  articleSectionElement.replaceChildren(articlesTableElement);
  return articleSectionElement;
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
// #endregion articlesIndex

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
