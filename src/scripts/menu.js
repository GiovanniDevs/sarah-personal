/* The only JavaScript on the site.

   All the state is one attribute: aria-expanded on the toggle button. That is what
   a screen reader announces as collapsed or expanded, and it is also what base.css
   keys the panel off, so there is no second class or flag that could fall out of
   step with what is announced. Everything below just flips it.

   Loaded with defer, so the header is parsed by the time this runs — no
   DOMContentLoaded wrapper needed.

   Note what is absent. The panel sits in the page flow and pushes content down
   rather than covering it, so there is no background to scroll-lock, nothing
   underneath to trap focus inside, and no overlay to dismiss. That is most of the
   reason this file is twelve lines rather than forty. */

const toggle = document.querySelector(".menu-toggle");

const isOpen = () => toggle.getAttribute("aria-expanded") === "true";
const setOpen = (open) => toggle.setAttribute("aria-expanded", String(open));

/* A <button> gives us click, Enter and Space from one listener. */
toggle.addEventListener("click", () => setOpen(!isOpen()));

/* Escape is the one keyboard behaviour the button does not give us for free.
   Focus returns to the toggle, because it would otherwise be stranded on a link
   that has just been hidden. */
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && isOpen()) {
    setOpen(false);
    toggle.focus();
  }
});
