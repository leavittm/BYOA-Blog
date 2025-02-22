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

// Add after existing constants
const defaultPostImage = '/images/posts/default-post.jpg';

// Create output directory if it doesn't exist
if (!fs.existsSync(outputDirectory)) {
    fs.mkdirSync(outputDirectory, { recursive: true });
}

function loadPartial(name, data = {}) {
    let partial = fs.readFileSync(path.join(__dirname, `../templates/partials/${name}.html`), 'utf-8');
    
    // Replace posts_list placeholder if it exists and data contains posts
    if (data.posts && partial.includes('{{posts_list}}')) {
        const postsListHtml = data.posts
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .map(post => `<li><a href="${post.url}">${post.title}</a></li>`)
            .join('');
        partial = partial.replace('{{posts_list}}', postsListHtml);
    }
    
    // Add subscribe partial handling
    if (name === 'subscribe') {
        const subscribe = fs.readFileSync(path.join(__dirname, '../templates/partials/subscribe.html'), 'utf-8');
        return subscribe;
    }
    
    return partial;
}

function buildPage(template, data) {
    const header = loadPartial('header', { posts: data.allPosts });
    const footer = loadPartial('footer');
    const subscribe = loadPartial('subscribe');
    
    let html = template
        .replaceAll('{{header}}', header)
        .replaceAll('{{footer}}', footer)
        .replaceAll('{{title}}', data.title || 'My Blog')
        .replaceAll('{{head}}', data.head || '')
        .replaceAll('{{content}}', data.content)
        .replaceAll('{{posts}}', data.posts || '')
        .replaceAll('{{scripts}}', data.scripts || '')
        .replaceAll('{{subscribe}}', subscribe);

    // Handle post-specific variables
    if (data.date) {
        html = html.replace('{{date}}', data.date);
    }
    if (data.image) {
        html = html.replace('{{image}}', data.image);
    }

    return html;
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

    // First, gather all posts data without building the files
    const posts = [];
    const files = fs.readdirSync(postsDirectory);
    
    files.forEach(file => {
        if (path.extname(file) === '.md' && !file.startsWith('_') && !file.startsWith('.')) {
            const filePath = path.join(postsDirectory, file);
            const fileContent = fs.readFileSync(filePath, 'utf-8');
            const { data, content } = matter(fileContent);
            const slug = path.basename(file, '.md');
            const imagePath = `/images/posts/${slug}.jpg`;
            const imageExists = fs.existsSync(path.join(__dirname, '..', imagePath));
            const finalImagePath = imageExists ? imagePath : defaultPostImage;
            
            posts.push({
                title: data.title,
                date: data.date,
                description: data.description,
                content: content,
                url: `/posts/${slug}.html`,
                image: finalImagePath,
                slug: slug
            });
        }
    });

    // Now build all posts with the complete posts list
    const postTemplate = fs.readFileSync(templatePath, 'utf-8');
    posts.forEach(post => {
        const htmlContent = marked.parse(post.content);
        const postHtml = buildPage(postTemplate, {
            title: post.title,
            content: htmlContent,
            date: formatDate(post.date),
            image: post.image,
            allPosts: posts,
            head: '',
            scripts: ''
        });
        
        fs.writeFileSync(path.join(outputDirectory, post.slug + '.html'), postHtml);
    });

    // Build index page
    const indexTemplate = fs.readFileSync(path.join(__dirname, '../templates/layouts/home.html'), 'utf-8');
    const indexHtml = buildPage(indexTemplate, {
        title: 'My Blog',
        content: generatePostsList(posts),
        posts: generatePostsList(posts),
        allPosts: posts,
        scripts: '<script src="/js/main.js"></script>'
    });
    fs.writeFileSync(path.join(publicDirectory, 'index.html'), indexHtml);

    // Build static pages
    const baseTemplate = fs.readFileSync(path.join(__dirname, '../templates/layouts/base.html'), 'utf-8');
    const pages = fs.readdirSync(pagesDirectory);
    
    pages.forEach(page => {
        if (path.extname(page) === '.html') {
            const content = fs.readFileSync(path.join(pagesDirectory, page), 'utf-8');
            const pageName = path.basename(page, '.html');
            const pageHtml = buildPage(baseTemplate, {
                title: `${pageName.charAt(0).toUpperCase() + pageName.slice(1)} - My Blog`,
                content: extractMainContent(content),
                allPosts: posts,
                scripts: ''
            });
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
    return posts.map(post => `
        <a href="${post.url}" class="post-card">
            <img src="${post.image}" alt="${post.title}">
            <div class="post-card-content">
                <h3>${post.title}</h3>
                <time>${formatDate(post.date)}</time>
                <p>${post.description}</p>
            </div>
        </a>
    `).join('');
}

function formatDate(dateStr) {
    try {
        const date = new Date(dateStr);
        if (isNaN(date)) {
            // If date parsing fails, return original string
            return dateStr;
        }
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return `${months[date.getMonth()]} ${date.getDate()} ${date.getFullYear()}`;
    } catch (e) {
        console.error('Date parsing error:', e);
        return dateStr;
    }
}

// Run the build
buildSite();
console.log('Build completed successfully!'); 