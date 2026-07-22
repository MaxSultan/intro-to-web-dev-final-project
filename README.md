# Final Project

What: Build a blog from markdown
Why: 
Building a blog allows you to share content with others, markdown blogs can offer rich experiences where others can expereince and learn on a deeper level. I am hoping to use the blog to market a fantasy wrestling game I have built. you can view it [here](www.fantasy-wrestling.org). I plan to publish articles on rankings, projected fantasy points, etc throughout the year. 

If I can build my audience, I can pay for a trip to go to the NCAA wrestling tournament. Along the way I hope to learn about the following:
- theming
- metadata and SEO
- dynamic routing

progressively add support for 
- how to highlight syntax in a markdown editor
- how to show a preview of the content as you are editing it
- tables
- code blocks
- basic title and tag search

I could also use the blog for code documentation, and recording a daily journal of daily learnings from programming. Being able to review information will allow me to deeper encode it into my brain. 

## Week 1 (April 6)

- [X] build contract between FE and BE
- create c# API - functional req
- [X] create backend API routes
    - [X] GET /articles
    - [X] GET /articles/:id
    - [X] POST /articles
    - [X] PUT /articles/:id
    - [X] DELETE /articles/:id

- [X] model articles data
```ts
type articles = {
    title: string;
    description: string;
    body: string;
    author: string;
    tags: string[];
}
```

- [X] add design tokens for color, text, spacing, etc
- [X] style basic elements (button, table, inputs)

## Week 2 (April 13)
- [X] add service layer (local storage, api routes) - functional req
- [X] add domain layer
- [X] add shared layout (naviagtion links) - tecnical req and functional req
- [X] create FE articles index page - table (technical req)
- [ ] create add page for articles (multiple pages -> functional req)
- [ ] create update page
- [ ] create delete button on articles index
- [X] create basic view page for articles (just raw markdown)
- [X] add dynamic routing through a hash router


## Week 3 (April 20)
- [ ] add logo to shared layout - technical req (img)
- [ ] add searching and filtering form to articles index page (query string, form) - technical req
- [ ] add markdown to HTML transposition
- [ ] add drag and drop for tags to create and update page - (ul elements: tecnical req) functional req
- [ ] create navigation


## Week 4 (April 27 - Last day of class and due date for final project)
- [ ] save favorite articles in local storage to persist on refresh - technical req
- [ ] add css transitions
- [ ] add button haver effects
- [ ] add link hover effect
- [ ] add table row hover effect


# Run server

cd ./api
dotnet watch

