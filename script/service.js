const url = "http://localhost:5143/"

export const createBlogPost = (blog) => fetch(url, {
    method: "POST",
    body: JSON.stringify(blog),
    headers: {
        "Content-Type": "application/json"
    }
})