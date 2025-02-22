const fs = require('fs');
const path = require('path');
const marked = require('marked'); // You'll need to npm install marked
const matter = require('gray-matter'); // You'll need to npm install gray-matter

// Create a package.json first and install dependencies
const postsDirectory = path.join(__dirname, '../posts');
const outputDirectory = path.join(__dirname, '../public/posts');
const templatePath = path.join(__dirname, '../templates/layouts/post.html');

// Add new constants for source and output directories
const pagesDirectory = path.join(__dirname, '../pages');
const publicDirectory = path.join(__dirname, '../public');

// Create output directory if it doesn't exist
if (!fs.existsSync(outputDirectory)) {
    fs.mkdirSync(outputDirectory, { recursive: true });
}

function loadPartial(name) {
    return fs.readFileSync(path.join(__dirname, `../templates/partials/${name}.html`), 'utf-8');
}

function buildPage(template, data) {
    const header = loadPartial('header');
    const footer = loadPartial('footer');
    
    return template
        .replace('{{header}}', header)
        .replace('{{footer}}', footer)
        .replace('{{title}}', data.title || 'My Blog')
        .replace('{{head}}', data.head || '')
        .replace('{{content}}', data.content)
        .replace('{{scripts}}', data.scripts || '');
}

function convertMarkdownToHtml() {
    // Read post template
    const template = fs.readFileSync(templatePath, 'utf-8');

    // Read all markdown files
    const files = fs.readdirSync(postsDirectory);
    const posts = [];

    files.forEach(file => {
        if (path.extname(file) === '.md') {
            // Skip any files that start with '_' or '.' (common convention for templates/hidden files)
            if (file.startsWith('_') || file.startsWith('.')) {
                return;
            }
            
            const filePath = path.join(postsDirectory, file);
            const fileContent = fs.readFileSync(filePath, 'utf-8');
            
            // Parse front matter
            const { data, content } = matter(fileContent);
            
            // Convert markdown to HTML
            const htmlContent = marked.parse(content);
            
            // Replace template placeholders
            let postHtml = template
                .replaceAll("{{title}}", data.title)
                .replaceAll("{{date}}", data.date)
                .replaceAll("{{content}}", htmlContent);
            
            // Save HTML file
            const htmlFileName = path.basename(file, '.md') + '.html';
            fs.writeFileSync(path.join(outputDirectory, htmlFileName), postHtml);
            
            // Add to posts list
            posts.push({
                title: data.title,
                date: data.date,
                description: data.description,
                url: `/posts/${htmlFileName}`
            });
        }
    });

    // Generate posts list for index page
    return posts;
}

function ensureDirectoryExists(directory) {
    if (!fs.existsSync(directory)) {
        fs.mkdirSync(directory, { recursive: true });
    }
}

function buildSite() {
    // Ensure output directories exist
    ensureDirectoryExists(publicDirectory);
    ensureDirectoryExists(path.join(publicDirectory, 'posts'));

    // Build posts
    const posts = convertMarkdownToHtml();

    // Build index page
    const indexTemplate = fs.readFileSync(path.join(__dirname, '../templates/layouts/home.html'), 'utf-8');
    const indexHtml = buildPage(indexTemplate, {
        title: 'My Blog',
        content: generatePostsList(posts),
        scripts: '<script src="/js/main.js"></script>'
    });
    fs.writeFileSync(path.join(publicDirectory, 'index.html'), indexHtml);

    // Build static pages using base template
    const baseTemplate = fs.readFileSync(path.join(__dirname, '../templates/layouts/base.html'), 'utf-8');
    
    // Read content from pages directory
    const pages = fs.readdirSync(path.join(__dirname, '../pages'));
    
    pages.forEach(page => {
        if (path.extname(page) === '.html') {
            const content = fs.readFileSync(path.join(__dirname, '../pages', page), 'utf-8');
            const pageName = path.basename(page, '.html');
            const pageHtml = buildPage(baseTemplate, {
                title: `${pageName.charAt(0).toUpperCase() + pageName.slice(1)} - My Blog`,
                content: extractMainContent(content),
                scripts: '' // Add any page-specific scripts here if needed
            });
            // Write directly to public folder
            fs.writeFileSync(path.join(publicDirectory, page), pageHtml);
        }
    });
}

function extractMainContent(html) {
    // Simple regex to extract content between <main> tags
    const mainMatch = html.match(/<main>([\s\S]*)<\/main>/);
    return mainMatch ? mainMatch[1].trim() : html;
}

function generatePostsList(posts) {
    return `
        <h1>Welcome to My Blog</h1>
        <div id="posts-list">
            ${posts.map(post => `
                <div class="post-preview">
                    <h2><a href="${post.url}">${post.title}</a></h2>
                    <time>${post.date}</time>
                    <p>${post.description}</p>
                </div>
            `).join('')}
        </div>
    `;
}

// Run the build
buildSite();
console.log('Build completed successfully!'); 