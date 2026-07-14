from pathlib import Path
import re
import shutil

root = Path.cwd()
index_path = root / 'index.html'
text = index_path.read_text(encoding='utf-8')

style_match = re.search(r'<style>(.*?)</style>', text, flags=re.S | re.I)
if style_match:
    css_dir = root / 'assets' / 'css'
    css_dir.mkdir(parents=True, exist_ok=True)
    css_path = css_dir / 'styles.css'
    css_path.write_text(style_match.group(1).strip(), encoding='utf-8')
    text = text.replace(style_match.group(0), '<link rel="stylesheet" href="assets/css/styles.css">')

script_blocks = re.findall(r'<script\b[^>]*>(.*?)</script>', text, flags=re.S | re.I)
inline_scripts = []
for block in script_blocks:
    if 'src=' not in block and 'type="module"' not in block and 'type=\'module\'' not in block:
        inline_scripts.append(block)

js_dir = root / 'assets' / 'js'
js_dir.mkdir(parents=True, exist_ok=True)
js_path = js_dir / 'app.js'
js_path.write_text('\n\n'.join(inline_scripts), encoding='utf-8')

text = re.sub(r'<script\b[^>]*>.*?</script>', '', text, flags=re.S | re.I)
text = text.replace('</body>', '    <script src="assets/js/app.js"></script>\n</body>')

image_dir = root / 'assets' / 'images'
image_dir.mkdir(parents=True, exist_ok=True)
for src_name, dst_name in [
    ('bna logo.jpg', 'logo.jpg'),
    ('bna logo3.png', 'logo3.png'),
    ('bna weyra.png', 'weyra.png'),
    ('bna bethel.jpg', 'bethel.jpg'),
]:
    src_path = root / src_name
    if src_path.exists():
        shutil.copy2(src_path, image_dir / dst_name)

replacements = {
    'href="bna logo.jpg"': 'href="assets/images/logo.jpg"',
    'src="logo.png"': 'src="assets/images/logo3.png"',
    'src="bna logo.jpg"': 'src="assets/images/logo.jpg"',
    'src="bna logo3.png"': 'src="assets/images/logo3.png"',
    'src="bna weyra.png"': 'src="assets/images/weyra.png"',
    'src="bna bethel.jpg"': 'src="assets/images/bethel.jpg"',
}
for old, new in replacements.items():
    text = text.replace(old, new)

index_path.write_text(text, encoding='utf-8')
