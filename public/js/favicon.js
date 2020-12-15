/** 网站图标 */
const ChangeFavicon = (link) => {
  let $favicon = document.querySelector('link[rel="icon"]');
  if ($favicon !== null) {
    $favicon.href = link;
    // Otherwise, create a new element and append it to <head>.
  } else {
    $favicon = document.createElement("link");
    $favicon.rel = "icon";
    $favicon.href = link;
    document.head.appendChild($favicon);
  }
};
ChangeFavicon("/public/images/favicon.png");
