"""
Procesa las imágenes de la mascota Águila Viajera:
  - Elimina el fondo blanco/claro (flood-fill desde esquinas)
  - Divide la imagen con dos poses en dos PNGs separados
  - Guarda 3 PNGs con canal alfa (transparencia)
"""

from PIL import Image
from collections import deque

SRC_DIR = "/Users/andres/.cursor/projects/Users-andres-dev-aguila-viajera-aguila-viajera/assets/"
OUT_DIR = "/Users/andres/dev/aguila-viajera/aguila-viajera/public/images/ui/"

IMG1 = SRC_DIR + "ChatGPT_Image_12_jul_2026__01_54_20_a.m.-267c5f01-9c45-46d7-9ddc-f58595e9ff2b.png"
IMG2 = SRC_DIR + "ChatGPT_Image_12_jul_2026__01_54_27_a.m.-66960a83-c95e-4bf5-817c-7b58509b38a2.png"


def remove_bg(img: Image.Image, tolerance: int = 30) -> Image.Image:
    """Elimina el fondo claro con BFS desde las 4 esquinas."""
    img = img.convert("RGBA")
    w, h = img.size
    pixels = img.load()

    # Color de fondo muestreado desde la esquina superior izquierda
    bg = pixels[0, 0][:3]

    def similar(px):
        return all(abs(int(px[i]) - int(bg[i])) <= tolerance for i in range(3))

    visited = [[False] * h for _ in range(w)]
    queue = deque()

    for sx, sy in [(0, 0), (w - 1, 0), (0, h - 1), (w - 1, h - 1)]:
        if not visited[sx][sy]:
            queue.append((sx, sy))
            visited[sx][sy] = True

    while queue:
        x, y = queue.popleft()
        if similar(pixels[x, y]):
            pixels[x, y] = (255, 255, 255, 0)  # transparente
            for nx, ny in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
                if 0 <= nx < w and 0 <= ny < h and not visited[nx][ny]:
                    visited[nx][ny] = True
                    queue.append((nx, ny))

    return img


def autocrop(img: Image.Image, padding: int = 10) -> Image.Image:
    """Recorta el espacio transparente sobrante y agrega un margen."""
    bbox = img.getbbox()
    if bbox is None:
        return img
    x0, y0, x1, y1 = bbox
    w, h = img.size
    x0 = max(0, x0 - padding)
    y0 = max(0, y0 - padding)
    x1 = min(w, x1 + padding)
    y1 = min(h, y1 + padding)
    return img.crop((x0, y0, x1, y1))


def find_split_col(img: Image.Image) -> int:
    """Encuentra la columna más blanca en el tercio central para dividir la imagen."""
    rgb = img.convert("RGB")
    w, h = rgb.size
    pixels = rgb.load()

    mid_start = w // 3
    mid_end = 2 * w // 3

    best_col = w // 2
    best_score = -1

    for x in range(mid_start, mid_end):
        # Promedio de "blancura" (mínimo de R,G,B en cada pixel de esa columna)
        score = sum(min(pixels[x, y]) for y in range(h)) / h
        if score > best_score:
            best_score = score
            best_col = x

    return best_col


# ── Pose 1: pulgar arriba ─────────────────────────────────
print("Procesando pose 1 (pulgar arriba)…")
img1 = Image.open(IMG1)
print(f"  Tamaño original: {img1.size}")
result1 = autocrop(remove_bg(img1))
result1.save(OUT_DIR + "aguila-bienvenida.png", "PNG")
print(f"  Guardado: aguila-bienvenida.png  {result1.size}")

# ── Poses 2 y 3: cámara y mapa (imagen combinada) ────────
print("\nProcesando imagen combinada (cámara + mapa)…")
img2 = Image.open(IMG2)
w2, h2 = img2.size
print(f"  Tamaño original: {img2.size}")

split = find_split_col(img2)
print(f"  División detectada en columna: {split}")

left  = img2.crop((0,     0, split, h2))
right = img2.crop((split, 0, w2,   h2))

print("  Procesando pose 2 (cámara)…")
result2 = autocrop(remove_bg(left))
result2.save(OUT_DIR + "aguila-foto.png", "PNG")
print(f"  Guardado: aguila-foto.png  {result2.size}")

print("  Procesando pose 3 (mapa)…")
result3 = autocrop(remove_bg(right))
result3.save(OUT_DIR + "aguila-mapa.png", "PNG")
print(f"  Guardado: aguila-mapa.png  {result3.size}")

print("\n¡Listo! 3 PNGs con fondo transparente generados.")
