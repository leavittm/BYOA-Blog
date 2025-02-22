# Simple Static Blog

A lightweight blog built with HTML, CSS, JavaScript, and Node.js that converts markdown content into static blog posts.

## Features
- Landing page with list of blog posts
- Markdown to HTML conversion for blog posts
- Clean, minimal blog post template
- About page
- FAQ page
- Simple and maintainable codebase

## Project Structure

### Templates Folder
- Contains templates for the home page, additional pages, and posts
- **layouts/** - Base templates for home page, additional pages, and posts
    -home.html is the main page
- **partials/** - Reusable HTML snippets (header, footer)
- **posts/** - Markdown template for blog posts

### Pages Folder
Contains HTML files for additional pages (main content only, without header/footer)

### Posts Folder
Contains markdown files for blog posts

### Public Folder
Contains static files generated by build.js:
- Homepage (custom template)
- Auxiliary pages (main content + header/footer)
- Converted blog posts (markdown → HTML)