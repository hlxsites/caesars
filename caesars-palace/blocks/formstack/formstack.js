let formstackTmp = '';

function loadScript(url) {
  const formstack = document.createElement('formstack');
  const script = document.createElement('script');
  script.src = url;
  const noscript = document.createElement('noscript');
  const noscriptAnchor = document.createElement('a');
  noscriptAnchor.href = url;
  noscriptAnchor.title = 'Online form';
  formstack.append(script);
  formstack.append(noscript);
  window.formStackContent = {};
  return formstack;
}

// Unfortunately, we have to override document.write calls from the formstack code
// because we cannot move away from it and there are no other better options yet.
// eslint-disable-next-line func-names
document.write = function (s) {
  formstackTmp = formstackTmp.concat(s);
  window.formStackContent = {
    value: formstackTmp,
  };
};

export default function decorate(block) {
  const formstackLink = block.querySelector('a');
  if (formstackLink && formstackLink.href) {
    const formstackUrl = formstackLink.href;
    block.innerHTML = '';
    const form = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          block.append(loadScript(formstackUrl));
          // Now delay for a few seconds and then set the formstack div innerHTML
          // to whatever is saved under window.formStackContent.value
          window.setTimeout(() => {
            const saveToDom = document.createElement('script');
            saveToDom.type = 'text/javascript';
            const saveToDomScript = 'const formstackDiv = document.querySelector(\'formstack\'); formstackDiv.innerHTML = window.formStackContent.value;';
            saveToDom.append(saveToDomScript);
            document.head.appendChild(saveToDom);
          }, 3000);
        }
      });
    });
    form.observe(block);
  } else {
    block.remove();
  }
}
