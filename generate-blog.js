const fs = require('fs');
const path = require('path');

const templatePath = path.join(__dirname, 'blog/blog-template.html');
const postsDir = '/home/team/shared/blog-posts';
const outputDir = path.join(__dirname, 'blog');

const template = fs.readFileSync(templatePath, 'utf8');

const posts = [
    { file: 'cost-of-piecing-together-freelancers.md', slug: 'cost-of-piecing-together-freelancers' },
    { file: 'how-to-choose-marketing-agency.md', slug: 'how-to-choose-marketing-agency' },
    { file: 'marketing-budgets-breakdown.md', slug: 'marketing-budgets-breakdown' },
    { file: 'seo-vs-ads-vs-content.md', slug: 'seo-vs-ads-vs-content' },
    { file: 'solo-founder-marketing-strategy.md', slug: 'solo-founder-marketing-strategy' }
];

function simpleMarkdownToHtml(md) {
    // Very simple conversion for these specific posts
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

posts.forEach(post => {
    const md = fs.readFileSync(path.join(postsDir, post.file), 'utf8');
    const lines = md.split('\n');
    const title = lines[0].replace('# ', '');
    const bodyMd = lines.slice(1).join('\n');
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
    
    fs.writeFileSync(path.join(outputDir, post.slug + '.html'), html);
    console.log(`Generated ${post.slug}.html`);
});
