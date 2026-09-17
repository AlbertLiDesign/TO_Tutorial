// Panel navigation changes only presentation; form values and runs remain intact.
export function showPane(name) {
  document.body.dataset.pane = name;
  document.querySelectorAll('.mobile-nav button').forEach(button => {
    const selected = button.dataset.pane === name;
    button.classList.toggle('selected', selected);
    button.setAttribute('aria-pressed', selected);
  });
}
function showPanel(id) {
  document.querySelectorAll('.parameter-panel').forEach(panel => panel.hidden = panel.id !== id);
  document.querySelectorAll('[data-panel]').forEach(button => {
    const selected = button.dataset.panel === id;
    button.classList.toggle('selected', selected);
    button.setAttribute('aria-pressed', selected);
  });
}
document.querySelectorAll('.mobile-nav button').forEach(button => button.onclick = () => showPane(button.dataset.pane));
document.querySelectorAll('[data-panel]').forEach(button => button.onclick = () => showPanel(button.dataset.panel));
document.querySelectorAll('.result-nav button').forEach(button => button.onclick = () => {
  document.body.dataset.result = button.dataset.result;
  document.querySelectorAll('.result-nav button').forEach(other => {
    const selected = button === other;
    other.classList.toggle('selected', selected);
    other.setAttribute('aria-pressed', selected);
  });
});
// Make invalid inputs visible before the browser focuses them, including on mobile.
document.querySelector('#parameters').addEventListener('invalid', event => {
  const panel = event.target.closest('.parameter-panel');
  if (panel) showPanel(panel.id);
  showPane('parameters');
}, true);
const help = document.querySelector('#reading-dialog');
document.querySelector('#reading-help').onclick = () => help.showModal();
