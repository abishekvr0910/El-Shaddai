import re

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# 1. Add CSS
css_to_add = """
    /* ==========================================================================
       ADDED: MOTION & HIERARCHY (LOADER + FEEDBACK)
       ========================================================================== */
    .app-loader {
      position: fixed;
      inset: 0;
      z-index: 99999;
      background: var(--coffee-bg);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      transition: opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), visibility 0.6s;
      will-change: opacity;
    }
    .app-loader.is-hidden {
      opacity: 0;
      visibility: hidden;
    }
    .app-loader-spinner {
      width: 48px;
      height: 48px;
      border: 3px solid var(--border-coffee);
      border-top-color: var(--accent-crema);
      border-radius: 50%;
      animation: spin 0.8s cubic-bezier(0.6, 0.2, 0.4, 0.8) infinite;
    }
    @keyframes spin {
      100% { transform: rotate(360deg); }
    }
    .app-loader-brand {
      margin-top: 24px;
      font-family: var(--font-headline, 'Playfair Display', serif);
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--text-froth);
      letter-spacing: 0.05em;
      opacity: 0;
      animation: pulseBrand 2s ease-in-out infinite alternate;
    }
    @keyframes pulseBrand {
      0% { opacity: 0.5; transform: translateY(4px); }
      100% { opacity: 1; transform: translateY(0); }
    }

    /* Better button feedback */
    button:active, a.magnetic-btn:active, .drink-order-link:active {
      transform: scale(0.96) !important;
      transition: transform 0.1s cubic-bezier(0.16, 1, 0.3, 1) !important;
    }

    /* Smoother image arrival */
    .card-media-img {
      opacity: 0;
      transform: scale(1.05);
      transition: opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1) !important;
    }
    .card-media-img.is-loaded {
      opacity: 1;
      transform: scale(1);
    }
    /* Hero coordinated entrance */
    .hero-element {
      opacity: 0;
      transform: translateY(20px);
      transition: opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .hero-ready .hero-element {
      opacity: 1;
      transform: translateY(0);
    }
    .hero-element:nth-child(1) { transition-delay: 0.1s; }
    .hero-element:nth-child(2) { transition-delay: 0.2s; }
    .hero-element:nth-child(3) { transition-delay: 0.3s; }
    .hero-element:nth-child(4) { transition-delay: 0.4s; }
    .hero-element:nth-child(5) { transition-delay: 0.5s; }
"""

# Insert CSS right before </style>
html = html.replace('</style>', css_to_add + '\n  </style>')

# 2. Add Loader Overlay right after <body...>
loader_html = """
  <div class="app-loader" id="app-loader">
    <div class="app-loader-spinner"></div>
    <div class="app-loader-brand">El Shaddai</div>
  </div>
"""
# Find body tag ending
body_match = re.search(r'<body[^>]*>', html)
if body_match:
    body_str = body_match.group(0)
    html = html.replace(body_str, body_str + loader_html)

# 3. Add script to handle loader & image loading
js_to_add = """
    // --- Added: Motion & Loading Logic ---
    window.addEventListener('load', () => {
      // 1. Hide loader
      const loader = document.getElementById('app-loader');
      if(loader) {
        // slightly delay to ensure visual smoothness
        setTimeout(() => {
          loader.classList.add('is-hidden');
          // 2. Trigger hero staggered entrance
          document.body.classList.add('hero-ready');
        }, 150);
      } else {
        document.body.classList.add('hero-ready');
      }
    });

    // 3. Image smooth arrival
    document.addEventListener("DOMContentLoaded", () => {
      const images = document.querySelectorAll('.card-media-img, img');
      images.forEach(img => {
        if (img.complete) {
          img.classList.add('is-loaded');
        } else {
          img.addEventListener('load', () => img.classList.add('is-loaded'));
        }
      });
      
      // 4. Wrap hero children to give them .hero-element class for staggered entry
      const heroContent = document.querySelector('#home .max-w-3xl');
      if (heroContent) {
         Array.from(heroContent.children).forEach(child => {
            child.classList.add('hero-element');
         });
      }
    });
"""

# Find <script> at the end of body or just before </body>
html = html.replace('</body>', '<script>\n' + js_to_add + '\n</script>\n</body>')

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)
print("Done")
