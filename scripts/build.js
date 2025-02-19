const fs = require('fs');
const path = require('path');
const marked = require('marked'); // You'll need to npm install marked
const matter = require('gray-matter'); // You'll need to npm install gray-matter

// Create a package.json first and install dependencies
const postsDirectory = path.join(__dirname, '../posts');
const outputDirectory = path.join(__dirname, '../public/posts');
const templatePath = path.join(__dirname, '../templates/post.html');

// Create output directory if it doesn't exist
if (!fs.existsSync(outputDirectory)) {
    fs.mkdirSync(outputDirectory, { recursive: true });
}

function convertMarkdownToHtml() {
    // Read post template
    const template = fs.readFileSync(templatePath, 'utf-8');

    // Read all markdown files
    const files = fs.readdirSync(postsDirectory);
    const posts = [];

    files.forEach(file => {
        if (path.extname(file) === '.md') {
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

// Run the build
const posts = convertMarkdownToHtml();
console.log('Build completed successfully!'); 