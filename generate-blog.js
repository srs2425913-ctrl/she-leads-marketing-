const fs = require('fs');
const path = require('path');

const templatePath = path.join(__dirname, 'blog/blog-template.html');
const postsDir = '/home/team/shared/blog-posts';
const outputDir = path.join(__dirname, 'blog');

const template = fs.readFileSync(templatePath, 'utf8');

const postFiles = fs.readdirSync(postsDir).filter(file => file.endsWith('.md'));

let indexItems = [];

function simpleMarkdownToHtml(md) {
    return md
        .replace(/^# (.*$)/gm, '<h1>$1</h1>')
        .replace(/^## (.*$)/gm, '<h2>$1</h2>')
        .replace(/^### (.*$)/gm, '<h3>$1</h3>')
        .replace(/^\* (.*$)/gm, '<ul><li>$1</li></ul>').replace(/<\/ul>\n<ul>/g, '')
        .replace(/!\[(.*?)\]\((.*?)\)/g, '<img src="$2" alt="$1">')
        .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .split('\n\n')
        .map(p => p.trim().startsWith('<h') || p.trim().startsWith('<ul') ? p : `<p>${p.replace(/\n/g, '<br>')}</p>`)
        .join('\n');
}

postFiles.forEach(file => {
    const slug = file.replace('.md', '');
    const md = fs.readFileSync(path.join(postsDir, file), 'utf8');
    const lines = md.split('\n');
    const title = lines[0].replace('# ', '');
    const bodyMd = lines.slice(1).join('\n');
    const excerpt = lines.find(l => l.length > 50 && !l.startsWith('#')) || "Read more about our marketing strategies.";
    
    indexItems.push({ title, slug, excerpt: excerpt.substring(0, 150) + '...' });

    const bodyHtml = simpleMarkdownToHtml(bodyMd);
    
    const ctaHtml = `
        <div class="blog-cta" style="background: var(--warm-white); padding: 40px; border-radius: 16px; margin-top: 60px; text-align: center; border: 1px solid rgba(15, 76, 92, 0.1);">
            <h3>Ready to scale your marketing?</h3>
            <p>Our <strong>Accelerate Tier</strong> is designed for teams ready to grow. Get SEO, content, and ads managed by experts.</p>
            <a href="../index.html#pricing" class="btn btn-primary">View Pricing & Get Started</a>
        </div>
    `;

    let html = template
        .replace('{{TITLE}}', title)
        .replace('{{METADESC}}', title + ' — Read more on She Leads Marketing blog.')
        .replace('{{BODY}}', bodyHtml + ctaHtml);
    
    fs.writeFileSync(path.join(outputDir, slug + '.html'), html);
    console.log(`Generated ${slug}.html`);
});

// Generate blog/index.html
const indexGridHtml = `
    <div class="blog-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 30px; margin-top: 40px;">
        ${indexItems.map(item => `
            <article class="blog-card" style="background: white; padding: 30px; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.05); display: flex; flex-direction: column;">
                <div class="blog-card-meta" style="color: var(--gold); font-weight: 700; font-size: 0.8rem; text-transform: uppercase; margin-bottom: 15px;">Strategy</div>
                <h3 style="font-family: 'Playfair Display', serif; font-size: 1.5rem; margin-bottom: 15px; color: var(--deep-teal);">${item.title}</h3>
                <p style="color: var(--text-mid); font-size: 0.95rem; margin-bottom: 20px; flex-grow: 1;">${item.excerpt}</p>
                <a href="${item.slug}.html" class="blog-card-link" style="color: var(--primary); font-weight: 600; text-decoration: none;">Read Article <i class="fas fa-arrow-right"></i></a>
            </article>
        `).join('')}
    </div>
`;

let indexHtml = template
    .replace('{{TITLE}}', 'Insights & Strategy Blog')
    .replace('{{METADESC}}', 'Expert advice on scaling your brand, optimizing your budget, and leading your industry.')
    .replace('{{BODY}}', `
        <div style="text-align: center; margin-bottom: 60px;">
            <p class="section-desc">Our latest thoughts on growth, branding, and the future of marketing.</p>
        </div>
        ${indexGridHtml}
    `);

// Adjust paths for index.html (template assumes it's inside blog/ but index.html is also in blog/)
// Actually the template uses ../css/styles.css and ../index.html so it's correct for files inside blog/
fs.writeFileSync(path.join(outputDir, 'index.html'), indexHtml);
console.log('Generated blog/index.html');
