using Microsoft.AspNetCore.Http.HttpResults;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddCors();

var app = builder.Build();
app.UseCors(options => options.AllowAnyHeader().AllowAnyOrigin().AllowAnyMethod());

var articles = new List<Article>
{
    new Article(
        Id: 1,
        Title: "Test Article",
        Description: "Something to get started",
        Body: """
# Header

## Some sub heading

### some suber heading
""",
        Author: "Test User",
        Tags: new List<string> { "Markdown", "Starter" }
    )
};

int nextId = articles.Max(a => a.Id) + 1;

app.MapGet("/articles", () => Results.Ok(articles));

app.MapGet("/articles/{articlesId}", (int articlesId) =>
{
    var article = articles.FirstOrDefault(a => a.Id == articlesId);
    return article is null ? Results.NotFound() : Results.Ok(article);
});

app.MapPost("/articles", (ArticleCreate articleCreate) =>
{
    var article = new Article(
        Id: nextId++,
        Title: articleCreate.Title,
        Description: articleCreate.Description,
        Body: articleCreate.Body,
        Author: articleCreate.Author,
        Tags: articleCreate.Tags ?? new List<string>()
    );

    articles.Add(article);
    return Results.Created($"/articles/{article.Id}", article);
});

app.MapPut("/articles/{articlesId}", (int articlesId, ArticleCreate articleUpdate) =>
{
    var existingArticle = articles.FirstOrDefault(a => a.Id == articlesId);
    if (existingArticle is null)
    {
        return Results.NotFound();
    }

    var updatedArticle = existingArticle with
    {
        Title = articleUpdate.Title,
        Description = articleUpdate.Description,
        Body = articleUpdate.Body,
        Author = articleUpdate.Author,
        Tags = articleUpdate.Tags ?? new List<string>()
    };

    var index = articles.IndexOf(existingArticle);
    articles[index] = updatedArticle;
    return Results.Ok(updatedArticle);
});

app.MapDelete("/articles/{articlesId}", (int articlesId) =>
{
    var article = articles.FirstOrDefault(a => a.Id == articlesId);
    if (article is null)
    {
        return Results.NotFound();
    }

    articles.Remove(article);
    return Results.NoContent();
});

app.Run();

public record Article(int Id, string Title, string Description, string Body, string Author, List<string> Tags);
public record ArticleCreate(string Title, string Description, string Body, string Author, List<string>? Tags);
