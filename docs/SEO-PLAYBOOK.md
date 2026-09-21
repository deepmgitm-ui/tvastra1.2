# Tvastra Fit SEO Playbook

Updated: 2026-09-21

## What this theme now handles

- Public storefront pages explicitly output `index,follow`; utility pages such as search, cart, password, wishlist, and the account page remain `noindex`.
- Canonical URLs are emitted from Shopify's `canonical_url`.
- Open Graph and Twitter image metadata fall back to the current page image, product featured image, or store logo.
- Organization and WebSite structured data are present, and product/FAQ structured data is present on product pages.
- Product image alt text has a meaningful fallback when Shopify media alt text is empty.
- Secondary product images now use the product title/store-name fallback instead of an empty alt value.
- Homepage hero imagery is prioritized with eager loading and high fetch priority.
- The theme stylesheet preload uses Shopify's Liquid `stylesheet_tag: preload: true` pattern.
- Product collection links use Shopify's real `collection.url` rather than constructing handles from collection titles.
- The Instagram link in the homepage config uses HTTPS.
- A custom `robots.txt.liquid` preserves Shopify's default crawler rules and sitemap directive.
- The homepage has one semantic H1 in the hero section; the logo fallback is no longer an H1.

## Shopify-managed items

Shopify automatically generates `/sitemap.xml`. Do not create a static sitemap file in the theme. Submit `sitemap.xml` to Google Search Console after the domain is verified.

Shopify also manages TLS/HTTPS at the domain/store level. Theme code can avoid insecure hard-coded storefront links, but the primary domain and redirects must be confirmed in Shopify Admin.

## URL slug policy

Use `product.url`, `collection.url`, `routes.*`, and Shopify object URLs instead of manually constructing handles where possible.

Do not rename existing product or collection handles without a redirect plan. When a real handle must change, create the new handle in Shopify and preserve a 301 redirect from the old URL.

## Internal linking strategy

Keep the main navigation linking to the primary collections. Every product should be reachable from at least one crawlable collection or category page.

For product templates, prefer:
1. Primary collection links using `collection.url`.
2. Related/recommended product sections that link directly to product URLs.
3. Descriptive anchor text rather than generic labels such as “click here”.

Avoid creating large blocks of repetitive keyword links.

## Backlink strategy

Focus on legitimate, relevant links earned from real sites and creators rather than automated link schemes.

### 1. Product seeding + creator reviews
Build a small outreach list of fitness creators, runners, gym coaches, yoga instructors, and active-lifestyle creators in India. Offer product samples for honest editorial/review coverage. Ask for a normal brand/product link only when the publisher independently chooses to include one.

### 2. Fitness/editorial outreach
Pitch original angles such as:
- How Indian activewear fits real training and everyday movement.
- Fabric/fit education for gym and athleisure shoppers.
- Beginner activewear guides.
- Seasonal training gear checklists.

Target sites that already publish fitness, fashion, sport, or lifestyle content.

### 3. Digital PR
Create newsworthy assets that can be cited:
- Original survey or customer research.
- Activewear sizing/fit guide with aggregated data.
- India-focused fitness or movement report.
- Useful calculators or downloadable training/wardrobe resources.

Distribute through relevant PR and editorial channels; do not mass-submit to low-quality directories.

### 4. Partnerships
Partner with gyms, trainers, fitness communities, sports clubs, college fitness communities, and wellness events. Co-created pages, partner profiles, event pages, or resource pages can naturally earn relevant links.

### 5. Unlinked brand mentions
Find legitimate mentions of Tvastra Fit that do not link to the site and ask the publisher whether they can add the appropriate homepage or product/collection link.

### 6. Broken-link replacement
Find broken outbound links on relevant fitness/fashion resource pages where a Tvastra Fit resource is a genuine replacement. Suggest the replacement only when the content actually matches.

### 7. What to avoid
Do not buy bulk backlinks, use private blog networks, spam comments/forums, automated directory blasts, or create large numbers of near-identical guest posts solely for links.

## Search Console checklist

1. Verify `tvastrafit.com` in Google Search Console, preferably as a Domain property.
2. Submit `https://tvastrafit.com/sitemap.xml`.
3. Inspect the homepage, key collections, and representative products.
4. Check Page Indexing for `noindex`, blocked-by-robots, canonical, and duplicate-URL issues.
5. Check Core Web Vitals and compare mobile vs desktop.
6. After deployment, request indexing for the homepage and important pages that were previously missing.

## Deployment checklist

- Publish the SEO branch through a Shopify theme preview first.
- Test homepage, collection, product, blog/article, page, cart, search, wishlist, and password templates.
- Confirm the final live HTML has exactly one H1 on each intended indexable page.
- Validate Product/Organization/WebSite/Breadcrumb structured data.
- Validate Open Graph previews.
- Re-check mobile layout and Core Web Vitals after apps/scripts finish loading.
