const url = "http://localhost:5143/articles/";
const STORAGE_KEY = "articles";

export const getAllArticles = () => fetch(url, {
    method: "GET",
    headers: {
        "Content-Type": "application/json"
    }
}).then(res => {
    if (res.ok) {
        return res.json();
    }

    throw new Error(res.status);
})

export const getArticle = (id) => fetch(`${url}${id}`, {
    method: "GET",
    headers: {
        "Content-Type": "application/json"
    }
}).then(res => {
    if (res.ok) {
        return res.json();
    }

    throw new Error(res.status);
})

export const createArticle = (blog) => fetch(url, {
    method: "POST",
    body: JSON.stringify(blog),
    headers: {
        "Content-Type": "application/json"
    }
}).then(res => {
    if (res.ok) {
        return res.json();
    }

    throw new Error(res.status);
})

export const updateArticle = (blog) => fetch(`${url}${blog.id}`, {
    method: "PUT",
    body: JSON.stringify(blog),
    headers: {
        "Content-Type": "application/json"
    }
}).then(res => {
    if (res.ok) {
        return res.json();
    }

    throw new Error(res.status);
})

export const deleteArticle = (id) => fetch(`${url}${id}`, {
    method: "DELETE",
    headers: {
        "Content-Type": "application/json"
    }
}).then(res => {
    if (res.ok) {
        return true;
    }

    throw new Error(res.status);
})

export const getSavedArticles = () => JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");


export const saveArticle = (id) => {
    const existingSavedArticles = getSavedArticles();
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...existingSavedArticles, id]))
}