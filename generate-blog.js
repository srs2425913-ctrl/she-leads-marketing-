const fs = require('fs');
const path = require('path');

const templatePath = path.join(__dirname, 'blog/blog-template.html');
const postsDir = '/home/team/shared/blog-posts';
const outputDir = path.join(__dirname, 'blog');

const template = fs.readFileSync(templatePath, 'utf8');

const postFiles = fs.readdirSync(postsDir).filter(file => file.endsWith('.md'));

let indexItems = [];

function betterMarkdownToHtml(md) {
    // Basic markdown parsing
    let html = md
        .replace(/^# (.*$)/gm, '<h1>$1</h1>')
        .replace(/^## (.*$)/gm, '<h2>$1</h2>')
        .replace(/^### (.*$)/gm, '<h3>$1</h3>')
        .replace(/^\* (.*$)/gm, '<li>$1</li>')
        // Wrap adjacent <li> in <ul>
        .replace(/(<li>.*<\/li>)/gms, (match) => {
            return '<ul>' + match + '</ul>';
        })
        .replace(/!\[(.*?)\]\((.*?)\)/g, '<img src="$2" alt="$1">')
        .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>');

    // Split into paragraphs but avoid wrapping existing HTML tags
    const paragraphs = html.split('\n\n');
    html = paragraphs.map(p => {
        p = p.trim();
        if (!p) return '';
        if (p.startsWith('<h') || p.startsWith('<ul') || p.startsWith('<li') || p.startsWith('<ol') || p.startsWith('<div')) {
            return p;
        }
        return `<p>${p.replace(/\n/g, '<br>')}</p>`;
    }).join('\n');

    return html;
}

// Map filenames to categories
const categoryMap = {
    '10-signs-you-need-marketing-help': 'Growth Strategy',
    'cost-of-piecing-together-freelancers': 'Growth Strategy',
    'diy-vs-hiring-agency': 'Agency Partnership',
    'founder-to-ceo-shift': 'Leadership',
    'how-to-choose-marketing-agency': 'Agency Partnership',
    'marketing-agency-cost-2026': 'Budgets',
    'marketing-budgets-breakdown': 'Budgets',
    'multi-channel-ecosystem': 'Growth Strategy',
    'roi-of-inclusive-marketing': 'Inclusive Marketing',
    'scaling-without-burnout': 'Leadership',
    'seo-and-brand-voice': 'SEO & Content',
    'seo-vs-ads-vs-content': 'SEO & Content',
    'social-media-management-pricing': 'Social Media',
    'solo-founder-marketing-strategy': 'Solopreneur',
    'what-to-expect-500-retainer': 'Starter Tier'
};

postFiles.forEach(file => {
    const slug = file.replace('.md', '');
    const md = fs.readFileSync(path.join(postsDir, file), 'utf8');
    const lines = md.split('\n');
    const title = lines[0].replace('# ', '');
    const bodyMd = lines.slice(1).join('\n');
    const excerpt = lines.find(l => l.length > 50 && !l.startsWith('#')) || "Expert insights on scaling your brand and leading your industry.";
    const category = categoryMap[slug] || 'Marketing Strategy';
    
    indexItems.push({ title, slug, excerpt: excerpt.substring(0, 150) + '...', category });

    const bodyHtml = betterMarkdownToHtml(bodyMd);
    
    // Replace placeholder checkout links with actual ones if possible, otherwise just point to pricing
    const bodyWithLinks = bodyHtml.replace(/\[Link to .* Tier Checkout\]/g, '<a href="../index.html#pricing" class="btn-link">View Our Plans & Sign Up</a>');

    const publishDate = 'June 8, 2026';

    let html = template
        .replace('{{TITLE}}', title)
        .replace('{{TITLE}}', title) // Twice for <title> and <h1>
        .replace('{{META_DESCRIPTION}}', title + ' — Read more on She Leads Marketing blog.')
        .replace('{{CATEGORY}}', category)
        .replace('{{DATE}}', publishDate)
        .replace('{{CONTENT}}', bodyWithLinks);
    
    fs.writeFileSync(path.join(outputDir, slug + '.html'), html);
    console.log(`Generated ${slug}.html`);
});

// Generate blog/index.html hub
const indexGridHtml = `
    <div class="blog-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 30px; padding: 40px 0;">
        ${indexItems.map(item => `
            <article class="blog-card" style="background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.05); display: flex; flex-direction: column; transition: transform 0.3s ease;">
                <div style="padding: 30px; display: flex; flex-direction: column; flex-grow: 1;">
                    <div style="color: var(--accent); font-weight: 700; font-size: 0.8rem; text-transform: uppercase; margin-bottom: 12px;">${item.category}</div>
                    <h3 style="font-family: 'Playfair Display', serif; font-size: 1.5rem; margin-bottom: 15px; color: var(--primary); line-height: 1.3;">${item.title}</h3>
                    <p style="color: var(--neutral-mid); font-size: 0.95rem; margin-bottom: 20px; flex-grow: 1;">${item.excerpt}</p>
                    <a href="${item.slug}.html" style="color: var(--primary); font-weight: 700; text-decoration: none; display: inline-flex; align-items: center; gap: 8px;">Read Article <i class="fas fa-arrow-right"></i></a>
                </div>
            </article>
        `).join('')}
    </div>
`;

let indexHtml = template
    .replace('{{TITLE}}', 'Our Blog')
    .replace('{{TITLE}}', 'Our Blog')
    .replace('{{META_DESCRIPTION}}', 'Expert advice on scaling your brand, optimizing your budget, and leading your industry.')
    .replace('{{CATEGORY}}', 'Insights & Strategy')
    .replace('{{DATE}}', 'Updated June 2026')
    .replace('{{CONTENT}}', `
        <div style="text-align: center; margin-bottom: 20px;">
            <p class="section-desc">Expert insights on scaling your brand, optimizing your budget, and leading your industry.</p>
        </div>
        ${indexGridHtml}
    `);

fs.writeFileSync(path.join(outputDir, 'index.html'), indexHtml);
console.log('Generated blog/index.html');
