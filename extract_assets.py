from pathlib import Path
import re

root = Path(__file__).resolve().parent
html_path = root / 'index.html'
css_path = root / 'assets' / 'css' / 'styles.css'
js_path = root / 'assets' / 'js' / 'app.js'

html = html_path.read_text(encoding='utf-8')

# Extract and remove style blocks.
style_blocks = []
for match in re.finditer(r'<style[^>]*>(.*?)</style>', html, flags=re.S | re.I):
    style_blocks.append(match.group(1))

if style_blocks:
    css_path.parent.mkdir(parents=True, exist_ok=True)
    css_path.write_text('\n\n'.join(style_blocks), encoding='utf-8')
    html = re.sub(r'<style[^>]*>.*?</style>', '', html, flags=re.S | re.I)

# Extract and remove script blocks that are not the Tailwind config block.
script_blocks = []
script_pattern = re.compile(r'<script\b[^>]*>(.*?)</script>', re.S | re.I)

remaining_parts = []
last_end = 0
for match in script_pattern.finditer(html):
    script_content = match.group(1)
    if 'tailwind.config' in script_content:
        remaining_parts.append(html[last_end:match.start()])
        remaining_parts.append(match.group(0))
        last_end = match.end()
    else:
        script_blocks.append(script_content)

remaining_parts.append(html[last_end:])
html = ''.join(remaining_parts)

# Remove the old inline script blocks and insert one external script tag.
html = re.sub(r'\n\s*<script type="module" src="assets/js/app.js"></script>\n?', '\n    <script type="module" src="assets/js/app.js"></script>\n', html)
html = html.replace('</body>', '    <script type="module" src="assets/js/app.js"></script>\n</body>')

if script_blocks:
    js_path.parent.mkdir(parents=True, exist_ok=True)
    js_path.write_text('// Extracted from index.html\n' + '\n\n'.join(script_blocks), encoding='utf-8')

# Insert stylesheet link in the head if it is not present.
if '<link rel="stylesheet" href="assets/css/styles.css">' not in html:
    html = html.replace('</head>', '    <link rel="stylesheet" href="assets/css/styles.css">\n</head>', 1)

html = html.replace('href="bna logo.jpg"', 'href="assets/images/bna logo.jpg"')
html = html.replace('src="logo.png"', 'src="assets/images/bna logo3.png"')
html = html.replace('src="bna logo3.png"', 'src="assets/images/bna logo3.png"')
html = html.replace('src="bna logo.jpg"', 'src="assets/images/bna logo.jpg"')

html_path.write_text(html, encoding='utf-8')
print('Extraction complete.')
