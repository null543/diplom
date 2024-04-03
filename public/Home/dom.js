const clean = DOMPurify.sanitize(unsafeHtml);
document.body.innerHTML = clean;
