const menus = {
  coffee: [
    ["Traditional Madras Kaapi", "Rich, frothy South Indian filter coffee with a classic coffee-and-chicory blend.", "THE HOUSE RITUAL"],
    ["Mysore Royal Strong Kaapi", "A deeper, bolder decoction for those who like their coffee with a little more character.", "BOLD & FULL-BODIED"],
    ["Iced Kaapi", "South Indian filter coffee, milk and ice. All the character, a cooler kind of comfort.", "A COOLER CLASSIC"]
  ],
  chai: [
    ["Mumbai Masala Chai", "Black tea simmered with ginger, cardamom, cloves and cinnamon.", "WARMING & AROMATIC"],
    ["Kolkata Adrak Chai", "A bold black tea with the bright, warming character of fresh ginger.", "FOR GINGER LOVERS"],
    ["Saffron Cardamom Chai", "Fragrant cardamom and saffron meet a smooth, creamy cup of chai.", "SOFTLY SPICED"],
    ["Iced Mango Chai", "A fruity twist on spiced tea, with mango and a refreshing finish.", "SOMETHING DIFFERENT"]
  ],
  snacks: [
    ["Samosas", "A savoury companion to your afternoon chai. Ask the café about today’s filling.", "A LITTLE SAVOURY COMFORT"],
    ["Banana Chips", "A crisp, simple snack to share over a cup and a conversation.", "CRUNCH & COMPANY"]
  ]
};
const list = document.querySelector("#menu-items");
function showMenu(category) {
  list.replaceChildren(...menus[category].map((item, i) => {
    const article = document.createElement("article");
    article.className = "menu-item";
    const top = document.createElement("div");
    top.className = "item-top";
    const title = document.createElement("h3");
    title.textContent = item[0];
    const number = document.createElement("span");
    number.className = "item-number";
    number.textContent = `0${i + 1}`;
    number.setAttribute("aria-hidden", "true");
    top.append(title, number);
    const description = document.createElement("p");
    description.textContent = item[1];
    const label = document.createElement("small");
    label.textContent = item[2];
    article.append(top, description, label);
    return article;
  }));
}
showMenu("coffee");
document.querySelectorAll("[data-filter]").forEach(button => {
  button.addEventListener("click", () => {
    document.querySelectorAll("[data-filter]").forEach(other => {
      other.classList.toggle("active", other === button);
      other.setAttribute("aria-pressed", String(other === button));
    });
    showMenu(button.dataset.filter);
  });
});
const root = document.documentElement;
const themeButton = document.querySelector("#theme");
function setTheme(theme) {
  root.dataset.theme = theme;
  themeButton.setAttribute("aria-label", `Switch to ${theme === "dark" ? "light" : "dark"} theme`);
  themeButton.title = themeButton.getAttribute("aria-label");
}
setTheme(matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
themeButton.addEventListener("click", () => setTheme(root.dataset.theme === "dark" ? "light" : "dark"));
const navToggle = document.querySelector("#nav-toggle");
const navigation = document.querySelector("#navigation");
function closeNav() {
  navigation.classList.remove("open");
  navToggle.setAttribute("aria-expanded", "false");
  navToggle.setAttribute("aria-label", "Open navigation");
}
navToggle.addEventListener("click", () => {
  const open = navigation.classList.toggle("open");
  navToggle.setAttribute("aria-expanded", String(open));
  navToggle.setAttribute("aria-label", `${open ? "Close" : "Open"} navigation`);
  console.log("menu")
});
navigation.querySelectorAll("a").forEach(a => a.addEventListener("click", closeNav));
document.addEventListener("keydown", event => { if (event.key === "Escape") closeNav(); });
matchMedia("(min-width: 761px)").addEventListener("change", closeNav);
const dialog = document.querySelector("#print-guide");
document.querySelector("#guide-open").addEventListener("click", () => dialog.showModal());
document.querySelector("#guide-close").addEventListener("click", () => dialog.close());
dialog.addEventListener("click", event => {
  const rect = dialog.getBoundingClientRect();
  if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
});
document.querySelector("#year").textContent = new Date().getFullYear();
