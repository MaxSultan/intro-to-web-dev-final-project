import {
  createArticleState,
  deleteArticleState,
  getArticlesState,
  updateArticleState,
  validateTextLength,
} from "./domain.js";
import {
  favoriteArticle,
  getArticle,
  getFavoritedArticles,
  removeArticleFromFavorites,
} from "./service.js";

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
  "#/articles/create": { title: "Create Article", render: renderArticleCreate },
};

const COMMON_TAGS = [
  "html",
  "css",
  "javascript",
  "web",
  "frontend",
  "backend",
  "api",
  "accessibility",
  "performance",
  "ux",
];

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
  tagsInputElement.setAttribute("placeholder", "drag tags below or type comma-separated tags");
  tagsInputElement.value = (article?.tags || []).join(", ");

  const tagsDndContainerElement = document.createElement("section");
  tagsDndContainerElement.classList.add("tags-dnd");

  const tagsBankContainerElement = document.createElement("div");
  tagsBankContainerElement.classList.add("tags-bank");

  const tagsBankTitleElement = document.createElement("h4");
  tagsBankTitleElement.classList.add("tags-title");
  tagsBankTitleElement.innerText = "Common tags bank";

  const tagsBankListElement = document.createElement("div");
  tagsBankListElement.classList.add("tags-list", "tags-list-bank");

  const tagsDropContainerElement = document.createElement("div");
  tagsDropContainerElement.classList.add("tags-drop");

  const tagsDropTitleElement = document.createElement("h4");
  tagsDropTitleElement.classList.add("tags-title");
  tagsDropTitleElement.innerText = "Selected tags drop area";

  const tagsDropHintElement = document.createElement("p");
  tagsDropHintElement.classList.add("tags-hint");
  tagsDropHintElement.innerText = "Drag tags here to add. Drag tags back to the bank to remove.";

  const tagsDropZoneElement = document.createElement("div");
  tagsDropZoneElement.classList.add("tags-list", "tags-list-drop");

  const initialTagValues = tagsInputElement.value
    .split(",")
    .map((tag) => tag.trim().toLowerCase())
    .filter(Boolean);
  const selectedTags = new Set(initialTagValues);

  const parseTagsInput = () => {
    return tagsInputElement.value
      .split(",")
      .map((tag) => tag.trim().toLowerCase())
      .filter(Boolean);
  };

  const syncTagsInputValue = () => {
    tagsInputElement.value = Array.from(selectedTags).join(", ");
  };

  const createTagChip = (tag, source) => {
    const chipElement = document.createElement("button");
    chipElement.type = "button";
    chipElement.classList.add("tag-chip", source === "selected" ? "tag-chip-selected" : "tag-chip-bank");
    chipElement.draggable = true;
    chipElement.innerText = tag;

    chipElement.addEventListener("dragstart", (event) => {
      event.dataTransfer.effectAllowed = "move";
      event.dataTransfer.setData("text/plain", tag);
      event.dataTransfer.setData("tag-source", source);
      chipElement.classList.add("is-dragging");
    });

    chipElement.addEventListener("dragend", () => {
      chipElement.classList.remove("is-dragging");
    });

    chipElement.addEventListener("click", () => {
      if (source === "bank") {
        selectedTags.add(tag);
      } else {
        selectedTags.delete(tag);
      }

      syncTagsInputValue();
      renderTagLists();
    });

    return chipElement;
  };

  const renderTagLists = () => {
    tagsBankListElement.replaceChildren(
      ...COMMON_TAGS.filter((tag) => !selectedTags.has(tag)).map((tag) =>
        createTagChip(tag, "bank"),
      ),
    );

    const selectedTagItems = Array.from(selectedTags);
    if (selectedTagItems.length === 0) {
      const emptyStateElement = document.createElement("p");
      emptyStateElement.classList.add("tags-empty");
      emptyStateElement.innerText = "Drop tags here";
      tagsDropZoneElement.replaceChildren(emptyStateElement);
      return;
    }

    tagsDropZoneElement.replaceChildren(
      ...selectedTagItems.map((tag) => createTagChip(tag, "selected")),
    );
  };

  const wireDropZone = (element, target) => {
    element.addEventListener("dragover", (event) => {
      event.preventDefault();
      event.dataTransfer.dropEffect = "move";
      element.classList.add("is-drag-over");
    });

    element.addEventListener("dragleave", () => {
      element.classList.remove("is-drag-over");
    });

    element.addEventListener("drop", (event) => {
      event.preventDefault();
      element.classList.remove("is-drag-over");

      const draggedTag = (event.dataTransfer.getData("text/plain") || "")
        .trim()
        .toLowerCase();
      if (!draggedTag) {
        return;
      }

      if (target === "selected") {
        selectedTags.add(draggedTag);
      } else {
        selectedTags.delete(draggedTag);
      }

      syncTagsInputValue();
      renderTagLists();
    });
  };

  wireDropZone(tagsBankListElement, "bank");
  wireDropZone(tagsDropZoneElement, "selected");

  tagsInputElement.addEventListener("change", () => {
    selectedTags.clear();
    parseTagsInput().forEach((tag) => selectedTags.add(tag));
    syncTagsInputValue();
    renderTagLists();
  });

  formElement.addEventListener("reset", () => {
    setTimeout(() => {
      selectedTags.clear();
      parseTagsInput().forEach((tag) => selectedTags.add(tag));
      syncTagsInputValue();
      renderTagLists();
    }, 0);
  });

  renderTagLists();

  tagsBankContainerElement.replaceChildren(tagsBankTitleElement, tagsBankListElement);
  tagsDropContainerElement.replaceChildren(
    tagsDropTitleElement,
    tagsDropHintElement,
    tagsDropZoneElement,
  );
  tagsDndContainerElement.replaceChildren(tagsBankContainerElement, tagsDropContainerElement);

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
    tagsDndContainerElement,
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
  sectionElement.setAttribute("id", "articles-section");
  return sectionElement;
};

const createArticleOverviewElement = (article) => {
  const isFavorite = getFavoritedArticles().includes(article.id);

  const articleTableRowElement = document.createElement("tr");
  articleTableRowElement.classList.add("article-overview");

  const cells = [["", "favorite"], ...Object.entries(article)]
    .filter(([key]) => key !== "body")
    .map(([_, val]) => {
      const tdElement = document.createElement("td");
      tdElement.classList.add("cell");

      const anchorElement = document.createElement("a");
      anchorElement.setAttribute(
        "href",
        `/intro-to-web-dev-final-project/#/articles/${article.id}`,
      );
      anchorElement.innerText =
        val === "favorite" ? (isFavorite ? "✅" : "❌") : val;
      tdElement.replaceChildren(anchorElement);
      return tdElement;
    });

  const actionCellElement = document.createElement("td");
  actionCellElement.classList.add("action-cell");

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
    await deleteArticleState(article.id);

    const articlesSectionElement = document.getElementById("articles-section");
    const refreshedArticlesSection = await renderArticles();
    articlesSectionElement.replaceChildren(
      ...refreshedArticlesSection.childNodes,
    );
  });

  const favoriteButtonElement = document.createElement("button");
  favoriteButtonElement.type = "button";
  favoriteButtonElement.classList.add("favorite-button");
  favoriteButtonElement.innerText = isFavorite ? "Unfavorite" : "Favorite";
  favoriteButtonElement.addEventListener("click", async (event) => {
    isFavorite
      ? removeArticleFromFavorites(article.id)
      : favoriteArticle(article.id);

    const articlesSectionElement = document.getElementById("articles-section");
    const refreshedArticlesSection = await renderArticles();
    articlesSectionElement.replaceChildren(
      ...refreshedArticlesSection.childNodes,
    );
  });

  actionCellElement.replaceChildren(
    editLinkElement,
    deleteButtonElement,
    favoriteButtonElement,
  );

  articleTableRowElement.replaceChildren(...cells, actionCellElement);

  return articleTableRowElement;
};

const useQueryString = (searchKey) => {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  const filter = urlParams.get(searchKey)?.toLowerCase();
  return filter;
};

const createSearchFormElement = () => {
  const formElement = document.createElement("form");

  const singleRowElement = document.createElement("div");
  singleRowElement.classList.add("single-row");

  const searchInputLabelElement = document.createElement("label");
  searchInputLabelElement.innerText = "Search:";
  searchInputLabelElement.setAttribute("for", "filter");

  const searchInputElement = document.createElement("input");
  searchInputElement.type = "text";
  searchInputElement.classList.add("text-input");
  searchInputElement.setAttribute("id", "filter");
  searchInputElement.setAttribute("name", "filter");
  searchInputElement.value = useQueryString("filter") ?? "";

  const buttonElement = document.createElement("button");
  buttonElement.type = "submit";
  buttonElement.innerText = "Search";

  singleRowElement.replaceChildren(
    searchInputLabelElement,
    searchInputElement,
    buttonElement,
  );

  formElement.replaceChildren(singleRowElement);
  return formElement;
};

const createNoResultsElement = () => {
  const noResultsElement = document.createElement("p");
  noResultsElement.innerText = "No results were found";
  noResultsElement.classList.add("no-results-found");
  return noResultsElement;
};

async function renderArticles() {
  const articles = await getArticlesState();
  const articleSectionElement = setupArticles();
  const searchForm = createSearchFormElement();

  const noResultsElement = createNoResultsElement();

  const query = useQueryString("filter");
  const filteredArticles =
    query == null || !query
      ? articles
      : articles.filter(
          (a) =>
            a.description.toLowerCase().includes(query) ||
            a.title.toLowerCase().includes(query),
        );

  const favoriteArticles = getFavoritedArticles();

  const sortedArticles = filteredArticles.sort(
    (a, b) =>
      (favoriteArticles.includes(b.id) ? 1 : 0) -
      (favoriteArticles.includes(a.id) ? 1 : 0),
  );

  const articlesTableElement = document.createElement("table");
  articlesTableElement.classList.add("articles-table");

  const tHeadElement = document.createElement("thead");
  const headerRowElement = document.createElement("tr");
  tHeadElement.replaceChildren(headerRowElement);

  const headers = Object.keys(articles[0] || {});
  const headerCells = ["favorite", ...headers]
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
  tBodyElement.replaceChildren(
    ...sortedArticles.map(createArticleOverviewElement),
  );
  articlesTableElement.replaceChildren(tHeadElement, tBodyElement);

  articleSectionElement.replaceChildren(
    searchForm,
    filteredArticles.length > 0 ? articlesTableElement : noResultsElement,
  );
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
